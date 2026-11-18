import { cleanMinigames } from '../game/rpg/state';
import { CATALOG } from '../minigames/catalog';
import { h } from '../ui/dom';

/** 학생 한 명의 놀이 하나 기록 */
export interface GameScore {
  id: string;
  name: string;
  building: string;
  /** 판마다 가장 좋은 별(아직 깨지 않은 판은 0) */
  rounds: number[];
  stars: number;
  cleared: number;
}

/** 저장의 놀이 기록을 놀이별로 모아요. 학생 기기에서 올라온 값이라 지금 있는 판의 1~3 별만 세요. */
export function minigameScores(raw: unknown): GameScore[] {
  const saved = cleanMinigames(raw);
  return CATALOG.map((game) => {
    const best = saved[game.id] ?? {};
    const rounds = game.rounds.map((round) => best[round.id] ?? 0);
    return {
      id: game.id,
      name: game.name,
      building: game.building,
      rounds,
      stars: rounds.reduce((sum, n) => sum + n, 0),
      cleared: rounds.filter((n) => n > 0).length,
    };
  });
}

export const MINIGAME_CSV_HEADER: string[] = CATALOG.map((game) => game.name);

/** CSV의 놀이별 별 합계(한 판도 깨지 않았으면 미션처럼 빈칸) */
export function minigameCsvCells(raw: unknown): string[] {
  return minigameScores(raw).map((score) => (score.cleared ? String(score.stars) : ''));
}

function scoreCell(stars: number, cleared: number, rounds: number, title?: string): HTMLTableCellElement {
  if (!cleared) return h('td', {}, '·');
  return h('td', { title }, h('span', { class: 'stars' }, `★ ${stars}/${rounds * 3}`), h('small', {}, `${cleared}/${rounds}판`));
}

/** 학생별 마을 놀이 표: 놀이마다 받은 별과 깬 판 수를 보여 줘요. */
export function minigameTable(students: readonly { id: string; nickname: string }[], rawOf: (id: string) => unknown): HTMLTableElement {
  const thead = h(
    'thead',
    {},
    h('tr', {}, h('th', {}, '별명'), ...CATALOG.map((game) => h('th', { title: game.building }, game.name)), h('th', { title: '여섯 놀이를 모두 더한 값' }, '합계')),
  );
  const tbody = h('tbody');
  for (const student of students) {
    const scores = minigameScores(rawOf(student.id));
    const cells = scores.map((score) =>
      scoreCell(score.stars, score.cleared, score.rounds.length, score.rounds.map((n, i) => `${i + 1}판 별 ${n}개`).join(' · ')),
    );
    const sum = (pick: (score: GameScore) => number) => scores.reduce((total, score) => total + pick(score), 0);
    tbody.append(h('tr', {}, h('td', {}, student.nickname), ...cells, scoreCell(sum((s) => s.stars), sum((s) => s.cleared), sum((s) => s.rounds.length))));
  }
  return h('table', { class: 't-table' }, thead, tbody);
}
