import type { FactCheckData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { evaluateFactCheck, NO_SOURCE, type FactCheckAnswer } from './evaluate';

type Claim = FactCheckData['claims'][number];

/**
 * 자료를 읽고 맞는 말은 지키며, 틀린 말은 근거에 따라 고쳐요.
 * 두 답 비교(asks)가 있으면 같은 질문을 두 가지로 부탁한 답을 나란히 보고, 자료에 없는 말도 가려내요.
 */
export class FactCheckMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: FactCheckData;
  private answers: Record<string, FactCheckAnswer> = {};
  private readSources = new Set<string>();
  private openSources = new Set<string>();
  private compareAnswer: number | null = null;
  private attempts = 0;
  private hints = 0;
  private message = '';

  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'factCheck' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data; this.render();
  }

  private help(): void {
    this.hints++;
    const first = this.data.claims[0];
    const source = this.data.sources.find(item => item.id === first?.source);
    this.message = this.attempts >= 3 && source
      ? `첫 문장의 자료: ${source.title}\n읽고 고칠 말이 있는지 살펴봐요.`
      : this.data.hint;
  }

  /** 자료에 없는 말을 고를 수 있는 미션인지 */
  private get allowsNone(): boolean {
    return !!this.data.asks || this.data.claims.some(claim => claim.source === NO_SOURCE);
  }

  private claimCard(claim: Claim, number: number): HTMLElement {
    const d = this.data;
    const answer = this.answers[claim.id] ?? { choice: -1, source: '' };
    const card = h('fieldset', { style: 'min-width:0;margin:12px 0;padding:12px;border:1px solid #526078;border-radius:8px;overflow-wrap:anywhere' },
      h('legend', {}, '문장 ' + number), h('p', {}, claim.text));
    if (claim.visual) card.append(h('figure', { style: 'margin:8px 0' },
      h('img', { src: this.ctx.icon(claim.visual.key, claim.visual.frame ?? 0), alt: claim.visual.caption,
        style: 'display:block;width:160px;max-width:100%;height:auto;image-rendering:pixelated' }),
      h('figcaption', { class: 'muted' }, claim.visual.caption)));
    const choice = h('select', { 'aria-label': '문장 ' + number + ' 판단', style: 'width:100%;min-height:44px',
      onchange: (event: Event) => {
        const value = (event.target as HTMLSelectElement).value;
        this.answers[claim.id] = { ...answer, choice: value === '' ? -1 : Number(value) };
        this.render();
      },
    }, h('option', { value: '' }, '판단을 골라요'), ...claim.choices.map((text, i) => h('option', { value: String(i) }, text)));
    choice.value = answer.choice < 0 ? '' : String(answer.choice);
    card.append(h('label', { style: 'display:block' }, d.asks ? '이 문장은 자료와 비교하면 어떤가요?' : '문장을 어떻게 할까요?', choice));
    if (answer.choice >= 0 && claim.choices[answer.choice]) card.append(h('p', {}, '선택: ' + claim.choices[answer.choice]));
    const source = h('select', { 'aria-label': '문장 ' + number + ' 근거 자료', style: 'width:100%;min-height:44px',
      onchange: (event: Event) => { this.answers[claim.id] = { ...answer, source: (event.target as HTMLSelectElement).value }; this.render(); },
    }, h('option', { value: '' }, '근거 자료를 골라요'), ...d.sources.map(item => h('option', { value: item.id }, item.title)),
    ...(this.allowsNone ? [h('option', { value: NO_SOURCE, disabled: !d.sources.every(item => this.readSources.has(item.id)) }, '자료에서 찾을 수 없어요')] : []));
    source.value = answer.source;
    card.append(h('label', { style: 'display:block' }, '어떤 자료에서 확인했나요?', source));
    return card;
  }

  private render(): void {
    const root = this.ctx.root, d = this.data;
    const focus = document.activeElement?.getAttribute('aria-label');
    clear(root);
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)),
      h('h3', {}, '1. 자료 카드를 열어 읽어요.'),
      h('p', { class: 'muted' }, '이 게임 속 자료로 문장의 근거를 확인해요.'));
    for (const source of d.sources) {
      const open = this.openSources.has(source.id);
      const panelId = 'fact-source-' + source.id;
      const button = h('button', {
        class: 'btn', style: 'white-space:normal;text-align:left;min-height:44px;width:100%',
        'aria-label': '자료 열기: ' + source.title, 'aria-expanded': String(open), 'aria-controls': panelId,
        onclick: () => {
          if (open) this.openSources.delete(source.id);
          else { this.openSources.add(source.id); this.readSources.add(source.id); }
          this.ctx.sfx('click'); this.render();
        },
      }, source.title, this.readSources.has(source.id) ? ' · 읽었어요' : ' · 열어 보기');
      root.append(h('section', { style: 'margin-bottom:8px' }, button,
        h('div', { id: panelId, hidden: !open, style: 'padding:12px;overflow-wrap:anywhere' }, ...lines(source.text))));
    }
    if (d.asks) {
      root.append(h('h3', {}, '2. 두 답의 문장을 자료와 비교해요.'),
        h('p', {}, '자료를 모두 읽으면 "자료에서 찾을 수 없어요"를 고를 수 있어요.'));
      let number = 0;
      for (const ask of d.asks) {
        const group = h('section', { class: 'ask-answer', 'aria-label': ask.label },
          h('h4', {}, ask.label), h('p', { class: 'ask-prompt' }, '부탁: “', ...lines(ask.prompt), '”'));
        for (const claim of d.claims.filter(c => c.ask === ask.id)) group.append(this.claimCard(claim, ++number));
        root.append(group);
      }
      if (d.compare) {
        root.append(h('h3', {}, '3. 두 답을 비교해요.'), h('p', {}, d.compare.q));
        d.compare.choices.forEach((text, i) => root.append(h('button', { class: 'choice', 'aria-label': text, 'aria-pressed': this.compareAnswer === i ? 'true' : 'false', onclick: () => { this.compareAnswer = i; this.render(); } }, text)));
      }
    } else {
      root.append(h('h3', {}, '2. 문장을 판단하고 근거를 골라요.'),
        h('p', {}, '맞는 말은 그대로 두고, 틀린 말만 고쳐요.'));
      d.claims.forEach((claim, index) => root.append(this.claimCard(claim, index + 1)));
    }
    if (this.message) root.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.message)));
    root.append(h('div', { class: 'row end' },
      h('button', { class: 'btn', 'aria-label': '힌트', onclick: () => { this.help(); this.render(); } }, '힌트'),
      h('button', { class: 'btn primary', 'aria-label': '근거와 문장 확인', onclick: () => this.verify() }, '근거와 문장 확인')));
    if (focus) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === focus)?.focus();
  }

  private verify(): void {
    this.attempts++;
    if (evaluateFactCheck(this.data, this.answers, [...this.readSources], this.compareAnswer)) {
      this.ctx.sfx('success');
      this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints });
      return;
    }
    this.ctx.sfx('fail');
    this.message = this.data.asks
      ? '자료를 모두 열어 문장의 근거를 봐요.\n비교 질문의 답도 다시 살펴봐요.'
      : '자료를 열어 문장의 근거를 봐요.\n맞는 말은 그대로 두어도 돼요.';
    if (this.attempts >= 2) this.help();
    this.render();
  }
}
