import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import type { MapObject } from '../src/data/schema';
import { firstPortalToward, guideTarget, hasNewMission, missionGiver } from '../src/game/rpg/guide';
import { nextGoal, objective } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';

type Npc = Extract<MapObject, { type: 'npc' }>;
const npc = (map: string, id: string) => MAPS[map].objects.find((o): o is Npc => o.type === 'npc' && o.id === id)!;
const win = { success: true, stars: 3 as const, attempts: 1, hints: 0 };
const finishChapter = (state: GameState, id: string) => {
  for (const part of CHAPTERS.find((c) => c.id === id)!.parts) for (const m of part.missions) state.completeMission(m.id, win);
};

describe('길 안내', () => {
  it('처음에는 마을 촌장에게 가라고 가리키고, 촌장 머리 위에만 느낌표가 떠요', () => {
    const state = new GameState(freshSave('별빛'));
    expect(nextGoal(state)).toMatchObject({ kind: 'mission', mission: { id: 'ch0-m1' } });
    expect(guideTarget(state, null, 'village')).toEqual({ at: npc('village', 'elder').at, kind: 'npc', goalMap: 'village' });
    expect(hasNewMission(state, npc('village', 'elder'))).toBe(true);
    // 로비의 미션은 촌장 미션을 끝내야 열려요.
    expect(hasNewMission(state, npc('village', 'robi-npc'))).toBe(false);
  });

  it('목표 NPC가 다른 맵에 있으면 그쪽으로 가는 열린 문을 가리켜요', () => {
    const state = new GameState(freshSave('별빛'));
    finishChapter(state, 'ch0');
    const giver = missionGiver(state, (nextGoal(state) as { mission: { id: string } }).mission.id);
    expect(giver?.map).toBe('forest');
    const gate = MAPS.village.objects.find((o) => o.id === 'to-forest')!;
    expect(guideTarget(state, null, 'village')).toEqual({ at: gate.at, kind: 'portal', goalMap: 'forest' });
    // 숲에 들어가면 그 안의 NPC를 가리켜요.
    expect(guideTarget(state, null, 'forest')?.kind).toBe('npc');
  });

  it('닫힌 문으로는 길을 찾지 않아요(1장을 끝내기 전 동굴, 선생님이 닫은 장)', () => {
    const state = new GameState(freshSave('별빛'));
    finishChapter(state, 'ch0');
    expect(firstPortalToward(state, null, 'village', 'cave')).toBeNull();
    finishChapter(state, 'ch1');
    expect(firstPortalToward(state, null, 'village', 'cave')?.id).toBe('to-ch2');
    // 학급에서 2장을 열지 않았으면 동굴로 가는 길도 없어요.
    expect(firstPortalToward(state, [], 'village', 'cave')).toBeNull();
    expect(firstPortalToward(state, ['ch2'], 'village', 'cave')?.id).toBe('to-ch2');
  });

  it('목표 안내 글은 예전과 같아요', () => {
    const state = new GameState(freshSave('별빛'));
    expect(objective(state)).toContain('찾아가요');
    finishChapter(state, 'ch0');
    finishChapter(state, 'ch1');
    expect(objective(state)).toBe('마을 동쪽 다리를 건너 반복의 동굴로 가요.');
  });

  it('모든 장의 미션마다 미션을 주는 NPC가 맵에 있어요(길 안내가 길을 잃지 않게)', () => {
    const missing: string[] = [];
    for (const chapter of CHAPTERS.filter((c) => c.status === 'playable')) {
      for (const part of chapter.parts) {
        for (const m of part.missions) {
          const onMap = Object.values(MAPS).some((map) => map.objects.some((o) => o.type === 'npc' && o.missions?.includes(m.id)));
          if (!onMap) missing.push(m.id);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
