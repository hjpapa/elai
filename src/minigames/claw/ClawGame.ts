import { CLAW_ROUNDS, CLAW_TITLE, DOLLS, DOLL_BY_ID, clawTier, dollFlag } from '../../data/minigames/claw';
import type { ClawRound, Dir } from '../../data/schema';
import { starsFor } from '../../missions/blockCode/BlockCodeMission';
import { countBlocks, run } from '../../missions/core/interpreter';
import { clear, h, josa, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { ClawEnv, type ClawFrame, type ClawOutcome } from './clawEnv';

const ROTATE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 };
const STEP_MS = 300;
/** 집게가 내려가고 올라오는 시간(CSS .claw-arm transition과 같아요) */
const LIFT_MS = 360;
/** 인형을 들고 출구로 돌아가는 시간(CSS .claw.carry와 같아요) */
const CARRY_MS = 650;

const FAIL_TEXT: Record<Exclude<ClawOutcome, 'success'>, string> = {
  bump: '쿵! 집게가 상자나 벽에 부딪혔어요.\n어느 블록에서 막혔을까요?',
  empty: '빈 곳을 집었어요.\n인형 바로 위에서 집어요.',
  wrongDoll: '주문한 인형이 아니에요.\n주문 카드를 다시 봐요.',
  noGrab: '집게가 아직 집지 않았어요.\n인형 위에서 집기 블록을 놓아요.',
  tooLong: '프로그램이 너무 오래 돌아요.\n반복 횟수를 확인해 봐요.',
};

/**
 * 코딩 인형뽑기: 판 고르기 → 기계 판 + 블록 편집기 → 결과.
 * 집게는 학생 프로그램대로만 움직이고(ClawEnv), 같은 프로그램은 늘 같은 결과예요.
 */
export class ClawGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: ClawRound | null = null;
  private editor: ProgramEditor | null = null;
  private cells: HTMLElement[] = [];
  private claw!: HTMLElement;
  private clawFloor!: HTMLElement;
  private clawArm!: HTMLElement;
  private clawHead!: HTMLImageElement;
  private clawHeld!: HTMLImageElement;
  private tray!: HTMLElement;
  private say!: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private fails = 0;
  private busy = false;
  /** 한 단계씩 실행할 때의 기록 */
  private trace: { frames: ClawFrame[]; outcome: ClawOutcome; at: number } | null = null;
  /** 바닥 고리 화살표의 회전 각도(누적). 돌기가 가까운 쪽으로 돌아 보이게 해요. */
  private angle = 0;

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
    ctx.setTitle('코딩 인형뽑기');
    const best = ctx.best();
    const got = DOLLS.filter((d) => ctx.hasFlag(dollFlag(d.id))).length;
    const cards = CLAW_ROUNDS.map((r, i) => {
      const open = ctx.unlocked(r.unlock);
      const stars = best[r.id] ?? 0;
      const doll = DOLL_BY_ID.get(r.target);
      return h(
        'button',
        {
          class: `game-card ${open ? '' : 'locked'} ${stars ? 'done' : ''}`.trim(),
          disabled: !open,
          onclick: () => this.openRound(r),
          'aria-label': open ? `${i + 1}판 ${r.title}, ${doll?.name ?? ''} 뽑기` : `${i + 1}판 ${r.title}, 닫혀 있어요`,
        },
        pxImg(ctx.icon(open ? (doll?.sprite ?? 'icon-gem') : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? clawTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open ? this.miniStars(stars) : null,
        ),
      );
    });
    const shelf = DOLLS.map((d) => {
      const has = ctx.hasFlag(dollFlag(d.id));
      return h(
        'figure',
        { class: `doll ${has ? 'got' : ''}`.trim(), title: has ? d.desc.replace('\n', ' ') : '아직 뽑지 않았어요' },
        pxImg(ctx.icon(d.sprite), 48, has ? d.name : '빈 자리'),
        // 진열장은 '내 인형'이라서 이름 끝의 '인형'을 빼요(좁은 칸에서 두 줄로 갈라지지 않게).
        h('figcaption', {}, has ? d.name.replace(/ 인형$/, '') : '?'),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'claw-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `내 인형 ${got} / ${DOLLS.length}`),
        h('div', { class: 'doll-shelf' }, ...shelf),
      ),
    );
    this.talk(got === DOLLS.length ? '인형을 모두 모았어요!\n별을 더 받으러 다시 해도 좋아요.' : '집게는 프로그램대로만 움직여요.\n동전 없이 주문한 인형을 뽑아요!');
  }

  private miniStars(stars: number): HTMLElement {
    return h(
      'span',
      { class: 'mini-stars', 'aria-label': `별 ${stars}개` },
      ...[0, 1, 2].map((i) => pxImg(this.ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 18)),
    );
  }

  // ── 판 놀이 ──
  private openRound(r: ClawRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.buttons = [];
    this.fails = 0;
    this.trace = null;
    this.busy = false;
    const index = CLAW_ROUNDS.indexOf(r);
    ctx.setTitle(`코딩 인형뽑기 · ${index + 1}판 ${r.title}`);
    const doll = DOLL_BY_ID.get(r.target);
    const editor = new ProgramEditor({ palette: r.palette, allowRepeat: r.allowRepeat, maxBlocks: r.maxBlocks, optimal: r.optimal });
    editor.onChange(() => {
      this.trace = null;
      this.resetBoard();
    });
    this.editor = editor;
    this.say = h('div', { class: 'robi-say' });
    const machine = this.buildMachine(r);
    const runBtn = this.button('▶ 실행', 'primary', () => void this.runAll());
    const step = this.button('한 단계씩', 'blue', () => void this.stepOnce());
    const reset = this.button('처음으로', '', () => {
      this.trace = null;
      this.resetBoard();
    });
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle claw-play' },
        h('div', {}, machine, h('div', { class: 'row center', style: 'margin-top:10px' }, runBtn, step, reset, hint)),
        h(
          'div',
          {},
          h(
            'div',
            { class: 'game-order' },
            pxImg(ctx.icon(doll?.sprite ?? 'icon-gem'), 48, doll?.name ?? ''),
            h('div', {}, h('small', {}, '주문 카드'), h('b', {}, `${josa(doll?.name ?? '인형', '을', '를')} 뽑아 주세요`)),
          ),
          this.say,
          h('div', { style: 'height:10px' }),
          editor.el,
        ),
      ),
    );
    this.talk('블록을 놓고 ▶ 실행을 눌러요.\n점선 고리 칸이 주문한 인형이에요.');
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

  private dollImg(id: string): HTMLImageElement {
    const d = DOLL_BY_ID.get(id);
    const img = pxImg(this.ctx.icon(d?.sprite ?? 'icon-gem'), 32, d?.name ?? '인형', 'stand doll');
    img.dataset.doll = id;
    return img;
  }

  /** 인형뽑기 기계: 비스듬히 기울인 바닥 판(퍼즐 판과 같은 모양) + 집게 + 나온 인형 칸 */
  private buildMachine(r: ClawRound): HTMLElement {
    const env = new ClawEnv(r);
    const board = h('div', { class: 'board tilt claw-board', style: `grid-template-columns: repeat(${env.width}, 1fr)` });
    this.cells = [];
    r.grid.forEach((row, y) =>
      [...row].forEach((c, x) => {
        const cell = h('div', { class: `cell ${(x + y) % 2 ? 'alt' : ''}`.trim() });
        if (c === 'E') cell.append(pxImg(this.ctx.icon('icon-claw-exit'), 32, '출구', 'claw-exit'));
        if (c === '#') cell.append(pxImg(this.ctx.icon('block-crate'), 32, '큰 상자', 'stand crate'));
        const doll = env.dollAt(x, y);
        if (doll) {
          if (doll === r.target) cell.classList.add('target');
          cell.append(this.dollImg(doll));
        }
        this.cells.push(cell);
        board.append(cell);
      }),
    );
    this.clawFloor = h('i', { class: 'robot-floor claw-floor' });
    this.clawHead = pxImg(this.ctx.icon('prop-claw', 0), 32, '집게', 'claw-head');
    this.clawHeld = pxImg('', 32, '', 'claw-held');
    this.clawHeld.hidden = true;
    // 집은 인형은 집게 뒤에 매달려요(손가락이 인형을 감싸 보이게).
    this.clawArm = h('div', { class: 'claw-arm' }, h('i', { class: 'claw-rope' }), h('div', { class: 'claw-grip' }, this.clawHeld, this.clawHead));
    this.claw = h('div', { class: 'claw' }, this.clawFloor, this.clawArm);
    board.append(this.claw);
    this.tray = h('div', { class: 'claw-tray', 'aria-live': 'polite' }, h('span', {}, '나온 인형'));
    this.angle = ROTATE[r.startDir ?? 'up'];
    this.placeClaw(env.exit.x, env.exit.y, r.startDir ?? 'up');
    return h('div', { class: 'claw-machine' }, h('div', { class: 'claw-sign' }, '코딩 인형뽑기'), h('div', { class: 'board-stage' }, board), this.tray);
  }

  private placeClaw(x: number, y: number, dir: Dir): void {
    const r = this.round;
    if (!r) return;
    const w = r.grid[0].length;
    const hgt = r.grid.length;
    // 판 안쪽 여백(6px)을 빼고 칸 비율로 놓아요(퍼즐 판의 로비와 같아요).
    this.claw.style.left = `calc(6px + (100% - 12px) * ${x / w})`;
    this.claw.style.top = `calc(6px + (100% - 12px) * ${y / hgt})`;
    this.claw.style.width = `calc((100% - 12px) / ${w})`;
    this.claw.style.height = `calc((100% - 12px) / ${hgt})`;
    const delta = ((((ROTATE[dir] - this.angle) % 360) + 540) % 360) - 180;
    this.angle += delta;
    // 판 위로 살짝 띄워야 출구 그림에 가려지지 않아요(같은 평면이면 그림이 위에 그려져요).
    this.clawFloor.style.transform = `translateZ(1px) rotate(${this.angle}deg)`;
    this.claw.dataset.dir = dir;
    this.claw.setAttribute('aria-label', `집게(왼쪽에서 ${x + 1}번째, 안쪽에서 ${y + 1}번째 칸)`);
  }

  private resetBoard(): void {
    const r = this.round;
    if (!r) return;
    const env = new ClawEnv(r);
    this.claw.classList.remove('carry', 'bump');
    this.clawArm.classList.remove('down');
    this.clawHead.src = this.ctx.icon('prop-claw', 0);
    this.clawHeld.hidden = true;
    this.placeClaw(env.exit.x, env.exit.y, r.startDir ?? 'up');
    // 집어 간 인형은 제자리로 돌아와요.
    r.grid.forEach((row, y) =>
      [...row].forEach((_, x) => {
        const doll = env.dollAt(x, y);
        const cell = this.cells[y * env.width + x];
        if (doll && cell && !cell.querySelector('img.doll')) cell.append(this.dollImg(doll));
      }),
    );
    for (const prize of this.tray.querySelectorAll('img')) prize.remove();
    this.editor?.highlight(null);
  }

  private compute(): { frames: ClawFrame[]; outcome: ClawOutcome } {
    const env = new ClawEnv(this.round!);
    const res = run(this.editor?.value ?? [], env);
    return { frames: env.frames, outcome: env.outcome(res.truncated) };
  }

  private showFrame(f: ClawFrame): void {
    this.editor?.highlight(f.path, f.event === 'bump' ? 'err' : 'run');
    this.placeClaw(f.x, f.y, f.dir);
    if (f.event === 'bump') {
      this.claw.classList.remove('bump');
      void this.claw.offsetWidth;
      this.claw.classList.add('bump');
      this.ctx.sfx('fail');
    } else if (f.event !== 'grab') this.ctx.sfx('step');
  }

  /** 집기: 내려가서 오므리고 올라와요. 주문한 인형이면 출구로 가져가 떨어뜨리고, 다른 인형이면 제자리에 내려놓아요. */
  private async animateGrab(f: ClawFrame, outcome: ClawOutcome): Promise<void> {
    const r = this.round!;
    const w = r.grid[0].length;
    const cell = this.cells[f.y * w + f.x];
    const open = this.ctx.icon('prop-claw', 0);
    this.clawArm.classList.add('down');
    this.ctx.sfx('click');
    await sleep(LIFT_MS);
    this.clawHead.src = this.ctx.icon('prop-claw', 1);
    const dollImg = f.doll ? cell?.querySelector<HTMLImageElement>('img.doll') : null;
    if (dollImg) {
      this.clawHeld.src = dollImg.src;
      this.clawHeld.alt = dollImg.alt;
      this.clawHeld.hidden = false;
      dollImg.remove();
    }
    await sleep(180);
    this.clawArm.classList.remove('down');
    await sleep(LIFT_MS);
    if (!this.alive) return;
    if (!f.doll) {
      this.clawHead.src = open;
      return;
    }
    if (outcome === 'wrongDoll') {
      // 고개를 젓고 제자리에 내려놓아요.
      this.claw.classList.remove('bump');
      void this.claw.offsetWidth;
      this.claw.classList.add('bump');
      this.ctx.sfx('fail');
      await sleep(320);
      this.clawArm.classList.add('down');
      await sleep(LIFT_MS);
      this.clawHeld.hidden = true;
      cell?.append(this.dollImg(f.doll));
      this.clawHead.src = open;
      this.clawArm.classList.remove('down');
      await sleep(LIFT_MS);
      return;
    }
    // 출구로 돌아가 떨어뜨려요.
    const exit = new ClawEnv(r).exit;
    this.claw.classList.add('carry');
    this.placeClaw(exit.x, exit.y, f.dir);
    await sleep(CARRY_MS);
    this.claw.classList.remove('carry');
    this.clawHead.src = open;
    this.clawHeld.hidden = true;
    const d = DOLL_BY_ID.get(f.doll);
    this.tray.append(pxImg(this.ctx.icon(d?.sprite ?? 'icon-gem'), 40, d?.name ?? '인형', 'claw-prize'));
    this.ctx.sfx('item');
    await sleep(420);
  }

  private async play(f: ClawFrame, outcome: ClawOutcome): Promise<void> {
    this.showFrame(f);
    if (f.event === 'grab') await this.animateGrab(f, outcome);
    else await sleep(STEP_MS);
  }

  private async runAll(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    this.setBusy(true);
    this.trace = null;
    this.resetBoard();
    const { frames, outcome } = this.compute();
    for (const f of frames) {
      if (!this.alive) return;
      await this.play(f, outcome);
    }
    if (!this.alive) return;
    this.setBusy(false);
    await this.finishRun(outcome, frames);
  }

  private async stepOnce(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    if (!this.trace) {
      this.resetBoard();
      this.trace = { ...this.compute(), at: 0 };
    }
    const t = this.trace;
    if (t.at < t.frames.length) {
      const f = t.frames[t.at];
      t.at++;
      this.setBusy(true);
      await this.play(f, t.outcome);
      if (!this.alive) return;
      this.setBusy(false);
      this.talk(`${t.at}번째 걸음이에요. 계속 눌러 봐요.`);
    }
    if (t.at >= t.frames.length) {
      this.trace = null;
      await this.finishRun(t.outcome, t.frames);
    }
  }

  private async finishRun(outcome: ClawOutcome, frames: ClawFrame[]): Promise<void> {
    const r = this.round;
    const editor = this.editor;
    if (!r || !editor) return;
    if (outcome === 'success') {
      editor.highlight(null);
      this.ctx.sfx('success');
      const stars = starsFor(countBlocks(editor.value), r.optimal);
      this.talk(stars === 3 ? '주문한 인형이 나왔어요!\n가장 짧은 프로그램이에요!' : '주문한 인형이 나왔어요!\n블록을 더 줄일 수 있을까요?', 'good');
      this.setBusy(true);
      await sleep(900);
      if (!this.alive) return;
      const allAfter = DOLLS.every((d) => d.id === r.target || this.ctx.hasFlag(dollFlag(d.id)));
      const result = this.ctx.clear(r.id, stars, { flags: [dollFlag(r.target)], ...(allAfter ? { title: CLAW_TITLE } : {}) });
      this.showResult(r, stars, result);
      return;
    }
    this.fails++;
    this.talk(FAIL_TEXT[outcome], 'bad');
    if (this.ctx.helpers.debugGlasses) {
      // 디버그 안경: 부딪힌 블록이나 잘못 집은 블록을 짚어 줘요.
      const wrong = frames.find((f) => f.event === 'bump' || f.event === 'grab');
      if (wrong) editor.highlight(wrong.path, 'err');
      else editor.pointAtEnd();
    }
    if (this.fails === 2) this.showHint();
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  // ── 결과 ──
  private showResult(r: ClawRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    this.editor = null;
    clear(ctx.root);
    const doll = DOLL_BY_ID.get(r.target);
    const index = CLAW_ROUNDS.indexOf(r);
    const next = CLAW_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, `${josa(doll?.name ?? '인형', '이', '가')} 나왔어요!`),
        pxImg(ctx.icon(doll?.sprite ?? 'icon-gem'), 96, doll?.name ?? '', 'claw-prize big'),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines('처음 뽑은 인형이에요.\n공방 방석에 앉혀 둘게요.')) : null,
        doll ? h('p', { class: 'muted' }, ...lines(doll.desc)) : null,
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
