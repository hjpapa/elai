import { describe, expect, it } from 'vitest';
import { allMissions, getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { NPCS } from '../src/data/npcs';
import { xpForLevel } from '../src/data/rpg/levels';
import { MOBS } from '../src/data/rpg/mobs';
import type { MapDef, MapObject, Point } from '../src/data/schema';
import { baseWalkable, buildCells, findPath, makePassable, objFlag, type WorldQuery } from '../src/game/iso/mapRuntime';

/** 플래그·미션 상태를 흉내 내는 간단한 질문기 */
function world(flags: string[] = [], missions: string[] = []): WorldQuery {
  const f = new Set(flags);
  const m = new Set(missions);
  return {
    hasFlag: (n) => f.has(n),
    check: (c) =>
      !c ||
      ((!c.flag || f.has(c.flag)) &&
        (!c.notFlag || !f.has(c.notFlag)) &&
        (!c.mission || m.has(c.mission)) &&
        (!c.notMission || !m.has(c.notMission))),
  };
}

function canReach(def: MapDef, q: WorldQuery, from: Point, o: MapObject): boolean {
  const cells = buildCells(def);
  // 몹은 돌아다니고 싸워서 지나갈 수 있으니 막지 않는 것으로 봐요.
  const pass = makePassable(def, cells, q, (x) => x.type === 'mob');
  const solidTarget = ['npc', 'chest', 'door', 'prop'].includes(o.type);
  const goal = solidTarget
    ? (x: number, y: number) => Math.abs(x - o.at.x) <= 1 && Math.abs(y - o.at.y) <= 1 && !(x === o.at.x && y === o.at.y)
    : (x: number, y: number) => x === o.at.x && y === o.at.y;
  const passOrGoal = (x: number, y: number) => pass(x, y) || (!solidTarget && x === o.at.x && y === o.at.y);
  return findPath(passOrGoal, from, goal, o.at, 20000) !== null;
}

describe('맵 데이터', () => {
  it('모든 줄의 길이가 같고, 모든 글자의 뜻이 있어요', () => {
    for (const def of Object.values(MAPS)) {
      const w = def.rows[0].length;
      for (const r of def.rows) {
        expect(r.length, def.id).toBe(w);
        for (const ch of r) expect(ch in def.legend || ch in (def.glyphs ?? {}), `${def.id}: '${ch}'`).toBe(true);
      }
    }
  });

  it('오브젝트는 맵 안, 걸을 수 있는 칸에 있고 참조가 올바라요', () => {
    for (const def of Object.values(MAPS)) {
      const cells = buildCells(def);
      const ids = new Set<string>();
      for (const o of def.objects) {
        expect(ids.has(o.id), `${def.id}: 중복 id ${o.id}`).toBe(false);
        ids.add(o.id);
        if (o.type !== 'prop') expect(baseWalkable(cells, o.at.x, o.at.y), `${def.id}/${o.id} @${o.at.x},${o.at.y}`).toBe(true);
        if (o.type === 'npc') {
          expect(NPCS[o.npc], o.id).toBeDefined();
          for (const m of o.missions ?? []) expect(getMission(m), `${o.id}: ${m}`).toBeDefined();
        }
        if (o.type === 'mob') expect(MOBS[o.mob], o.id).toBeDefined();
        if (o.type === 'portal') expect(MAPS[o.to.map], o.id).toBeDefined();
      }
    }
  });
});

describe('갈 수 있는 길', () => {
  it('마을: 처음부터 NPC·상자·숲 입구에 갈 수 있어요', () => {
    const def = MAPS.village;
    const q = world();
    for (const o of def.objects.filter((o) => ['npc', 'chest', 'portal'].includes(o.type) && q.check(o.when) && o.id !== 'to-ch2')) {
      expect(canReach(def, q, def.spawn, o), o.id).toBe(true);
    }
  });

  it('숲: 다리를 고치기 전에는 미로 입구에 못 가고, 고치면 갈 수 있어요', () => {
    const def = MAPS.forest;
    const gate = def.objects.find((o) => o.id === 'to-maze')!;
    expect(canReach(def, world(), def.spawn, gate)).toBe(false);
    expect(canReach(def, world([], ['ch1-p3-m2', 'ch1-p2-m2']), def.spawn, gate)).toBe(true);
    for (const id of ['ranger-a', 'chef', 'chest-forest']) {
      expect(canReach(def, world(), def.spawn, def.objects.find((o) => o.id === id)!), id).toBe(true);
    }
  });

  it('미로: 문을 열지 않아도 상자 3개에 갈 수 있고, 수호자 방은 문으로만 들어가요', () => {
    const def = MAPS.maze;
    for (const id of ['chest-key', 'chest-hat', 'chest-jelly']) {
      expect(canReach(def, world(), def.spawn, def.objects.find((o) => o.id === id)!), id).toBe(true);
    }
    const guardian = def.objects.find((o) => o.id === 'guardian')!;
    expect(canReach(def, world(), def.spawn, guardian)).toBe(false);
    expect(canReach(def, world([objFlag.door('maze', 'vine-door')]), def.spawn, guardian)).toBe(true);
    expect(def.objects.filter((o) => o.type === 'sign').length).toBeGreaterThanOrEqual(3);
  });
});

describe('성장 곡선', () => {
  it('본편 미션·숲과 미로의 몹·상자만으로 보스 전에 권장 레벨(4)에 닿아요', () => {
    const missionIds = ['ch0-m1', 'ch0-m2', 'ch0-m3', 'ch0-m4', 'ch0-m5', 'ch1-p1-m1', 'ch1-p1-m2', 'ch1-p1-m3', 'ch1-p2-m1', 'ch1-p2-m2', 'ch1-p3-m1', 'ch1-p3-m2', 'ch1-p3-m3'];
    let xp = missionIds.reduce((n, id) => n + (getMission(id)?.mission.reward?.xp ?? 0), 0);
    for (const def of [MAPS.forest, MAPS.maze]) {
      for (const o of def.objects) {
        if (o.type === 'mob') xp += MOBS[o.mob].xp;
        if (o.type === 'chest') xp += o.reward.xp ?? 0;
      }
    }
    expect(xp).toBeGreaterThanOrEqual(xpForLevel(MOBS.forestGuardian.recommendedLevel));
  });
});


describe('2장 동굴 길과 성장', () => {
  it('동굴 입구의 NPC·상자·포털에 갈 수 있어요', () => {
    const def = MAPS.cave;
    for (const o of def.objects.filter(o => ['npc','chest','portal'].includes(o.type))) {
      expect(canReach(def, world([], ['ch2-p3-m2']), def.spawn, o), o.id).toBe(true);
    }
    const gate = def.objects.find(o => o.id === 'to-cavedeep')!;
    expect(gate.type === 'portal' && gate.open?.mission).toBe('ch2-p3-m2');
  });
  it('네 방을 지나 보스에 가고, 방을 막으면 우회할 수 없어요', () => {
    const def = MAPS.cavedeep;
    const q = world(['ch2-clear', 'batking-fixed']);
    for (const o of def.objects.filter(o => ['npc','chest','portal'].includes(o.type) && q.check(o.when))) {
      expect(canReach(def, q, def.spawn, o), o.id).toBe(true);
    }
    const boss = def.objects.find(o => o.id === 'batking-fixed')!;
    for (const x of [8, 15, 22]) {
      const cut: MapDef = { ...def, rows: def.rows.map(r => r.slice(0,x)+'R'+r.slice(x+1)) };
      expect(canReach(cut,q,cut.spawn,boss), '방 경계 '+x).toBe(false);
    }
    expect(def.fog).toBe(true);
  });
  it('0~2장 본편을 한 번씩 하면 대장 권장 레벨에 닿아요', () => {
    let xp = allMissions().filter(e => e.chapter.index <= 2 && !e.mission.id.startsWith('ch2-boss')).reduce((n,e) => n+(e.mission.reward?.xp ?? 0),0);
    for (const def of Object.values(MAPS).filter(d => ['ch0','ch1','ch2'].includes(d.chapter ?? ''))) {
      for (const o of def.objects) {
        if(o.type === 'mob') xp += MOBS[o.mob].xp;
        if(o.type === 'chest') xp += o.reward.xp ?? 0;
      }
    }
    expect(xp).toBeGreaterThanOrEqual(xpForLevel(MOBS.batKing.recommendedLevel));
  });
});
