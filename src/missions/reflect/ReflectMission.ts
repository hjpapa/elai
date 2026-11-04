import type { ReflectData } from '../../data/schema';
import { append, clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import { starsByAttempts } from '../sequence/SequenceMission';
import type { MissionContext, MissionEngine } from '../core/types';

/** 로비에게 설명하기: 맞는 설명 문장을 모두 골라요. */
export class ReflectMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: ReflectData;
  private picked = new Set<number>();
  private attempts = 0;
  private alive = true;

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'reflect' || !ctx.mission.data) return;
    this.ctx = ctx;
    this.data = ctx.mission.data;
    this.render();
  }

  unmount(): void {
    this.alive = false;
  }

  private render(marks: Map<number, 'ok' | 'no'> = new Map(), message = '', mood = ''): void {
    const root = this.ctx.root;
    clear(root);
    const list = h('div', {});
    this.data.sentences.forEach((s, i) => {
      const on = this.picked.has(i);
      list.append(
        h(
          'button',
          {
            class: `card ${on ? 'ok' : ''} ${marks.get(i) === 'no' ? 'no' : ''}`,
            'aria-pressed': on ? 'true' : 'false',
            onclick: () => {
              if (on) this.picked.delete(i);
              else this.picked.add(i);
              this.ctx.sfx('click');
              this.render();
            },
          },
          on ? '☑ ' : '☐ ',
          s.text,
        ),
      );
    });
    const send = h('button', { class: 'btn primary', onclick: () => void this.verify(), disabled: this.picked.size === 0 }, '로비에게 설명하기');
    append(root, [
      h('div', { class: 'mission-head' }, pxImg(this.ctx.icon('char-robi', 0), 56), h('div', { class: 'mission-intro' }, ...lines(this.data.prompt))),
      list,
      message ? h('div', { class: `robi-say ${mood}` }, pxImg(this.ctx.icon('char-robi', 0), 40), h('div', {}, ...lines(message))) : null,
      h('div', { class: 'row end', style: 'margin-top:10px' }, send),
    ]);
  }

  private async verify(): Promise<void> {
    this.attempts++;
    const s = this.data.sentences;
    const wrong = [...this.picked].filter((i) => !s[i].correct);
    const missing = s.filter((x, i) => x.correct && !this.picked.has(i)).length;
    if (wrong.length === 0 && missing === 0) {
      this.ctx.sfx('success');
      this.render(new Map(), '고마워요! 이제 저도 확실히 알겠어요. 삐빅!', 'good');
      await sleep(1000);
      if (this.alive) this.ctx.finish({ success: true, stars: starsByAttempts(this.attempts), attempts: this.attempts, hints: 0 });
      return;
    }
    this.ctx.sfx('fail');
    const parts: string[] = [];
    if (wrong.length) parts.push(`빨간 문장 ${wrong.length}개는 맞지 않아요.`);
    if (missing) parts.push(`맞는 문장이 ${missing}개 더 있어요.`);
    this.render(new Map(wrong.map((i) => [i, 'no'] as [number, 'no'])), `음… ${parts.join(' ')}`, 'bad');
  }
}
