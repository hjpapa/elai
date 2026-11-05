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
    { id: 'restore-crystal-a', type: 'prop', at: { x: 10, y: 8 }, sprite: 'prop-crystal', when: { flag: 'village-restore-2' } },
    { id: 'restore-crystal-b', type: 'prop', at: { x: 14, y: 12 }, sprite: 'prop-crystal', frame: 1, when: { flag: 'village-restore-2' } },
    { id: 'to-ch3', type: 'portal', at: { x: 19, y: 19 }, to: { map: 'desert', at: { x: 2, y: 13 } }, label: '갈림길 사막', open: { flag: 'ch2-clear' }, lockedText: '2장을 끝내면\n사막으로 갈 수 있어요.', sprite: 'prop-gate' },
    { id: 'restore-signal', type: 'prop', at: { x: 14, y: 8 }, sprite: 'prop-signal', frame: 1, when: { flag: 'village-restore-3' } },
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
      talk: ['작은 기계도 저마다 할 일이 있어요.\n함께 고치면 마을이 환해질 거예요.', '할 일을 하나씩 정해 봐요.\n순서가 보이면 시작하기 쉬워요.', '막히면 잠깐 쉬어도 괜찮아요.\n다시 살피면 새 길이 보여요.'],
    },
    { id: 'robi-npc', type: 'npc', at: { x: 19, y: 9 }, npc: 'robi', missions: ['ch0-m2', 'ch0-m3'], when: { notMission: 'ch0-m3' } },
    { id: 'dummy', type: 'npc', at: { x: 5, y: 18 }, npc: 'dummy', missions: ['ch0-m5'], talk: ['삐빅! 연습은 언제든 환영해요.\n먼저 다음 행동 그림을 살펴봐요.', '번개는 힘을 모으는 표시예요.\n다음 칸에 막기를 놓아 봐요.', '틀려도 괜찮아요.\n카드 순서를 고쳐 다시 해 봐요.'] },
    {
      id: 'zen',
      type: 'npc',
      at: { x: 18, y: 4 },
      npc: 'zen',
      missions: ['ch7-p2-m1', 'ch7-p2-m2'],
      talk: ['저는 주문서를 읽는 젠이에요.\n부탁할 일을 또렷하게 알려 줘요.', '좋은 답인지 함께 살펴봐요.\n제 답에도 틀린 곳이 있을 수 있어요.', '순서를 적으면 부탁도 쉬워져요.\n무엇을 먼저 할지 알려 줘요.'],
      when: { mission: 'ch0-m1' },
    },
    { id: 'chest-village', type: 'chest', at: { x: 3, y: 4 }, reward: { xp: 3, coins: 5, items: [{ id: 'apple', qty: 1 }] } },

    { id: 'sign-street', type: 'sign', at: { x: 13, y: 17 }, text: '위쪽 길은 광장과 숲으로 이어져요.\n오른쪽 길에는 공방이 있어요.' },
    { id: 'sign-forest', type: 'sign', at: { x: 6, y: 2 }, text: '순서의 숲으로 가는 입구예요.\n연습 전투를 마치면 열려요.' },
    { id: 'sign-booth', type: 'sign', at: { x: 14, y: 5 }, text: 'AI에게 부탁하는 주문서 체험이에요.\n5~6학년에게 추천해요.' },
    { id: 'sign-bridge', type: 'sign', at: { x: 21, y: 9 }, text: '반복의 동굴로 이어지는 다리예요.\n1장을 마치고 건너가 봐요.' },

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
      to: { map: 'cave', at: { x: 2, y: 13 } },
      label: '반복의 동굴',
      open: { flag: 'ch1-clear' },
      lockedText: '1장을 끝내면\n다리를 건널 수 있어요.',
    },
  ],
};
