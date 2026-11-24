import { expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { applyFollowUp, evaluatePrompt, problemSlots } from '../src/missions/prompt/evaluate';

it('책장 주문서의 두 문제는 구체적으로 고쳐 물어야 모두 풀려요', () => {
  const m = getMission('ch7-p2-m3')!.mission;
  if (m.kind !== 'prompt' || !m.data?.diagnose) throw new Error('가려진 주문서');
  const data = m.data, { hidden, followUps, intro, hint } = m.data.diagnose;
  expect(problemSlots(data, hidden)).toEqual(['how', 'format']);
  expect(evaluatePrompt(data, hidden)).toMatchObject({ privacy: false, hard: true, render: 'paragraph' });
  const specific = followUps.filter(f => f.specific), vague = followUps.filter(f => !f.specific);
  expect(specific).toHaveLength(2);
  expect(vague.length).toBeGreaterThanOrEqual(2);
  expect(vague.some(f => Object.keys(f.change).length > 0)).toBe(true);
  for (const text of [intro, hint, ...followUps.map(f => f.feedback)]) {
    const lines = text.split('\n');
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every(line => line.length <= 24)).toBe(true);
  }
  for (const f of vague) {
    const after = applyFollowUp(hidden, f);
    expect(problemSlots(data, after)).toEqual(['how', 'format']);
    for (const first of specific) {
      const half = applyFollowUp(after, first);
      expect(problemSlots(data, half)).toHaveLength(1);
      for (const other of vague) expect(problemSlots(data, applyFollowUp(half, other)).length).toBeGreaterThan(0);
      const last = specific.find(fix => fix !== first)!;
      const fixed = applyFollowUp(half, last);
      expect(problemSlots(data, fixed)).toEqual([]);
      expect(evaluatePrompt(data, fixed)).toMatchObject({ hard: false, render: 'list', success: true });
    }
  }
});
