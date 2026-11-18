import { expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import { buildCells, findPath, makePassable } from '../src/game/iso/mapRuntime';
import { GameState, freshSave } from '../src/game/rpg/state';

it('마을에서 문과 귀환 칸, 실내에서 설계대 옆과 매트까지 걸어요', () => {
  const state = new GameState(freshSave('미로'));
  for (const [map, targets] of [[MAPS.village, [[21,16],[21,17]]], [MAPS.mazeroom, [[5,2],[6,7]]]] as const) {
    const pass = makePassable(map, buildCells(map), state);
    for (const [x,y] of targets) expect(findPath(pass, map.spawn, (a,b) => a === x && b === y, {x,y})).not.toBeNull();
  }
  expect(MAPS.village.objects.filter(o => o.at.x === 21 && o.at.y === 16).map(o => o.id)).toEqual(['to-mazeroom']);
  expect(MAPS.village.rows[16][21]).not.toBe('T');
});
