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


export function evaluateTable(data: ClassifyData, counts: Record<string, number>): boolean {
  const ids = new Set(data.groups.map(group => group.id));
  return data.cards.length > 0 && data.groups.length > 0 && ids.size === data.groups.length
    && data.cards.every(card => ids.has(card.group)) && Object.keys(counts).every(id => ids.has(id)) && data.groups.every(group =>
    Number.isInteger(counts[group.id] ?? 0) && (counts[group.id] ?? 0) === data.cards.filter(c => c.group === group.id).length);
}
export function evaluateBinary(data: ClassifyData, values: Record<string, string>): boolean {
  return data.cards.length > 0 && data.cards.every(card => {
    const text = values[card.id] ?? '0';
    if (!/^(0|[1-9][0-9]*)$/.test(card.group) || !/^(0|[1-9][0-9]*)$/.test(text)) return false;
    const target = Number(card.group), actual = Number(text);
    return Number.isInteger(target) && target >= 0 && target <= 15 && Number.isInteger(actual) && actual >= 0 && actual <= 15 && target === actual;
  });
}

/** 켜진 칸의 수뿐 아니라 각 픽셀의 위치도 같아야 해요. */
export function evaluatePixels(data: ClassifyData, pixels: Record<string, string>): boolean {
  return data.cards.length > 0 && data.cards.every(card => card.features.length > 0 && card.features[0].length > 0
    && card.features.every(row => /^[01]+$/.test(row) && row.length === card.features[0].length)
    && (pixels[card.id] ?? '0'.repeat(card.features.join('').length)) === card.features.join(''));
}
