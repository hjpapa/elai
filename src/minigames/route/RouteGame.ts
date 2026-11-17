import { ROUTE_ROUNDS, ROUTE_TITLE, routeFlag, routeTier } from '../../data/minigames/route';
import type { RouteRound } from '../../data/schema';
import { starsFor } from '../../missions/blockCode/BlockCodeMission';
import { countBlocks } from '../../missions/core/interpreter';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import type { MinigameClear, MinigameContext, MinigameEngine } from '../types';
import { findMark, isWall, runRoute, shortestPath, usesCmd, waveNumbers, type RouteFrame, type RouteOutcome } from './routeEnv';

interface Step {
  maze: number;
  frame: RouteFrame;
}

interface Cell {
  el: HTMLElement;
  num: HTMLElement | null;
}

/** 걸음 수가 많을수록 빨리 보여 줘요(6판은 미로 세 개 × 6~12걸음). */
const stepMs = (total: number): number => (total <= 16 ? 280 : total <= 40 ? 190 : 120);

const calm = (): boolean => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * 코딩 길찾기: 판 고르기 → 미로 + 블록 편집기 → 결과.
 * 로봇은 학생 프로그램대로만 움직이고(RouteEnv), 같은 프로그램은 늘 같은 결과예요.
 * 물결 숫자(깃발까지 걸음 수)는 '물결 보기'로 켜거나, 물결 판(5·6판)에서는 처음부터 보여요.
 */
export class RouteGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private alive = true;
  private round: RouteRound | null = null;
  private editor: ProgramEditor | null = null;
  private say!: HTMLElement;
  private robot!: HTMLElement;
  private board!: HTMLElement;
  private mazeLabel!: HTMLElement;
  private cells: Cell[][] = [];
  private cols = 1;
  private rows = 1;
  private buttons: HTMLButtonElement[] = [];
  private waveBtn: HTMLButtonElement | null = null;
  private fails = 0;
  private busy = false;
  /** 지금 보여 주는 미로 */
  private maze = 0;
  /** 물결 숫자를 보여 주는지 */
  private waveOn = false;
  /** 물결을 퍼뜨리는 연출이 진행 중인지(바꿀 때마다 1씩 올려서 앞 연출을 멈춰요) */
  private waveRun = 0;
  /** 한 단계씩 실행할 때의 기록 */
  private trace: { steps: Step[]; outcome: RouteOutcome; failedMaze: number; at: number } | null = null;

  mount(ctx: MinigameContext): void {
    this.ctx = ctx;
    this.showList();
  }

  unmount(): void {
    this.alive = false;
  }

  /** 미로를 작은 격자로 보여 줘요(판 고르기 벽 지도, 결과). on이면 가장 짧은 길이 그려져요. */
  private mini(rows: readonly string[], on: boolean, label: string): HTMLElement {
    const w = rows[0]?.length ?? 1;
    const route = new Set(on ? shortestPath(rows).map((p) => `${p.x},${p.y}`) : []);
    return h(
      'div',
      { class: `route-mini ${on ? 'on' : ''}`.trim(), style: `grid-template-columns: repeat(${w}, 1fr)`, role: 'img', 'aria-label': label },
      ...rows.flatMap((row, y) =>
        [...row].map((ch, x) => h('span', { class: ch === '#' ? 'wall' : ch === 'G' ? 'goal' : ch === 'S' ? 'start' : route.has(`${x},${y}`) ? 'road' : '' })),
      ),
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
    this.waveBtn = null;
    this.waveRun++;
    clear(ctx.root);
    ctx.setTitle('코딩 길찾기');
    const best = ctx.best();
    const got = ROUTE_ROUNDS.filter((r) => ctx.hasFlag(routeFlag(r.id))).length;
    const cards = ROUTE_ROUNDS.map((r, i) => {
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
        pxImg(ctx.icon(open ? 'icon-goal' : 'icon-lock'), 48, ''),
        h(
          'span',
          { class: 'game-card-text' },
          h('b', {}, `${i + 1}판 · ${r.title}`),
          h('small', {}, ...lines(open ? routeTier(r) : (r.lockedText ?? '아직 닫혀 있어요.'))),
          open
            ? h('span', { class: 'mini-stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((k) => pxImg(ctx.icon(k < stars ? 'icon-star' : 'icon-star-empty'), 18)))
            : null,
        ),
      );
    });
    const maps = ROUTE_ROUNDS.map((r, i) => {
      const has = ctx.hasFlag(routeFlag(r.id));
      return h(
        'figure',
        { class: `route-frame ${has ? 'got' : ''}`.trim(), title: has ? `${i + 1}판 길 지도` : '아직 길을 그리지 않았어요' },
        this.mini(r.mazes[0], has, has ? `${i + 1}판 길 지도` : '빈 지도'),
        h('figcaption', {}, `${i + 1}판`),
      );
    });
    this.say = h('div', { class: 'robi-say' });
    ctx.root.append(
      h(
        'div',
        { class: 'route-list' },
        this.say,
        h('div', { class: 'game-rounds' }, ...cards),
        h('h3', { class: 'game-shelf-title' }, `길 지도 ${got} / ${ROUTE_ROUNDS.length}`),
        h('div', { class: 'route-gallery' }, ...maps),
      ),
    );
    this.talk(got === ROUTE_ROUNDS.length ? '길을 모두 찾았어요!\n별을 더 받으러 다시 해도 좋아요.' : '로봇을 깃발까지 데려가요.\n로봇은 프로그램대로만 움직여요.');
  }

  // ── 판 놀이 ──
  private openRound(r: RouteRound): void {
    const ctx = this.ctx;
    clear(ctx.root);
    this.round = r;
    this.buttons = [];
    this.fails = 0;
    this.trace = null;
    this.busy = false;
    this.waveOn = !!r.showWave;
    this.waveRun++;
    const index = ROUTE_ROUNDS.indexOf(r);
    ctx.setTitle(`코딩 길찾기 · ${index + 1}판 ${r.title}`);
    const editor = new ProgramEditor({ palette: r.palette, allowRepeat: r.allowRepeat, maxRepeat: r.maxRepeat, maxBlocks: r.maxBlocks, optimal: r.optimal });
    editor.onChange(() => {
      this.trace = null;
      this.showMaze(0);
    });
    this.editor = editor;
    this.say = h('div', { class: 'robi-say' });
    const machine = this.buildMachine(r);
    const runBtn = this.button('▶ 실행', 'primary', () => void this.runAll());
    const step = this.button('한 단계씩', 'blue', () => void this.stepOnce());
    const reset = this.button('처음으로', '', () => {
      this.trace = null;
      this.showMaze(0);
    });
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));
    this.waveBtn = r.showWave ? null : this.button('물결 보기', 'ghost', () => this.toggleWave());
    const back = this.button('← 판 고르기', 'ghost', () => this.showList());
    const legend = h(
      'div',
      { class: 'game-order route-order' },
      h('small', {}, '미로 보는 법'),
      h('div', { class: 'route-rule' }, pxImg(ctx.icon('icon-goal'), 28, '깃발'), '깃발에 닿으면 도착'),
      h('div', { class: 'route-rule' }, pxImg(ctx.icon('icon-cell-rock'), 28, '바위'), '바위는 못 지나가요'),
      h('div', { class: 'route-rule' }, h('span', { class: 'route-num sample' }, '3'), '깃발까지 걸음 수(물결)'),
    );
    ctx.root.append(
      h('div', { class: 'mission-head game-top' }, back, h('div', { class: 'mission-intro' }, ...lines(r.intro))),
      h(
        'div',
        { class: 'puzzle route-play' },
        h('div', {}, machine, h('div', { class: 'row center', style: 'margin-top:10px' }, runBtn, step, reset, hint, this.waveBtn)),
        h('div', {}, legend, this.say, h('div', { style: 'height:10px' }), editor.el),
      ),
    );
    this.showMaze(0);
    if (r.showWave) void this.spreadWave();
    this.talk(
      r.mazes.length > 1
        ? '미로 세 개를 차례로 가요.\n같은 프로그램으로 모두 도착해요!'
        : r.showWave
          ? '깃발에서 물결이 퍼져요.\n숫자는 깃발까지 걸음 수예요.'
          : '블록을 놓고 ▶ 실행을 눌러요.\n로봇이 깃발을 찾아가요.',
    );
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

  /** 미로 판: 칸은 모두 정사각형이라 로봇 자리를 칸 비율로 놓아요(place). */
  private buildMachine(r: RouteRound): HTMLElement {
    this.cols = r.mazes[0][0].length;
    this.rows = r.mazes[0].length;
    this.board = h('div', { class: 'route-board', style: `grid-template-columns: repeat(${this.cols}, 1fr)`, 'aria-label': '미로' });
    this.robot = h('div', { class: 'route-robot' }, pxImg(this.ctx.icon('icon-robi'), 32, '길찾기 로봇'));
    this.mazeLabel = h('div', { class: 'route-maze-label', 'aria-live': 'polite' });
    return h(
      'div',
      { class: 'route-machine' },
      h('div', { class: 'route-sign' }, '코딩 길찾기'),
      r.mazes.length > 1 ? this.mazeLabel : null,
      this.board,
    );
  }

  private place(el: HTMLElement, x: number, y: number): void {
    // 판 안쪽 여백(8px)을 빼고 칸 비율로 놓아요.
    el.style.left = `calc(8px + (100% - 16px) * ${x / this.cols})`;
    el.style.top = `calc(8px + (100% - 16px) * ${y / this.rows})`;
    el.style.width = `calc((100% - 16px) / ${this.cols})`;
    el.style.height = `calc((100% - 16px) / ${this.rows})`;
  }

  /** 미로를 처음 모습으로 그려요(벽·길·깃발·물결 숫자, 로봇은 출발점). */
  private showMaze(index: number): void {
    const r = this.round;
    if (!r) return;
    this.maze = index;
    const rows = r.mazes[index] ?? r.mazes[0];
    const wave = waveNumbers(rows);
    clear(this.board);
    this.cells = rows.map((row, y) =>
      [...row].map((ch, x) => {
        const wall = isWall(rows, x, y);
        const n = wave[y][x];
        const num = !wall && n !== null ? h('span', { class: 'route-num' }, String(n)) : null;
        const el = h(
          'div',
          { class: `route-cell ${wall ? 'wall' : 'floor'} ${ch === 'G' ? 'goal' : ''}`.trim(), dataset: { d: String(n ?? '') } },
          wall ? pxImg(this.ctx.icon('icon-cell-rock'), 32, '', 'route-rock') : null,
          ch === 'G' ? pxImg(this.ctx.icon('icon-goal'), 32, '깃발', 'route-flag') : null,
          num,
        );
        this.board.append(el);
        return { el, num };
      }),
    );
    this.board.append(this.robot);
    this.board.classList.toggle('wave-on', this.waveOn);
    // 물결을 켜 둔 판은 미로를 다시 그려도(다음 미로, 처음으로, 블록 바꿈) 숫자가 바로 보여요.
    if (this.waveOn) for (const c of this.cells.flat()) if (c.num) c.el.classList.add('wet');
    this.robot.classList.remove('wrong', 'bump', 'home');
    const s = findMark(rows, 'S');
    this.place(this.robot, s.x, s.y);
    this.mazeLabel.textContent = `미로 ${index + 1} / ${r.mazes.length}`;
    this.editor?.highlight(null);
  }

  /** '물결 보기': 깃발에서 숫자가 한 겹씩 퍼져요(움직임 줄이기에서는 한 번에). */
  private toggleWave(): void {
    this.waveOn = !this.waveOn;
    if (this.waveBtn) this.waveBtn.textContent = this.waveOn ? '물결 숨기기' : '물결 보기';
    this.board.classList.toggle('wave-on', this.waveOn);
    if (this.waveOn) {
      void this.spreadWave();
      this.talk('깃발에서 물결이 퍼져요.\n숫자는 깃발까지 걸음 수예요.', 'hint');
    }
  }

  private async spreadWave(): Promise<void> {
    const run = ++this.waveRun;
    const all = this.cells.flat().filter((c) => c.num);
    if (calm()) {
      for (const c of all) c.el.classList.add('wet');
      return;
    }
    for (const c of all) c.el.classList.remove('wet');
    const max = Math.max(0, ...all.map((c) => Number(c.el.dataset.d)));
    for (let d = 0; d <= max; d++) {
      if (!this.alive || run !== this.waveRun) return;
      for (const c of all) if (Number(c.el.dataset.d) === d) c.el.classList.add('wet');
      await sleep(70);
    }
  }

  private shake(el: HTMLElement): void {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  /** 한 걸음 보여 주기 */
  private async play(f: RouteFrame, ms: number): Promise<void> {
    const stop = f.event === 'bump' || f.event === 'lost';
    this.editor?.highlight(f.path, stop ? 'err' : 'run');
    this.robot.style.transitionDuration = `${Math.min(ms, 220)}ms`;
    switch (f.event) {
      case 'move':
      case 'wave': {
        const cell = this.cells[f.y]?.[f.x];
        if (f.event === 'wave' && cell) {
          // 물결 따라가기: 하나 작은 숫자 칸이 잠깐 빛나요.
          cell.el.classList.add('next');
          setTimeout(() => cell.el.classList.remove('next'), Math.max(ms, 200));
        }
        this.place(this.robot, f.x, f.y);
        this.ctx.sfx('step');
        if (f.arrive) {
          this.robot.classList.add('home');
          this.cells[f.y]?.[f.x]?.el.classList.add('arrived');
        }
        break;
      }
      case 'bump':
      case 'lost': {
        this.robot.classList.add('wrong');
        if (f.event === 'bump') {
          const dx = f.toward === 'right' ? 0.3 : f.toward === 'left' ? -0.3 : 0;
          const dy = f.toward === 'down' ? 0.3 : f.toward === 'up' ? -0.3 : 0;
          this.place(this.robot, f.x + dx, f.y + dy);
        }
        this.shake(this.robot);
        this.ctx.sfx('fail');
        break;
      }
      default:
        break;
    }
    await sleep(stop ? Math.max(ms, 320) : ms);
  }

  private compute(): { steps: Step[]; outcome: RouteOutcome; failedMaze: number } {
    const r = this.round!;
    const res = runRoute(r, this.editor?.value ?? []);
    const last = res.failedMaze < 0 ? res.mazes.length - 1 : res.failedMaze;
    const steps: Step[] = [];
    for (let m = 0; m <= last; m++) for (const frame of res.mazes[m].frames) steps.push({ maze: m, frame });
    return { steps, outcome: res.outcome, failedMaze: res.failedMaze };
  }

  private async runAll(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    this.setBusy(true);
    this.trace = null;
    this.showMaze(0);
    const { steps, outcome, failedMaze } = this.compute();
    const ms = stepMs(steps.length);
    for (const s of steps) {
      if (!this.alive) return;
      if (s.maze !== this.maze) {
        // 다음 미로: 잠깐 도착한 모습을 보여 준 뒤 새 미로로 바꿔요.
        await sleep(600);
        if (!this.alive) return;
        this.showMaze(s.maze);
        this.talk(`${s.maze + 1}번째 미로예요.\n같은 프로그램으로 가요.`);
        await sleep(350);
        if (!this.alive) return;
      }
      await this.play(s.frame, ms);
    }
    if (!this.alive) return;
    this.setBusy(false);
    await this.finishRun(outcome, failedMaze, steps);
  }

  private async stepOnce(): Promise<void> {
    if (this.busy || !this.editor) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    if (!this.trace) {
      this.showMaze(0);
      this.trace = { ...this.compute(), at: 0 };
    }
    const t = this.trace;
    if (t.at < t.steps.length) {
      const s = t.steps[t.at];
      t.at++;
      this.setBusy(true);
      if (s.maze !== this.maze) this.showMaze(s.maze);
      await this.play(s.frame, 220);
      if (!this.alive) return;
      this.setBusy(false);
      this.talk(`${t.at}번째 걸음이에요. 계속 눌러 봐요.`);
    }
    if (t.at >= t.steps.length) {
      this.trace = null;
      await this.finishRun(t.outcome, t.failedMaze, t.steps);
    }
  }

  private failText(r: RouteRound, outcome: RouteOutcome, failedMaze: number): string {
    const multi = r.mazes.length > 1;
    // 첫 미로는 갔는데 다른 미로에서 틀렸고 물결 따라가기가 없으면: 순서만 외운 프로그램이에요.
    if (multi && failedMaze > 0 && !usesCmd(this.editor?.value ?? [], 'followWave')) return '첫 미로에만 맞는 순서예요.\n물결 따라가기를 써 봐요.';
    const at = multi ? `${failedMaze + 1}번째 미로에서\n` : '';
    switch (outcome) {
      case 'bump':
        return multi ? `${at}바위에 부딪혔어요.` : '바위에 부딪혔어요.\n길을 한 칸씩 세어 봐요.';
      case 'lost':
        return '물결이 닿지 않는 칸이에요.\n물결 숫자를 다시 봐요.';
      case 'notThere':
        return multi ? `${at}깃발에 못 닿았어요.` : '아직 깃발에 못 닿았어요.\n블록이나 반복을 늘려 봐요.';
      default:
        return '프로그램이 너무 오래 돌아요.\n반복 횟수를 확인해 봐요.';
    }
  }

  private async finishRun(outcome: RouteOutcome, failedMaze: number, steps: Step[]): Promise<void> {
    const r = this.round;
    const editor = this.editor;
    if (!this.alive || !r || !editor) return;
    if (outcome === 'success') {
      const stars = starsFor(countBlocks(editor.value), r.optimal);
      // 성공은 바로 저장하고, 아래 기다림은 결과 화면을 보여 주는 연출에만 써요.
      const allAfter = ROUTE_ROUNDS.every((x) => x.id === r.id || this.ctx.hasFlag(routeFlag(x.id)));
      const result = this.ctx.clear(r.id, stars, { flags: [routeFlag(r.id)], ...(allAfter ? { title: ROUTE_TITLE } : {}) });
      editor.highlight(null);
      this.ctx.sfx('success');
      this.talk(stars === 3 ? '깃발에 도착했어요!\n가장 짧은 프로그램이에요!' : '깃발에 도착했어요!\n블록을 더 줄일 수 있을까요?', 'good');
      this.setBusy(true);
      await sleep(900);
      if (!this.alive) return;
      this.showResult(r, stars, result);
      return;
    }
    this.fails++;
    this.talk(this.failText(r, outcome, failedMaze), 'bad');
    if (this.ctx.helpers.debugGlasses) {
      // 디버그 안경: 바위에 부딪힌 블록, 따라갈 곳이 없던 블록을 짚어 줘요.
      const wrong = steps.find((s) => s.maze === failedMaze && (s.frame.event === 'bump' || s.frame.event === 'lost'));
      if (wrong) editor.highlight(wrong.frame.path, 'err');
      else editor.pointAtEnd();
    }
    if (this.fails === 2) this.showHint();
  }

  private showHint(): void {
    if (this.round) this.talk(`힌트: ${this.round.hint}`, 'hint');
  }

  // ── 결과 ──
  private showResult(r: RouteRound, stars: number, result: MinigameClear): void {
    const ctx = this.ctx;
    this.buttons = [];
    this.waveBtn = null;
    this.editor = null;
    this.waveRun++;
    clear(ctx.root);
    const index = ROUTE_ROUNDS.indexOf(r);
    const next = ROUTE_ROUNDS[index + 1];
    const nextOpen = !!next && ctx.unlocked(next.unlock);
    const multi = r.mazes.length > 1;
    ctx.root.append(
      h(
        'div',
        { class: 'reward game-result' },
        h('h2', {}, '길 찾기 성공!'),
        h('div', { class: 'route-result' }, ...r.mazes.map((m, i) => this.mini(m, true, multi ? `찾은 길 ${i + 1}` : '찾은 길'))),
        h('div', { class: 'stars', 'aria-label': `별 ${stars}개` }, ...[0, 1, 2].map((i) => pxImg(ctx.icon(i < stars ? 'icon-star' : 'icon-star-empty'), 44))),
        r.showWave ? h('p', {}, ...lines('물결 숫자를 따라가면 늘 지름길!\n길 안내 기계도 이렇게 찾아요.')) : null,
        result.improved ? h('p', {}, '별 기록이 올랐어요!') : null,
        result.first ? h('p', {}, ...lines('처음 찾은 길이에요.\n지도방 벽 지도에 길이 그려졌어요.')) : null,
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
