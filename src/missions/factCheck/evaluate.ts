import type { FactCheckData } from '../../data/schema';

export interface FactCheckAnswer { choice: number; source: string }

/** 문장의 판단과 근거, 해당 자료를 열어 본 기록을 함께 확인해요. */
export function evaluateFactCheck(
  data: FactCheckData,
  answers: Record<string, FactCheckAnswer>,
  readSources: readonly string[],
): boolean {
  const sources = new Set(data.sources.map(source => source.id));
  const claims = new Set(data.claims.map(claim => claim.id));
  if (!data.claims.length || sources.size !== data.sources.length || claims.size !== data.claims.length) return false;
  if (sources.has('') || claims.has('') || Object.keys(answers).some(id => !claims.has(id))) return false;
  if (readSources.some(id => !sources.has(id))) return false;
  return data.claims.every(claim => {
    const answer = answers[claim.id];
    return !!answer && Number.isInteger(claim.answer) && claim.answer >= 0 && claim.answer < claim.choices.length
      && Number.isInteger(answer.choice) && answer.choice === claim.answer
      && sources.has(claim.source) && answer.source === claim.source && readSources.includes(claim.source);
  });
}
