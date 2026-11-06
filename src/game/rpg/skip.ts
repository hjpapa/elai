import { CHAPTERS } from '../../data/chapters';
import { MAPS } from '../../data/maps';
import { ITEMS } from '../../data/rpg/items';
import { MOBS } from '../../data/rpg/mobs';
import type { Chapter, EquipSlot, ItemDef } from '../../data/schema';
import type { GameState } from './state';

/** 앞 장을 하지 않고 장을 시작할 때 채워 주는 준비물 */
export interface SkipKit {
  /** 앞 장들의 미션·몹·상자 경험치를 모두 더한 값(그 장을 시작할 때의 누적 경험치) */
  xp: number;
  /** 앞 장들의 로비 부품(반복·조건·살펴보기 같은 전투 능력) */
  parts: string[];
  /** 앞 장들에서 얻는 장비 중 칸마다 가장 좋은 것 + 도우미 */
  items: string[];
}

/** 같은 칸 장비끼리 비교하는 점수 */
export function gearScore(item: ItemDef): number {
  const s = item.stats ?? {};
  return (s.maxHp ?? 0) + 3 * ((s.atk ?? 0) + (s.def ?? 0)) + 2 * (s.maxEn ?? 0);
}

/** 앞 장들을 차례로 했다면 이 장을 시작할 때 가졌을 것 */
export function skipKit(chapter: Chapter): SkipKit {
  let xp = 0;
  const parts: string[] = [];
  const found: string[] = [];
  for (const c of CHAPTERS.filter((x) => x.index < chapter.index)) {
    for (const p of c.parts) {
      for (const m of p.missions) {
        xp += m.reward?.xp ?? 0;
        if (m.reward?.robiPart) parts.push(m.reward.robiPart);
        for (const it of m.reward?.items ?? []) found.push(it.id);
      }
    }
    for (const map of Object.values(MAPS).filter((d) => d.chapter === c.id)) {
      for (const o of map.objects) {
        if (o.type === 'mob') xp += MOBS[o.mob]?.xp ?? 0;
        if (o.type === 'chest') {
          xp += o.reward.xp ?? 0;
          for (const it of o.reward.items ?? []) found.push(it.id);
        }
      }
    }
  }
  const best = new Map<EquipSlot, ItemDef>();
  const helpers: string[] = [];
  for (const id of new Set(found)) {
    const item = ITEMS[id];
    if (item?.kind === 'equip' && item.slot) {
      const cur = best.get(item.slot);
      if (!cur || gearScore(item) > gearScore(cur)) best.set(item.slot, item);
    } else if (item?.kind === 'helper') helpers.push(id);
  }
  return { xp, parts: [...new Set(parts)], items: [...[...best.values()].map((i) => i.id), ...helpers] };
}

export interface SkipResult {
  xp: number;
  levelUps: number[];
  parts: string[];
  items: string[];
  /** 새로 낀 장비 */
  equipped: string[];
}

/**
 * 모자란 준비물만 채워요(이미 가진 부품·장비, 더 많은 경험치는 그대로).
 * 장비는 지금 낀 것보다 좋으면 바로 껴요. 받은 게 없으면 null.
 * 배지·마을 복구·장 완료 기록은 주지 않아요(학생이 실제로 한 것만 남겨요).
 */
export function applySkipKit(state: GameState, chapter: Chapter): SkipResult | null {
  const kit = skipKit(chapter);
  const parts = kit.parts.filter((id) => !state.data.robiParts.includes(id));
  const items = kit.items.filter((id) => state.itemQty(id) === 0);
  const xp = Math.max(0, kit.xp - state.data.xp);
  for (const id of items) state.addItem(id);
  for (const id of parts) state.applyReward({ robiPart: id });
  const equipped: string[] = [];
  for (const id of kit.items) {
    const item = ITEMS[id];
    if (!item?.slot) continue;
    const worn = state.data.equipment[item.slot];
    const cur = worn ? ITEMS[worn] : undefined;
    if ((!cur || gearScore(item) > gearScore(cur)) && state.equip(id)) equipped.push(id);
  }
  const levelUps = state.addXp(xp);
  if (!parts.length && !items.length && !xp && !equipped.length) return null;
  state.fullHeal();
  return { xp, levelUps, parts, items, equipped };
}
