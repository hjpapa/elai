import type { NextWordData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { contextWords, evaluateNextWord, nextWords, nextWordViews, sampleSteps, type NextWordView } from './evaluate';

const percent = (p: number) => Math.round(p * 100) + '%';

export class NextWordMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: NextWordData;
  private views: NextWordView[] = [];
  private active = 0;
  private stories: Record<string, string[]> = {};
  private answer: number | null = null;
  private sampleAnswer: number | null = null;
  private attempts = 0;
  private hints = 0;
  private message = '';
  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'nextWord' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data; this.views = nextWordViews(this.data); this.render();
  }
  private help(): void {
    this.hints++;
    const first = this.views[0], word = first && nextWords(first.corpus.sentences, this.data.start)[0]?.word;
    this.message = this.attempts >= 3 && word ? '첫 탭에서 ' + word + '부터 골라요.\n다른 탭으로도 이어 봐요.' : this.data.hint;
  }
  /** 같은 시작으로 젠이 미리 이어 쓴 답: 낱말마다 그때의 비율을 붙여요. */
  private renderSamples(root: HTMLElement): void {
    const rule = this.data.samples;
    if (!rule) return;
    root.append(h('h3', {}, '젠이 같은 시작으로 이어 쓴 답'), h('div', { class: 'mission-intro' }, ...lines(rule.intro)));
    for (const sample of rule.answers) {
      const steps = sampleSteps(this.data, sample) ?? [];
      const rare = steps.filter(s => !s.top).map(s => s.word);
      const words = [h('span', {}, sample.words[0]), ...steps.flatMap(s => [' ',
        h('span', { class: s.top ? 'word-step' : 'word-step rare' }, s.word, h('small', {}, ' ' + percent(s.probability)))])];
      root.append(h('div', { class: 'word-sample', role: 'group', 'aria-label': sample.label + ': ' + sample.words.join(' ') + (rare.length ? ' · 덜 나온 말: ' + rare.join(', ') : ' · 모두 가장 많이 나온 말') },
        h('b', {}, sample.label), h('p', {}, ...words)));
    }
    root.append(h('p', { class: 'muted' }, '밑줄 친 낱말은 그때 덜 나온 말이에요.\n숫자는 그 앞말 뒤에 나온 비율이에요.'), h('p', {}, rule.question.q));
    rule.question.choices.forEach((text, i) => root.append(h('button', { class: 'choice', 'aria-label': text, 'aria-pressed': this.sampleAnswer === i ? 'true' : 'false', onclick: () => { this.sampleAnswer = i; this.render(); } }, text)));
  }
  private render(followWord = false): void {
    const root = this.ctx.root, d = this.data, view = this.views[this.active];
    const focus = document.activeElement?.getAttribute('aria-label'); clear(root);
    if (!view) return;
    const corpus = view.corpus;
    const words = this.stories[view.id] ??= [d.start];
    const byWindow = this.views.some(v => v.window !== view.window);
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)), h('p', {}, '이 화면은 작은 글 모음으로 연습해요.'));
    const tabs = h('div', { class: 'row' });
    this.views.forEach((v, i) => tabs.append(h('button', { class: this.active === i ? 'btn primary' : 'btn', 'aria-label': v.label, 'aria-pressed': this.active === i ? 'true' : 'false', onclick: () => { this.active = i; this.message = ''; this.render(); } }, v.label + ((this.stories[v.id]?.length ?? 0) >= d.steps + 1 ? ' ✓' : ''))));
    root.append(tabs);
    root.append(h('details', {}, h('summary', {}, '글 모음 보기'), ...corpus.sentences.map(text => h('p', {}, text))));
    root.append(h('h3', {}, '지금 만든 문장'), h('p', { class: 'robi-say' }, words.join(' ')), h('p', {}, '고른 낱말: ' + (words.length - 1) + '/' + d.steps));
    const context = contextWords(words, view.window);
    if (byWindow) root.append(h('p', {}, h('b', {}, '젠이 보는 앞말: '), context.join(' ') + ` (${context.length}개)`));
    const candidates = nextWords(corpus.sentences, context);
    root.append(h('h3', {}, byWindow ? '이 앞말 뒤에 온 말의 횟수' : '다음에 온 말의 횟수'));
    for (const c of candidates) root.append(h('div', {},
      h('button', { class: 'choice', 'aria-label': c.word + ' 고르기', disabled: words.length > d.steps, onclick: () => { this.stories[view.id] = [...words, c.word]; this.render(true); } }, c.word + ' · ' + c.count + '회 (' + percent(c.probability) + ')'),
      h('div', { role: 'img', 'aria-label': c.word + ' ' + c.count + '회', style: 'height:14px;background:#388e9e;width:' + c.probability * 100 + '%' })));
    if (!candidates.length) root.append(h('p', {}, '이 말 뒤의 기록은 없어요.'));
    root.append(h('button', { class: 'btn', 'aria-label': '문장 다시 잇기', onclick: () => { this.stories[view.id] = [d.start]; this.render(); } }, '문장 다시 잇기'),
      h('p', {}, byWindow ? '탭마다 문장을 이어 보고 답해요.' : '두 글 모음을 각각 이어 보고 답해요.'), h('p', {}, d.question.q));
    d.question.choices.forEach((text, i) => root.append(h('button', { class: 'choice', 'aria-label': text, 'aria-pressed': this.answer === i ? 'true' : 'false', onclick: () => { this.answer = i; this.render(); } }, text)));
    this.renderSamples(root);
    root.append(h('p', { class: 'muted' }, '많이 나온 말도 사실과 다를 수 있어요.\n믿을 만한 자료로 확인해요.'));
    if (this.message) root.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.message)));
    root.append(h('div', { class: 'row end' }, h('button', { class: 'btn', 'aria-label': '힌트', onclick: () => { this.help(); this.render(); } }, '힌트'),
      h('button', { class: 'btn primary', 'aria-label': '생성 결과 확인', onclick: () => {
        this.attempts++;
        if (evaluateNextWord(d, this.stories, this.answer, this.sampleAnswer)) { this.ctx.sfx('success'); this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints }); return; }
        this.ctx.sfx('fail'); this.message = (byWindow ? '탭마다 문장을 끝까지 이어 봐요.' : '두 글 모음의 문장을 이어 봐요.') + '\n질문의 답도 다시 살펴봐요.';
        if (this.attempts >= 2) this.help(); this.render();
      } }, '생성 결과 확인')));
    const nextView = this.views.find(v => v.id !== view.id && (this.stories[v.id]?.length ?? 0) < d.steps + 1);
    const nextLabel = followWord ? (words.length <= d.steps && candidates[0] ? candidates[0].word + ' 고르기' : nextView?.label ?? d.question.choices[0]) : focus;
    if (nextLabel) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === nextLabel)?.focus();
  }
}
