import { ITEMS } from '../data/rpg/items';
import { baseSlots } from '../data/rpg/levels';
import { ROBI_PARTS } from '../data/rpg/robiParts';
import { app } from '../game/app';
import type { RewardSummary } from '../game/rpg/state';
import { playSfx } from '../fx/sfx';
import { h, lines } from './dom';
import { icon, pxImg } from './icons';

export interface ResultView {
  title: string;
  success: boolean;
  stars?: number;
  explain?: string;
  reward?: RewardSummary;
  bonus?: string;
  message?: string;
  /** 다시 해서 별을 올렸을 때 */
  improved?: boolean;
  /** 한꺼번에 받은 로비 부품(앞 장 준비물) */
  parts?: string[];
}

/** 미션·전투 결과 창: 별, 보상, 레벨업, 로비 부품, 배지 */
export function showResult(v: ResultView): Promise<void> {
  return new Promise((resolve) => {
    const r = v.reward;
    const pills = h('div', { class: 'reward-list' });
    if (r?.xp) pills.append(h('span', { class: 'reward-pill' }, pxImg(icon('icon-xp'), 24), `경험치 +${r.xp}`));
    if (r?.coins) pills.append(h('span', { class: 'reward-pill' }, pxImg(icon('icon-coin'), 24), `별가루 +${r.coins}`));
    for (const it of r?.items ?? []) {
      const def = ITEMS[it.id];
      if (def) pills.append(h('span', { class: 'reward-pill' }, pxImg(icon(def.icon), 24), `${def.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`));
    }
    for (const id of v.parts ?? []) {
      const p = ROBI_PARTS[id];
      if (p) pills.append(h('span', { class: 'reward-pill' }, pxImg(icon(p.icon ?? 'icon-part-wheel'), 24), `로비 부품: ${p.name}`));
    }
    const part = r?.robiPart ? ROBI_PARTS[r.robiPart] : undefined;
    const ups = r?.levelUps ?? [];
    const newLevel = ups[ups.length - 1];
    const moreSlots = ups.length > 0 && baseSlots(newLevel) > baseSlots(ups[0] - 1);
    const levelText = moreSlots
      ? `레벨 업! Lv ${newLevel} · 프로그램 칸이 ${app.state.slots}칸으로 늘었어요!`
      : `레벨 업! Lv ${newLevel} · 체력과 힘이 늘었어요!`;
    const box = h(
      'div',
      { class: 'reward' },
      h('h2', {}, v.title),
      v.stars !== undefined
        ? h('div', { class: 'stars', 'aria-label': `별 ${v.stars}개` }, ...[0, 1, 2].map((i) => pxImg(icon(i < v.stars! ? 'icon-star' : 'icon-star-empty'), 44)))
        : null,
      v.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
      v.message ? h('p', {}, ...lines(v.message)) : null,
      v.explain ? h('div', { class: 'explain' }, pxImg(icon('char-robi', 0), 32), ' ', ...lines(v.explain)) : null,
      pills.childElementCount ? pills : null,
      ups.length ? h('div', { class: 'levelup' }, levelText) : null,
      part ? h('div', { class: 'special' }, pxImg(icon(part.icon ?? 'icon-part-wheel'), 32), h('b', {}, ` 로비 부품: ${part.name}`), h('div', {}, part.ability)) : null,
      r?.badge ? h('div', { class: 'special' }, pxImg(icon(`icon-badge-${r.badge.split('-')[1]}`), 32), h('b', {}, ' 열쇠 배지를 얻었어요!')) : null,
      r?.title ? h('div', { class: 'special' }, h('b', {}, `새 칭호: ${r.title}`)) : null,
      v.bonus ? h('div', { class: 'special' }, h('b', {}, v.bonus)) : null,
      h('div', { class: 'row center', style: 'margin-top:12px' }, h('button', { class: 'btn primary', onclick: () => done() }, '확인')),
    );
    const handle = app.ui.panel(box, { closable: false });
    const done = () => {
      handle.close();
      resolve();
    };
    playSfx(v.success ? (r?.levelUps.length ? 'levelup' : 'success') : 'fail');
  });
}
