import { CHAPTERS } from '../data/chapters';
import { ITEMS } from '../data/rpg/items';
import { MOBS } from '../data/rpg/mobs';
import { ROBI_PARTS } from '../data/rpg/robiParts';
import { app } from '../game/app';
import { clear, h, lines } from './dom';
import { icon, pxImg } from './icons';
import { robiLook } from './portraits';

const TABS = [
  { id: 'mobs', label: '몹' },
  { id: 'items', label: '아이템' },
  { id: 'badges', label: '배지·칭호' },
  { id: 'robi', label: '로비' },
] as const;
type Tab = (typeof TABS)[number]['id'];

/** 도감: 정화한 몹, 모은 아이템, 배지·칭호, 로비 부품 */
export function openDex(): void {
  let tab: Tab = 'mobs';
  const handle = app.ui.panel(() => undefined, { title: '도감', wide: true });

  const render = () => {
    const d = app.state.data;
    const body = handle.body;
    clear(body);
    body.append(
      h(
        'div',
        { class: 'tabs', role: 'tablist' },
        ...TABS.map((t) =>
          h(
            'button',
            {
              class: `tab ${t.id === tab ? 'on' : ''}`,
              role: 'tab',
              onclick: () => {
                tab = t.id;
                render();
              },
            },
            t.label,
          ),
        ),
      ),
    );
    const grid = h('div', { class: 'dex-grid' });
    if (tab === 'mobs') {
      for (const m of Object.values(MOBS)) {
        const known = d.dex.mobs.includes(m.id);
        const size = m.size === 48 ? 72 : 48;
        grid.append(
          h(
            'div',
            { class: `dex-card ${known ? '' : 'unknown'}` },
            pxImg(icon(m.sprite, known ? 3 : 0), size, '', known ? '' : 'silhouette'),
            h('h3', {}, known ? m.name : '???'),
            h('div', { class: 'muted' }, `권장 Lv ${m.recommendedLevel}${m.boss ? ' · 보스' : ''}`),
            known ? h('p', {}, ...lines(m.dex)) : h('p', { class: 'muted' }, '정화하면 정보가 기록돼요.'),
          ),
        );
      }
    } else if (tab === 'items') {
      for (const it of Object.values(ITEMS)) {
        const known = d.dex.items.includes(it.id);
        grid.append(
          h(
            'div',
            { class: `dex-card ${known ? '' : 'unknown'}` },
            pxImg(icon(it.icon), 40, '', known ? '' : 'silhouette'),
            h('h3', {}, known ? it.name : '???'),
            known ? h('p', {}, ...lines(it.desc)) : null,
          ),
        );
      }
    } else if (tab === 'badges') {
      CHAPTERS.filter((c) => c.badge).forEach((c, i) => {
        const owned = d.badges.includes(c.badge!);
        grid.append(
          h(
            'div',
            { class: `dex-card ${owned ? '' : 'unknown'}` },
            pxImg(icon(owned ? `icon-badge-${i + 1}` : 'icon-lock'), 40),
            h('h3', {}, `${c.index}장 열쇠`),
            h('div', { class: 'muted' }, c.title),
          ),
        );
      });
      body.append(grid);
      body.append(
        h('h3', { style: 'margin:14px 0 6px' }, '칭호'),
        d.titles.length ? h('div', { class: 'row' }, ...d.titles.map((t) => h('span', { class: 'chip' }, t))) : h('p', { class: 'muted' }, '장을 끝내면 칭호를 받아요.'),
      );
      return;
    } else {
      body.append(h('div', { class: 'row', style: 'margin-bottom:10px' }, pxImg(robiLook(d), 72), h('p', {}, '부품을 되찾을 때마다 로비가 새 능력을 얻어요.')));
      for (const p of Object.values(ROBI_PARTS)) {
        const owned = d.robiParts.includes(p.id);
        const ch = CHAPTERS.find((c) => c.id === p.chapter);
        grid.append(
          h(
            'div',
            { class: `dex-card ${owned ? '' : 'unknown'}` },
            pxImg(icon(owned && p.id === 'wheel' ? 'icon-part-wheel' : 'icon-lock'), 40),
            h('h3', {}, owned ? p.name : '???'),
            h('p', { class: owned ? '' : 'muted' }, owned ? p.ability : `${ch?.index}장 ${ch?.title}에서 찾을 수 있어요.`),
          ),
        );
      }
    }
    body.append(grid);
  };
  render();
}
