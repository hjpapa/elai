import type { Stats } from '../schema';

export const MAX_LEVEL = 30;
export const MAX_SLOTS = 8;

/** 레벨 n이 되는 데 필요한 누적 경험치 */
export function xpForLevel(level: number): number {
  return 5 * (level - 1) * (level + 4);
}

/** 누적 경험치 → 레벨 */
export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** 레벨에 따른 기본 능력치(장비 제외) */
export function baseStats(level: number): Stats {
  return {
    maxHp: 20 + 5 * (level - 1),
    maxEn: 3 + Math.floor((level - 1) / 2),
    atk: 3 + (level - 1),
    def: 1 + Math.floor((level - 1) / 2),
  };
}

/** 전투 프로그램 칸 수(로비 부품 보너스 제외) */
export function baseSlots(level: number): number {
  return Math.min(MAX_SLOTS, 3 + Math.floor((level - 1) / 2));
}
