import type { ClassifyData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { evaluateGroups, evaluateTree } from './evaluate';

export class ClassifyMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: ClassifyData;
  private questions: string[] = [];
  private groups: Record<string, string> = {};
  private attempts = 0;
  private hints = 0;
  private message = '';
  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'classify' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data; this.render();
  }
  private render(): void {
    const d = this.data, root = this.ctx.root;
    clear(root);
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)));
    if (d.mode === 'tree') {
      root.append(h('p', {}, '질문을 골라 규칙 나무를 만들어요.'));
      const questions = h('div', { class: 'choices' });
      for (const q of d.questions ?? []) questions.append(h('button', { class: 'choice', 'data-question': q.id, 'aria-pressed': this.questions.includes(q.id) ? 'true' : 'false', onclick: () => {
        if (this.questions.includes(q.id)) this.questions = this.questions.filter(id => id !== q.id);
        else if (this.questions.length < (d.maxQuestions ?? 20)) this.questions.push(q.id);
        else this.message = `질문은 ${d.maxQuestions}개까지 골라요.\n고른 질문을 다시 누르면 빠져요.`;
        this.render();
        [...root.querySelectorAll<HTMLButtonElement>('[data-question]')].find(b => b.dataset.question === q.id)?.focus();
      } }, (this.questions.includes(q.id) ? '☑ ' : '☐ ') + q.label));
      root.append(questions);
      const tree = evaluateTree(d, this.questions);
      const trail = this.questions.map(id => d.questions?.find(q => q.id === id)?.label).join(' → ');
      root.append(h('p', { class: 'muted' }, trail || '질문을 아직 고르지 않았어요.'));
      const leaves = tree.leaves.length ? tree.leaves : [{ path: ['시작'], cards: d.cards }];
      for (const leaf of leaves) root.append(h('div', { class: 'card', style: 'cursor:default;overflow-wrap:anywhere' },
        h('b', {}, leaf.path.join(' → ')), h('div', {}, leaf.cards.map(c => c.label).join(' · '))));
    } else {
      root.append(h('p', {}, d.mode === 'cluster' ? '이름표 없이 비슷한 카드끼리 묶어요.' : '카드에 알맞은 이름표를 골라요.'));
      for (const card of d.cards) {
        const select = h('select', { 'aria-label': card.label + ' 묶음', style: 'max-width:100%;min-height:44px', onchange: (event: Event) => { this.groups[card.id] = (event.target as HTMLSelectElement).value; } },
          h('option', { value: '' }, '묶음을 골라요'), ...d.groups.map(g => h('option', { value: g.id }, g.label)));
        select.value = this.groups[card.id] ?? '';
        root.append(h('div', { class: 'card', style: 'cursor:default' }, h('label', {}, card.label, h('br'), select)));
      }
    }
    if (this.message) root.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.message)));
    root.append(h('div', { class: 'row end' },
      h('button', { class: 'btn', onclick: () => { this.hints++; this.message = d.hint; this.render(); } }, '힌트'),
      h('button', { class: 'btn primary', onclick: () => this.verify() }, '나눈 결과 확인')));
  }
  private verify(): void {
    this.attempts++;
    const success = this.data.mode === 'tree' ? evaluateTree(this.data, this.questions).success : evaluateGroups(this.data, this.groups);
    if (success) {
      this.ctx.sfx('success');
      this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints });
      return;
    }
    this.ctx.sfx('fail');
    this.message = '서로 다른 종류가 섞여 있어요.\n나누는 규칙을 다시 살펴봐요.';
    if (this.attempts === 2) { this.hints++; this.message = this.data.hint; }
    if (this.attempts >= 3) {
      this.hints++;
      const q = this.data.questions?.[0];
      this.message = this.data.mode === 'tree' && q ? '첫 질문부터 살펴봐요.\n' + q.label : '첫 카드의 특징부터 살펴봐요.\n' + this.data.hint.split('\n')[0];
    }
    this.render();
  }
}
