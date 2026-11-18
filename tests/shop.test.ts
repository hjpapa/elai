import { expect, it } from 'vitest';
import { CHAPTERS } from '../src/data/chapters';
import { ITEMS } from '../src/data/rpg/items';
import { MOBS } from '../src/data/rpg/mobs';
import { GOODS, shopOffers } from '../src/data/rpg/shop';
import { Battle } from '../src/game/battle/sim';
import { gearScore, skipKit } from '../src/game/rpg/skip';
import { freshSave, GameState } from '../src/game/rpg/state';

function ready() {
  const s = new GameState(freshSave('탐험가'));
  s.data.coins = 500;
  return s;
}

it('구매 직전에 잠금·잔액·수량을 다시 확인하고 실패하면 기록이 같아요', () => {
  const s = ready();
  const refuse = (id: string) => {
    const before = JSON.stringify(s.data);
    expect(s.buyItem(id)).toBe(false);
    expect(JSON.stringify(s.data)).toBe(before);
  };
  for (const {id} of GOODS) refuse(id);
  refuse('없는상품');
  for (const id of ['ch0-m5','ch1-p1-m1']) s.completeMission(id,{success:true,stars:3,attempts:1,hints:0});
  for (const {item:{id},limit} of shopOffers(s).slice(0,2)) {
    while (s.itemQty(id) < limit) {
      const coins = s.data.coins;
      expect(s.buyItem(id)).toBe(true);
      expect(s.data.coins).toBe(coins - ITEMS[id].price!);
    }
    refuse(id);
  }
  refuse('hammer');
  s.setFlag('ch1-clear');
  s.data.coins = 49;
  refuse('hammer');
  s.addCoins(1);
  expect(s.buyItem('hammer')).toBe(true);
  expect(s.data.coins).toBe(0);
  expect(s.data.equipment.tool).not.toBe('hammer');
  refuse('hammer');
});

it('열린 장비는 다음 장의 본편 장비보다 강하지 않아요', () => {
  for (const chapter of CHAPTERS.filter(c => c.index >= 2)) {
    const gear = skipKit(chapter).items.map(id => ITEMS[id]);
    for (const id of ['leafhat','hammer']) {
      expect(gear.some(i => i.slot === ITEMS[id].slot && gearScore(i) >= gearScore(ITEMS[id]))).toBe(true);
    }
  }
});

it.each([3,4,5])('Lv%d 상점 한도까지 회복해도 공격만으로 숲 대장을 이기지 못해요', level => {
  const s = ready();
  s.data.level = level;
  for (const id of ['cap','stick','vest','boots']) { s.addItem(id); s.equip(id); }
  const b = new Battle({stats:s.stats,hp:s.stats.maxHp,slots:s.slots,mob:MOBS.forestGuardian});
  let apples = shopOffers(s)[0].limit;
  let jellies: number = GOODS[1].limit;
  while (b.outcome === 'continue') {
    while (apples && b.playerHp < s.stats.maxHp) { b.healPlayer(ITEMS.apple.effect!.heal!); apples--; }
    if (jellies) { b.addEnergy(ITEMS.jelly.effect!.energy!); jellies--; }
    b.runRound(b.intents().map(() => ({t:'cmd',cmd:'attack'})));
  }
  expect(b.outcome).toBe('lose');
});
