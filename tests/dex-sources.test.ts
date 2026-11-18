import { expect, it } from 'vitest';
import { CHAPTERS, getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { ITEMS } from '../src/data/rpg/items';
import { MOBS } from '../src/data/rpg/mobs';
import { GOODS } from '../src/data/rpg/shop';

it('모든 도감 항목에 게임 안에서 만나는 경로가 있어요', () => {
  const items = new Set<string>(GOODS.map(g => g.id));
  const mobs = new Set<string>();
  for(const map of Object.values(MAPS)) for(const o of map.objects) {
    if(o.type==='mob') mobs.add(o.mob);
    if(o.type==='pickup') items.add(o.item);
    if(o.type==='chest') for(const item of o.reward.items ?? []) items.add(item.id);
  }
  for(const c of CHAPTERS) for(const p of c.parts) for(const m of p.missions) {
    if(m.kind==='battle' && m.data) mobs.add(m.data.mob);
    for(const item of m.reward?.items ?? []) items.add(item.id);
  }
  for(const mob of Object.values(MOBS)) {
    if (mob.dexMission) expect(getMission(mob.dexMission)?.mission.data).toBeDefined();
    else expect(mobs.has(mob.id),mob.id).toBe(true);
    if (mobs.has(mob.id)) for(const drop of mob.drops ?? []) if(drop.chance > 0) items.add(drop.item);
  }
  for(const id of Object.keys(ITEMS)) expect(items.has(id),id).toBe(true);
});
