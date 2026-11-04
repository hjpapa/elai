import { NPCS } from '../data/npcs';
import { ITEMS } from '../data/rpg/items';
import { ROBI_PARTS } from '../data/rpg/robiParts';
import type { SaveData } from '../data/schema';
import { composite, icon } from './icons';

/** 장비를 겹친 플레이어 모습(앞 대기 프레임) */
export function playerLook(save: SaveData, frame = 0): string {
  const layers = [{ key: 'char-player', frame }];
  for (const slot of ['hat', 'tool'] as const) {
    const id = save.equipment[slot];
    const overlay = id ? ITEMS[id]?.overlay : undefined;
    if (overlay) layers.push({ key: overlay, frame });
  }
  return composite(layers);
}

export function robiLook(save: SaveData, frame = 0): string {
  const layers = [{ key: 'char-robi', frame }];
  for (const id of save.robiParts) {
    const overlay = ROBI_PARTS[id]?.overlay;
    if (overlay) layers.push({ key: overlay, frame });
  }
  return composite(layers);
}

/** 대화창 얼굴 그림 */
export function portraitFor(save: SaveData, who: string): string {
  if (who === 'player') return playerLook(save);
  if (who === 'robi') return robiLook(save);
  const npc = NPCS[who];
  return npc ? icon(npc.sprite, 0) : '';
}
