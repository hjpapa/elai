import type { Chapter, Mission, Part } from '../schema';
import { ch0 } from './ch0';
import { ch1 } from './ch1';
import { ch2 } from './ch2';
import { ch3 } from './ch3';
import { ch4 } from './ch4';
import { ch5 } from './ch5';
import { ch6 } from './ch6';
import { ch7 } from './ch7';
import { ch8 } from './ch8';

export const CHAPTERS: readonly Chapter[] = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8];

export interface MissionEntry {
  mission: Mission;
  part: Part;
  chapter: Chapter;
}

const missionIndex = new Map<string, MissionEntry>();
const partIndex = new Map<string, { part: Part; chapter: Chapter }>();
for (const chapter of CHAPTERS) {
  for (const part of chapter.parts) {
    partIndex.set(part.id, { part, chapter });
    for (const mission of part.missions) missionIndex.set(mission.id, { mission, part, chapter });
  }
}

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getMission(id: string): MissionEntry | undefined {
  return missionIndex.get(id);
}

export function getPart(id: string): { part: Part; chapter: Chapter } | undefined {
  return partIndex.get(id);
}

export function allMissions(): MissionEntry[] {
  return [...missionIndex.values()];
}

/** 미션에 데이터가 있어 지금 플레이할 수 있는지 */
export function isPlayable(m: Mission): boolean {
  return m.data !== undefined;
}
