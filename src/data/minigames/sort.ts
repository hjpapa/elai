import type { Cmd, MinigameUnlock, SortItem, SortRound, SortSide } from '../schema';

/**
 * 코딩 택배 분류(마을 택배소). 컨베이어로 오는 물건을 바구니에 나눠요.
 * 판을 처음 성공하면 배달 도장을 받고, 택배소 왼쪽 벽 앞에 보낸 상자 더미가 쌓여요.
 * 결과는 학생 프로그램대로만 정해지고, 운이나 코인은 쓰지 않아요.
 */
export const SORT_TITLE = '분류 대장';

/** 배달 도장 플래그(판마다 하나) */
export const stampFlag = (roundId: string): string => `stamp:sort-${roundId}`;

export const SORT_ITEM_ICON: Record<SortItem, string> = { heart: 'icon-sort-heart', star: 'icon-sort-star', ball: 'icon-sort-ball' };
export const SORT_ITEM_NAME: Record<SortItem, string> = { heart: '하트 상자', star: '별 상자', ball: '공' };
export const SIDE_NAME: Record<SortSide, string> = { left: '왼쪽', right: '오른쪽' };

const SEND: Cmd[] = ['sendLeft', 'sendRight'];
/** 반복 판: 2장 '긴 굴'을 끝냈거나 2장 부품(메모리 칩)이 있으면 */
const REPEAT_UNLOCK: MinigameUnlock = { mission: 'ch2-p2-m1', part: 'memoryChip' };
const REPEAT_LOCKED = '2장에서 반복을 배우면\n이 판이 열려요.';
/** 만약 판: 3장 '모래 신호등'을 끝냈거나 3장 부품(센서)이 있으면 */
const IF_UNLOCK: MinigameUnlock = { mission: 'ch3-p1-m1', part: 'sensor' };
const IF_LOCKED = '3장에서 만약을 배우면\n이 판이 열려요.';
const HEART_LEFT: SortRound['rule'] = { heart: 'left', star: 'right' };

/** 판 번호 순서대로 블록이 늘어요: 순서(1장) → 반복(2장) → 만약(3장). 만약 판은 줄 세 개를 같은 프로그램으로 나눠요. */
export const SORT_ROUNDS: SortRound[] = [
  {
    id: 'r1',
    title: '첫 배달',
    belts: [['heart', 'star', 'heart']],
    rule: HEART_LEFT,
    palette: SEND,
    optimal: 3,
    intro: '상자가 하나씩 내려와요.\n주문 카드대로 바구니에 보내요.',
    hint: '맨 앞 상자부터 차례로 보내요.\n하트는 왼쪽, 별은 오른쪽!',
  },
  {
    id: 'r2',
    title: '긴 줄',
    belts: [['star', 'star', 'heart', 'star', 'heart']],
    rule: HEART_LEFT,
    palette: SEND,
    optimal: 5,
    intro: '이번에는 상자가 다섯 개예요.\n줄을 잘 보고 순서대로 놓아요.',
    hint: '문에 가까운 상자부터 와요.\n별, 별, 하트, 별, 하트예요.',
  },
  {
    id: 'r3',
    title: '번갈아 오는 상자',
    belts: [['heart', 'star', 'heart', 'star', 'heart', 'star', 'heart', 'star']],
    rule: HEART_LEFT,
    palette: SEND,
    allowRepeat: true,
    optimal: 3,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '하트와 별이 번갈아 와요.\n되풀이되는 묶음을 찾아요.',
    hint: '왼쪽, 오른쪽이 한 묶음이에요.\n4번 반복해 봐요.',
  },
  {
    id: 'r4',
    title: '둘씩 하나씩',
    belts: [['heart', 'heart', 'star', 'heart', 'heart', 'star', 'heart', 'heart', 'star']],
    rule: HEART_LEFT,
    palette: SEND,
    allowRepeat: true,
    optimal: 4,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '하트 둘, 별 하나가 되풀이돼요.\n반복으로 짧게 만들어요.',
    hint: '왼쪽, 왼쪽, 오른쪽이 한 묶음이에요.\n3번 반복해 봐요.',
  },
  {
    id: 'r5',
    title: '어떤 줄이 와도',
    belts: [
      ['heart', 'star', 'star', 'heart', 'star', 'heart'],
      ['star', 'heart', 'heart', 'heart', 'star', 'star'],
      ['heart', 'heart', 'star', 'heart', 'star', 'star'],
    ],
    rule: HEART_LEFT,
    palette: SEND,
    allowRepeat: true,
    allowIf: ['boxHeart', 'boxStar'],
    optimal: 4,
    unlock: IF_UNLOCK,
    lockedText: IF_LOCKED,
    intro: '상자 줄이 세 번 바뀌어요.\n같은 프로그램으로 모두 나눠요.',
    hint: '6번 반복 안에 만약을 넣어요.\n하트 상자라면 왼쪽, 아니면 오른쪽!',
  },
  {
    id: 'r6',
    title: '무엇으로 나눌까',
    belts: [
      ['ball', 'heart', 'star', 'ball', 'star', 'ball'],
      ['heart', 'ball', 'ball', 'star', 'heart', 'star'],
      ['star', 'star', 'ball', 'heart', 'ball', 'ball'],
    ],
    rule: { ball: 'left', heart: 'right', star: 'right' },
    palette: SEND,
    allowRepeat: true,
    allowIf: ['boxHeart', 'boxStar', 'itemRound'],
    optimal: 4,
    unlock: IF_UNLOCK,
    lockedText: IF_LOCKED,
    intro: '공은 왼쪽, 상자는 오른쪽이에요.\n어떤 조건이 가장 쉬울까요?',
    hint: '상자 무늬 대신 모양을 봐요.\n둥근 물건이라면 왼쪽!',
  },
];

/** 판이 쓰는 블록 묶음 이름(판 고르기 카드) */
export function sortTier(round: SortRound): string {
  if (round.allowIf?.length) return '보내기 + 반복 + 만약';
  return round.allowRepeat ? '보내기 + 반복' : '보내기';
}
