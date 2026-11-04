import { ITEMS } from '../../data/rpg/items';
import { baseSlots, baseStats } from '../../data/rpg/levels';
import { ROBI_PARTS } from '../../data/rpg/robiParts';
import type { SaveData, Stats } from '../../data/schema';

/** 레벨 + 장비로 계산한 능력치 */
export function derivedStats(save: SaveData): Stats {
  const s = baseStats(save.level);
  for (const id of Object.values(save.equipment)) {
    const item = id ? ITEMS[id] : undefined;
    if (!item?.stats) continue;
    s.maxHp += item.stats.maxHp ?? 0;
    s.maxEn += item.stats.maxEn ?? 0;
    s.atk += item.stats.atk ?? 0;
    s.def += item.stats.def ?? 0;
  }
  return s;
}

/** 전투 프로그램 칸 수(레벨 + 로비 부품) */
export function programSlots(save: SaveData): number {
  const bonus = save.robiParts.reduce((n, id) => n + (ROBI_PARTS[id]?.slotBonus ?? 0), 0);
  return Math.min(8, baseSlots(save.level) + bonus);
}

/** 학습 도우미: 장착한 디버그 안경, 가진 순서도 지도 */
export function helpers(save: SaveData): { debugGlasses: boolean; flowMap: boolean } {
  const equipped = new Set(Object.values(save.equipment));
  const owned = new Set(save.inventory.filter((s) => s.qty > 0).map((s) => s.id));
  let debugGlasses = false;
  let flowMap = false;
  for (const item of Object.values(ITEMS)) {
    if (item.effect?.helper === 'debugGlasses' && equipped.has(item.id)) debugGlasses = true;
    if (item.effect?.helper === 'flowMap' && owned.has(item.id)) flowMap = true;
  }
  return { debugGlasses, flowMap };
}
