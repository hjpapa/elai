import { ITEMS, RARITY_LABEL, SLOT_LABEL } from '../data/rpg/items';
import type { EquipSlot, ItemDef } from '../data/schema';
import { app } from '../game/app';
import { playSfx } from '../fx/sfx';
import { clear, h, lines } from './dom';
import { icon, pxImg } from './icons';
import { playerLook } from './portraits';

const TABS: { id: string; label: string; kinds: ItemDef['kind'][] }[] = [
  { id: 'equip', label: '장비', kinds: ['equip'] },
  { id: 'use', label: '소모품', kinds: ['consumable'] },
  { id: 'etc', label: '도우미·재료', kinds: ['helper', 'material', 'quest'] },
];
const SLOTS: EquipSlot[] = ['hat', 'outfit', 'tool', 'shoes', 'charm'];

function statText(item: ItemDef): string {
  const s = item.stats ?? {};
  const parts = [
    s.maxHp ? `체력 +${s.maxHp}` : '',
    s.maxEn ? `에너지 +${s.maxEn}` : '',
    s.atk ? `힘 +${s.atk}` : '',
    s.def ? `방어 +${s.def}` : '',
  ].filter(Boolean);
  return parts.join(' · ');
}

/** 가방: 캐릭터 모습·능력치, 장비 칸, 아이템 목록 */
export function openInventory(): void {
  let tab = 'equip';
  let selected: string | null = null;
  let off: () => void = () => undefined;
  const handle = app.ui.panel(() => undefined, { title: '가방', wide: true, onClose: () => off() });

  const render = () => {
    const s = app.state;
    const d = s.data;
    const stats = s.stats;
    const body = handle.body;
    clear(body);

    const slots = h(
      'div',
      { class: 'equip-slots' },
      ...SLOTS.map((slot) => {
        const id = d.equipment[slot];
        const item = id ? ITEMS[id] : undefined;
        return h(
          'div',
          {
            class: `slot ${item ? `rar-${item.rarity}` : ''}`,
            title: SLOT_LABEL[slot],
            onclick: () => {
              if (id) {
                selected = id;
                tab = 'equip';
                render();
              }
            },
          },
          item ? pxImg(icon(item.icon), 36) : null,
          h('small', {}, SLOT_LABEL[slot]),
        );
      }),
    );

    const hero = h(
      'div',
      { class: 'bag-hero' },
      h('div', { class: 'figure' }, pxImg(playerLook(d), 96)),
      h('h3', {}, `${d.nickname} · Lv ${d.level}`),
      d.titles.length ? h('div', { class: 'muted' }, `칭호: ${d.titles[d.titles.length - 1]}`) : null,
      h(
        'div',
        { class: 'stats' },
        h('b', {}, '체력'),
        h('span', {}, `${d.hp} / ${stats.maxHp}`),
        h('b', {}, '에너지'),
        h('span', {}, String(stats.maxEn)),
        h('b', {}, '힘'),
        h('span', {}, String(stats.atk)),
        h('b', {}, '방어'),
        h('span', {}, String(stats.def)),
        h('b', {}, '프로그램 칸'),
        h('span', {}, `${s.slots}칸`),
      ),
      slots,
    );

    const kinds = TABS.find((t) => t.id === tab)!.kinds;
    const owned = d.inventory.filter((st) => st.qty > 0 && kinds.includes(ITEMS[st.id]?.kind));
    const equipped = new Set(Object.values(d.equipment));
    const grid = h(
      'div',
      { class: 'items' },
      ...owned.map((st) => {
        const item = ITEMS[st.id];
        return h(
          'button',
          {
            class: `item rar-${item.rarity} ${selected === st.id ? 'on' : ''}`,
            title: item.name,
            onclick: () => {
              selected = st.id;
              render();
            },
          },
          pxImg(icon(item.icon), 40),
          st.qty > 1 ? h('span', { class: 'qty' }, String(st.qty)) : null,
          equipped.has(st.id) ? h('span', { class: 'eq' }, '착용') : null,
        );
      }),
    );
    if (owned.length === 0) grid.append(h('p', { class: 'muted' }, '아직 아무것도 없어요.'));

    const detail = h('div', { class: 'detail' });
    const item = selected ? ITEMS[selected] : undefined;
    if (item && s.itemQty(item.id) > 0) {
      const actions = h('div', { class: 'row end' });
      if (item.slot) {
        if (equipped.has(item.id)) {
          actions.append(h('button', { class: 'btn small', onclick: () => (s.unequip(item.slot!), playSfx('click')) }, '벗기'));
        } else {
          actions.append(h('button', { class: 'btn small primary', onclick: () => (s.equip(item.id), playSfx('item')) }, '착용하기'));
        }
      }
      if (item.kind === 'consumable' && item.effect?.heal) {
        const full = d.hp >= stats.maxHp;
        actions.append(
          h(
            'button',
            {
              class: 'btn small primary',
              disabled: full,
              onclick: () => {
                if (s.useItem(item.id)) {
                  playSfx('heal');
                  app.ui.toast(`체력이 회복됐어요!`, icon(item.icon));
                }
              },
            },
            full ? '체력이 가득해요' : '먹기',
          ),
        );
      }
      detail.append(
        h(
          'div',
          { class: 'row' },
          pxImg(icon(item.icon), 40),
          h(
            'div',
            { class: 'grow' },
            h('h3', {}, item.name, h('span', { class: 'tag' }, `${RARITY_LABEL[item.rarity]}${item.slot ? ` · ${SLOT_LABEL[item.slot]}` : ''}`)),
            statText(item) ? h('div', { class: 'muted' }, statText(item)) : null,
          ),
        ),
        h('p', {}, ...lines(item.desc)),
        actions,
      );
    } else {
      detail.append(h('p', { class: 'muted' }, '아이템을 누르면 설명이 나와요.'));
    }

    body.append(
      h(
        'div',
        { class: 'bag' },
        hero,
        h(
          'div',
          {},
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
                    selected = null;
                    render();
                  },
                },
                t.label,
              ),
            ),
          ),
          grid,
          detail,
        ),
      ),
    );
  };

  off = app.state.on((e) => {
    if (e.type === 'change') render();
  });
  render();
}
