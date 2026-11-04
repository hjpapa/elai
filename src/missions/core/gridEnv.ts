import type { BlockCodeData, Cmd, Cond, Dir } from '../../data/schema';
import type { Env } from './interpreter';

export interface GridFrame {
  x: number;
  y: number;
  dir: Dir;
  /** 이번 걸음의 명령 위치(편집기 강조용) */
  path: string;
  /** 이번 걸음에서 생긴 일 */
  event: 'move' | 'turn' | 'collect' | 'bump' | 'goal' | 'none';
  collected: number;
}

export type GridOutcome = 'success' | 'bump' | 'notReached' | 'missingGems' | 'tooLong';

const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

/** 블록 퍼즐의 판(위에서 본 격자). 로비가 움직이는 규칙을 정해요. */
export class GridEnv implements Env {
  readonly width: number;
  readonly height: number;
  readonly start: { x: number; y: number };
  readonly goal: { x: number; y: number };
  readonly gems: ReadonlySet<string>;
  x: number;
  y: number;
  dir: Dir;
  readonly collected = new Set<string>();
  readonly frames: GridFrame[] = [];
  bumped = false;
  arrived = false;
  private readonly explicitCollect: boolean;

  constructor(private readonly data: BlockCodeData) {
    this.height = data.grid.length;
    this.width = data.grid[0]?.length ?? 0;
    let start = { x: 0, y: 0 };
    let goal = { x: 0, y: 0 };
    const gems = new Set<string>();
    data.grid.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c === 'S') start = { x, y };
        else if (c === 'G') goal = { x, y };
        else if (c === '*') gems.add(`${x},${y}`);
      }),
    );
    this.start = start;
    this.goal = goal;
    this.gems = gems;
    this.x = start.x;
    this.y = start.y;
    this.dir = data.startDir ?? 'right';
    this.explicitCollect = data.palette.includes('collect');
  }

  cell(x: number, y: number): string | undefined {
    return this.data.grid[y]?.[x];
  }

  blocked(x: number, y: number): boolean {
    const c = this.cell(x, y);
    return c === undefined || c === '#' || c === '~';
  }

  private allGems(): boolean {
    return !this.data.mustCollect || this.collected.size === this.gems.size;
  }

  private moveTo(d: Dir, path: string): void {
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
    const key = `${nx},${ny}`;
    if (!this.explicitCollect && this.gems.has(key)) this.collected.add(key);
    if (nx === this.goal.x && ny === this.goal.y && this.allGems()) {
      this.arrived = true;
      this.push('goal', path);
      return;
    }
    this.push('move', path);
  }

  private push(event: GridFrame['event'], path: string): void {
    this.frames.push({ x: this.x, y: this.y, dir: this.dir, path, event, collected: this.collected.size });
  }

  exec(cmd: Cmd, path: string): void {
    switch (cmd) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        this.dir = cmd;
        this.moveTo(cmd, path);
        return;
      case 'forward':
        this.moveTo(this.dir, path);
        return;
      case 'turnLeft':
        this.dir = DIRS[(DIRS.indexOf(this.dir) + 3) % 4];
        this.push('turn', path);
        return;
      case 'turnRight':
        this.dir = DIRS[(DIRS.indexOf(this.dir) + 1) % 4];
        this.push('turn', path);
        return;
      case 'collect': {
        const key = `${this.x},${this.y}`;
        if (this.gems.has(key)) this.collected.add(key);
        this.push(this.gems.has(key) ? 'collect' : 'none', path);
        return;
      }
      default:
        // 전투 명령은 퍼즐에서 아무 일도 하지 않아요.
        this.push('none', path);
    }
  }

  private ahead(turn: 0 | 1 | 3): [number, number] {
    const d = DIRS[(DIRS.indexOf(this.dir) + turn) % 4];
    const [dx, dy] = DELTA[d];
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
      case 'onGem':
        return this.gems.has(`${this.x},${this.y}`) && !this.collected.has(`${this.x},${this.y}`);
      default:
        return false;
    }
  }

  halted(): boolean {
    return this.bumped || this.arrived;
  }

  outcome(truncated: boolean): GridOutcome {
    if (this.arrived) return 'success';
    if (this.bumped) return 'bump';
    if (truncated) return 'tooLong';
    if (this.x === this.goal.x && this.y === this.goal.y) return 'missingGems';
    return 'notReached';
  }
}
