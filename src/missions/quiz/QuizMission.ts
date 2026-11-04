import type { QuizData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MissionContext, MissionEngine, Stars } from '../core/types';

export function quizStars(firstTry: number, total: number): Stars {
  const r = total === 0 ? 1 : firstTry / total;
  return r >= 1 ? 3 : r >= 0.6 ? 2 : 1;
}

/** 퀴즈: 한 문제씩. 틀리면 설명을 보고 다시 골라요. 처음에 맞힌 비율로 별을 줘요. */
export class QuizMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: QuizData;
  private index = 0;
  private firstTry = 0;
  private attempts = 0;
  private missed = false;

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'quiz' || !ctx.mission.data) return;
    this.ctx = ctx;
    this.data = ctx.mission.data;
    this.render();
  }

  private render(): void {
    const root = this.ctx.root;
    clear(root);
    const qs = this.data.questions;
    const q = qs[this.index];
    if (this.data.intro && this.index === 0) root.append(h('div', { class: 'mission-head' }, h('div', { class: 'mission-intro' }, ...lines(this.data.intro))));
    const say = h('div', { class: 'robi-say' }, pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, '알맞은 답을 골라요.'));
    const next = h('button', { class: 'btn primary', hidden: true }, this.index === qs.length - 1 ? '끝내기' : '다음 문제');
    next.addEventListener('click', () => {
      if (this.index === qs.length - 1) {
        this.ctx.finish({ success: true, stars: quizStars(this.firstTry, qs.length), attempts: this.attempts, hints: 0 });
        return;
      }
      this.index++;
      this.missed = false;
      this.render();
    });
    const choices = h('div', { class: 'choices' });
    q.choices.forEach((c, i) => {
      const btn = h('button', { class: 'choice' }, `${i + 1}. ${c}`);
      btn.addEventListener('click', () => {
        this.attempts++;
        const sayText = say.lastElementChild as HTMLElement;
        clear(sayText);
        if (i === q.answer) {
          if (!this.missed) this.firstTry++;
          btn.classList.add('ok');
          for (const b of choices.querySelectorAll('button')) b.disabled = true;
          say.className = 'robi-say good';
          sayText.append('맞았어요! ', ...lines(q.explain));
          this.ctx.sfx('success');
          next.hidden = false;
          next.focus();
        } else {
          this.missed = true;
          btn.classList.add('no');
          btn.disabled = true;
          say.className = 'robi-say bad';
          sayText.append('다시 생각해 봐요. ', ...lines(q.explain));
          this.ctx.sfx('fail');
        }
      });
      choices.append(btn);
    });
    root.append(
      h('div', { class: 'progress-dots' }, ...qs.map((_, i) => h('i', { class: i <= this.index ? 'on' : '' }))),
      h('div', { class: 'quiz-q' }, ...lines(q.q)),
      choices,
      h('div', { style: 'height:10px' }),
      say,
      h('div', { class: 'row end', style: 'margin-top:10px' }, next),
    );
  }
}
