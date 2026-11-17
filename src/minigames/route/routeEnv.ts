import type { Block, Cmd, Cond, Point, RouteRound } from '../../data/schema';
import { run, type Env } from '../../missions/core/interpreter';

export type RouteDir = 'up' | 'right' | 'down' | 'left';

/** 이번 걸음에서 생긴 일: 화살표로 이동 · 물결 따라 이동 · 벽에 부딪힘 · 갈 곳 없음 · 다른 놀이의 블록 */
export type RouteEvent = 'move' | 'wave' | 'bump' | 'lost' | 'none';

export interface RouteFrame {
  /** 이 걸음 뒤 로봇의 자리 */
  x: number;
  y: number;
  /** 이번 걸음의 명령 위치(편집기 강조용) */
  path: string;
  event: RouteEvent;
  /** 이 걸음으로 깃발에 닿았어요 */
  arrive?: boolean;
  /** bump: 가려던 쪽 */
  toward?: RouteDir;
}

/**
 * success: 깃발에 닿았어요 · bump: 벽(바위)이나 판 밖으로 가려 했어요 · lost: 물결 숫자가 없는 칸이라 따라갈 곳이 없어요
 * notThere: 프로그램이 끝났는데 아직 깃발에 닿지 못했어요 · tooLong: 너무 오래 돌아요
 */
export type RouteOutcome = 'success' | 'bump' | 'lost' | 'notThere' | 'tooLong';

const STEP: Record<RouteDir, readonly [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

/** 물결 따라가기가 이웃을 살피는 차례예요. 작은 숫자가 둘이면 먼저 본 쪽으로 가요(어느 쪽이든 가장 짧은 길이에요). */
export const WAVE_ORDER: readonly RouteDir[] = ['up', 'right', 'down', 'left'];

const isDir = (cmd: Cmd): cmd is RouteDir => cmd === 'up' || cmd === 'right' || cmd === 'down' || cmd === 'left';

/** 미로에서 한 글자를 찾아요(출발 S, 깃발 G). 없으면 (0, 0)이에요. */
export function findMark(rows: readonly string[], mark: 'S' | 'G'): Point {
  for (let y = 0; y < rows.length; y++) {
    const x = rows[y].indexOf(mark);
    if (x >= 0) return { x, y };
  }
  return { x: 0, y: 0 };
}

/** 벽이거나 판 밖이면 true */
export function isWall(rows: readonly string[], x: number, y: number): boolean {
  const c = rows[y]?.[x];
  return c === undefined || c === '#';
}

/**
 * 물결 숫자: 깃발에서 물결을 퍼뜨려 칸마다 '깃발까지 몇 걸음'을 적어요(너비 우선 탐색, 6장 물결 탐색과 같아요).
 * 벽이나 물결이 닿지 않는 칸은 null이에요.
 */
export function waveNumbers(rows: readonly string[]): (number | null)[][] {
  const dist: (number | null)[][] = rows.map((row) => [...row].map(() => null));
  const goal = findMark(rows, 'G');
  if (isWall(rows, goal.x, goal.y)) return dist;
  dist[goal.y][goal.x] = 0;
  const queue: Point[] = [goal];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    const d = dist[p.y][p.x] ?? 0;
    for (const dir of WAVE_ORDER) {
      const [dx, dy] = STEP[dir];
      const x = p.x + dx;
      const y = p.y + dy;
      if (isWall(rows, x, y) || dist[y][x] !== null) continue;
      dist[y][x] = d + 1;
      queue.push({ x, y });
    }
  }
  return dist;
}

/**
 * 미로 하나. 로봇이 S에서 출발해요. 화살표는 그쪽으로 한 칸, '물결 따라가기'는 물결 숫자가 하나 작은 이웃 칸으로 한 칸 가요.
 * 깃발에 닿으면 그 자리에서 멈추고(남은 블록은 실행하지 않아요), 벽이나 판 밖으로 가려 하면 멈춰요. 같은 프로그램이면 언제나 같은 결과예요.
 */
export class RouteEnv implements Env {
  readonly width: number;
  readonly height: number;
  readonly start: Point;
  readonly goal: Point;
  readonly wave: (number | null)[][];
  x: number;
  y: number;
  readonly frames: RouteFrame[] = [];
  private stop: 'bump' | 'lost' | null = null;
  private arrived = false;

  constructor(private readonly rows: readonly string[]) {
    this.height = rows.length;
    this.width = rows[0]?.length ?? 0;
    this.start = findMark(rows, 'S');
    this.goal = findMark(rows, 'G');
    this.wave = waveNumbers(rows);
    this.x = this.start.x;
    this.y = this.start.y;
  }

  private push(event: RouteEvent, path: string, toward?: RouteDir): void {
    this.frames.push({ x: this.x, y: this.y, path, event, ...(this.arrived ? { arrive: true } : {}), ...(toward ? { toward } : {}) });
  }

  private step(dir: RouteDir, path: string, event: 'move' | 'wave'): void {
    const [dx, dy] = STEP[dir];
    const nx = this.x + dx;
    const ny = this.y + dy;
    if (isWall(this.rows, nx, ny)) {
      this.stop = 'bump';
      this.push('bump', path, dir);
      return;
    }
    this.x = nx;
    this.y = ny;
    this.arrived = nx === this.goal.x && ny === this.goal.y;
    this.push(event, path);
  }

  exec(cmd: Cmd, path: string): void {
    if (isDir(cmd)) return this.step(cmd, path, 'move');
    if (cmd === 'followWave') {
      const here = this.wave[this.y]?.[this.x];
      const dir =
        here === null || here === undefined
          ? undefined
          : WAVE_ORDER.find((d) => {
              const [dx, dy] = STEP[d];
              return this.wave[this.y + dy]?.[this.x + dx] === here - 1;
            });
      if (!dir) {
        this.stop = 'lost';
        this.push('lost', path);
        return;
      }
      return this.step(dir, path, 'wave');
    }
    // 다른 놀이의 명령은 미로에 아무 일도 하지 않아요.
    this.push('none', path);
  }

  test(_cond: Cond): boolean {
    return false;
  }

  halted(): boolean {
    return this.arrived || this.stop !== null;
  }

  outcome(truncated: boolean): RouteOutcome {
    if (this.arrived) return 'success';
    if (this.stop) return this.stop;
    return truncated ? 'tooLong' : 'notThere';
  }
}

export interface RouteRun {
  /** 미로마다 걸음과 결과(처음 실패한 미로까지만 의미가 있어요) */
  mazes: { frames: RouteFrame[]; outcome: RouteOutcome }[];
  outcome: RouteOutcome;
  /** 처음 실패한 미로(모두 도착하면 -1) */
  failedMaze: number;
}

/** 판의 모든 미로를 같은 프로그램으로 걸어요. 모든 미로에서 깃발에 닿아야 성공이에요. */
export function runRoute(round: RouteRound, program: Block[]): RouteRun {
  const mazes = round.mazes.map((rows) => {
    const env = new RouteEnv(rows);
    const r = run(program, env);
    return { frames: env.frames, outcome: env.outcome(r.truncated) };
  });
  const failedMaze = mazes.findIndex((m) => m.outcome !== 'success');
  return { mazes, outcome: failedMaze < 0 ? 'success' : mazes[failedMaze].outcome, failedMaze };
}

/** 출발점에서 물결 숫자를 따라 깃발까지 가는 가장 짧은 길(출발점 포함). 벽 지도·결과 그림에 써요. */
export function shortestPath(rows: readonly string[]): Point[] {
  const env = new RouteEnv(rows);
  run([{ t: 'repeat', times: rows.length * (rows[0]?.length ?? 0), body: [{ t: 'cmd', cmd: 'followWave' }] }], env);
  return env.outcome(false) === 'success' ? [env.start, ...env.frames.map((f) => ({ x: f.x, y: f.y }))] : [];
}

/** 프로그램에 이 명령이 있는지(미로가 바뀌는 판에서 "순서만 외운 프로그램"을 알아봐요) */
export function usesCmd(program: Block[], cmd: Cmd): boolean {
  return program.some((b) => (b.t === 'cmd' && b.cmd === cmd) || (b.t === 'repeat' && usesCmd(b.body, cmd)) || (b.t === 'if' && (usesCmd(b.yes, cmd) || usesCmd(b.no, cmd))));
}
