import { describe, expect, it } from 'vitest';
import { CHAPTERS, allMissions } from '../src/data/chapters';
import { NPCS } from '../src/data/npcs';
import { ITEMS } from '../src/data/rpg/items';
import { MOBS } from '../src/data/rpg/mobs';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { BlockCodeData, Reward } from '../src/data/schema';

/** 절대 방향 이동만 쓰는 퍼즐의 최단 블록 수(BFS) */
function shortestMoves(d: BlockCodeData): number {
  const rows = d.grid;
  let start = { x: -1, y: -1 };
  rows.forEach((r, y) => {
    const x = r.indexOf('S');
    if (x >= 0) start = { x, y };
  });
  const seen = new Set([`${start.x},${start.y}`]);
  let frontier = [start];
  for (let steps = 0; frontier.length > 0; steps++) {
    const next: { x: number; y: number }[] = [];
    for (const p of frontier) {
      if (rows[p.y][p.x] === 'G') return steps;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = p.x + dx;
        const y = p.y + dy;
        const c = rows[y]?.[x];
        if (c === undefined || c === '#' || c === '~' || seen.has(`${x},${y}`)) continue;
        seen.add(`${x},${y}`);
        next.push({ x, y });
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
      expect(all.split('G').length - 1, m.id).toBe(1);
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
