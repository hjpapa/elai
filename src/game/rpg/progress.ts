import { CHAPTERS, getMission } from '../../data/chapters';
import { npcName } from '../../data/npcs';
import { josa } from '../../ui/dom';
import type { GameState } from './state';

/**
 * 미션을 시작할 수 있는지: 같은 장 안에서는 앞 미션을 모두 끝내야 해요.
 * 미리 해 보기(preview) 장은 같은 파트 안의 앞 미션만 보면 돼요.
 */
export function canStart(state: GameState, missionId: string): boolean {
  const e = getMission(missionId);
  if (!e?.mission.data) return false;
  const scope = e.chapter.status === 'preview' ? [e.part] : e.chapter.parts;
  for (const part of scope) {
    for (const m of part.missions) {
      if (m.id === missionId) return true;
      if (!state.missionDone(m.id)) return false;
    }
  }
  return true;
}

/** 지금 무엇을 하면 되는지 한 줄 안내 */
export function objective(state: GameState): string {
  for (const chapter of CHAPTERS) {
    if (chapter.status !== 'playable') continue;
    for (const part of chapter.parts) {
      const m = part.missions.find((x) => !state.missionDone(x.id));
      if (!m) continue;
      if (m.id === 'ch1-boss-m1') return '숲 미로 깊은 곳의 수호자를 찾아가요. 열쇠는 미로 어딘가에!';
      const who = m.npc ? npcName(m.npc) : '';
      return who ? `${josa(who, '을', '를')} 찾아가요 · ${part.title}` : part.title;
    }
  }
  const preview = getMission('ch7-p2-m2');
  if (preview && !state.missionDone('ch7-p2-m2')) return '1장 완료! 마을의 프롬프트 공방도 미리 해 봐요.';
  return '1장을 모두 끝냈어요! 2장은 곧 열려요.';
}
