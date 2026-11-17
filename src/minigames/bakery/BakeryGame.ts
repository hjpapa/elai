import { BAKERY_CARDS, BAKERY_ROUNDS, BAKERY_TITLE, CAKE_MESSAGE, CAKE_SLOTS, bakeryTier, cakeFlag } from '../../data/minigames/bakery';
import type { BakeryRound, CakeOrder, CakeSlotId } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { bake, type BakeResult, type CakeChoice } from './bakeryEnv';
import { CAKE_SIZE, cakePixels } from './cakeArt';

/**
 * 주문서 빵집: 판 고르기 → 손님 그림 + 주문서 + 오븐 → 결과.
 * 오븐은 주문서 카드대로만 구워요(bakeryEnv). 고쳐 묻기는 감점이 아니고, 개인정보 카드로 구우면 별이 하나 줄어요.
 */
export class BakeryGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: BakeryRound | null = null;
  private choice: CakeChoice = {};
  private customer = 0;
  private privacyUsed = false;
  private fails = 0;
  private busy = false;
  private say!: HTMLElement;
  private slotsEl!: HTMLElement;
  private customerEl!: HTMLElement;
  private ovenEl!: HTMLElement;
  private buttons: HTMLButtonElement[] = [];

  mount(ctx: MinigameContext): void {
    this.ctx = ctx;
    this.showList();
  }

  unmount(): void {
    this.alive = false;
  }

  /** 케이크 그림(16×16 픽셀). 글씨 판이 있으면 아래에 글씨를 적어요. */
  private cakeView(cake: CakeOrder | null, label: string, size: number): HTMLElement {
    const px = cake ? cakePixels(cake) : null;
    const grid = h(
      'div',
      { class: `cake ${cake ? '' : 'empty'}`.trim(), style: `width:${size}px;height:${size}px;grid-template-columns:repeat(${CAKE_SIZE}, 1fr)`, role: 'img', 'aria-label': label },
      ...(px ? px.flat().map((c) => h('span', c ? { style: `background:${c}` } : {})) : []),
    );
    const text = cake?.message ? CAKE_MESSAGE[cake.message] : undefined;
    return h('figure', { class: 'cake-figure' }, grid, text ? h('figcaption', {}, `글씨: ${text}`) : null);
  }

  // ── 판 고르기 ──
  private showList(): void {
    const ctx = this.ctx;
    this.round = null;
    this.busy = false;
    this.buttons = [];
    clear(ctx.root);
    ctx.setTitle('주문서 빵집');
    const best = ctx.best();
    const got = BAKERY_ROUNDS.filter((r) => ctx.hasFlag(cakeFlag(r.id))).length;
    const cards = BAKERY_ROUNDS.map((r, i) => {
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
        pxImg(ctx.icon(open ? 'icon-cake' : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? bakeryTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open
            ? h('span', { class: 'mini-stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((k) => pxImg(ctx.icon(k < stars ? 'icon-star' : 'icon-star-empty'), 18)))
            : null,
        ),
      );
    });
    const shelf = BAKERY_ROUNDS.map((r, i) => {
      const has = ctx.hasFlag(cakeFlag(r.id));
      const last = r.customers[r.customers.length - 1].want;
      return h(
        'div',
        { class: `cake-frame ${has ? 'got' : ''}`.trim(), title: has ? `${i + 1}판 케이크` : '아직 비어 있어요' },
        this.cakeView(has ? last : null, has ? `${i + 1}판 케이크` : '빈 접시', 56),
        h('small', {}, `${i + 1}판`),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'bakery-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `진열대 케이크 ${got} / ${BAKERY_ROUNDS.length}`),
        h('div', { class: 'bakery-shelf' }, ...shelf),
      ),
    );
    this.talk(got === BAKERY_ROUNDS.length ? '케이크를 모두 구웠어요!\n별을 더 받으러 다시 해도 좋아요.' : '손님 그림을 보고 주문서를 써요.\n오븐은 주문서대로만 구워요.');
  }

  // ── 판 놀이 ──
  private openRound(r: BakeryRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.choice = { ...(r.initial ?? {}) };
    this.customer = 0;
    this.privacyUsed = false;
    this.fails = 0;
    this.busy = false;
    this.buttons = [];
    const index = BAKERY_ROUNDS.indexOf(r);
    ctx.setTitle(`주문서 빵집 · ${index + 1}판 ${r.title}`);
    this.say = h('div', { class: 'robi-say' });
    this.slotsEl = h('div', { class: 'bakery-order' });
    this.customerEl = h('div', { class: 'bakery-customer' });
    this.ovenEl = h('div', { class: 'bakery-oven' });
    const bakeBtn = this.button('주문서로 굽기', 'primary', () => void this.bakeNow());
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle bakery-play' },
        h('div', {}, this.customerEl, this.ovenEl),
        h('div', {}, h('h3', { class: 'bakery-order-title' }, '주문서'), this.slotsEl, h('div', { class: 'row center', style: 'margin-top:8px' }, bakeBtn, hint), this.say),
      ),
    );
    this.renderCustomer();
    this.renderSlots();
    this.renderOven(null);
    this.talk(
      r.customers.length > 1
        ? '손님이 차례로 와요.\n주문서를 고쳐 가며 구워요.'
        : r.initial
          ? '주문서가 미리 적혀 있어요.\n그림과 다른 곳을 고쳐요.'
          : '칸마다 카드를 하나씩 골라요.\n다 고르면 굽기를 눌러요.',
    );
  }

  private button(label: string, kind: string, onclick: () => void): HTMLButtonElement {
    const b = h('button', { class: `btn ${kind}`.trim(), onclick }, label);
    this.buttons.push(b);
    return b;
  }

  private setBusy(on: boolean): void {
    this.busy = on;
    for (const b of this.buttons) b.disabled = on;
    this.slotsEl.classList.toggle('locked', on);
  }

  private talk(text: string, mood: '' | 'good' | 'bad' | 'hint' = ''): void {
    this.say.className = `robi-say ${mood}`.trim();
    clear(this.say);
    this.say.append(pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(text)));
  }

  /** 지금 손님: 이름, 하는 말, 원하는 케이크 그림 */
  private renderCustomer(): void {
    const r = this.round;
    if (!r) return;
    const c = r.customers[this.customer];
    clear(this.customerEl);
    this.customerEl.append(
      h(
        'div',
        { class: 'bakery-customer-head' },
        h('b', {}, `손님 ${c.who}`),
        r.customers.length > 1 ? h('small', {}, `${this.customer + 1} / ${r.customers.length}번째 손님`) : null,
      ),
      h('p', { class: 'bakery-say' }, ...lines(c.say)),
      this.cakeView(c.want, '손님이 원하는 케이크', 128),
    );
  }

  /** 주문서: 칸마다 카드(칩). 같은 카드를 다시 누르면 칸을 비워요. */
  private renderSlots(marks: Partial<Record<CakeSlotId, 'diff' | 'guess' | 'privacy'>> = {}): void {
    const r = this.round;
    if (!r) return;
    clear(this.slotsEl);
    for (const slot of r.slots) {
      const info = CAKE_SLOTS[slot];
      const row = h('div', { class: 'row' });
      for (const id of r.cards[slot] ?? []) {
        const card = BAKERY_CARDS[id];
        if (!card) continue;
        const on = this.choice[slot] === id;
        row.append(
          h(
            'button',
            {
              class: `chip ${on ? 'on' : ''} ${card.vague ? 'vague' : ''} ${card.privacy ? 'privacy' : ''}`.replace(/\s+/g, ' ').trim(),
              'aria-label': `${info.label}: ${card.text}`,
              'aria-pressed': on ? 'true' : 'false',
              onclick: () => {
                if (this.busy) return;
                this.choice[slot] = on ? undefined : id;
                this.ctx.sfx('click');
                this.renderSlots();
              },
            },
            card.text,
          ),
        );
      }
      const mark = marks[slot];
      this.slotsEl.append(
        h(
          'div',
          { class: `order-slot ${mark ? `mark-${mark}` : ''}`.trim() },
          h('span', { class: 'lbl' }, info.label),
          h('span', { class: 'q' }, info.question),
          row,
        ),
      );
    }
  }

  /** 오븐 결과: 구운 케이크와 칸마다 알림 */
  private renderOven(res: BakeResult | null): void {
    clear(this.ovenEl);
    const title = h('div', { class: 'bakery-oven-head' }, pxImg(this.ctx.icon('icon-cake'), 28, ''), '주문서 오븐');
    if (!res) {
      this.ovenEl.append(title, h('p', { class: 'muted' }, ...lines('주문서를 쓰고 굽기를 누르면\n여기에 케이크가 나와요.')));
      return;
    }
    const notes: HTMLElement[] = [];
    const label = (slot: CakeSlotId) => CAKE_SLOTS[slot].label;
    for (const slot of res.privacy) notes.push(h('li', { class: 'privacy' }, `${label(slot)}: 개인정보는 넣지 않아요`));
    for (const slot of res.empty) notes.push(h('li', { class: 'guess' }, `${label(slot)}: 빈 칸이라 오븐이 골랐어요`));
    for (const slot of res.vague) notes.push(h('li', { class: 'guess' }, `${label(slot)}: 애매해서 오븐이 골랐어요`));
    for (const slot of res.diff) if (!res.empty.includes(slot) && !res.vague.includes(slot)) notes.push(h('li', { class: 'diff' }, `${label(slot)}: 그림과 달라요`));
    this.ovenEl.append(title, this.cakeView(res.cake, res.cake ? '오븐이 구운 케이크' : '굽지 않았어요', 128));
    if (notes.length) this.ovenEl.append(h('ul', { class: 'bakery-notes' }, ...notes));
  }

  private async bakeNow(): Promise<void> {
    const r = this.round;
    if (!r || this.busy) return;
    const want = r.customers[this.customer].want;
    const res = bake(r, this.choice, want);
    this.setBusy(true);
    // 굽는 모습: 잠깐 오븐이 데워져요.
    this.ovenEl.classList.add('baking');
    this.ctx.sfx('step');
    await sleep(600);
    if (!this.alive) return;
    this.ovenEl.classList.remove('baking');
    this.renderOven(res);
    // 좁은 화면(한 줄 배치)에서는 굽기 단추가 아래, 오븐이 위라서 결과 쪽으로 올려 보여 줘요.
    if (typeof window !== 'undefined' && window.innerWidth <= 720 && this.ovenEl.getBoundingClientRect().top < 0) {
      const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      this.ovenEl.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
    }
    const marks: Partial<Record<CakeSlotId, 'diff' | 'guess' | 'privacy'>> = {};
    for (const s of res.diff) marks[s] = 'diff';
    for (const s of [...res.empty, ...res.vague]) marks[s] = 'guess';
    for (const s of res.privacy) marks[s] = 'privacy';
    this.renderSlots(marks);
    if (res.outcome === 'privacy') {
      this.privacyUsed = true;
      this.ctx.sfx('fail');
      this.talk('이름·반·주소 같은 개인정보는\n주문서에 넣지 않아요.', 'bad');
      this.setBusy(false);
      return;
    }
    if (res.outcome === 'mismatch') {
      this.fails++;
      this.ctx.sfx('fail');
      this.talk(res.empty.length + res.vague.length > 0 ? '빈 칸이나 애매한 말은\n오븐이 마음대로 골라요.' : '그림과 다른 곳이 있어요.\n주문서를 고쳐 다시 물어요.', 'bad');
      this.setBusy(false);
      if (this.fails === 2) this.showHint();
      return;
    }
    // 그림과 같아요.
    this.ctx.sfx('success');
    if (this.customer < r.customers.length - 1) {
      this.talk('딱 맞아요!\n다음 손님이 와요.', 'good');
      await sleep(900);
      if (!this.alive) return;
      this.customer++;
      this.fails = 0;
      this.renderCustomer();
      this.renderSlots();
      this.renderOven(null);
      this.talk('주문서는 그대로 있어요.\n달라진 칸만 고쳐 물어요.');
      this.setBusy(false);
      return;
    }
    const stars = this.privacyUsed ? 2 : 3;
    // 성공은 바로 저장하고, 아래 기다림은 결과 화면을 보여 주는 연출에만 써요.
    const allAfter = BAKERY_ROUNDS.every((x) => x.id === r.id || this.ctx.hasFlag(cakeFlag(x.id)));
    const result = this.ctx.clear(r.id, stars, { flags: [cakeFlag(r.id)], ...(allAfter ? { title: BAKERY_TITLE } : {}) });
    this.talk('손님 그림과 똑같아요!\n주문서를 또렷하게 썼어요.', 'good');
    await sleep(900);
    if (!this.alive) return;
    this.showResult(r, stars, result);
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  // ── 결과 ──
  private showResult(r: BakeryRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    clear(ctx.root);
    const index = BAKERY_ROUNDS.indexOf(r);
    const next = BAKERY_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, '케이크 완성!'),
        h('div', { class: 'bakery-result' }, ...r.customers.map((c) => this.cakeView(c.want, `${c.who}의 케이크`, 96))),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        r.customers.length > 1 || r.initial ? h('p', {}, ...lines('결과를 보고 고쳐 물으면\n원하는 결과에 가까워져요.')) : null,
        this.privacyUsed ? h('p', {}, ...lines('개인정보 카드를 넣었던 판은\n별이 하나 적어요.')) : null,
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines('처음 구운 케이크예요.\n빵집 진열대에 놓였어요.')) : null,
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
