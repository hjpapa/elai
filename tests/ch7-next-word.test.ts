import { expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { nextWordViews, sampleSteps } from '../src/missions/nextWord/evaluate';

it('앞말 탭 두 개와 실제 글에 없는 조합을 포함한 젠의 세 답을 비교해요', () => {
  const mission = getMission('ch7-p1-m1')!.mission;
  if (mission.kind !== 'nextWord' || !mission.data?.samples) throw new Error('젠의 답 자료');
  const data = mission.data, samples = mission.data.samples;
  expect(nextWordViews(data).map(v => v.label)).toEqual(['탐험과 꿈 · 앞말 1개', '탐험과 꿈 · 앞말 2개']);
  expect(samples.window).toBe(1);
  expect(samples.answers).toHaveLength(3);
  const top = samples.answers.map(sample => sampleSteps(data, sample)?.every(step => step.top));
  expect(top.filter(value => value === true)).toHaveLength(1);
  expect(top.filter(value => value === false)).toHaveLength(2);
  const mixed = samples.answers.find(s => s.id === 'mixed')!;
  expect(data.corpora[0].sentences).not.toContain(mixed.words.join(' '));
  expect(sampleSteps(data, mixed)?.some(s => !s.top)).toBe(true);
  const lines = samples.intro.split('\n');
  expect(lines.length).toBeLessThanOrEqual(2);
  expect(lines.every(line => line.length <= 24)).toBe(true);
});
