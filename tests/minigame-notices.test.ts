import { expect, it } from 'vitest';
import { GameState, freshSave } from '../src/game/rpg/state';
import { newlyOpened, openedRounds } from '../src/minigames/catalog';

it('학습 미션으로 처음 열린 판만 건물별로 모아요', () => {
  const state = new GameState(freshSave('탐험가'));
  const before = openedRounds(state);
  const result = { success: true, stars: 3 as const, attempts: 1, hints: 0 };
  state.completeMission('ch5-p3-m1', result);
  const after = openedRounds(state);
  expect(newlyOpened(before, after)).toContain('마을 과일 가게 3판');
  state.completeMission('ch5-p3-m1', result);
  expect(newlyOpened(after, openedRounds(state))).toEqual([]);
});

it('부품으로 먼저 연 판은 알림에서 빼요', () => {
  const state = new GameState(freshSave('탐험가'));
  state.applyReward({ robiPart: 'learningChip' });
  const before = openedRounds(state);
  state.completeMission('ch5-p3-m1', { success: true, stars: 3, attempts: 1, hints: 0 });
  expect(newlyOpened(before, openedRounds(state))).toEqual([]);
});
