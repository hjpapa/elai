import type { Block, Cmd, Cond, LightRound } from '../../data/schema';
import { run, type Env } from '../../missions/core/interpreter';

/** 이번 걸음에서 생긴 일 */
export type LightEvent = 'light' | 'wrongLight' | 'noBulb' | 'move' | 'nextRow' | 'offBoard' | 'none';

export interface LightFrame {
  /** 이 걸음 뒤 붓의 자리(x = 너비면 줄 끝, y = 높이면 판 아래) */
  x: number;
  y: number;
  /** 이번 걸음의 명령 위치(편집기 강조용) */
  path: string;
  event: LightEvent;
  /** offBoard: 나가려던 쪽(앞으로 = 오른쪽, 다음 줄 = 아래) */
  toward?: 'right' | 'down';
}

/**
 * success: 그림이 맞게 켜졌어요 · wrongLight: 0인 전구를 켰어요 · noBulb: 전구가 없는 곳(줄 끝·판 아래)에서 켰어요
 * offBoard: 붓이 판 밖으로 나가요 · missing: 켜지 않은 1이 남았어요 · tooLong: 너무 오래 돌아요
 */
export type LightOutcome = 'success' | 'wrongLight' | 'noBulb' | 'offBoard' | 'missing' | 'tooLong';

type Stop = 'wrongLight' | 'noBulb' | 'offBoard';

/**
 * 전구판 하나. 불빛 붓이 왼쪽 위 전구에서 오른쪽을 보고 출발해요.
 * '앞으로'는 줄 끝(마지막 전구 오른쪽)까지, '다음 줄'은 판 아래(마지막 줄 다음)까지 갈 수 있어요.
 * 0인 전구를 켜거나, 전구가 없는 곳에서 켜거나, 판 밖으로 나가면 그 자리에서 멈춰요. 같은 프로그램이면 언제나 같은 결과예요.
 */
export class LightEnv implements Env {
  readonly width: number;
  readonly height: number;
  x = 0;
  y = 0;
  /** 켠 전구(줄마다) */
  readonly lit: boolean[][];
  readonly frames: LightFrame[] = [];
  private stop: Stop | null = null;

  constructor(private readonly picture: readonly string[]) {
    this.height = picture.length;
    this.width = picture[0]?.length ?? 0;
    this.lit = picture.map((row) => [...row].map(() => false));
  }

  /** 그 자리 전구의 숫자(전구가 없으면 undefined) */
  code(x: number, y: number): '0' | '1' | undefined {
    const c = this.picture[y]?.[x];
    return c === '0' || c === '1' ? c : undefined;
  }

  private push(event: LightEvent, path: string, toward?: 'right' | 'down'): void {
    this.frames.push({ x: this.x, y: this.y, path, event, ...(toward ? { toward } : {}) });
  }

  private halt(stop: Stop, path: string, toward?: 'right' | 'down'): void {
    this.stop = stop;
    this.push(stop, path, toward);
  }

  exec(cmd: Cmd, path: string): void {
    switch (cmd) {
      case 'lightOn': {
        const c = this.code(this.x, this.y);
        if (c === undefined) return this.halt('noBulb', path);
        if (c === '0') return this.halt('wrongLight', path);
        this.lit[this.y][this.x] = true;
        this.push('light', path);
        return;
      }
      case 'forward':
        // 줄 끝까지는 갈 수 있어요. 판 아래(다 그린 뒤)에서는 더 갈 곳이 없어요.
        if (this.x >= this.width || this.y >= this.height) return this.halt('offBoard', path, 'right');
        this.x++;
        this.push('move', path);
        return;
      case 'nextRow':
        if (this.y >= this.height) return this.halt('offBoard', path, 'down');
        this.y++;
        this.x = 0;
        this.push('nextRow', path);
        return;
      default:
        // 다른 놀이의 명령은 전구판에 아무 일도 하지 않아요.
        this.push('none', path);
    }
  }

  test(cond: Cond): boolean {
    return cond === 'codeOne' && this.code(this.x, this.y) === '1';
  }

  halted(): boolean {
    return this.stop !== null;
  }

  /** 아직 켜지 않은 1의 수 */
  missing(): number {
    let n = 0;
    this.picture.forEach((row, y) => [...row].forEach((c, x) => { if (c === '1' && !this.lit[y][x]) n++; }));
    return n;
  }

  outcome(truncated: boolean): LightOutcome {
    if (this.stop) return this.stop;
    if (this.missing() > 0) return truncated ? 'tooLong' : 'missing';
    return 'success';
  }
}

export interface LightRun {
  /** 그림마다 걸음과 결과(처음 실패한 그림까지만 의미가 있어요) */
  pictures: { frames: LightFrame[]; outcome: LightOutcome; lit: boolean[][] }[];
  outcome: LightOutcome;
  /** 처음 실패한 그림(모두 맞으면 -1) */
  failedPicture: number;
}

/** 판의 모든 그림을 같은 프로그램으로 켜요. 모든 그림이 맞아야 성공이에요. */
export function runLight(round: LightRound, program: Block[]): LightRun {
  const pictures = round.pictures.map((picture) => {
    const env = new LightEnv(picture);
    const r = run(program, env);
    return { frames: env.frames, outcome: env.outcome(r.truncated), lit: env.lit };
  });
  const failedPicture = pictures.findIndex((p) => p.outcome !== 'success');
  return { pictures, outcome: failedPicture < 0 ? 'success' : pictures[failedPicture].outcome, failedPicture };
}
