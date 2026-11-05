import type { ClassificationModel, TrainData, TrainingSample } from '../../data/schema';

function validVector(values: number[]): boolean {
  return values.length > 0 && values.every(Number.isFinite);
}
/** 작은 수치 격자의 가까운 이웃 투표. 동률은 총거리, 이름표 순서로 정해요. */
export function predictLabel(samples: TrainingSample[], features: number[], k = 3): string | null {
  if (!validVector(features) || !samples.length || !Number.isInteger(k) || k < 1 || samples.some(s => !s.label || !validVector(s.features) || s.features.length !== features.length)) return null;
  const nearest = samples.map(s => ({ label: s.label, distance: s.features.reduce((n, v, i) => n + (v - features[i]) ** 2, 0) }))
    .sort((a, b) => a.distance - b.distance || a.label.localeCompare(b.label)).slice(0, k);
  const votes = new Map<string, { count: number; distance: number }>();
  for (const row of nearest) { const vote = votes.get(row.label) ?? { count: 0, distance: 0 }; vote.count++; vote.distance += row.distance; votes.set(row.label, vote); }
  return [...votes].sort((a, b) => b[1].count - a[1].count || a[1].distance - b[1].distance || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
}
export interface TrainingReport {
  accuracy: number;
  rows: { id: string; expected: string; predicted: string | null; correct: boolean }[];
  success: boolean;
}
/** 학습할 때의 입력을 복사해요. 이름표/선택을 바꾸면 다시 학습해야 해요. */
export function trainSelection(data: TrainData, selected: Record<string, string>): ClassificationModel | null {
  const ids = Object.keys(selected), labels = new Set(data.labels.map(l => l.id));
  if (!ids.length || !Number.isInteger(data.k) || data.k < 1 || ids.some(id => !data.examples.some(s => s.id === id) || !labels.has(selected[id]))) return null;
  const samples = data.examples.filter(s => idIn(selected, s.id)).map(s => ({ features: [...s.features], label: selected[s.id] }));
  if (samples.some(s => !validVector(s.features) || s.features.length !== data.features.length)) return null;
  return { samples, k: data.k };
}
function idIn(selected: Record<string, string>, id: string): boolean { return Object.hasOwn(selected, id); }
export function evaluateTraining(data: TrainData, model: ClassificationModel | null, selected: Record<string, string>): TrainingReport {
  const rows = data.tests.map(test => { const predicted = model ? predictLabel(model.samples, test.features, model.k) : null; return { id: test.id, expected: test.label, predicted, correct: predicted === test.label }; });
  const accuracy = rows.length ? rows.filter(row => row.correct).length / rows.length : 0;
  const snapshot = trainSelection(data, selected);
  const matchingSnapshot = snapshot && model && JSON.stringify(snapshot) === JSON.stringify(model);
  const correctLabels = data.examples.filter(s => idIn(selected, s.id)).every(s => selected[s.id] === s.label);
  return { rows, accuracy, success: !!matchingSnapshot && correctLabels && rows.length > 0 && (model?.samples.length ?? 0) >= data.minExamples && accuracy >= data.threshold };
}
