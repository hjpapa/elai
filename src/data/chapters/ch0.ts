import type { Chapter } from '../schema';

export const ch0: Chapter = {
  id: 'ch0',
  index: 0,
  title: '코딩 마을',
  grades: '전 학년',
  summary: '섬에 도착해 도우미 로봇 로비를 만나고 첫 장비를 받아요.',
  concepts: ['게임 조작', '로봇·AI 에이전트(보고 → 생각하고 → 움직여요)'],
  goals: ['게임 속 이동·대화·가방 사용법을 익힌다.', '로봇이 센서·처리 장치·구동 장치로 일한다는 것을 안다.'],
  standards: { silgwa: ['6실04-04'], aiContent: ['인공지능의 이해(에이전트)'], ai4k12: [] },
  dungeon: '연습장',
  mobs: ['dummy'],
  status: 'playable',
  entryMap: 'village',
  parts: [
    {
      id: 'ch0-p1',
      kind: 'part',
      title: '이동·대화',
      summary: '마을을 걸어 다니며 촌장님과 이야기해요.',
      activity: '클릭(탭)과 방향키로 이동하고, NPC와 대화하는 방법을 익혀요.',
      missions: [
        {
          id: 'ch0-m1',
          kind: 'dialogue',
          title: '촌장님의 부탁',
          npc: 'elder',
          reward: { xp: 5 },
          data: {
            lines: [
              { who: 'elder', text: '어서 와요, 견습 탐험가!\n여기는 엘라이 섬의 코딩 마을이에요.' },
              { who: 'elder', text: '요즘 섬의 기계들이\n하나둘 고장 나고 있어요.' },
              { who: 'elder', text: '공방 앞에 도우미 로봇이 쓰러져 있대요.\n한번 가 볼래요?' },
            ],
          },
        },
      ],
    },
    {
      id: 'ch0-p2',
      kind: 'part',
      title: '로비 만나기',
      summary: '고장 난 로봇 로비를 만나고, 로봇이 일하는 순서를 알아봐요.',
      activity: '로봇이 센서(입력) → 처리 장치(처리) → 구동 장치(출력)로 일한다는 것을 순서 카드로 정리해요.',
      missions: [
        {
          id: 'ch0-m2',
          kind: 'dialogue',
          title: '삐빅, 안녕하세요',
          npc: 'robi',
          reward: { xp: 5 },
          data: {
            lines: [
              { who: 'robi', text: '삐빅… 누, 누구세요?\n저는 도우미 로봇 로비예요.' },
              { who: 'robi', text: '부품이 흩어져서 잘 생각하고\n잘 움직일 수가 없어요.' },
              { who: 'player', text: '내가 도와줄게!\n부품은 어디 있어?' },
              { who: 'robi', text: '섬 곳곳에 있대요.\n같이 찾으러 가요!' },
            ],
          },
        },
        {
          id: 'ch0-m3',
          kind: 'sequence',
          title: '로봇은 어떻게 일할까?',
          npc: 'robi',
          reward: { xp: 10 },
          data: {
            intro: '로봇이 장애물을 피해 가는 순서를 맞혀 보세요.',
            steps: [
              '센서(눈)로 앞에 무엇이 있는지 봐요',
              '처리 장치(머리)로 어떻게 할지 정해요',
              '구동 장치(바퀴)로 움직여요',
            ],
            display: 'cards',
            hint: '먼저 보고, 생각한 다음, 움직여요.',
            explain: '로봇은 보고 → 생각하고 → 움직여요.\n사람이 일하는 방법과 닮았죠?',
          },
        },
      ],
    },
    {
      id: 'ch0-p3',
      kind: 'part',
      title: '첫 장비와 연습 전투',
      summary: '첫 장비를 받아 착용하고, 허수아비 봇과 연습 전투를 해요.',
      activity: '가방에서 장비를 착용하고, 몹의 행동 예고를 보고 카드를 순서대로 놓는 전투 방법을 익혀요.',
      missions: [
        {
          id: 'ch0-m4',
          kind: 'dialogue',
          title: '모험 준비',
          npc: 'elder',
          reward: {
            xp: 5,
            items: [
              { id: 'cap', qty: 1 },
              { id: 'stick', qty: 1 },
              { id: 'apple', qty: 2 },
            ],
          },
          data: {
            lines: [
              { who: 'elder', text: '로비를 만났군요!\n모험을 떠나려면 장비가 필요해요.' },
              { who: 'elder', text: '천 모자와 나무 지팡이를 줄게요.\n가방을 열어 착용해 봐요.' },
              { who: 'elder', text: '연습장의 허수아비 봇과\n한 번 겨뤄 보고 떠나요.' },
            ],
          },
        },
        {
          id: 'ch0-m5',
          kind: 'battle',
          title: '연습 전투',
          npc: 'dummy',
          reward: { xp: 10, coins: 10, flags: ['forest-open'] },
          data: {
            mob: 'dummy',
            intro: '허수아비 봇 머리 위 그림이 다음 행동이에요.\n그림을 보고 카드를 순서대로 놓아요.',
            hint: '번개(힘 모으기) 다음에는 강타가 와요.\n강타 때는 막기 카드를 놓아요!',
          },
        },
      ],
    },
  ],
};
