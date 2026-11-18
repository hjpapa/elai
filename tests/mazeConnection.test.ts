import { expect, it } from 'vitest';
import { CATALOG, newlyOpened, openedRounds } from '../src/minigames/catalog';
import { MINIGAMES } from '../src/minigames/registry';
import { GameState, freshSave } from '../src/game/rpg/state';

it('목록과 실행기가 같은 공작소를 가리키고 반복·물결 미션 뒤 한 번 열려요', () => {
  const state = new GameState(freshSave('솔'));
  expect(MINIGAMES.mazemaker.title).toBe(CATALOG.find(g => g.id === 'mazemaker')?.name);
  for (const [id, notice] of [['ch2-p2-m1','마을 미로 공작소 4판'],['ch6-p1-m1','마을 미로 공작소 5판']]) {
    const before = openedRounds(state);
    state.completeMission(id, {success:true, stars:3, attempts:1, hints:0});
    const after = openedRounds(state);
    expect(newlyOpened(before, after)).toContain(notice);
    expect(newlyOpened(after, after)).toEqual([]);
  }
});
