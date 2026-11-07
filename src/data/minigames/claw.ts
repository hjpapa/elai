import type { ClawRound, Cmd, DollDef } from '../schema';

/**
 * 코딩 인형뽑기(마을 공방). 판을 처음 성공하면 주문한 인형을 받아요.
 * 결과는 학생 프로그램대로만 정해지고, 운이나 코인은 쓰지 않아요.
 */
export const CLAW_TITLE = '집게 장인';

/** 섬 친구 인형(뽑은 인형은 공방 왼쪽 벽 앞 방석에 차례로 앉아요) */
export const DOLLS: DollDef[] = [
  { id: 'dummy', name: '허수아비 봇 인형', sprite: 'prop-doll-dummy', desc: '연습장 허수아비 봇을 닮았어요.\n폭신한 천으로 만들었어요.' },
  { id: 'slime', name: '덩굴 슬라임 인형', sprite: 'prop-doll-slime', desc: '덩굴 슬라임처럼 말랑해요.\n꼭 안으면 기분이 좋아요.' },
  { id: 'bug', name: '버그 벌레 인형', sprite: 'prop-doll-bug', desc: '0과 1 무늬 버그 벌레예요.\n이제는 버그를 찾아 줘요.' },
  { id: 'bat', name: '메아리 박쥐 인형', sprite: 'prop-doll-bat', desc: '메아리 박쥐를 닮은 인형이에요.\n날개가 보들보들해요.' },
  { id: 'guardian', name: '숲 수호자 인형', sprite: 'prop-doll-guardian', desc: '숲 수호자를 작게 만들었어요.\n이끼 머리가 보송보송해요.' },
  { id: 'robi', name: '로비 인형', sprite: 'prop-doll-robi', desc: '로비를 꼭 닮은 인형이에요.\n안테나가 반짝여요.' },
];

export const DOLL_BY_ID: ReadonlyMap<string, DollDef> = new Map(DOLLS.map((d) => [d.id, d]));

const ARROWS: Cmd[] = ['up', 'down', 'left', 'right', 'grab'];
const TURNS: Cmd[] = ['forward', 'turnLeft', 'turnRight', 'grab'];
/** 앞으로·돌기 판: 1장 '빠진 돌기 블록'을 끝냈거나 1장 부품(바퀴 모터)이 있으면 */
const TURN_UNLOCK = { mission: 'ch1-p3-m2', part: 'wheel' };
const TURN_LOCKED = '1장에서 돌기를 배우면\n이 판이 열려요.';
/** 반복 판: 2장 '긴 굴'을 끝냈거나 2장 부품(메모리 칩)이 있으면 */
const REPEAT_UNLOCK = { mission: 'ch2-p2-m1', part: 'memoryChip' };
const REPEAT_LOCKED = '2장에서 반복을 배우면\n이 판이 열려요.';

/** 위쪽 = 기계 안쪽. E 출구에서 출발해요. 판 번호 순서대로 블록이 늘어요(화살표 → 앞으로·돌기 → 반복). */
export const CLAW_ROUNDS: ClawRound[] = [
  {
    id: 'r1',
    title: '첫 인형',
    grid: ['.....', '..a..', '....b', 'E....'],
    dolls: { a: 'dummy', b: 'slime' },
    target: 'dummy',
    palette: ARROWS,
    optimal: 5,
    intro: '주문 카드의 인형을 뽑아 봐요.\n화살표로 옮기고 집기!',
    hint: '인형 바로 위에서 집기를 놓아요.\n칸 수를 손가락으로 세어 봐요.',
  },
  {
    id: 'r2',
    title: '상자 피하기',
    grid: ['..b..', '.###.', '..a..', 'E....'],
    dolls: { a: 'dummy', b: 'slime' },
    target: 'slime',
    palette: ARROWS,
    optimal: 6,
    intro: '큰 상자에 부딪히면 멈춰요.\n상자를 비켜 가요.',
    hint: '왼쪽 줄로 먼저 올라가 봐요.\n상자 줄 위로 지나가면 돼요.',
  },
  {
    id: 'r3',
    title: '돌아서 가기',
    grid: ['.....', '....c', '.a...', 'E....'],
    dolls: { a: 'dummy', c: 'bug' },
    target: 'bug',
    startDir: 'up',
    palette: TURNS,
    optimal: 8,
    unlock: TURN_UNLOCK,
    lockedText: TURN_LOCKED,
    intro: '이제 집게는 보는 쪽으로 가요.\n돌기 블록으로 방향을 바꿔요.',
    hint: '먼저 두 칸 앞으로 가요.\n그다음 오른쪽으로 돌아요.',
  },
  {
    id: 'r4',
    title: '꼬불꼬불 길',
    grid: ['..a.d', '###..', '....#', 'E....'],
    dolls: { a: 'slime', d: 'bat' },
    target: 'bat',
    startDir: 'up',
    palette: TURNS,
    optimal: 11,
    unlock: TURN_UNLOCK,
    lockedText: TURN_LOCKED,
    intro: '꼬불꼬불 길이에요.\n어디서 돌지 먼저 세어 봐요.',
    hint: '상자가 없는 넷째 줄로 올라가요.\n돌 때마다 보는 쪽을 확인해요.',
  },
  {
    id: 'r5',
    title: '긴 레일',
    grid: ['.....e', '......', '..b...', 'E....c'],
    dolls: { b: 'bug', c: 'bat', e: 'guardian' },
    target: 'guardian',
    startDir: 'up',
    palette: TURNS,
    allowRepeat: true,
    optimal: 6,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '같은 블록이 줄지어 있나요?\n반복 블록으로 줄여 봐요.',
    hint: '앞으로 3번, 돌기, 앞으로 5번!\n반복 블록 두 개면 돼요.',
  },
  {
    id: 'r6',
    title: '상자 계단',
    grid: ['##.fd', '#..#.', '..##.', 'E###.'],
    dolls: { d: 'bat', f: 'robi' },
    target: 'robi',
    startDir: 'up',
    palette: TURNS,
    allowRepeat: true,
    optimal: 6,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '계단 모양 길이 되풀이돼요.\n되풀이되는 묶음을 찾아봐요.',
    hint: '앞으로, 오른쪽 돌기, 앞으로,\n왼쪽 돌기를 3번 반복해요.',
  },
];

/** 인형을 뽑았다는 플래그(공방 방석의 인형이 보여요) */
export const dollFlag = (id: string): string => `doll:${id}`;

/** 판이 쓰는 블록 묶음 이름(판 고르기 카드) */
export function clawTier(round: ClawRound): string {
  if (round.allowRepeat) return '앞으로·돌기 + 반복';
  return round.palette.includes('forward') ? '앞으로·돌기' : '화살표';
}
