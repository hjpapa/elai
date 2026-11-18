import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';
import { lessonView } from '../src/teacher/lessons';

describe('교사 페이지 수업 안내', () => {
  it.each(CHAPTERS)('$index장의 목표·활동·파트별 질문을 모두 보여 줄 수 있어요', (chapter) => {
    const view = lessonView(chapter.id)!;
    expect(view.chapter).toBe(chapter);
    expect(view.unplugged.trim()).not.toBe('');
    expect(chapter.goals.length).toBeGreaterThan(0);
    expect(view.parts.map((p) => p.part.id)).toEqual(chapter.parts.map((p) => p.id));
    for (const part of view.parts) {
      expect(part.part.activity.trim(), part.part.id).not.toBe('');
      expect(part.opening.length, part.part.id).toBeGreaterThan(0);
      expect(part.closing.length, part.part.id).toBeGreaterThan(0);
      expect(part.watch.trim(), part.part.id).not.toBe('');
    }
  });

  it('필수 미션과 더 해 보기 미션을 나눠요', () => {
    const part = lessonView('ch6')!.parts.find((p) => p.part.id === 'ch6-p1')!;
    expect(part.required).toEqual(['별빛 미로']);
    expect(part.optional).toEqual(['두 갈래 별길']);
  });

  it('없는 장은 보여 주지 않아요', () => {
    expect(lessonView('없는 장')).toBeNull();
  });
});
