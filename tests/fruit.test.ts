import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { CRATE_FRUITS, FRUITS, FRUIT_COLORS, FRUIT_FEATURES, FRUIT_KINDS, FRUIT_PATTERNS, FRUIT_ROUNDS, FRUIT_SAY, FRUIT_SHAPES, fruitFlag, fruitTier } from '../src/data/minigames/fruit';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { FruitRound, MapObject } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { lightOf } from '../src/game/light';
import { portalGate } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';
import { FRUIT_SIZE, fruitPixels } from '../src/minigames/fruit/fruitArt';
import { boxOf, fruitStars, guess, runTest, sameFeatures, type BoxCard } from '../src/minigames/fruit/fruitEnv';
import { MINIGAMES } from '../src/minigames/registry';

const round = (id: string) => FRUIT_ROUNDS.find((r) => r.id === id)!;
const example = (fruit: string, label = FRUITS[fruit].kind, card = `${fruit}-${label}`): BoxCard => ({ card, fruit, label });
/** 그림 이름으로 (이름표가 맞는) 카드 고르기. 같은 그림이 또 필요하면 다음 카드를 줘요. */
const pick = (r: FruitRound, ...fruits: string[]): string[] => {
  const used = new Set<string>();
  return fruits.map((f) => {
    const c = r.pool.find((p) => p.fruit === f && p.label === FRUITS[f].kind && !used.has(p.id))!;
    used.add(c.id);
    return c.id;
  });
};
const test = (r: FruitRound, ids: string[], labels: Record<string, string> = {}) => runTest(r, boxOf(r, ids, labels));
/** 상자 칸 수 안에서 고를 수 있는 모든 카드 묶음 */
const allBoxes = (r: FruitRound): string[][] => {
  const ids = r.pool.map((c) => c.id);
  const out: string[][] = [];
  for (let m = 1; m < 1 << ids.length; m++) {
    const box = ids.filter((_, i) => (m >> i) & 1);
    if (box.length <= r.boxSize) out.push(box);
  }
  return out;
};
const fruitsIn = (r: FruitRound, ids: string[]) => new Set(ids.map((id) => r.pool.find((c) => c.id === id)!.fruit));
const winners = (r: FruitRound) => allBoxes(r).filter((b) => test(r, b).success);
const needed = (r: FruitRound) => {
  const wins = winners(r).map((b) => fruitsIn(r, b));
  return Object.keys(FRUITS).filter((f) => wins.every((w) => w.has(f))).sort();
};

describe('과일 분류 로봇(fruitEnv)', () => {
  it('색·모양·무늬가 모두 같은 예시가 있으면 그 이름표를 따라 해요', () => {
    const g = guess([example('apple-red'), example('banana')], 'apple-red');
    expect(g).toMatchObject({ label: 'apple', truth: 'apple', best: 3, correct: true, nearest: ['apple-red-apple'] });
  });

  it('가장 많이 닮은 예시만 봐요(덜 닮은 예시는 답에 끼지 않아요)', () => {
    const g = guess([example('apple-red'), example('banana')], 'apple-green');
    expect(sameFeatures(FRUITS['apple-green'], FRUITS['apple-red'])).toEqual(['shape', 'pattern']);
    expect(g).toMatchObject({ label: 'apple', best: 2, correct: true, labels: ['apple'] });
  });

  it('가장 닮은 예시들의 이름표가 서로 다르면 헷갈려요', () => {
    const g = guess([example('apple-red'), example('tangerine')], 'apple-green');
    expect(g).toMatchObject({ label: null, best: 2, correct: false, labels: ['apple', 'tangerine'] });
  });

  it('본 적 없는 종류는 닮은 예시의 이름표로 잘못 말해요', () => {
    expect(guess([example('apple-red')], 'tangerine')).toMatchObject({ label: 'apple', truth: 'tangerine', correct: false });
  });

  it('상자가 비었거나 닮은 점이 하나도 없으면 답하지 못해요', () => {
    expect(guess([], 'apple-red')).toMatchObject({ label: null, best: 0, nearest: [], correct: false });
    expect(guess([example('banana')], 'watermelon')).toMatchObject({ label: null, best: 0, nearest: [], correct: false });
  });

  it('틀린 이름표를 배우면 틀린 답을 해요', () => {
    expect(guess([example('banana', 'apple')], 'banana')).toMatchObject({ label: 'apple', correct: false });
    expect(guess([example('banana'), example('banana', 'apple')], 'banana')).toMatchObject({ label: null, correct: false });
  });

  it('같은 예시를 더 넣어도 어느 판의 답도 달라지지 않아요(운도 없어요)', () => {
    for (const r of FRUIT_ROUNDS) {
      const twins = r.pool.filter((c) => r.pool.some((o) => o.id !== c.id && o.fruit === c.fruit && o.label === c.label));
      for (const box of allBoxes(r)) {
        const base = test(r, box);
        expect(JSON.stringify(test(r, box)), r.id).toBe(JSON.stringify(base));
        for (const c of twins) {
          if (box.includes(c.id) || !box.some((id) => { const o = r.pool.find((p) => p.id === id)!; return o.fruit === c.fruit && o.label === c.label; })) continue;
          expect(test(r, [...box, c.id]).correct, `${r.id} ${box} + ${c.id}`).toBe(base.correct);
        }
      }
    }
  });

  it('모두 맞히면 별 3개, 이름표가 틀린 카드가 남으면 별 2개, 못 맞히면 0개예요', () => {
    const r2 = round('r2');
    expect(fruitStars(test(r2, r2.initial!))).toBe(0);
    expect(fruitStars(test(r2, r2.initial!, { c2: 'apple', c4: 'banana' }))).toBe(2);
    expect(fruitStars(test(r2, r2.initial!, { c2: 'apple', c4: 'banana', c6: 'apple' }))).toBe(3);
  });
});

describe('과일 AI 가르치기 판 데이터', () => {
  it('판마다 이름표·카드·시험 과일이 맞게 이어져 있어요', () => {
    expect(FRUIT_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'r3', 'r4', 'r5', 'r6']);
    for (const r of FRUIT_ROUNDS) {
      for (const l of r.labels) expect(FRUIT_KINDS[l], `${r.id} ${l}`).toBeTruthy();
      expect(new Set(r.pool.map((c) => c.id)).size, r.id).toBe(r.pool.length);
      for (const c of r.pool) {
        expect(FRUITS[c.fruit], `${r.id} ${c.id}`).toBeDefined();
        expect(r.labels, `${r.id} ${c.id}`).toContain(c.label);
      }
      for (const id of r.initial ?? []) expect(r.pool.some((c) => c.id === id), `${r.id} ${id}`).toBe(true);
      expect((r.initial ?? []).length, r.id).toBeLessThanOrEqual(r.boxSize);
      for (const b of r.baskets) {
        expect(b.fruits.length, `${r.id} ${b.name}`).toBeGreaterThanOrEqual(4);
        for (const f of b.fruits) expect(r.labels, `${r.id} ${f}`).toContain(FRUITS[f].kind);
      }
    }
  });

  it('과일 그림은 모두 색·모양·무늬 조합이 달라서 로봇이 구별할 수 있어요', () => {
    const keys = Object.values(FRUITS).map((f) => `${f.color}|${f.shape}|${f.pattern}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const f of Object.values(FRUITS)) {
      expect(FRUIT_KINDS[f.kind], f.name).toBeTruthy();
      expect(FRUIT_COLORS[f.color] && FRUIT_SHAPES[f.shape] && FRUIT_PATTERNS[f.pattern], f.name).toBeTruthy();
    }
  });

  it('판마다 풀이가 있고(별 3개), 카드를 고르지 않거나 처음 상자 그대로는 성공하지 못해요', () => {
    for (const r of FRUIT_ROUNDS) {
      expect(winners(r).some((b) => fruitStars(test(r, b)) === 3), r.id).toBe(true);
      expect(test(r, []).success, r.id).toBe(false);
      if (r.initial) expect(test(r, r.initial).success, r.id).toBe(false);
    }
  });

  it('1판: 두 과일을 모두 보여 줘야 해요', () => {
    const r = round('r1');
    expect(test(r, pick(r, 'apple-red', 'apple-red')).success).toBe(false);
    expect(test(r, pick(r, 'banana', 'banana')).success).toBe(false);
    expect(test(r, pick(r, 'apple-red', 'banana')).success).toBe(true);
  });

  it('2판: 이름표가 틀린 카드가 셋이고, 그중 하나는 시험에 드러나지 않아요', () => {
    const r = round('r2');
    expect(r.relabel).toBe(true);
    expect(r.initial).toEqual(r.pool.map((c) => c.id));
    const first = test(r, r.initial!);
    expect(first.wrongLabels).toEqual(['c2', 'c4', 'c6']);
    expect(r.baskets.flatMap((b) => b.fruits)).not.toContain(r.pool.find((c) => c.id === 'c6')!.fruit);
    // 드러나지 않는 c6은 그대로 두어도 시험은 통과해요(그래도 별이 줄어요). 다른 두 장은 꼭 고쳐야 해요.
    expect(test(r, r.initial!, { c2: 'apple', c6: 'apple' }).success).toBe(false);
    expect(test(r, r.initial!, { c4: 'banana', c6: 'apple' }).success).toBe(false);
  });

  it('3판: 사과 세 가지 색과 귤을 모두 넣어야 해요', () => {
    const r = round('r3');
    expect(needed(r)).toEqual(['apple-green', 'apple-red', 'apple-yellow', 'tangerine']);
    expect(test(r, pick(r, 'apple-red', 'apple-red', 'tangerine', 'tangerine')).success).toBe(false);
  });

  it('4판: 예시 두 장에서 시작하고, 같은 예시를 늘려도 그대로이며, 다른 모습을 넣어야 다 맞혀요', () => {
    const r = round('r4');
    expect(r.history).toBe(true);
    const start = test(r, r.initial!);
    expect([start.correct, start.total]).toEqual([5, 8]);
    expect(test(r, [...r.initial!, ...pick(r, 'apple-red', 'apple-red', 'apple-red').slice(1)]).correct).toBe(5);
    const some = test(r, [...r.initial!, ...pick(r, 'grape')]);
    expect(some.correct).toBeGreaterThan(start.correct);
    expect(needed(r)).toEqual(['apple-green', 'banana-green', 'grape-green', 'watermelon']);
  });

  it('5판: 처음 상자는 빨간 사과로 치우쳐서 다른 색 사과만 모두 틀려요', () => {
    const r = round('r5');
    expect(r.bias).toBe(true);
    expect(r.initial!.length).toBe(r.boxSize);
    const first = test(r, r.initial!);
    const by = (f: string) => first.groups.find((g) => g.fruit === f)!;
    expect(by('apple-red')).toMatchObject({ correct: 2, total: 2 });
    expect(by('apple-green')).toMatchObject({ correct: 0, total: 2 });
    expect(by('apple-yellow')).toMatchObject({ correct: 0, total: 2 });
    expect(needed(r)).toEqual(['apple-green', 'apple-red', 'apple-yellow', 'lemon', 'tangerine']);
  });

  it('6판: 농장 세 곳을 한 상자로 맞혀야 하고, 한 농장에만 맞춘 상자는 실패해요', () => {
    const r = round('r6');
    expect(r.baskets.length).toBe(3);
    expect(needed(r)).toEqual(['apple-green', 'apple-red', 'apple-yellow', 'banana', 'banana-green', 'grape-green', 'tangerine']);
    for (const b of r.baskets) {
      const only = [...new Set(b.fruits)];
      const box = pick(r, ...only);
      const rep = test(r, box);
      expect(rep.baskets.find((x) => x.name === b.name)!.correct, b.name).toBe(b.fruits.length);
      expect(rep.success, b.name).toBe(false);
    }
  });

  it('판마다 배우는 것이 달라요', () => {
    expect(FRUIT_ROUNDS.map(fruitTier)).toEqual([
      '과일 2가지 + 상자 2칸',
      '과일 3가지 + 상자 6칸 + 틀린 이름표',
      '과일 2가지 + 상자 4칸',
      '과일 4가지 + 상자 8칸 + 예시 늘리기',
      '과일 3가지 + 상자 6칸 + 치우친 상자',
      '과일 4가지 + 상자 8칸 + 농장 3곳',
    ]);
  });

  it('1·2판은 처음부터, 3판은 5장, 4판은 6장, 5·6판은 8장 미션 뒤에 열려요', () => {
    expect(round('r1').unlock).toBeUndefined();
    expect(round('r2').unlock).toBeUndefined();
    for (const r of FRUIT_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      expect(ROBI_PARTS[r.unlock.part!], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    expect(getMission(round('r3').unlock!.mission)?.part.title).toBe('나만의 분류 AI');
    expect(getMission(round('r4').unlock!.mission)?.part.title).toBe('데이터가 적으면? 많으면?');
    expect(getMission(round('r5').unlock!.mission)?.part.title).toBe('치우친 데이터');
    expect(round('r6').unlock).toEqual(round('r5').unlock);
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요', () => {
    const texts = [
      ...FRUIT_ROUNDS.flatMap((r) => [r.intro, r.hint, r.lesson, r.lockedText ?? '', r.title, ...r.baskets.map((b) => b.name)]),
      ...Object.values(FRUIT_SAY),
      ...Object.values(FRUIT_KINDS),
      ...Object.values(FRUITS).map((f) => f.name),
      ...Object.values(FRUIT_FEATURES),
    ];
    for (const t of texts) {
      const rows = t.split('\n');
      expect(rows.length, t).toBeLessThanOrEqual(2);
      for (const row of rows) expect(row.length, row).toBeLessThanOrEqual(22);
      expect(/죽|처치|피를|코인|동전|\d{2,}-\d{3,}|[가-힣]+(초등)?학교/.test(t), t).toBe(false);
    }
  });
});

describe('과일 그림', () => {
  const palette = new Set(Object.values(JSON.parse(readFileSync(new URL('../assets-src/palette.json', import.meta.url), 'utf8')).colors as Record<string, string>).map((c) => c.toLowerCase()));

  it('16×16이고 공용 팔레트 색만 쓰며, 과일마다 그림이 달라요', () => {
    const seen = new Set<string>();
    for (const [id, f] of Object.entries(FRUITS)) {
      for (const fresh of [false, true]) {
        const px = fruitPixels(f, fresh);
        expect(px.length, id).toBe(FRUIT_SIZE);
        for (const row of px) {
          expect(row.length, id).toBe(FRUIT_SIZE);
          for (const c of row) if (c) expect(palette.has(c.toLowerCase()), `${id} ${c}`).toBe(true);
        }
        seen.add(JSON.stringify(px));
      }
    }
    expect(seen.size).toBe(Object.keys(FRUITS).length * 2);
  });

  it('시험 과일은 예시와 모습은 같아도 다른 과일이에요(꼭지·잎이나 휜 방향이 달라요)', () => {
    for (const [id, f] of Object.entries(FRUITS)) expect(JSON.stringify(fruitPixels(f, true)), id).not.toBe(JSON.stringify(fruitPixels(f)));
  });
});

const world = (flags: string[] = []): WorldQuery => {
  const f = new Set(flags);
  return { hasFlag: (n) => f.has(n), check: (c) => !c || ((!c.flag || f.has(c.flag)) && (!c.notFlag || !f.has(c.notFlag)) && !c.mission && !c.notMission) };
};

describe('마을 과일 가게', () => {
  type Portal = Extract<MapObject, { type: 'portal' }>;
  const door = MAPS.village.objects.find((o): o is Portal => o.type === 'portal' && o.id === 'to-fruitshop')!;
  const room = MAPS.fruitshop;

  it('처음부터 열려 있고, 나무가 있던 (19,13) 자리에 서 있어요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(portalGate(s, null, 'village', door)).toEqual({ open: true });
    expect(door.open).toBeUndefined();
    expect(door.sprite).toBe('prop-fruit-shop');
    expect(door.at).toEqual({ x: 19, y: 13 });
    expect(MAPS.village.rows[13][19]).not.toBe('T');
  });

  it('들어가면 가게 안 빈 칸에 서고, 문 매트로 나오면 가게 문 앞이에요', () => {
    expect(door.to.map).toBe('fruitshop');
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    const exit = room.objects.find((o): o is Portal => o.type === 'portal')!;
    expect(exit.to.map).toBe('village');
    for (const flags of [[], ['village-restore-1']]) {
      expect(makePassable(MAPS.village, buildCells(MAPS.village), world(flags))(exit.to.at.x, exit.to.at.y), flags.join()).toBe(true);
    }
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('마을 출발점에서 가게 문까지 걸어갈 수 있어요', () => {
    const v = MAPS.village;
    const cells = buildCells(v);
    for (const flags of [[], ['village-restore-1']]) {
      const pass = makePassable(v, cells, world(flags));
      const goal = (x: number, y: number) => Math.max(Math.abs(x - door.at.x), Math.abs(y - door.at.y)) <= 1 && !(x === door.at.x && y === door.at.y);
      expect(findPath(pass, v.spawn, goal, door.at), flags.join()).not.toBeNull();
    }
  });

  it('학습 로봇과 나가는 문에 갈 수 있어요(상자가 모두 차도)', () => {
    const all = FRUIT_ROUNDS.map((r) => fruitFlag(r.id));
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

  it('로봇은 등록된 미니게임을 열고, 판마다 상자 하나가 비었다가 그 판의 과일로 차요', () => {
    const robot = room.objects.find((o) => o.type === 'game');
    expect(robot?.type === 'game' && MINIGAMES[robot.game]?.title).toBe('과일 AI 가르치기');
    FRUIT_ROUNDS.forEach((r, i) => {
      const empty = room.objects.find((o) => o.id === `crate-${r.id}-empty`);
      const full = room.objects.find((o) => o.id === `crate-${r.id}-full`);
      expect(empty?.when, r.id).toEqual({ notFlag: fruitFlag(r.id) });
      expect(full?.when, r.id).toEqual({ flag: fruitFlag(r.id) });
      expect(empty?.type === 'prop' && empty.frame, r.id).toBe(0);
      expect(full?.type === 'prop' && full.frame, r.id).toBe(i + 1);
      expect(empty?.at, r.id).toEqual(full?.at);
      expect(CRATE_FRUITS[r.id].length, r.id).toBeGreaterThanOrEqual(2);
      for (const f of CRATE_FRUITS[r.id]) expect(FRUITS[f], `${r.id} ${f}`).toBeDefined();
    });
  });

  it('그림이 목록에 있고, 열린 가게 문과 학습 로봇이 빛나요', () => {
    for (const key of ['prop-fruit-shop', 'prop-fruit-ai', 'prop-fruit-stand', 'icon-fruit']) expect(ASSET_BY_KEY.has(key), key).toBe(true);
    expect(ASSET_BY_KEY.get('prop-fruit-crate')?.frames).toBe(FRUIT_ROUNDS.length + 1);
    expect(lightOf('prop-fruit-shop', 0)).toBeNull();
    expect(lightOf('prop-fruit-shop', 1)).not.toBeNull();
    expect(lightOf('prop-fruit-ai', 0)).toMatchObject({ at: 0.58, r: 10, glow: 'cool' });
  });
});
