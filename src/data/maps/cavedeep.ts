import type { MapDef, MapObject } from '../schema';
import { BASE_LEGEND, Painter } from './paint';

/** 같은 꺾인 방을 네 번 찍어요. 방 사이의 한 칸 문을 반드시 지나가요. */
const ROOM = ['RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'ccccRcc', 'RRRcRcR', 'RRRcccR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR', 'RRRRRRR'];
const p = new Painter(30, 11, 'R');
for (let room = 0; room < 4; room++) {
  const ox = 1 + room * 7;
  for (let y = 0; y < ROOM.length; y++) for (let x = 0; x < 7; x++) p.set(ox + x, y, ROOM[y][x] ?? 'R');
}
// 네 방 모두 오른쪽·아래·오른쪽·위·오른쪽 순서로 꺾여요.
const objects: MapObject[] = [
  { id: 'sign-start', type: 'sign', at: { x: 2, y: 3 }, text: '같은 방이 네 번 되풀이돼요.\n한 방의 길을 찾아 따라가요.' },
  { id: 'to-cave', type: 'portal', at: { x: 1, y: 3 }, to: { map: 'cave', at: { x: 17, y: 2 } }, label: '동굴 입구' },
  { id: 'echo-room-2', type: 'mob', at: { x: 11, y: 5 }, mob: 'echoBat', wander: 1 },
  { id: 'echo-room-3', type: 'mob', at: { x: 18, y: 5 }, mob: 'echoBat', wander: 1 },
  { id: 'chest-cloak', type: 'chest', at: { x: 7, y: 5 }, reward: { xp: 8, items: [{ id: 'cloak', qty: 1 }] } },
  { id: 'chest-jelly', type: 'chest', at: { x: 21, y: 5 }, reward: { xp: 8, coins: 20, items: [{ id: 'jelly', qty: 2 }] } },
  { id: 'batking', type: 'npc', at: { x: 27, y: 2 }, npc: 'batKing', missions: ['ch2-boss-m1', 'ch2-boss-m2', 'ch2-boss-m3'], when: { notFlag: 'batking-fixed' } },
  { id: 'batking-fixed', type: 'npc', at: { x: 27, y: 2 }, npc: 'batKing', sprite: 'boss-bat-king', frame: 3, missions: ['ch2-boss-m1', 'ch2-boss-m2', 'ch2-boss-m3'], talk: ['메아리가 다시 고르게 울려요.\n마을에도 수정빛이 켜졌대요.'], when: { flag: 'batking-fixed' } },
  { id: 'to-village', type: 'portal', at: { x: 28, y: 3 }, to: { map: 'village', at: { x: 12, y: 14 } }, label: '코딩 마을', when: { flag: 'ch2-clear' } },
];
// 상자는 통로 옆 작은 홈에 두어 유일한 길을 막지 않아요.
p.set(7, 5, 'c').set(21, 5, 'c').set(27, 2, 'c');
export const cavedeep: MapDef = {
  id: 'cavedeep', name: '되풀이 동굴', theme: 'cave', chapter: 'ch2',
  rows: p.rows(), legend: { ...BASE_LEGEND }, spawn: { x: 1, y: 3 }, fog: true,
  checkpoint: { map: 'cavedeep', at: { x: 1, y: 3 } }, objects,
};
