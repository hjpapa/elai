import { composePromptImage } from './image';
import type { PromptCheck, PromptData, PromptFollowUp, PromptOption, PromptQuality, PromptRender, PromptSlotId } from '../../data/schema';
import type { Stars } from '../core/types';

/** 칸별로 고른 선택지 id(비우면 undefined) */
export type PromptChoice = Partial<Record<PromptSlotId, string>>;

export interface PromptIssue {
  slot: PromptSlotId;
  kind: 'missing' | 'meh' | 'bad' | 'privacy';
  text: string;
}

export interface PromptOutcome {
  opening: string;
  lines: string[];
  render: PromptRender;
  issues: PromptIssue[];
  /** 칸마다 good 2, meh 1, 그 밖 0 → 0~8 */
  score: number;
  privacy: boolean;
  /** 본문이 어렵고 긴 글(hardBody)로 나왔는지 */
  hard: boolean;
  success: boolean;
  stars: Stars;
}

const POINTS: Record<PromptQuality, number> = { good: 2, meh: 1, bad: 0 };

/**
 * 게임 속 AI '젠'의 답 만들기. 실제 AI가 아니라 미리 써 둔 조각을 조합해요.
 * 빠지거나 맞지 않는 칸마다 정해진 문제가 결과에 나타나요.
 */
export function evaluatePrompt(data: PromptData, choice: PromptChoice): PromptOutcome {
  const pick = (id: PromptSlotId): PromptOption | undefined => {
    const slot = data.slots.find((s) => s.id === id);
    return slot?.options.find((o) => o.id === choice[id]);
  };
  const role = pick('role');
  const task = pick('task');
  const how = pick('how');
  const format = pick('format');

  const issues: PromptIssue[] = [];
  let score = 0;
  let privacy = false;
  for (const slot of data.slots) {
    const opt = pick(slot.id);
    if (!opt) {
      issues.push({ slot: slot.id, kind: 'missing', text: slot.missing });
      continue;
    }
    score += POINTS[opt.quality];
    if (opt.privacy) {
      privacy = true;
      issues.unshift({ slot: slot.id, kind: 'privacy', text: opt.feedback ?? '개인정보는 넣지 않아요.' });
    } else if (opt.quality !== 'good') {
      issues.push({ slot: slot.id, kind: opt.quality, text: opt.feedback ?? '' });
    }
  }

  const opening = role?.opening ?? data.fallback.opening;
  let lines: string[];
  let hard = false;
  if (!task) lines = data.fallback.body;
  else if (task.quality === 'good') {
    const easy = how !== undefined && how.quality !== 'bad';
    hard = !easy && !!task.hardBody;
    lines = (easy ? task.body : task.hardBody) ?? task.body ?? [];
  } else lines = task.body ?? [];

  const imageMatches = !data.image || (data.slots.every(slot => pick(slot.id)?.quality === 'good' && data.image?.layers.some(layer => layer.slot === slot.id && layer.option === choice[slot.id])) && composePromptImage(data, choice)?.some(row => row.some(Boolean)) === true);
  const success = imageMatches && !privacy && task?.quality === 'good' && score >= 6;
  const stars: Stars = !success ? 0 : score === 8 ? 3 : score >= 7 ? 2 : 1;
  return { opening, lines, render: format?.render ?? 'paragraph', issues, score, privacy, hard, success, stars };
}

/* ── 기준표 ── */

/** 답이 기준 하나를 지켰는지 봐요. */
export function criterionMet(check: PromptCheck | undefined, choice: PromptChoice, outcome: PromptOutcome): boolean {
  if (!check) return false;
  if ('slot' in check) return check.options.includes(choice[check.slot] ?? '');
  if ('plain' in check) return !outcome.hard;
  return !outcome.privacy;
}

export interface CriterionResult { id: string; met: boolean }

/** 의뢰문에 든 기준(wanted 카드)마다 답이 지켰는지 카드 순서대로 알려 줘요. */
export function criteriaResults(data: PromptData, choice: PromptChoice, outcome: PromptOutcome = evaluatePrompt(data, choice)): CriterionResult[] {
  return (data.criteria?.cards ?? []).filter(card => card.wanted).map(card => ({ id: card.id, met: criterionMet(card.check, choice, outcome) }));
}

/** 학생이 고른 기준 카드를 의뢰문의 조건과 비교해요. */
export function checkCriteriaPick(data: PromptData, picked: readonly string[]): { ok: boolean; wrong: string[]; missing: string[] } {
  const cards = data.criteria?.cards ?? [];
  const chosen = new Set(picked);
  const wrong = cards.filter(card => chosen.has(card.id) && !card.wanted).map(card => card.id);
  const missing = cards.filter(card => card.wanted && !chosen.has(card.id)).map(card => card.id);
  const unknown = [...chosen].some(id => !cards.some(card => card.id === id));
  return { ok: cards.length > 0 && !unknown && !wrong.length && !missing.length, wrong, missing };
}

/* ── 원인 찾기와 고쳐 묻기 ── */

/** 칸마다 첫 번째 good 선택지를 고른 주문서 */
export function goodChoice(data: PromptData): PromptChoice {
  return Object.fromEntries(data.slots.map(slot => [slot.id, slot.options.find(o => o.quality === 'good')?.id])) as PromptChoice;
}

/** 비었거나 good이 아닌 칸(칸 순서대로) */
export function problemSlots(data: PromptData, choice: PromptChoice): PromptSlotId[] {
  return data.slots.filter(slot => slot.options.find(o => o.id === choice[slot.id])?.quality !== 'good').map(slot => slot.id);
}

export function applyFollowUp(choice: PromptChoice, followUp: PromptFollowUp): PromptChoice {
  return { ...choice, ...followUp.change };
}

/** 두 주문서에서 선택이 달라진 칸 */
export function changedSlots(data: PromptData, before: PromptChoice, after: PromptChoice): PromptSlotId[] {
  return data.slots.filter(slot => before[slot.id] !== after[slot.id]).map(slot => slot.id);
}

/** 학생이 고른 원인 칸을 실제 문제 칸과 비교해요. */
export function checkCause(data: PromptData, picked: readonly PromptSlotId[]): { ok: boolean; wrong: PromptSlotId[]; missing: PromptSlotId[] } {
  const hidden = data.diagnose?.hidden ?? {};
  const causes = problemSlots(data, hidden);
  const chosen = new Set(picked);
  const wrong = data.slots.map(s => s.id).filter(id => chosen.has(id) && !causes.includes(id));
  const missing = causes.filter(id => !chosen.has(id));
  return { ok: !!data.diagnose && causes.length > 0 && !wrong.length && !missing.length, wrong, missing };
}

/* ── 데이터 점검 ── */

function optionOf(data: PromptData, slot: PromptSlotId, id: string | undefined): PromptOption | undefined {
  return data.slots.find(s => s.id === slot)?.options.find(o => o.id === id);
}

function validRefs(data: PromptData, choice: PromptChoice): boolean {
  return Object.entries(choice).every(([slot, id]) => id === undefined || !!optionOf(data, slot as PromptSlotId, id));
}

/** 칸 하나만 바꾼(또는 비운) 주문서들: 기준이 실제로 달라질 수 있는지 볼 때 써요. */
function oneSlotVariants(data: PromptData, base: PromptChoice): PromptChoice[] {
  return data.slots.flatMap(slot => [{ ...base, [slot.id]: undefined }, ...slot.options.filter(o => o.id !== base[slot.id]).map(o => ({ ...base, [slot.id]: o.id }))]);
}

/** 데이터 점검: 기준표와 원인 찾기가 학생이 끝까지 풀 수 있게 짜였는지 봐요. 문제가 없으면 빈 배열이에요. */
export function promptProblems(data: PromptData): string[] {
  const problems: string[] = [];
  if (new Set(data.slots.map(s => s.id)).size !== data.slots.length) problems.push('주문서 칸 id가 겹쳐요.');
  for (const slot of data.slots) {
    if (new Set(slot.options.map(o => o.id)).size !== slot.options.length) problems.push(`${slot.label}: 선택지 id가 겹쳐요.`);
    if (!slot.options.some(o => o.quality === 'good')) problems.push(`${slot.label}: good 선택지가 없어요.`);
  }
  const best = goodChoice(data);
  const cards = data.criteria?.cards;
  if (cards) {
    const wanted = cards.filter(c => c.wanted);
    if (cards.length < 3 || wanted.length < 2 || wanted.length === cards.length) problems.push('기준 카드는 조건 두 개 이상과 함정 하나 이상이에요.');
    if (new Set(cards.map(c => c.id)).size !== cards.length) problems.push('기준 카드 id가 겹쳐요.');
    for (const card of cards) {
      if (!card.text.trim() || !card.feedback.trim()) problems.push(`${card.id}: 글이나 설명이 비어 있어요.`);
      if (!card.wanted && card.check) problems.push(`${card.id}: 함정 카드에는 확인 방법을 넣지 않아요.`);
      if (!card.wanted) continue;
      const check = card.check;
      if (!check) { problems.push(`${card.id}: 확인 방법이 없어요.`); continue; }
      if ('slot' in check && (!check.options.length || check.options.some(id => !optionOf(data, check.slot, id)))) problems.push(`${card.id}: 확인할 칸이나 선택지가 없어요.`);
      if (!criterionMet(check, best, evaluatePrompt(data, best))) problems.push(`${card.id}: 좋은 주문서로도 지켜지지 않아요.`);
      if (!oneSlotVariants(data, best).some(choice => !criterionMet(check, choice, evaluatePrompt(data, choice)))) problems.push(`${card.id}: 어떤 칸을 바꿔도 늘 지켜져서 확인할 거리가 없어요.`);
    }
  }
  const diagnose = data.diagnose;
  if (diagnose) {
    const { hidden, followUps } = diagnose;
    if (!diagnose.intro.trim() || !diagnose.hint.trim()) problems.push('원인 찾기 안내나 힌트가 비어 있어요.');
    if (!validRefs(data, hidden)) problems.push('가려진 주문서에 없는 선택지가 있어요.');
    if (data.slots.some(slot => optionOf(data, slot.id, hidden[slot.id])?.privacy)) problems.push('가려진 주문서에는 개인정보 선택지를 넣지 않아요.');
    const causes = problemSlots(data, hidden);
    if (!causes.length || evaluatePrompt(data, hidden).success) problems.push('가려진 주문서의 답이 의뢰를 해결하지 못해야 해요.');
    if (followUps.length < 3 || new Set(followUps.map(f => f.id)).size !== followUps.length) problems.push('고쳐 묻는 말은 서로 다른 id로 세 개 이상이에요.');
    if (!followUps.some(f => !f.specific)) problems.push('막연한 고쳐 묻기가 하나 이상 있어야 해요.');
    for (const f of followUps) {
      const slots = Object.keys(f.change) as PromptSlotId[];
      if (!f.text.trim() || !f.feedback.trim()) problems.push(`${f.id}: 글이나 설명이 비어 있어요.`);
      if (!validRefs(data, f.change) || slots.some(slot => !f.change[slot])) problems.push(`${f.id}: 바꾸는 칸이나 선택지가 없어요.`);
      if (f.specific) {
        const slot = slots[0];
        if (slots.length !== 1 || optionOf(data, slot, f.change[slot])?.quality !== 'good' || !causes.includes(slot)) problems.push(`${f.id}: 구체적인 말은 문제 칸 하나를 좋은 선택지로 바꿔요.`);
      } else if (slots.some(slot => !causes.includes(slot) || optionOf(data, slot, f.change[slot])?.quality === 'good')) {
        problems.push(`${f.id}: 막연한 말은 문제 칸을 고치지 못하고, 다른 칸도 망가뜨리지 않아요.`);
      }
    }
    for (const slot of causes) if (!followUps.some(f => f.specific && Object.keys(f.change).includes(slot))) problems.push(`${slot}: 이 칸을 고치는 구체적인 말이 없어요.`);
    const fixed = followUps.filter(f => f.specific).reduce<PromptChoice>((choice, f) => applyFollowUp(choice, f), { ...hidden });
    const end = evaluatePrompt(data, fixed);
    if (problemSlots(data, fixed).length || !end.success || end.stars !== 3) problems.push('구체적인 말로 모두 고치면 의뢰를 해결해야 해요.');
  }
  return problems;
}
