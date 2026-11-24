import { expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { checkCriteriaPick, criteriaResults, goodChoice } from '../src/missions/prompt/evaluate';

it.each(['ch7-p2-m1', 'ch7-p2-m2'])('%s 기준표의 조건은 모두 지킬 수도, 각각 어길 수도 있어요', id => {
  const mission = getMission(id)!.mission;
  if (mission.kind !== 'prompt' || !mission.data?.criteria) throw new Error(id);
  const data = mission.data, cards = mission.data.criteria.cards;
  const wanted = cards.filter(c => c.wanted), traps = cards.filter(c => !c.wanted);
  expect(wanted.length).toBeGreaterThanOrEqual(3);
  expect(wanted.length).toBeLessThanOrEqual(4);
  expect(traps).toHaveLength(2);
  expect(cards.filter(c => c.check && 'safe' in c.check)).toHaveLength(id === 'ch7-p2-m1' ? 1 : 0);
  for (const card of cards) {
    const lines = card.feedback.split('\n');
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every(line => line.length <= 24)).toBe(true);
  }
  const ids = wanted.map(c => c.id), best = goodChoice(data);
  expect(checkCriteriaPick(data, ids).ok).toBe(true);
  expect(checkCriteriaPick(data, [...ids, traps[0].id]).ok).toBe(false);
  expect(criteriaResults(data, best)).toEqual(ids.map(id => ({ id, met: true })));
  const unmet = new Set<string>();
  for (const slot of data.slots) for (const option of slot.options) {
    for (const result of criteriaResults(data, { ...best, [slot.id]: option.id })) {
      if (!result.met) unmet.add(result.id);
    }
  }
  expect(unmet).toEqual(new Set(ids));
});
