import { evaluateSearch, searchGrid } from './search';
import type { Point, ClassifyData } from '../../data/schema';
import { clear, h, lines } from '../../ui/dom';
import type { MissionContext, MissionEngine } from '../core/types';
import { evaluateBinary, evaluatePixels, evaluateGroups, evaluateTable, evaluateTree } from './evaluate';

export class ClassifyMission implements MissionEngine {
  private ctx!: MissionContext;
  private data!: ClassifyData;
  private questions: string[] = [];
  private groups: Record<string, string> = {};
  private counts: Record<string, number> = {};
  private wave = 0;
  private path: Point[] = [];
  private attempts = 0;
  private hints = 0;
  private message = '';
  mount(ctx: MissionContext): void {
    if (ctx.mission.kind !== 'classify' || !ctx.mission.data) return;
    this.ctx = ctx; this.data = ctx.mission.data; this.render();
  }
  private render(): void {
    const d = this.data, root = this.ctx.root;
    const focusedLabel = document.activeElement?.getAttribute('aria-label');
    clear(root);
    root.append(h('div', { class: 'mission-intro' }, ...lines(d.intro)));
    if (d.mode === 'search') {
      const grid = d.cards[0]?.features ?? [], result = searchGrid(grid);
      if (!result) { root.append(h('p', {}, '길 자료를 다시 확인해요.')); return; }
      if (!this.path.length) this.path = [{ ...result.start }];
      root.append(h('p', {}, '물결을 한 칸씩 퍼뜨린 뒤,\n출발부터 가장 짧은 길을 눌러요.'),
        h('div', { class: 'row' }, h('button', { class: 'btn', 'aria-label': '물결 한 칸 퍼뜨리기', onclick: () => { this.wave = Math.min(this.wave + 1, Math.max(...result.distances.flat())); this.render(); } }, '물결 한 칸 퍼뜨리기'),
        h('button', { class: 'btn', 'aria-label': '길 다시 고르기', onclick: () => { this.path = [{ ...result.start }]; this.render(); } }, '길 다시 고르기')),
        h('p', {}, '지금 물결: ' + this.wave + '칸 · 고른 길: ' + (this.path.length - 1) + '칸'));
      const board = h('div', { role: 'group', 'aria-label': '물결 탐색 지도', style: 'display:grid;grid-template-columns:repeat(' + grid[0].length + ',32px);gap:2px;max-width:100%' });
      grid.forEach((row, y) => [...row].forEach((cell, x) => {
        const distance = result.distances[y][x], visible = distance >= 0 && distance <= this.wave;
        const chosen = this.path.some(p => p.x === x && p.y === y);
        board.append(h('button', { class: 'btn small', disabled: cell === '#' || !visible,
          style: 'padding:0;width:32px;height:32px;background:' + (chosen ? '#388e9e' : cell === '#' ? '#0e1420' : '#273d52'),
          'aria-label': (y + 1) + '행 ' + (x + 1) + '열 ' + (cell === '#' ? '벽' : cell === 'S' ? '출발' : cell === 'G' ? '목표' : visible ? distance + '칸' : '아직 안 본 길'),
          onclick: () => {
            const last = this.path.at(-1)!;
            if (Math.abs(last.x - x) + Math.abs(last.y - y) === 1) { this.path.push({ x, y }); this.message = ''; }
            else this.message = '마지막 칸 옆의 길을 골라요.\n다시 고르기로 처음부터 시작해요.';
            this.render();
          }
        }, cell === '#' ? '■' : !visible ? '·' : cell === 'S' ? '출발' : cell === 'G' ? '목표' : String(distance)));
      })); root.append(board);
    } else if (d.mode === 'pixels') {
      root.append(h('p', {}, '숫자 1은 켜고, 0은 꺼요.'));
      for (const card of d.cards) {
        const target = card.features.join(''), current = this.groups[card.id] ?? '0'.repeat(target.length);
        root.append(h('h3', {}, card.label), h('pre', { style: 'font-size:18px;letter-spacing:8px' }, card.features.join('\n')));
        const grid = h('div', { role: 'group', 'aria-label': card.label + ' 픽셀', style: 'display:grid;grid-template-columns:repeat(' + card.features[0].length + ',32px);gap:2px;max-width:100%' });
        for (let i = 0; i < target.length; i++) grid.append(h('button', {
          class: 'btn small', style: 'padding:0;width:32px;height:32px;background:' + (current[i] === '1' ? '#388e9e' : '#172131'),
          'aria-label': card.label + ' ' + (Math.floor(i / card.features[0].length) + 1) + '행 ' + (i % card.features[0].length + 1) + '열', 'aria-pressed': current[i] === '1' ? 'true' : 'false',
          onclick: () => { this.groups[card.id] = current.slice(0, i) + (current[i] === '1' ? '0' : '1') + current.slice(i + 1); this.render(); }
        }, current[i]));
        root.append(grid, h('p', {}, '켜진 칸: ' + [...current].filter(v => v === '1').length + '개'));
      }
    } else if (d.mode === 'table') {
      root.append(h('p', {}, '기록: ' + d.cards.map(c => c.label).join(' · ')));
      root.append(h('h3', {}, '종류별 개수와 막대그래프'));
      for (const group of d.groups) {
        const count = this.counts[group.id] ?? 0;
        const adjust = (delta: number) => { this.counts[group.id] = Math.max(0, Math.min(d.cards.length, count + delta)); this.render(); };
        root.append(h('div', { class: 'card', style: 'cursor:default' },
          h('div', { class: 'row' }, h('b', {}, group.label),
            h('button', { class: 'btn small', 'aria-label': group.label + ' 줄이기', onclick: () => adjust(-1) }, '−'),
            h('span', {}, count + '개'), h('button', { class: 'btn small', 'aria-label': group.label + ' 늘리기', onclick: () => adjust(1) }, '+')),
          h('div', { role: 'img', 'aria-label': group.label + ' ' + count + '개 막대', style: 'height:22px;background:#388e9e;max-width:100%;width:' + (count / Math.max(1, d.cards.length) * 100) + '%' })));
      }
    } else if (d.mode === 'binary') {
      root.append(h('p', {}, '불이 켜지면 1, 꺼지면 0이에요.'));
      for (const card of d.cards) {
        const value = Number(this.groups[card.id] ?? 0);
        const row = h('div', { class: 'card', style: 'cursor:default' }, h('b', {}, card.label));
        const bits = h('div', { class: 'row', style: 'gap:6px;flex-wrap:wrap' });
        for (const weight of [8, 4, 2, 1]) bits.append(h('button', {
          class: 'btn small ' + (value & weight ? 'primary' : ''),
          'aria-label': card.label + ' ' + weight + '의 자리', 'aria-pressed': value & weight ? 'true' : 'false',
          onclick: () => { this.groups[card.id] = String(value ^ weight); this.render(); }
        }, weight + ': ' + (value & weight ? '1' : '0')));
        row.append(bits, h('p', {}, '현재 값: ' + value + ' (' + value.toString(2).padStart(4, '0') + ')')); root.append(row);
      }
    } else if (d.mode === 'tree') {
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
      h('button', { class: 'btn primary', 'aria-label': d.mode === 'search' ? '고른 길 확인' : '나눈 결과 확인', onclick: () => this.verify() }, d.mode === 'search' ? '고른 길 확인' : '나눈 결과 확인')));
    if (focusedLabel) [...root.querySelectorAll<HTMLElement>('[aria-label]')].find(el => el.getAttribute('aria-label') === focusedLabel)?.focus();
  }
  private verify(): void {
    this.attempts++;
    const success = this.data.mode === 'search' ? evaluateSearch(this.data.cards[0]?.features ?? [], this.path) : this.data.mode === 'pixels' ? evaluatePixels(this.data, this.groups) : this.data.mode === 'tree' ? evaluateTree(this.data, this.questions).success
      : this.data.mode === 'table' ? evaluateTable(this.data, this.counts)
      : this.data.mode === 'binary' ? evaluateBinary(this.data, this.groups) : evaluateGroups(this.data, this.groups);
    if (success) {
      this.ctx.sfx('success');
      this.ctx.finish({ success: true, stars: this.attempts === 1 ? 3 : this.attempts <= 3 ? 2 : 1, attempts: this.attempts, hints: this.hints });
      return;
    }
    this.ctx.sfx('fail');
    this.message = this.data.mode === 'search' ? '가장 짧게 목표까지 이어 봐요.\n물결의 숫자가 하나씩 커지는 길이에요.' : this.data.mode === 'pixels' ? '숫자 1의 자리만 켜 봐요.\n줄과 칸의 위치도 살펴봐요.' : this.data.mode === 'binary' ? '불빛의 값이 목표와 달라요.\n켜진 자리의 수를 더해 봐요.' : this.data.mode === 'table' ? '기록과 표의 수가 달라요.\n종류별로 하나씩 세어 봐요.' : '서로 다른 종류가 섞여 있어요.\n나누는 규칙을 다시 살펴봐요.';
    if (this.attempts === 2) { this.hints++; this.message = this.data.hint; }
    if (this.attempts >= 3) {
      this.hints++;
      const q = this.data.questions?.[0];
      const firstGroup = this.data.groups[0], firstCard = this.data.cards[0];
      const firstStep = this.data.mode === 'search' ? searchGrid(firstCard?.features ?? [])?.path[1] : undefined;
      this.message = firstStep ? `출발 다음은 ${firstStep.y + 1}행 ${firstStep.x + 1}열이에요.\n길 다시 고르기로 새로 시작해요.` : this.data.mode === 'pixels' && firstCard ? '첫째 줄부터 맞춰 봐요.\n' + firstCard.features[0].split('').join(' ') : this.data.mode === 'table' && firstGroup ? `${firstGroup.label}부터 세어 봐요.\n${this.data.cards.filter(card => card.group === firstGroup.id).length}개를 표에 놓으면 돼요.`
        : this.data.mode === 'binary' && firstCard ? '첫 등불부터 살펴봐요.\n' + (Number(firstCard.group) === 0 ? '목표 0은 불을 모두 꺼요.' : `${[8,4,2,1].find(bit => Number(firstCard.group) & bit)}의 자리를 먼저 켜 봐요.`)
        : this.data.mode === 'tree' && q ? '첫 질문부터 살펴봐요.\n' + q.label : '첫 카드의 특징부터 살펴봐요.\n' + this.data.hint.split('\n')[0];
    }
    this.render();
  }
}
