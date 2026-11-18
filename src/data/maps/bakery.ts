import { BAKERY_ROUNDS, cakeFlag } from '../minigames/bakery';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

/**
 * 마을 빵집 안(2.5D 4단계, 다섯 번째 들어가는 건물). 벽·바닥은 마을 공방과 같은 그림이에요.
 * 왼쪽 벽 앞에 빈 접시 진열대 여섯 개가 서 있고, 판을 처음 성공하면 그 판의 케이크가 놓여요(플래그 cake:<판>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W'); // 창문

const stands: MapObject[] = BAKERY_ROUNDS.flatMap((r, i): MapObject[] => {
  const at = { x: 1, y: 1 + i };
  return [
    { id: `stand-${r.id}-empty`, type: 'prop', at, sprite: 'prop-cake-stand', frame: 0, solid: true, when: { notFlag: cakeFlag(r.id) } },
    { id: `stand-${r.id}-cake`, type: 'prop', at, sprite: 'prop-cake-stand', frame: i + 1, solid: true, when: { flag: cakeFlag(r.id) } },
  ];
});

export const bakery: MapDef = {
  id: 'bakery',
  name: '마을 빵집',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    {
      id: 'visitor-chef', type: 'npc', at: { x: 3, y: 3 }, npc: 'chef',
      talk: ['오늘은 어떤 케이크를 만들까요?', '주문서에 모양이 빠졌네요.', '다르게 나오면 고쳐서 부탁해요.'],
    },
    { id: 'oven', type: 'game', at: { x: 5, y: 1 }, game: 'bakery', sprite: 'prop-oven' },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'bread', type: 'prop', at: { x: 8, y: 2 }, sprite: 'prop-bread-shelf', solid: true },
    { id: 'plant', type: 'prop', at: { x: 8, y: 5 }, sprite: 'prop-plant', solid: true },
    ...stands,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 17, y: 14 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
