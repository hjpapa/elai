import { SIDE_NAME, SORT_ITEM_ICON, SORT_ITEM_NAME, SORT_ROUNDS, SORT_TITLE, sortTier, stampFlag } from '../../data/minigames/sort';
import type { SortItem, SortRound, SortSide } from '../../data/schema';
import { starsFor } from '../../missions/blockCode/BlockCodeMission';
import { countBlocks } from '../../missions/core/interpreter';
import { clear, h, josa, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { hasIf, runSort, type SortFrame, type SortOutcome } from './sortEnv';

/** 놀이 판: 가운데 줄이 벨트(위 = 먼 쪽), 맨 아래 줄이 [왼쪽 바구니][미끄럼틀][문][미끄럼틀][오른쪽 바구니]예요. */
const COLS = 5;
const ROWS = 5;
const GATE = { x: 2, y: 4 };
const BIN: Record<SortSide, { x: number; y: number }> = { left: { x: 0, y: 4 }, right: { x: 4, y: 4 } };
/** 벨트에 보이는 물건 수(문 위 1개 + 벨트 4칸) */
const VISIBLE = 5;
/** 물건이 바구니로 미끄러지는 시간(CSS .sort-item.sending과 같아요) */
const SEND_MS = 320;
/** 벨트가 한 칸 내려오는 시간(CSS .sort-item과 같아요) */
const ADVANCE_MS = 260;

interface Step {
  belt: number;
  frame: SortFrame;
}

/**
 * 코딩 택배 분류: 판 고르기 → 분류 기계 판 + 블록 편집기 → 결과.
 * 보내기 블록 하나가 맨 앞 물건 하나를 바구니로 보내요(SortEnv). 같은 프로그램은 늘 같은 결과예요.
 */
export class SortGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: SortRound | null = null;
  private editor: ProgramEditor | null = null;
  private say!: HTMLElement;
  private board!: HTMLElement;
  private beltLabel!: HTMLElement;
  private queueLabel!: HTMLElement;
  private gateCell!: HTMLElement;
  private bins!: Record<SortSide, { cell: HTMLElement; img: HTMLImageElement; count: HTMLElement; n: number }>;
  /** 지금 줄의 물건 그림(차례대로) */
  private items: HTMLElement[] = [];
  private buttons: HTMLButtonElement[] = [];
  private fails = 0;
  private busy = false;
  /** 지금 보여 주는 줄과, 그 줄에서 보낸 물건 수 */
  private belt = 0;
  private sent = 0;
  /** 한 단계씩 실행할 때의 기록 */
  private trace: { steps: Step[]; outcome: SortOutcome; failedBelt: number; at: number } | null = null;

  mount(ctx: MinigameContext): void {
    this.ctx = ctx;
    this.showList();
  }

  unmount(): void {
    this.alive = false;
  }

  // ── 판 고르기 ──
  private showList(): void {
    const ctx = this.ctx;
    this.round = null;
    this.editor = null;
    this.trace = null;
    this.busy = false;
    this.buttons = [];
    clear(ctx.root);
    ctx.setTitle('코딩 택배 분류');
    const best = ctx.best();
    const got = SORT_ROUNDS.filter((r) => ctx.hasFlag(stampFlag(r.id))).length;
    const cards = SORT_ROUNDS.map((r, i) => {
      const open = ctx.unlocked(r.unlock);
      const stars = best[r.id] ?? 0;
      return h(
        'button',
        {
          class: `game-card ${open ? '' : 'locked'} ${stars ? 'done' : ''}`.trim(),
          disabled: !open,
          onclick: () => this.openRound(r),
          'aria-label': open ? `${i + 1}판 ${r.title}` : `${i + 1}판 ${r.title}, 닫혀 있어요`,
        },
        pxImg(ctx.icon(open ? SORT_ITEM_ICON[r.belts[0][0]] : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? sortTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open
            ? h('span', { class: 'mini-stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((k) => pxImg(ctx.icon(k < stars ? 'icon-star' : 'icon-star-empty'), 18)))
            : null,
        ),
      );
    });
    const stamps = SORT_ROUNDS.map((r, i) => {
      const has = ctx.hasFlag(stampFlag(r.id));
      return h(
        'figure',
        { class: `stamp ${has ? 'got' : ''}`.trim(), title: has ? `${i + 1}판 배달 도장` : '아직 받지 않았어요' },
        pxImg(ctx.icon('icon-stamp'), 40, has ? `${i + 1}판 도장` : '빈 칸'),
        h('figcaption', {}, `${i + 1}판`),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'sort-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `배달 도장 ${got} / ${SORT_ROUNDS.length}`),
        h('div', { class: 'stamp-card' }, ...stamps),
      ),
    );
    this.talk(got === SORT_ROUNDS.length ? '도장을 모두 모았어요!\n별을 더 받으러 다시 해도 좋아요.' : '상자를 주문 카드대로 나눠요.\n기계는 프로그램대로만 움직여요.');
  }

  // ── 판 놀이 ──
  private openRound(r: SortRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.buttons = [];
    this.fails = 0;
    this.trace = null;
    this.busy = false;
    const index = SORT_ROUNDS.indexOf(r);
    ctx.setTitle(`코딩 택배 분류 · ${index + 1}판 ${r.title}`);
    const editor = new ProgramEditor({ palette: r.palette, allowRepeat: r.allowRepeat, allowIf: r.allowIf, maxBlocks: r.maxBlocks, optimal: r.optimal });
    editor.onChange(() => {
      this.trace = null;
      this.showBelt(0);
    });
    this.editor = editor;
    this.say = h('div', { class: 'robi-say' });
    const machine = this.buildMachine(r);
    const runBtn = this.button('▶ 실행', 'primary', () => void this.runAll());
    const step = this.button('한 단계씩', 'blue', () => void this.stepOnce());
    const reset = this.button('처음으로', '', () => {
      this.trace = null;
      this.showBelt(0);
    });
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    const rules = (Object.entries(r.rule) as [SortItem, SortSide][]).map(([item, side]) =>
      h('div', { class: 'sort-rule' }, pxImg(ctx.icon(SORT_ITEM_ICON[item]), 28, SORT_ITEM_NAME[item]), `${SORT_ITEM_NAME[item]} → ${SIDE_NAME[side]} 바구니`),
    );
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle sort-play' },
        h('div', {}, machine, h('div', { class: 'row center', style: 'margin-top:10px' }, runBtn, step, reset, hint)),
        h(
          'div',
          {},
          h('div', { class: 'game-order sort-order' }, h('small', {}, '주문 카드'), ...rules),
          this.say,
          h('div', { style: 'height:10px' }),
          editor.el,
        ),
      ),
    );
    this.showBelt(0);
    this.talk(r.belts.length > 1 ? '상자 줄 세 개를 차례로 나눠요.\n같은 프로그램으로 모두 맞혀요!' : '블록을 놓고 ▶ 실행을 눌러요.\n맨 아래 문 위의 상자부터 와요.');
  }

  private button(label: string, kind: string, onclick: () => void): HTMLButtonElement {
    const b = h('button', { class: `btn ${kind}`.trim(), onclick }, label);
    this.buttons.push(b);
    return b;
  }

  private setBusy(on: boolean): void {
    this.busy = on;
    this.editor?.setLocked(on);
    for (const b of this.buttons) b.disabled = on;
  }

  private talk(text: string, mood: '' | 'good' | 'bad' | 'hint' = ''): void {
    this.say.className = `robi-say ${mood}`.trim();
    clear(this.say);
    this.say.append(pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(text)));
  }

  /** 분류 기계: 비스듬히 기울인 판(퍼즐 판과 같은 모양). 가운데 줄이 벨트이고 맨 아래에서 양쪽 바구니로 갈라져요. */
  private buildMachine(r: SortRound): HTMLElement {
    const board = h('div', { class: 'board tilt sort-board', style: `grid-template-columns: repeat(${COLS}, 1fr)` });
    const bin = (side: SortSide, cell: HTMLElement) => {
      const img = pxImg(this.ctx.icon('prop-sort-basket', 0), 32, `${SIDE_NAME[side]} 바구니`, 'stand basket');
      const count = h('span', { class: 'sort-bin-count', 'aria-label': `${SIDE_NAME[side]} 바구니에 든 물건 수` }, '0');
      cell.append(img, count);
      return { cell, img, count, n: 0 };
    };
    const made: Partial<Record<SortSide, { cell: HTMLElement; img: HTMLImageElement; count: HTMLElement; n: number }>> = {};
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const bottom = y === ROWS - 1;
        const kind = x === GATE.x ? (bottom ? 'gate' : 'belt') : bottom ? (x === 1 || x === 3 ? `chute ${x === 1 ? 'left' : 'right'}` : 'bin') : '';
        const cell = h('div', { class: `cell ${(x + y) % 2 ? 'alt' : ''} ${kind}`.trim() });
        if (bottom && x === BIN.left.x) made.left = bin('left', cell);
        if (bottom && x === BIN.right.x) made.right = bin('right', cell);
        if (bottom && x === GATE.x) this.gateCell = cell;
        board.append(cell);
      }
    }
    this.bins = { left: made.left!, right: made.right! };
    this.board = board;
    this.items = [];
    this.beltLabel = h('div', { class: 'sort-belt-label', 'aria-live': 'polite' });
    this.queueLabel = h('div', { class: 'sort-queue' });
    return h(
      'div',
      { class: 'sort-machine' },
      h('div', { class: 'sort-sign' }, '코딩 택배 분류'),
      r.belts.length > 1 ? this.beltLabel : null,
      h('div', { class: 'board-stage' }, board),
      this.queueLabel,
    );
  }

  private place(el: HTMLElement, x: number, y: number): void {
    // 판 안쪽 여백(6px)을 빼고 칸 비율로 놓아요(퍼즐 판의 로비와 같아요).
    el.style.left = `calc(6px + (100% - 12px) * ${x / COLS})`;
    el.style.top = `calc(6px + (100% - 12px) * ${y / ROWS})`;
    el.style.width = `calc((100% - 12px) / ${COLS})`;
    el.style.height = `calc((100% - 12px) / ${ROWS})`;
  }

  /** 벨트 칸: 0 = 문 위(맨 앞), 1~4 = 그 위 벨트 */
  private slotPos(slot: number): { x: number; y: number } {
    return { x: GATE.x, y: GATE.y - slot };
  }

  /** 줄을 처음 모습으로 놓아요(바구니 비우기, 물건 다시 놓기). */
  private showBelt(index: number): void {
    const r = this.round;
    if (!r) return;
    this.belt = index;
    this.sent = 0;
    for (const el of this.items) el.remove();
    this.items = (r.belts[index] ?? []).map((item) => {
      const el = h('div', { class: 'sort-item', dataset: { item } }, pxImg(this.ctx.icon(SORT_ITEM_ICON[item]), 32, SORT_ITEM_NAME[item], 'stand'));
      this.board.append(el);
      return el;
    });
    for (const b of Object.values(this.bins)) {
      b.n = 0;
      b.count.textContent = '0';
      b.img.src = this.ctx.icon('prop-sort-basket', 0);
      b.cell.classList.remove('wrong');
    }
    this.gateCell.classList.remove('wrong');
    this.layoutQueue();
    this.beltLabel.textContent = `상자 줄 ${index + 1} / ${r.belts.length}`;
    this.editor?.highlight(null);
  }

  /** 아직 보내지 않은 물건을 벨트 칸에 놓아요(보이는 칸보다 많으면 숨겨요). */
  private layoutQueue(): void {
    this.items.forEach((el, j) => {
      const slot = j - this.sent;
      if (slot < 0) return;
      el.hidden = slot >= VISIBLE;
      const p = this.slotPos(Math.min(slot, VISIBLE - 1));
      this.place(el, p.x, p.y);
    });
    const left = this.items.length - this.sent;
    const hidden = Math.max(0, left - VISIBLE);
    this.queueLabel.textContent = hidden > 0 ? `남은 상자 ${left}개 (벨트 위에 ${hidden}개 더)` : `남은 상자 ${left}개`;
  }

  private shake(el: HTMLElement): void {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  /** 한 걸음 보여 주기: 맨 앞 물건이 바구니로 미끄러지고, 벨트가 한 칸 내려와요. */
  private async play(f: SortFrame): Promise<void> {
    const wrong = f.event === 'empty' || (f.event === 'send' && !f.correct);
    this.editor?.highlight(f.path, wrong ? 'err' : 'run');
    if (f.event === 'empty') {
      this.gateCell.classList.add('wrong');
      this.shake(this.gateCell);
      this.ctx.sfx('fail');
      await sleep(SEND_MS);
      return;
    }
    if (f.event !== 'send' || !f.side) {
      await sleep(120);
      return;
    }
    const el = this.items[this.sent];
    if (!el) return;
    const bin = BIN[f.side];
    el.classList.add('sending');
    this.place(el, bin.x, bin.y);
    this.ctx.sfx('step');
    await sleep(SEND_MS);
    if (!this.alive) return;
    el.classList.remove('sending');
    const b = this.bins[f.side];
    b.n++;
    b.count.textContent = String(b.n);
    b.img.src = this.ctx.icon('prop-sort-basket', 1);
    if (f.correct) {
      el.hidden = true;
    } else {
      // 잘못 들어간 물건은 바구니 위에 얹어 두고 흔들어서 무엇이 틀렸는지 보여 줘요(바구니에 가려지지 않게 조금 위로).
      this.place(el, bin.x, bin.y - 0.55);
      b.cell.classList.add('wrong');
      this.shake(el);
      this.ctx.sfx('fail');
    }
    this.sent++;
    this.layoutQueue();
    await sleep(ADVANCE_MS);
  }

  private compute(): { steps: Step[]; outcome: SortOutcome; failedBelt: number } {
    const r = this.round!;
    const res = runSort(r, this.editor?.value ?? []);
    const last = res.failedBelt < 0 ? res.belts.length - 1 : res.failedBelt;
    const steps: Step[] = [];
    for (let b = 0; b <= last; b++) for (const frame of res.belts[b].frames) steps.push({ belt: b, frame });
    return { steps, outcome: res.outcome, failedBelt: res.failedBelt };
  }

  private async runAll(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    this.setBusy(true);
    this.trace = null;
    this.showBelt(0);
    const { steps, outcome, failedBelt } = this.compute();
    for (const s of steps) {
      if (!this.alive) return;
      if (s.belt !== this.belt) {
        // 다음 줄: 잠깐 쉬고 바구니를 비운 뒤 새 상자 줄을 놓아요.
        await sleep(450);
        if (!this.alive) return;
        this.showBelt(s.belt);
        this.talk(`${s.belt + 1}번째 상자 줄이에요.\n같은 프로그램으로 나눠요.`);
        await sleep(350);
        if (!this.alive) return;
      }
      await this.play(s.frame);
    }
    if (!this.alive) return;
    this.setBusy(false);
    await this.finishRun(outcome, failedBelt, steps);
  }

  private async stepOnce(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    if (!this.trace) {
      this.showBelt(0);
      this.trace = { ...this.compute(), at: 0 };
    }
    const t = this.trace;
    if (t.at < t.steps.length) {
      const s = t.steps[t.at];
      t.at++;
      this.setBusy(true);
      if (s.belt !== this.belt) this.showBelt(s.belt);
      await this.play(s.frame);
      if (!this.alive) return;
      this.setBusy(false);
      this.talk(`${t.at}번째 걸음이에요. 계속 눌러 봐요.`);
    }
    if (t.at >= t.steps.length) {
      this.trace = null;
      await this.finishRun(t.outcome, t.failedBelt, t.steps);
    }
  }

  private failText(r: SortRound, outcome: SortOutcome, failedBelt: number, steps: Step[]): string {
    const multi = r.belts.length > 1;
    // 첫 줄은 맞았는데 다른 줄에서 틀렸고 만약이 없으면: 순서만 외운 프로그램이에요.
    if (multi && failedBelt > 0 && !hasIf(this.editor?.value ?? [])) return '첫 줄에만 맞는 순서예요.\n만약 블록으로 규칙을 만들어요.';
    const at = multi ? `${failedBelt + 1}번째 줄` : '';
    const last = [...steps].reverse().find((s) => s.belt === failedBelt)?.frame;
    switch (outcome) {
      case 'wrongBin': {
        const what = last?.item ? josa(SORT_ITEM_NAME[last.item], '을', '를') : '상자를';
        const where = last?.side ? SIDE_NAME[last.side] : '다른 쪽';
        return multi ? `${at}의 ${what}\n${where}에 보냈어요.` : `${what} ${where}에 보냈어요.\n주문 카드를 다시 봐요.`;
      }
      case 'emptyBelt':
        return `${multi ? `${at}에서 ` : ''}보낼 상자가 없어요.\n상자 수를 세어 봐요.`;
      case 'leftover':
        return `${multi ? `${at}에 ` : '아직 '}상자가 남았어요.\n상자 수만큼 보내요.`;
      default:
        return '프로그램이 너무 오래 돌아요.\n반복 횟수를 확인해 봐요.';
    }
  }

  private async finishRun(outcome: SortOutcome, failedBelt: number, steps: Step[]): Promise<void> {
    const r = this.round;
    const editor = this.editor;
    if (!this.alive || !r || !editor) return;
    if (outcome === 'success') {
      const stars = starsFor(countBlocks(editor.value), r.optimal);
      // 성공은 바로 저장하고, 아래 기다림은 결과 화면을 보여 주는 연출에만 써요.
      const allAfter = SORT_ROUNDS.every((x) => x.id === r.id || this.ctx.hasFlag(stampFlag(x.id)));
      const result = this.ctx.clear(r.id, stars, { flags: [stampFlag(r.id)], ...(allAfter ? { title: SORT_TITLE } : {}) });
      editor.highlight(null);
      this.ctx.sfx('success');
      this.talk(stars === 3 ? '모두 맞게 나눴어요!\n가장 짧은 프로그램이에요!' : '모두 맞게 나눴어요!\n블록을 더 줄일 수 있을까요?', 'good');
      this.setBusy(true);
      await sleep(900);
      if (!this.alive) return;
      this.showResult(r, stars, result);
      return;
    }
    this.fails++;
    this.talk(this.failText(r, outcome, failedBelt, steps), 'bad');
    if (this.ctx.helpers.debugGlasses) {
      // 디버그 안경: 잘못 보낸 블록이나 빈 벨트에서 보낸 블록을 짚어 줘요.
      const wrong = steps.find((s) => s.belt === failedBelt && (s.frame.event === 'empty' || (s.frame.event === 'send' && !s.frame.correct)));
      if (wrong) editor.highlight(wrong.frame.path, 'err');
      else editor.pointAtEnd();
    }
    if (this.fails === 2) this.showHint();
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  // ── 결과 ──
  private showResult(r: SortRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    this.editor = null;
    clear(ctx.root);
    const index = SORT_ROUNDS.indexOf(r);
    const next = SORT_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, '배달 완료!'),
        pxImg(ctx.icon('icon-stamp'), 96, `${index + 1}판 배달 도장`, 'game-prize big'),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines('처음 받은 배달 도장이에요.\n택배소에 보낸 상자가 쌓였어요.')) : null,
        result.title ? h('div', { class: 'special' }, h('b', {}, `새 칭호: ${result.title}`)) : null,
        h(
          'div',
          { class: 'row center', style: 'margin-top:12px' },
          h('button', { class: 'btn', onclick: () => this.openRound(r) }, '다시 하기'),
          nextOpen ? h('button', { class: 'btn primary', onclick: () => this.openRound(next) }, '다음 판') : null,
          h('button', { class: nextOpen ? 'btn' : 'btn primary', onclick: () => this.showList() }, '판 고르기'),
        ),
      ),
    );
    if (result.title) ctx.sfx('levelup');
  }
}
