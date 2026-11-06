import type Phaser from 'phaser';
import type { MissionHost } from '../missions/core/MissionHost';
import type { ClassLink } from '../services/remote';
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
  /** 학급으로 들어왔으면 학급 정보(체험 모드면 null) */
  classLink: ClassLink | null;
};

/** 선생님이 연 장(체험 모드면 null: 앞 장을 끝내면 차례로 열려요) */
export function classUnlock(): readonly string[] | null {
  return app.classLink ? (app.classLink.unlocked ?? []) : null;
}
