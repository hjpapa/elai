import { MAZE_ROUNDS, MAZE_TITLE } from '../data/minigames/maze';
import { CLAW_ROUNDS, CLAW_TITLE } from '../data/minigames/claw';
import { SORT_ROUNDS, SORT_TITLE } from '../data/minigames/sort';
import { LIGHT_ROUNDS, LIGHT_TITLE } from '../data/minigames/light';
import { ROUTE_ROUNDS, ROUTE_TITLE } from '../data/minigames/route';
import { BAKERY_ROUNDS, BAKERY_TITLE } from '../data/minigames/bakery';
import { FRUIT_ROUNDS, FRUIT_TITLE } from '../data/minigames/fruit';

import type { GameState } from '../game/rpg/state';
import { minigameUnlocked } from './progress';

export const CATALOG = [
  { id: 'claw', building: '마을 공방', map: 'workroom', name: '코딩 인형뽑기', icon: 'icon-card-grab', rounds: CLAW_ROUNDS, title: CLAW_TITLE },
  { id: 'sort', building: '마을 택배소', map: 'parcel', name: '코딩 택배 분류', icon: 'icon-stamp', rounds: SORT_ROUNDS, title: SORT_TITLE },
  { id: 'light', building: '마을 불빛 가게', map: 'lightshop', name: '코딩 불빛 그림', icon: 'icon-bulb-on', rounds: LIGHT_ROUNDS, title: LIGHT_TITLE },
  { id: 'route', building: '마을 지도방', map: 'maproom', name: '코딩 길찾기', icon: 'icon-goal', rounds: ROUTE_ROUNDS, title: ROUTE_TITLE },
  { id: 'bakery', building: '마을 빵집', map: 'bakery', name: '주문서 빵집', icon: 'icon-cake', rounds: BAKERY_ROUNDS, title: BAKERY_TITLE },
  { id: 'fruit', building: '마을 과일 가게', map: 'fruitshop', name: '과일 AI 가르치기', icon: 'icon-fruit', rounds: FRUIT_ROUNDS, title: FRUIT_TITLE },
  { id: 'mazemaker', building: '마을 미로 공작소', map: 'mazeroom', name: '코딩 미로 만들기', icon: 'icon-maze', rounds: MAZE_ROUNDS, title: MAZE_TITLE },
] as const;

/** 미션을 끝내기 전후에 열려 있는 판을 비교해요. */
export function openedRounds(state: GameState): Set<string> {
  const opened = new Set<string>();
  for (const game of CATALOG) {
    for (const round of game.rounds) {
      if (minigameUnlocked(state, round.unlock)) opened.add(game.id + '/' + round.id);
    }
  }
  return opened;
}

export function newlyOpened(before: ReadonlySet<string>, after: ReadonlySet<string>): string[] {
  return CATALOG.flatMap(game => {
    const numbers = game.rounds.flatMap((r, i) => {
      const key = game.id + '/' + r.id;
      return after.has(key) && !before.has(key) ? [i + 1] : [];
    });
    return numbers.length ? [game.building + ' ' + numbers.join('·') + '판'] : [];
  });
}
