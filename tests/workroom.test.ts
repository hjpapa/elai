import { describe, expect, it } from 'vitest';
import { DOLLS, dollFlag } from '../src/data/minigames/claw';
import { MAPS } from '../src/data/maps';
import type { MapDef, MapObject, Point } from '../src/data/schema';
import { ASSET_BY_KEY, originOf } from '../src/game/assets';
import { edgeFaces, edgeMaterial } from '../src/game/iso/edges';
import { BLOCK_TEXTURE, TILE_TEXTURE, WALKABLE, baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { guideTarget } from '../src/game/rpg/guide';
import { GameState, freshSave } from '../src/game/rpg/state';
import { MINIGAMES } from '../src/minigames/registry';

type Portal = Extract<MapObject, { type: 'portal' }>;

const world = (flags: string[] = []): WorldQuery => {
  const f = new Set(flags);
  return { hasFlag: (n) => f.has(n), check: (c) => !c || ((!c.flag || f.has(c.flag)) && (!c.notFlag || !f.has(c.notFlag)) && !c.mission && !c.notMission) };
};

function canReach(def: MapDef, q: WorldQuery, from: Point, o: MapObject): boolean {
  const pass = makePassable(def, buildCells(def), q);
  const solid = objectSolid(def.id, o, q);
  const goal = solid
    ? (x: number, y: number) => Math.max(Math.abs(x - o.at.x), Math.abs(y - o.at.y)) <= 1 && !(x === o.at.x && y === o.at.y)
    : (x: number, y: number) => x === o.at.x && y === o.at.y;
  return findPath((x, y) => pass(x, y) || (!solid && x === o.at.x && y === o.at.y), from, goal, o.at) !== null;
}

const room = MAPS.workroom;
const portal = (map: string, id: string) => MAPS[map].objects.find((o): o is Portal => o.type === 'portal' && o.id === id)!;

describe('마을 공방(들어가는 건물)', () => {
  it('마을의 공방 집 칸이 문이고, 들어가면 공방 안 빈 칸에 서요', () => {
    const door = portal('village', 'to-workroom');
    expect(door.to.map).toBe('workroom');
    expect(door.sprite).toBe('prop-workshop');
    expect(door.open).toBeUndefined();
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    expect(room.objects.some((o) => o.at.x === door.to.at.x && o.at.y === door.to.at.y)).toBe(false);
  });

  it('공방 문 매트를 밟으면 마을의 공방 문 앞으로 나와요', () => {
    const exit = portal('workroom', 'to-village');
    expect(exit.to.map).toBe('village');
    const village = MAPS.village;
    expect(baseWalkable(buildCells(village), exit.to.at.x, exit.to.at.y)).toBe(true);
    expect(makePassable(village, buildCells(village), world())(exit.to.at.x, exit.to.at.y)).toBe(true);
    // 나온 곳은 공방 집 바로 앞(아래쪽 칸)이에요.
    const door = portal('village', 'to-workroom');
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('들어온 곳에서 인형뽑기 기계와 나가는 문에 갈 수 있어요(인형을 다 모아도)', () => {
    const all = DOLLS.map((d) => dollFlag(d.id));
    for (const flags of [[], all]) {
      for (const o of room.objects.filter((x) => x.type === 'game' || x.type === 'portal')) {
        expect(canReach(room, world(flags), room.spawn, o), `${o.id} ${flags.length}`).toBe(true);
      }
    }
  });

  it('놀이 기계는 등록된 미니게임을 열고, 길을 막아요', () => {
    const machines = room.objects.filter((o): o is Extract<MapObject, { type: 'game' }> => o.type === 'game');
    expect(machines).toHaveLength(1);
    for (const m of machines) {
      expect(MINIGAMES[m.game], m.id).toBeDefined();
      expect(ASSET_BY_KEY.has(m.sprite), m.sprite).toBe(true);
      expect(objectSolid(room.id, m, world()), m.id).toBe(true);
    }
  });

  it('뽑은 인형만 방석에 앉아요', () => {
    for (const d of DOLLS) {
      const seat = room.objects.find((o) => o.type === 'prop' && o.sprite === d.sprite);
      expect(seat?.when, d.id).toEqual({ flag: dollFlag(d.id) });
      const q = world([dollFlag(d.id)]);
      expect(q.check(seat?.when)).toBe(true);
      expect(world().check(seat?.when)).toBe(false);
      // 인형 아래에는 늘 방석이 있어요(먼저 그려져서 인형이 위에 앉아요).
      const cushion = room.objects.findIndex((o) => o.type === 'prop' && o.sprite === 'prop-cushion' && o.at.x === seat!.at.x && o.at.y === seat!.at.y);
      expect(cushion, d.id).toBeGreaterThanOrEqual(0);
      expect(cushion).toBeLessThan(room.objects.indexOf(seat!));
    }
  });

  it('뒤쪽 두 변은 높은 벽, 앞쪽은 나무 바닥 두께가 보여요', () => {
    const cells = buildCells(room);
    expect(cells[0].every((cell) => cell.kind === 'roomwall' || cell.kind === 'roomwindow')).toBe(true);
    expect(cells.every((row) => row[0].kind === 'roomwall' || row[0].kind === 'roomwindow')).toBe(true);
    for (const kind of ['room', 'rug', 'roomwall', 'roomwindow'] as const) {
      expect(TILE_TEXTURE[kind], kind).not.toBeNull();
      expect(edgeMaterial(kind), kind).toBe('wood');
    }
    expect(WALKABLE.roomwall || WALKABLE.roomwindow).toBe(false);
    for (const key of [BLOCK_TEXTURE.roomwall!, BLOCK_TEXTURE.roomwindow!]) {
      const spec = ASSET_BY_KEY.get(key)!;
      expect([spec.w, spec.h], key).toEqual([32, 56]);
      // 높은 벽도 바닥 마름모 중심(아래에서 8px 위)을 칸 가운데에 놓아요.
      expect(originOf(spec).y * spec.h, key).toBe(48);
    }
    expect(originOf(ASSET_BY_KEY.get('block-wall')!).y * 24).toBe(16);
    const faces = edgeFaces(cells);
    expect(faces.some((f) => f.side === 'left' && f.y === room.rows.length - 1)).toBe(true);
    expect(faces.some((f) => f.side === 'right' && f.x === room.rows[0].length - 1)).toBe(true);
  });

  it('공방 안에서 길 안내는 나가는 문을 가리켜요', () => {
    const state = new GameState(freshSave('별빛'));
    state.setLocation('workroom', 6, 6);
    expect(guideTarget(state, null, 'workroom')).toEqual({ at: portal('workroom', 'to-village').at, kind: 'portal', goalMap: 'village' });
  });
});
