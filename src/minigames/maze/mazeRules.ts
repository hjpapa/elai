import type { MazeRound } from '../../data/schema';
import { isWall, shortestPath, waveNumbers } from '../route/routeEnv';

export const SIZE = 7;

export function checkMaze(rows: readonly string[]) {
  const size = rows.length === SIZE && rows.every(row => /^[.#SG]{7}$/.test(row));
  const cells = rows.join('');
  const marks = size && cells.split('S').length === 2 && cells.split('G').length === 2;
  const path = marks ? shortestPath(rows) : [];
  const connected = path.length > 0;
  let deadEnds = 0;
  if (marks) {
    const wave = waveNumbers(rows);
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (rows[y][x] !== '.' || wave[y][x] === null) continue;
      const exits = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !isWall(rows, x + dx, y + dy));
      if (exits.length === 1) deadEnds++;
    }
  }
  const detour = path.slice(1, -1).some(({ x, y }) => {
    const copy = [...rows];
    copy[y] = copy[y].slice(0, x) + '#' + copy[y].slice(x + 1);
    return shortestPath(copy).length > 0;
  });
  return { size, marks, connected, steps: Math.max(0, path.length - 1), deadEnds, detour };
}

export function designFits(round: MazeRound, stats: ReturnType<typeof checkMaze>): boolean {
  return stats.connected && stats.steps >= round.steps && stats.deadEnds >= (round.deadEnds ?? 0) && (!round.detour || stats.detour);
}
