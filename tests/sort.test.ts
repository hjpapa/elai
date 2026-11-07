import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { SORT_ROUNDS, SORT_ITEM_ICON, sortTier, stampFlag } from '../src/data/minigames/sort';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { Block, Cmd, Cond, MapObject, SortRound } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { portalGate } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';
import { MINIGAMES } from '../src/minigames/registry';
import { SortEnv, hasIf, runSort } from '../src/minigames/sort/sortEnv';
import { countBlocks, run } from '../src/missions/core/interpreter';
import { CMD_LABEL, COND_LABEL, cmdIcon } from '../src/ui/labels';

const c = (cmd: Cmd): Block => ({ t: 'cmd', cmd });
const rep = (times: number, ...body: Block[]): Block => ({ t: 'repeat', times, body });
const when = (cond: Cond, yes: Block[], no: Block[]): Block => ({ t: 'if', cond, yes, no });
const L = c('sendLeft');
const R = c('sendRight');
const round = (id: string) => SORT_ROUNDS.find((r) => r.id === id)!;

/** 판마다 별 3개짜리 풀이(블록 수 = optimal) */
const SOLUTIONS: Record<string, Block[]> = {
  r1: [L, R, L],
  r2: [R, R, L, R, L],
  r3: [rep(4, L, R)],
  r4: [rep(3, L, L, R)],
  r5: [rep(6, when('boxHeart', [L], [R]))],
  r6: [rep(6, when('itemRound', [L], [R]))],
};

describe('택배 분류 벨트(SortEnv)', () => {
  const r1 = round('r1');

  it('보내기 하나가 맨 앞 물건 하나를 바구니로 보내고, 모두 맞게 보내면 성공해요', () => {
    const env = new SortEnv(r1);
    const res = run(SOLUTIONS.r1, env);
    expect(env.outcome(res.truncated)).toBe('success');
    expect(env.frames.map((f) => [f.item, f.side, f.correct, f.left])).toEqual([
      ['heart', 'left', true, 2],
      ['star', 'right', true, 1],
      ['heart', 'left', true, 0],
    ]);
  });

  it('다른 바구니로 보내면 그 자리에서 멈춰요', () => {
    const env = new SortEnv(r1);
    run([L, L, L], env);
    expect(env.outcome(false)).toBe('wrongBin');
    expect(env.frames).toHaveLength(2);
    expect(env.frames[1]).toMatchObject({ item: 'star', side: 'left', correct: false });
  });

  it('물건이 남거나, 빈 벨트에서 보내면 실패해요', () => {
    const left = new SortEnv(r1);
    run([L, R], left);
    expect(left.outcome(false)).toBe('leftover');
    const empty = new SortEnv(r1);
    run([L, R, L, R], empty);
    expect(empty.outcome(false)).toBe('emptyBelt');
    expect(empty.frames.at(-1)).toMatchObject({ event: 'empty', left: 0 });
  });

  it('조건은 맨 앞 물건을 살펴봐요(빈 벨트면 모두 아니에요)', () => {
    const env = new SortEnv(round('r6'), 0);
    expect([env.test('itemRound'), env.test('boxHeart'), env.test('boxStar')]).toEqual([true, false, false]);
    env.exec('sendLeft', '0');
    expect([env.test('itemRound'), env.test('boxHeart')]).toEqual([false, true]);
    const done = new SortEnv(round('r1'));
    run(SOLUTIONS.r1, done);
    expect([done.test('boxHeart'), done.test('boxStar'), done.test('itemRound')]).toEqual([false, false, false]);
  });

  it('여러 줄 판은 같은 프로그램으로 모든 줄을 맞게 나눠야 해요', () => {
    const r5 = round('r5');
    // 첫 줄의 순서만 외운 프로그램은 두 번째 줄에서 틀려요.
    const memorized = r5.belts[0].map((item) => (item === 'heart' ? L : R));
    const res = runSort(r5, memorized);
    expect(res.belts[0].outcome).toBe('success');
    expect(res.failedBelt).toBe(1);
    expect(res.outcome).toBe('wrongBin');
    expect(hasIf(memorized)).toBe(false);
    expect(hasIf(SOLUTIONS.r5)).toBe(true);
    expect(runSort(r5, SOLUTIONS.r5)).toMatchObject({ outcome: 'success', failedBelt: -1 });
  });

  it('같은 프로그램은 언제나 같은 결과예요(운이 없어요)', () => {
    for (const r of SORT_ROUNDS) expect(runSort(r, SOLUTIONS[r.id]), r.id).toEqual(runSort(r, SOLUTIONS[r.id]));
  });
});

describe('택배 분류 판 데이터', () => {
  it('별 3개 풀이가 있고(블록 수 = optimal), 그 판의 블록만 써요', () => {
    for (const r of SORT_ROUNDS) {
      const program = SOLUTIONS[r.id];
      expect(runSort(r, program).outcome, r.id).toBe('success');
      expect(countBlocks(program), r.id).toBe(r.optimal);
      const used = JSON.stringify(program);
      for (const cmd of Object.keys(CMD_LABEL) as Cmd[]) if (used.includes(`"${cmd}"`)) expect(r.palette, `${r.id}: ${cmd}`).toContain(cmd);
      for (const cond of Object.keys(COND_LABEL) as Cond[]) if (used.includes(`"${cond}"`)) expect(r.allowIf, `${r.id}: ${cond}`).toContain(cond);
    }
  });

  it('순서 판은 상자 수만큼, 반복 판은 반복을 써야 별 3개예요(학습 우회 방지)', () => {
    for (const r of SORT_ROUNDS.filter((x) => x.belts.length === 1)) {
      // 반복·만약 없이 늘어놓으면 블록 수 = 상자 수예요.
      const plain = r.belts[0].length;
      if (r.allowRepeat) expect(plain, r.id).toBeGreaterThan(r.optimal);
      else expect(plain, r.id).toBe(r.optimal);
    }
  });

  it('만약 판은 순서만으로는 풀 수 없어요(줄마다 같은 차례에 다른 바구니가 필요해요)', () => {
    for (const r of SORT_ROUNDS.filter((x) => x.belts.length > 1)) {
      expect(r.allowIf?.length, r.id).toBeGreaterThan(0);
      const lengths = new Set(r.belts.map((b) => b.length));
      expect(lengths.size, `${r.id}: 줄 길이가 같아야 반복 횟수 하나로 풀어요`).toBe(1);
      const sides = r.belts.map((b) => b.map((item) => r.rule[item]));
      const differs = sides[0].some((_, i) => new Set(sides.map((s) => s[i])).size > 1);
      expect(differs, r.id).toBe(true);
    }
  });

  it('6판: 모양(둥근 물건)으로 나누면 가장 짧고, 상자 무늬로 나누면 블록이 늘어요', () => {
    const r6 = round('r6');
    const byPattern = [rep(6, when('boxHeart', [R], [when('boxStar', [R], [L])]))];
    expect(runSort(r6, byPattern).outcome).toBe('success');
    expect(countBlocks(byPattern)).toBeGreaterThan(r6.optimal);
    // 기본 조건(첫 칸)은 정답 조건이 아니어서, 무엇으로 나눌지 직접 골라요.
    expect(r6.allowIf?.[0]).not.toBe('itemRound');
  });

  it('주문 카드는 판의 모든 물건을 다루고, 물건·바구니 그림이 목록에 있어요', () => {
    for (const r of SORT_ROUNDS) {
      for (const belt of r.belts) for (const item of belt) expect(r.rule[item], `${r.id}: ${item}`).toBeDefined();
      expect(r.palette, r.id).toEqual(['sendLeft', 'sendRight']);
    }
    for (const key of [...Object.values(SORT_ITEM_ICON), 'prop-sort-basket', 'icon-stamp', cmdIcon('sendLeft'), cmdIcon('sendRight'), 'prop-sorter', 'prop-parcel-office']) {
      expect(ASSET_BY_KEY.has(key), key).toBe(true);
    }
    expect([CMD_LABEL.sendLeft, CMD_LABEL.sendRight]).toEqual(['왼쪽으로 보내기', '오른쪽으로 보내기']);
    expect([COND_LABEL.boxHeart, COND_LABEL.boxStar, COND_LABEL.itemRound]).toEqual(['하트 상자라면', '별 상자라면', '둥근 물건이라면']);
  });

  it('블록은 배운 차례로 늘어요: 보내기 → 반복(2장) → 만약(3장)', () => {
    expect(SORT_ROUNDS.map(sortTier)).toEqual(['보내기', '보내기', '보내기 + 반복', '보내기 + 반복', '보내기 + 반복 + 만약', '보내기 + 반복 + 만약']);
    for (const r of SORT_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      if (r.unlock.part) expect(ROBI_PARTS[r.unlock.part], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    // 만약 판은 3장에서 만약(조건)을 처음 배운 뒤에 열려요.
    const ifMission = getMission('ch3-p1-m1')?.mission;
    expect(ifMission?.kind === 'blockCode' ? ifMission.data?.allowIf?.length : 0).toBeGreaterThan(0);
    expect(round('r5').unlock?.mission).toBe('ch3-p1-m1');
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요', () => {
    for (const t of SORT_ROUNDS.flatMap((r: SortRound) => [r.intro, r.hint, r.lockedText ?? '', r.title])) {
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

describe('마을 택배소', () => {
  type Portal = Extract<MapObject, { type: 'portal' }>;
  const door = MAPS.village.objects.find((o): o is Portal => o.type === 'portal' && o.id === 'to-parcel')!;
  const room = MAPS.parcel;

  it('마을이 고쳐지기 전에는 닫혀 있고(낡은 모습), 1장을 끝내면 열려요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(portalGate(s, null, 'village', door)).toMatchObject({ open: false });
    expect(door.lockedText).toContain('1장');
    s.setFlag('village-restore-1');
    expect(portalGate(s, null, 'village', door)).toEqual({ open: true });
    expect(door.sprite).toBe('prop-parcel-office');
  });

  it('들어가면 택배소 안 빈 칸에 서고, 문 매트로 나오면 택배소 문 앞이에요', () => {
    expect(door.to.map).toBe('parcel');
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    const exit = room.objects.find((o): o is Portal => o.type === 'portal')!;
    expect(exit.to.map).toBe('village');
    expect(makePassable(MAPS.village, buildCells(MAPS.village), world(['village-restore-1']))(exit.to.at.x, exit.to.at.y)).toBe(true);
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('분류 기계와 나가는 문에 갈 수 있어요(도장을 다 모아 상자가 쌓여도)', () => {
    const all = SORT_ROUNDS.map((r) => stampFlag(r.id));
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

  it('놀이 기계는 등록된 미니게임을 열고, 도장마다 보낸 상자 더미가 하나씩 보여요', () => {
    const machine = room.objects.find((o) => o.type === 'game');
    expect(machine?.type === 'game' && MINIGAMES[machine.game]?.title).toBe('코딩 택배 분류');
    for (const r of SORT_ROUNDS) {
      const stack = room.objects.find((o) => o.id === `stack-${r.id}`);
      expect(stack?.when, r.id).toEqual({ flag: stampFlag(r.id) });
    }
  });
});
