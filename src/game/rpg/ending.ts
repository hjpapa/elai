import type { SaveData } from '../../data/schema';
export const ENDING_BADGES = Array.from({ length: 8 }, (_, i) => 'badge-' + (i + 1));
/** 개수만 보지 않고 여덟 장의 서로 다른 배지와 마지막 설명 완료를 확인해요. */
export function hasEndingRequirements(save: SaveData): boolean {
  return !!save.flags['ch8-clear'] && ENDING_BADGES.every(id => save.badges.includes(id));
}
export function shouldShowEnding(save: SaveData): boolean {
  return hasEndingRequirements(save) && save.location.map === 'village' && !save.flags['ending-seen'];
}
