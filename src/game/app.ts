import type Phaser from 'phaser';
import type { MissionHost } from '../missions/core/MissionHost';
import type { Hud } from '../ui/hud';
import type { UI } from '../ui/ui';
import type { GameState } from './rpg/state';

/** 게임 전체에서 함께 쓰는 것들. main.ts와 제목 화면이 시작할 때 채워요. */
export const app = {} as {
  game: Phaser.Game;
  state: GameState;
  ui: UI;
  hud: Hud;
  missions: MissionHost;
};
