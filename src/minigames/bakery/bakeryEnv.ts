import { BAKERY_CARDS, CAKE_GUESS } from '../../data/minigames/bakery';
import type { BakeryRound, CakeOrder, CakeSlotId } from '../../data/schema';

/** 칸마다 고른 카드 id(빈 칸은 없음) */
export type CakeChoice = Partial<Record<CakeSlotId, string>>;

/**
 * match: 손님 그림과 같아요 · mismatch: 다른 칸이 있어요 · privacy: 개인정보 카드가 있어서 굽지 않았어요
 */
export type BakeOutcome = 'match' | 'mismatch' | 'privacy';

export interface BakeResult {
  outcome: BakeOutcome;
  /** 오븐이 구운 케이크(개인정보 카드가 있으면 굽지 않아서 null) */
  cake: CakeOrder | null;
  /** 빈 칸이라 오븐이 마음대로 고른 칸 */
  empty: CakeSlotId[];
  /** 애매한 카드라 오븐이 마음대로 고른 칸 */
  vague: CakeSlotId[];
  /** 개인정보 카드가 든 칸 */
  privacy: CakeSlotId[];
  /** 손님 그림과 다른 칸 */
  diff: CakeSlotId[];
}

/**
 * 주문서 오븐: 실제 AI가 아니라 카드대로만 굽는 작은 모델이에요.
 * - 또렷한 카드는 그 값대로 구워요.
 * - 빈 칸과 애매한 카드('예쁘게' 등)는 오븐이 마음대로 골라요(손님 그림에는 나오지 않는 값이라 늘 달라요).
 * - 이름·반·주소 같은 개인정보 카드가 있으면 굽지 않고 알려 줘요.
 * 같은 주문서면 언제나 같은 케이크예요.
 */
export function bake(round: BakeryRound, choice: CakeChoice, want: CakeOrder): BakeResult {
  const empty: CakeSlotId[] = [];
  const vague: CakeSlotId[] = [];
  const privacy: CakeSlotId[] = [];
  const values: Partial<Record<CakeSlotId, string>> = {};
  for (const slot of round.slots) {
    const id = choice[slot];
    const card = id ? BAKERY_CARDS[id] : undefined;
    if (!card || card.slot !== slot) {
      empty.push(slot);
      values[slot] = CAKE_GUESS[slot];
    } else if (card.privacy) {
      privacy.push(slot);
    } else if (card.vague || !card.value) {
      vague.push(slot);
      values[slot] = CAKE_GUESS[slot];
    } else {
      values[slot] = card.value;
    }
  }
  if (privacy.length) return { outcome: 'privacy', cake: null, empty, vague, privacy, diff: [] };
  const cake: CakeOrder = {
    flavor: values.flavor ?? CAKE_GUESS.flavor,
    shape: values.shape ?? CAKE_GUESS.shape,
    ...(round.slots.includes('topping') ? { topping: values.topping ?? CAKE_GUESS.topping } : {}),
    ...(round.slots.includes('message') ? { message: values.message ?? CAKE_GUESS.message } : {}),
  };
  const diff = round.slots.filter((slot) => cake[slot] !== want[slot]);
  return { outcome: diff.length ? 'mismatch' : 'match', cake, empty, vague, privacy, diff };
}

/** 손님 그림과 같은 케이크가 나오는 주문서(테스트와 힌트용): 칸마다 그 값을 가진 또렷한 카드를 골라요. */
export function rightChoice(round: BakeryRound, want: CakeOrder): CakeChoice {
  const choice: CakeChoice = {};
  for (const slot of round.slots) {
    const id = round.cards[slot]?.find((c) => BAKERY_CARDS[c]?.value === want[slot]);
    if (id) choice[slot] = id;
  }
  return choice;
}
