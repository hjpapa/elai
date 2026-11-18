import { CHAPTERS } from '../data/chapters';
import { app } from '../game/app';
import { buildDemoSave } from '../game/rpg/demo';
import { CATALOG } from '../minigames/catalog';
import { h } from './dom';

export function openDemoMenu(): void {
  const available = () => app.demo && app.game.scene.isActive('World') && !app.game.scene.isActive('Battle') && !app.missions.busy && !app.minigames.busy;
  if (!available() || app.ui.isBusy()) return;
  const panel = app.ui.panel(() => undefined, { title: '시연', className: 'demo-menu' });
  const action = (label: string, run: () => void) => h('button', {
    class: 'btn', onclick: () => {
      if (!available()) return;
      panel.close();
      run();
    },
  }, label);
  const travel = (map: string, x: number, y: number) => {
    app.game.scene.getScene('World').scene.restart({ map, at: { x, y } });
  };
  const jump = (stop: number) => {
    const save = buildDemoSave(stop, app.state.data.settings);
    app.state.replaceData(save);
    travel(save.location.map, save.location.x, save.location.y);
  };
  const stops = h('div', { class: 'row' }, ...CHAPTERS.map(c => action(c.index + '장', () => jump(c.index))), action('엔딩 앞', () => jump(9)));
  const buildings = CATALOG.map(game => h('div', { class: 'demo-building' },
    h('b', {}, game.building), action('들어가기', () => travel(game.map, 6, 6)), action('놀이 열기', () => void app.minigames.open(game.id))));
  const missions = h('div', { class: 'demo-missions' });
  const select = h('select', { 'aria-label': '미션 장 고르기' },
    ...CHAPTERS.map(c => h('option', { value: String(c.index) }, c.index + '장 ' + c.title)));
  const render = () => {
    const chapter = CHAPTERS[Number(select.value)];
    missions.replaceChildren(...chapter.parts.flatMap(p => p.missions.map(m => action(m.title, () => void app.missions.run(m.id)))));
  };
  select.addEventListener('change', render);
  render();
  panel.body.append(h('h3', {}, '장으로 가기'), stops, h('h3', {}, '마을 건물'), ...buildings,
    h('h3', {}, '미션 바로 열기'), select, missions, action('처음 상태로', () => jump(0)));
  stops.querySelector('button')?.focus();
}
