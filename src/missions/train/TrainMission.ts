import type { ClassificationModel, TrainData } from '../../data/schema';
import { app } from '../../game/app';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { evaluateTraining, trainSelection, type TrainingReport } from './evaluate';

export class TrainMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: TrainData;
  private selected: Record<string, string> = {};
  private included = new Set<string>();
  private model: ClassificationModel | null = null;
  private report: TrainingReport | null = null;
  private attempts = 0;
  private hints = 0;
  private message = '';
  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'train' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data;
    this.included = new Set(this.data.examples.map(e => e.id)); this.render();
  }
  private choices(): Record<string, string> { return Object.fromEntries([...this.included].map(id => [id, this.selected[id] ?? ''])); }
  private invalidate(): void { this.model = null; this.report = null; this.message = '자료를 바꿨어요. 다시 학습해요.'; this.render(); }
  private label(id: string | null): string { return this.data.labels.find(l => l.id === id)?.label ?? '아직 몰라요'; }
  private help(): void {
    this.hints++;
    const first = this.data.examples[0];
    this.message = this.attempts >= 3 && first ? '첫 예시의 이름표는 ' + this.label(first.label) + '예요.\n다른 종류의 예시도 넣어 봐요.' : this.data.hint;
  }
  private render(): void {
    const root = this.ctx.root, d = this.data;
    const focus = document.activeElement?.getAttribute('aria-label'); clear(root);
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)), h('p', {}, '1. 예시를 골라 이름표를 붙여요.'));
    for (const [index, sample] of d.examples.entries()) {
      const sampleName = `예시 ${index + 1}`;
      const select = h('select', { 'aria-label': sampleName + ' 이름표', style: 'min-height:44px;max-width:100%', onchange: (e: Event) => { this.selected[sample.id] = (e.target as HTMLSelectElement).value; this.invalidate(); } },
        h('option', { value: '' }, '이름표를 골라요'), ...d.labels.map(l => h('option', { value: l.id }, l.label)));
      select.value = this.selected[sample.id] ?? '';
      root.append(h('div', { class: 'card', style: 'cursor:default' }, h('label', { style: 'display:block;min-height:44px' },
        h('input', { type: 'checkbox', checked: this.included.has(sample.id), 'aria-label': sampleName + ' 학습에 넣기', onchange: (e: Event) => {
          if ((e.target as HTMLInputElement).checked) this.included.add(sample.id); else this.included.delete(sample.id); this.invalidate();
        } }), ' ' + sampleName), h('p', {}, d.features.map((name, i) => name + ' ' + sample.features[i]).join(' · ')), select));
    }
    root.append(h('p', {}, '2. 가까운 예시 ' + d.k + '개의 이름표로 배워요.'),
      h('button', { class: 'btn', onclick: () => { this.model = trainSelection(d, this.choices()); this.report = null; this.message = this.model ? this.model.samples.length + '개 예시로 학습했어요. 새 예시로 시험해요.' : '고른 예시에 이름표를 붙여요.'; this.render(); } }, '학습하기'),
      h('p', {}, '3. 배우지 않은 새 예시로 시험해요.'),
      h('button', { class: 'btn primary', onclick: () => {
        this.attempts++; this.report = evaluateTraining(d, this.model, this.choices());
        this.message = this.report.success ? '새 예시를 잘 구별했어요!\n이 모델을 로비에게 전해요.' : '서로 다른 예시와 이름표를 봐요.\n' + d.minExamples + '개 이상 골라 다시 학습해요.';
        if (!this.report.success && this.attempts >= 2) this.help();
        this.ctx.sfx(this.report.success ? 'success' : 'fail'); this.render();
      } }, '새 예시로 시험'));
    if (this.report) {
      root.append(h('h3', {}, '정확도(맞힌 비율): ' + Math.round(this.report.accuracy * 100) + '%'), h('p', {}, '학습 예시 ' + (this.model?.samples.length ?? 0) + '개 · 시험 예시 ' + this.report.rows.length + '개'));
      for (const [index, row] of this.report.rows.entries()) root.append(h('p', {}, '새 예시 ' + (index + 1) + ' (' + d.tests[index].features.join(', ') + '): 예상 ' + this.label(row.predicted) + ' / 정답 ' + this.label(row.expected) + (row.correct ? ' ✓' : ' ↺')));
      root.append(h('p', { class: 'muted' }, '이번 시험을 잘해도 늘 맞지는 않아요.\n다양한 새 자료로 다시 확인해요.'));
    }
    if (this.message) root.append(h('div', { class: 'robi-say', role: 'status' }, ...lines(this.message)));
    root.append(h('div', { class: 'row end' }, h('button', { class: 'btn', onclick: () => { this.help(); this.render(); } }, '힌트'),
      h('button', { class: 'btn primary', disabled: !this.report?.success, onclick: () => {
        if (!this.report?.success || !this.model) return;
        if (d.saveModel) app.state.setClassificationModel(this.model);
        this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints });
      } }, '학습 결과 저장')));
    if (focus) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === focus)?.focus();
  }
}
