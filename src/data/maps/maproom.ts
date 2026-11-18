import { ROUTE_ROUNDS, routeFlag } from '../minigames/route';
import type { MapDef, MapObject } from '../schema';
import { Painter } from './paint';

/**
 * 마을 지도방 안(2.5D 4단계, 네 번째 들어가는 건물). 벽·바닥은 마을 공방과 같은 그림이에요.
 * 왼쪽 벽 앞에 빈 미로 지도 여섯 개가 서 있고, 판을 처음 성공하면 그 판의 길이 그려져요(플래그 route:<판>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W'); // 창문

const maps: MapObject[] = ROUTE_ROUNDS.flatMap((r, i): MapObject[] => {
  const at = { x: 1, y: 1 + i };
  return [
    { id: `map-${r.id}-empty`, type: 'prop', at, sprite: 'prop-route-map', frame: 0, solid: true, when: { notFlag: routeFlag(r.id) } },
    { id: `map-${r.id}-drawn`, type: 'prop', at, sprite: 'prop-route-map', frame: i + 1, solid: true, when: { flag: routeFlag(r.id) } },
  ];
});

export const maproom: MapDef = {
  id: 'maproom',
  name: '마을 지도방',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    {
      id: 'visitor-guide', type: 'npc', at: { x: 7, y: 3 }, npc: 'guide',
      talk: ['돌아가는 길도 지름길도 있어요.', '한 칸씩 가며 숫자를 놓아 봐요.', '두 길의 걸음 수를 비교해요.'],
    },
    { id: 'route-table', type: 'game', at: { x: 5, y: 2 }, game: 'route', sprite: 'prop-route-table' },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'globe', type: 'prop', at: { x: 8, y: 2 }, sprite: 'prop-globe', solid: true },
    { id: 'plant', type: 'prop', at: { x: 8, y: 5 }, sprite: 'prop-plant', solid: true },
    ...maps,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 9, y: 14 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
