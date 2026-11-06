import type { BlockCodeData, Dir } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import { GridEnv, type GridFrame, type GridOutcome } from '../core/gridEnv';
import { countBlocks, run } from '../core/interpreter';
import type { MissionContext, MissionEngine, Stars } from '../core/types';

const ROTATE: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 };
const DIR_NAME: Record<Dir, string> = { up: '위', right: '오른', down: '아래', left: '왼' };
const STEP_MS = 300;

const FAIL_TEXT: Record<Exclude<GridOutcome, 'success'>, string> = {
  wrongPaint: '그림과 조금 달라요.\n칠한 칸을 비교해 봐요.',
  bump: '쿵! 로비가 막힌 곳에 부딪혔어요.\n어느 블록에서 틀렸을까요?',
  notReached: '로비가 아직 깃발에 도착하지 못했어요.\n블록이 모자란가 봐요.',
  missingGems: '보석을 모두 줍지 못했어요.',
  tooLong: '프로그램이 너무 오래 돌아요.\n반복 횟수를 확인해 봐요.',
};

export function starsFor(blocks: number, optimal: number): Stars {
  if (blocks <= optimal) return 3;
  if (blocks <= optimal + 2) return 2;
  return 1;
}

/** 블록 퍼즐: 위에서 본 판 + 블록 편집기. 실행하면 로비가 한 칸씩 움직여요. */
export class BlockCodeMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: BlockCodeData;
  private editor!: ProgramEditor;
  private board!: HTMLElement;
  private robot!: HTMLElement;
  /** 로비 발밑의 고리 화살표(보는 쪽) */
  private robotFloor!: HTMLElement;
  /** 판 위에 서 있는 로비 그림 */
  private robotBody!: HTMLImageElement;
  private say!: HTMLElement;
  private cells: HTMLElement[] = [];
  private buttons: HTMLButtonElement[] = [];
  private attempts = 0;
  private hints = 0;
  private fails = 0;
  private busy = false;
  private alive = true;
  /** 한 단계씩 실행할 때의 기록 */
  private trace: { frames: GridFrame[]; outcome: GridOutcome; at: number } | null = null;
  /** 로비 그림의 회전 각도(누적). 돌기 블록이 언제나 가까운 쪽으로 돌아 보이게 해요. */
  private angle = 0;

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'blockCode' || !ctx.mission.data) return;
    this.ctx = ctx;
    this.data = ctx.mission.data;
    const d = this.data;

    this.editor = new ProgramEditor(
      { palette: d.palette, allowRepeat: d.allowRepeat, allowIf: d.allowIf, maxBlocks: d.maxBlocks, optimal: d.optimal },
      d.initialProgram ?? [],
    );
    this.editor.onChange(() => {
      this.trace = null;
      this.resetBoard();
    });

    this.say = h('div', { class: 'robi-say' });
    this.board = this.buildBoard();
    const run = this.button('▶ 실행', 'primary', () => void this.runAll());
    const step = this.button('한 단계씩', 'blue', () => void this.stepOnce());
    const reset = this.button('처음으로', '', () => {
      this.trace = null;
      this.resetBoard();
    });
    const hint = this.button('힌트', 'accent', () => this.showHint());
    hint.prepend(pxImg(ctx.icon('icon-hint'), 22));

    ctx.root.append(
      h('div', { class: 'mission-head' }, h('div', { class: 'mission-intro' }, ...lines(d.intro))),
      h(
        'div',
        { class: 'puzzle' },
        h('div', {}, this.board, h('div', { class: 'row center', style: 'margin-top:10px' }, run, step, reset, hint)),
        h('div', {}, this.say, h('div', { style: 'height:10px' }), this.editor.el),
      ),
    );
    this.talk(d.initialProgram ? '먼저 ▶ 실행을 눌러서\n무엇이 잘못됐는지 확인해 봐요.' : '블록을 눌러 프로그램을 만들고 ▶ 실행!');
  }

  unmount(): void {
    this.alive = false;
  }

  private button(label: string, kind: string, onclick: () => void): HTMLButtonElement {
    const b = h('button', { class: `btn ${kind}`, onclick }, label);
    this.buttons.push(b);
    return b;
  }

  private setBusy(on: boolean): void {
    this.busy = on;
    this.editor.setLocked(on);
    for (const b of this.buttons) b.disabled = on;
  }

  private talk(text: string, mood: '' | 'good' | 'bad' | 'hint' = ''): void {
    this.say.className = `robi-say ${mood}`;
    clear(this.say);
    this.say.append(pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(text)));
  }

  /**
   * 퍼즐 판: 비스듬히 기울인 2.5D 판이에요. 위쪽 = 판의 안쪽이라서 위·아래·왼쪽·오른쪽 블록의 뜻은 그대로예요.
   * 나무·깃발·보석·로비는 판 위에 서 있고, 로비 발밑의 고리 화살표가 보는 쪽을 가리켜요.
   */
  private buildBoard(): HTMLElement {
    const d = this.data;
    const env = new GridEnv(d);
    const board = h('div', { class: `board tilt ${d.paint ? 'paint-board' : ''}`, style: `grid-template-columns: repeat(${env.width}, 1fr)` });
    this.cells = [];
    d.grid.forEach((row, y) =>
      [...row].forEach((c, x) => {
        const cell = h('div', { class: `cell ${(x + y) % 2 ? 'alt' : ''} ${c === '#' ? 'wall' : c === '~' ? 'water' : ''}` });
        if (d.paint?.[y]?.[x] === 'x') { cell.style.outline = '2px dashed #f2c94c'; cell.style.outlineOffset = '-4px'; cell.setAttribute('aria-label', '칠할 칸'); }
        if (d.paint && x === env.start.x && y === env.start.y) cell.classList.add('trail');
        if (c === '!') cell.append(h('span', { 'data-signal': '', class: 'signal stand', style: 'background:#b43242;color:white;border-radius:50%;font-size:10px;padding:3px' }, '빨강'));
        if (c === '~') cell.append(pxImg(this.ctx.icon('icon-cell-water'), 32, '물'));
        // 막힌 칸은 키 작은 덤불이에요(뒤 칸의 로비를 가리지 않게).
        const stand = c === '#' ? 'prop-bush' : c === 'G' ? 'icon-goal' : c === '*' ? 'icon-gem' : '';
        if (stand) cell.append(pxImg(this.ctx.icon(stand), 32, c === '#' ? '덤불' : c === 'G' ? '깃발' : '보석', `stand ${c === '#' ? 'tree' : c === '*' ? 'gem' : 'goal'}`));
        this.cells.push(cell);
        board.append(cell);
      }),
    );
    this.robotFloor = h('i', { class: 'robot-floor' });
    this.robotBody = pxImg(this.ctx.icon('char-robi', 0), 40, '로비', 'robot-body');
    this.robot = h('div', { class: 'robot', style: `width:${100 / env.width}%;height:${100 / env.height}%` }, this.robotFloor, this.robotBody);
    board.append(this.robot);
    this.angle = ROTATE[d.startDir ?? 'right'];
    this.placeRobot(env.start.x, env.start.y, d.startDir ?? 'right');
    return h('div', { class: 'board-stage' }, board);
  }

  private placeRobot(x: number, y: number, dir: Dir): void {
    const env = new GridEnv(this.data);
    // 판 안쪽 여백(6px)을 빼고 칸 비율로 놓아요.
    this.robot.style.left = `calc(6px + (100% - 12px) * ${x / env.width})`;
    this.robot.style.top = `calc(6px + (100% - 12px) * ${y / env.height})`;
    this.robot.style.width = `calc((100% - 12px) / ${env.width})`;
    this.robot.style.height = `calc((100% - 12px) / ${env.height})`;
    // 왼쪽(270°)에서 오른쪽으로 돌아 위(0°)를 볼 때 거꾸로 270° 돌지 않게, 가까운 쪽으로 돌아요.
    const delta = ((((ROTATE[dir] - this.angle) % 360) + 540) % 360) - 180;
    this.angle += delta;
    this.robotFloor.style.transform = `rotate(${this.angle}deg)`;
    // 서 있는 로비: 안쪽(위)을 보면 뒷모습, 왼쪽을 보면 좌우를 뒤집어요.
    this.robotBody.src = this.ctx.icon('char-robi', dir === 'up' ? 5 : 0);
    this.robotBody.classList.toggle('flip', dir === 'left');
    // 로비 바로 앞(아래) 칸에 서 있는 것은 반투명하게 해서 로비가 가려지지 않게 해요.
    for (const c of this.cells) c.classList.remove('see-through');
    this.cells[(y + 1) * env.width + x]?.classList.add('see-through');
    this.robot.dataset.dir = dir;
    this.robot.setAttribute('aria-label', `로비(${DIR_NAME[dir]}쪽을 봐요)`);
  }

  private resetBoard(): void {
    const env = new GridEnv(this.data);
    this.placeRobot(env.start.x, env.start.y, this.data.startDir ?? 'right');
    for (const c of this.cells) c.classList.remove('trail');
    if (this.data.paint) this.cells[env.start.y * env.width + env.start.x]?.classList.add('trail');
    this.renderSignals(true);
    this.restoreGems();
    this.editor.highlight(null);
  }

  private restoreGems(): void {
    this.data.grid.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== '*') return;
        const cell = this.cells[y * row.length + x];
        if (!cell.querySelector('img.gem')) cell.append(pxImg(this.ctx.icon('icon-gem'), 32, '보석', 'stand gem'));
      }),
    );
  }

  private compute(): { frames: GridFrame[]; outcome: GridOutcome } {
    const env = new GridEnv(this.data);
    const r = run(this.editor.value, env);
    return { frames: env.frames, outcome: env.outcome(r.truncated) };
  }

  private renderSignals(red: boolean): void {
    for (const el of this.board.querySelectorAll<HTMLElement>('[data-signal]')) {
      el.textContent = red ? '빨강' : '초록';
      el.style.background = red ? '#b43242' : '#267046';
    }
  }

  private showFrame(f: GridFrame): void {
    this.renderSignals(f.signalRed);
    const w = this.data.grid[0].length;
    this.editor.highlight(f.path, f.event === 'bump' ? 'err' : 'run');
    this.placeRobot(f.x, f.y, f.dir);
    this.cells[f.y * w + f.x]?.classList.add('trail');
    if (f.event === 'collect' || (f.event === 'move' && this.data.grid[f.y][f.x] === '*')) {
      this.cells[f.y * w + f.x]?.querySelector('img.gem')?.remove();
    }
    if (f.event === 'bump') {
      this.robot.classList.remove('bump');
      void this.robot.offsetWidth;
      this.robot.classList.add('bump');
      this.ctx.sfx('fail');
    } else this.ctx.sfx('step');
  }

  private async runAll(): Promise<void> {
    if (this.busy) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    this.setBusy(true);
    this.resetBoard();
    this.attempts++;
    const { frames, outcome } = this.compute();
    for (const f of frames) {
      if (!this.alive) return;
      this.showFrame(f);
      await sleep(STEP_MS);
    }
    this.setBusy(false);
    this.trace = null;
    await this.finishRun(outcome, frames);
  }

  private async stepOnce(): Promise<void> {
    if (this.busy) return;
    if (this.editor.count === 0) return this.talk('블록을 먼저 놓아 주세요!', 'hint');
    if (!this.trace) {
      this.resetBoard();
      this.attempts++;
      this.trace = { ...this.compute(), at: 0 };
    }
    const t = this.trace;
    if (t.at < t.frames.length) {
      this.showFrame(t.frames[t.at]);
      t.at++;
      this.talk(`${t.at}번째 걸음이에요. 계속 눌러 봐요.`);
    }
    if (t.at >= t.frames.length) {
      this.trace = null;
      await this.finishRun(t.outcome, t.frames);
    }
  }

  private async finishRun(outcome: GridOutcome, frames: GridFrame[]): Promise<void> {
    if (outcome === 'success') {
      this.editor.highlight(null);
      this.ctx.sfx('success');
      const stars = starsFor(countBlocks(this.editor.value), this.data.optimal);
      this.talk(this.data.paint ? '무늬가 똑같아요! 잘 그렸어요.' : stars === 3 ? '도착! 가장 짧은 프로그램이에요!' : '도착! 블록을 더 줄일 수 있을까요?', 'good');
      this.setBusy(true);
      await sleep(900);
      if (this.alive) this.ctx.finish({ success: true, stars, attempts: this.attempts, hints: this.hints });
      return;
    }
    this.fails++;
    this.talk(FAIL_TEXT[outcome], 'bad');
    if (this.ctx.helpers.debugGlasses) {
      const bump = frames.find((f) => f.event === 'bump');
      if (bump) this.editor.highlight(bump.path, 'err');
      else this.editor.pointAtEnd();
      if (bump) this.talk('막힌 칸에 부딪혔어요.\n안경이 짚은 빨간 블록을 살펴봐요.', 'bad');
    }
    if (this.fails === 2) this.showHint();
  }

  private showHint(): void {
    this.hints++;
    this.talk(`힌트: ${this.data.hint}`, 'hint');
  }
}
