import { ITEMS } from './items';
import type { GameState } from '../../game/rpg/state';

export const GOODS = [
  { id: 'apple', limit: 5, mission: 'ch0-m5', unlockText: '마을 연습을 끝내면 열려요.' },
  { id: 'jelly', limit: 3, mission: 'ch1-p1-m1', unlockText: '숲의 첫 미션 뒤에 열려요.' },
  { id: 'leafhat', limit: 1, mission: 'ch1-clear', unlockText: '1장을 마치면 열려요.' },
  { id: 'hammer', limit: 1, mission: 'ch1-clear', unlockText: '1장을 마치면 열려요.' },
] as const;

export interface Decoration { id: string; name: string; price: number; icon: string; desc: string }
export const DECORATIONS: readonly Decoration[] = [
  { id: 'pots', name: '광장 화분', price: 40, icon: 'prop-plant', desc: '광장 곁에 잎이 무성한 화분을 놓아요.' },
  { id: 'lanterns', name: '길가 등불', price: 60, icon: 'prop-lamp', desc: '마을 큰길에 따뜻한 등을 켜요.' },
  { id: 'stars', name: '별 등불', price: 80, icon: 'prop-starlamp', desc: '길 가장자리에 작은 별빛을 밝혀요.' },
  { id: 'garden', name: '작은 숲 정원', price: 100, icon: 'prop-bush', desc: '풀숲과 버섯이 자라는 자리를 꾸며요.' },
  { id: 'crystal', name: '수정 장식', price: 120, icon: 'prop-crystal', desc: '언덕 곁에 반짝이는 수정을 놓아요.' },
  { id: 'festival', name: '축제 깃발', price: 150, icon: 'prop-banner', desc: '광장에 알록달록한 깃발을 세워요.' },
];

export function shopOffers(state: GameState) {
  return GOODS.map(good => {
    const item = ITEMS[good.id];
    const price = item.price!;
    const qty = state.itemQty(good.id);
    // 수호자 전투에서는 라운드 사이에 사과를 여러 번 먹을 수 있어요.
    const limit = good.id === 'apple' && !state.hasFlag('ch1-clear') ? 1 : good.limit;
    const unlocked = good.mission === 'ch1-clear' ? state.hasFlag(good.mission) : state.missionDone(good.mission);
    let reason = '';
    if (!unlocked) reason = good.unlockText;
    else if (qty >= limit) reason = item.slot ? '이미 가지고 있어요.' : '충분히 가지고 있어요.';
    else if (state.data.coins < price) reason = '동전이 모자라요.';
    return { item, price, qty, limit, reason, available: !reason };
  });
}

export function decorReason(state: GameState, decor: Decoration): string {
  if (!state.missionDone('ch0-m5')) return '마을 연습을 끝내면 열려요.';
  if (state.hasFlag('decor:' + decor.id)) return '이미 꾸몄어요.';
  return state.data.coins < decor.price ? '동전이 모자라요.' : '';
}
