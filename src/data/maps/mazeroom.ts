import { MAZE_ROUNDS } from '../minigames/maze';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W');
const frames = MAZE_ROUNDS.flatMap((round, i): MapObject[] => {
  const common = { type: 'prop', at: { x: 1, y: i + 1 }, sprite: 'prop-maze-frame', solid: true } as const;
  const flag = 'maze:' + round.id;
  return [
    { ...common, id: 'empty-' + round.id, frame: 0, when: { notFlag: flag } },
    { ...common, id: 'full-' + round.id, frame: i + 1, when: { flag } },
  ];
});
export const mazeroom: MapDef = {
  id: 'mazeroom', name: '마을 미로 공작소', theme: 'room', spawn: { x: 6, y: 6 },
  rows: p.rows(), legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  objects: [
    { id: 'maze-bench', type: 'game', at: { x: 5, y: 1 }, game: 'mazemaker', sprite: 'prop-maze-bench' },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'shelf', type: 'prop', at: { x: 8, y: 2 }, sprite: 'prop-maze-shelf', solid: true },
    { id: 'plant', type: 'prop', at: { x: 8, y: 5 }, sprite: 'prop-plant', solid: true },
    ...frames,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 21, y: 17 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
