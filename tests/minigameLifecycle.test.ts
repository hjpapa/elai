import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Block, Cmd } from '../src/data/schema';
import { CLAW_ROUNDS, dollFlag } from '../src/data/minigames/claw';
import { SORT_ROUNDS, stampFlag } from '../src/data/minigames/sort';
import { GameState, freshSave } from '../src/game/rpg/state';
import { ClawGame } from '../src/minigames/claw/ClawGame';
import { SortGame } from '../src/minigames/sort/SortGame';
import type { MinigameContext } from '../src/minigames/types';

// 브라우저 없이 화면의 클릭과 시간 경계를 시험해요. 렌더링/편집기만 대역이고,
// 실제 놀이 엔진, 인터프리터, 판 데이터, 별 계산과 저장 상태는 그대로 써요.
const view = vi.hoisted(() => {
  type Child = ElementNode | string | number | false | null | undefined;
  class ElementNode {
    children: (ElementNode | string)[] = [];
    parent: ElementNode | null = null;
    className = '';
    style: Record<string, string> = {};
    dataset: Record<string, string> = {};
    attrs: Record<string, string> = {};
    src = '';
    alt = '';
    hidden = false;
    disabled = false;
    offsetWidth = 0;
    private onclick?: () => void;
    readonly classList = {
      add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
      remove: (...names: string[]) => { this.className = this.className.split(' ').filter((n) => !names.includes(n)).join(' '); },
      contains: (name: string) => this.className.split(' ').includes(name),
    };
    constructor(readonly tag: string, props: Record<string, unknown> = {}, ...children: Child[]) {
      this.className = String(props.class ?? '');
      this.disabled = props.disabled === true;
      if (typeof props.onclick === 'function') this.onclick = props.onclick as () => void;
      if (props.dataset) Object.assign(this.dataset, props.dataset);
      if (typeof props.style === 'string') this.attrs.style = props.style;
      for (const [key, value] of Object.entries(props)) if (key.startsWith('aria-')) this.attrs[key] = String(value);
      this.append(...children);
    }
    append(...children: Child[]): void {
      for (const child of children) {
        if (child === null || child === undefined || child === false) continue;
        if (child instanceof ElementNode) { child.remove(); child.parent = this; this.children.push(child); }
        else this.children.push(String(child));
      }
    }
    prepend(child: ElementNode): void { child.remove(); child.parent = this; this.children.unshift(child); }
    remove(): void {
      if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
      this.parent = null;
    }
    clear(): void { for (const c of this.children) if (c instanceof ElementNode) c.parent = null; this.children = []; }
    get textContent(): string { return this.children.map((c) => typeof c === 'string' ? c : c.textContent).join(''); }
    set textContent(text: string) { this.clear(); this.children.push(text); }
    setAttribute(name: string, value: string): void { this.attrs[name] = value; }
    click(): void { if (!this.disabled) this.onclick?.(); }
    querySelectorAll(selector: string): ElementNode[] {
      const [tag, cls] = selector.split('.');
      const matches = (n: ElementNode) => (!tag || n.tag === tag) && (!cls || n.classList.contains(cls));
      const found: ElementNode[] = [];
      for (const c of this.children) if (c instanceof ElementNode) {
        if (matches(c)) found.push(c);
        found.push(...c.querySelectorAll(selector));
      }
      return found;
    }
    querySelector(selector: string): ElementNode | null { return this.querySelectorAll(selector)[0] ?? null; }
    toJSON(): unknown {
      return { tag: this.tag, className: this.className, style: this.style, dataset: this.dataset, attrs: this.attrs,
        src: this.src, alt: this.alt, hidden: this.hidden, disabled: this.disabled, children: this.children };
    }
  }
  return { ElementNode, editors: [] as { value: Block[] }[] };
});

vi.mock('../src/ui/dom', async (original) => {
  const actual = await original<typeof import('../src/ui/dom')>();
  return { ...actual,
    h: (tag: string, props: Record<string, unknown> = {}, ...children: ConstructorParameters<typeof view.ElementNode>[2][]) => new view.ElementNode(tag, props, ...children),
    clear: (el: InstanceType<typeof view.ElementNode>) => el.clear(),
    lines: (text: string) => [text],
  };
});
vi.mock('../src/ui/icons', () => ({
  pxImg: (src: string, _size: number, alt = '', cls = '') => {
    const img = new view.ElementNode('img', { class: cls }); img.src = src; img.alt = alt; return img;
  },
}));
vi.mock('../src/ui/programEditor', async () => {
  const { countBlocks } = await import('../src/missions/core/interpreter');
  return { ProgramEditor: class {
    readonly el = new view.ElementNode('div', { class: 'editor' });
    private program: Block[] = [];
    private changed = () => {};
    constructor() { view.editors.push(this); }
    get value(): Block[] { return this.program; }
    set value(program: Block[]) { this.program = program; this.changed(); }
    get count(): number { return countBlocks(this.program); }
    onChange(fn: () => void): void { this.changed = fn; }
    setLocked(on: boolean): void { this.el.dataset.locked = String(on); }
    highlight(path: string | null, kind = 'run'): void { this.el.dataset.highlight = path ?? ''; this.el.dataset.kind = kind; }
    pointAtEnd(): void { this.el.dataset.highlight = 'end'; }
  } };
});

type Kind = 'claw' | 'sort';
type Mode = 'run' | 'step';
const c = (cmd: Cmd): Block => ({ t: 'cmd', cmd });
const rep = (times: number, ...body: Block[]): Block => ({ t: 'repeat', times, body });
const solutions: Record<Kind, Block[]> = {
  claw: ['right', 'right', 'up', 'up', 'grab'].map((cmd) => c(cmd as Cmd)),
  sort: ['sendLeft', 'sendRight', 'sendLeft'].map((cmd) => c(cmd as Cmd)),
};
const modes: [Kind, Mode][] = [['claw', 'run'], ['claw', 'step'], ['sort', 'run'], ['sort', 'step']];
function open(kind: Kind, state = new GameState(freshSave('검토')), round = 0) {
  const root = new view.ElementNode('div');
  const game = kind === 'claw' ? new ClawGame() : new SortGame();
  const reward = vi.spyOn(state, 'applyReward');
  const clear = vi.fn<MinigameContext['clear']>((roundId, stars, reward) => {
    const record = state.recordMinigame(kind, roundId, stars);
    if (!record.first || !reward) return record;
    const sum = state.applyReward(reward);
    return { ...record, ...(sum.title ? { title: sum.title } : {}) };
  });
  const sfx = vi.fn<MinigameContext['sfx']>();
  game.mount({ root: root as unknown as HTMLElement, icon: (key, frame = 0) => key + ':' + frame,
    sfx, helpers: { debugGlasses: true }, best: () => state.data.minigames?.[kind] ?? {},
    unlocked: () => true, hasFlag: (flag) => state.hasFlag(flag), clear, setTitle: () => {}, close: () => game.unmount() });
  root.querySelectorAll('.game-card')[round].click();
  const button = (text: string) => {
    const found = root.querySelectorAll('button').find((b) => b.textContent === text);
    if (!found) throw new Error('단추 없음: ' + text);
    return found;
  };
  return { kind, game, root, state, clear, reward, sfx, button, get editor() { return view.editors.at(-1)!; } };
}
async function until(condition: () => boolean): Promise<void> {
  for (let elapsed = 0; elapsed < 60_000 && !condition(); elapsed += 20) await vi.advanceTimersByTimeAsync(20);
  expect(condition(), '정해진 시간 안에 화면 상태에 도달해야 해요').toBe(true);
}
function announced(f: ReturnType<typeof open>): boolean {
  return /주문한 인형이 나왔어요|모두 맞게 나눴어요/.test(f.root.textContent);
}
async function succeed(f: ReturnType<typeof open>, mode: Mode = 'run'): Promise<void> {
  if (mode === 'run') { f.button('▶ 실행').click(); await until(() => announced(f)); return; }
  for (let n = 0; n < 40 && !announced(f); n++) {
    const step = f.button('한 단계씩'); step.click();
    await until(() => announced(f) || !step.disabled);
  }
  expect(announced(f)).toBe(true);
}
const flagFor = (kind: Kind, round = 0) => kind === 'claw' ? dollFlag(CLAW_ROUNDS[round].target) : stampFlag(SORT_ROUNDS[round].id);

beforeEach(() => { vi.useFakeTimers(); view.editors.length = 0; });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe('놀이 창의 성공·중단·다시 열기', () => {
  it.each(modes)('%s %s: 성공 안내 직후 닫아도 별과 첫 보상이 남아요', async (kind, mode) => {
    const f = open(kind); f.editor.value = solutions[kind];
    await succeed(f, mode);
    expect(f.root.querySelector('.game-result')).toBeNull(); // 결과 연출의 기다림이 아직 남았어요.
    expect(f.state.data.minigames?.[kind]?.r1).toBe(3);
    expect(f.state.hasFlag(flagFor(kind))).toBe(true);
    expect(f.clear).toHaveBeenCalledTimes(1);
    f.game.unmount();
    const closedView = JSON.stringify(f.root), sounds = f.sfx.mock.calls.length;
    await vi.runAllTimersAsync();
    expect(JSON.stringify(f.root)).toBe(closedView);
    expect(f.sfx).toHaveBeenCalledTimes(sounds);
    expect(f.clear).toHaveBeenCalledTimes(1);
  });

  it.each(modes)('%s %s: 실행 도중 닫고 다시 열면 보상 없이 새 판에서 시작해요', async (kind, mode) => {
    const f = open(kind); f.editor.value = solutions[kind];
    f.button(mode === 'run' ? '▶ 실행' : '한 단계씩').click();
    await vi.advanceTimersByTimeAsync(40);
    f.game.unmount();
    const closedView = JSON.stringify(f.root), sounds = f.sfx.mock.calls.length;
    const next = open(kind, f.state), newView = JSON.stringify(next.root);
    await vi.runAllTimersAsync();
    expect(f.clear).not.toHaveBeenCalled();
    expect(f.state.hasFlag(flagFor(kind))).toBe(false);
    expect(JSON.stringify(f.root)).toBe(closedView);
    expect(JSON.stringify(next.root)).toBe(newView);
    expect(f.sfx).toHaveBeenCalledTimes(sounds);
    next.editor.value = solutions[kind];
    await succeed(next);
    expect(next.state.hasFlag(flagFor(kind))).toBe(true);
    expect(next.clear).toHaveBeenCalledTimes(1);
  });

  it.each<Kind>(['claw', 'sort'])('%s: 실패 뒤 처음으로·재실행을 해도 성공한 판만 기록해요', async (kind) => {
    const f = open(kind);
    f.editor.value = kind === 'claw' ? [c('grab')] : [c('sendRight')];
    const run = f.button('▶ 실행'); run.click(); await until(() => !run.disabled);
    expect(f.clear).not.toHaveBeenCalled();
    expect(f.root.querySelector('.robi-say')?.classList.contains('bad')).toBe(true);
    f.button('처음으로').click(); f.editor.value = solutions[kind];
    await succeed(f);
    expect(f.clear).toHaveBeenCalledTimes(1);
  });
});

describe('창을 닫으면 기다리던 그림·소리도 멈춰요', () => {
  const phases = ['내려감', '오므림', '올라감', '출구 이동', '인형 내려놓음'] as const;
  it.each(phases)('집게 %s 중 닫기', async (phase) => {
    const f = open('claw'); f.editor.value = solutions.claw; f.button('▶ 실행').click();
    await until(() => {
      const down = !!f.root.querySelector('.claw-arm')?.classList.contains('down');
      const closed = f.root.querySelector('.claw-head')?.src === 'prop-claw:1';
      const carry = !!f.root.querySelector('.claw')?.classList.contains('carry');
      if (phase === '내려감') return down && !closed;
      if (phase === '오므림') return down && closed;
      if (phase === '올라감') return !down && closed && !carry;
      if (phase === '출구 이동') return carry;
      return !!f.root.querySelector('.claw-prize');
    });
    f.game.unmount(); const closedView = JSON.stringify(f.root), sounds = f.sfx.mock.calls.length;
    await vi.runAllTimersAsync();
    expect(JSON.stringify(f.root)).toBe(closedView);
    expect(f.sfx).toHaveBeenCalledTimes(sounds);
    expect(f.clear).not.toHaveBeenCalled();
  });

  it('다른 인형을 제자리에 내려놓는 도중 닫기', async () => {
    const f = open('claw'); f.editor.value = ['right', 'right', 'right', 'right', 'up', 'grab'].map((cmd) => c(cmd as Cmd));
    f.button('▶ 실행').click();
    await until(() => f.sfx.mock.calls.some(([name]) => name === 'fail') && !!f.root.querySelector('.claw-arm')?.classList.contains('down'));
    f.game.unmount(); const closedView = JSON.stringify(f.root), sounds = f.sfx.mock.calls.length;
    await vi.runAllTimersAsync();
    expect(JSON.stringify(f.root)).toBe(closedView);
    expect(f.sfx).toHaveBeenCalledTimes(sounds);
    expect(f.clear).not.toHaveBeenCalled();
  });

  it('택배의 다음 상자 줄 안내 중 닫으면 다음 물건을 보내지 않아요', async () => {
    const f = open('sort', undefined, 4);
    f.editor.value = [rep(6, { t: 'if', cond: 'boxHeart', yes: [c('sendLeft')], no: [c('sendRight')] })];
    f.button('▶ 실행').click(); await until(() => f.root.textContent.includes('2번째 상자 줄이에요'));
    f.game.unmount(); const closedView = JSON.stringify(f.root), sounds = f.sfx.mock.calls.length;
    await vi.runAllTimersAsync();
    expect(JSON.stringify(f.root)).toBe(closedView);
    expect(f.sfx).toHaveBeenCalledTimes(sounds);
    expect(f.clear).not.toHaveBeenCalled();
  });
});

describe('같은 판 재도전', () => {
  it.each<Kind>(['claw', 'sort'])('%s: 별은 올리되 처음 보상을 중복하지 않아요', async (kind) => {
    const index = kind === 'claw' ? 0 : 2, f = open(kind, undefined, index), flag = flagFor(kind, index);
    const before = { xp: f.state.data.xp, coins: f.state.data.coins };
    f.editor.value = kind === 'claw' ? ['right', 'right', 'up', 'up', 'up', 'down', 'grab'].map((cmd) => c(cmd as Cmd))
      : Array.from({ length: 4 }, () => [c('sendLeft'), c('sendRight')]).flat();
    await succeed(f); await until(() => !!f.root.querySelector('.game-result'));
    expect(f.clear.mock.results[0].value).toMatchObject({ first: true, improved: false });
    expect(f.state.data.minigames?.[kind]?.['r' + (index + 1)]).toBeLessThan(3);
    f.button('다시 하기').click();
    f.editor.value = kind === 'claw' ? solutions.claw : [rep(4, c('sendLeft'), c('sendRight'))];
    await succeed(f); await until(() => !!f.root.querySelector('.game-result'));
    expect(f.clear.mock.results[1].value).toMatchObject({ first: false, improved: true });
    expect(f.state.data.minigames?.[kind]?.['r' + (index + 1)]).toBe(3);
    f.button('다시 하기').click();
    f.editor.value = kind === 'claw' ? solutions.claw : [rep(4, c('sendLeft'), c('sendRight'))];
    await succeed(f);
    expect(f.clear.mock.results[2].value).toMatchObject({ first: false, improved: false });
    expect(f.state.hasFlag(flag)).toBe(true);
    expect(f.reward).toHaveBeenCalledTimes(1);
    expect({ xp: f.state.data.xp, coins: f.state.data.coins }).toEqual(before);
  });
});
