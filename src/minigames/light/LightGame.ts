import { LIGHT_ROUNDS, LIGHT_TITLE, lightFlag, lightTier } from '../../data/minigames/light';
import type { LightRound } from '../../data/schema';
import { starsFor } from '../../missions/blockCode/BlockCodeMission';
import { countBlocks, hasIf } from '../../missions/core/interpreter';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { runLight, type LightFrame, type LightOutcome } from './lightEnv';

interface Step {
  picture: number;
  frame: LightFrame;
}

/** 걸음 수가 많을수록 빨리 보여 줘요(6판은 그림 세 장 × 약 45걸음). */
const stepMs = (total: number): number => (total <= 24 ? 260 : total <= 60 ? 150 : 70);

/**
 * 코딩 불빛 그림: 판 고르기 → 전구판 + 블록 편집기 → 결과.
 * 불빛 붓은 학생 프로그램대로만 움직이고(LightEnv), 같은 프로그램은 늘 같은 결과예요.
 */
export class LightGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: LightRound | null = null;
  private editor: ProgramEditor | null = null;
  private say!: HTMLElement;
  private brush!: HTMLElement;
  private pictureLabel!: HTMLElement;
  /** 전구 칸(줄마다): 그림, 숫자 판 */
  private bulbs: { cell: HTMLElement; img: HTMLImageElement; code: HTMLElement }[][] = [];
  private cols = 1;
  private rows = 1;
  private buttons: HTMLButtonElement[] = [];
  private fails = 0;
  private busy = false;
  /** 지금 보여 주는 그림 */
  private picture = 0;
  /** 한 단계씩 실행할 때의 기록 */
  private trace: { steps: Step[]; outcome: LightOutcome; failedPicture: number; at: number } | null = null;

  mount(ctx: MinigameContext): void {
    this.ctx = ctx;
    this.showList();
  }

  unmount(): void {
    this.alive = false;
  }

  /** 숫자 그림을 작은 전구 격자로 보여 줘요(판 고르기 액자, 결과). on이면 1인 칸이 켜져요. */
  private mini(picture: readonly string[], on: boolean, label: string): HTMLElement {
    const w = picture[0]?.length ?? 1;
    return h(
      'div',
      { class: `light-mini ${on ? 'on' : ''}`.trim(), style: `grid-template-columns: repeat(${w}, 1fr)`, role: 'img', 'aria-label': label },
      ...picture.flatMap((row) => [...row].map((c) => h('span', { class: c === '1' ? 'one' : '' }))),
    );
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
    ctx.setTitle('코딩 불빛 그림');
    const best = ctx.best();
    const got = LIGHT_ROUNDS.filter((r) => ctx.hasFlag(lightFlag(r.id))).length;
    const cards = LIGHT_ROUNDS.map((r, i) => {
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
        pxImg(ctx.icon(open ? 'icon-bulb-on' : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? lightTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open
            ? h('span', { class: 'mini-stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((k) => pxImg(ctx.icon(k < stars ? 'icon-star' : 'icon-star-empty'), 18)))
            : null,
        ),
      );
    });
    const frames = LIGHT_ROUNDS.map((r, i) => {
      const has = ctx.hasFlag(lightFlag(r.id));
      return h(
        'figure',
        { class: `light-frame ${has ? 'got' : ''}`.trim(), title: has ? `${i + 1}판 불빛 그림` : '아직 켜지 않았어요' },
        this.mini(r.pictures[0], has, has ? `${i + 1}판 불빛 그림` : '빈 액자'),
        h('figcaption', {}, `${i + 1}판`),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'light-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `불빛 그림 ${got} / ${LIGHT_ROUNDS.length}`),
        h('div', { class: 'light-gallery' }, ...frames),
      ),
    );
    this.talk(got === LIGHT_ROUNDS.length ? '그림을 모두 켰어요!\n별을 더 받으러 다시 해도 좋아요.' : '숫자가 1인 전구만 켜요.\n붓은 프로그램대로만 움직여요.');
  }

  // ── 판 놀이 ──
  private openRound(r: LightRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.buttons = [];
    this.fails = 0;
    this.trace = null;
    this.busy = false;
    const index = LIGHT_ROUNDS.indexOf(r);
    ctx.setTitle(`코딩 불빛 그림 · ${index + 1}판 ${r.title}`);
    const editor = new ProgramEditor({ palette: r.palette, allowRepeat: r.allowRepeat, allowIf: r.allowIf, maxBlocks: r.maxBlocks, optimal: r.optimal });
    editor.onChange(() => {
      this.trace = null;
      this.showPicture(0);
    });
    this.editor = editor;
    this.say = h('div', { class: 'robi-say' });
    const machine = this.buildMachine(r);
    const runBtn = this.button('▶ 실행', 'primary', () => void this.runAll());
    const step = this.button('한 단계씩', 'blue', () => void this.stepOnce());
    const reset = this.button('처음으로', '', () => {
      this.trace = null;
      this.showPicture(0);
    });
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    const legend = h(
      'div',
      { class: 'game-order light-order' },
      h('small', {}, '숫자 판'),
      h('div', { class: 'light-rule' }, pxImg(ctx.icon('icon-bulb-on'), 28, '켜진 전구'), '1 → 켜요'),
      h('div', { class: 'light-rule' }, pxImg(ctx.icon('icon-bulb-off'), 28, '꺼진 전구'), '0 → 꺼 둬요'),
    );
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle light-play' },
        h('div', {}, machine, h('div', { class: 'row center', style: 'margin-top:10px' }, runBtn, step, reset, hint)),
        h('div', {}, legend, this.say, h('div', { style: 'height:10px' }), editor.el),
      ),
    );
    this.showPicture(0);
    this.talk(r.pictures.length > 1 ? '숫자 그림 세 장을 차례로 켜요.\n같은 프로그램으로 모두 맞혀요!' : '블록을 놓고 ▶ 실행을 눌러요.\n붓은 왼쪽 위에서 출발해요.');
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

  /**
   * 전구판: 전구마다 숫자 판이 붙어 있고, 오른쪽 끝 한 칸은 줄 끝이에요.
   * 다음 줄 블록이 있는 판은 맨 아래 한 줄(판 아래, 다 그린 뒤 붓이 서는 곳)도 보여요.
   */
  private buildMachine(r: LightRound): HTMLElement {
    const w = r.pictures[0][0].length;
    const hgt = r.pictures[0].length;
    this.cols = w + 1;
    this.rows = hgt + (r.palette.includes('nextRow') ? 1 : 0);
    const board = h('div', { class: 'light-board', style: `grid-template-columns: repeat(${this.cols}, 1fr)`, 'aria-label': '전구판' });
    this.bulbs = [];
    for (let y = 0; y < this.rows; y++) {
      const row: { cell: HTMLElement; img: HTMLImageElement; code: HTMLElement }[] = [];
      for (let x = 0; x < this.cols; x++) {
        if (x === w || y === hgt) {
          board.append(h('div', { class: 'light-cell margin' }));
          continue;
        }
        const img = pxImg(this.ctx.icon('icon-bulb-off'), 32, '', 'light-bulb');
        const code = h('span', { class: 'light-code' });
        const cell = h('div', { class: 'light-cell' }, img, code);
        board.append(cell);
        row.push({ cell, img, code });
      }
      if (row.length) this.bulbs.push(row);
    }
    this.brush = h('div', { class: 'light-brush' }, pxImg(this.ctx.icon('icon-light-brush'), 32, '불빛 붓'));
    board.append(this.brush);
    this.pictureLabel = h('div', { class: 'light-picture-label', 'aria-live': 'polite' });
    return h(
      'div',
      { class: 'light-machine' },
      h('div', { class: 'light-sign' }, '코딩 불빛 그림'),
      r.pictures.length > 1 ? this.pictureLabel : null,
      board,
    );
  }

  private place(el: HTMLElement, x: number, y: number): void {
    // 판 안쪽 여백(8px)을 빼고 칸 비율로 놓아요.
    el.style.left = `calc(8px + (100% - 16px) * ${x / this.cols})`;
    el.style.top = `calc(8px + (100% - 16px) * ${y / this.rows})`;
    el.style.width = `calc((100% - 16px) / ${this.cols})`;
    el.style.height = `calc((100% - 16px) / ${this.rows})`;
  }

  /** 그림을 처음 모습으로 놓아요(전구 끄기, 숫자 판 바꾸기, 붓은 왼쪽 위). */
  private showPicture(index: number): void {
    const r = this.round;
    if (!r) return;
    this.picture = index;
    const picture = r.pictures[index] ?? r.pictures[0];
    this.bulbs.forEach((row, y) =>
      row.forEach((b, x) => {
        const c = picture[y]?.[x] ?? '0';
        b.code.textContent = c;
        b.cell.classList.toggle('one', c === '1');
        b.cell.classList.remove('on', 'wrong', 'bump');
        b.img.src = this.ctx.icon('icon-bulb-off');
      }),
    );
    this.brush.classList.remove('wrong', 'bump');
    this.place(this.brush, 0, 0);
    this.pictureLabel.textContent = `숫자 그림 ${index + 1} / ${r.pictures.length}`;
    this.editor?.highlight(null);
  }

  private shake(el: HTMLElement): void {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  /** 한 걸음 보여 주기 */
  private async play(f: LightFrame, ms: number): Promise<void> {
    const stop = f.event === 'wrongLight' || f.event === 'noBulb' || f.event === 'offBoard';
    this.editor?.highlight(f.path, stop ? 'err' : 'run');
    this.brush.style.transitionDuration = `${Math.min(ms, 220)}ms`;
    const bulb = this.bulbs[f.y]?.[f.x];
    switch (f.event) {
      case 'move':
      case 'nextRow':
        this.place(this.brush, f.x, f.y);
        break;
      case 'light':
        if (bulb) {
          bulb.img.src = this.ctx.icon('icon-bulb-on');
          bulb.cell.classList.add('on');
        }
        this.ctx.sfx('step');
        break;
      case 'wrongLight':
        if (bulb) {
          bulb.img.src = this.ctx.icon('icon-bulb-on');
          bulb.cell.classList.add('on', 'wrong');
          this.shake(bulb.cell);
        }
        this.ctx.sfx('fail');
        break;
      case 'noBulb':
      case 'offBoard':
        this.brush.classList.add('wrong');
        if (f.event === 'offBoard') this.place(this.brush, f.x + (f.toward === 'right' ? 0.3 : 0), f.y + (f.toward === 'down' ? 0.3 : 0));
        this.shake(this.brush);
        this.ctx.sfx('fail');
        break;
      default:
        break;
    }
    await sleep(stop ? Math.max(ms, 320) : ms);
  }

  private compute(): { steps: Step[]; outcome: LightOutcome; failedPicture: number } {
    const r = this.round!;
    const res = runLight(r, this.editor?.value ?? []);
    const last = res.failedPicture < 0 ? res.pictures.length - 1 : res.failedPicture;
    const steps: Step[] = [];
    for (let p = 0; p <= last; p++) for (const frame of res.pictures[p].frames) steps.push({ picture: p, frame });
    return { steps, outcome: res.outcome, failedPicture: res.failedPicture };
  }

  private async runAll(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    this.setBusy(true);
    this.trace = null;
    this.showPicture(0);
    const { steps, outcome, failedPicture } = this.compute();
    const ms = stepMs(steps.length);
    for (const s of steps) {
      if (!this.alive) return;
      if (s.picture !== this.picture) {
        // 다음 그림: 잠깐 켜진 그림을 보여 준 뒤 새 숫자 판으로 바꿔요.
        await sleep(600);
        if (!this.alive) return;
        this.showPicture(s.picture);
        this.talk(`${s.picture + 1}번째 숫자 그림이에요.\n같은 프로그램으로 켜요.`);
        await sleep(350);
        if (!this.alive) return;
      }
      await this.play(s.frame, ms);
    }
    if (!this.alive) return;
    this.setBusy(false);
    await this.finishRun(outcome, failedPicture, steps);
  }

  private async stepOnce(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    if (!this.trace) {
      this.showPicture(0);
      this.trace = { ...this.compute(), at: 0 };
    }
    const t = this.trace;
    if (t.at < t.steps.length) {
      const s = t.steps[t.at];
      t.at++;
      this.setBusy(true);
      if (s.picture !== this.picture) this.showPicture(s.picture);
      await this.play(s.frame, 220);
      if (!this.alive) return;
      this.setBusy(false);
      this.talk(`${t.at}번째 걸음이에요. 계속 눌러 봐요.`);
    }
    if (t.at >= t.steps.length) {
      this.trace = null;
      await this.finishRun(t.outcome, t.failedPicture, t.steps);
    }
  }

  private failText(r: LightRound, outcome: LightOutcome, failedPicture: number, steps: Step[]): string {
    const multi = r.pictures.length > 1;
    // 첫 그림은 맞았는데 다른 그림에서 틀렸고 만약이 없으면: 순서만 외운 프로그램이에요.
    if (multi && failedPicture > 0 && !hasIf(this.editor?.value ?? [])) return '첫 그림에만 맞는 순서예요.\n만약 블록으로 숫자를 읽어요.';
    const at = multi ? `${failedPicture + 1}번째 그림` : '';
    const last = [...steps].reverse().find((s) => s.picture === failedPicture)?.frame;
    switch (outcome) {
      case 'wrongLight':
        return multi ? `${at}에서\n0인 전구를 켰어요.` : '0인 전구를 켰어요.\n숫자 판을 다시 봐요.';
      case 'noBulb':
        return '전구가 없는 곳에서 켰어요.\n앞으로 횟수를 세어 봐요.';
      case 'offBoard':
        return last?.toward === 'down' ? '더 내려갈 줄이 없어요.\n다음 줄 횟수를 세어 봐요.' : '붓이 판 밖으로 나가요.\n앞으로 횟수를 세어 봐요.';
      case 'missing':
        return multi ? `${at}에\n켜지 않은 1이 남았어요.` : '아직 켜지 않은 1이 있어요.\n숫자 판을 다시 봐요.';
      default:
        return '프로그램이 너무 오래 돌아요.\n반복 횟수를 확인해 봐요.';
    }
  }

  private async finishRun(outcome: LightOutcome, failedPicture: number, steps: Step[]): Promise<void> {
    const r = this.round;
    const editor = this.editor;
    if (!this.alive || !r || !editor) return;
    if (outcome === 'success') {
      const stars = starsFor(countBlocks(editor.value), r.optimal);
      // 성공은 바로 저장하고, 아래 기다림은 결과 화면을 보여 주는 연출에만 써요.
      const allAfter = LIGHT_ROUNDS.every((x) => x.id === r.id || this.ctx.hasFlag(lightFlag(x.id)));
      const result = this.ctx.clear(r.id, stars, { flags: [lightFlag(r.id)], ...(allAfter ? { title: LIGHT_TITLE } : {}) });
      editor.highlight(null);
      this.ctx.sfx('success');
      this.talk(stars === 3 ? '그림이 켜졌어요!\n가장 짧은 프로그램이에요!' : '그림이 켜졌어요!\n블록을 더 줄일 수 있을까요?', 'good');
      this.setBusy(true);
      await sleep(900);
      if (!this.alive) return;
      this.showResult(r, stars, result);
      return;
    }
    this.fails++;
    this.talk(this.failText(r, outcome, failedPicture, steps), 'bad');
    if (this.ctx.helpers.debugGlasses) {
      // 디버그 안경: 0인 전구를 켠 블록, 전구 없는 곳에서 켠 블록, 판 밖으로 나간 블록을 짚어 줘요.
      const wrong = steps.find((s) => s.picture === failedPicture && (s.frame.event === 'wrongLight' || s.frame.event === 'noBulb' || s.frame.event === 'offBoard'));
      if (wrong) editor.highlight(wrong.frame.path, 'err');
      else editor.pointAtEnd();
    }
    if (this.fails === 2) this.showHint();
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  // ── 결과 ──
  private showResult(r: LightRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    this.editor = null;
    clear(ctx.root);
    const index = LIGHT_ROUNDS.indexOf(r);
    const next = LIGHT_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    const multi = r.pictures.length > 1;
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, '그림 완성!'),
        h('div', { class: 'light-result' }, ...r.pictures.map((p, i) => this.mini(p, true, multi ? `켜진 그림 ${i + 1}` : '켜진 그림'))),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        multi ? h('p', {}, ...lines('숫자만 바꾸면 그림이 바뀌어요.\n컴퓨터 화면도 이렇게 그려요.')) : null,
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines('처음 켠 그림이에요.\n가게 벽 액자에 불이 켜졌어요.')) : null,
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
