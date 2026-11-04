import type { DialogueLine } from '../data/schema';
import { npcName } from '../data/npcs';
import { clear, h, lines, sleep } from './dom';
import { pxImg } from './icons';

export interface PanelHandle {
  body: HTMLElement;
  close(): void;
}

export interface PanelOptions {
  title?: string;
  /** 넓은 창(미션) */
  wide?: boolean;
  /** 닫기 단추와 Esc로 닫을 수 있는지 */
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * 캔버스 위 DOM 화면: HUD, 창(panel), 대화창, 알림(toast).
 * 창이나 대화창이 열려 있으면 isBusy()가 true라서 월드 조작이 멈춰요.
 */
export class UI {
  readonly hud: HTMLElement;
  readonly dock: HTMLElement;
  private readonly panels: HTMLElement;
  private readonly dialogLayer: HTMLElement;
  private readonly toasts: HTMLElement;
  private openCount = 0;
  private talking = false;
  /** 화자 id → 얼굴 그림(data URL). app이 정해 줘요. */
  portrait: (who: string) => string = () => '';

  constructor(readonly root: HTMLElement) {
    this.hud = h('div', { class: 'layer hud-layer' });
    this.dock = h('div', { class: 'layer dock-layer' });
    this.panels = h('div', { class: 'layer panel-layer' });
    this.dialogLayer = h('div', { class: 'layer dialog-layer' });
    this.toasts = h('div', { class: 'layer toast-layer' });
    root.append(this.hud, this.dock, this.panels, this.dialogLayer, this.toasts);
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const top = this.panels.lastElementChild as HTMLElement | null;
      top?.querySelector<HTMLButtonElement>('.panel-close')?.click();
    });
  }

  isBusy(): boolean {
    return this.openCount > 0 || this.talking;
  }

  panel(content: HTMLElement | ((body: HTMLElement) => void), opts: PanelOptions = {}): PanelHandle {
    const body = h('div', { class: 'panel-body' });
    const closeBtn = opts.closable === false ? null : h('button', { class: 'panel-close', 'aria-label': '닫기' }, '✕');
    const box = h(
      'div',
      { class: `panel ${opts.wide ? 'wide' : ''} ${opts.className ?? ''}`.trim(), role: 'dialog', 'aria-modal': 'true' },
      opts.title || closeBtn ? h('div', { class: 'panel-head' }, h('h2', {}, opts.title ?? ''), closeBtn) : null,
      body,
    );
    const backdrop = h('div', { class: 'backdrop' }, box);
    this.panels.append(backdrop);
    this.openCount++;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      backdrop.remove();
      this.openCount--;
      opts.onClose?.();
    };
    closeBtn?.addEventListener('click', close);
    if (typeof content === 'function') content(body);
    else body.append(content);
    return { body, close };
  }

  /** 대화창: 한 줄씩 보여 주고, 누르거나 Enter/Space를 치면 다음 줄로 가요. */
  async dialogue(dialog: DialogueLine[]): Promise<void> {
    if (dialog.length === 0) return;
    this.talking = true;
    const face = h('div', { class: 'dlg-face' });
    const name = h('div', { class: 'dlg-name' });
    const text = h('div', { class: 'dlg-text' });
    const more = h('div', { class: 'dlg-more' }, '▼');
    const box = h('div', { class: 'dialog', role: 'dialog', 'aria-live': 'polite' }, face, h('div', { class: 'dlg-main' }, name, text), more);
    this.dialogLayer.append(box);
    try {
      for (const line of dialog) {
        clear(face);
        const src = this.portrait(line.who);
        if (src) face.append(pxImg(src, 64, ''));
        name.textContent = npcName(line.who);
        box.classList.toggle('me', line.who === 'player');
        await this.typeLine(text, line.text, box);
      }
    } finally {
      box.remove();
      this.talking = false;
    }
  }

  private typeLine(el: HTMLElement, line: string, box: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      let shown = 0;
      let done = false;
      clear(el);
      const timer = setInterval(() => {
        shown++;
        clear(el);
        el.append(...lines(line.slice(0, shown)));
        if (shown >= line.length) finishTyping();
      }, 28);
      const finishTyping = () => {
        clearInterval(timer);
        clear(el);
        el.append(...lines(line));
        done = true;
      };
      const advance = () => {
        if (!done) return finishTyping();
        box.removeEventListener('click', advance);
        window.removeEventListener('keydown', onKey);
        resolve();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advance();
        }
      };
      box.addEventListener('click', advance);
      window.addEventListener('keydown', onKey);
    });
  }

  toast(text: string, iconSrc?: string, ms = 2600): void {
    const t = h('div', { class: 'toast' }, iconSrc ? pxImg(iconSrc, 32) : null, h('span', {}, ...lines(text)));
    this.toasts.append(t);
    void sleep(ms).then(() => {
      t.classList.add('out');
      return sleep(400).then(() => t.remove());
    });
  }

  /** 확인 창(예/아니요) */
  confirm(message: string, yes = '네', no = '아니요'): Promise<boolean> {
    return new Promise((resolve) => {
      const p = this.panel(
        h(
          'div',
          { class: 'confirm' },
          h('p', {}, ...lines(message)),
          h(
            'div',
            { class: 'row end' },
            h('button', { class: 'btn ghost', onclick: () => (p.close(), resolve(false)) }, no),
            h('button', { class: 'btn primary', onclick: () => (p.close(), resolve(true)) }, yes),
          ),
        ),
        { closable: false },
      );
    });
  }
}
