import type { GameState } from '../game/rpg/state';

/** 놀이 판의 열림 조건: 이 미션을 끝냈거나, (앞 장을 건너뛴 학생은) 이 로비 부품이 있으면 열려요. 조건이 없으면 늘 열려요. */
export function minigameUnlocked(state: GameState, cond: { mission: string; part?: string } | undefined): boolean {
  if (!cond) return true;
  return state.missionDone(cond.mission) || (!!cond.part && state.data.robiParts.includes(cond.part));
}
