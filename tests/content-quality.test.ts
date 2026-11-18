import { expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';

it('모든 퀴즈는 문제·서로 다른 보기·이유가 있고 길이나 위치로 정답을 찍기 어려워요', () => {
  const positions = [0, 0, 0];
  for (const chapter of CHAPTERS) {
    const questions = chapter.parts.flatMap(p => p.missions.flatMap(m => m.kind === 'quiz' ? m.data?.questions ?? [] : []));
    let longest = 0;
    for (const { q, choices, explain, answer } of questions) {
      expect([q, explain, ...choices].every(s => !!s.trim()), q).toBe(true);
      expect(new Set(choices.map(s => s.trim())).size, q).toBe(3);
      expect(choices, q).toHaveLength(3);
      expect(answer, q).toBeGreaterThanOrEqual(0);
      expect(answer, q).toBeLessThan(3);
      positions[answer]++;
      if (choices.every((c, i) => i === answer || c.length < choices[answer].length)) longest++;
    }
    expect(longest * 3, chapter.id).toBeLessThanOrEqual(questions.length);
  }
  const total = positions.reduce((sum, count) => sum + count, 0);
  for (const count of positions) expect(count / total).toBeGreaterThanOrEqual(0.25);
});
