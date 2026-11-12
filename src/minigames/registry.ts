import { ClawGame } from './claw/ClawGame';
import { LightGame } from './light/LightGame';
import { SortGame } from './sort/SortGame';
import type { MinigameDef } from './types';

/** 놀이 기계(맵 오브젝트 type 'game'의 game)가 여는 미니게임 */
export const MINIGAMES: Record<string, MinigameDef> = {
  claw: { id: 'claw', title: '코딩 인형뽑기', create: () => new ClawGame() },
  sort: { id: 'sort', title: '코딩 택배 분류', create: () => new SortGame() },
  light: { id: 'light', title: '코딩 불빛 그림', create: () => new LightGame() },
};
