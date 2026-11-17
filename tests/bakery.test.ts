import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { BAKERY_CARDS, BAKERY_ROUNDS, CAKE_GUESS, CAKE_MESSAGE, CAKE_SLOTS, bakeryTier, cakeFlag } from '../src/data/minigames/bakery';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { BakeryRound, CakeSlotId, MapObject } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { lightOf } from '../src/game/light';
import { portalGate } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';
import { bake, rightChoice } from '../src/minigames/bakery/bakeryEnv';
import { CAKE_SIZE, cakePixels } from '../src/minigames/bakery/cakeArt';
import { MINIGAMES } from '../src/minigames/registry';

const round = (id: string) => BAKERY_ROUNDS.find((r) => r.id === id)!;
const ALL_SLOTS: CakeSlotId[] = ['flavor', 'shape', 'topping', 'message'];

describe('주문서 오븐(bake)', () => {
  const r4 = round('r4');
  const want = r4.customers[0].want;

  it('또렷한 카드로 칸을 모두 채우면 손님 그림과 같은 케이크가 나와요', () => {
    const res = bake(r4, rightChoice(r4, want), want);
    expect(res.outcome).toBe('match');
    expect(res.cake).toEqual(want);
    expect([res.empty, res.vague, res.privacy, res.diff]).toEqual([[], [], [], []]);
  });

  it('빈 칸은 오븐이 마음대로 골라서 그림과 달라요', () => {
    const choice = { ...rightChoice(r4, want), shape: undefined };
    const res = bake(r4, choice, want);
    expect(res.outcome).toBe('mismatch');
    expect(res.empty).toEqual(['shape']);
    expect(res.cake?.shape).toBe(CAKE_GUESS.shape);
    expect(res.diff).toEqual(['shape']);
  });

  it('애매한 카드도 오븐이 마음대로 골라요', () => {
    const r3 = round('r3');
    const res = bake(r3, { ...r3.initial }, r3.customers[0].want);
    expect(res.outcome).toBe('mismatch');
    expect(res.vague).toEqual(['flavor', 'shape', 'topping']);
    expect(res.cake).toEqual({ flavor: CAKE_GUESS.flavor, shape: CAKE_GUESS.shape, topping: CAKE_GUESS.topping });
  });

  it('다른 카드를 고르면 그 칸이 그림과 달라요', () => {
    const res = bake(r4, { ...rightChoice(r4, want), flavor: 'f-choco' }, want);
    expect(res.outcome).toBe('mismatch');
    expect(res.diff).toEqual(['flavor']);
    expect(res.cake?.flavor).toBe('choco');
  });

  it('개인정보 카드가 있으면 굽지 않아요', () => {
    const res = bake(r4, { ...rightChoice(r4, want), message: 'm-name' }, want);
    expect(res.outcome).toBe('privacy');
    expect(res.cake).toBeNull();
    expect(res.privacy).toEqual(['message']);
  });

  it('같은 주문서면 언제나 같은 케이크예요(운이 없어요)', () => {
    const choice = { flavor: 'f-vanilla', shape: 's-heart' };
    expect(JSON.stringify(bake(r4, choice, want))).toBe(JSON.stringify(bake(r4, choice, want)));
  });

  it('케이크 그림은 16×16이고, 맛·모양·올릴 것·글씨가 달라지면 그림도 달라요', () => {
    const base = { flavor: 'vanilla', shape: 'square', topping: 'candy', message: 'birthday' };
    const px = cakePixels(base);
    expect(px.length).toBe(CAKE_SIZE);
    for (const row of px) expect(row.length).toBe(CAKE_SIZE);
    const key = (c: typeof base) => JSON.stringify(cakePixels(c));
    for (const change of [{ flavor: 'mint' }, { shape: 'star' }, { topping: 'berry' }, { message: 'thanks' }, { flavor: CAKE_GUESS.flavor }, { shape: CAKE_GUESS.shape }]) {
      expect(key({ ...base, ...change }), JSON.stringify(change)).not.toBe(key(base));
    }
  });
});

describe('주문서 빵집 판 데이터', () => {
  it('판마다 칸에 맞는 카드만 있고, 손님 그림과 같은 케이크를 구울 수 있어요', () => {
    for (const r of BAKERY_ROUNDS) {
      for (const slot of r.slots) {
        const ids = r.cards[slot] ?? [];
        expect(ids.length, `${r.id} ${slot}`).toBeGreaterThanOrEqual(3);
        for (const id of ids) expect(BAKERY_CARDS[id]?.slot, `${r.id} ${id}`).toBe(slot);
      }
      for (const slot of ALL_SLOTS) if (!r.slots.includes(slot)) expect(r.cards[slot], `${r.id} ${slot}`).toBeUndefined();
      for (const c of r.customers) {
        expect(Object.keys(c.want).sort(), `${r.id} ${c.who}`).toEqual([...r.slots].sort());
        expect(bake(r, rightChoice(r, c.want), c.want).outcome, `${r.id} ${c.who}`).toBe('match');
      }
    }
  });

  it('오븐이 마음대로 고르는 값은 어느 손님 그림에도 없어요(애매하게 써서는 성공하지 못해요)', () => {
    for (const r of BAKERY_ROUNDS) for (const c of r.customers) for (const slot of r.slots) expect(c.want[slot], `${r.id} ${slot}`).not.toBe(CAKE_GUESS[slot]);
    for (const card of Object.values(BAKERY_CARDS)) {
      if (card.vague || card.privacy) expect(card.value, card.id).toBeUndefined();
      else expect(card.value, card.id).not.toBe(CAKE_GUESS[card.slot]);
    }
  });

  it('판마다 배우는 것이 늘어요: 두 칸 → 세 칸 → 애매한 말 → 네 칸과 개인정보 → 고쳐 묻기 → 손님 세 명', () => {
    expect(BAKERY_ROUNDS.map((r) => r.slots.length)).toEqual([2, 3, 3, 4, 4, 4]);
    expect(BAKERY_ROUNDS.map(bakeryTier)).toEqual([
      '2칸 주문서',
      '3칸 주문서',
      '3칸 주문서 + 애매한 말',
      '4칸 주문서 + 개인정보 조심',
      '4칸 주문서 + 개인정보 조심 + 고쳐 묻기',
      '4칸 주문서 + 애매한 말 + 개인정보 조심 + 손님 3명',
    ]);
    // 3판: 처음 주문서가 모두 애매한 카드예요.
    const r3 = round('r3');
    expect(r3.slots.every((s) => BAKERY_CARDS[r3.initial?.[s] ?? '']?.vague)).toBe(true);
    // 5판: 지난 손님 주문서에서 두 칸만 고치면 돼요.
    const r5 = round('r5');
    const fromLast = bake(r5, { ...r5.initial }, r5.customers[0].want);
    expect(fromLast.diff).toEqual(['shape', 'message']);
    // 6판: 손님마다 두 칸씩 달라요(주문서를 고쳐 가며 구워요).
    const r6 = round('r6');
    expect(r6.customers.length).toBe(3);
    for (let i = 1; i < r6.customers.length; i++) {
      const prev = r6.customers[i - 1].want;
      const cur = r6.customers[i].want;
      expect(r6.slots.filter((s) => prev[s] !== cur[s]).length, String(i)).toBe(2);
    }
  });

  it('개인정보 카드는 글씨 판에만 있고, 4판부터 나와요', () => {
    for (const card of Object.values(BAKERY_CARDS)) if (card.privacy) expect(card.slot, card.id).toBe('message');
    const has = (r: BakeryRound) => (r.cards.message ?? []).some((id) => BAKERY_CARDS[id]?.privacy);
    expect(BAKERY_ROUNDS.map(has)).toEqual([false, false, false, true, true, true]);
  });

  it('1·2판은 처음부터, 3·4판은 7장 글 주문서 뒤, 5·6판은 7장 그림 주문서 뒤에 열려요', () => {
    expect(round('r1').unlock).toBeUndefined();
    expect(round('r2').unlock).toBeUndefined();
    for (const r of BAKERY_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      if (r.unlock.part) expect(ROBI_PARTS[r.unlock.part], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    expect(getMission(round('r3').unlock!.mission)?.part.title).toBe('글 주문서');
    expect(getMission(round('r5').unlock!.mission)?.part.title).toBe('그림 주문서 + 고쳐 묻기');
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요(실제 이름·주소는 없어요)', () => {
    const texts = [
      ...BAKERY_ROUNDS.flatMap((r) => [r.intro, r.hint, r.lockedText ?? '', r.title, ...r.customers.flatMap((c) => [c.say, c.who])]),
      ...Object.values(BAKERY_CARDS).map((c) => c.text),
      ...Object.values(CAKE_MESSAGE),
      ...Object.values(CAKE_SLOTS).flatMap((s) => [s.label, s.question]),
    ];
    for (const t of texts) {
      const rows = t.split('\n');
      expect(rows.length, t).toBeLessThanOrEqual(2);
      for (const row of rows) expect(row.length, row).toBeLessThanOrEqual(22);
      expect(/죽|처치|피를|코인|동전을 넣|\d{2,}-\d{3,}|[가-힣]+(초등)?학교|[가-힣]+동 \d/.test(t), t).toBe(false);
    }
  });

  it('그림·소품이 목록에 있고, 열린 빵집 문과 오븐이 빛나요', () => {
    for (const key of ['prop-bakery', 'prop-oven', 'prop-bread-shelf', 'icon-cake']) expect(ASSET_BY_KEY.has(key), key).toBe(true);
    expect(ASSET_BY_KEY.get('prop-cake-stand')?.frames).toBe(BAKERY_ROUNDS.length + 1);
    expect(lightOf('prop-bakery', 0)).toBeNull();
    expect(lightOf('prop-bakery', 1)).not.toBeNull();
    expect(lightOf('prop-oven', 0)).not.toBeNull();
  });
});

const world = (flags: string[] = []): WorldQuery => {
  const f = new Set(flags);
  return { hasFlag: (n) => f.has(n), check: (c) => !c || ((!c.flag || f.has(c.flag)) && (!c.notFlag || !f.has(c.notFlag)) && !c.mission && !c.notMission) };
};

describe('마을 빵집', () => {
  type Portal = Extract<MapObject, { type: 'portal' }>;
  const door = MAPS.village.objects.find((o): o is Portal => o.type === 'portal' && o.id === 'to-bakery')!;
  const room = MAPS.bakery;

  it('처음부터 열려 있고, 예전 빈 집(16,13) 자리에 서 있어요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(portalGate(s, null, 'village', door)).toEqual({ open: true });
    expect(door.open).toBeUndefined();
    expect(door.sprite).toBe('prop-bakery');
    expect(door.at).toEqual({ x: 16, y: 13 });
    expect(MAPS.village.objects.some((o) => o.id.startsWith('house-'))).toBe(false);
  });

  it('들어가면 빵집 안 빈 칸에 서고, 문 매트로 나오면 빵집 문 앞이에요', () => {
    expect(door.to.map).toBe('bakery');
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    const exit = room.objects.find((o): o is Portal => o.type === 'portal')!;
    expect(exit.to.map).toBe('village');
    for (const flags of [[], ['village-restore-1']]) {
      expect(makePassable(MAPS.village, buildCells(MAPS.village), world(flags))(exit.to.at.x, exit.to.at.y), flags.join()).toBe(true);
    }
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('마을 출발점에서 빵집 문까지 걸어갈 수 있어요', () => {
    const v = MAPS.village;
    const cells = buildCells(v);
    for (const flags of [[], ['village-restore-1']]) {
      const pass = makePassable(v, cells, world(flags));
      const goal = (x: number, y: number) => Math.max(Math.abs(x - door.at.x), Math.abs(y - door.at.y)) <= 1 && !(x === door.at.x && y === door.at.y);
      expect(findPath(pass, v.spawn, goal, door.at), flags.join()).not.toBeNull();
    }
  });

  it('주문서 오븐과 나가는 문에 갈 수 있어요(진열대가 모두 차도)', () => {
    const all = BAKERY_ROUNDS.map((r) => cakeFlag(r.id));
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

  it('오븐은 등록된 미니게임을 열고, 판마다 진열대 하나가 비었다가 그 판의 케이크로 차요', () => {
    const oven = room.objects.find((o) => o.type === 'game');
    expect(oven?.type === 'game' && MINIGAMES[oven.game]?.title).toBe('주문서 빵집');
    BAKERY_ROUNDS.forEach((r, i) => {
      const empty = room.objects.find((o) => o.id === `stand-${r.id}-empty`);
      const full = room.objects.find((o) => o.id === `stand-${r.id}-cake`);
      expect(empty?.when, r.id).toEqual({ notFlag: cakeFlag(r.id) });
      expect(full?.when, r.id).toEqual({ flag: cakeFlag(r.id) });
      expect(empty?.type === 'prop' && empty.frame, r.id).toBe(0);
      expect(full?.type === 'prop' && full.frame, r.id).toBe(i + 1);
      expect(empty?.at, r.id).toEqual(full?.at);
    });
  });
});
