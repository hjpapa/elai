import { CHAPTERS, requiredMissions } from '../data/chapters';
import { LESSON_GUIDE } from '../data/lessonGuide';
import type { Chapter, Part } from '../data/schema';
import { clear, h } from '../ui/dom';

export interface LessonPartView {
  part: Part;
  opening: string[];
  closing: string[];
  watch: string;
  required: string[];
  optional: string[];
}

export interface LessonView {
  chapter: Chapter;
  unplugged: string;
  parts: LessonPartView[];
}

/** 장 데이터와 수업 안내 글을 한 화면에 보여 줄 모양으로 합쳐요. */
export function lessonView(chapterId: string): LessonView | null {
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  const guide = LESSON_GUIDE.find((g) => g.chapter === chapterId);
  if (!chapter || !guide) return null;
  const parts = chapter.parts.map((part): LessonPartView => {
    const notes = guide.parts.find((p) => p.part === part.id);
    const required = requiredMissions(part);
    return {
      part,
      opening: notes?.opening ?? [],
      closing: notes?.closing ?? [],
      watch: notes?.watch ?? '',
      required: required.map((m) => m.title),
      optional: part.missions.filter((m) => !required.includes(m)).map((m) => m.title),
    };
  });
  return { chapter, unplugged: guide.unplugged, parts };
}

function list(title: string, rows: string[]): HTMLElement | null {
  if (!rows.length) return null;
  return h('div', { class: 't-guide-list' }, h('h4', {}, title), h('ul', {}, ...rows.map((row) => h('li', {}, row))));
}

function standards(chapter: Chapter): string {
  const { silgwa, aiContent, ai4k12 } = chapter.standards;
  return [
    silgwa.length ? `실과 ${silgwa.join(', ')}` : '',
    aiContent.length ? `AI 내용기준 ${aiContent.join(', ')}` : '',
    ai4k12.length ? `AI4K12 ${ai4k12.join(', ')}` : '',
  ].filter(Boolean).join(' · ');
}

function partBlock(view: LessonPartView, open: boolean): HTMLElement {
  const label = view.part.kind === 'boss' ? `보스 · ${view.part.title}` : view.part.title;
  return h(
    'details',
    { class: 't-guide-part', open },
    h('summary', {}, label),
    h('p', {}, view.part.activity),
    list('도입 질문', view.opening),
    list('정리 질문', view.closing),
    view.watch ? h('p', { class: 't-guide-watch' }, h('b', {}, '살펴볼 점 '), view.watch) : null,
    h('p', { class: 'muted' }, `미션: ${view.required.join(', ')}`),
    view.optional.length ? h('p', { class: 'muted' }, `더 해 보기: ${view.optional.join(', ')}`) : null,
  );
}

/** 교사용 수업 안내 카드: 장을 고르면 목표·성취기준·교실 활동·파트별 질문이 나와요. */
export function lessonCard(initial: string = CHAPTERS[0].id): HTMLElement {
  let shown = initial;
  const tabs = h('div', { class: 'tabs', style: 'margin:0 0 12px' });
  const body = h('div', { class: 't-guide' });
  const draw = () => {
    clear(tabs);
    for (const chapter of CHAPTERS) {
      const on = chapter.id === shown;
      tabs.append(h('button', { class: `tab ${on ? 'on' : ''}`, title: chapter.title, 'aria-pressed': String(on), onclick: () => ((shown = chapter.id), draw()) }, `${chapter.index}장`));
    }
    clear(body);
    const view = lessonView(shown);
    if (!view) return;
    const { chapter } = view;
    body.append(
      h('h3', {}, `${chapter.index}장 ${chapter.title}`),
      h('p', { class: 'muted' }, `${chapter.grades} · ${chapter.summary}`),
      list('학습 목표', chapter.goals) ?? '',
      h('p', { class: 'muted' }, standards(chapter)),
      h('p', { class: 't-guide-watch' }, h('b', {}, '교실 활동 '), view.unplugged),
      ...view.parts.map((part, i) => partBlock(part, i === 0)),
    );
  };
  draw();
  return h('div', { class: 't-card' }, h('h2', {}, '수업 안내'), tabs, body, h('p', { class: 't-legend' }, '파트 하나가 1차시예요. 도입 5분 · 플레이 25분 · 정리 10분을 기준으로 잡았어요. 더 해 보기 미션은 먼저 끝낸 학생이 해요.'));
}
