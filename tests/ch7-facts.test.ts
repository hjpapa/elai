import { expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { evaluateFactCheck } from '../src/missions/factCheck/evaluate';

it('자료를 일부만 읽거나 두 답의 비교가 틀리면 끝낼 수 없어요', () => {
  const m = getMission('ch7-boss-m1')!.mission;
  if (m.kind !== 'factCheck' || !m.data?.compare) throw new Error('앵무새 자료');
  const d = m.data, compare = m.data.compare, read = d.sources.map(s => s.id);
  const answers = Object.fromEntries(d.claims.map(c => [c.id, { choice: c.answer, source: c.source }]));
  const plain = d.claims.filter(c => c.ask === 'plain'), grounded = d.claims.filter(c => c.ask === 'grounded');
  expect([4, 5]).toContain(plain.length);
  expect(new Set(plain.map(c => c.answer))).toEqual(new Set([0, 1, 2]));
  expect([2, 3]).toContain(grounded.length);
  expect(grounded.every(c => c.source !== 'none')).toBe(true);
  expect(grounded.some(c => c.text.includes('물감 수가 없어요'))).toBe(true);
  for (const c of d.claims) expect(c.choices).toEqual(['자료와 같아요', '자료와 달라요', '자료에 없는 말이에요']);
  expect(evaluateFactCheck(d, answers, read, compare.answer)).toBe(true);
  for (const omitted of read) expect(evaluateFactCheck(d, answers, read.filter(id => id !== omitted), compare.answer)).toBe(false);
  for (const [i] of compare.choices.entries()) if (i !== compare.answer) expect(evaluateFactCheck(d, answers, read, i)).toBe(false);
});
