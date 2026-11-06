import Phaser from 'phaser';
import type { SaveData } from '../../data/schema';
import { DEFAULT_VOLUME, playMusic, setSoundEnabled, setVolume } from '../../fx/sfx';
import { checkLink, fetchRemoteSave, joinClass, loadLink, refreshUnlocked, startRemoteSync, type ClassLink } from '../../services/remote';
import { initAutosave, loadLocal, newer, setSaveProfile } from '../../services/save';
import { friendlyError, supabaseConfigured } from '../../services/supabase';
import { append, clear, h } from '../../ui/dom';
import { Hud } from '../../ui/hud';
import { app } from '../app';
import { ASSET_BY_KEY, originOf } from '../assets';
import { fitArt } from '../density';
import { drawEdges } from '../iso/edgeArt';
import { edgeFaces } from '../iso/edges';
import { isoToScreen } from '../iso/iso';
import type { Cell } from '../iso/mapRuntime';
import { GameState, freshSave } from '../rpg/state';
import { TITLE_ZOOM, canvasRatio, crispZoom } from '../screen';
import { addShadow } from '../shadow';

type Mode = 'class' | 'local';

/** 제목 화면: 작은 섬 장식 + 학급으로 시작하기 / 이 기기에서 체험하기 */
export class TitleScene extends Phaser.Scene {
  private dom: HTMLElement | null = null;
  private box!: HTMLElement;
  private mode: Mode = supabaseConfigured ? 'class' : 'local';

  constructor() {
    super('Title');
  }

  create(): void {
    playMusic('title');
    this.drawIsland();
    this.box = h('div', { class: 'title-box' });
    this.dom = h(
      'div',
      { class: 'title-screen' },
      h('h1', {}, '엘라이 섬'),
      h('div', { class: 'sub' }, 'AI·SW 탐험 RPG'),
      this.box,
      h('div', { class: 'title-foot' }, h('a', { href: '/teacher.html' }, '선생님 페이지')),
    );
    app.ui.dock.append(this.dom);
    this.render();
  }

  private drawIsland(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor('#1b1f2a');
    cam.setZoom(crispZoom(this.scale.width, this.scale.height, canvasRatio(), TITLE_ZOOM));
    cam.centerOn(0, 40);
    const R = 3;
    const cells: Cell[][] = [];
    for (let y = -R; y <= R; y++) {
      const row: Cell[] = [];
      for (let x = -R; x <= R; x++) {
        if (Math.abs(x) + Math.abs(y) > R + 1) {
          row.push({ kind: 'void' });
          continue;
        }
        const p = isoToScreen(x + R, y + R);
        const kind = x === 0 ? 'path' : (x * 7 + y * 3) % 5 === 0 ? 'flower' : 'grass';
        row.push({ kind });
        fitArt(this.add.image(p.x, p.y, `tile-${kind}`, 0)).setDepth(-1000 + p.y);
      }
      cells.push(row);
    }
    drawEdges(this, edgeFaces(cells), { x: 0, y: 0 }, -1001);
    const stand = (key: string, tx: number, ty: number, frame = 0) => {
      const spec = ASSET_BY_KEY.get(key);
      const o = spec ? originOf(spec) : { x: 0.5, y: 0.9 };
      const p = isoToScreen(tx + R, ty + R);
      addShadow(this, key, p.x, p.y);
      return fitArt(this.add.image(p.x, p.y, key, frame)).setOrigin(o.x, o.y).setDepth((tx + ty) * 10 + 50);
    };
    stand('prop-tree', -2, -1);
    stand('prop-pine', 2, -2);
    stand('prop-house', -1, -3, 1);
    stand('char-player', 0, 1);
    stand('char-robi', 1, 1);
    const slime = stand('mob-vine-slime', 2, 2);
    this.tweens.add({ targets: slime, y: slime.y - 3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private render(): void {
    clear(this.box);
    if (supabaseConfigured) {
      const tab = (m: Mode, label: string) =>
        h(
          'button',
          {
            class: `tab ${this.mode === m ? 'on' : ''}`,
            onclick: () => {
              this.mode = m;
              this.render();
            },
          },
          label,
        );
      this.box.append(h('div', { class: 'tabs', style: 'margin:0' }, tab('class', '학급으로 시작'), tab('local', '이 기기에서 체험')));
    }
    if (this.mode === 'class') this.renderClass();
    else this.renderLocal();
  }

  private renderClass(): void {
    const link = loadLink();
    const error = h('div', { class: 'note', 'aria-live': 'polite', style: 'color:#ff9a8f;white-space:pre-line' });
    const code = h('input', { maxlength: 6, placeholder: '학급 코드 6자리', 'aria-label': '학급 코드', autocapitalize: 'characters' }) as HTMLInputElement;
    const nick = h('input', { maxlength: 10, placeholder: '별명', 'aria-label': '별명' }) as HTMLInputElement;
    const pin = h('input', { maxlength: 4, placeholder: '비밀 숫자 4자리', 'aria-label': '비밀 숫자', inputmode: 'numeric', type: 'password', autocomplete: 'off' }) as HTMLInputElement;
    code.addEventListener('input', () => (code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, '')));
    pin.addEventListener('input', () => (pin.value = pin.value.replace(/\D/g, '')));
    const go = h('button', { class: 'btn primary' }, '학급으로 입장');
    const setBusy = (b: boolean) => {
      for (const el of this.box.querySelectorAll('button, input')) (el as HTMLButtonElement).disabled = b;
    };
    const enter = async () => {
      error.textContent = '';
      if (code.value.length !== 6) return void (error.textContent = '학급 코드 6자리를 써 주세요.');
      if (!nick.value.trim()) return void (error.textContent = '별명을 써 주세요.');
      if (!/^\d{4}$/.test(pin.value)) return void (error.textContent = '비밀 숫자 4자리를 써 주세요.');
      setBusy(true);
      try {
        const l = await joinClass(code.value, nick.value, pin.value);
        await this.startClass(l);
      } catch (e) {
        error.textContent = friendlyError(e);
        setBusy(false);
      }
    };
    go.addEventListener('click', () => void enter());
    pin.addEventListener('keydown', (e) => e.key === 'Enter' && void enter());

    if (link) {
      const resume = h('button', { class: 'btn primary' }, `이어하기 · ${link.nickname} (${link.className})`);
      resume.addEventListener('click', async () => {
        setBusy(true);
        try {
          if (await checkLink(link)) return void (await this.startClass(link));
          error.textContent = '다시 입장해 주세요. (다른 기기에서 들어갔거나 로그인이 끝났어요)';
          code.value = '';
          nick.value = link.nickname;
        } catch (e) {
          error.textContent = friendlyError(e);
        }
        setBusy(false);
      });
      this.box.append(resume, h('div', { class: 'note' }, '다른 학생이라면 아래에 새로 입장해요.'));
    }
    append(this.box, [
      code,
      nick,
      pin,
      go,
      h('div', { class: 'note' }, '처음이면 비밀 숫자를 새로 정해요. 다른 기기에서 이어할 때 필요하니 꼭 기억해요.\n실제 이름 대신 별명을 써요.'),
      error,
    ]);
  }

  private renderLocal(): void {
    setSaveProfile(null);
    const saved = loadLocal();
    const input = h('input', { maxlength: 10, placeholder: '별명을 써 주세요', 'aria-label': '별명' }) as HTMLInputElement;
    const error = h('div', { class: 'note', 'aria-live': 'polite' });
    const startNew = async () => {
      const name = input.value.trim();
      if (!name) {
        error.textContent = '별명을 한 글자 이상 써 주세요.';
        input.focus();
        return;
      }
      if (saved && !(await app.ui.confirm(`새로 시작하면 "${saved.nickname}"의 기록이 지워져요.\n그래도 새로 시작할까요?`, '새로 시작', '취소'))) return;
      this.begin(freshSave(name), null);
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void startNew();
    });
    append(this.box, [
      saved ? h('button', { class: 'btn primary', onclick: () => this.begin(saved, null) }, `이어하기 · ${saved.nickname} (Lv ${saved.level})`) : null,
      input,
      h('button', { class: `btn ${saved ? '' : 'primary'}`, onclick: () => void startNew() }, '새로 시작하기'),
      h('div', { class: 'note' }, '실제 이름 대신 별명을 써요. 기록은 이 기기에만 저장돼요.'),
      error,
    ]);
  }

  /** 학급 학생: 이 기기 기록과 서버 기록 중 최근 것으로 시작해요(선생님이 연 장도 다시 받아요). */
  private async startClass(link: ClassLink): Promise<void> {
    setSaveProfile(link.studentId);
    const [remote] = await Promise.all([fetchRemoteSave(link.studentId).catch(() => null), refreshUnlocked(link).catch(() => false)]);
    const save = newer(loadLocal(), remote) ?? freshSave(link.nickname);
    save.nickname = link.nickname;
    this.begin(save, link);
  }

  private begin(save: SaveData, link: ClassLink | null): void {
    this.dom?.remove();
    this.dom = null;
    app.classLink = link;
    app.state = new GameState(save);
    setSoundEnabled(save.settings.sound);
    setVolume(save.settings.volume ?? DEFAULT_VOLUME);
    initAutosave(app.state, link ? startRemoteSync(app.state, link) : undefined);
    app.hud = new Hud();
    const { map, x, y } = save.location;
    this.scene.start('World', { map, at: { x, y } });
  }
}
