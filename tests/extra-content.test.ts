import { expect, it } from 'vitest';
import { allMissions } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { evaluateTraining, trainSelection } from '../src/missions/train/evaluate';
import { evaluateSearch, searchGrid } from '../src/missions/classify/search';
import { GridEnv } from '../src/missions/core/gridEnv';
import { run } from '../src/missions/core/interpreter';
import type { Block } from '../src/data/schema';

const extras = allMissions().filter(e => e.mission.optional);

it('열한 선택 미션은 같은 파트 필수 미션 뒤에 있고 같은 NPC 한 명이 맡아요', () => {
  expect(extras).toHaveLength(11);
  for (const { mission, part } of extras) {
    const previous = part.missions[part.missions.indexOf(mission) - 1];
    expect(previous.optional, mission.id).toBeFalsy();
    expect(previous.npc).toBe(mission.npc);
    expect(part.missions.at(-1)?.id).toBe(mission.id);
    expect(Object.keys(mission.reward!)).toEqual(['coins']);
    expect(mission.reward!.coins).toBeGreaterThanOrEqual(5);
    expect(mission.reward!.coins).toBeLessThanOrEqual(10);
    const owners = Object.values(MAPS).flatMap(map => map.objects).filter(o => o.type === 'npc' && o.missions?.includes(mission.id));
    expect(owners, mission.id).toHaveLength(1);
    const npc = owners[0];
    if (npc.type !== 'npc') throw new Error(mission.id);
    expect(npc.npc).toBe(mission.npc);
    expect(npc.missions![npc.missions!.indexOf(mission.id) - 1]).toBe(previous.id);
  }
});

it('두 신호를 살핀 규칙은 통과하고 앞으로만 가면 멈춰요', () => {
  const m = extras.find(e => e.mission.kind === 'blockCode')!.mission;
  if (m.kind !== 'blockCode') throw new Error(m.id);
  const forward: Block = { t: 'cmd', cmd: 'forward' };
  for (const [program, pass] of [
    [[{ t: 'repeat', times: 9, body: [{ t: 'if', cond: 'signalRed', yes: [{ t: 'cmd', cmd: 'wait' }], no: [forward] }] }], true],
    [[forward, forward, forward, forward], false],
  ] as [Block[], boolean][]) {
    const env = new GridEnv(m.data!);
    expect(env.outcome(run(program, env).truncated) === 'success').toBe(pass);
  }
});

it('짧은 별길은 여덟 칸이고 아래쪽으로 돌아간 길은 실패해요', () => {
  const m = extras.find(e => e.mission.id === 'ch6-p1-x1')!.mission;
  if (m.kind !== 'classify') throw new Error(m.id);
  const grid = m.data!.cards[0].features, path = searchGrid(grid)!.path;
  expect(path.length - 1).toBe(8);
  expect(evaluateSearch(grid, path)).toBe(true);
  const longer = [1,2,3,4,5,6].map(y => ({ x: 1, y })).concat([2,3,4,5].map(x => ({ x, y: 6 })), { x: 5, y: 5 });
  expect(evaluateSearch(grid, longer)).toBe(false);
});

it('경계 표본은 네 번 중 세 번, 별똥별 예보는 합격 기준을 맞혀요', () => {
  for (const { mission: m } of extras) {
    if (m.kind !== 'train') continue;
    const d = m.data!, labels = Object.fromEntries(d.examples.map(e => [e.id, e.label]));
    expect(d.examples).toHaveLength(8);
    expect(d.tests).toHaveLength(4);
    const report = evaluateTraining(d, trainSelection(d, labels), labels);
    expect(report.success, m.id).toBe(true);
    if (m.id === 'ch5-p3-x1') expect(report.accuracy).toBe(0.75);
  }
});
