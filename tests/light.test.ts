import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { LIGHT_ROUNDS, lightFlag, lightTier } from '../src/data/minigames/light';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { Block, Cmd, Cond, LightRound, MapObject } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { lightOf } from '../src/game/light';
import { portalGate } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';
import { LightEnv, runLight } from '../src/minigames/light/lightEnv';
import { MINIGAMES } from '../src/minigames/registry';
import { countBlocks, hasIf, run } from '../src/missions/core/interpreter';
import { CMD_LABEL, COND_LABEL, cmdIcon } from '../src/ui/labels';

const c = (cmd: Cmd): Block => ({ t: 'cmd', cmd });
const rep = (times: number, ...body: Block[]): Block => ({ t: 'repeat', times, body });
const when = (cond: Cond, yes: Block[], no: Block[] = []): Block => ({ t: 'if', cond, yes, no });
const ON = c('lightOn');
const F = c('forward');
const NR = c('nextRow');
const round = (id: string) => LIGHT_ROUNDS.find((r) => r.id === id)!;

/** 판마다 별 3개짜리 풀이(블록 수 = optimal) */
const SOLUTIONS: Record<string, Block[]> = {
  r1: [ON, F, F, ON],
  r2: [F, ON, NR, ON, F, ON, F, ON],
  r3: [rep(3, ON, F, F)],
  r4: [rep(3, rep(4, ON, F), NR)],
  r5: [rep(6, when('codeOne', [ON]), F)],
  r6: [rep(5, rep(5, when('codeOne', [ON]), F), NR)],
};

/** 반복·만약 없이 늘어놓는 가장 짧은 프로그램의 블록 수(1마다 켜기, 마지막 1까지 앞으로, 1이 남은 줄까지 다음 줄) */
function plainLength(picture: readonly string[]): number {
  let n = 0;
  let lastRow = -1;
  picture.forEach((row, y) => {
    const last = row.lastIndexOf('1');
    if (last < 0) return;
    n += [...row].filter((ch) => ch === '1').length + last;
    lastRow = y;
  });
  return n + Math.max(0, lastRow);
}

describe('전구판(LightEnv)', () => {
  it('켜기는 붓 아래 전구를 켜고, 1을 모두 켜면 성공해요', () => {
    const env = new LightEnv(['101']);
    const res = run(SOLUTIONS.r1, env);
    expect(env.outcome(res.truncated)).toBe('success');
    expect(env.frames.map((f) => [f.event, f.x, f.y])).toEqual([
      ['light', 0, 0],
      ['move', 1, 0],
      ['move', 2, 0],
      ['light', 2, 0],
    ]);
    expect(env.lit).toEqual([[true, false, true]]);
  });

  it('0인 전구를 켜면 그 자리에서 멈춰요', () => {
    const env = new LightEnv(['101']);
    run([F, ON, F, ON], env);
    expect(env.outcome(false)).toBe('wrongLight');
    expect(env.frames).toHaveLength(2);
    expect(env.frames[1]).toMatchObject({ event: 'wrongLight', x: 1, y: 0 });
    expect(env.lit[0][1]).toBe(false);
  });

  it('줄 끝까지는 갈 수 있고, 더 가면 판 밖이에요. 줄 끝에는 전구가 없어요', () => {
    const toEnd = new LightEnv(['101']);
    run([F, F, F], toEnd);
    expect([toEnd.x, toEnd.outcome(false)]).toEqual([3, 'missing']);
    const out = new LightEnv(['101']);
    run([F, F, F, F], out);
    expect(out.outcome(false)).toBe('offBoard');
    expect(out.frames.at(-1)).toMatchObject({ event: 'offBoard', toward: 'right', x: 3 });
    const noBulb = new LightEnv(['101']);
    run([F, F, F, ON], noBulb);
    expect(noBulb.outcome(false)).toBe('noBulb');
  });

  it('다음 줄은 아래 줄 맨 앞으로 가고, 판 아래에서는 더 갈 곳이 없어요', () => {
    const env = new LightEnv(['010', '111']);
    run([F, F, NR], env);
    expect([env.x, env.y]).toEqual([0, 1]);
    const below = new LightEnv(['010', '111']);
    run([NR, NR], below);
    expect([below.y, below.halted()]).toEqual([2, false]);
    const down = new LightEnv(['010', '111']);
    run([NR, NR, NR], down);
    expect(down.outcome(false)).toBe('offBoard');
    expect(down.frames.at(-1)).toMatchObject({ toward: 'down' });
    const right = new LightEnv(['010', '111']);
    run([NR, NR, F], right);
    expect(right.outcome(false)).toBe('offBoard');
  });

  it('켜지 않은 1이 남으면 실패하고, 조건은 붓 아래 숫자를 읽어요(전구가 없으면 아니에요)', () => {
    const env = new LightEnv(['101']);
    expect(env.test('codeOne')).toBe(true);
    run([ON], env);
    expect([env.outcome(false), env.missing()]).toEqual(['missing', 1]);
    env.exec('forward', '1');
    expect(env.test('codeOne')).toBe(false);
    env.exec('forward', '2');
    env.exec('forward', '3');
    expect([env.x, env.test('codeOne'), env.test('boxHeart')]).toEqual([3, false, false]);
  });

  it('여러 그림 판은 같은 프로그램으로 모든 그림을 맞게 켜야 해요', () => {
    const r5 = round('r5');
    // 첫 그림의 순서만 외운 프로그램은 두 번째 그림에서 틀려요.
    const memorized = [...r5.pictures[0][0]].flatMap((ch, i) => [...(ch === '1' ? [ON] : []), ...(i < 5 ? [F] : [])]);
    const res = runLight(r5, memorized);
    expect(res.pictures[0].outcome).toBe('success');
    expect(res.failedPicture).toBe(1);
    expect(hasIf(memorized)).toBe(false);
    expect(hasIf(SOLUTIONS.r5)).toBe(true);
    expect(runLight(r5, SOLUTIONS.r5)).toMatchObject({ outcome: 'success', failedPicture: -1 });
  });

  it('같은 프로그램은 언제나 같은 결과예요(운이 없어요)', () => {
    for (const r of LIGHT_ROUNDS) expect(runLight(r, SOLUTIONS[r.id]), r.id).toEqual(runLight(r, SOLUTIONS[r.id]));
  });
});

describe('불빛 그림 판 데이터', () => {
  it('별 3개 풀이가 있고(블록 수 = optimal), 그 판의 블록만 써요', () => {
    for (const r of LIGHT_ROUNDS) {
      const program = SOLUTIONS[r.id];
      expect(runLight(r, program).outcome, r.id).toBe('success');
      expect(countBlocks(program), r.id).toBe(r.optimal);
      const used = JSON.stringify(program);
      for (const cmd of Object.keys(CMD_LABEL) as Cmd[]) if (used.includes(`"${cmd}"`)) expect(r.palette, `${r.id}: ${cmd}`).toContain(cmd);
      for (const cond of Object.keys(COND_LABEL) as Cond[]) if (used.includes(`"${cond}"`)) expect(r.allowIf, `${r.id}: ${cond}`).toContain(cond);
      if (used.includes('"repeat"')) expect(r.allowRepeat, r.id).toBe(true);
    }
  });

  it('그림은 0·1 네모이고, 한 판의 그림은 크기가 같아요(붓 자리와 반복 횟수 하나로 풀어요)', () => {
    for (const r of LIGHT_ROUNDS) {
      const w = r.pictures[0][0].length;
      const hgt = r.pictures[0].length;
      for (const p of r.pictures) {
        expect([p.length, ...p.map((row) => row.length)], r.id).toEqual([hgt, ...p.map(() => w)]);
        expect(p.every((row) => /^[01]+$/.test(row)), r.id).toBe(true);
        expect(p.join('').includes('1'), r.id).toBe(true);
      }
      expect(w * hgt, r.id).toBeLessThanOrEqual(25);
    }
  });

  it('순서 판은 늘어놓은 블록 수가 별 3개 기준이고, 반복 판은 반복을 써야 별 3개예요(학습 우회 방지)', () => {
    for (const r of LIGHT_ROUNDS.filter((x) => x.pictures.length === 1)) {
      const plain = plainLength(r.pictures[0]);
      if (r.allowRepeat) expect(plain, r.id).toBeGreaterThan(r.optimal);
      else expect(plain, r.id).toBe(r.optimal);
    }
    // 4판: 반복 하나씩만 쓰면(줄마다 따로) 블록이 늘어요. 반복 안에 반복이 가장 짧아요.
    const r4 = round('r4');
    const flat = [rep(4, ON, F), NR, rep(4, ON, F), NR, rep(4, ON, F)];
    expect(runLight(r4, flat).outcome).toBe('success');
    expect(countBlocks(flat)).toBeGreaterThan(r4.optimal + 2);
  });

  it('만약 판은 순서만으로는 풀 수 없어요(그림마다 같은 자리에 다른 숫자가 있어요)', () => {
    for (const r of LIGHT_ROUNDS.filter((x) => x.pictures.length > 1)) {
      expect(r.allowIf, r.id).toContain('codeOne');
      const flat = r.pictures.map((p) => p.join(''));
      const differs = [...flat[0]].some((_, i) => new Set(flat.map((f) => f[i])).size > 1);
      expect(differs, r.id).toBe(true);
    }
  });

  it('6판: 같은 프로그램이 숫자만 다른 그림 세 장을 모두 켜요', () => {
    const r6 = round('r6');
    const res = runLight(r6, SOLUTIONS.r6);
    expect(res.outcome).toBe('success');
    res.pictures.forEach((p, i) => expect(p.lit.map((row) => row.map((on) => (on ? '1' : '0')).join(''))).toEqual(r6.pictures[i]));
    expect(new Set(r6.pictures.map((p) => p.join('/'))).size).toBe(3);
  });

  it('그림·카드·소품이 목록에 있고, 켜진 액자만 빛나요', () => {
    for (const key of ['icon-bulb-on', 'icon-bulb-off', 'icon-light-brush', cmdIcon('lightOn'), cmdIcon('nextRow'), 'prop-lightboard', 'prop-light-shop', 'prop-lamp-shelf']) {
      expect(ASSET_BY_KEY.has(key), key).toBe(true);
    }
    expect(ASSET_BY_KEY.get('prop-light-frame')?.frames).toBe(LIGHT_ROUNDS.length + 1);
    expect(lightOf('prop-light-frame', 0)).toBeNull();
    for (let f = 1; f <= LIGHT_ROUNDS.length; f++) expect(lightOf('prop-light-frame', f), String(f)).not.toBeNull();
    expect([CMD_LABEL.lightOn, CMD_LABEL.nextRow, COND_LABEL.codeOne]).toEqual(['켜기', '다음 줄', '숫자가 1이라면']);
  });

  it('블록은 배운 차례로 늘어요: 켜기 → 다음 줄 → 반복(2장) → 만약으로 숫자 읽기(4장) → 숫자 그림(5장)', () => {
    expect(LIGHT_ROUNDS.map(lightTier)).toEqual([
      '켜기 + 앞으로',
      '켜기 + 다음 줄',
      '켜기 + 앞으로 + 반복',
      '켜기 + 다음 줄 + 반복',
      '켜기 + 앞으로 + 반복 + 만약',
      '켜기 + 다음 줄 + 반복 + 만약',
    ]);
    for (const r of LIGHT_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      if (r.unlock.part) expect(ROBI_PARTS[r.unlock.part], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    // 5판은 4장 '등대 신호'(켜진 등불 = 1), 6판은 5장 '픽셀 돋보기'(1인 칸을 켜서 그림) 뒤에 열려요.
    expect(JSON.stringify(getMission(round('r5').unlock!.mission)?.mission)).toContain('"mode":"binary"');
    expect(JSON.stringify(getMission(round('r6').unlock!.mission)?.mission)).toContain('"mode":"pixels"');
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요', () => {
    for (const t of LIGHT_ROUNDS.flatMap((r: LightRound) => [r.intro, r.hint, r.lockedText ?? '', r.title])) {
      const rows = t.split('\n');
      expect(rows.length, t).toBeLessThanOrEqual(2);
      for (const row of rows) expect(row.length, row).toBeLessThanOrEqual(22);
      expect(/죽|처치|피를|코인|동전을 넣/.test(t), t).toBe(false);
    }
  });
});

const world = (flags: string[] = []): WorldQuery => {
  const f = new Set(flags);
  return { hasFlag: (n) => f.has(n), check: (c) => !c || ((!c.flag || f.has(c.flag)) && (!c.notFlag || !f.has(c.notFlag)) && !c.mission && !c.notMission) };
};

describe('마을 불빛 가게', () => {
  type Portal = Extract<MapObject, { type: 'portal' }>;
  const door = MAPS.village.objects.find((o): o is Portal => o.type === 'portal' && o.id === 'to-lightshop')!;
  const room = MAPS.lightshop;

  it('처음부터 열려 있어요(1장을 건너뛴 5~6학년도 들어가요)', () => {
    const s = new GameState(freshSave('별빛'));
    expect(portalGate(s, null, 'village', door)).toEqual({ open: true });
    expect(door.open).toBeUndefined();
    expect(door.sprite).toBe('prop-light-shop');
  });

  it('들어가면 가게 안 빈 칸에 서고, 문 매트로 나오면 가게 문 앞이에요', () => {
    expect(door.to.map).toBe('lightshop');
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    const exit = room.objects.find((o): o is Portal => o.type === 'portal')!;
    expect(exit.to.map).toBe('village');
    for (const flags of [[], ['village-restore-1']]) {
      expect(makePassable(MAPS.village, buildCells(MAPS.village), world(flags))(exit.to.at.x, exit.to.at.y), flags.join()).toBe(true);
    }
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('전구판 기계와 나가는 문에 갈 수 있어요(액자가 모두 켜져도)', () => {
    const all = LIGHT_ROUNDS.map((r) => lightFlag(r.id));
    for (const flags of [[], all]) {
      const q = world(flags);
      const pass = makePassable(room, buildCells(room), q);
      for (const o of room.objects.filter((x) => x.type === 'game' || x.type === 'portal')) {
        const solid = objectSolid(room.id, o, q);
        const goal = solid
          ? (x: number, y: number) => Math.max(Math.abs(x - o.at.x), Math.abs(y - o.at.y)) <= 1 && !(x === o.at.x && y === o.at.y)
          : (x: number, y: number) => x === o.at.x && y === o.at.y;
        expect(findPath((x, y) => pass(x, y) || (!solid && x === o.at.x && y === o.at.y), room.spawn, goal, o.at), `${o.id} ${flags.length}`).not.toBeNull();
      }
    }
  });

  it('놀이 기계는 등록된 미니게임을 열고, 판마다 액자 하나가 꺼졌다가 그 판의 그림으로 켜져요', () => {
    const machine = room.objects.find((o) => o.type === 'game');
    expect(machine?.type === 'game' && MINIGAMES[machine.game]?.title).toBe('코딩 불빛 그림');
    LIGHT_ROUNDS.forEach((r, i) => {
      const off = room.objects.find((o) => o.id === `frame-${r.id}-off`);
      const on = room.objects.find((o) => o.id === `frame-${r.id}-on`);
      expect(off?.when, r.id).toEqual({ notFlag: lightFlag(r.id) });
      expect(on?.when, r.id).toEqual({ flag: lightFlag(r.id) });
      expect(off?.type === 'prop' && off.frame, r.id).toBe(0);
      expect(on?.type === 'prop' && on.frame, r.id).toBe(i + 1);
      expect(off?.at, r.id).toEqual(on?.at);
    });
  });
});
