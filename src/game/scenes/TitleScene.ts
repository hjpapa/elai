import Phaser from 'phaser';
import type { SaveData } from '../../data/schema';
import { setSoundEnabled } from '../../fx/sfx';
import { initAutosave, loadLocal } from '../../services/save';
import { h } from '../../ui/dom';
import { Hud } from '../../ui/hud';
import { app } from '../app';
import { ASSET_BY_KEY, originOf } from '../assets';
import { isoToScreen } from '../iso/iso';
import { GameState, freshSave } from '../rpg/state';

/** 제목 화면: 작은 섬 장식 + 이어하기/새로 시작하기 */
export class TitleScene extends Phaser.Scene {
  private dom: HTMLElement | null = null;

  constructor() {
    super('Title');
  }

  create(): void {
    this.drawIsland();
    this.dom = this.buildDom();
    app.ui.dock.append(this.dom);
  }

  private drawIsland(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor('#1b1f2a');
    cam.setZoom(Math.max(2, Math.min(6, Math.floor(Math.min(this.scale.width / 260, this.scale.height / 200)))));
    cam.centerOn(0, 40);
    const R = 3;
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        if (Math.abs(x) + Math.abs(y) > R + 1) continue;
        const p = isoToScreen(x + R, y + R);
        const key = x === 0 ? 'tile-path' : (x * 7 + y * 3) % 5 === 0 ? 'tile-flower' : 'tile-grass';
        this.add.image(p.x - 0, p.y - 0, key, 0).setDepth(-1000 + p.y);
      }
    }
    const stand = (key: string, tx: number, ty: number, frame = 0) => {
      const spec = ASSET_BY_KEY.get(key);
      const o = spec ? originOf(spec) : { x: 0.5, y: 0.9 };
      const p = isoToScreen(tx + R, ty + R);
      return this.add.image(p.x, p.y, key, frame).setOrigin(o.x, o.y).setDepth((tx + ty) * 10 + 50);
    };
    stand('prop-tree', -2, -1);
    stand('prop-pine', 2, -2);
    stand('prop-house', -1, -3, 1);
    stand('char-player', 0, 1);
    stand('char-robi', 1, 1);
    const slime = stand('mob-vine-slime', 2, 2);
    this.tweens.add({ targets: slime, y: slime.y - 3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private buildDom(): HTMLElement {
    const saved = loadLocal();
    const input = h('input', { maxlength: 10, placeholder: '별명을 써 주세요', 'aria-label': '별명' }) as HTMLInputElement;
    const error = h('div', { class: 'note', 'aria-live': 'polite' });
    const start = (save: SaveData) => this.begin(save);
    const startNew = async () => {
      const name = input.value.trim();
      if (!name) {
        error.textContent = '별명을 한 글자 이상 써 주세요.';
        input.focus();
        return;
      }
      if (saved && !(await app.ui.confirm(`새로 시작하면 "${saved.nickname}"의 기록이 지워져요.\n그래도 새로 시작할까요?`, '새로 시작', '취소'))) return;
      start(freshSave(name));
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void startNew();
    });
    return h(
      'div',
      { class: 'title-screen' },
      h('h1', {}, '엘라이 섬'),
      h('div', { class: 'sub' }, 'AI·SW 탐험 RPG'),
      h(
        'div',
        { class: 'title-box' },
        saved
          ? h('button', { class: 'btn primary', onclick: () => start(saved) }, `이어하기 · ${saved.nickname} (Lv ${saved.level})`)
          : null,
        input,
        h('button', { class: `btn ${saved ? '' : 'primary'}`, onclick: () => void startNew() }, '새로 시작하기'),
        h('div', { class: 'note' }, '실제 이름 대신 별명을 써요. 기록은 이 기기에 저장돼요.'),
        error,
      ),
      h('div', { class: 'title-foot' }, h('a', { href: '/teacher.html' }, '선생님 페이지')),
    );
  }

  private begin(save: SaveData): void {
    this.dom?.remove();
    this.dom = null;
    app.state = new GameState(save);
    setSoundEnabled(save.settings.sound);
    initAutosave(app.state);
    app.hud = new Hud();
    const { map, x, y } = save.location;
    this.scene.start('World', { map, at: { x, y } });
  }
}
