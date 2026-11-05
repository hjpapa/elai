import { composePromptImage } from './image';
import { NPCS } from '../../data/npcs';
import type { PromptData, PromptSlotId } from '../../data/schema';
import { clear, h, lines, sleep } from '../../ui/dom';
import { pxImg } from '../../ui/icons';
import type { MissionContext, MissionEngine, Stars } from '../core/types';
import { evaluatePrompt, type PromptChoice, type PromptOutcome } from './evaluate';

const SLOT_NAME: Record<PromptSlotId, string> = { role: '누구처럼', task: '무엇을', how: '어떻게', format: '어떤 모양으로' };

/** 결과를 고른 모양(목록·문단·표·시)으로 그려요. */
function renderOutput(o: PromptOutcome): HTMLElement {
  const box = h('div', {}, h('div', { class: 'opening' }, o.opening));
  if (o.render === 'list') box.append(h('ol', {}, ...o.lines.map((l) => h('li', {}, l))));
  else if (o.render === 'table') {
    box.append(h('table', {}, ...o.lines.map((l, i) => h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, l)))));
  } else if (o.render === 'poem') {
    box.append(h('div', { class: 'poem' }, ...o.lines.flatMap((l) => [h('p', {}, `♪ ${l} ♪`), h('p', {}, '랄라라 랄라라, 노래는 계속돼요 ♪')])));
  } else box.append(h('p', {}, o.lines.join(' ')));
  return box;
}

/**
 * 글 주문서: 4칸(누구처럼·무엇을·어떻게·어떤 모양으로)을 채워 젠에게 부탁해요.
 * 칸이 빠지거나 맞지 않으면 결과에 그 문제가 그대로 나타나요. 고쳐서 다시 부탁해도 감점은 없어요.
 */
export class PromptMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: PromptData;
  private choice: PromptChoice = {};
  private attempts = 0;
  private best: Stars = 0;
  private firstTryPerfect = false;
  private alive = true;
  private readonly slotsEl = h('div');
  private readonly out = h('div', { class: 'zen-out' });
  private readonly feedback = h('div');
  private readonly ask = h('button', { class: 'btn primary' }, '젠에게 부탁하기');
  private readonly done = h('button', { class: 'btn accent', hidden: true }, '완료하기');

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'prompt' || !ctx.mission.data) return;
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
    this.out.append(h('p', { class: 'muted' }, '주문서를 채우고 부탁하면 여기에 젠의 답이 나와요.'));
    if (this.data.image && this.data.initialChoice) this.out.append(this.renderImage());
    ctx.root.append(h('p', { class: 'muted' }, ...lines('이름·주소·전화번호는 넣지 않아요.\n학교·얼굴 사진도 넣지 않아요.')), h('p', { class: 'muted' }, 'AI 도움을 받으면 밝혀요.'));
    ctx.root.append(
      h(
        'div',
        { class: 'prompt-wrap' },
        h(
          'div',
          {},
          h('div', { class: 'request' }, h('b', {}, `의뢰인: ${this.data.client}`), h('div', {}, ...lines(this.data.request))),
          this.slotsEl,
          h('div', { class: 'row end' }, this.ask),
        ),
        h(
          'div',
          {},
          h('div', { class: 'row', style: 'margin-bottom:6px' }, pxImg(ctx.icon(NPCS.zen.sprite, 0), 40), h('b', {}, '젠의 답')),
          this.out,
          this.feedback,
          h('div', { class: 'row end', style: 'margin-top:8px' }, this.done),
        ),
      ),
    );
    this.renderSlots();
  }

  unmount(): void {
    this.alive = false;
  }

  private renderSlots(): void {
    const focus = document.activeElement?.getAttribute('aria-label');
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
    if (focus) [...this.slotsEl.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === focus)?.focus();
  }

  private renderImage(): HTMLElement {
    const pixels = composePromptImage(this.data, this.choice);
    if (!pixels) return h('p', {}, '그림 자료를 다시 살펴봐요.');
    const canvas = h('canvas', { width: pixels[0].length, height: pixels.length, role: 'img', 'aria-label': '선택한 주문서의 픽셀 그림', style: 'width:256px;max-width:100%;height:auto;image-rendering:pixelated' });
    const drawing = canvas.getContext('2d');
    if (drawing) pixels.forEach((row, y) => row.forEach((color, x) => { if (color) { drawing.fillStyle = color; drawing.fillRect(x, y, 1, 1); } }));
    return h('figure', { style: 'margin:8px 0' }, canvas, h('figcaption', {}, '그림 주문서 연습 결과'));
  }

  private async request(): Promise<void> {
    this.attempts++;
    this.ask.disabled = true;
    clear(this.out);
    clear(this.feedback);
    this.out.append(h('p', { class: 'thinking' }, '젠이 생각하고 있어요'));
    await sleep(800);
    if (!this.alive) return;
    const o = evaluatePrompt(this.data, this.choice);
    clear(this.out);
    this.out.append(this.data.image ? this.renderImage() : renderOutput(o));
    const list = h('ul', { class: 'issues' });
    for (const i of o.issues) {
      list.append(h('li', { class: i.kind === 'privacy' ? 'privacy' : '' }, h('b', {}, this.data.image ? this.data.slots.find(slot => slot.id === i.slot)?.label ?? SLOT_NAME[i.slot] : SLOT_NAME[i.slot]), ...lines(i.text)));
    }
    if (o.success) {
      this.ctx.sfx('success');
      if (this.attempts === 1 && o.stars === 3) this.firstTryPerfect = true;
      this.best = Math.max(this.best, o.stars) as Stars;
      const msg = o.stars === 3 ? '완벽한 주문서예요! 의뢰인이 아주 좋아해요.' : '의뢰는 해결했어요. 젠의 설명을 보고 더 고쳐 볼까요?';
      this.feedback.append(h('div', { class: 'robi-say good', style: 'margin-top:8px' }, msg));
      this.done.hidden = false;
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
    if (o.issues.length) this.feedback.append(list);
    this.ask.disabled = false;
    this.ask.textContent = '고쳐서 다시 부탁하기';
  }
}
