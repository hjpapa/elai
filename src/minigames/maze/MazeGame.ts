import { ISLAND_MAZES, MAZE_ROUNDS, MAZE_TITLE } from '../../data/minigames/maze';
import type { Block, Cmd } from '../../data/schema';
import { app } from '../../game/app';
import { h, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { ProgramEditor } from '../../ui/programEditor';
import { runRoute, usesCmd } from '../route/routeEnv';
import type { MinigameContext, MinigameEngine } from '../types';
import { decodeMaze, encodeMaze } from './mazeCode';
import { checkMaze, designFits, SIZE } from './mazeRules';
import './maze.css';

const ARROWS: Cmd[] = ['up', 'right', 'down', 'left'];
const labels: Record<string, string> = { '#': '벽', '.': '길', S: '출발', G: '깃발' };
const symbols: Record<string, string> = { '#': '■', '.': '·', S: '출', G: '⚑' };

function button(text: string, run: () => void) {
  return h('button', { class: 'btn', type: 'button', onclick: run }, text);
}
function blank(): string[] {
  return Array.from({ length: SIZE }, (_, y) => y === 0 ? 'S######' : y === 6 ? '######G' : '#######');
}

export class MazeGame implements MinigameEngine {
  private ctx!: MinigameContext;
  private round = MAZE_ROUNDS[0];
  private rows: string[] = [];
  private tool = 'toggle';
  private generation = 0;

  mount(ctx: MinigameContext): void {
    this.ctx = ctx;
    this.list();
  }
  unmount(): void { this.generation++; }

  private list(): void {
    this.generation++;
    this.ctx.setTitle('코딩 미로 만들기');
    const cards = MAZE_ROUNDS.map((round, i) => {
      const open = this.ctx.unlocked(round.unlock);
      const control = h('button', {
        class: 'game-card', disabled: !open, 'aria-label': (i + 1) + '판 ' + round.title,
        onclick: () => {
          this.round = round;
          const code = app.state.data.mazeWorks?.[round.id];
          this.rows = code && decodeMaze(code) || blank();
          this.tool = 'toggle';
          this.ctx.setTitle('코딩 미로 만들기 · ' + round.title);
          if (round.program === 'share') this.friend(); else this.design();
        },
      }, pxImg(this.ctx.icon(open ? 'icon-maze' : 'icon-lock'), 48),
        h('span', {}, (i + 1) + '판 · ' + round.title, h('small', {}, open
          ? '별 ' + (this.ctx.best()[round.id] ?? 0) + '개'
          : round.program === 'wave' ? '6장 물결 탐색 뒤 열려요.' : '2장 반복 연습 뒤 열려요.')));
      return control;
    });
    this.ctx.root.replaceChildren(h('div', { class: 'game-rounds' }, ...cards));
  }

  private grid(edit?: (x: number, y: number) => void): HTMLElement {
    const grid = h('div', { class: 'maze-grid', 'aria-label': '일곱 줄 미로' });
    this.rows.forEach((row, y) => [...row].forEach((c, x) => {
      const name = (y + 1) + '행 ' + (x + 1) + '열 ' + labels[c];
      const props = { class: 'maze-square', dataset: { cell: c }, 'aria-label': name };
      const cell = edit ? h('button', { ...props, type: 'button', onclick: () => edit(x, y) }, symbols[c])
        : h('span', props, symbols[c]);
      grid.append(cell);
    }));
    return grid;
  }

  private design(focus?: number): void {
    const round = this.round;
    const stats = checkMaze(this.rows);
    const grid = this.grid((x, y) => {
      const old = this.rows[y][x];
      if (this.tool === 'S' || this.tool === 'G') {
        if (old === 'S' || old === 'G') return;
        this.rows = this.rows.map(row => row.replace(this.tool, '.'));
      } else if (old === 'S' || old === 'G') return;
      const next = this.tool === 'toggle' ? old === '.' ? '#' : '.' : this.tool;
      this.rows[y] = this.rows[y].slice(0,x) + next + this.rows[y].slice(x+1);
      this.design(y * SIZE + x);
    });
    const tools = h('div', { class: 'maze-actions' });
    for (const [id,name] of [['toggle','벽·길 바꾸기'],['S','출발 놓기'],['G','깃발 놓기']]) {
      const control = button(name, () => {
        this.tool = id;
        for (const el of tools.querySelectorAll('button[aria-pressed]')) el.setAttribute('aria-pressed', String(el === control));
      });
      control.setAttribute('aria-pressed', String(id === this.tool));
      tools.append(control);
    }
    tools.append(button('지우기', () => { this.rows = blank(); this.design(); }));
    const conditions = h('ul', { class: 'maze-checks', 'aria-live': 'polite' });
    const add = (ok: boolean, text: string) => conditions.append(h('li', {}, (ok ? '✓ ' : '□ ') + text));
    add(stats.connected, '출발과 깃발을 이어요.');
    add(stats.steps >= round.steps, '최단 ' + stats.steps + '걸음 / 목표 ' + round.steps + '걸음 이상');
    add(stats.deadEnds >= (round.deadEnds ?? 0), '막다른 길 ' + stats.deadEnds + '개' + (round.deadEnds ? ' / 목표 ' + round.deadEnds + '개' : ''));
    add(!round.detour || stats.detour, '갈래 길 ' + (stats.detour ? '있어요.' : '없어요.') + (round.detour ? ' (필요해요)' : ''));
    const solve = button('직접 풀어 보기', () => this.solve());
    solve.disabled = !designFits(round, stats);
    this.ctx.root.replaceChildren(button('← 판 고르기', () => this.list()), tools, grid, conditions, solve);
    if (focus !== undefined) grid.querySelectorAll('button')[focus].focus({ preventScroll: true });
  }

  private friend(): void {
    const input = h('input', { 'aria-label': '친구 미로 코드', maxlength: 15, autocomplete: 'off', spellcheck: false, placeholder: 'ABCD-EFGH-JKLMN' });
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[\s-]/g, '').slice(0,13);
    });
    const note = h('p', { role: 'status' });
    const start = () => {
      const rows = decodeMaze(input.value);
      if (!rows) { note.textContent = '코드를 다시 확인해요.'; return; }
      this.rows = rows;
      this.solve();
    };
    const saved = app.state.data.mazeWorks?.[this.round.id];
    const previous = saved && decodeMaze(saved);
    const resume = previous ? button('내가 푼 미로', () => { this.rows = previous; this.solve(); }) : null;
    const examples = ISLAND_MAZES.map(m => button(m.author + '의 미로', () => { this.rows = [...m.rows]; this.solve(); }));
    this.ctx.root.replaceChildren(button('← 판 고르기', () => this.list()),h('p', {}, '친구의 미로 코드를 넣어요.'),
      input, button('친구 코드 열기', start), ...(resume ? [resume] : []), note, h('h3', {}, '섬 친구 미로'), h('div', {class:'maze-actions'}, ...examples));
  }

  private solve(): void {
    const token = ++this.generation;
    const mode = this.round.program;
    const repeat = mode === 'repeat' || mode === 'wave' || (mode === 'share' && this.ctx.unlocked(MAZE_ROUNDS[3].unlock));
    const wave = mode === 'wave' || (mode === 'share' && this.ctx.unlocked(MAZE_ROUNDS[4].unlock));
    const palette = wave ? [...ARROWS, 'followWave' as const] : [...ARROWS];
    const editor = new ProgramEditor({ palette, allowRepeat: repeat, maxRepeat: 49, maxBlocks: mode === 'repeat' ? 8 : 80 });
    const grid = this.grid();
    const note = h('p', { role:'status' }, mode === 'repeat' ? '반복을 써서 8블록 안에 풀어요.' : mode === 'wave' ? '물결 따라가기를 반복해요.' : '블록으로 깃발까지 걸어가요.');
    const back = button(mode === 'share' ? '코드 다시 고르기' : '설계 고치기', () => mode === 'share' ? this.friend() : this.design());
    const run = button('실행', async () => {
      const program = editor.value;
      const repeated = program.filter((block): block is Extract<Block,{t:'repeat'}> => block.t === 'repeat');
      const result = runRoute({ id:this.round.id,title:this.round.title,optimal:0,palette,intro:'',hint:'',mazes:[this.rows] },program).mazes[0];
      const executed = new Set(result.frames.map(f => Number(f.path.split('.')[0])));
      const waveInLoop = result.frames.some(f => f.event === 'wave' && f.path.includes('.'));
      const usedRepeat = repeated.some(block => block.times >= 2 && executed.has(program.indexOf(block)) && block.body.length);
      if (mode === 'repeat' && (!usedRepeat || editor.count > 8)) { note.textContent='쓰이는 반복을 넣고 8블록 안에 풀어요.'; return; }
      if (mode === 'wave' && (!usedRepeat || !repeated.some(block => usesCmd(block.body,'followWave') && executed.has(program.indexOf(block))) || !waveInLoop)) {
        note.textContent='반복 안에 물결 따라가기를 넣어요.'; return;
      }
      run.disabled = back.disabled = true;
      editor.setLocked(true);
      for (const f of result.frames) {
        if (this.generation !== token) return;
        grid.querySelector('.maze-player')?.classList.remove('maze-player');
        grid.children[f.y*SIZE+f.x].classList.add('maze-player');
        editor.highlight(f.path);
        await sleep(95);
      }
      if (this.generation !== token) return;
      if (result.outcome === 'success') {
        this.finish(result.frames.length === checkMaze(this.rows).steps ? 3 : 2);
      } else {
        note.textContent = result.outcome === 'bump' ? '벽을 만났어요. 방향을 바꿔 봐요.' : '깃발까지 블록을 더 놓아요.';
        editor.setLocked(false); run.disabled = back.disabled = false;
      }
    });
    this.ctx.root.replaceChildren(back,grid,note,editor.el,run);
  }

  private finish(stars: number): void {
    const { ctx, round } = this;
    const code = encodeMaze(this.rows)!;
    const complete = MAZE_ROUNDS.every(r => r.id === round.id || ctx.best()[r.id]);
    const result = ctx.clear(round.id, stars, { flags:['maze:'+round.id], ...(complete ? { title:MAZE_TITLE } : {}) });
    app.state.saveMazeWork(round.id, code);
    const note = h('p', {role:'status'});
    ctx.root.replaceChildren(h('div', {class:'game-result'}, h('h2', {}, '깃발에 도착했어요!'),
      h('p', {}, '별 '+stars+'개'), result.title ? h('p', {},'칭호 · '+result.title) : null,
      h('p', {}, '친구와 미로 코드를 나눠요.'), h('strong',{class:'maze-code'},code),
      button('코드 복사',async()=>{try{await navigator.clipboard.writeText(code);note.textContent='코드를 복사했어요.';}catch{note.textContent='위 코드를 골라 복사해요.';}}),
      note, button('판 고르기',()=>this.list())));
  }
}
