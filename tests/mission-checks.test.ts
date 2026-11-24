import { expect, it } from 'vitest';
import { allMissions } from '../src/data/chapters';
import { factCheckProblems } from '../src/missions/factCheck/evaluate';
import { nextWordProblems } from '../src/missions/nextWord/evaluate';
import { promptProblems } from '../src/missions/prompt/evaluate';

it('다음 말·주문서·사실 확인 미션의 데이터는 학생이 끝까지 풀 수 있게 짜였어요', () => {
  let checked = 0;
  for (const { mission } of allMissions()) {
    if (!mission.data) continue;
    if (mission.kind === 'nextWord') { expect(nextWordProblems(mission.data), mission.id).toEqual([]); checked++; }
    if (mission.kind === 'prompt') { expect(promptProblems(mission.data), mission.id).toEqual([]); checked++; }
    if (mission.kind === 'factCheck') { expect(factCheckProblems(mission.data), mission.id).toEqual([]); checked++; }
  }
  expect(checked).toBeGreaterThanOrEqual(8);
});
