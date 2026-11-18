import type { MazeRound } from '../schema';

export const MAZE_TITLE = '미로 설계사';
export const MAZE_ROUNDS: MazeRound[] = [
  { id: 'r1', title: '첫 미로', intro: '벽을 눌러 길로 바꿔요.\n출발에서 깃발까지 이어요.', steps: 4 },
  { id: 'r2', title: '막다른 길', intro: '막다른 길은 끝이 막힌 길이에요.\n헷갈리는 길을 두 개 넣어요.', steps: 5, deadEnds: 2 },
  { id: 'r3', title: '두 갈래 길', intro: '한 칸이 막혀도 돌아갈 수 있게\n길을 두 갈래로 만들어요.', steps: 5, detour: true },
  { id: 'r4', title: '반복이 어울리는 길', intro: '같은 움직임이 되풀이되는 길을 만들어요.\n반복 블록으로 짧게 풀어요.', steps: 8, program: 'repeat', unlock: { mission: 'ch2-p2-m1', part: 'memoryChip' } },
  { id: 'r5', title: '물결로 찾는 길', intro: '깃발에서 퍼진 물결 숫자를 따라가요.\n헷갈리는 길이 있어도 괜찮아요.', steps: 8, deadEnds: 1, program: 'wave', unlock: { mission: 'ch6-p1-m1', part: 'predictModule' } },
  { id: 'r6', title: '친구 미로 풀기', intro: '친구에게 받은 코드를 넣어요.\n섬 친구의 미로도 풀 수 있어요.', steps: 1, program: 'share' },
];

export const ISLAND_MAZES = [
  { author: '솔', rows: ['#######','#S...G#','#######','#######','#######','#######','#######'] },
  { author: '나루', rows: ['#######','#S..###','###.###','#...###','#.#####','#....G#','#######'] },
  { author: '온유', rows: ['#######','#S....#','#.###.#','#...#.#','###.#.#','###..G#','#######'] },
];
