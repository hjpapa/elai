import type { FactCheckData } from '../../data/schema';

export interface FactCheckAnswer { choice: number; source: string }

/** 어느 자료에서도 찾을 수 없는 말의 근거 값 */
export const NO_SOURCE = 'none';

function validAsks(data: FactCheckData): boolean {
  const asks = data.asks;
  if (!asks) return true;
  const ids = new Set(asks.map(ask => ask.id));
  return asks.length >= 2 && ids.size === asks.length && !ids.has('')
    && data.claims.every(claim => !!claim.ask && ids.has(claim.ask))
    && asks.every(ask => data.claims.some(claim => claim.ask === ask.id));
}

/**
 * 문장의 판단과 근거, 해당 자료를 열어 본 기록을 함께 확인해요.
 * 자료에 없는 말('none')은 모든 자료를 읽은 뒤에만 고를 수 있어요.
 */
export function evaluateFactCheck(
  data: FactCheckData,
  answers: Record<string, FactCheckAnswer>,
  readSources: readonly string[],
  compareAnswer: number | null = null,
): boolean {
  const sources = new Set(data.sources.map(source => source.id));
  const claims = new Set(data.claims.map(claim => claim.id));
  if (!data.claims.length || sources.size !== data.sources.length || claims.size !== data.claims.length) return false;
  if (sources.has('') || sources.has(NO_SOURCE) || claims.has('') || Object.keys(answers).some(id => !claims.has(id))) return false;
  if (readSources.some(id => !sources.has(id))) return false;
  if (!validAsks(data)) return false;
  if (data.compare && compareAnswer !== data.compare.answer) return false;
  const readAll = data.sources.every(source => readSources.includes(source.id));
  return data.claims.every(claim => {
    const answer = answers[claim.id];
    const grounded = claim.source === NO_SOURCE
      ? answer?.source === NO_SOURCE && readAll
      : sources.has(claim.source) && answer?.source === claim.source && readSources.includes(claim.source);
    return !!answer && Number.isInteger(claim.answer) && claim.answer >= 0 && claim.answer < claim.choices.length
      && Number.isInteger(answer.choice) && answer.choice === claim.answer && grounded;
  });
}

function validQuestion(q: { q: string; choices: string[]; answer: number } | undefined): boolean {
  return !!q && !!q.q.trim() && q.choices.length >= 2 && q.choices.every(c => !!c.trim()) && new Set(q.choices).size === q.choices.length
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length;
}

/** 데이터 점검: 문장마다 판단과 근거가 정해져 있고, 두 답 비교가 실제로 비교할 거리를 갖는지 봐요. */
export function factCheckProblems(data: FactCheckData): string[] {
  const problems: string[] = [];
  const sources = new Set(data.sources.map(s => s.id));
  if (!data.sources.length || sources.size !== data.sources.length || sources.has('') || sources.has(NO_SOURCE)) problems.push('자료 id를 살펴요(비거나 겹치거나 none이에요).');
  if (data.sources.some(s => !s.title.trim() || !s.text.trim())) problems.push('자료의 제목이나 글이 비어 있어요.');
  if (!data.claims.length || new Set(data.claims.map(c => c.id)).size !== data.claims.length) problems.push('문장 id가 비었거나 겹쳐요.');
  for (const claim of data.claims) {
    if (!claim.text.trim()) problems.push(`${claim.id}: 문장이 비어 있어요.`);
    if (claim.source !== NO_SOURCE && !sources.has(claim.source)) problems.push(`${claim.id}: 근거 자료가 없어요.`);
    if (!validQuestion({ q: claim.text, choices: claim.choices, answer: claim.answer })) problems.push(`${claim.id}: 보기와 답을 살펴요.`);
  }
  if (data.asks) {
    if (!validAsks(data)) problems.push('두 답은 서로 다른 id로 두 개 이상이고, 문장마다 어느 답인지 적어요.');
    if (data.asks.some(a => !a.label.trim() || !a.prompt.trim())) problems.push('부탁의 이름이나 글이 비어 있어요.');
    if (!data.claims.some(c => c.source === NO_SOURCE)) problems.push('자료에 없는 말이 하나 이상 있어야 해요.');
    if (!data.claims.some(c => c.source !== NO_SOURCE)) problems.push('자료로 확인할 수 있는 말이 하나 이상 있어야 해요.');
    if (!data.compare) problems.push('두 답을 비교하는 질문이 있어야 해요.');
  }
  if (data.compare && !validQuestion(data.compare)) problems.push('비교 질문의 보기와 답을 살펴요.');
  return problems;
}
