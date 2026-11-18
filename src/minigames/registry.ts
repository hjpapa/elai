import { CATALOG } from './catalog';
import { MazeGame } from './maze/MazeGame';
import { BakeryGame } from './bakery/BakeryGame';
import { ClawGame } from './claw/ClawGame';
import { FruitGame } from './fruit/FruitGame';
import { LightGame } from './light/LightGame';
import { RouteGame } from './route/RouteGame';
import { SortGame } from './sort/SortGame';
import type { MinigameDef } from './types';

/** 놀이 기계(맵 오브젝트 type 'game'의 game)가 여는 미니게임 */
const definitions = {
  mazemaker: { id: 'mazemaker', title: '코딩 미로 만들기', create: () => new MazeGame() },
  claw: { id: 'claw', title: '코딩 인형뽑기', create: () => new ClawGame() },
  sort: { id: 'sort', title: '코딩 택배 분류', create: () => new SortGame() },
  light: { id: 'light', title: '코딩 불빛 그림', create: () => new LightGame() },
  route: { id: 'route', title: '코딩 길찾기', create: () => new RouteGame() },
  bakery: { id: 'bakery', title: '주문서 빵집', create: () => new BakeryGame() },
  fruit: { id: 'fruit', title: '과일 AI 가르치기', create: () => new FruitGame() },
} satisfies Record<string, MinigameDef>;

export const MINIGAMES: Record<string, MinigameDef> = Object.fromEntries(
  CATALOG.map(({ id }) => [id, definitions[id]]),
);
