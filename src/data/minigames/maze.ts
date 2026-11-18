import type { MazeRound } from '../schema';

export const MAZE_TITLE = '미로 설계사';
export const MAZE_ROUNDS: MazeRound[] = [
  { id: 'r1', title: '첫 미로', steps: 4 },
  { id: 'r2', title: '막다른 길', steps: 5, deadEnds: 2 },
  { id: 'r3', title: '두 갈래 길', steps: 5, detour: true },
  { id: 'r4', title: '반복이 어울리는 길', steps: 8, program: 'repeat', unlock: { mission: 'ch2-p2-m1', part: 'memoryChip' } },
  { id: 'r5', title: '물결로 찾는 길', steps: 8, deadEnds: 1, program: 'wave', unlock: { mission: 'ch6-p1-m1', part: 'predictModule' } },
  { id: 'r6', title: '친구 미로 풀기', steps: 1, program: 'share' },
];

export const ISLAND_MAZES = [
  { author: '솔', rows: ['#######','#S...G#','#######','#######','#######','#######','#######'] },
  { author: '나루', rows: ['#######','#S..###','###.###','#...###','#.#####','#....G#','#######'] },
  { author: '온유', rows: ['#######','#S....#','#.###.#','#...#.#','###.#.#','###..G#','#######'] },
];
