import { MAPS } from '../../data/maps';
import type { MapObject, Point } from '../../data/schema';
import { objectVisible } from '../iso/mapRuntime';
import { canStart, nextGoal, portalGate } from './progress';
import type { GameState } from './state';
import type { ClassUnlock } from './unlock';

type Npc = Extract<MapObject, { type: 'npc' }>;
type Portal = Extract<MapObject, { type: 'portal' }>;

/** 화면의 "길 안내" 단추가 월드에 보내는 신호 */
export const GUIDE_EVENT = 'elai:guide';

/**
 * 길 안내: 다음 할 일(nextGoal)을 하러 지금 맵에서 어디로 가야 하는지.
 * 목표 NPC가 다른 맵에 있으면, 열린 문만 따라가서 그쪽으로 가는 첫 문을 가리켜요.
 */
export interface GuideTarget {
  /** 지금 맵에서 가야 할 칸 */
  at: Point;
  /** npc: 미션을 주는 NPC, portal: 목적지 맵으로 가는 문 */
  kind: 'npc' | 'portal';
  /** 마지막 목적지 맵 */
  goalMap: string;
}

/** 이 NPC에게 지금 시작할 수 있는 미션이 있는지(머리 위 느낌표) */
export function hasNewMission(state: GameState, npc: Npc): boolean {
  return (npc.missions ?? []).some((id) => !state.missionDone(id) && canStart(state, id));
}

/** 미션을 주는 NPC(보이는 NPC만). 지금 맵(prefer)에 있으면 그쪽이 먼저예요. */
export function missionGiver(state: GameState, missionId: string, prefer?: string): { map: string; npc: Npc } | null {
  let found: { map: string; npc: Npc } | null = null;
  for (const map of Object.values(MAPS)) {
    for (const o of map.objects) {
      if (o.type !== 'npc' || !o.missions?.includes(missionId) || !objectVisible(map.id, o, state)) continue;
      if (map.id === prefer) return { map: map.id, npc: o };
      found ??= { map: map.id, npc: o };
    }
  }
  return found;
}

/** from 맵에서 to 맵으로 가는 첫 문. 보이고 열린 문만 따라가요(학급의 장 열기 규칙 포함). 길이 없으면 null */
export function firstPortalToward(state: GameState, unlock: ClassUnlock, from: string, to: string): Portal | null {
  if (from === to) return null;
  const via = new Map<string, { map: string; portal: Portal }>();
  const queue = [from];
  const seen = new Set([from]);
  while (queue.length) {
    const cur = queue.shift()!;
    for (const o of MAPS[cur]?.objects ?? []) {
      if (o.type !== 'portal' || seen.has(o.to.map) || !objectVisible(cur, o, state) || !portalGate(state, unlock, cur, o).open) continue;
      seen.add(o.to.map);
      via.set(o.to.map, { map: cur, portal: o });
      if (o.to.map === to) {
        let step = via.get(to)!;
        while (step.map !== from) step = via.get(step.map)!;
        return step.portal;
      }
      queue.push(o.to.map);
    }
  }
  return null;
}

/** 지금 맵(mapId)에서 다음 할 일을 하러 가야 할 곳. 모르거나 갈 수 없으면 null */
export function guideTarget(state: GameState, unlock: ClassUnlock, mapId: string): GuideTarget | null {
  const goal = nextGoal(state, unlock);
  let dest: { map: string; at: Point } | null = null;
  if (goal.kind === 'ending') {
    // 마을에 들어오면 엔딩이 바로 나와요. 다른 맵이면 마을로 가는 문을 가리켜요.
    if (mapId === 'village' || !MAPS.village) return null;
    dest = { map: 'village', at: MAPS.village.spawn };
  } else if (goal.kind === 'mission' || goal.kind === 'preview') {
    const giver = missionGiver(state, goal.mission.id, mapId);
    if (giver) dest = { map: giver.map, at: giver.npc.at };
  }
  if (!dest) return null;
  if (dest.map === mapId) return { at: dest.at, kind: 'npc', goalMap: dest.map };
  const portal = firstPortalToward(state, unlock, mapId, dest.map);
  return portal ? { at: portal.at, kind: 'portal', goalMap: dest.map } : null;
}
