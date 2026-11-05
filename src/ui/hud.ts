import { xpForLevel } from '../data/rpg/levels';
import type { MapDef } from '../data/schema';
import { app, classUnlock } from '../game/app';
import { objective } from '../game/rpg/progress';
import { clear, h } from './dom';
import { openDex } from './dex';
import { icon, pxImg } from './icons';
import { openInventory } from './inventory';
import { openMenu } from './menu';
import { playerLook } from './portraits';

/** 화면 위쪽 상태 카드, 오른쪽 단추, 아래쪽 목표 안내, (순서도 지도가 있으면) 작은 지도 */
export class Hud {
  private readonly face = h('div', { class: 'hud-face' });
  private readonly name = h('div', { class: 'hud-name' });
  private readonly hp = h('div', { class: 'bar hp' }, h('i'), h('span'));
  private readonly xp = h('div', { class: 'bar xp' }, h('i'), h('span'));
  private readonly coins = h('span');
  private readonly goal = h('div', { class: 'hud-objective', 'aria-live': 'polite' });
  private readonly mini = h('div', { class: 'minimap', hidden: true });
  private readonly canvas = h('canvas');
  private readonly root: HTMLElement;
  private lastFace = '';

  constructor() {
    const card = h('div', { class: 'hud-card' }, this.face, h('div', { class: 'grow' }, this.name, this.hp, this.xp));
    const buttons = h(
      'div',
      { class: 'hud-buttons' },
      h('div', { class: 'hud-coins', title: '별가루' }, pxImg(icon('icon-coin'), 20), this.coins),
      h('button', { class: 'btn hud-btn', title: '가방', 'aria-label': '가방', onclick: () => openInventory() }, pxImg(icon('icon-bag'), 30)),
      h('button', { class: 'btn hud-btn', title: '도감', 'aria-label': '도감', onclick: () => openDex() }, pxImg(icon('icon-book'), 30)),
      h('button', { class: 'btn hud-btn', title: '메뉴', 'aria-label': '메뉴', onclick: () => openMenu() }, pxImg(icon('icon-gear'), 30)),
    );
    this.mini.append(this.canvas, h('div', { class: 'cap' }, '순서도 지도'));
    this.root = h('div', { class: 'hud' }, card, buttons, this.goal, this.mini);
    app.ui.hud.append(this.root);
    app.state.on((e) => {
      if (e.type === 'change') this.refresh();
    });
    this.refresh();
  }

  setVisible(on: boolean): void {
    this.root.hidden = !on;
  }

  refresh(): void {
    const s = app.state;
    const d = s.data;
    const stats = s.stats;
    const look = playerLook(d);
    if (look !== this.lastFace) {
      clear(this.face);
      this.face.append(pxImg(look, 48));
      this.lastFace = look;
    }
    clear(this.name);
    this.name.append(h('span', { class: 'lv' }, `Lv ${d.level}`), d.nickname);
    const setBar = (bar: HTMLElement, ratio: number, label: string) => {
      (bar.firstChild as HTMLElement).style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
      (bar.lastChild as HTMLElement).textContent = label;
    };
    setBar(this.hp, d.hp / stats.maxHp, `체력 ${d.hp} / ${stats.maxHp}`);
    const from = xpForLevel(d.level);
    const to = xpForLevel(d.level + 1);
    setBar(this.xp, (d.xp - from) / (to - from), `경험치 ${d.xp - from} / ${to - from}`);
    this.coins.textContent = String(d.coins);
    clear(this.goal);
    this.goal.append(h('b', {}, '목표'), objective(s, classUnlock()));
  }

  /** 던전 작은 지도: 가 본 칸만 그려요. */
  drawMinimap(map: MapDef | null, visited: string, player: { x: number; y: number }): void {
    if (!map) {
      this.mini.hidden = true;
      return;
    }
    this.mini.hidden = false;
    const w = map.rows[0].length;
    const hgt = map.rows.length;
    const cell = Math.max(3, Math.floor(110 / Math.max(w, hgt)));
    this.canvas.width = w * cell;
    this.canvas.height = hgt * cell;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#11141c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < w; x++) {
        if (visited[y * w + x] !== '1') continue;
        const kind = map.legend[map.rows[y][x]] ?? map.glyphs?.[map.rows[y][x]]?.tile;
        ctx.fillStyle = kind === 'hedge' || kind === 'wall' ? '#2f7d3a' : '#c9a26b';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    ctx.fillStyle = '#f2c94c';
    ctx.fillRect(player.x * cell - 1, player.y * cell - 1, cell + 2, cell + 2);
  }
}
