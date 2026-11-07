import { SORT_ROUNDS, stampFlag } from '../minigames/sort';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

/**
 * 마을 택배소 안(2.5D 4단계, 두 번째 들어가는 건물). 벽·바닥은 마을 공방과 같은 그림이에요.
 * 판을 처음 성공해 배달 도장을 받으면 왼쪽 벽 앞에 보낸 상자 더미가 하나씩 쌓여요(플래그 stamp:sort-<판>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 2, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 4 }], 'W'); // 창문

const stacks: MapObject[] = SORT_ROUNDS.map(
  (r, i): MapObject => ({ id: `stack-${r.id}`, type: 'prop', at: { x: 1, y: 1 + i }, sprite: 'prop-parcel-stack', frame: i % 2, solid: true, when: { flag: stampFlag(r.id) } }),
);

export const parcel: MapDef = {
  id: 'parcel',
  name: '마을 택배소',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    { id: 'sorter', type: 'game', at: { x: 5, y: 1 }, game: 'sort', sprite: 'prop-sorter' },
    { id: 'plant', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-plant', solid: true },
    { id: 'lamp', type: 'prop', at: { x: 7, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'pile-a', type: 'prop', at: { x: 8, y: 1 }, sprite: 'prop-parcel-pile', solid: true },
    { id: 'pile-b', type: 'prop', at: { x: 8, y: 4 }, sprite: 'prop-parcel-pile', solid: true },
    ...stacks,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 17, y: 8 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
