import type { Cmd, LightRound, MinigameUnlock } from '../schema';

/**
 * 코딩 불빛 그림(마을 불빛 가게). 전구판의 숫자 판(0·1)을 보고 불빛 붓으로 1인 전구만 켜요.
 * 4장 '등대 신호'(켜진 등불 = 1)와 5장 '픽셀 돋보기'(1인 칸을 켜서 그림)를 프로그램으로 이어요.
 * 판을 처음 성공하면 가게 왼쪽 벽 액자에 그 판의 그림이 켜져요. 결과는 학생 프로그램대로만 정해지고, 운이나 코인은 쓰지 않아요.
 */
export const LIGHT_TITLE = '불빛 화가';

/** 액자 플래그(판마다 하나) */
export const lightFlag = (roundId: string): string => `light:${roundId}`;

const MOVE: Cmd[] = ['lightOn', 'forward'];
const ROWS: Cmd[] = ['lightOn', 'forward', 'nextRow'];
/** 반복 판: 2장 '긴 굴'을 끝냈거나 2장 부품(메모리 칩)이 있으면 */
const REPEAT_UNLOCK: MinigameUnlock = { mission: 'ch2-p2-m1', part: 'memoryChip' };
const REPEAT_LOCKED = '2장에서 반복을 배우면\n이 판이 열려요.';
/** 숫자 읽기 판: 4장 '등대 신호'(켜진 등불 = 1)를 끝냈거나 4장 부품(데이터 렌즈)이 있으면 */
const CODE_UNLOCK: MinigameUnlock = { mission: 'ch4-p3-m1', part: 'dataLens' };
const CODE_LOCKED = "4장 '등대 신호'를 하면\n이 판이 열려요.";
/** 숫자 그림 판: 5장 '픽셀 돋보기'(1인 칸을 켜서 그림)를 끝냈거나 5장 부품(학습 칩)이 있으면 */
const PIXEL_UNLOCK: MinigameUnlock = { mission: 'ch5-p1-m1', part: 'learningChip' };
const PIXEL_LOCKED = "5장 '픽셀 돋보기'를 하면\n이 판이 열려요.";

/**
 * 판 번호 순서대로 블록이 늘어요: 켜기·앞으로 → 다음 줄 → 반복(2장) → 반복 안의 반복 → 만약으로 숫자 읽기(4장) → 숫자 그림(5장).
 * 5·6판은 숫자만 다른 그림 세 장을 같은 프로그램으로 켜요(같은 프로그램 + 다른 숫자 = 다른 그림).
 */
export const LIGHT_ROUNDS: LightRound[] = [
  {
    id: 'r1',
    title: '첫 불빛',
    pictures: [['101']],
    palette: MOVE,
    optimal: 4,
    intro: '숫자가 1인 전구만 켜요.\n0인 전구는 꺼 둬요.',
    hint: '켜기, 앞으로, 앞으로, 켜기!\n가운데 0은 지나가요.',
  },
  {
    id: 'r2',
    title: '두 줄 그림',
    pictures: [['010', '111']],
    palette: ROWS,
    optimal: 8,
    intro: '이번에는 줄이 두 개예요.\n다음 줄 블록으로 내려가요.',
    hint: '첫 줄은 가운데 하나만 켜요.\n다음 줄은 세 개 모두!',
  },
  {
    id: 'r3',
    title: '점선 무늬',
    pictures: [['101010']],
    palette: MOVE,
    allowRepeat: true,
    optimal: 4,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '켜짐, 꺼짐이 되풀이돼요.\n되풀이되는 묶음을 찾아요.',
    hint: '켜기, 앞으로, 앞으로가 한 묶음!\n3번 반복해 봐요.',
  },
  {
    id: 'r4',
    title: '불 켜진 창문',
    pictures: [['1111', '1111', '1111']],
    palette: ROWS,
    allowRepeat: true,
    optimal: 5,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '네 칸짜리 줄이 세 개예요.\n반복 안에 반복을 넣어 봐요.',
    hint: '켜기·앞으로를 4번 반복하고\n다음 줄. 이것을 3번 반복!',
  },
  {
    id: 'r5',
    title: '어떤 숫자가 와도',
    pictures: [['110100'], ['011011'], ['100111']],
    palette: MOVE,
    allowRepeat: true,
    allowIf: ['codeOne'],
    optimal: 4,
    unlock: CODE_UNLOCK,
    lockedText: CODE_LOCKED,
    intro: '숫자 줄이 세 번 바뀌어요.\n같은 프로그램으로 모두 켜요.',
    hint: '6번 반복 안에 만약을 넣어요.\n1이라면 켜고, 늘 앞으로!',
  },
  {
    id: 'r6',
    title: '숫자로 그린 그림',
    pictures: [
      ['01010', '11111', '11111', '01110', '00100'],
      ['00100', '01110', '11111', '11011', '11011'],
      ['11111', '10101', '11111', '10001', '11111'],
    ],
    palette: ROWS,
    allowRepeat: true,
    allowIf: ['codeOne'],
    optimal: 6,
    unlock: PIXEL_UNLOCK,
    lockedText: PIXEL_LOCKED,
    intro: '숫자만 보고 그림을 켜요.\n어떤 그림이 나올까요?',
    hint: '5칸 줄을 5번 그려요.\n줄 끝에서는 다음 줄!',
  },
];

/** 판이 쓰는 블록 묶음 이름(판 고르기 카드) */
export function lightTier(round: LightRound): string {
  const parts = [round.palette.includes('nextRow') ? '켜기 + 다음 줄' : '켜기 + 앞으로'];
  if (round.allowRepeat) parts.push('반복');
  if (round.allowIf?.length) parts.push('만약');
  return parts.join(' + ');
}
