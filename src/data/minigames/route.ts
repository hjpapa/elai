import type { Cmd, MinigameUnlock, RouteRound } from '../schema';

/**
 * 코딩 길찾기(마을 지도방). 미로에서 로봇을 깃발까지 데려가요.
 * 깃발에서 물결을 퍼뜨리면 칸마다 '깃발까지 몇 걸음'(물결 숫자)이 적혀요. 6장 '물결 탐색'을 프로그램으로 이어요.
 * 5·6판은 '물결 따라가기'(숫자가 하나 작은 칸으로 한 걸음)를 반복해서, 6판은 같은 프로그램으로 미로 세 개를 모두 풀어요.
 * 판을 처음 성공하면 지도방 왼쪽 벽 지도에 그 판의 길이 그려져요. 결과는 학생 프로그램대로만 정해지고, 운이나 코인은 쓰지 않아요.
 */
export const ROUTE_TITLE = '물결 길잡이';

/** 벽 지도 플래그(판마다 하나) */
export const routeFlag = (roundId: string): string => `route:${roundId}`;

const ARROWS: Cmd[] = ['up', 'down', 'left', 'right'];
const WAVE: Cmd[] = [...ARROWS, 'followWave'];
/** 반복 판: 2장 '긴 굴'을 끝냈거나 2장 부품(메모리 칩)이 있으면 */
const REPEAT_UNLOCK: MinigameUnlock = { mission: 'ch2-p2-m1', part: 'memoryChip' };
const REPEAT_LOCKED = '2장에서 반복을 배우면\n이 판이 열려요.';
/** 물결 판: 6장 '물결 탐색'을 끝냈거나 6장 부품(예측 모듈)이 있으면 */
const WAVE_UNLOCK: MinigameUnlock = { mission: 'ch6-p1-m1', part: 'predictModule' };
const WAVE_LOCKED = "6장 '물결 탐색'을 하면\n이 판이 열려요.";

/**
 * 판 번호 순서대로 블록이 늘어요: 화살표 → 가장 짧은 길(물결 보기) → 반복(2장) → 물결 따라가기(6장) → 미로 세 개.
 * 미로 글자: '#' 벽, '.' 길, 'S' 로봇 출발, 'G' 깃발.
 */
export const ROUTE_ROUNDS: RouteRound[] = [
  {
    id: 'r1',
    title: '첫 길',
    mazes: [['S.#', '#..', '##G']],
    palette: ARROWS,
    optimal: 4,
    intro: '로봇을 깃발까지 데려가요.\n바위는 지나갈 수 없어요.',
    hint: '오른쪽, 아래, 오른쪽, 아래!\n바위를 피해 가요.',
  },
  {
    id: 'r2',
    title: '두 갈래 길',
    mazes: [['S...#', '.##.#', '.#..G', '...##']],
    palette: ARROWS,
    optimal: 6,
    intro: '길이 두 갈래예요.\n더 짧은 길로 가 봐요.',
    hint: "'물결 보기'로 걸음 수를 봐요.\n숫자가 작아지는 쪽이 지름길!",
  },
  {
    id: 'r3',
    title: '긴 복도',
    mazes: [['S.....', '#####.', 'G.....']],
    palette: ARROWS,
    allowRepeat: true,
    optimal: 6,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '복도가 길어요.\n같은 걸음은 반복으로 묶어요.',
    hint: '오른쪽 5번, 아래 2번,\n왼쪽 5번을 반복으로!',
  },
  {
    id: 'r4',
    title: '계단 길',
    mazes: [['S.###', '#..##', '##..#', '###.G']],
    palette: ARROWS,
    allowRepeat: true,
    optimal: 3,
    unlock: REPEAT_UNLOCK,
    lockedText: REPEAT_LOCKED,
    intro: '계단처럼 꺾인 길이에요.\n되풀이되는 묶음을 찾아요.',
    hint: '오른쪽·아래를 한 묶음으로\n4번 반복하면 도착해요.',
  },
  {
    id: 'r5',
    title: '물결 따라가기',
    mazes: [['S.#...', '#.#.#.', '#...#.', '###.#.', 'G.....']],
    palette: WAVE,
    allowRepeat: true,
    maxRepeat: 12,
    showWave: true,
    optimal: 2,
    unlock: WAVE_UNLOCK,
    lockedText: WAVE_LOCKED,
    intro: '숫자는 깃발까지 걸음 수예요.\n작은 숫자 쪽으로 가 봐요.',
    hint: '물결 따라가기를 반복해요.\n숫자가 0이 되면 도착!',
  },
  {
    id: 'r6',
    title: '어떤 미로라도',
    mazes: [
      ['S..#.', '##.#.', '...#.', '.###.', '....G'],
      ['....G', '.###.', '.#...', '.#.##', 'S....'],
      ['#....', 'S.##.', '#.#..', '#...#', '##.G#'],
    ],
    palette: WAVE,
    allowRepeat: true,
    maxRepeat: 12,
    showWave: true,
    optimal: 2,
    unlock: WAVE_UNLOCK,
    lockedText: WAVE_LOCKED,
    intro: '미로가 세 번 바뀌어요.\n같은 프로그램으로 모두 가요.',
    hint: '물결 따라가기를 12번 반복!\n어느 미로든 지름길이에요.',
  },
];

/** 판이 쓰는 블록 묶음 이름(판 고르기 카드) */
export function routeTier(round: RouteRound): string {
  const parts = [round.palette.includes('followWave') ? '화살표 + 물결 따라가기' : '화살표'];
  if (round.allowRepeat) parts.push('반복');
  if (round.mazes.length > 1) parts.push('미로 세 개');
  return parts.join(' + ');
}
