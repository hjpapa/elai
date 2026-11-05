import type { MapDef } from '../schema';
import { BASE_GLYPHS, BASE_LEGEND, Painter } from './paint';

const p = new Painter(28, 24, '.');
p.scatter(',', 34, 21).scatter('T', 30, 22).scatter('P', 22, 23).scatter('b', 10, 24).scatter('m', 10, 25);
p.border('P');
p.hline(1, 26, 9, '~'); // 시냇물
// 빈터(몹·NPC·상자 자리)
p.rect(3, 12, 8, 15, '.'); // 요리사 보리의 캠프
p.rect(8, 16, 12, 18, '.'); // 덩굴 슬라임 A
p.rect(18, 15, 22, 17, '.'); // 덩굴 슬라임 B
p.rect(15, 5, 19, 7, '.').hline(14, 15, 6, '.'); // 버그 벌레(다리 건너)
p.dots(
  [
    { x: 14, y: 19 },
    { x: 12, y: 10 },
    { x: 14, y: 21 },
    { x: 14, y: 11 },
    { x: 14, y: 4 },
    { x: 24, y: 18 },
  ],
  '.',
);
// 길
p.vline(13, 3, 22, '=').set(13, 9, 'B');
p.hline(6, 13, 14, '=');
p.hline(14, 23, 18, '=');
p.dots(
  [
    { x: 4, y: 12 },
    { x: 7, y: 15 },
  ],
  'u',
);

export const forest: MapDef = {
  id: 'forest',
  name: '순서의 숲',
  theme: 'forest',
  chapter: 'ch1',
  rows: p.rows(),
  legend: { ...BASE_LEGEND },
  glyphs: { ...BASE_GLYPHS },
  spawn: { x: 13, y: 21 },
  checkpoint: { map: 'forest', at: { x: 13, y: 21 } },
  objects: [
    {
      id: 'ranger-a',
      type: 'npc',
      at: { x: 14, y: 19 },
      npc: 'ranger',
      missions: ['ch1-p1-m1', 'ch1-p1-m2', 'ch1-p1-m3'],
      talk: ['왼쪽 캠프에 요리사 보리가 있어요.\n숲길을 따라 찾아가 봐요.', '길을 가기 전에 순서를 정해 봐요.\n로비는 놓인 블록대로 움직여요.', '알고리즘은 문제를 푸는 순서예요.\n숲길 안내에도 쓸 수 있어요.'],
      when: { notMission: 'ch1-p2-m2' },
    },
    {
      id: 'ranger-b',
      type: 'npc',
      at: { x: 12, y: 10 },
      npc: 'ranger',
      missions: ['ch1-p3-m1', 'ch1-p3-m2', 'ch1-p3-m3'],
      talk: ['다리 건너에 숲 미로가 있어요.\n순서도 지도를 가방에 챙겨요.', '디버깅은 틀린 곳을 고치는 일이에요.\n한 단계씩 살피면 찾기 쉬워요.', '틀린 곳을 찾았다면 잘한 거예요.\n고친 뒤 다시 실행해 봐요.'],
      when: { mission: 'ch1-p2-m2' },
    },
    { id: 'chef', type: 'npc', at: { x: 5, y: 13 }, npc: 'chef', missions: ['ch1-p2-m1', 'ch1-p2-m2'], talk: ['빵 위에 잼, 그 위에 바나나예요.\n요리에도 순서가 있어요.', '순서를 그림으로 나타내면\n순서도가 돼요. 화살표를 따라가요.', '로비와 나눠 먹을 간식을 만들어요.\n먼저 손부터 깨끗이 씻어요.'] },
    { id: 'bridge-broken', type: 'prop', at: { x: 13, y: 9 }, sprite: 'prop-bridge-broken', solid: true, when: { notMission: 'ch1-p3-m2' } },
    { id: 'slime-a', type: 'mob', at: { x: 10, y: 17 }, mob: 'vineSlime', wander: 2 },
    { id: 'slime-b', type: 'mob', at: { x: 20, y: 16 }, mob: 'vineSlime', wander: 2 },
    { id: 'bug-a', type: 'mob', at: { x: 17, y: 6 }, mob: 'bugWorm', wander: 1 },
    { id: 'chest-forest', type: 'chest', at: { x: 24, y: 18 }, reward: { xp: 5, coins: 10, items: [{ id: 'apple', qty: 1 }] } },
    { id: 'sign-entry', type: 'sign', at: { x: 14, y: 21 }, text: '순서의 숲에 왔어요!\n숲지기 솔에게 길을 물어봐요.' },
    { id: 'sign-bridge', type: 'sign', at: { x: 14, y: 11 }, text: '고장 난 다리를 고치는 중이에요.\n솔과 함께 순서를 살펴봐요.' },
    { id: 'sign-maze', type: 'sign', at: { x: 14, y: 4 }, text: '안개 낀 숲 미로 입구예요.\n표지판의 화살표를 따라가요.' },
    { id: 'to-village', type: 'portal', at: { x: 13, y: 22 }, to: { map: 'village', at: { x: 5, y: 2 } }, label: '코딩 마을' },
    {
      id: 'to-maze',
      type: 'portal',
      at: { x: 13, y: 3 },
      to: { map: 'maze', at: { x: 9, y: 15 } },
      label: '숲 미로',
      open: { flag: 'maze-open' },
      lockedText: '숲지기 솔의 디버깅 퀴즈를 풀면\n미로가 열려요.',
      sprite: 'prop-gate',
    },
  ],
};
