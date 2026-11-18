import { expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';
import { LESSON_GUIDE } from '../src/data/lessonGuide';

it('모든 장과 파트에 수업 순서대로 질문과 관찰점이 있어요', () => {
  expect(LESSON_GUIDE.map(g => g.chapter)).toEqual(CHAPTERS.map(chapter => chapter.id));
  LESSON_GUIDE.forEach((guide, index) => {
    expect(guide.parts.map(p => p.part)).toEqual(CHAPTERS[index].parts.map(p => p.id));
    expect(guide.unplugged.trim()).not.toBe('');
    for (const part of guide.parts) {
      expect(part.watch.trim(), part.part).not.toBe('');
      for (const questions of [part.opening, part.closing]) {
        expect(questions.length).toBeGreaterThanOrEqual(1);
        expect(questions.length).toBeLessThanOrEqual(2);
        expect(questions.every(q => !!q.trim()), part.part).toBe(true);
      }
    }
  });
});
