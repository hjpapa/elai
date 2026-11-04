import type { SequenceData } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MissionContext, MissionEngine, Stars } from '../core/types';

/** 같은 미션이면 늘 같은 순서로 섞되, 정답 순서와는 다르게 */
export function shuffled(n: number, seedText: string): number[] {
  let seed = [...seedText].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let tries = 0; tries < 10; tries++) {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.some((v, i) => v !== i)) return order;
  }
  return Array.from({ length: n }, (_, i) => n - 1 - i);
}

export const starsByAttempts = (attempts: number): Stars => (attempts <= 1 ? 3 : attempts === 2 ? 2 : 1);

/** 순서 카드 맞추기(카드형·순서도형). 카드를 누르면 다음 빈칸에 들어가요. */
export class SequenceMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: SequenceData;
  /** 칸마다 놓인 카드(정답 번호) */
  private placed: (number | null)[] = [];
  private locked: boolean[] = [];
  private pool: number[] = [];
  private attempts = 0;
  private hints = 0;
  private fails = 0;
  private alive = true;
  private readonly poolEl = h('div');
  private readonly answerEl = h('div');
  private readonly say = h('div', { class: 'robi-say' });
  private readonly check = h('button', { class: 'btn primary' }, '확인하기');

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'sequence' || !ctx.mission.data) return;
    this.ctx = ctx;
    this.data = ctx.mission.data;
    const n = this.data.steps.length;
    this.pool = shuffled(n, ctx.mission.id);
    this.placed = Array(n).fill(null);
    this.locked = Array(n).fill(false);
    this.check.addEventListener('click', () => void this.verify());
    const hint = h('button', { class: 'btn accent', onclick: () => this.hint() }, pxImg(ctx.icon('icon-hint'), 22), '힌트');
    ctx.root.append(
      h('div', { class: 'mission-head' }, h('div', { class: 'mission-intro' }, ...lines(this.data.intro))),
      this.say,
      h(
        'div',
        { class: 'seq', style: 'margin-top:10px' },
        h('div', {}, h('h3', {}, '카드'), this.poolEl),
        h('div', {}, h('h3', {}, this.data.display === 'flowchart' ? '순서도' : '순서'), this.answerEl),
      ),
      h('div', { class: 'row end', style: 'margin-top:8px' }, hint, this.check),
    );
    this.talk('카드를 눌러 순서대로 놓아요. 놓은 카드를 누르면 다시 빠져요.');
    this.render();
  }

  unmount(): void {
    this.alive = false;
  }

  private talk(text: string, mood = ''): void {
    this.say.className = `robi-say ${mood}`;
    clear(this.say);
    this.say.append(pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(text)));
  }

  private render(marks: ('ok' | 'no' | null)[] = []): void {
    const steps = this.data.steps;
    clear(this.poolEl);
    for (const i of this.pool) {
      this.poolEl.append(
        h(
          'button',
          {
            class: 'card',
            onclick: () => {
              const slot = this.placed.indexOf(null);
              if (slot < 0) return;
              this.placed[slot] = i;
              this.pool = this.pool.filter((p) => p !== i);
              this.ctx.sfx('click');
              this.render();
            },
          },
          steps[i],
        ),
      );
    }
    if (this.pool.length === 0) this.poolEl.append(h('p', { class: 'muted' }, '카드를 모두 놓았어요. 확인해 봐요!'));

    clear(this.answerEl);
    const slotEl = (k: number) => {
      const v = this.placed[k];
      const mark = marks[k] ?? (this.locked[k] ? 'ok' : null);
      return h(
        'button',
        {
          class: `card ${v === null ? 'empty' : ''} ${mark ?? ''}`,
          onclick: () => {
            if (v === null || this.locked[k]) return;
            this.placed[k] = null;
            this.pool.push(v);
            this.render();
          },
        },
        h('span', { class: 'n' }, `${k + 1}`),
        v === null ? '빈칸' : steps[v],
      );
    };
    if (this.data.display === 'flowchart') {
      const flow = h('div', { class: 'flow' }, h('div', { class: 'terminal' }, '시작'));
      this.placed.forEach((_, k) => flow.append(h('div', { class: 'arrow' }, '↓'), slotEl(k)));
      flow.append(h('div', { class: 'arrow' }, '↓'), h('div', { class: 'terminal' }, '끝'));
      this.answerEl.append(flow);
    } else this.placed.forEach((_, k) => this.answerEl.append(slotEl(k)));
    this.check.disabled = this.placed.includes(null);
  }

  private async verify(): Promise<void> {
    this.attempts++;
    const marks = this.placed.map((v, k) => (v === k ? 'ok' : 'no')) as ('ok' | 'no')[];
    this.render(marks);
    if (marks.every((m) => m === 'ok')) {
      this.ctx.sfx('success');
      this.talk('모두 맞았어요! 순서대로 하니 일이 척척 되네요.', 'good');
      this.check.disabled = true;
      await sleep(900);
      if (this.alive) this.ctx.finish({ success: true, stars: starsByAttempts(this.attempts), attempts: this.attempts, hints: this.hints });
      return;
    }
    this.ctx.sfx('fail');
    this.fails++;
    const wrong = marks.filter((m) => m === 'no').length;
    this.talk(
      wrong === marks.length
        ? '카드의 자리가 모두 달라요. 무엇을 가장 먼저 해야 할지 생각해 봐요.'
        : `초록 카드는 맞았어요. 빨간 카드 ${wrong}장의 자리를 다시 생각해 봐요.`,
      'bad',
    );
    await sleep(900);
    this.placed.forEach((v, k) => {
      if (v === null) return;
      if (v === k) this.locked[k] = true;
      else {
        this.pool.push(v);
        this.placed[k] = null;
      }
    });
    this.render();
    if (this.fails === 2) this.hint();
  }

  private hint(): void {
    this.hints++;
    this.talk(`힌트: ${this.data.hint}`, 'hint');
  }
}
