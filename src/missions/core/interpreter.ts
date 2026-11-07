import type { Block, Cmd, Cond } from '../../data/schema';

/**
 * 블록 프로그램을 실행하는 곳. 퍼즐(GridEnv)과 전투(BattleEnv)가 같은 규칙으로 실행돼요.
 * exec 한 번 = 한 걸음(퍼즐) 또는 한 차례(전투).
 */
export interface Env {
  exec(cmd: Cmd, path: string): void;
  test(cond: Cond): boolean;
  /** 더 실행하지 않아도 될 때(도착, 충돌, 전투 끝, 차례 다 씀) */
  halted(): boolean;
}

export interface RunResult {
  /** 실행한 명령 블록의 위치(편집기 강조용), exec 순서대로 */
  steps: string[];
  /** 너무 많이 실행해서 멈췄는지(무한 반복 방지) */
  truncated: boolean;
}

/**
 * 블록 위치 표기: 맨 위 목록의 i번째 = "i", 반복 안 = "i.j",
 * 만약의 "예" 쪽 = "i.y.j", "아니요" 쪽 = "i.n.j".
 */
export function run(program: Block[], env: Env, maxSteps = 300): RunResult {
  const steps: string[] = [];
  let truncated = false;
  // 명령을 실행하지 않는 빈 반복·조건도 작업량을 써요. 명령 수·위치 기록은 그대로 둬요.
  let workLeft = Math.max(10_000, maxSteps * 100);
  const shouldStop = (): boolean => {
    if (env.halted() || truncated) return true;
    if (workLeft-- > 0) return false;
    truncated = true;
    return true;
  };

  const walk = (blocks: Block[], prefix: string): void => {
    for (let i = 0; i < blocks.length; i++) {
      if (shouldStop()) return;
      const b = blocks[i];
      const path = prefix ? `${prefix}.${i}` : `${i}`;
      if (b.t === 'cmd') {
        if (steps.length >= maxSteps) {
          truncated = true;
          return;
        }
        steps.push(path);
        env.exec(b.cmd, path);
      } else if (b.t === 'repeat') {
        for (let k = 0; k < b.times; k++) {
          if (shouldStop()) return;
          walk(b.body, path);
        }
      } else {
        if (env.test(b.cond)) walk(b.yes, `${path}.y`);
        else walk(b.no, `${path}.n`);
      }
    }
  };

  walk(program, '');
  return { steps, truncated };
}

/** 블록 수(편집기에 놓인 블록 개수, 반복·만약 블록도 1개로 셈) */
export function countBlocks(program: Block[]): number {
  let n = 0;
  for (const b of program) {
    n++;
    if (b.t === 'repeat') n += countBlocks(b.body);
    else if (b.t === 'if') n += countBlocks(b.yes) + countBlocks(b.no);
  }
  return n;
}

/** 위치 표기로 블록 찾기 */
export function blockAt(program: Block[], path: string): Block | undefined {
  const parts = path.split('.');
  let list: Block[] = program;
  let found: Block | undefined;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === 'y' || p === 'n') {
      if (!found || found.t !== 'if') return undefined;
      list = p === 'y' ? found.yes : found.no;
      continue;
    }
    found = list[Number(p)];
    if (!found) return undefined;
    if (found.t === 'repeat') list = found.body;
  }
  return found;
}

/** 깊은 복사(편집기·초기 프로그램을 함께 쓰지 않도록) */
export function cloneProgram(program: Block[]): Block[] {
  return program.map((b): Block => {
    if (b.t === 'cmd') return { t: 'cmd', cmd: b.cmd };
    if (b.t === 'repeat') return { t: 'repeat', times: b.times, body: cloneProgram(b.body) };
    return { t: 'if', cond: b.cond, yes: cloneProgram(b.yes), no: cloneProgram(b.no) };
  });
}
