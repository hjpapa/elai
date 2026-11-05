import type { NextWordData } from '../../data/schema';
export interface WordCandidate { word: string; count: number; probability: number }
export function nextWords(sentences: string[], previous: string): WordCandidate[] {
  const counts = new Map<string, number>();
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length - 1; i++) if (words[i] === previous) counts.set(words[i + 1], (counts.get(words[i + 1]) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((n, count) => n + count, 0);
  return [...counts].map(([word, count]) => ({ word, count, probability: count / total })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}
export function evaluateNextWord(data: NextWordData, stories: Record<string, string[]>, answer: number | null): boolean {
  return data.corpora.length >= 2 && new Set(data.corpora.map(c => c.id)).size === data.corpora.length && Number.isInteger(data.steps) && data.steps > 0 && answer === data.question.answer && data.corpora.every(corpus => {
    const words = stories[corpus.id];
    return !!words && words[0] === data.start && words.length >= data.steps + 1 && words.every((word, i) => !i || nextWords(corpus.sentences, words[i - 1]).some(candidate => candidate.word === word));
  });
}
