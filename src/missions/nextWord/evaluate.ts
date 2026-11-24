import type { NextWordData, NextWordSample } from '../../data/schema';

export interface WordCandidate { word: string; count: number; probability: number }

/** 글 모음에서 앞말(낱말 하나 또는 이어진 여러 낱말) 바로 뒤에 온 말을 세요. */
export function nextWords(sentences: string[], previous: string | readonly string[]): WordCandidate[] {
  const context = typeof previous === 'string' ? [previous] : [...previous];
  const counts = new Map<string, number>();
  if (!context.length) return [];
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    for (let i = context.length - 1; i < words.length - 1; i++) {
      if (context.every((word, j) => words[i - context.length + 1 + j] === word)) counts.set(words[i + 1], (counts.get(words[i + 1]) ?? 0) + 1);
    }
  }
  const total = [...counts.values()].reduce((n, count) => n + count, 0);
  return [...counts].map(([word, count]) => ({ word, count, probability: count / total })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

/** 젠이 지금 보는 앞말: 문장 끝에서 window개까지예요. */
export function contextWords(words: readonly string[], window: number): string[] {
  return words.slice(Math.max(0, words.length - window));
}

export interface NextWordView {
  id: string;
  corpus: NextWordData['corpora'][number];
  window: number;
  label: string;
}

function windowsOf(data: NextWordData): number[] {
  return data.windows?.length ? data.windows : [1];
}

/** 화면의 탭: 글 모음 × 앞말 수. 앞말 수가 하나뿐이면 예전처럼 글 모음 id와 이름을 그대로 써요. */
export function nextWordViews(data: NextWordData): NextWordView[] {
  const windows = windowsOf(data);
  const many = windows.length > 1;
  return data.corpora.flatMap(corpus => windows.map(window => ({
    id: many ? `${corpus.id}@${window}` : corpus.id,
    corpus,
    window,
    label: many ? `${corpus.label} · 앞말 ${window}개` : corpus.label,
  })));
}

function validWindows(data: NextWordData): boolean {
  const windows = windowsOf(data);
  return windows.every(n => Number.isInteger(n) && n >= 1 && n <= 4) && new Set(windows).size === windows.length;
}

function validStory(view: NextWordView, start: string, steps: number, words: string[] | undefined): boolean {
  return !!words && words[0] === start && words.length >= steps + 1
    && words.every((word, i) => !i || nextWords(view.corpus.sentences, contextWords(words.slice(0, i), view.window)).some(candidate => candidate.word === word));
}

export function evaluateNextWord(data: NextWordData, stories: Record<string, string[]>, answer: number | null, sampleAnswer: number | null = null): boolean {
  const views = nextWordViews(data);
  return views.length >= 2 && new Set(data.corpora.map(c => c.id)).size === data.corpora.length && validWindows(data)
    && Number.isInteger(data.steps) && data.steps > 0 && answer === data.question.answer
    && (!data.samples || sampleAnswer === data.samples.question.answer)
    && views.every(view => validStory(view, data.start, data.steps, stories[view.id]));
}

export interface SampleStep {
  word: string;
  probability: number;
  /** 그때 가장 많이 나온 말이었는지(횟수가 같으면 모두 가장 많은 말이에요) */
  top: boolean;
}

/** 젠이 미리 이어 쓴 답의 낱말마다 그때의 비율을 구해요. 글 모음에 없는 연결이 있으면 null이에요. */
export function sampleSteps(data: NextWordData, sample: NextWordSample): SampleStep[] | null {
  const rule = data.samples;
  const corpus = rule && data.corpora.find(c => c.id === rule.corpus);
  if (!rule || !corpus || sample.words[0] !== data.start || sample.words.length < 2) return null;
  const steps: SampleStep[] = [];
  for (let i = 1; i < sample.words.length; i++) {
    const candidates = nextWords(corpus.sentences, contextWords(sample.words.slice(0, i), rule.window));
    const hit = candidates.find(c => c.word === sample.words[i]);
    if (!hit) return null;
    steps.push({ word: hit.word, probability: hit.probability, top: hit.count === candidates[0].count });
  }
  return steps;
}

function validQuestion(q: { q: string; choices: string[]; answer: number } | undefined): boolean {
  return !!q && !!q.q.trim() && q.choices.length >= 2 && q.choices.every(c => !!c.trim()) && new Set(q.choices).size === q.choices.length
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length;
}

/** 시작에서 이어 갈 수 있는 문장의 앞부분을 모두 모아요(최대 limit개). */
function prefixes(view: NextWordView, start: string, steps: number, limit = 300): string[][] {
  const found: string[][] = [];
  const walk = (words: string[]) => {
    if (found.length >= limit) return;
    found.push(words);
    if (words.length > steps) return;
    for (const c of nextWords(view.corpus.sentences, contextWords(words, view.window))) walk([...words, c.word]);
  };
  walk([start]);
  return found;
}

/** 데이터 점검: 학생이 끝까지 이을 수 있고 비교할 거리가 실제로 있는지 봐요. 문제가 없으면 빈 배열이에요. */
export function nextWordProblems(data: NextWordData): string[] {
  const problems: string[] = [];
  const views = nextWordViews(data);
  if (!validWindows(data)) problems.push('앞말 수는 1~4의 서로 다른 정수예요.');
  if (views.length < 2) problems.push('비교할 탭이 두 개 이상 있어야 해요.');
  if (new Set(data.corpora.map(c => c.id)).size !== data.corpora.length) problems.push('글 모음 id가 겹쳐요.');
  if (!Number.isInteger(data.steps) || data.steps < 1) problems.push('이어 갈 낱말 수를 살펴요.');
  if (!validQuestion(data.question)) problems.push('비교 질문의 보기와 답을 살펴요.');
  for (const view of views) {
    if (!prefixes(view, data.start, data.steps).some(words => words.length === data.steps + 1)) problems.push(`${view.label}: ${data.steps}낱말까지 이어 갈 수 없어요.`);
  }
  const windows = windowsOf(data);
  if (windows.length > 1 && validWindows(data)) {
    const widest = Math.max(...windows);
    for (const corpus of data.corpora) {
      const wide = views.find(v => v.corpus.id === corpus.id && v.window === widest)!;
      const shape = (context: string[]) => nextWords(corpus.sentences, context).map(c => `${c.word}:${c.count}`).join(',');
      const differs = prefixes(wide, data.start, data.steps).some(words => shape(contextWords(words, 1)) !== shape(contextWords(words, widest)));
      if (!differs) problems.push(`${corpus.label}: 앞말 수를 바꿔도 다음 말이 달라지지 않아요.`);
    }
  }
  const rule = data.samples;
  if (rule) {
    if (!data.corpora.some(c => c.id === rule.corpus)) problems.push('젠의 답이 쓰는 글 모음이 없어요.');
    if (!Number.isInteger(rule.window) || rule.window < 1 || rule.window > 4) problems.push('젠의 답의 앞말 수를 살펴요.');
    if (!rule.intro.trim()) problems.push('젠의 답 안내 글이 비어 있어요.');
    if (rule.answers.length < 2 || new Set(rule.answers.map(a => a.id)).size !== rule.answers.length) problems.push('젠의 답은 서로 다른 id로 두 개 이상이에요.');
    if (new Set(rule.answers.map(a => a.words.join(' '))).size !== rule.answers.length) problems.push('젠의 답끼리 문장이 같아요.');
    const steps = rule.answers.map(a => sampleSteps(data, a));
    rule.answers.forEach((a, i) => { if (!steps[i]) problems.push(`${a.label}: 글 모음에 없는 연결이 있어요.`); });
    const valid = steps.filter((s): s is SampleStep[] => !!s);
    if (!valid.some(s => s.every(step => step.top))) problems.push('가장 많이 나온 말만 고른 답이 하나 있어야 해요.');
    if (!valid.some(s => s.some(step => !step.top))) problems.push('덜 나온 말을 고른 답이 하나 있어야 해요.');
    if (!validQuestion(rule.question)) problems.push('젠의 답 질문의 보기와 답을 살펴요.');
  }
  return problems;
}
