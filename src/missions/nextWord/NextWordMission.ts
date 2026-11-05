import type { NextWordData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { evaluateNextWord, nextWords } from './evaluate';
export class NextWordMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: NextWordData;
  private active = 0;
  private stories: Record<string, string[]> = {};
  private answer: number | null = null;
  private attempts = 0;
  private hints = 0;
  private message = '';
  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'nextWord' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data; this.render();
  }
  private help(): void {
    this.hints++;
    const first = this.data.corpora[0], word = first && nextWords(first.sentences, this.data.start)[0]?.word;
    this.message = this.attempts >= 3 && word ? '첫 글 모음에서 ' + word + '부터 골라요.\n다른 글 모음으로도 이어 봐요.' : this.data.hint;
  }
  private render(followWord = false): void {
    const root = this.ctx.root, d = this.data, corpus = d.corpora[this.active];
    const focus = document.activeElement?.getAttribute('aria-label'); clear(root);
    if (!corpus) return;
    const words = this.stories[corpus.id] ??= [d.start];
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)), h('p', {}, '이 화면은 작은 글 모음으로 연습해요.'));
    const tabs = h('div', { class: 'row' });
    d.corpora.forEach((c, i) => tabs.append(h('button', { class: 'btn', 'aria-label': c.label, 'aria-pressed': this.active === i ? 'true' : 'false', onclick: () => { this.active = i; this.message = ''; this.render(); } }, c.label + ((this.stories[c.id]?.length ?? 0) >= d.steps + 1 ? ' ✓' : ''))));root.append(tabs);
    root.append(h('details', {}, h('summary', {}, '글 모음 보기'), ...corpus.sentences.map(text => h('p', {}, text))));
    root.append(h('h3', {}, '지금 만든 문장'), h('p', { class: 'robi-say' }, words.join(' ')), h('p', {}, '고른 낱말: ' + (words.length - 1) + '/' + d.steps));
    const candidates = nextWords(corpus.sentences, words.at(-1)!);
    root.append(h('h3', {}, '다음에 온 말의 횟수'));
    for (const c of candidates) root.append(h('div', {},
      h('button', { class: 'choice', 'aria-label': c.word + ' 고르기', disabled: words.length > d.steps, onclick: () => { this.stories[corpus.id] = [...words, c.word]; this.render(true); } }, c.word + ' · ' + c.count + '회 (' + Math.round(c.probability * 100) + '%)'),
      h('div', { role: 'img', 'aria-label': c.word + ' ' + c.count + '회', style: 'height:14px;background:#388e9e;width:' + c.probability * 100 + '%' })));
    if (!candidates.length) root.append(h('p', {}, '이 말 뒤의 기록은 없어요.'));
    root.append(h('button', { class: 'btn', 'aria-label': '문장 다시 잇기', onclick: () => { this.stories[corpus.id] = [d.start]; this.render(); } }, '문장 다시 잇기'),
      h('p', {}, '두 글 모음을 각각 이어 보고 답해요.'), h('p', {}, d.question.q));
    d.question.choices.forEach((text, i) => root.append(h('button', { class: 'choice', 'aria-label': text, 'aria-pressed': this.answer === i ? 'true' : 'false', onclick: () => { this.answer = i; this.render(); } }, text)));
    root.append(h('p', { class: 'muted' }, '많이 나온 말도 사실과 다를 수 있어요.\n믿을 만한 자료로 확인해요.'));
    if (this.message) root.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.message)));
    root.append(h('div', { class: 'row end' }, h('button', { class: 'btn', 'aria-label': '힌트', onclick: () => { this.help(); this.render(); } }, '힌트'),
      h('button', { class: 'btn primary', 'aria-label': '생성 결과 확인', onclick: () => {
        this.attempts++;
        if (evaluateNextWord(d, this.stories, this.answer)) { this.ctx.sfx('success'); this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints }); return; }
        this.ctx.sfx('fail'); this.message = '두 글 모음의 문장을 이어 봐요.\n비교 질문도 다시 살펴봐요.';
        if (this.attempts >= 2) this.help(); this.render();
      } }, '생성 결과 확인')));
    const nextCorpus = d.corpora.find(c => c.id !== corpus.id && (this.stories[c.id]?.length ?? 0) < d.steps + 1);
    const nextLabel = followWord ? (words.length <= d.steps && candidates[0] ? candidates[0].word + ' 고르기' : nextCorpus?.label ?? d.question.choices[0]) : focus;
    if (nextLabel) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === nextLabel)?.focus();
  }
}
