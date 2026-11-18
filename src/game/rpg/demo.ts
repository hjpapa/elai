import { CHAPTERS, getMission } from '../../data/chapters';
import { MAPS } from '../../data/maps';
import type { SaveData } from '../../data/schema';
import { applySkipKit } from './skip';
import { freshSave, GameState } from './state';

export function isDemoSearch(search: string): boolean {
  return new URLSearchParams(search).has('demo');
}

export function buildDemoSave(stop: number, settings?: SaveData['settings']): SaveData {
  if (!Number.isInteger(stop) || stop < 0 || stop > 9) throw new RangeError('시연 장 번호가 범위를 벗어났어요.');
  const state = new GameState(freshSave('시연'));
  if (settings) state.data.settings = { ...settings };
  for (const chapter of CHAPTERS.filter(c => c.index < stop)) {
    for (const part of chapter.parts) {
      for (const mission of part.missions) {
        state.completeMission(mission.id, { success: true, stars: 3, attempts: 1, hints: 0 });
      }
    }
  }
  const chapter = CHAPTERS[Math.min(stop, 8)];
  applySkipKit(state, chapter);
  const train = getMission('ch5-p3-m1')?.mission;
  if (stop > 5 && train?.kind === 'train' && train.data) {
    state.setClassificationModel({ samples: train.data.examples, k: train.data.k ?? 3 });
  }
  const map = MAPS[stop === 9 ? 'village' : chapter.entryMap ?? 'village'];
  state.fullHeal();
  state.setLocation(map.id, map.spawn.x, map.spawn.y);
  return state.data;
}
