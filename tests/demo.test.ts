import { expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { makePassable, buildCells } from '../src/game/iso/mapRuntime';
import { buildDemoSave, isDemoSearch } from '../src/game/rpg/demo';
import { shouldShowEnding } from '../src/game/rpg/ending';
import { nextGoal, portalGate } from '../src/game/rpg/progress';
import { GameState } from '../src/game/rpg/state';
import { CATALOG } from '../src/minigames/catalog';
import { MINIGAMES } from '../src/minigames/registry';

it('주소에서 독립된 demo 키만 찾아요', () => {
  for (const s of ['?demo', '?x=1&demo', '?demo=1']) expect(isDemoSearch(s)).toBe(true);
  for (const s of ['', '?demolition']) expect(isDemoSearch(s)).toBe(false);
});

it.each(CHAPTERS)('$index장 시작 위치와 열린 문, 미션, 보상을 맞춰요', chapter => {
  const save = buildDemoSave(chapter.index);
  const state = new GameState(save);
  const previous = CHAPTERS.filter(c => c.index < chapter.index);
  const rewards = previous.flatMap(c => c.parts.flatMap(p => p.missions.map(m => m.reward)));
  for (const c of CHAPTERS) for (const p of c.parts) for (const m of p.missions) {
    expect(state.missionDone(m.id)).toBe(c.index < chapter.index);
  }
  expect(nextGoal(state)).toMatchObject({ kind: 'mission', mission: { id: chapter.parts[0].missions[0].id } });
  expect(new Set(save.badges)).toEqual(new Set(rewards.map(r => r?.badge).filter(Boolean)));
  expect(new Set(save.robiParts)).toEqual(new Set(rewards.map(r => r?.robiPart).filter(Boolean)));
  const map = MAPS[chapter.entryMap!];
  expect(save.location).toEqual({ map: map.id, ...map.spawn });
  expect(makePassable(map, buildCells(map), state)(map.spawn.x, map.spawn.y)).toBe(true);
  for (const obj of MAPS.village.objects) {
    if (obj.type === 'portal' && obj.to.map === map.id) expect(portalGate(state, null, 'village', obj).open).toBe(true);
  }
  if (chapter.index) expect(save.level).toBeGreaterThanOrEqual(buildDemoSave(chapter.index - 1).level);
  if (chapter.index > 5) expect(save.classificationModel?.samples.length).toBeGreaterThan(0);
});

it('엔딩 앞 상태와 설정을 복원하고 듣는 쪽에 한 번 알려요', () => {
  const state = new GameState(buildDemoSave(0));
  let changes = 0;
  state.on(e => { if (e.type === 'change') changes++; });
  state.replaceData(buildDemoSave(9, { sound: false }));
  expect(changes).toBe(1);
  expect(shouldShowEnding(state.data)).toBe(true);
  expect(state.data.settings.sound).toBe(false);
});

it('모든 놀이와 실내 기계를 연결해요', () => {
  expect(CATALOG.map(g => g.id).sort()).toEqual(Object.keys(MINIGAMES).sort());
  for (const g of CATALOG) expect(MAPS[g.map].objects.some(o => o.type === 'game' && o.game === g.id)).toBe(true);
});
