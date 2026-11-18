import { CRATE_FRUITS, FRUITS, FRUIT_COLORS, FRUIT_FEATURES, FRUIT_KINDS, FRUIT_PATTERNS, FRUIT_ROUNDS, FRUIT_SAY, FRUIT_SHAPES, FRUIT_TITLE, fruitFlag, fruitTier } from '../../data/minigames/fruit';
import type { FruitRound } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { FRUIT_SIZE, fruitPixels } from './fruitArt';
import { FEATURE_IDS, boxOf, fruitStars, runTest, sameFeatures, type BoxCard, type Guess, type TestReport } from './fruitEnv';

/** 과일 그림(16×16)을 <img>에 쓸 주소로 만들어 둬요. fresh는 로봇이 처음 보는 시험 과일이에요. */
const fruitSrcCache = new Map<string, string>();
function fruitSrc(id: string, fresh = false): string {
  const key = `${id}|${fresh}`;
  let src = fruitSrcCache.get(key);
  if (!src) {
    const canvas = document.createElement('canvas');
    canvas.width = FRUIT_SIZE;
    canvas.height = FRUIT_SIZE;
    const g = canvas.getContext('2d')!;
    fruitPixels(FRUITS[id], fresh).forEach((row, y) =>
      row.forEach((c, x) => {
        if (!c) return;
        g.fillStyle = c;
        g.fillRect(x, y, 1, 1);
      }),
    );
    src = canvas.toDataURL();
    fruitSrcCache.set(key, src);
  }
  return src;
}

const calmMotion = (): boolean => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * 과일 AI 가르치기: 판 고르기 → 시험 바구니 + 학습 상자 + 예시 카드 → 결과.
 * 로봇은 학습 상자의 예시만 보고 답해요(fruitEnv). 다시 학습해도 감점이 없고, 이름표가 틀린 카드가 남으면 별이 하나 줄어요.
 */
export class FruitGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: FruitRound | null = null;
  /** 학습 상자에 든 카드 id(넣은 차례) */
  private box: string[] = [];
  /** 고친 이름표(카드 id → 과일 종류) */
  private labels: Record<string, string> = {};
  private report: TestReport | null = null;
  /** 결과를 보여 준 시험 과일 수(차례로 나타나요) */
  private shown = 0;
  /** 로봇 생각을 보고 있는 시험 과일('바구니:차례') */
  private picked: string | null = null;
  /** 시험마다 정확도(0~100) */
  private history: number[] = [];
  private fails = 0;
  private busy = false;
  private say!: HTMLElement;
  private basketsEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private whyEl!: HTMLElement;
  private boxTitle!: HTMLElement;
  private boxEl!: HTMLElement;
  private poolWrap!: HTMLElement;
  private poolEl!: HTMLElement;
  private buttons: HTMLButtonElement[] = [];

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
    this.busy = false;
    this.buttons = [];
    clear(ctx.root);
    ctx.setTitle('과일 AI 가르치기');
    const best = ctx.best();
    const got = FRUIT_ROUNDS.filter((r) => ctx.hasFlag(fruitFlag(r.id))).length;
    const cards = FRUIT_ROUNDS.map((r, i) => {
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
        pxImg(ctx.icon(open ? 'icon-fruit' : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? fruitTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open
            ? h('span', { class: 'mini-stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((k) => pxImg(ctx.icon(k < stars ? 'icon-star' : 'icon-star-empty'), 18)))
            : null,
        ),
      );
    });
    const crates = FRUIT_ROUNDS.map((r, i) => {
      const has = ctx.hasFlag(fruitFlag(r.id));
      return h(
        'div',
        { class: `fruit-crate ${has ? 'got' : ''}`.trim(), title: has ? `${i + 1}판 과일 상자` : '아직 비어 있어요' },
        h('div', { class: 'fruit-crate-pics' }, ...(has ? CRATE_FRUITS[r.id].map((f) => pxImg(fruitSrc(f), 32, FRUITS[f].name)) : [])),
        h('small', {}, `${i + 1}판`),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'fruit-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `과일 상자 ${got} / ${FRUIT_ROUNDS.length}`),
        h('div', { class: 'fruit-crates' }, ...crates),
      ),
    );
    this.talk(got === FRUIT_ROUNDS.length ? FRUIT_SAY.listDone : FRUIT_SAY.list);
  }

  // ── 판 놀이 ──
  private openRound(r: FruitRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.box = [...(r.initial ?? [])];
    this.labels = {};
    this.report = null;
    this.shown = 0;
    this.picked = null;
    this.history = [];
    this.fails = 0;
    this.busy = false;
    this.buttons = [];
    const index = FRUIT_ROUNDS.indexOf(r);
    ctx.setTitle(`과일 AI 가르치기 · ${index + 1}판 ${r.title}`);
    this.say = h('div', { class: 'robi-say' });
    this.basketsEl = h('div', { class: 'fruit-baskets' });
    this.scoreEl = h('div', { class: 'fruit-score' });
    this.whyEl = h('div', { class: 'fruit-why' });
    this.boxTitle = h('h3', { class: 'fruit-title' });
    this.boxEl = h('div', { class: 'fruit-cards fruit-box' });
    this.poolEl = h('div', { class: 'fruit-cards' });
    this.poolWrap = h('div', {}, h('h3', { class: 'fruit-title' }, '예시 카드'), this.poolEl);
    const testBtn = this.button('학습하고 시험 보기', 'primary', () => void this.testNow());
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle fruit-play' },
        h('div', {}, this.say, this.basketsEl, this.scoreEl, this.whyEl),
        h('div', {}, this.boxTitle, this.boxEl, this.poolWrap, h('div', { class: 'row center fruit-actions' }, testBtn, hint)),
      ),
    );
    this.renderBaskets();
    this.renderScore();
    this.renderWhy();
    this.renderCards();
    const start = r.baskets.length > 1 ? FRUIT_SAY.startFarms : r.relabel ? FRUIT_SAY.startRelabel : r.bias ? FRUIT_SAY.startBias : r.initial ? FRUIT_SAY.startGrow : FRUIT_SAY.startPick;
    this.talk(start);
  }

  private button(label: string, kind: string, onclick: () => void): HTMLButtonElement {
    const b = h('button', { class: `btn ${kind}`.trim(), onclick }, label);
    this.buttons.push(b);
    return b;
  }

  private setBusy(on: boolean): void {
    this.busy = on;
    for (const b of this.buttons) b.disabled = on;
    this.boxEl.classList.toggle('locked', on);
    this.poolEl.classList.toggle('locked', on);
  }

  private talk(text: string, mood: '' | 'good' | 'bad' | 'hint' = ''): void {
    this.say.className = `robi-say ${mood}`.trim();
    clear(this.say);
    this.say.append(pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(text)));
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  private currentBox(): BoxCard[] {
    return this.round ? boxOf(this.round, this.box, this.labels) : [];
  }

  /** 지금 보고 있는 시험 과일의 결과 */
  private pickedGuess(): Guess | null {
    if (!this.report || !this.picked) return null;
    const [b, i] = this.picked.split(':').map(Number);
    return this.report.baskets[b]?.guesses[i] ?? null;
  }

  // ── 시험 바구니 ──
  private renderBaskets(): void {
    const r = this.round;
    if (!r) return;
    clear(this.basketsEl);
    let n = 0;
    r.baskets.forEach((b, bi) => {
      const result = this.report?.baskets[bi];
      const tiles = b.fruits.map((f, i) => {
        const g = result && n < this.shown ? result.guesses[i] : null;
        n++;
        return this.tile(f, g, `${bi}:${i}`);
      });
      const done = !!result && n <= this.shown;
      this.basketsEl.append(
        h(
          'section',
          { class: 'fruit-basket' },
          h('div', { class: 'fruit-basket-head' }, h('b', {}, b.name), h('small', {}, done ? `맞힘 ${result.correct} / ${b.fruits.length}` : `처음 보는 과일 ${b.fruits.length}개`)),
          h('div', { class: 'fruit-tiles' }, ...tiles),
        ),
      );
    });
  }

  private tile(fruit: string, g: Guess | null, key: string): HTMLElement {
    const pic = FRUITS[fruit];
    const body = [pxImg(fruitSrc(fruit, true), 48, ''), h('small', {}, pic.name)];
    if (!g) return h('div', { class: 'fruit-tile' }, ...body);
    const state = g.correct ? 'ok' : g.label ? 'no' : 'huh';
    const answer = g.label ? FRUIT_KINDS[g.label] : g.labels.length > 1 ? '헷갈려요' : '몰라요';
    const on = this.picked === key;
    return h(
      'button',
      {
        class: `fruit-tile ${state} ${on ? 'on' : ''}`.trim(),
        'aria-label': `${pic.name}, 로봇의 답 ${answer}, ${g.correct ? '맞았어요' : '틀렸어요'}. 로봇 생각 보기`,
        'aria-pressed': on ? 'true' : 'false',
        onclick: () => {
          this.picked = key;
          this.ctx.sfx('click');
          this.renderBaskets();
          this.renderWhy();
        },
      },
      ...body,
      h('span', { class: 'fruit-answer' }, g.correct ? pxImg(this.ctx.icon('icon-check'), 16, '') : h('b', {}, g.label ? 'X' : '?'), answer),
    );
  }

  // ── 맞힌 수 ──
  private renderScore(): void {
    const r = this.round;
    if (!r) return;
    clear(this.scoreEl);
    const rep = this.report;
    const ready = !!rep && this.shown >= rep.total;
    this.scoreEl.hidden = !ready && !(r.history && this.history.length);
    if (rep && ready) {
      const pct = Math.round((rep.correct / rep.total) * 100);
      this.scoreEl.append(
        h('div', { class: 'fruit-score-head' }, h('b', {}, `맞힌 과일 ${rep.correct} / ${rep.total}`), r.history ? h('small', {}, `정확도(맞힌 비율) ${pct}%`) : null),
        this.bar(pct),
        h('small', { class: 'fruit-score-sub' }, '모습별로 맞힌 수'),
        h(
          'div',
          { class: 'fruit-groups' },
          ...rep.groups.map((g) =>
            h(
              'span',
              { class: `fruit-group ${g.correct === g.total ? 'ok' : g.correct ? 'some' : 'no'}`, 'aria-label': `${FRUITS[g.fruit].name} ${g.total}개 중 ${g.correct}개` },
              pxImg(fruitSrc(g.fruit, true), 32, ''),
              `${g.correct}/${g.total}`,
            ),
          ),
        ),
      );
    }
    if (r.history && this.history.length) {
      this.scoreEl.append(
        h('small', { class: 'fruit-score-sub' }, '시험할 때마다'),
        h('div', { class: 'fruit-history' }, ...this.history.slice(-6).map((pct, i, all) => h('div', { class: 'fruit-history-row' }, h('small', {}, `${this.history.length - all.length + i + 1}번`), this.bar(pct), h('small', {}, `${pct}%`)))),
      );
    }
  }

  private bar(pct: number): HTMLElement {
    return h('div', { class: 'fruit-bar', role: 'img', 'aria-label': `${pct}%` }, h('span', { style: `width:${pct}%` }));
  }

  // ── 로봇 생각 ──
  private renderWhy(note: string = FRUIT_SAY.whyIdle): void {
    clear(this.whyEl);
    const head = h('div', { class: 'fruit-why-head' }, pxImg(this.ctx.icon('icon-fruit'), 32, ''), '로봇 생각');
    const g = this.pickedGuess();
    if (!g) {
      this.whyEl.append(head, h('p', { class: 'muted' }, ...lines(note)));
      return;
    }
    const pic = FRUITS[g.fruit];
    const values = { color: FRUIT_COLORS[pic.color], shape: FRUIT_SHAPES[pic.shape], pattern: FRUIT_PATTERNS[pic.pattern] };
    const box = this.currentBox();
    // 같은 그림·같은 이름표의 예시는 한 줄로 묶어요.
    const rows = new Map<string, { b: BoxCard; n: number }>();
    for (const id of g.nearest) {
      const b = box.find((x) => x.card === id);
      if (!b) continue;
      const key = `${b.fruit}|${b.label}`;
      const row = rows.get(key);
      if (row) row.n++;
      else rows.set(key, { b, n: 1 });
    }
    const items = [...rows.values()].map(({ b, n }) => {
      const same = sameFeatures(FRUITS[b.fruit], pic).map((f) => FRUIT_FEATURES[f]);
      return h(
        'li',
        {},
        pxImg(fruitSrc(b.fruit), 32, ''),
        h('span', { class: 'fruit-why-text' }, h('b', {}, `${FRUITS[b.fruit].name}${n > 1 ? ` ${n}장` : ''}`), h('small', {}, `${same.join('·')}${same.length === FEATURE_IDS.length ? ' 모두' : ''} 같아요`)),
        h('span', { class: 'fruit-tag' }, FRUIT_KINDS[b.label]),
      );
    });
    const answer = g.correct
      ? `로봇의 답: ${FRUIT_KINDS[g.truth]} · 맞았어요!`
      : g.label
        ? `로봇의 답: ${FRUIT_KINDS[g.label]} · 진짜는 ${FRUIT_KINDS[g.truth]}`
        : g.labels.length > 1
          ? `이름표가 갈려서 헷갈렸어요: ${g.labels.map((l) => FRUIT_KINDS[l]).join(' · ')}`
          : '닮은 예시가 없어서 몰라요';
    this.whyEl.append(
      head,
      h(
        'div',
        { class: 'fruit-why-fruit' },
        pxImg(fruitSrc(g.fruit, true), 48, ''),
        h('span', { class: 'fruit-why-text' }, h('b', {}, pic.name), h('small', {}, FEATURE_IDS.map((f) => `${FRUIT_FEATURES[f]} ${values[f]}`).join(' · '))),
      ),
    );
    if (items.length) this.whyEl.append(h('small', { class: 'fruit-score-sub' }, `가장 닮은 예시(같은 점 ${g.best}개)`), h('ul', { class: 'fruit-why-list' }, ...items));
    this.whyEl.append(h('p', { class: `fruit-why-answer ${g.correct ? 'ok' : g.label ? 'no' : 'huh'}` }, answer));
  }

  // ── 학습 상자와 예시 카드 ──
  private renderCards(): void {
    const r = this.round;
    if (!r) return;
    this.boxTitle.textContent = `학습 상자 ${this.box.length} / ${r.boxSize}`;
    clear(this.boxEl);
    for (const id of this.box) {
      const c = r.pool.find((p) => p.id === id);
      if (!c) continue;
      const pic = FRUITS[c.fruit];
      const name = FRUIT_KINDS[this.labels[id] ?? c.label];
      this.boxEl.append(
        h(
          'div',
          { class: 'fruit-card in' },
          h(
            'button',
            { class: 'fruit-card-pic', 'aria-label': `${pic.name} 카드를 상자에서 빼기`, onclick: () => this.remove(id) },
            pxImg(fruitSrc(c.fruit), 48, ''),
            h('small', {}, pic.name),
            h('span', { class: 'fruit-out', 'aria-hidden': 'true' }, '빼기'),
          ),
          r.relabel
            ? h('button', { class: 'fruit-tag edit', 'aria-label': `${pic.name} 카드의 이름표 ${name}, 눌러서 바꾸기`, onclick: () => this.relabel(id) }, name)
            : h('span', { class: 'fruit-tag' }, name),
        ),
      );
    }
    for (let i = this.box.length; i < r.boxSize; i++) this.boxEl.append(h('div', { class: 'fruit-slot', 'aria-hidden': 'true' }));
    clear(this.poolEl);
    const rest = r.pool.filter((c) => !this.box.includes(c.id));
    this.poolWrap.hidden = rest.length === 0;
    for (const c of rest) {
      const pic = FRUITS[c.fruit];
      const name = FRUIT_KINDS[c.label];
      this.poolEl.append(
        h(
          'button',
          { class: 'fruit-card', 'aria-label': `${pic.name} 카드, 이름표 ${name}. 상자에 넣기`, onclick: () => this.add(c.id) },
          pxImg(fruitSrc(c.fruit), 48, ''),
          h('small', {}, pic.name),
          h('span', { class: 'fruit-tag' }, name),
        ),
      );
    }
  }

  private add(id: string): void {
    const r = this.round;
    if (!r || this.busy) return;
    if (this.box.length >= r.boxSize) {
      this.ctx.sfx('fail');
      this.talk(FRUIT_SAY.boxFull, 'hint');
      return;
    }
    this.box.push(id);
    this.changed();
  }

  private remove(id: string): void {
    if (this.busy) return;
    this.box = this.box.filter((x) => x !== id);
    this.changed();
  }

  /** 이름표를 다음 이름표로 바꿔요 */
  private relabel(id: string): void {
    const r = this.round;
    const c = r?.pool.find((p) => p.id === id);
    if (!r || !c || this.busy) return;
    const now = r.labels.indexOf(this.labels[id] ?? c.label);
    this.labels[id] = r.labels[(now + 1) % r.labels.length];
    this.changed();
  }

  /** 상자가 바뀌면 지난 시험 결과는 지워요(시험 기록 막대는 남겨요) */
  private changed(): void {
    const had = !!this.report;
    this.report = null;
    this.shown = 0;
    this.picked = null;
    this.ctx.sfx('click');
    this.renderCards();
    this.renderBaskets();
    this.renderScore();
    this.renderWhy(had ? FRUIT_SAY.changed : FRUIT_SAY.whyIdle);
  }

  // ── 학습하고 시험 보기 ──
  private async testNow(): Promise<void> {
    const r = this.round;
    if (!r || this.busy) return;
    const box = this.currentBox();
    if (!box.length) {
      this.ctx.sfx('fail');
      this.talk(FRUIT_SAY.boxEmpty, 'bad');
      return;
    }
    const report = runTest(r, box);
    this.setBusy(true);
    this.report = report;
    this.shown = 0;
    this.picked = null;
    this.renderBaskets();
    this.renderScore();
    this.renderWhy(FRUIT_SAY.thinking);
    this.whyEl.classList.add('thinking');
    this.talk(FRUIT_SAY.thinking);
    this.ctx.sfx('step');
    // 좁은 화면(한 줄 배치)에서는 시험 단추가 아래, 바구니가 위라서 결과 쪽으로 올려 보여 줘요.
    const calm = calmMotion();
    if (typeof window !== 'undefined' && window.innerWidth <= 720 && this.say.getBoundingClientRect().top < 0) {
      this.say.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
    }
    // 로봇이 과일을 하나씩 살펴봐요.
    if (calm) this.shown = report.total;
    else
      for (let i = 1; i <= report.total; i++) {
        await sleep(110);
        if (!this.alive) return;
        this.shown = i;
        this.renderBaskets();
      }
    this.whyEl.classList.remove('thinking');
    this.history.push(Math.round((report.correct / report.total) * 100));
    this.picked = this.firstMiss(report);
    this.renderBaskets();
    this.renderScore();
    this.renderWhy();
    if (!report.success) {
      this.fails++;
      this.ctx.sfx('fail');
      this.talk(this.failText(r, report, box), 'bad');
      this.setBusy(false);
      if (this.fails === 2) this.showHint();
      return;
    }
    const stars = fruitStars(report);
    // 성공은 바로 저장하고, 아래 기다림은 결과를 보여 주는 연출에만 써요.
    const allAfter = FRUIT_ROUNDS.every((x) => x.id === r.id || this.ctx.hasFlag(fruitFlag(x.id)));
    const result = this.ctx.clear(r.id, stars, { flags: [fruitFlag(r.id)], ...(allAfter ? { title: FRUIT_TITLE } : {}) });
    this.ctx.sfx('success');
    this.talk(FRUIT_SAY.success, 'good');
    await sleep(1200);
    if (!this.alive) return;
    this.showResult(r, stars, result);
  }

  /** 처음 볼 시험 과일: 틀린 것이 있으면 그 과일, 없으면 맨 앞 과일 */
  private firstMiss(report: TestReport): string {
    for (let b = 0; b < report.baskets.length; b++) {
      const i = report.baskets[b].guesses.findIndex((g) => !g.correct);
      if (i >= 0) return `${b}:${i}`;
    }
    return '0:0';
  }

  private failText(r: FruitRound, report: TestReport, box: BoxCard[]): string {
    if (r.relabel && report.wrongLabels.length) return FRUIT_SAY.failLabel;
    const all = report.baskets.flatMap((b) => b.guesses);
    const miss = all.filter((g) => !g.correct);
    if (miss.some((g) => !box.some((b) => b.label === g.truth))) return FRUIT_SAY.failMissing;
    if (r.bias) {
      if (report.baskets.length > 1 && report.baskets.some((b) => b.correct === b.guesses.length)) return FRUIT_SAY.failFarm;
      if (report.baskets.length === 1 && report.groups.some((g) => g.correct === g.total) && report.groups.some((g) => g.correct === 0)) return FRUIT_SAY.failBias;
    }
    return miss.some((g) => g.labels.length > 1) ? FRUIT_SAY.failConfused : FRUIT_SAY.failWrong;
  }

  // ── 결과 ──
  private showResult(r: FruitRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    clear(ctx.root);
    const index = FRUIT_ROUNDS.indexOf(r);
    const next = FRUIT_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, '학습 성공!'),
        h('div', { class: 'fruit-result' }, ...CRATE_FRUITS[r.id].map((f) => pxImg(fruitSrc(f), 64, FRUITS[f].name))),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        h('p', {}, ...lines(r.lesson)),
        stars < 3 ? h('p', {}, ...lines(FRUIT_SAY.leftLabel)) : null,
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines(FRUIT_SAY.first)) : null,
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
