import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import type { Block, BlockCodeData, Cmd } from '../src/data/schema';
import { GridEnv } from '../src/missions/core/gridEnv';
import { blockAt, countBlocks, run } from '../src/missions/core/interpreter';

const cmd = (c: Cmd): Block => ({ t: 'cmd', cmd: c });
const seq = (...cs: Cmd[]) => cs.map(cmd);

function puzzle(id: string): BlockCodeData {
  const m = getMission(id)?.mission;
  if (m?.kind !== 'blockCode' || !m.data) throw new Error(id);
  return m.data;
}

function play(data: BlockCodeData, program: Block[]) {
  const env = new GridEnv(data);
  const r = run(program, env);
  return { env, outcome: env.outcome(r.truncated), steps: r.steps };
}

describe('인터프리터', () => {
  it('순서대로 실행하고 위치를 기록해요', () => {
    const data = puzzle('ch1-p1-m1');
    const { outcome, steps } = play(data, seq('right', 'right', 'right', 'right'));
    expect(outcome).toBe('success');
    expect(steps).toEqual(['0', '1', '2', '3']);
  });

  it('반복·만약 블록의 위치 표기와 블록 수', () => {
    const program: Block[] = [
      { t: 'repeat', times: 2, body: seq('right', 'down') },
      { t: 'if', cond: 'wallAhead', yes: seq('turnLeft'), no: seq('forward') },
    ];
    expect(countBlocks(program)).toBe(6);
    expect(blockAt(program, '0.1')).toEqual(cmd('down'));
    expect(blockAt(program, '1.n.0')).toEqual(cmd('forward'));
  });

  it('반복을 펼쳐서 실행해요', () => {
    const data: BlockCodeData = { intro: '', grid: ['S...G'], palette: ['right'], optimal: 1, hint: '' };
    const { outcome, steps } = play(data, [{ t: 'repeat', times: 4, body: seq('right') }]);
    expect(outcome).toBe('success');
    expect(steps).toEqual(['0.0', '0.0', '0.0', '0.0']);
  });

  it('조건으로 길을 따라가요(벽을 만나면 오른쪽으로 돌기)', () => {
    const data: BlockCodeData = {
      intro: '',
      grid: ['S..', '##.', 'G..'],
      startDir: 'right',
      palette: ['forward', 'turnLeft', 'turnRight'],
      allowRepeat: true,
      allowIf: ['pathAhead'],
      optimal: 4,
      hint: '',
    };
    const program: Block[] = [
      {
        t: 'repeat',
        times: 10,
        body: [{ t: 'if', cond: 'pathAhead', yes: seq('forward'), no: seq('turnRight') }],
      },
    ];
    // 앞으로 2칸 → 오른쪽으로 돌기 → 아래로 2칸 → 오른쪽으로 돌기 → 왼쪽으로 2칸 = 도착
    const { outcome, steps } = play(data, program);
    expect(outcome).toBe('success');
    expect(steps).toHaveLength(8);
  });

  it('무한 반복은 멈춰요', () => {
    const data: BlockCodeData = { intro: '', grid: ['S.G'], palette: ['turnLeft'], optimal: 1, hint: '' };
    const env = new GridEnv(data);
    const r = run([{ t: 'repeat', times: 10000, body: seq('turnLeft') }], env, 50);
    expect(r.truncated).toBe(true);
    expect(env.outcome(r.truncated)).toBe('tooLong');
  });
});

describe('1장 블록 퍼즐', () => {
  it('최단 풀이로 도착해요', () => {
    expect(play(puzzle('ch1-p1-m2'), seq('right', 'right', 'down', 'down', 'right', 'right')).outcome).toBe('success');
    expect(
      play(puzzle('ch1-p1-m3'), seq('right', 'right', 'down', 'down', 'right', 'right', 'down', 'down')).outcome,
    ).toBe('success');
  });

  it('막힌 칸으로 가면 부딪혀요', () => {
    const { outcome, env } = play(puzzle('ch1-p1-m2'), seq('down'));
    expect(outcome).toBe('bump');
    expect(env.frames.at(-1)?.event).toBe('bump');
  });

  it('디버깅 미션: 처음 프로그램은 실패하고, 고치면 성공해요', () => {
    const swap = puzzle('ch1-p3-m1');
    expect(play(swap, swap.initialProgram!).outcome).toBe('bump');
    expect(play(swap, seq('right', 'down', 'down', 'right', 'right', 'right')).outcome).toBe('success');

    // 빠진 돌기 블록: 아래로 간 뒤 오른쪽으로 돌아야(로비 기준) 깃발 쪽을 봐요.
    const missing = puzzle('ch1-p3-m2');
    expect(play(missing, missing.initialProgram!).outcome).toBe('bump');
    const fixed = seq('forward', 'forward', 'forward', 'turnRight', 'forward', 'forward', 'turnRight', 'forward', 'forward', 'forward');
    expect(play(missing, fixed).outcome).toBe('success');
    // 화면의 왼쪽으로 가야 해도, 아래를 보는 로비에게는 오른쪽 돌기예요.
    const wrongTurn = seq('forward', 'forward', 'forward', 'turnRight', 'forward', 'forward', 'turnLeft', 'forward');
    expect(play(missing, wrongTurn).outcome).toBe('bump');
  });

  it('돌기 블록은 제자리에서 보는 쪽만 바꾸고, 앞으로는 보는 쪽으로 가요', () => {
    const data: BlockCodeData = { intro: '', grid: ['...', '.S.', '...'], startDir: 'up', palette: ['forward', 'turnLeft', 'turnRight'], optimal: 1, hint: '', paint: ['...', '.x.', '...'] };
    const env = new GridEnv(data);
    run(seq('turnRight', 'turnRight', 'turnLeft'), env);
    expect([env.x, env.y, env.dir]).toEqual([1, 1, 'right']);
    expect(env.frames.map((f) => f.event)).toEqual(['turn', 'turn', 'turn']);
    run(seq('forward'), env);
    expect([env.x, env.y]).toEqual([2, 1]);
  });
});


describe('무늬 그리기', () => {
  const paint: BlockCodeData = { intro: '', grid: ['S..', '...'], paint: ['xxx', '...'], palette: ['right', 'down', 'left'], optimal: 2, hint: '' };
  it('시작 칸을 칠하고 정확히 같은 칸을 칠했을 때만 성공해요', () => {
    const result = play(paint, seq('right', 'right'));
    expect(result.outcome).toBe('success');
    expect([...result.env.painted]).toEqual(['0,0', '1,0', '2,0']);
  });
  it('덜 칠하거나 더 칠하면 실패해요', () => {
    expect(play(paint, seq('right')).outcome).toBe('wrongPaint');
    expect(play(paint, seq('right', 'right', 'down')).outcome).toBe('wrongPaint');
  });
  it('무늬를 완성해도 실행을 멈추지 않고 부딪힘을 확인해요', () => {
    expect(play(paint, seq('right', 'right', 'right')).outcome).toBe('bump');
    expect(play(paint, seq('right', 'right', 'left')).outcome).toBe('success');
  });
  it('같은 수의 다른 칸이나 제한 초과는 성공이 아니에요', () => {
    expect(play(paint, seq('down', 'right')).outcome).toBe('wrongPaint');
    const env = new GridEnv(paint);
    const result = run([{ t: 'repeat', times: 10, body: seq('turnRight') }], env, 3);
    expect(env.outcome(result.truncated)).toBe('tooLong');
  });
});


describe('신호 센서',()=>{
  const d: BlockCodeData = { intro:'',grid:['S!..G'],startDir:'right',palette:['forward','wait'],allowRepeat:true,allowIf:['signalRed'],optimal:4,hint:'' };
  it('빨간불에 바로 들어가면 실패하고 기다리면 지나가요',()=>{
    const wrong = play(d,seq('forward'));
    expect(wrong.outcome).toBe('bump');
    expect(wrong.env.frames.at(-1)?.signalRed).toBe(true);
    expect(play(d,seq('wait','forward','forward','forward','forward')).outcome).toBe('success');
  });
  it('같은 조건을 반복하며 신호를 살펴봐요',()=>{
    const p: Block[] = [{t:'repeat',times:8,body:[{t:'if',cond:'signalRed',yes:seq('wait'),no:seq('forward')}]}];
    expect(play(d,p).outcome).toBe('success');
  });
});
