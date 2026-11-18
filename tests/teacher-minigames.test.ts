import { describe, expect, it } from 'vitest';
import { CATALOG } from '../src/minigames/catalog';
import { MINIGAME_CSV_HEADER, minigameCsvCells, minigameScores } from '../src/teacher/minigames';

const byId = (raw: unknown) => new Map(minigameScores(raw).map((score) => [score.id, score]));

describe('교사 페이지 마을 놀이 기록', () => {
  it('놀이마다 판별 최고 별과 깬 판 수를 모아요', () => {
    const [first, second] = CATALOG[0].rounds;
    const score = byId({ [CATALOG[0].id]: { [first.id]: 3, [second.id]: 2 } }).get(CATALOG[0].id)!;
    expect(score).toMatchObject({ name: CATALOG[0].name, building: CATALOG[0].building, stars: 5, cleared: 2 });
    expect(score.rounds).toEqual([3, 2, 0, 0, 0, 0]);
  });

  it('학생 저장의 이상한 값과 없는 놀이·판은 세지 않아요', () => {
    const [first, second, third, fourth] = CATALOG[1].rounds;
    const scores = byId({
      [CATALOG[1].id]: { [first.id]: 1, [second.id]: 9, [third.id]: 1.5, [fourth.id]: '3', 없는판: 3 },
      [CATALOG[0].id]: '전부 깼어요',
      없는놀이: { r1: 3 },
    });
    expect(scores.size).toBe(CATALOG.length);
    expect(scores.get(CATALOG[1].id)).toMatchObject({ stars: 1, cleared: 1 });
    expect(scores.get(CATALOG[0].id)).toMatchObject({ stars: 0, cleared: 0 });
  });

  it.each([[undefined], [null], [[]], ['글자'], [3]])('기록이 없거나 모양이 다르면(%s) 모두 0이에요', (raw) => {
    for (const score of minigameScores(raw)) {
      expect(score).toMatchObject({ stars: 0, cleared: 0 });
      expect(score.rounds).toHaveLength(6);
    }
  });

  it('CSV 칸은 머리글과 같은 순서이고, 안 한 놀이는 빈칸이에요', () => {
    const last = CATALOG[CATALOG.length - 1];
    const cells = minigameCsvCells({ [last.id]: { [last.rounds[0].id]: 3 } });
    expect(MINIGAME_CSV_HEADER).toEqual(CATALOG.map((game) => game.name));
    expect(cells).toEqual([...CATALOG.slice(0, -1).map(() => ''), '3']);
  });
});
