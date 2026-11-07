import type { Block, Cmd, Cond, SortItem, SortRound, SortSide } from '../../data/schema';
import { run, type Env } from '../../missions/core/interpreter';

/** 이번 걸음에서 생긴 일: 보냄, 빈 벨트에서 보내려 함, 아무 일 없음 */
export type SortEvent = 'send' | 'empty' | 'none';

export interface SortFrame {
  /** 이번 걸음의 명령 위치(편집기 강조용) */
  path: string;
  event: SortEvent;
  /** send: 보낸 물건과 바구니, 주문 카드대로 보냈는지 */
  item?: SortItem;
  side?: SortSide;
  correct?: boolean;
  /** 이 걸음 뒤 벨트에 남은 물건 수 */
  left: number;
}

/**
 * success: 모두 맞게 나눴어요 · wrongBin: 다른 바구니로 보냈어요 · emptyBelt: 보낼 물건이 없는데 보냈어요
 * leftover: 물건이 남았어요 · tooLong: 너무 오래 돌아요
 */
export type SortOutcome = 'success' | 'wrongBin' | 'emptyBelt' | 'leftover' | 'tooLong';

/**
 * 택배 분류 벨트 하나. 보내기 블록 하나가 맨 앞 물건 하나를 바구니로 보내요.
 * 조건(하트 상자라면…)은 맨 앞 물건을 살펴봐요. 잘못 보내거나 빈 벨트에서 보내면 바로 멈춰요.
 */
export class SortEnv implements Env {
  readonly items: readonly SortItem[];
  /** 다음에 보낼 물건의 차례(= 이미 보낸 물건 수) */
  pos = 0;
  readonly frames: SortFrame[] = [];
  wrong = false;
  empty = false;

  constructor(
    private readonly round: SortRound,
    belt = 0,
  ) {
    this.items = round.belts[belt] ?? [];
  }

  /** 맨 앞 물건(없으면 undefined) */
  front(): SortItem | undefined {
    return this.items[this.pos];
  }

  exec(cmd: Cmd, path: string): void {
    if (cmd !== 'sendLeft' && cmd !== 'sendRight') {
      // 다른 놀이의 명령은 벨트에 아무 일도 하지 않아요.
      this.frames.push({ path, event: 'none', left: this.items.length - this.pos });
      return;
    }
    const item = this.front();
    if (!item) {
      this.empty = true;
      this.frames.push({ path, event: 'empty', left: 0 });
      return;
    }
    const side: SortSide = cmd === 'sendLeft' ? 'left' : 'right';
    const correct = this.round.rule[item] === side;
    this.pos++;
    if (!correct) this.wrong = true;
    this.frames.push({ path, event: 'send', item, side, correct, left: this.items.length - this.pos });
  }

  test(cond: Cond): boolean {
    const item = this.front();
    switch (cond) {
      case 'boxHeart':
        return item === 'heart';
      case 'boxStar':
        return item === 'star';
      case 'itemRound':
        return item === 'ball';
      default:
        return false;
    }
  }

  halted(): boolean {
    return this.wrong || this.empty;
  }

  outcome(truncated: boolean): SortOutcome {
    if (this.wrong) return 'wrongBin';
    if (this.empty) return 'emptyBelt';
    if (this.pos < this.items.length) return truncated ? 'tooLong' : 'leftover';
    return 'success';
  }
}

export interface SortRun {
  /** 줄마다 걸음과 결과(처음 실패한 줄까지만 의미가 있어요) */
  belts: { frames: SortFrame[]; outcome: SortOutcome }[];
  outcome: SortOutcome;
  /** 처음 실패한 줄(모두 맞으면 -1) */
  failedBelt: number;
}

/** 판의 모든 줄을 같은 프로그램으로 나눠요. 모든 줄이 맞아야 성공이에요. */
export function runSort(round: SortRound, program: Block[]): SortRun {
  const belts = round.belts.map((_, i) => {
    const env = new SortEnv(round, i);
    const r = run(program, env);
    return { frames: env.frames, outcome: env.outcome(r.truncated) };
  });
  const failedBelt = belts.findIndex((b) => b.outcome !== 'success');
  return { belts, outcome: failedBelt < 0 ? 'success' : belts[failedBelt].outcome, failedBelt };
}

/** 프로그램에 만약 블록이 있는지(줄이 바뀌는 판에서 "순서만 외운 프로그램"을 알아봐요) */
export function hasIf(program: Block[]): boolean {
  return program.some((b) => b.t === 'if' || (b.t === 'repeat' && hasIf(b.body)));
}
