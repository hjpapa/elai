import { describe, expect, it } from 'vitest';
import { CHAPTERS, allMissions } from '../src/data/chapters';
import { NPCS } from '../src/data/npcs';
import { ITEMS } from '../src/data/rpg/items';
import { MOBS } from '../src/data/rpg/mobs';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import { evaluateBinary, evaluateGroups, evaluateTable } from '../src/missions/classify/evaluate';
import { GridEnv } from '../src/missions/core/gridEnv';
import { countBlocks, run } from '../src/missions/core/interpreter';
import type { Block, BlockCodeData, Reward } from '../src/data/schema';

/** 절대 방향 이동만 쓰는 퍼즐의 최단 블록 수(BFS) */
function shortestMoves(d: BlockCodeData): number {
  const rows = d.grid;
  let start = { x: -1, y: -1, mask: 0 };
  const gems = new Map<string, number>();
  if (d.mustCollect) rows.forEach((r,y) => [...r].forEach((c,x) => { if(c === '*') gems.set(`${x},${y}`, gems.size); }));
  const full = (1 << gems.size) - 1;
  rows.forEach((r, y) => {
    const x = r.indexOf('S');
    if (x >= 0) start = { x, y, mask: 0 };
  });
  const seen = new Set([`${start.x},${start.y},0`]);
  let frontier = [start];
  for (let steps = 0; frontier.length > 0; steps++) {
    const next: { x: number; y: number; mask: number }[] = [];
    for (const p of frontier) {
      if (rows[p.y][p.x] === 'G' && p.mask === full) return steps;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = p.x + dx;
        const y = p.y + dy;
        const c = rows[y]?.[x];
        const gem = gems.get(`${x},${y}`);
        const mask = p.mask | (gem === undefined ? 0 : 1 << gem);
        if (c === undefined || c === '#' || c === '~' || seen.has(`${x},${y},${mask}`)) continue;
        seen.add(`${x},${y},${mask}`);
        next.push({ x, y, mask });
      }
    }
    frontier = next;
  }
  return Infinity;
}

function checkReward(r: Reward | undefined, where: string) {
  for (const it of r?.items ?? []) expect(ITEMS[it.id], `${where}: 없는 아이템 ${it.id}`).toBeDefined();
  if (r?.robiPart) expect(ROBI_PARTS[r.robiPart], `${where}: 없는 로비 부품`).toBeDefined();
}

describe('커리큘럼 구조', () => {
  it('0~8장이 순서대로 있어요', () => {
    expect(CHAPTERS.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('1~8장은 파트 3개 + 보스 1개예요', () => {
    for (const c of CHAPTERS.filter((c) => c.index > 0)) {
      expect(c.parts.map((p) => p.kind), c.id).toEqual(['part', 'part', 'part', 'boss']);
    }
  });

  it('미션·파트 id가 겹치지 않아요', () => {
    const ids = allMissions().map((m) => m.mission.id);
    expect(new Set(ids).size).toBe(ids.length);
    const parts = CHAPTERS.flatMap((c) => c.parts.map((p) => p.id));
    expect(new Set(parts).size).toBe(parts.length);
  });

  it('모든 장에 성취기준·로비 부품 연결이 있어요', () => {
    for (const c of CHAPTERS.filter((c) => c.index > 0)) {
      expect(c.standards.silgwa.length, c.id).toBeGreaterThan(0);
      expect(c.robiPart && ROBI_PARTS[c.robiPart], c.id).toBeTruthy();
    }
  });
});

describe('플레이할 수 있는 미션의 데이터', () => {
  const playable = allMissions().filter((e) => e.mission.data !== undefined);

  it('1장 전체와 7장 체험 미션은 데이터가 있어요', () => {
    for (const e of allMissions().filter((e) => e.chapter.status === 'playable')) {
      expect(e.mission.data, e.mission.id).toBeDefined();
    }
    expect(playable.some((e) => e.chapter.id === 'ch7' && e.mission.kind === 'prompt')).toBe(true);
  });

  it('NPC·아이템·몹·보상 참조가 모두 있어요', () => {
    for (const { mission: m } of playable) {
      if (m.npc) expect(NPCS[m.npc], `${m.id}: 없는 NPC ${m.npc}`).toBeDefined();
      checkReward(m.reward, m.id);
      if (m.kind === 'battle') expect(MOBS[m.data!.mob], `${m.id}: 없는 몹`).toBeDefined();
      if (m.kind === 'dialogue') {
        for (const l of m.data!.lines) {
          expect(l.who === 'player' || NPCS[l.who] !== undefined, `${m.id}: 없는 화자 ${l.who}`).toBe(true);
        }
      }
    }
  });

  it('블록 퍼즐은 시작·목표가 하나씩이고, 최소 블록 수(optimal)가 정확해요', () => {
    for (const { mission: m } of playable) {
      if (m.kind !== 'blockCode') continue;
      const d = m.data!;
      const width = d.grid[0].length;
      for (const r of d.grid) expect(r.length, `${m.id}: 줄 길이`).toBe(width);
      const all = d.grid.join('');
      expect(all.split('S').length - 1, m.id).toBe(1);
      expect(all.split('G').length - 1, m.id).toBe(d.paint ? 0 : 1);
      if (d.paint) {
        expect(d.paint.length, m.id).toBe(d.grid.length);
        for (const row of d.paint) expect(row.length, m.id).toBe(width);
      }
      const absoluteOnly = d.palette.every((c) => ['up', 'down', 'left', 'right'].includes(c));
      if (absoluteOnly && !d.allowRepeat && !d.allowIf) expect(shortestMoves(d), m.id).toBe(d.optimal);
    }
  });

  it('순서·퀴즈·설명하기·프롬프트 데이터가 올바른 모양이에요', () => {
    for (const { mission: m } of playable) {
      if (m.kind === 'sequence') expect(m.data!.steps.length, m.id).toBeGreaterThanOrEqual(3);
      if (m.kind === 'quiz') {
        for (const q of m.data!.questions) {
          expect(q.answer >= 0 && q.answer < q.choices.length, `${m.id}: ${q.q}`).toBe(true);
        }
      }
      if (m.kind === 'reflect') {
        const s = m.data!.sentences;
        expect(s.some((x) => x.correct) && s.some((x) => !x.correct), m.id).toBe(true);
      }
      if (m.kind === 'prompt') {
        const d = m.data!;
        expect(d.slots.map((s) => s.id), m.id).toEqual(['role', 'task', 'how', 'format']);
        for (const s of d.slots) expect(s.options.some((o) => o.quality === 'good'), `${m.id}/${s.id}`).toBe(true);
        for (const o of d.slots[0].options) expect(o.opening, `${m.id}/role/${o.id}`).toBeTruthy();
        for (const o of d.slots[1].options) expect(o.body?.length, `${m.id}/task/${o.id}`).toBeGreaterThan(0);
        for (const o of d.slots[1].options.filter((o) => o.quality === 'good')) expect(o.hardBody?.length).toBeGreaterThan(0);
        for (const o of d.slots[3].options) expect(o.render, `${m.id}/format/${o.id}`).toBeTruthy();
      }
    }
  });
});


describe('2장 반복 학습', () => {
  const cmd = (cmd: 'up' | 'down' | 'right'): Block => ({ t: 'cmd', cmd });
  const solutions: Record<string, Block[]> = {
    'ch2-p2-m1': [{ t: 'repeat', times: 8, body: [cmd('right')] }],
    'ch2-p2-m2': [{ t: 'repeat', times: 4, body: [cmd('right'), cmd('down')] }],
    'ch2-p2-m3': [{ t: 'repeat', times: 3, body: [cmd('right'), cmd('right'), cmd('down')] }],
    'ch2-p3-m1': [{ t: 'repeat', times: 4, body: [cmd('right'), cmd('down')] }],
    'ch2-p3-m2': [{ t: 'repeat', times: 3, body: [cmd('up'), cmd('right'), cmd('down'), cmd('right')] }],
  };
  it('반복 풀이가 실제로 성공하고, 평평한 풀이로는 블록 제한을 넘어요', () => {
    for (const { mission: m } of allMissions().filter(e => e.chapter.id === 'ch2')) {
      expect(m.data, m.id).toBeDefined();
      if (m.kind !== 'blockCode' || !solutions[m.id]) continue;
      const d = m.data!;
      const program = solutions[m.id];
      const env = new GridEnv(d);
      const result = run(program, env);
      expect(env.outcome(result.truncated), m.id).toBe('success');
      expect(countBlocks(program), m.id).toBe(d.optimal);
      if (m.id.startsWith('ch2-p2')) expect(shortestMoves(d), m.id).toBeGreaterThan(d.maxBlocks!);
    }
  });
});


describe('3장 조건과 센서', () => {
  const c = (cmd: 'forward' | 'turnRight' | 'turnLeft' | 'wait'): Block => ({t:'cmd',cmd});
  const sensor: Block[] = [{t:'repeat',times:9,body:[{t:'if',cond:'wallAhead',yes:[c('turnRight')],no:[c('forward')]}]}];
  const rightHand: Block[] = [{t:'repeat',times:9,body:[{t:'repeat',times:9,body:[{t:'if',cond:'pathRight',yes:[c('turnRight'),c('forward')],no:[{t:'if',cond:'pathAhead',yes:[c('forward')],no:[c('turnLeft')]}]}]}]}];
  it('같은 네 블록 조건 프로그램이 세 길에서 모두 성공해요', () => {
    for(const id of ['ch3-p2-m1','ch3-p2-m2','ch3-p2-m3']) {
      const m=allMissions().find(e=>e.mission.id===id)!.mission;
      if(m.kind!=='blockCode') throw new Error(id);
      const env=new GridEnv(m.data!);const out=run(sensor,env);
      expect(env.outcome(out.truncated),id).toBe('success');
      expect(countBlocks(sensor)).toBe(m.data!.optimal);
      const flat=new GridEnv(m.data!);
      const short=run([c('forward'),c('forward'),c('turnRight'),c('forward')],flat);
      expect(flat.outcome(short.truncated),id).not.toBe('success');
    }
  });
  it('오른손 규칙으로 보스 퍼즐을 끝까지 나와요', () => {
    const m=allMissions().find(e=>e.mission.id==='ch3-boss-m1')!.mission;
    if(m.kind!=='blockCode') throw new Error('boss maze');
    const env=new GridEnv(m.data!);const out=run(rightHand,env);
    expect(env.outcome(out.truncated)).toBe('success');
    expect(countBlocks(rightHand)).toBe(m.data!.optimal);
  });
  it('질문 세 개로 여덟 동물이 네 종류의 순수한 잎으로 나뉘어요', () => {
    const m=allMissions().find(e=>e.mission.id==='ch3-p3-m1')!.mission;
    if(m.kind!=='classify') throw new Error('tree');
    const d=m.data!;expect(d.cards).toHaveLength(8);expect(d.groups).toHaveLength(4);
    const leaves=new Map<string,Set<string>>();
    for(const card of d.cards){const path=d.questions!.map(q=>Number(card.features.includes(q.feature))).join('');const groups=leaves.get(path)??new Set<string>();groups.add(card.group);leaves.set(path,groups);}
    expect([...leaves.values()].every(g=>g.size===1)).toBe(true);
  });
});


describe('4장 데이터 학습', () => {
  it('종류 나누기와 장부 고치기는 모든 카드의 정확한 조치를 요구해요', () => {
    for(const id of ['ch4-p1-m1','ch4-p1-m2','ch4-boss-m1']) {
      const m=allMissions().find(e=>e.mission.id===id)!.mission;
      if(m.kind!=='classify')throw new Error(id);
      const d=m.data!;const correct=Object.fromEntries(d.cards.map(c=>[c.id,c.group]));
      expect(evaluateGroups(d,correct),id).toBe(true);
      expect(evaluateGroups(d,{}),id).toBe(false);
      const wrong={...correct,[d.cards[0].id]:d.groups.find(g=>g.id!==d.cards[0].group)!.id};
      expect(evaluateGroups(d,wrong),id).toBe(false);
    }
  });
  it('물결표의 빈도는 3·2·1이고 숫자를 바꾸면 통과하지 않아요', () => {
    const m=allMissions().find(e=>e.mission.id==='ch4-p2-m1')!.mission;
    if(m.kind!=='classify')throw new Error('table');
    expect(evaluateTable(m.data!,{low:3,middle:2,high:1})).toBe(true);
    expect(evaluateTable(m.data!,{low:2,middle:3,high:1})).toBe(false);
  });
  it('등대의 4비트 신호를 모두 맞혀야 문이 열려요', () => {
    const m=allMissions().find(e=>e.mission.id==='ch4-p3-m1')!.mission;
    if(m.kind!=='classify')throw new Error('binary');
    expect(m.data!.groups.map(g=>Number(g.id))).toEqual([8,4,2,1]);
    expect(evaluateBinary(m.data!,{gate3:'3',gate5:'5',gate10:'10'})).toBe(true);
    expect(evaluateBinary(m.data!,{gate3:'3',gate5:'5',gate10:'11'})).toBe(false);
  });
});
