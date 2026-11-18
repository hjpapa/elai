import { expect, it } from 'vitest';
import { getMission, requiredMissions } from '../src/data/chapters';
import { chapterDone } from '../src/game/rpg/unlock';
import { GameState, freshSave } from '../src/game/rpg/state';
import { canStart, nextGoal } from '../src/game/rpg/progress';
import { extraMissionFor } from '../src/game/rpg/guide';

it('선택 기록이 없는 저장도 다음 필수 목표로 나아가요', () => {
  const { chapter, part, mission } = getMission('ch0-m2')!;
  const previous = mission.optional;
  try {
    mission.optional = true;
    const state = new GameState(freshSave('별빛'));
    expect(canStart(state, mission.id)).toBe(false);
    state.completeMission('ch0-m1', { success: true, stars: 3, attempts: 1, hints: 0 });
    expect(extraMissionFor(state, [mission.id])).toBe(mission.id);
    expect(nextGoal(state)).toMatchObject({ mission: { id: 'ch0-m3' } });
    for (const p of chapter.parts) for (const m of requiredMissions(p))
      state.completeMission(m.id, { success: true, stars: 3, attempts: 1, hints: 0 });
    expect(chapterDone(chapter, id => state.missionDone(id))).toBe(true);
    expect(state.partDone(part.id)).toBe(true);
    expect(state.nextMissionOf(part.id)).toBeUndefined();
  } finally {
    if (previous === undefined) delete mission.optional;
    else mission.optional = previous;
  }
});
