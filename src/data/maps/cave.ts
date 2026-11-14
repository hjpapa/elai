import type { MapDef } from '../schema';
import { BASE_LEGEND, Painter } from './paint';

const p = new Painter(20, 16, 'c').border('R');
p.rect(3, 3, 5, 5, 'R').rect(12, 3, 14, 5, 'R');
p.rect(4, 10, 5, 12, 'R').rect(15, 9, 16, 11, 'R');
p.set(1, 13, 'c').set(18, 2, 'c');

// 뒤쪽 바위 턱은 모서리를 한 칸 깎고 작은 옆턱을 붙여요. 수정·몹 둘레는 평지예요.
const hp = new Painter(20, 16, '0');
hp.rect(8, 2, 10, 3, '3').rect(9, 4, 10, 4, '3');
hp.set(8, 4, '2').set(8, 5, '1').set(7, 5, '2');

export const cave: MapDef = {
  id: 'cave', name: '동굴 입구', theme: 'cave', chapter: 'ch2',
  rows: p.rows(), heights: hp.rows(), legend: { ...BASE_LEGEND }, spawn: { x: 2, y: 13 },
  checkpoint: { map: 'cave', at: { x: 2, y: 13 } },
  objects: [
    { id: 'chest-rockledge', type: 'chest', at: { x: 10, y: 2 }, reward: { coins: 8, items: [{ id: 'jelly', qty: 1 }] } },
    { id: 'sign-rockledge', type: 'sign', at: { x: 8, y: 2 }, text: '계단을 하나씩 올라왔어요.\n같은 걸음을 되풀이했어요.' },
    { id: 'explorer', type: 'npc', at: { x: 8, y: 8 }, npc: 'explorer', missions: ['ch2-p1-m1', 'ch2-p1-m2', 'ch2-p2-m1', 'ch2-p2-m2', 'ch2-p2-m3', 'ch2-p3-m1', 'ch2-p3-m2'], talk: ['동굴의 무늬를 살펴봐요.\n같은 모양이 되풀이돼요.', '반복은 같은 일을 되풀이해요.\n명령 묶음을 짧게 적어 봐요.'] },
    { id: 'echo-a', type: 'mob', at: { x: 10, y: 6 }, mob: 'echoBat', wander: 1 },
    { id: 'echo-b', type: 'mob', at: { x: 13, y: 12 }, mob: 'echoBat', wander: 1 },
    { id: 'chest-cave', type: 'chest', at: { x: 2, y: 4 }, reward: { xp: 8, coins: 15, items: [{ id: 'jelly', qty: 1 }] } },
    { id: 'crystal-a', type: 'prop', at: { x: 6, y: 3 }, sprite: 'prop-crystal', solid: true },
    { id: 'crystal-b', type: 'prop', at: { x: 17, y: 6 }, sprite: 'prop-crystal', frame: 1, solid: true },
    { id: 'stalagmite', type: 'prop', at: { x: 7, y: 12 }, sprite: 'prop-stalagmite', solid: true },
    { id: 'sign-entry', type: 'sign', at: { x: 3, y: 13 }, text: '반복의 동굴 입구예요.\n탐험가 하루를 찾아가요.' },
    { id: 'sign-deep', type: 'sign', at: { x: 17, y: 2 }, text: '같은 방이 이어진 동굴이에요.\n벽화를 마치면 들어갈 수 있어요.' },
    { id: 'to-village', type: 'portal', at: { x: 1, y: 13 }, to: { map: 'village', at: { x: 21, y: 10 } }, label: '코딩 마을' },
    { id: 'to-cavedeep', type: 'portal', at: { x: 18, y: 2 }, to: { map: 'cavedeep', at: { x: 1, y: 3 } }, label: '되풀이 동굴', open: { mission: 'ch2-p3-m2' }, lockedText: '무늬 그리기를 끝내면\n동굴 안쪽이 열려요.', sprite: 'prop-gate' },
  ],
};
