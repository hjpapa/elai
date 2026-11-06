import { CHAPTERS } from '../../data/chapters';
import type { Chapter, SaveData } from '../../data/schema';

/**
 * 학급에서 선생님이 연 장(장 id 목록). 학급 없는 체험 모드는 null이에요.
 * 게임(문·목표 안내)과 교사 페이지(학생 길·진행 중인 장)가 같은 규칙을 써요.
 *
 * 규칙
 * - 체험 모드: 앞 장을 끝내면 다음 장이 차례로 열려요.
 * - 학급: 선생님이 연 장까지만 들어가요(0·1장은 늘 열려 있어요).
 *   바로 앞 장도 열려 있으면 그 장을 끝내야 하고,
 *   바로 앞 장이 닫혀 있으면 마을 연습(0장)을 마친 뒤 그 장부터 바로 시작해요(건너뛰기).
 */
export type ClassUnlock = readonly string[] | null;

/** 마을에서 늘 미리 해 볼 수 있는 7장 체험 미션 */
export const PREVIEW_MISSIONS: readonly string[] = ['ch7-p2-m1', 'ch7-p2-m2'];

type Done = (missionId: string) => boolean;

const doneIn = (save: SaveData): Done => (id) => save.missions[id]?.done === true;

/** 학급에서 들어갈 수 있는 장인지(체험 모드는 모두) */
export function isOpened(unlock: ClassUnlock, chapter: Chapter): boolean {
  return !unlock || chapter.index <= 1 || unlock.includes(chapter.id);
}

/** 장의 미션을 모두 끝냈는지 */
export function chapterDone(chapter: Chapter, done: Done): boolean {
  return chapter.parts.every((p) => p.missions.every((m) => done(m.id)));
}

/** 마을 연습(0장)을 마쳤는지: 건너뛰기 전에 조작·로비·첫 장비·연습 전투는 꼭 해요. */
export function tutorialDone(save: SaveData): boolean {
  return chapterDone(CHAPTERS[0], doneIn(save));
}

/**
 * 학생이 차례로 지나갈 장들.
 * 체험 모드는 0~8장 전체. 학급은 0장, (2장이 열려 있거나 연 장이 없으면) 1장, 그리고 선생님이 연 장들이에요.
 */
export function classPath(unlock: ClassUnlock): Chapter[] {
  if (!unlock) return [...CHAPTERS];
  const first = CHAPTERS.find((c) => c.index >= 2 && unlock.includes(c.id));
  return CHAPTERS.filter((c) => {
    if (c.index === 0) return true;
    if (c.index === 1) return !first || first.index === 2;
    return unlock.includes(c.id);
  });
}

/** 바로 앞 장이 닫혀 있어서 이 장부터 바로 시작할 수 있는지(학급만) */
export function startsDirectly(unlock: ClassUnlock, chapter: Chapter): boolean {
  if (!unlock || chapter.index < 2 || !unlock.includes(chapter.id)) return false;
  const previous = CHAPTERS.find((c) => c.index === chapter.index - 1);
  return !!previous && !isOpened(unlock, previous);
}

export type Gate = { open: true; skip: boolean } | { open: false; reason: 'teacher' | 'previous' | 'tutorial' };

/**
 * 2장부터의 장 입구에 들어갈 수 있는지.
 * previousCleared: 바로 앞 장을 끝냈는지(마을 문의 열림 조건).
 * skip이 true면 앞 장을 하지 않고 들어가는 것이라 준비물(skipKit)을 채워 줘요.
 */
export function chapterGate(save: SaveData, unlock: ClassUnlock, chapter: Chapter, previousCleared: boolean): Gate {
  if (!isOpened(unlock, chapter)) return { open: false, reason: 'teacher' };
  if (previousCleared) return { open: true, skip: false };
  if (!startsDirectly(unlock, chapter)) return { open: false, reason: 'previous' };
  if (!tutorialDone(save)) return { open: false, reason: 'tutorial' };
  return { open: true, skip: true };
}

/**
 * 목표 안내 순서: 지금 있는 장(here: 지금 맵의 장 id)이 길 위에 있으면 그 장을 먼저, 그다음 길 순서.
 * 학급에서 앞 장을 남겨 두고 뒤의 장부터 바로 들어갔을 때, 그 장 안에서는 그 장을 안내해요.
 */
export function guideOrder(unlock: ClassUnlock, here?: string): Chapter[] {
  const path = classPath(unlock);
  const cur = path.find((c) => c.id === here);
  return cur ? [cur, ...path.filter((c) => c !== cur)] : path;
}

/** 지금 하고 있는 장: 안내 순서에서 아직 끝내지 않은 첫 장(모두 끝냈으면 길의 마지막 장) */
export function currentChapter(unlock: ClassUnlock, done: Done, here?: string): Chapter {
  const path = classPath(unlock);
  return guideOrder(unlock, here).find((c) => c.parts.some((p) => p.missions.some((m) => m.data !== undefined && !done(m.id)))) ?? path[path.length - 1];
}
