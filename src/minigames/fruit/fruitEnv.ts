import { FRUITS } from '../../data/minigames/fruit';
import type { FruitPic, FruitRound } from '../../data/schema';

/**
 * 과일 분류 로봇(작은 학습 모델). 학습 상자의 예시 카드만 보고 시험 과일에 이름표를 붙여요.
 * - 시험 과일과 예시마다 같은 특징(색·모양·무늬)이 몇 개인지 세요.
 * - 가장 많이 같은 예시(가장 가까운 이웃)들의 이름표가 하나면 그 이름표, 여러 개면 '헷갈려요'(null)예요.
 * - 같은 예시를 여러 장 넣어도 답은 그대로예요(고르게 넣어야 정확도가 올라요). 운은 없어요.
 */
export type FeatureId = 'color' | 'shape' | 'pattern';
export const FEATURE_IDS: FeatureId[] = ['color', 'shape', 'pattern'];

/** 학습 상자의 카드 한 장. 이름표는 틀린 이름표 판에서 고칠 수 있어서 카드와 따로 들고 있어요. */
export interface BoxCard {
  card: string;
  fruit: string;
  label: string;
}

/** 두 과일 그림에서 같은 특징 */
export function sameFeatures(a: FruitPic, b: FruitPic): FeatureId[] {
  return FEATURE_IDS.filter((f) => a[f] === b[f]);
}

export interface Guess {
  /** 시험 과일(그림 키) */
  fruit: string;
  /** 정답(과일 종류) */
  truth: string;
  /** 로봇의 답. null이면 헷갈려요(또는 닮은 예시가 없어요) */
  label: string | null;
  /** 가장 많이 닮은 예시와 같은 특징 수(0~3) */
  best: number;
  /** 가장 많이 닮은 예시(학습 상자 카드 id, 상자 차례) */
  nearest: string[];
  /** 가장 많이 닮은 예시들의 이름표(겹치지 않게, 상자 차례) */
  labels: string[];
  correct: boolean;
}

/** 시험 과일 하나에 이름표 붙이기 */
export function guess(box: readonly BoxCard[], fruit: string): Guess {
  const pic = FRUITS[fruit];
  const scored = box.map((b) => ({ b, n: sameFeatures(FRUITS[b.fruit], pic).length }));
  const best = scored.reduce((m, s) => Math.max(m, s.n), 0);
  const nearest = best > 0 ? scored.filter((s) => s.n === best).map((s) => s.b) : [];
  const labels = [...new Set(nearest.map((b) => b.label))];
  const label = labels.length === 1 ? labels[0] : null;
  return { fruit, truth: pic.kind, label, best, nearest: nearest.map((b) => b.card), labels, correct: label === pic.kind };
}

export interface TestReport {
  baskets: { name: string; guesses: Guess[]; correct: number }[];
  correct: number;
  total: number;
  /** 과일 모습(그림)마다 맞힌 수(시험에 처음 나온 차례) */
  groups: { fruit: string; correct: number; total: number }[];
  /** 학습 상자에서 이름표가 그림과 다른 카드 id */
  wrongLabels: string[];
  /** 모든 바구니의 과일을 맞혔어요 */
  success: boolean;
}

/** 학습 상자로 시험 바구니를 모두 나눠 봐요 */
export function runTest(round: FruitRound, box: readonly BoxCard[]): TestReport {
  const baskets = round.baskets.map((b) => {
    const guesses = b.fruits.map((f) => guess(box, f));
    return { name: b.name, guesses, correct: guesses.filter((g) => g.correct).length };
  });
  const all = baskets.flatMap((b) => b.guesses);
  const groups: TestReport['groups'] = [];
  for (const g of all) {
    let row = groups.find((x) => x.fruit === g.fruit);
    if (!row) groups.push((row = { fruit: g.fruit, correct: 0, total: 0 }));
    row.total++;
    if (g.correct) row.correct++;
  }
  const correct = all.filter((g) => g.correct).length;
  const wrongLabels = box.filter((b) => FRUITS[b.fruit].kind !== b.label).map((b) => b.card);
  return { baskets, correct, total: all.length, groups, wrongLabels, success: all.length > 0 && correct === all.length };
}

/** 성공한 판의 별: 이름표가 틀린 카드가 상자에 남아 있으면(시험에 안 나와도) 하나 적어요 */
export function fruitStars(report: TestReport): number {
  if (!report.success) return 0;
  return report.wrongLabels.length ? 2 : 3;
}

/** 카드 id(와 고친 이름표)로 학습 상자 만들기. 없는 카드는 빼요. */
export function boxOf(round: FruitRound, ids: readonly string[], labels: Readonly<Record<string, string>> = {}): BoxCard[] {
  return ids.flatMap((id) => {
    const c = round.pool.find((p) => p.id === id);
    return c ? [{ card: c.id, fruit: c.fruit, label: labels[id] ?? c.label }] : [];
  });
}
