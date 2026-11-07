import type { ClawRound, Cmd, Cond, Dir, Point } from '../../data/schema';
import type { Env } from '../../missions/core/interpreter';

/** 이번 걸음에서 생긴 일 */
export type ClawEvent = 'move' | 'turn' | 'bump' | 'grab' | 'none';

export interface ClawFrame {
  x: number;
  y: number;
  dir: Dir;
  /** 이번 걸음의 명령 위치(편집기 강조용) */
  path: string;
  event: ClawEvent;
  /** grab: 집은 인형 id(빈 곳이면 null) */
  doll?: string | null;
}

/**
 * success: 주문한 인형을 집었어요 · bump: 큰 상자나 기계 벽에 부딪혔어요 · empty: 빈 곳을 집었어요
 * wrongDoll: 다른 인형을 집었어요 · noGrab: 집지 않고 프로그램이 끝났어요 · tooLong: 너무 오래 돌아요
 */
export type ClawOutcome = 'success' | 'bump' | 'empty' | 'wrongDoll' | 'noGrab' | 'tooLong';

const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

/**
 * 인형뽑기 기계 바닥(위에서 본 격자, 위 = 안쪽). 집게가 학생 프로그램대로 한 칸씩 움직여요.
 * 집게는 인형 위로는 지나가지만 큰 상자와 기계 벽에는 부딪혀요. 집기를 하면 그 칸에서 내려가 집고,
 * 프로그램이 끝나요(집게가 저절로 출구로 돌아와요). 같은 프로그램이면 언제나 같은 결과예요.
 */
export class ClawEnv implements Env {
  readonly width: number;
  readonly height: number;
  /** 출구(집게가 출발하고 인형을 떨어뜨리는 곳) */
  readonly exit: Point;
  x: number;
  y: number;
  dir: Dir;
  readonly frames: ClawFrame[] = [];
  bumped = false;
  /** 아직 집지 않았으면 undefined, 빈 곳을 집었으면 null, 아니면 집은 인형 id */
  grabbed: string | null | undefined = undefined;

  constructor(private readonly round: ClawRound) {
    this.height = round.grid.length;
    this.width = round.grid[0]?.length ?? 0;
    let exit: Point = { x: 0, y: this.height - 1 };
    round.grid.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'E') exit = { x, y }; }));
    this.exit = exit;
    this.x = exit.x;
    this.y = exit.y;
    this.dir = round.startDir ?? 'up';
  }

  cell(x: number, y: number): string | undefined {
    return this.round.grid[y]?.[x];
  }

  /** 그 칸의 인형 id(없으면 undefined) */
  dollAt(x: number, y: number): string | undefined {
    const c = this.cell(x, y);
    return c && /^[a-z]$/.test(c) ? this.round.dolls[c] : undefined;
  }

  blocked(x: number, y: number): boolean {
    const c = this.cell(x, y);
    return c === undefined || c === '#';
  }

  private push(event: ClawEvent, path: string, doll?: string | null): void {
    this.frames.push({ x: this.x, y: this.y, dir: this.dir, path, event, ...(doll !== undefined ? { doll } : {}) });
  }

  private move(d: Dir, path: string): void {
    const [dx, dy] = DELTA[d];
    const nx = this.x + dx;
    const ny = this.y + dy;
    if (this.blocked(nx, ny)) {
      this.bumped = true;
      this.push('bump', path);
      return;
    }
    this.x = nx;
    this.y = ny;
    this.push('move', path);
  }

  exec(cmd: Cmd, path: string): void {
    switch (cmd) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        this.dir = cmd;
        this.move(cmd, path);
        return;
      case 'forward':
        this.move(this.dir, path);
        return;
      case 'turnLeft':
        this.dir = DIRS[(DIRS.indexOf(this.dir) + 3) % 4];
        this.push('turn', path);
        return;
      case 'turnRight':
        this.dir = DIRS[(DIRS.indexOf(this.dir) + 1) % 4];
        this.push('turn', path);
        return;
      case 'grab':
        this.grabbed = this.dollAt(this.x, this.y) ?? null;
        this.push('grab', path, this.grabbed);
        return;
      default:
        // 퍼즐·전투 명령은 집게에게 아무 일도 하지 않아요.
        this.push('none', path);
    }
  }

  private ahead(turn: 0 | 1 | 3): [number, number] {
    const [dx, dy] = DELTA[DIRS[(DIRS.indexOf(this.dir) + turn) % 4]];
    return [this.x + dx, this.y + dy];
  }

  test(cond: Cond): boolean {
    switch (cond) {
      case 'wallAhead':
        return this.blocked(...this.ahead(0));
      case 'pathAhead':
        return !this.blocked(...this.ahead(0));
      case 'pathLeft':
        return !this.blocked(...this.ahead(3));
      case 'pathRight':
        return !this.blocked(...this.ahead(1));
      default:
        return false;
    }
  }

  halted(): boolean {
    return this.bumped || this.grabbed !== undefined;
  }

  outcome(truncated: boolean): ClawOutcome {
    if (this.bumped) return 'bump';
    if (this.grabbed === undefined) return truncated ? 'tooLong' : 'noGrab';
    if (this.grabbed === null) return 'empty';
    return this.grabbed === this.round.target ? 'success' : 'wrongDoll';
  }
}
