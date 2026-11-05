import type { ClassifyData } from '../../data/schema';

export interface Leaf { path: string[]; cards: ClassifyData['cards']; }
/** 선택한 질문을 모든 카드에 똑같이 적용해 이진 나무의 잎을 만들어요. */
export function evaluateTree(data: ClassifyData, selected: string[]): { success: boolean; leaves: Leaf[] } {
  const questions = selected.map(id => data.questions?.find(q => q.id === id));
  if (!data.cards.length || !selected.length || new Set(selected).size !== selected.length || questions.some(q => !q) || selected.length > (data.maxQuestions ?? 20)) return { success: false, leaves: [] };
  const groups = new Map<string, Leaf>();
  for (const card of data.cards) {
    const path = questions.map(q => card.features.includes(q!.feature) ? '예' : '아니요');
    const key = path.join('/');
    const leaf = groups.get(key) ?? { path, cards: [] };
    leaf.cards.push(card); groups.set(key, leaf);
  }
  const leaves = [...groups.values()];
  return { success: leaves.every(leaf => new Set(leaf.cards.map(c => c.group)).size === 1), leaves };
}

/** 나누기는 이름표, 묶기는 이름표 없이 같은 특징의 묶음 구조를 확인해요. */
export function evaluateGroups(data: ClassifyData, selected: Record<string, string>): boolean {
  const valid = new Set(data.groups.map(g => g.id));
  if (!data.cards.length || data.cards.some(c => !valid.has(selected[c.id]))) return false;
  if (data.mode !== 'cluster') return data.cards.every(c => selected[c.id] === c.group);
  return data.cards.every(a => data.cards.every(b => (a.group === b.group) === (selected[a.id] === selected[b.id])));
}
