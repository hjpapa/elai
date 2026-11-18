import { FRUIT_ROUNDS, fruitFlag } from '../minigames/fruit';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

/**
 * 마을 과일 가게 안(2.5D 4단계, 여섯 번째 들어가는 건물). 벽·바닥은 마을 공방과 같은 그림이에요.
 * 왼쪽 벽 앞에 빈 과일 상자 여섯 개가 놓여 있고, 판을 처음 성공하면 그 판의 과일이 담겨요(플래그 fruit:<판>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W'); // 창문

const crates: MapObject[] = FRUIT_ROUNDS.flatMap((r, i): MapObject[] => {
  const at = { x: 1, y: 1 + i };
  return [
    { id: `crate-${r.id}-empty`, type: 'prop', at, sprite: 'prop-fruit-crate', frame: 0, solid: true, when: { notFlag: fruitFlag(r.id) } },
    { id: `crate-${r.id}-full`, type: 'prop', at, sprite: 'prop-fruit-crate', frame: i + 1, solid: true, when: { flag: fruitFlag(r.id) } },
  ];
});

export const fruitshop: MapDef = {
  id: 'fruitshop',
  name: '마을 과일 가게',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    {
      id: 'visitor-researcher', type: 'npc', at: { x: 7, y: 3 }, npc: 'researcher',
      talk: ['이 바구니엔 초록 사과도 있어요.', '다른 빛깔의 예시도 보여 줘요.', '붙인 이름표가 맞는지 살펴봐요.'],
    },
    { id: 'fruit-robot', type: 'game', at: { x: 5, y: 1 }, game: 'fruit', sprite: 'prop-fruit-ai' },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'fruit-stand', type: 'prop', at: { x: 8, y: 2 }, sprite: 'prop-fruit-stand', solid: true },
    { id: 'plant', type: 'prop', at: { x: 8, y: 5 }, sprite: 'prop-plant', solid: true },
    ...crates,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 20, y: 14 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
