import type { MapDef, MapObject } from '../schema';
import { DOLLS } from '../minigames/claw';
import { Painter } from './paint';

/**
 * 마을 공방 안(2.5D 4단계, 처음 들어가는 건물).
 * 뒤쪽 두 변(x=0 줄, y=0 줄)만 높은 벽이고 앞쪽은 잘라 낸 인형의 집처럼 바닥 두께가 보여요.
 * 인형뽑기 기계에서 뽑은 인형은 왼쪽 벽 앞 방석에 앉아요(플래그 doll:<id>).
 */
const p = new Painter(10, 8, '.');
p.hline(0, 9, 0, 'w').vline(0, 0, 7, 'w');
p.dots([{ x: 3, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 3 }], 'W'); // 창문
p.rect(2, 2, 3, 6, 'r'); // 인형 모음 깔개

/** 방석과 그 위에 앉는 인형(뽑은 인형만 보여요). 방석이 먼저 그려져서 인형이 위에 앉아요. */
const dollSeats: MapObject[] = DOLLS.flatMap((doll, i): MapObject[] => [
  { id: `cushion-${doll.id}`, type: 'prop', at: { x: 1, y: 1 + i }, sprite: 'prop-cushion', solid: true },
  { id: `doll-${doll.id}`, type: 'prop', at: { x: 1, y: 1 + i }, sprite: doll.sprite, when: { flag: `doll:${doll.id}` } },
]);

export const workroom: MapDef = {
  id: 'workroom',
  name: '마을 공방',
  theme: 'room',
  rows: p.rows(),
  legend: { '.': 'room', r: 'rug', w: 'roomwall', W: 'roomwindow' },
  spawn: { x: 6, y: 6 },
  objects: [
    { id: 'claw', type: 'game', at: { x: 5, y: 1 }, game: 'claw', sprite: 'prop-claw-machine' },
    { id: 'plant', type: 'prop', at: { x: 2, y: 1 }, sprite: 'prop-plant', solid: true },
    { id: 'lamp', type: 'prop', at: { x: 3, y: 1 }, sprite: 'prop-floorlamp', solid: true },
    { id: 'toybox', type: 'prop', at: { x: 7, y: 1 }, sprite: 'prop-toybox', solid: true },
    { id: 'workbench', type: 'prop', at: { x: 8, y: 1 }, sprite: 'prop-workbench', solid: true },
    ...dollSeats,
    { id: 'to-village', type: 'portal', at: { x: 6, y: 7 }, to: { map: 'village', at: { x: 20, y: 8 } }, label: '코딩 마을', sprite: 'tile-doormat' },
  ],
};
