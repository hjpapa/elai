import type { MapDef } from '../schema';
import { BASE_GLYPHS, BASE_LEGEND, Painter } from './paint';

const p = new Painter(26, 22, '.');
p.scatter(',', 26, 11);
p.border('P');
p.rect(22, 0, 23, 21, '~'); // 동쪽 강
p.vline(12, 4, 20, '='); // 큰길
p.hline(5, 21, 10, '='); // 가로길
p.vline(5, 1, 10, '='); // 숲 입구 길
p.hline(12, 17, 4, '='); // 공방 체험 천막 길
p.rect(10, 8, 14, 12, 's'); // 광장
p.dots([{ x: 22, y: 10 }, { x: 23, y: 10 }], 'B').set(24, 10, '=');
// 연습장
p.hline(2, 8, 15, 'f').vline(2, 16, 19, 'f').rect(3, 16, 7, 19, '=').hline(8, 11, 17, '=');
p.dots(
  [
    { x: 3, y: 3 },
    { x: 9, y: 3 },
    { x: 3, y: 8 },
    { x: 20, y: 2 },
    { x: 16, y: 17 },
    { x: 20, y: 18 },
    { x: 3, y: 12 },
    { x: 9, y: 19 },
    { x: 19, y: 13 },
  ],
  'T',
);
p.dots(
  [
    { x: 7, y: 8 },
    { x: 17, y: 9 },
    { x: 15, y: 15 },
    { x: 21, y: 6 },
    { x: 2, y: 5 },
  ],
  'b',
);

const restored = { flag: 'village-restore-1' };
const broken = { notFlag: 'village-restore-1' };
const house = (id: string, x: number, y: number) =>
  [
    { id: `${id}-old`, type: 'prop', at: { x, y }, sprite: 'prop-house', frame: 0, solid: true, when: broken },
    { id: `${id}-new`, type: 'prop', at: { x, y }, sprite: 'prop-house', frame: 1, solid: true, when: restored },
  ] as const;

export const village: MapDef = {
  id: 'village',
  name: '코딩 마을',
  theme: 'village',
  chapter: 'ch0',
  rows: p.rows(),
  legend: { ...BASE_LEGEND },
  glyphs: { ...BASE_GLYPHS },
  spawn: { x: 12, y: 16 },
  checkpoint: { map: 'village', at: { x: 12, y: 16 } },
  objects: [
    ...house('house-a', 8, 6),
    ...house('house-b', 16, 7),
    ...house('house-c', 8, 13),
    ...house('house-d', 16, 13),
    { id: 'workshop', type: 'prop', at: { x: 19, y: 7 }, sprite: 'prop-house', frame: 1, solid: true },
    { id: 'fountain-dry', type: 'prop', at: { x: 12, y: 10 }, sprite: 'prop-fountain', frame: 0, solid: true, when: broken },
    { id: 'fountain-on', type: 'prop', at: { x: 12, y: 10 }, sprite: 'prop-fountain', frame: 1, solid: true, when: restored },
    { id: 'lamp-1', type: 'prop', at: { x: 11, y: 7 }, sprite: 'prop-lamp', solid: true },
    { id: 'lamp-2', type: 'prop', at: { x: 13, y: 7 }, sprite: 'prop-lamp', solid: true },
    { id: 'lamp-3', type: 'prop', at: { x: 11, y: 13 }, sprite: 'prop-lamp', solid: true },
    { id: 'lamp-4', type: 'prop', at: { x: 13, y: 13 }, sprite: 'prop-lamp', solid: true },
    { id: 'booth', type: 'prop', at: { x: 18, y: 3 }, sprite: 'prop-booth', solid: true },
    { id: 'bridge-broken-1', type: 'prop', at: { x: 22, y: 10 }, sprite: 'prop-bridge-broken', solid: true, when: broken },
    { id: 'bridge-broken-2', type: 'prop', at: { x: 23, y: 10 }, sprite: 'prop-bridge-broken', solid: true, when: broken },

    {
      id: 'elder',
      type: 'npc',
      at: { x: 10, y: 11 },
      npc: 'elder',
      missions: ['ch0-m1', 'ch0-m4'],
      talk: ['코딩 마을은 오늘도 평화로워요.', '모르는 게 있으면 언제든 물어봐요.'],
    },
    { id: 'robi-npc', type: 'npc', at: { x: 19, y: 9 }, npc: 'robi', missions: ['ch0-m2', 'ch0-m3'], when: { notMission: 'ch0-m3' } },
    { id: 'dummy', type: 'npc', at: { x: 5, y: 18 }, npc: 'dummy', missions: ['ch0-m5'], talk: ['삐빅! 연습은 언제든 환영이에요.'] },
    {
      id: 'zen',
      type: 'npc',
      at: { x: 18, y: 4 },
      npc: 'zen',
      missions: ['ch7-p2-m1', 'ch7-p2-m2'],
      talk: ['좋은 주문서는 좋은 답을 만들어요.', '7장 프롬프트 공방에서 또 만나요!'],
      when: { mission: 'ch0-m1' },
    },
    { id: 'chest-village', type: 'chest', at: { x: 3, y: 4 }, reward: { xp: 3, coins: 5, items: [{ id: 'apple', qty: 1 }] } },

    { id: 'sign-street', type: 'sign', at: { x: 13, y: 17 }, text: '화면 위쪽: 마을 광장, 순서의 숲 입구\n화면 오른쪽: 로비의 공방, 프롬프트 공방 천막' },
    { id: 'sign-forest', type: 'sign', at: { x: 6, y: 2 }, text: '순서의 숲 입구\n연습 전투를 끝내면 열려요.' },
    { id: 'sign-booth', type: 'sign', at: { x: 14, y: 5 }, text: '프롬프트 공방 미리 해 보기\n5~6학년 추천!' },
    { id: 'sign-bridge', type: 'sign', at: { x: 21, y: 9 }, text: '반복의 동굴로 가는 다리\n(2장은 준비 중이에요)' },

    {
      id: 'to-forest',
      type: 'portal',
      at: { x: 5, y: 1 },
      to: { map: 'forest', at: { x: 13, y: 21 } },
      label: '순서의 숲',
      open: { flag: 'forest-open' },
      lockedText: '연습장의 허수아비 봇과 연습 전투를 끝내면\n숲으로 갈 수 있어요.',
      sprite: 'prop-gate',
    },
    {
      id: 'to-ch2',
      type: 'portal',
      at: { x: 24, y: 10 },
      to: { map: 'village', at: { x: 21, y: 10 } },
      label: '반복의 동굴',
      open: { flag: 'ch2-open' },
      lockedText: '2장 반복의 동굴은 준비 중이에요.\n조금만 기다려요!',
    },
  ],
};
