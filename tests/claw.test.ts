import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { CLAW_ROUNDS, DOLLS, DOLL_BY_ID, clawTier, dollFlag } from '../src/data/minigames/claw';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { Block, ClawRound, Cmd, Dir } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { GameState, cleanMinigames, freshSave } from '../src/game/rpg/state';
import { ClawEnv } from '../src/minigames/claw/clawEnv';
import { minigameUnlocked } from '../src/minigames/progress';
import { countBlocks, run } from '../src/missions/core/interpreter';
import { CMD_LABEL, cmdIcon } from '../src/ui/labels';

const c = (cmd: Cmd): Block => ({ t: 'cmd', cmd });
const rep = (times: number, ...body: Block[]): Block => ({ t: 'repeat', times, body });
const fw = (n: number) => Array.from({ length: n }, () => c('forward'));
const round = (id: string) => CLAW_ROUNDS.find((r) => r.id === id)!;

function play(r: ClawRound, program: Block[]) {
  const env = new ClawEnv(r);
  const res = run(program, env);
  return { env, outcome: env.outcome(res.truncated) };
}

/** 판마다 별 3개짜리 풀이(블록 수 = optimal) */
const SOLUTIONS: Record<string, Block[]> = {
  r1: [c('right'), c('right'), c('up'), c('up'), c('grab')],
  r2: [c('up'), c('up'), c('up'), c('right'), c('right'), c('grab')],
  r3: [...fw(2), c('turnRight'), ...fw(4), c('grab')],
  r4: [c('turnRight'), ...fw(3), c('turnLeft'), ...fw(3), c('turnRight'), c('forward'), c('grab')],
  r5: [rep(3, c('forward')), c('turnRight'), rep(5, c('forward')), c('grab')],
  r6: [rep(3, c('forward'), c('turnRight'), c('forward'), c('turnLeft')), c('grab')],
};

const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
const DELTA: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

/** 반복 없이 명령만 늘어놓을 때 가장 짧은 풀이의 블록 수(집기 포함). 너비 우선 탐색이에요. */
function shortestPlain(r: ClawRound): number {
  const env = new ClawEnv(r);
  let goal = { x: -1, y: -1 };
  r.grid.forEach((row, y) => [...row].forEach((ch, x) => { if (r.dolls[ch] === r.target) goal = { x, y }; }));
  const start = { x: env.exit.x, y: env.exit.y, d: r.startDir ?? 'up' };
  const key = (s: { x: number; y: number; d: Dir }) => `${s.x},${s.y},${s.d}`;
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let depth = 0; frontier.length; depth++) {
    if (frontier.some((s) => s.x === goal.x && s.y === goal.y)) return depth + 1;
    const next: typeof frontier = [];
    for (const s of frontier) {
      const moves: { x: number; y: number; d: Dir }[] = [];
      for (const cmd of r.palette) {
        if (cmd === 'up' || cmd === 'down' || cmd === 'left' || cmd === 'right') {
          const [dx, dy] = DELTA[cmd];
          moves.push({ x: s.x + dx, y: s.y + dy, d: cmd });
        } else if (cmd === 'forward') {
          const [dx, dy] = DELTA[s.d];
          moves.push({ x: s.x + dx, y: s.y + dy, d: s.d });
        } else if (cmd === 'turnLeft' || cmd === 'turnRight') {
          moves.push({ ...s, d: DIRS[(DIRS.indexOf(s.d) + (cmd === 'turnLeft' ? 3 : 1)) % 4] });
        }
      }
      for (const m of moves) {
        if (env.blocked(m.x, m.y) || seen.has(key(m))) continue;
        seen.add(key(m));
        next.push(m);
      }
    }
    frontier = next;
  }
  return Infinity;
}

describe('인형뽑기 집게(ClawEnv)', () => {
  const r1 = round('r1');

  it('집게는 출구에서 출발해 화살표대로 움직이고, 주문한 인형을 집으면 성공해요', () => {
    const { env, outcome } = play(r1, SOLUTIONS.r1);
    expect(outcome).toBe('success');
    expect(env.frames.map((f) => f.event)).toEqual(['move', 'move', 'move', 'move', 'grab']);
    expect(env.frames.at(-1)).toMatchObject({ x: 2, y: 1, doll: 'dummy' });
  });

  it('집기를 하면 프로그램이 끝나요(뒤의 블록은 실행하지 않아요)', () => {
    const { env } = play(r1, [...SOLUTIONS.r1, c('left'), c('left')]);
    expect(env.frames).toHaveLength(5);
  });

  it('다른 인형·빈 곳을 집거나, 집지 않고 끝나면 실패해요', () => {
    // 덩굴 슬라임(4,2)은 주문한 인형이 아니에요.
    expect(play(r1, [c('right'), c('right'), c('right'), c('right'), c('up'), c('grab')]).outcome).toBe('wrongDoll');
    expect(play(r1, [c('right'), c('grab')]).outcome).toBe('empty');
    expect(play(r1, [c('right'), c('right'), c('up'), c('up')]).outcome).toBe('noGrab');
  });

  it('기계 벽과 큰 상자에 부딪히면 그 자리에서 멈춰요(인형 위로는 지나가요)', () => {
    const bumpWall = play(r1, [c('left'), c('grab')]);
    expect(bumpWall.outcome).toBe('bump');
    expect(bumpWall.env.frames).toEqual([expect.objectContaining({ event: 'bump', x: 0, y: 3 })]);
    // 2판: 가운데 위로 올라가면 상자 줄(1행)에 부딪혀요.
    expect(play(round('r2'), [c('right'), c('right'), c('up'), c('up'), c('grab')]).outcome).toBe('bump');
    // 인형 칸은 지나갈 수 있어요: 허수아비(2,1)를 지나 위로 가요.
    expect(play(r1, [c('right'), c('right'), c('up'), c('up'), c('up'), c('down'), c('grab')]).outcome).toBe('success');
  });

  it('앞으로·돌기: 보는 쪽으로 가고, 돌기는 방향만 바꿔요', () => {
    const r3 = round('r3');
    const { env } = play(r3, [c('turnRight'), c('turnRight'), c('turnLeft'), c('forward')]);
    expect(env.frames.map((f) => f.dir)).toEqual(['right', 'down', 'right', 'right']);
    expect(env.frames.at(-1)).toMatchObject({ x: 1, y: 3, event: 'move' });
  });

  it('끝없이 도는 프로그램은 멈추고 "너무 오래"로 알려 줘요', () => {
    expect(play(round('r5'), [rep(9, rep(9, rep(9, c('turnLeft'))))]).outcome).toBe('tooLong');
  });

  it('같은 프로그램은 언제나 같은 결과예요(운이 없어요)', () => {
    for (const r of CLAW_ROUNDS) {
      const a = play(r, SOLUTIONS[r.id]);
      const b = play(r, SOLUTIONS[r.id]);
      expect(b.env.frames, r.id).toEqual(a.env.frames);
      expect(b.outcome, r.id).toBe(a.outcome);
    }
  });
});

describe('인형뽑기 판 데이터', () => {
  it('판마다 격자·출구·인형이 올바르고, 주문한 인형이 판에 하나 있어요', () => {
    const ids = new Set(DOLLS.map((d) => d.id));
    expect(ids.size).toBe(DOLLS.length);
    for (const r of CLAW_ROUNDS) {
      const w = r.grid[0].length;
      for (const row of r.grid) expect(row.length, r.id).toBe(w);
      const cells = r.grid.join('');
      expect([...cells].filter((ch) => ch === 'E'), r.id).toHaveLength(1);
      for (const ch of cells) expect(/[.#E]/.test(ch) || (/[a-z]/.test(ch) && ids.has(r.dolls[ch])), `${r.id}: '${ch}'`).toBe(true);
      expect([...cells].filter((ch) => r.dolls[ch] === r.target), r.id).toHaveLength(1);
      expect(r.palette, r.id).toContain('grab');
    }
  });

  it('판마다 다른 인형을 주고, 인형 6개를 모두 모을 수 있어요', () => {
    expect(new Set(CLAW_ROUNDS.map((r) => r.target)).size).toBe(CLAW_ROUNDS.length);
    expect(DOLLS.every((d) => CLAW_ROUNDS.some((r) => r.target === d.id))).toBe(true);
  });

  it('별 3개 풀이가 있고(블록 수 = optimal), 반복 없이 쓰는 판은 그보다 짧은 풀이가 없어요', () => {
    for (const r of CLAW_ROUNDS) {
      const program = SOLUTIONS[r.id];
      expect(play(r, program).outcome, r.id).toBe('success');
      expect(countBlocks(program), r.id).toBe(r.optimal);
      const plain = shortestPlain(r);
      if (r.allowRepeat) {
        // 반복 판: 반복을 써야 별 3개예요(학습 우회 방지).
        expect(plain, r.id).toBeGreaterThan(r.optimal);
      } else {
        expect(plain, r.id).toBe(r.optimal);
      }
      // 풀이에 쓴 블록은 그 판의 블록 묶음 안에 있어요.
      const used = JSON.stringify(program);
      for (const cmd of Object.keys(CMD_LABEL) as Cmd[]) if (used.includes(`"${cmd}"`)) expect(r.palette, `${r.id}: ${cmd}`).toContain(cmd);
    }
  });

  it('블록은 배운 차례로 늘어요: 화살표 → 앞으로·돌기 → 반복', () => {
    expect(CLAW_ROUNDS.map(clawTier)).toEqual(['화살표', '화살표', '앞으로·돌기', '앞으로·돌기', '앞으로·돌기 + 반복', '앞으로·돌기 + 반복']);
    // 판이 열리는 조건(미션·로비 부품)은 실제로 있어요.
    for (const r of CLAW_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      if (r.unlock.part) expect(ROBI_PARTS[r.unlock.part], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    // 앞으로·돌기 판은 1장에서 돌기를 배운 뒤, 반복 판은 2장에서 반복을 배운 뒤 열려요.
    const turnMission = getMission('ch1-p3-m2')?.mission;
    expect(turnMission?.kind === 'blockCode' ? turnMission.data?.palette : []).toContain('turnLeft');
    const repeatMission = getMission('ch2-p2-m1')?.mission;
    expect(repeatMission?.kind === 'blockCode' ? repeatMission.data?.allowRepeat : false).toBe(true);
  });

  it('그림 키와 블록 카드가 목록에 있어요', () => {
    for (const d of DOLLS) expect(ASSET_BY_KEY.get(d.sprite), d.id).toMatchObject({ kind: 'prop', w: 16, h: 16 });
    for (const key of ['prop-claw', 'icon-claw-exit', 'block-crate', cmdIcon('grab')]) expect(ASSET_BY_KEY.has(key), key).toBe(true);
    expect(CMD_LABEL.grab).toBe('집기');
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요', () => {
    const texts = [
      ...CLAW_ROUNDS.flatMap((r) => [r.intro, r.hint, r.lockedText ?? '', r.title]),
      ...DOLLS.flatMap((d) => [d.desc, d.name]),
    ];
    for (const t of texts) {
      const rows = t.split('\n');
      expect(rows.length, t).toBeLessThanOrEqual(2);
      for (const row of rows) expect(row.length, row).toBeLessThanOrEqual(22);
      expect(/죽|처치|피를|코인|동전을 넣/.test(t), t).toBe(false);
    }
  });
});

describe('인형뽑기 기록과 열림', () => {
  it('판 기록은 가장 좋은 별만 남기고, 처음 성공과 별이 오른 것을 알려 줘요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(s.recordMinigame('claw', 'r1', 2)).toEqual({ first: true, improved: false });
    expect(s.recordMinigame('claw', 'r1', 1)).toEqual({ first: false, improved: false });
    expect(s.data.minigames?.claw?.r1).toBe(2);
    expect(s.recordMinigame('claw', 'r1', 3)).toEqual({ first: false, improved: true });
    expect(s.data.minigames?.claw?.r1).toBe(3);
  });

  it('인형 보상은 플래그로 남고, 경험치·동전은 그대로예요', () => {
    const s = new GameState(freshSave('별빛'));
    const before = { xp: s.data.xp, coins: s.data.coins, level: s.data.level };
    s.applyReward({ flags: [dollFlag('dummy')] });
    expect(s.hasFlag('doll:dummy')).toBe(true);
    expect({ xp: s.data.xp, coins: s.data.coins, level: s.data.level }).toEqual(before);
  });

  it('저장된 기록에서 1~3 정수 별만 읽어요', () => {
    expect(cleanMinigames({ claw: { r1: 3, r2: 0, r3: 2.5, r4: '3', r5: 4, r6: 1 }, bad: 5, list: [] })).toEqual({ claw: { r1: 3, r6: 1 } });
    expect(cleanMinigames(null)).toEqual({});
    const save = { ...freshSave('별빛'), minigames: { claw: { r1: 9 } } };
    expect(new GameState(save).data.minigames).toEqual({ claw: {} });
  });

  it('앞으로·돌기 판은 1장 돌기 미션 뒤에, 건너뛴 학생은 바퀴 모터로 열려요', () => {
    const s = new GameState(freshSave('별빛'));
    const turn = round('r3').unlock;
    expect(minigameUnlocked(s, round('r1').unlock)).toBe(true);
    expect(minigameUnlocked(s, turn)).toBe(false);
    s.completeMission('ch1-p3-m2', { success: true, stars: 3, attempts: 1, hints: 0 });
    expect(minigameUnlocked(s, turn)).toBe(true);
    const skipped = new GameState(freshSave('바다'));
    skipped.data.robiParts.push('wheel', 'memoryChip');
    expect(minigameUnlocked(skipped, turn)).toBe(true);
    expect(minigameUnlocked(skipped, round('r6').unlock)).toBe(true);
  });

  it('인형 하나는 한 판의 보상이에요(이름·그림 찾기)', () => {
    for (const r of CLAW_ROUNDS) expect(DOLL_BY_ID.get(r.target)?.sprite.startsWith('prop-doll-'), r.id).toBe(true);
  });
});
