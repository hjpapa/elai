import type { Chapter } from '../schema';

export const ch6: Chapter = {
  id: 'ch6',
  index: 6,
  title: '길잡이 천문대',
  grades: '6학년',
  summary: 'AI가 답을 찾는 두 가지 방법, 탐색과 데이터로 배워 예측하기를 비교해요.',
  concepts: ['탐색(물결 탐색)', '예측', '정확도', '데이터의 양과 질'],
  goals: [
    '가능한 길을 차례로 살펴 가장 짧은 길을 찾는 탐색 방법을 체험한다.',
    '데이터에서 규칙을 배워 미래를 예측하는 방법을 체험한다.',
    '데이터의 양에 따라 예측 정확도가 어떻게 달라지는지 비교한다.',
  ],
  standards: { silgwa: ['6실05-05'], aiContent: ['탐색', '기계학습(예측)'], ai4k12: ['표현과 추론', '학습'] },
  robiPart: 'predictModule',
  dungeon: '물결 탐색으로 가장 짧은 길 찾기',
  mobs: ['cometFox'],
  status: 'planned',
  badge: 'badge-6',
  parts: [
    {
      id: 'ch6-p1',
      kind: 'part',
      title: '물결 탐색',
      summary: '물결이 퍼지듯 길을 살펴 가장 짧은 길을 찾아요.',
      activity: '출발점에서 한 걸음, 두 걸음… 칸에 번호를 매기며 퍼져 나가는 탐색(너비 우선 탐색)을 손으로 해 보고 화면으로 확인해요.',
      missions: [{ id: 'ch6-p1-m1', kind: 'blockCode', title: '별빛 미로', npc: 'robi', note: '탐색 시각화 미니게임: 학생이 번호를 매기고 최단 경로 따라가기.' }],
    },
    {
      id: 'ch6-p2',
      kind: 'part',
      title: '날씨 예측',
      summary: '지난 날씨 기록으로 내일 날씨를 예측해요.',
      activity: '구름 양·바람 데이터를 보고 비가 올지 예측하고, 실제 결과와 비교해요.',
      missions: [{ id: 'ch6-p2-m1', kind: 'train', title: '천문대 일기 예보', npc: 'robi', note: '간단한 규칙/최근접 예측. 예측 vs 실제 표.' }],
    },
    {
      id: 'ch6-p3',
      kind: 'part',
      title: '데이터가 적으면? 많으면?',
      summary: '데이터 양을 바꿔 가며 예측 정확도를 비교해요.',
      activity: '학습 데이터 5개, 20개, 50개로 예측해 정확도 그래프를 그려요.',
      missions: [{ id: 'ch6-p3-m1', kind: 'train', title: '정확도 실험', npc: 'robi', note: '정확도 막대그래프 자동 생성.' }],
    },
    {
      id: 'ch6-boss',
      kind: 'boss',
      title: '별자리 미궁',
      summary: '별똥 여우의 행동 기록으로 다음 행동을 예측하며 미궁을 빠져나가요.',
      activity: '예측 모듈이 몹의 다음 행동 확률을 보여 주는 전투. 기록을 많이 모을수록 예측이 정확해져요.',
      missions: [
        { id: 'ch6-boss-m1', kind: 'battle', title: '별똥 여우', npc: 'robi', note: '행동 예고 대신 기록 기반 확률 표시.' },
        { id: 'ch6-boss-m2', kind: 'reflect', title: '로비에게 설명하기', npc: 'robi', note: '탐색과 학습의 차이.' },
      ],
    },
  ],
};
