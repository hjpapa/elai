import type { Block, Cmd, Cond } from '../data/schema';
import { cloneProgram, countBlocks } from '../missions/core/interpreter';
import { append, clear, h } from './dom';
import { icon, pxImg } from './icons';
import { CMD_LABEL, COND_LABEL, cmdIcon } from './labels';

export interface EditorConfig {
  palette: Cmd[];
  allowRepeat?: boolean;
  allowIf?: Cond[];
  maxBlocks?: number;
  /** 최소 블록 수 안내(별점 기준) */
  optimal?: number;
}

/** 블록을 넣을 자리: 어느 목록(path)의 몇 번째(index) */
interface Cursor {
  list: string;
  index: number;
}

export function cmdKind(c: Cmd): string {
  if (c === 'attack') return 'k-battle';
  if (c === 'guard') return 'k-guard';
  if (c === 'heal') return 'k-heal';
  if (c === 'wait') return 'k-wait';
  return 'k-move';
}

/**
 * 세로 목록형 블록 편집기(퍼즐용).
 * 노란 막대(커서)를 눌러 넣을 자리를 고르고, 위의 블록을 누르면 그 자리에 들어가요.
 */
export class ProgramEditor {
  readonly el: HTMLElement;
  private program: Block[];
  private cursor: Cursor = { list: '', index: 0 };
  private readonly programEl: HTMLElement;
  private readonly paletteEl: HTMLElement;
  private readonly footEl: HTMLElement;
  private listeners: (() => void)[] = [];

  constructor(private readonly cfg: EditorConfig, initial: Block[] = []) {
    this.program = cloneProgram(initial);
    this.cursor = { list: '', index: this.program.length };
    this.paletteEl = h('div', { class: 'palette', role: 'toolbar', 'aria-label': '명령 블록' });
    this.programEl = h('div', { class: 'program', 'aria-label': '내 프로그램' });
    this.footEl = h('div', { class: 'editor-foot' });
    this.el = h('div', { class: 'editor' }, this.paletteEl, this.programEl, this.footEl);
    this.renderPalette();
    this.render();
  }

  get value(): Block[] {
    return cloneProgram(this.program);
  }

  set value(p: Block[]) {
    this.program = cloneProgram(p);
    this.cursor = { list: '', index: this.program.length };
    this.render();
    this.emit();
  }

  get count(): number {
    return countBlocks(this.program);
  }

  onChange(fn: () => void): void {
    this.listeners.push(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  setLocked(locked: boolean): void {
    this.el.classList.toggle('locked', locked);
  }

  /** 실행 중인 블록(run) 또는 틀린 블록(err) 표시. null이면 지워요. */
  highlight(path: string | null, kind: 'run' | 'err' = 'run'): void {
    for (const e of this.programEl.querySelectorAll('.run, .err')) e.classList.remove('run', 'err');
    if (path === null) return;
    const target = this.programEl.querySelector(`[data-path="${path}"]`);
    target?.classList.add(kind);
    target?.scrollIntoView({ block: 'nearest' });
  }

  /** 맨 끝에 빠진 블록이 있을 때 커서를 보여 줘요(디버그 안경). */
  pointAtEnd(): void {
    this.cursor = { list: '', index: this.program.length };
    this.render();
  }

  private renderPalette(): void {
    clear(this.paletteEl);
    for (const c of this.cfg.palette) {
      this.paletteEl.append(
        h(
          'button',
          { class: `pblock ${cmdKind(c)}`, onclick: () => this.insert({ t: 'cmd', cmd: c }), title: CMD_LABEL[c] },
          pxImg(icon(cmdIcon(c)), 28),
          CMD_LABEL[c],
        ),
      );
    }
    if (this.cfg.allowRepeat) {
      this.paletteEl.append(
        h(
          'button',
          { class: 'pblock k-repeat', onclick: () => this.insert({ t: 'repeat', times: 2, body: [] }) },
          pxImg(icon('icon-card-repeat'), 28),
          '반복',
        ),
      );
    }
    if (this.cfg.allowIf?.length) {
      const cond = this.cfg.allowIf[0];
      this.paletteEl.append(
        h(
          'button',
          { class: 'pblock k-if', onclick: () => this.insert({ t: 'if', cond, yes: [], no: [] }) },
          pxImg(icon('icon-card-if'), 28),
          '만약',
        ),
      );
    }
  }

  private listAt(path: string): Block[] {
    if (path === '') return this.program;
    let list = this.program;
    let block: Block | undefined;
    for (const part of path.split('.')) {
      if (part === 'y' || part === 'n') {
        if (block?.t !== 'if') return [];
        list = part === 'y' ? block.yes : block.no;
        continue;
      }
      block = list[Number(part)];
      if (block?.t === 'repeat') list = block.body;
    }
    return list;
  }

  private insert(b: Block): void {
    if (this.cfg.maxBlocks && this.count >= this.cfg.maxBlocks) return;
    const list = this.listAt(this.cursor.list);
    const index = Math.min(this.cursor.index, list.length);
    list.splice(index, 0, b);
    const path = this.cursor.list === '' ? `${index}` : `${this.cursor.list}.${index}`;
    if (b.t === 'repeat') this.cursor = { list: path, index: 0 };
    else if (b.t === 'if') this.cursor = { list: `${path}.y`, index: 0 };
    else this.cursor = { list: this.cursor.list, index: index + 1 };
    this.render();
    this.emit();
  }

  private remove(path: string): void {
    const parts = path.split('.');
    const index = Number(parts.pop());
    const parent = parts.join('.');
    this.listAt(parent).splice(index, 1);
    this.cursor = { list: parent, index };
    this.render();
    this.emit();
  }

  private render(): void {
    clear(this.programEl);
    this.programEl.append(this.renderList(this.program, ''));
    const n = this.count;
    const max = this.cfg.maxBlocks ? ` / 최대 ${this.cfg.maxBlocks}개` : '';
    clear(this.footEl);
    append(this.footEl, [
      h('span', {}, `블록 ${n}개${max}`),
      this.cfg.optimal ? h('span', {}, `가장 짧은 풀이: ${this.cfg.optimal}개`) : null,
    ]);
    for (const b of this.paletteEl.querySelectorAll<HTMLButtonElement>('button')) {
      b.disabled = !!this.cfg.maxBlocks && n >= this.cfg.maxBlocks;
    }
  }

  private gap(list: string, index: number): HTMLElement {
    const cur = this.cursor.list === list && this.cursor.index === index;
    return h('div', {
      class: `gap ${cur ? 'cur' : ''}`,
      role: 'button',
      'aria-label': '여기에 블록 넣기',
      onclick: () => {
        this.cursor = { list, index };
        this.render();
      },
    });
  }

  private renderList(list: Block[], listPath: string): HTMLElement {
    const wrap = h('div', { class: 'blist' });
    list.forEach((b, i) => {
      const path = listPath === '' ? `${i}` : `${listPath}.${i}`;
      wrap.append(this.gap(listPath, i), this.renderBlock(b, path));
    });
    wrap.append(this.gap(listPath, list.length));
    return wrap;
  }

  private removeBtn(path: string): HTMLElement {
    return h(
      'button',
      {
        class: 'x',
        'aria-label': '블록 지우기',
        onclick: (e: Event) => {
          e.stopPropagation();
          this.remove(path);
        },
      },
      '✕',
    );
  }

  private renderBlock(b: Block, path: string): HTMLElement {
    if (b.t === 'cmd') {
      return h(
        'div',
        { class: `block ${cmdKind(b.cmd)}`, dataset: { path } },
        pxImg(icon(cmdIcon(b.cmd)), 28),
        CMD_LABEL[b.cmd],
        this.removeBtn(path),
      );
    }
    if (b.t === 'repeat') {
      const setTimes = (n: number) => {
        b.times = Math.max(2, Math.min(9, n));
        this.render();
        this.emit();
      };
      return h(
        'div',
        { class: 'container k-repeat', dataset: { path } },
        h(
          'div',
          { class: 'head' },
          pxImg(icon('icon-card-repeat'), 24),
          h('button', { class: 'btn small ghost', onclick: () => setTimes(b.times - 1), 'aria-label': '줄이기' }, '−'),
          h('span', { class: 'num' }, String(b.times)),
          h('button', { class: 'btn small ghost', onclick: () => setTimes(b.times + 1), 'aria-label': '늘리기' }, '+'),
          '번 반복',
          this.removeBtn(path),
        ),
        h('div', { class: 'body' }, this.renderList(b.body, path)),
      );
    }
    const select = h(
      'select',
      {
        'aria-label': '조건',
        onchange: (e: Event) => {
          b.cond = (e.target as HTMLSelectElement).value as Cond;
          this.emit();
        },
      },
      ...(this.cfg.allowIf ?? [b.cond]).map((c) => h('option', { value: c, selected: c === b.cond }, COND_LABEL[c])),
    );
    return h(
      'div',
      { class: 'container k-if', dataset: { path } },
      h('div', { class: 'head' }, pxImg(icon('icon-card-if'), 24), '만약', select, this.removeBtn(path)),
      h('div', { class: 'body' }, this.renderList(b.yes, `${path}.y`)),
      h('div', { class: 'head' }, '아니면'),
      h('div', { class: 'body' }, this.renderList(b.no, `${path}.n`)),
    );
  }
}
