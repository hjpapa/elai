import { NPCS } from '../../data/npcs';
import type { PromptCriterion, PromptData, PromptSlotId } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MissionContext, MissionEngine, Stars } from '../core/types';
import { checkCriteriaPick, criteriaResults, evaluatePrompt, type CriterionResult, type PromptChoice, type PromptOutcome } from './evaluate';
import { PromptDiagnose } from './PromptDiagnose';
import { renderOutput, renderPromptImage } from './render';

export const SLOT_NAME: Record<PromptSlotId, string> = { role: '누구처럼', task: '무엇을', how: '어떻게', format: '어떤 모양으로' };

/** 다시 그린 뒤에도 같은 단추에 초점이 남게 해요. */
export function keepFocus(container: HTMLElement, draw: () => void): void {
  const focus = document.activeElement?.getAttribute('aria-label');
  draw();
  if (focus) [...container.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === focus)?.focus();
}

/** ○·× 두 단추(맞음·아님 고르기) */
function markButtons(label: string, value: boolean | undefined, set: (v: boolean) => void, yes: string, no: string): HTMLElement {
  return h('span', { class: 'mark-pair', role: 'group', 'aria-label': label },
    h('button', { class: `chip ${value === true ? 'on' : ''}`, 'aria-label': `${label}: ${yes}`, 'aria-pressed': String(value === true), onclick: () => set(true) }, '○ ' + yes),
    h('button', { class: `chip ${value === false ? 'on' : ''}`, 'aria-label': `${label}: ${no}`, 'aria-pressed': String(value === false), onclick: () => set(false) }, '× ' + no));
}

interface PendingAnswer {
  outcome: PromptOutcome;
  results: CriterionResult[];
  predicted: Record<string, boolean | undefined>;
}

/**
 * 글 주문서: 4칸(누구처럼·무엇을·어떻게·어떤 모양으로)을 채워 젠에게 부탁해요.
 * 칸이 빠지거나 맞지 않으면 결과에 그 문제가 그대로 나타나요. 고쳐서 다시 부탁해도 감점은 없어요.
 * 기준표가 있으면: 의뢰문에서 좋은 답의 조건을 고르고 → 답을 예상하고 → 답을 받으면 학생이 먼저 확인한 뒤 젠의 판정과 비교해요.
 * 원인 찾기(diagnose)가 있으면 PromptDiagnose 화면을 써요.
 */
export class PromptMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: PromptData;
  private inner: MissionEngine | null = null;
  private choice: PromptChoice = {};
  private attempts = 0;
  private best: Stars = 0;
  private firstTryPerfect = false;
  private alive = true;
  /* 기준표 */
  private picked = new Set<string>();
  private criteriaSet = false;
  private criteriaNote = '';
  private predict: Record<string, boolean | undefined> = {};
  private predictNote = '';
  private self: Record<string, boolean | undefined> = {};
  private judged = false;
  private pending: PendingAnswer | null = null;

  private readonly criteriaEl = h('div');
  private readonly slotsEl = h('div');
  private readonly predictEl = h('div');
  private readonly out = h('div', { class: 'zen-out' });
  private readonly checkEl = h('div');
  private readonly feedback = h('div');
  private readonly ask = h('button', { class: 'btn primary' }, '젠에게 부탁하기');
  private readonly done = h('button', { class: 'btn accent', hidden: true }, '완료하기');

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'prompt' || !ctx.mission.data) return;
    if (ctx.mission.data.diagnose) {
      this.inner = new PromptDiagnose();
      this.inner.mount(ctx);
      return;
    }
    this.ctx = ctx;
    this.data = ctx.mission.data;
    this.choice = { ...this.data.initialChoice };
    this.ask.addEventListener('click', () => void this.request());
    this.done.addEventListener('click', () =>
      ctx.finish({
        success: true,
        stars: this.best,
        attempts: this.attempts,
        hints: 0,
        bonus: this.firstTryPerfect ? '한 번에 성공! 주문서 장인' : undefined,
      }),
    );
    clear(this.out);
    this.out.append(h('p', { class: 'muted' }, this.cards.length ? '조건을 고르고 주문서를 채운 뒤 부탁해요.' : '주문서를 채우고 부탁하면 여기에 젠의 답이 나와요.'));
    if (this.data.image && this.data.initialChoice) this.out.append(renderPromptImage(this.data, this.choice));
    ctx.root.append(h('p', { class: 'muted' }, ...lines('이름·주소·전화번호는 넣지 않아요.\n학교·얼굴 사진도 넣지 않아요.')), h('p', { class: 'muted' }, 'AI 도움을 받으면 밝혀요.'));
    ctx.root.append(
      h(
        'div',
        { class: 'prompt-wrap' },
        h(
          'div',
          {},
          h('div', { class: 'request' }, h('b', {}, `의뢰인: ${this.data.client}`), h('div', {}, ...lines(this.data.request))),
          this.criteriaEl,
          this.slotsEl,
          this.predictEl,
          h('div', { class: 'row end' }, this.ask),
        ),
        h(
          'div',
          {},
          h('div', { class: 'row', style: 'margin-bottom:6px' }, pxImg(ctx.icon(NPCS.zen.sprite, 0), 40), h('b', {}, '젠의 답')),
          this.out,
          this.checkEl,
          this.feedback,
          h('div', { class: 'row end', style: 'margin-top:8px' }, this.done),
        ),
      ),
    );
    this.renderCriteria();
    this.renderSlots();
    this.renderPredict();
  }

  unmount(): void {
    this.alive = false;
    this.inner?.unmount?.();
  }

  private get cards(): PromptCriterion[] {
    return this.data.criteria?.cards ?? [];
  }

  private get wanted(): PromptCriterion[] {
    return this.cards.filter((c) => c.wanted);
  }

  private renderSlots(): void {
    keepFocus(this.slotsEl, () => {
      clear(this.slotsEl);
      for (const slot of this.data.slots) {
        const row = h('div', { class: 'row' });
        for (const opt of slot.options) {
          const on = this.choice[slot.id] === opt.id;
          row.append(
            h(
              'button',
              {
                class: `chip ${on ? 'on' : ''}`,
                'aria-label': slot.label + ': ' + opt.text,
                'aria-pressed': on ? 'true' : 'false',
                onclick: () => {
                  // 같은 칩을 다시 누르면 칸을 비워요.
                  this.choice[slot.id] = on ? undefined : opt.id;
                  this.ctx.sfx('click');
                  this.renderSlots();
                },
              },
              opt.text,
            ),
          );
        }
        this.slotsEl.append(
          h('div', { class: 'order-slot' }, h('span', { class: 'lbl' }, slot.label), h('span', { class: 'q' }, slot.question), row),
        );
      }
    });
  }

  /** 1단계: 의뢰문에서 좋은 답의 조건 고르기 */
  private renderCriteria(): void {
    if (!this.cards.length) return;
    keepFocus(this.criteriaEl, () => {
      clear(this.criteriaEl);
      const box = h('div', { class: 'order-slot criteria' }, h('span', { class: 'lbl' }, '좋은 답의 조건'),
        h('span', { class: 'q' }, this.criteriaSet ? '의뢰문에서 고른 조건이에요.' : '의뢰문에 들어 있는 조건을 모두 골라요.'));
      if (this.criteriaSet) box.append(h('ul', { class: 'criteria-list' }, ...this.wanted.map((c) => h('li', {}, c.text))));
      else {
        const row = h('div', { class: 'row' });
        for (const card of this.cards) {
          const on = this.picked.has(card.id);
          row.append(h('button', { class: `chip ${on ? 'on' : ''}`, 'aria-label': '조건: ' + card.text, 'aria-pressed': String(on), onclick: () => {
            if (on) this.picked.delete(card.id); else this.picked.add(card.id);
            this.ctx.sfx('click');
            this.renderCriteria();
          } }, card.text));
        }
        box.append(row, h('div', { class: 'row end' }, h('button', { class: 'btn', 'aria-label': '조건 확인', onclick: () => this.confirmCriteria() }, '조건 확인')));
      }
      if (this.criteriaNote) box.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.criteriaNote)));
      this.criteriaEl.append(box);
    });
  }

  private confirmCriteria(): void {
    const r = checkCriteriaPick(this.data, [...this.picked]);
    if (r.ok) {
      this.criteriaSet = true;
      this.criteriaNote = '좋아요! 이 조건으로 답을 살펴봐요.\n이제 주문서를 채워요.';
      this.ctx.sfx('success');
    } else {
      const wrong = this.cards.filter((c) => r.wrong.includes(c.id)).map((c) => c.feedback);
      this.criteriaNote = [...wrong, r.missing.length ? `의뢰문에 조건이 ${r.missing.length}개 더 있어요.` : ''].filter(Boolean).join('\n');
      this.ctx.sfx('fail');
    }
    this.renderCriteria();
    this.renderPredict();
  }

  /** 2단계: 부탁하기 전에 답 예상하기 */
  private renderPredict(): void {
    if (!this.cards.length) return;
    keepFocus(this.predictEl, () => {
      clear(this.predictEl);
      if (!this.criteriaSet) return;
      const box = h('div', { class: 'order-slot predict' }, h('span', { class: 'lbl' }, '답 예상하기'), h('span', { class: 'q' }, '이 주문서로 부탁하면 조건을 지킬까요?'));
      for (const card of this.wanted) {
        box.append(h('div', { class: 'mark-row' }, h('span', {}, card.text),
          markButtons(card.text + ' 예상', this.predict[card.id], (v) => { this.predict[card.id] = v; this.predictNote = ''; this.renderPredict(); }, '지킬 거예요', '못 지킬 거예요')));
      }
      if (this.predictNote) box.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.predictNote)));
      this.predictEl.append(box);
    });
  }

  /** 3단계: 답을 받으면 학생이 먼저 확인하고, 젠의 판정과 비교해요. */
  private renderCheck(note = ''): void {
    keepFocus(this.checkEl, () => {
      clear(this.checkEl);
      const p = this.pending;
      if (!p) return;
      const box = h('div', { class: 'order-slot check' }, h('span', { class: 'lbl' }, '답 확인하기'),
        h('span', { class: 'q' }, this.judged ? '내 판단과 젠의 판정을 비교해요.' : '답을 읽고 조건을 지켰는지 표시해요.'));
      if (this.judged) {
        const same = this.wanted.filter((c) => this.self[c.id] === p.results.find((r) => r.id === c.id)?.met).length;
        const guessed = this.wanted.filter((c) => p.predicted[c.id] === p.results.find((r) => r.id === c.id)?.met).length;
        box.append(h('p', {}, `내 판단이 맞은 조건 ${same}/${this.wanted.length} · 예상이 맞은 조건 ${guessed}/${this.wanted.length}`));
      }
      for (const card of this.wanted) {
        const actual = p.results.find((r) => r.id === card.id)?.met ?? false;
        const mine = this.self[card.id];
        const row = h('div', { class: 'mark-row' }, h('span', {}, card.text));
        if (!this.judged) row.append(markButtons(card.text + ' 확인', mine, (v) => { this.self[card.id] = v; this.renderCheck(); }, '지켰어요', '못 지켰어요'));
        else {
          row.append(
            h('span', { class: mine === actual ? 'mark-ok' : 'mark-no' }, `${actual ? '○ 지켰어요' : '× 못 지켰어요'} · ${mine === actual ? '내 판단과 같아요' : '내 판단과 달라요'}`),
            h('small', { class: 'muted' }, p.predicted[card.id] === actual ? '예상이 맞았어요.' : '예상과 달랐어요.'),
          );
          if (!actual) row.append(h('small', {}, ...lines(card.feedback)));
          else if (mine !== actual) row.append(h('small', {}, '답에서 다시 찾아봐요. 이 조건은 지켜졌어요.'));
        }
        box.append(row);
      }
      if (!this.judged) box.append(h('div', { class: 'row end' }, h('button', { class: 'btn primary', 'aria-label': '판정 비교', onclick: () => this.judge() }, '판정 비교')));
      if (note) box.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(note)));
      this.checkEl.append(box);
    });
  }

  private judge(): void {
    const p = this.pending;
    if (!p) return;
    if (this.wanted.some((c) => this.self[c.id] === undefined)) {
      this.renderCheck('조건마다 지켰는지 표시해요.');
      return;
    }
    this.judged = true;
    this.predict = {};
    this.renderCheck();
    this.renderPredict();
    this.reveal(p.outcome, p.results.every((r) => r.met));
  }

  private async request(): Promise<void> {
    if (this.cards.length) {
      if (!this.criteriaSet) {
        this.criteriaNote = '먼저 좋은 답의 조건을 골라요.';
        this.renderCriteria();
        return;
      }
      if (this.pending && !this.judged) {
        this.renderCheck('먼저 이 답을 확인해요.');
        return;
      }
      if (this.wanted.some((c) => this.predict[c.id] === undefined)) {
        this.predictNote = '조건마다 답을 예상해요.';
        this.renderPredict();
        return;
      }
    }
    this.attempts++;
    this.ask.disabled = true;
    clear(this.out);
    clear(this.feedback);
    if (this.cards.length) {
      clear(this.checkEl);
      this.done.hidden = true;
    }
    this.out.append(h('p', { class: 'thinking' }, '젠이 생각하고 있어요'));
    await sleep(800);
    if (!this.alive) return;
    const o = evaluatePrompt(this.data, this.choice);
    clear(this.out);
    this.out.append(this.data.image ? renderPromptImage(this.data, this.choice) : renderOutput(o));
    if (this.cards.length) {
      this.pending = { outcome: o, results: criteriaResults(this.data, this.choice, o), predicted: { ...this.predict } };
      this.self = {};
      this.judged = false;
      this.renderCheck();
    } else this.reveal(o);
    this.ask.disabled = false;
    this.ask.textContent = '고쳐서 다시 부탁하기';
  }

  /** 젠의 설명과 성공 여부를 보여 줘요. 기준표가 있으면 조건을 모두 지켜야 완료할 수 있어요. */
  private reveal(o: PromptOutcome, criteriaMet = true): void {
    clear(this.feedback);
    const list = h('ul', { class: 'issues' });
    for (const i of o.issues) {
      list.append(h('li', { class: i.kind === 'privacy' ? 'privacy' : '' }, h('b', {}, this.data.image ? this.data.slots.find(slot => slot.id === i.slot)?.label ?? SLOT_NAME[i.slot] : SLOT_NAME[i.slot]), ...lines(i.text)));
    }
    if (o.success && !criteriaMet) {
      this.ctx.sfx('fail');
      this.feedback.append(h('div', { class: 'robi-say bad', style: 'margin-top:8px' }, ...lines('못 지킨 조건이 있어요.\n그 조건에 맞게 고쳐 부탁해요.')));
    } else if (o.success) {
      this.ctx.sfx('success');
      if (this.attempts === 1 && o.stars === 3) this.firstTryPerfect = true;
      this.best = Math.max(this.best, o.stars) as Stars;
      const msg = o.stars === 3 ? '완벽한 주문서예요! 의뢰인이 아주 좋아해요.' : '의뢰는 해결했어요. 젠의 설명을 보고 더 고쳐 볼까요?';
      this.feedback.append(h('div', { class: 'robi-say good', style: 'margin-top:8px' }, msg));
    } else {
      this.ctx.sfx('fail');
      this.feedback.append(
        h(
          'div',
          { class: 'robi-say bad', style: 'margin-top:8px' },
          o.privacy ? '개인정보가 들어가서 부탁할 수 없어요. 주문서를 고쳐요.' : '의뢰의 조건과 달라요.\n주문서를 고쳐 다시 부탁해 봐요.',
        ),
      );
    }
    if (this.best > 0) this.done.hidden = false;
    if (o.issues.length) this.feedback.append(list);
  }
}
