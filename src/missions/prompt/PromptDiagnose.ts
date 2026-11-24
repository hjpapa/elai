import { NPCS } from '../../data/npcs';
import type { PromptData, PromptFollowUp, PromptSlotId } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MissionContext, MissionEngine, Stars } from '../core/types';
import { applyFollowUp, changedSlots, checkCause, evaluatePrompt, problemSlots, type PromptChoice } from './evaluate';
import { renderOutput, renderPromptImage } from './render';

/**
 * 원인 찾기: 친구의 주문서는 가려 두고 젠의 답만 보여 줘요.
 * 1) 답을 보고 문제 칸을 찾고 2) 고쳐 묻는 말을 골라요. 막연한 말은 문제 칸을 고치지 못해요.
 * 고쳐 묻기는 감점하지 않고, 별은 원인을 몇 번 만에 찾았는지로 정해요.
 */
export class PromptDiagnose implements MissionEngine {
  private ctx!: MissionContext;
  private data!: PromptData;
  private hidden: PromptChoice = {};
  private choice: PromptChoice = {};
  private picked = new Set<PromptSlotId>();
  private found = false;
  private causeTries = 0;
  private fixes = 0;
  private hints = 0;
  private note = '';
  private log: string[] = [];
  private busy = false;
  private alive = true;

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'prompt' || !ctx.mission.data?.diagnose) return;
    this.ctx = ctx;
    this.data = ctx.mission.data;
    this.hidden = { ...ctx.mission.data.diagnose.hidden };
    this.choice = { ...this.hidden };
    this.render();
  }

  unmount(): void {
    this.alive = false;
  }

  private label(id: PromptSlotId): string {
    return this.data.slots.find((s) => s.id === id)?.label ?? id;
  }

  private optionText(id: PromptSlotId, choice: PromptChoice): string {
    return this.data.slots.find((s) => s.id === id)?.options.find((o) => o.id === choice[id])?.text ?? '(비어 있어요)';
  }

  private get solved(): boolean {
    return this.found && problemSlots(this.data, this.choice).length === 0;
  }

  private checkCause(): void {
    this.causeTries++;
    const r = checkCause(this.data, [...this.picked]);
    if (r.ok) {
      this.found = true;
      const labels = this.data.slots.filter((s) => this.picked.has(s.id)).map((s) => `'${s.label}'`).join(', ');
      this.note = `맞아요! ${labels} 칸이 문제예요.\n어떻게 고쳐 물을지 골라요.`;
      this.ctx.sfx('success');
    } else {
      const parts = [
        ...r.wrong.map((id) => `'${this.label(id)}' 칸은 의뢰와 맞아요.`),
        r.missing.length ? `문제 칸이 ${r.missing.length}개 더 있어요.` : '',
      ].filter(Boolean);
      if (this.causeTries >= 2 && this.data.diagnose) {
        if (!this.hints) this.hints = 1;
        parts.push(this.data.diagnose.hint);
      }
      this.note = parts.join('\n');
      this.ctx.sfx('fail');
    }
    this.render();
  }

  private async fix(f: PromptFollowUp): Promise<void> {
    if (this.busy || this.solved) return;
    this.busy = true;
    this.fixes++;
    this.note = '';
    this.render(true);
    await sleep(600);
    if (!this.alive) return;
    const before = this.choice;
    this.choice = applyFollowUp(before, f);
    const changed = changedSlots(this.data, before, this.choice);
    const where = changed.length ? `바뀐 칸: ${changed.map((id) => this.label(id)).join(', ')}` : '바뀐 칸이 없어요';
    this.log.push(`“${f.text}” → ${where}`);
    this.busy = false;
    if (this.solved) {
      this.note = `${f.feedback}\n의뢰를 해결했어요! 고친 주문서를 살펴봐요.`;
      this.ctx.sfx('success');
    } else {
      this.note = `${f.feedback}\n${changed.length ? where + '.' : '같은 답이 다시 나왔어요.'}`;
      this.ctx.sfx(changed.length ? 'click' : 'fail');
    }
    this.render();
  }

  private render(thinking = false): void {
    const root = this.ctx.root, d = this.data, rule = d.diagnose;
    if (!rule) return;
    const focus = document.activeElement?.getAttribute('aria-label');
    clear(root);
    const outcome = evaluatePrompt(d, this.choice);
    const answer = h('div', { class: 'zen-out' });
    if (thinking) answer.append(h('p', { class: 'thinking' }, '젠이 다시 쓰고 있어요'));
    else answer.append(d.image ? renderPromptImage(d, this.choice) : renderOutput(outcome));

    const sheet = this.solved
      ? h('div', { class: 'order-slot' }, h('span', { class: 'lbl' }, '고친 주문서'),
        h('table', { class: 'sheet-compare' },
          h('tr', {}, h('th', {}, '칸'), h('th', {}, '처음'), h('th', {}, '고친 뒤')),
          ...d.slots.map((s) => h('tr', {}, h('td', {}, s.label), h('td', {}, this.optionText(s.id, this.hidden)), h('td', {}, this.optionText(s.id, this.choice))))))
      : h('div', { class: 'order-slot hidden-sheet' }, h('span', { class: 'lbl' }, '가려진 주문서'), h('p', { class: 'muted' }, ...lines('친구가 쓴 주문서는 가려져 있어요.\n젠의 답을 보고 문제를 찾아요.')));

    root.append(
      h('p', { class: 'muted' }, ...lines('이름·주소·전화번호는 넣지 않아요.\n학교·얼굴 사진도 넣지 않아요.')),
      h('div', { class: 'mission-intro' }, ...lines(rule.intro)),
      h('div', { class: 'prompt-wrap' },
        h('div', {}, h('div', { class: 'request' }, h('b', {}, `의뢰인: ${d.client}`), h('div', {}, ...lines(d.request))), sheet),
        h('div', {}, h('div', { class: 'row', style: 'margin-bottom:6px' }, pxImg(this.ctx.icon(NPCS.zen.sprite, 0), 40), h('b', {}, '젠의 답')), answer)),
    );

    const cause = h('div', { class: 'order-slot' }, h('span', { class: 'lbl' }, '1. 원인 찾기'), h('span', { class: 'q' }, '어느 칸 때문에 이런 답이 나왔을까요? 모두 골라요.'));
    const chips = h('div', { class: 'row' });
    for (const slot of d.slots) {
      const on = this.picked.has(slot.id);
      chips.append(h('button', { class: `chip ${on ? 'on' : ''}`, 'aria-label': '원인: ' + slot.label, 'aria-pressed': String(on), disabled: this.found, onclick: () => {
        if (on) this.picked.delete(slot.id); else this.picked.add(slot.id);
        this.ctx.sfx('click');
        this.render();
      } }, slot.label));
    }
    cause.append(chips);
    if (!this.found) cause.append(h('div', { class: 'row end' }, h('button', { class: 'btn primary', 'aria-label': '원인 확인', disabled: !this.picked.size, onclick: () => this.checkCause() }, '원인 확인')));
    root.append(cause);

    if (this.found) {
      const fix = h('div', { class: 'order-slot' }, h('span', { class: 'lbl' }, '2. 고쳐 묻기'), h('span', { class: 'q' }, '젠에게 어떻게 다시 부탁할까요?'));
      const options = h('div', { class: 'choices' });
      for (const f of rule.followUps) options.append(h('button', { class: 'choice', 'aria-label': '고쳐 묻기: ' + f.text, disabled: this.busy || this.solved, onclick: () => void this.fix(f) }, `“${f.text}”`));
      fix.append(options);
      if (this.log.length) fix.append(h('ul', { class: 'issues fix-log' }, ...this.log.map((line) => h('li', {}, line))));
      root.append(fix);
    }
    if (this.note) root.append(h('div', { class: `robi-say ${this.solved ? 'good' : ''}`, role: 'status' }, ...lines(this.note)));
    if (this.solved) {
      if (d.explain) root.append(h('p', { class: 'muted' }, ...lines(d.explain)));
      root.append(h('div', { class: 'row end' }, h('button', { class: 'btn accent', 'aria-label': '완료하기', onclick: () => {
        const stars: Stars = this.causeTries <= 1 ? 3 : this.causeTries === 2 ? 2 : 1;
        this.ctx.finish({ success: true, stars, attempts: this.causeTries + this.fixes, hints: this.hints });
      } }, '완료하기')));
    }
    if (focus) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find((el) => el.getAttribute('aria-label') === focus)?.focus();
  }
}
