import { expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import type { MapDef, MapObject } from '../src/data/schema';
import { DECORATIONS } from '../src/data/rpg/shop';
import { buildCells, canStep, findPath, makePassable, objectSolid, objectVisible } from '../src/game/iso/mapRuntime';
import { freshSave, GameState } from '../src/game/rpg/state';

function reachable(map: MapDef, object: MapObject, state: GameState) {
  const cells = buildCells(map), pass = makePassable(map,cells,state);
  const solid = objectSolid(map.id,object,state), at = object.at;
  const goal = (x: number,y: number) => solid ? Math.max(Math.abs(x-at.x),Math.abs(y-at.y)) === 1 : x === at.x && y === at.y;
  return !!findPath(pass,map.spawn,goal,at,4000,(x,y,nx,ny)=>canStep(cells,x,y,nx,ny));
}

it('여섯 장식을 모두 사도 하루와 모든 마을 시설에 갈 수 있어요', () => {
  const state = new GameState(freshSave('별빛'));
  state.completeMission('ch0-m5',{success:true,stars:3,attempts:1,hints:0});
  state.data.coins = 0;
  expect(state.buyDecor('pots')).toBe(false);
  expect(state.hasFlag('decor:pots')).toBe(false);
  state.data.coins = 550;
  for(const d of DECORATIONS) {
    expect(state.buyDecor(d.id)).toBe(true);
    expect(state.buyDecor(d.id)).toBe(false);
  }
  expect(state.data.coins).toBe(0);
  const map = MAPS.village;
  for(let n=1;n<=8;n++)state.setFlag('village-restore-'+n);
  for(const o of map.objects) {
    if(o.id.startsWith('decor-')) {
      expect(objectVisible(map.id,o,state)).toBe(true);
      expect(map.objects.filter(other=>other.at.x===o.at.x && other.at.y===o.at.y)).toHaveLength(1);
    } else if(['portal','npc','chest','sign'].includes(o.type) && objectVisible(map.id,o,state)) {
      expect(reachable(map,o,state),o.id).toBe(true);
    }
  }
});
