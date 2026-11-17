import type { BakeryCard, BakeryRound, CakeSlotId, MinigameUnlock } from '../schema';

/**
 * 주문서 빵집(마을 빵집). 손님 그림과 같은 케이크가 나오게 주문서 칸마다 카드를 골라 주문서 오븐에 부탁해요.
 * 7장 '글 주문서'·'그림 주문서'(칸을 빠짐없이 또렷하게, 고쳐 묻기, 개인정보 넣지 않기)를 놀이로 다시 해요.
 * 오븐은 실제 AI가 아니라 카드대로만 굽는 작은 모델이에요. 빈 칸·애매한 카드는 마음대로 고르고, 개인정보 카드는 굽지 않아요.
 * 판을 처음 성공하면 빵집 왼쪽 벽 앞 진열대에 그 판의 케이크가 놓여요. 고쳐 묻기는 감점이 아니에요(별은 개인정보 카드로 구웠을 때만 줄어요).
 */
export const BAKERY_TITLE = '주문서 장인';

/** 진열대 플래그(판마다 하나) */
export const cakeFlag = (roundId: string): string => `cake:${roundId}`;

/** 주문서 칸 이름과 묻는 말 */
export const CAKE_SLOTS: Record<CakeSlotId, { label: string; question: string }> = {
  flavor: { label: '맛', question: '어떤 맛 크림일까요?' },
  shape: { label: '모양', question: '어떤 모양일까요?' },
  topping: { label: '올릴 것', question: '위에 무엇을 올릴까요?' },
  message: { label: '글씨 판', question: '무엇이라고 쓸까요?' },
};

/** 빈 칸이나 애매한 카드일 때 오븐이 마음대로 고르는 값(손님 그림에는 나오지 않아요) */
export const CAKE_GUESS: Record<CakeSlotId, string> = { flavor: 'plain', shape: 'lump', topping: 'none', message: 'none' };

const card = (c: BakeryCard): [string, BakeryCard] => [c.id, c];

/** 주문서 카드 전체 */
export const BAKERY_CARDS: Record<string, BakeryCard> = Object.fromEntries([
  card({ id: 'f-strawberry', slot: 'flavor', text: '딸기 맛', value: 'strawberry' }),
  card({ id: 'f-choco', slot: 'flavor', text: '초코 맛', value: 'choco' }),
  card({ id: 'f-vanilla', slot: 'flavor', text: '바닐라 맛', value: 'vanilla' }),
  card({ id: 'f-mint', slot: 'flavor', text: '민트 맛', value: 'mint' }),
  card({ id: 'f-vague', slot: 'flavor', text: '알아서 맛있게', vague: true }),
  card({ id: 's-round', slot: 'shape', text: '둥근 모양', value: 'round' }),
  card({ id: 's-square', slot: 'shape', text: '네모 모양', value: 'square' }),
  card({ id: 's-heart', slot: 'shape', text: '하트 모양', value: 'heart' }),
  card({ id: 's-star', slot: 'shape', text: '별 모양', value: 'star' }),
  card({ id: 's-vague', slot: 'shape', text: '예쁜 모양으로', vague: true }),
  card({ id: 't-berry', slot: 'topping', text: '딸기 올리기', value: 'berry' }),
  card({ id: 't-cherry', slot: 'topping', text: '체리 올리기', value: 'cherry' }),
  card({ id: 't-flower', slot: 'topping', text: '꽃 올리기', value: 'flower' }),
  card({ id: 't-candy', slot: 'topping', text: '별사탕 올리기', value: 'candy' }),
  card({ id: 't-vague', slot: 'topping', text: '멋지게 꾸며 줘요', vague: true }),
  card({ id: 'm-birthday', slot: 'message', text: '생일 축하해요', value: 'birthday' }),
  card({ id: 'm-thanks', slot: 'message', text: '고마워요', value: 'thanks' }),
  card({ id: 'm-cheer', slot: 'message', text: '힘내요', value: 'cheer' }),
  card({ id: 'm-name', slot: 'message', text: '받는 친구 이름과 반', privacy: true }),
  card({ id: 'm-address', slot: 'message', text: '우리 집 주소', privacy: true }),
]);

/** 글씨 판 값 → 케이크 위 글씨 */
export const CAKE_MESSAGE: Record<string, string> = { birthday: '생일 축하해요', thanks: '고마워요', cheer: '힘내요' };

/** 글 주문서 판: 7장 '글 주문서'를 끝냈거나 7장 부품(대화 모듈)이 있으면 */
const WRITE_UNLOCK: MinigameUnlock = { mission: 'ch7-p2-m1', part: 'talkModule' };
const WRITE_LOCKED = "7장 '글 주문서'를 하면\n이 판이 열려요.";
/** 고쳐 묻기 판: 7장 '그림 주문서 + 고쳐 묻기'를 끝냈거나 대화 모듈이 있으면 */
const REVISE_UNLOCK: MinigameUnlock = { mission: 'ch7-p3-m1', part: 'talkModule' };
const REVISE_LOCKED = "7장 '그림 주문서'를 하면\n이 판이 열려요.";

/**
 * 판 번호 순서대로 칸이 늘어요: 두 칸 → 세 칸 → 애매한 말 고치기 → 네 칸과 개인정보 → 고쳐 묻기 → 손님 세 명.
 */
export const BAKERY_ROUNDS: BakeryRound[] = [
  {
    id: 'r1',
    title: '첫 주문',
    slots: ['flavor', 'shape'],
    cards: { flavor: ['f-strawberry', 'f-choco', 'f-vanilla'], shape: ['s-round', 's-square', 's-heart'] },
    customers: [{ who: '하람', say: '딸기 하트 케이크를\n부탁해요!', want: { flavor: 'strawberry', shape: 'heart' } }],
    intro: '손님 그림과 같은 케이크를\n주문서로 부탁해요.',
    hint: '분홍 크림은 딸기 맛이에요.\n모양은 하트를 골라요.',
  },
  {
    id: 'r2',
    title: '꾸민 케이크',
    slots: ['flavor', 'shape', 'topping'],
    cards: { flavor: ['f-choco', 'f-vanilla', 'f-mint'], shape: ['s-round', 's-square', 's-star'], topping: ['t-berry', 't-cherry', 't-flower'] },
    customers: [{ who: '도윤', say: '그림처럼 초코 케이크에\n열매를 올려 주세요.', want: { flavor: 'choco', shape: 'round', topping: 'cherry' } }],
    intro: '이번에는 칸이 세 개예요.\n올릴 것도 골라요.',
    hint: '둥근 모양에 꼭지 달린\n빨간 열매는 체리예요.',
  },
  {
    id: 'r3',
    title: '애매한 주문',
    slots: ['flavor', 'shape', 'topping'],
    cards: {
      flavor: ['f-vague', 'f-strawberry', 'f-vanilla', 'f-mint'],
      shape: ['s-vague', 's-round', 's-heart', 's-star'],
      topping: ['t-vague', 't-berry', 't-flower', 't-candy'],
    },
    customers: [{ who: '서아', say: '민트 맛 별 케이크에\n꽃을 올려 주세요.', want: { flavor: 'mint', shape: 'star', topping: 'flower' } }],
    initial: { flavor: 'f-vague', shape: 's-vague', topping: 't-vague' },
    unlock: WRITE_UNLOCK,
    lockedText: WRITE_LOCKED,
    intro: '애매한 주문서를 받았어요.\n또렷한 카드로 고쳐요.',
    hint: "'예쁘게' 같은 말은 애매해요.\n그림에 맞는 카드로 바꿔요.",
  },
  {
    id: 'r4',
    title: '네 칸 주문서',
    slots: ['flavor', 'shape', 'topping', 'message'],
    cards: {
      flavor: ['f-strawberry', 'f-choco', 'f-vanilla'],
      shape: ['s-round', 's-square', 's-heart'],
      topping: ['t-berry', 't-flower', 't-candy'],
      message: ['m-birthday', 'm-thanks', 'm-name'],
    },
    customers: [{ who: '마루', say: '친구 생일 케이크예요.\n그림처럼 부탁해요.', want: { flavor: 'vanilla', shape: 'square', topping: 'candy', message: 'birthday' } }],
    unlock: WRITE_UNLOCK,
    lockedText: WRITE_LOCKED,
    intro: '글씨 판까지 네 칸이에요.\n개인정보는 넣지 않아요.',
    hint: '바닐라 네모 케이크에 별사탕,\n글씨는 생일 축하해요!',
  },
  {
    id: 'r5',
    title: '고쳐 묻기',
    slots: ['flavor', 'shape', 'topping', 'message'],
    cards: {
      flavor: ['f-strawberry', 'f-choco', 'f-vanilla', 'f-mint'],
      shape: ['s-round', 's-square', 's-heart', 's-star'],
      topping: ['t-berry', 't-cherry', 't-flower', 't-candy'],
      message: ['m-birthday', 'm-thanks', 'm-cheer', 'm-address'],
    },
    customers: [{ who: '율', say: '지난 주문과 거의 같아요.\n다른 곳만 고쳐 주세요.', want: { flavor: 'vanilla', shape: 'heart', topping: 'candy', message: 'thanks' } }],
    initial: { flavor: 'f-vanilla', shape: 's-square', topping: 't-candy', message: 'm-birthday' },
    unlock: REVISE_UNLOCK,
    lockedText: REVISE_LOCKED,
    intro: '지난 손님 주문서가 남았어요.\n다른 곳만 고쳐 물어요.',
    hint: '모양과 글씨 판을 살펴봐요.\n나머지는 그대로 둬요.',
  },
  {
    id: 'r6',
    title: '손님 세 명',
    slots: ['flavor', 'shape', 'topping', 'message'],
    cards: {
      flavor: ['f-strawberry', 'f-choco', 'f-mint', 'f-vague'],
      shape: ['s-round', 's-heart', 's-star', 's-vague'],
      topping: ['t-berry', 't-cherry', 't-candy', 't-vague'],
      message: ['m-birthday', 'm-cheer', 'm-name', 'm-address'],
    },
    customers: [
      { who: '지오', say: '초코 생일 케이크를\n그림처럼 부탁해요.', want: { flavor: 'choco', shape: 'round', topping: 'berry', message: 'birthday' } },
      { who: '나래', say: '앞 손님과 비슷해요.\n모양과 글씨만 달라요.', want: { flavor: 'choco', shape: 'star', topping: 'berry', message: 'cheer' } },
      { who: '바다', say: '이번엔 민트 맛이에요.\n올릴 것도 바꿔 주세요.', want: { flavor: 'mint', shape: 'star', topping: 'candy', message: 'cheer' } },
    ],
    unlock: REVISE_UNLOCK,
    lockedText: REVISE_LOCKED,
    intro: '손님 세 명이 차례로 와요.\n주문서를 고쳐 가며 구워요.',
    hint: '앞 주문서에서 달라진 칸만\n바꾸면 금방이에요.',
  },
];

/** 판 고르기 카드에 보여 줄 설명 */
export function bakeryTier(round: BakeryRound): string {
  const parts = [`${round.slots.length}칸 주문서`];
  const ids = Object.values(round.cards).flat();
  if (ids.some((id) => BAKERY_CARDS[id]?.vague)) parts.push('애매한 말');
  if (ids.some((id) => BAKERY_CARDS[id]?.privacy)) parts.push('개인정보 조심');
  // 처음 주문서가 또렷한 카드로 채워져 있으면(지난 손님 주문) 고쳐 묻는 판이에요.
  const initial = Object.values(round.initial ?? {}).filter((id): id is string => !!id);
  if (initial.length && initial.every((id) => !BAKERY_CARDS[id]?.vague)) parts.push('고쳐 묻기');
  if (round.customers.length > 1) parts.push(`손님 ${round.customers.length}명`);
  return parts.join(' + ');
}
