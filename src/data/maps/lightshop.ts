import { LIGHT_ROUNDS, lightFlag } from '../minigames/light';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

/**
 * 마을 불빛 가게 안(2.5D 4단계, 세 번째 들어가는 건물). 벽·바닥은 마을 공방과 같은 그림이에요.
 * 왼쪽 벽 앞에 불 꺼진 액자 여섯 개가 서 있고, 판을 처음 성공하면 그 판의 그림이 켜져요(플래그 light:<판>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W'); // 창문

const frames: MapObject[] = LIGHT_ROUNDS.flatMap((r, i): MapObject[] => {
  const at = { x: 1, y: 1 + i };
  return [
    { id: `frame-${r.id}-off`, type: 'prop', at, sprite: 'prop-light-frame', frame: 0, solid: true, when: { notFlag: lightFlag(r.id) } },
    { id: `frame-${r.id}-on`, type: 'prop', at, sprite: 'prop-light-frame', frame: i + 1, solid: true, when: { flag: lightFlag(r.id) } },
  ];
});

export const lightshop: MapDef = {
  id: 'lightshop',
  name: '마을 불빛 가게',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    { id: 'lightboard', type: 'game', at: { x: 5, y: 1 }, game: 'light', sprite: 'prop-lightboard' },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'shelf', type: 'prop', at: { x: 8, y: 2 }, sprite: 'prop-lamp-shelf', solid: true },
    { id: 'plant', type: 'prop', at: { x: 8, y: 5 }, sprite: 'prop-plant', solid: true },
    ...frames,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 9, y: 7 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
