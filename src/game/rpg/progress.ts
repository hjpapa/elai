import { hasEndingRequirements } from './ending';
import { CHAPTERS, getMission } from '../../data/chapters';
import { MAPS } from '../../data/maps';
import { npcName } from '../../data/npcs';
import type { Chapter, MapObject } from '../../data/schema';
import { josa } from '../../ui/dom';
import type { GameState } from './state';
import { PREVIEW_MISSIONS, chapterDone, chapterGate, guideOrder, isOpened, type ClassUnlock } from './unlock';

/**
 * 미션을 시작할 수 있는지: 같은 장 안에서는 앞 미션을 모두 끝내야 해요.
 * 미리 해 보기(preview) 장은 같은 파트 안의 앞 미션만 보면 돼요.
 */
export function canStart(state: GameState, missionId: string): boolean {
  const e = getMission(missionId);
  if (!e?.mission.data) return false;
  const previewMission = PREVIEW_MISSIONS.includes(missionId);
  const scope = e.chapter.status === 'preview' || previewMission ? [e.part] : e.chapter.parts;
  for (const part of scope) {
    for (const m of part.missions) {
      if (m.id === missionId) return true;
      if (!state.missionDone(m.id)) return false;
    }
  }
  return true;
}

type Portal = Extract<MapObject, { type: 'portal' }>;

/** 장 입구 문(다른 곳에서 2장부터의 첫 맵으로 가는 문)이면 그 장 */
export function entryChapter(mapId: string, portal: Portal): Chapter | undefined {
  const chapter = CHAPTERS.find((c) => c.index >= 2 && c.entryMap === portal.to.map);
  return chapter && MAPS[mapId]?.chapter !== chapter.id ? chapter : undefined;
}

export interface PortalGate {
  open: boolean;
  /** 닫혀 있을 때 보여 줄 말 */
  text?: string;
  /** 앞 장을 건너뛰고 들어가는 장(준비물을 채워 줘요) */
  skip?: Chapter;
}

export const LOCKED_BY_TEACHER = '선생님이 아직 열지 않았어요.\n열어 주시면 갈 수 있어요.';
export const LOCKED_BY_TUTORIAL = '마을 연습을 먼저 끝내요.\n그다음 이 문으로 갈 수 있어요.';

/** 문을 지나갈 수 있는지(장 입구 문은 학급 규칙을 따라요) */
export function portalGate(state: GameState, unlock: ClassUnlock, mapId: string, portal: Portal): PortalGate {
  const cleared = state.check(portal.open);
  const locked = portal.lockedText ?? '아직 갈 수 없어요.';
  const chapter = entryChapter(mapId, portal);
  if (!chapter) return cleared ? { open: true } : { open: false, text: locked };
  const gate = chapterGate(state.data, unlock, chapter, cleared);
  if (gate.open) return gate.skip ? { open: true, skip: chapter } : { open: true };
  return { open: false, text: gate.reason === 'teacher' ? LOCKED_BY_TEACHER : gate.reason === 'tutorial' ? LOCKED_BY_TUTORIAL : locked };
}

/** 지금 무엇을 하면 되는지 한 줄 안내(unlock: 학급이 연 장, 체험 모드는 null) */
export function objective(state: GameState, unlock: ClassUnlock = null): string {
  if (hasEndingRequirements(state.data) && !state.hasFlag('ending-seen')) return '마을로 돌아가 로비를 깨워요.';
  for (const chapter of guideOrder(unlock, MAPS[state.data.location.map]?.chapter)) {
    if (chapter.status !== 'playable') continue;
    for (const part of chapter.parts) {
      const m = part.missions.find((x) => !state.missionDone(x.id));
      if (!m) continue;
      if (chapter.entryMap && MAPS[state.data.location.map]?.chapter !== chapter.id) {
        if (chapter.id === 'ch2') return '마을 동쪽 다리를 건너 반복의 동굴로 가요.';
        if (chapter.index > 0) return `${MAPS[chapter.entryMap]?.name ?? chapter.title} 입구로 가요.`;
      }
      if (chapter.index >= 4 && part.kind === 'boss') {
        const dungeon = Object.values(MAPS).find(map => map.chapter === chapter.id && map.fog);
        const battle = part.missions.find(mission => mission.kind === 'battle' && mission.npc) ?? part.missions.find(mission => mission.npc);
        const who = battle?.npc ? npcName(battle.npc) : '안내자';
        return `${dungeon?.name ?? chapter.title}의 ${josa(who, '을', '를')} 찾아가요.`;
      }
      if (chapter.id === 'ch3' && part.kind === 'boss') return '모래 미로 끝의 도마뱀 대장을 찾아가요.';
      if (chapter.id === 'ch2' && part.kind === 'boss') return '되풀이 동굴 끝 방의 박쥐 대장을 찾아가요.';
      if (m.id === 'ch1-boss-m1') return '숲 미로 깊은 곳의 수호자를 찾아가요. 열쇠는 미로 어딘가에!';
      const who = m.npc ? npcName(m.npc) : '';
      return who ? `${josa(who, '을', '를')} 찾아가요 · ${part.title}` : part.title;
    }
  }
  const preview = getMission('ch7-p2-m2');
  if (preview && !state.missionDone('ch7-p2-m2')) return '마을의 프롬프트 공방도 미리 해 봐요.';
  const waiting = CHAPTERS.some((c) => !isOpened(unlock, c) && !chapterDone(c, (id) => state.missionDone(id)));
  if (waiting) return '다음 장은 선생님이 열어 주시면 갈 수 있어요.';
  return '열린 장을 모두 끝냈어요! 마을을 둘러봐요.';
}
