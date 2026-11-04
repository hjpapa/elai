import type { Chapter } from '../schema';

export const ch3: Chapter = {
  id: 'ch3',
  index: 3,
  title: '갈림길 사막',
  grades: '4~5학년',
  summary: '"만약 ~라면" 조건으로 상황에 맞게 움직이는 프로그램을 만들어요.',
  concepts: ['조건(만약 ~라면)', '센서(입력)', '규칙으로 판단하기(결정 트리 맛보기)'],
  goals: [
    '센서로 받은 정보에 따라 다르게 동작하는 조건 프로그램을 만든다.',
    '로봇의 센서·처리 장치·구동 장치의 역할을 안다.',
    '질문 규칙을 이어 분류하는 방법(결정 트리)을 체험한다.',
  ],
  standards: { silgwa: ['6실05-02', '6실04-04', '6실04-05', '6실04-06'], aiContent: ['추론(규칙)'], ai4k12: ['인식(센서)', '표현과 추론'] },
  robiPart: 'sensor',
  dungeon: '오른손 규칙 프로그램으로 자동 탈출하는 모래 미로',
  mobs: ['mirageLizard'],
  status: 'planned',
  badge: 'badge-3',
  parts: [
    {
      id: 'ch3-p1',
      kind: 'part',
      title: '신호등 규칙',
      summary: '"만약 빨간불이라면 멈춰요"처럼 규칙을 만들어요.',
      activity: '신호 색에 따라 다르게 움직이는 조건 블록 퍼즐.',
      missions: [{ id: 'ch3-p1-m1', kind: 'blockCode', title: '모래 신호등', npc: 'robi', note: 'allowIf: wallAhead/pathAhead. 매번 다른 배치로 실행해 조건이 꼭 필요하게.' }],
    },
    {
      id: 'ch3-p2',
      kind: 'part',
      title: '센서 로봇',
      summary: '센서로 장애물을 알아차리고 피해 가요.',
      activity: '상대 이동(앞으로·돌기)과 센서 조건을 섞어 장애물을 피하는 로봇 프로그램.',
      missions: [{ id: 'ch3-p2-m1', kind: 'blockCode', title: '바위 피하기', npc: 'robi', note: 'forward/turnLeft/turnRight + if wallAhead. 무작위 바위 배치 3회 모두 성공해야 통과.' }],
    },
    {
      id: 'ch3-p3',
      kind: 'part',
      title: '스무고개 AI',
      summary: '"예/아니요" 질문을 이어 동물을 맞히는 규칙을 만들어요.',
      activity: '질문 규칙을 나무 모양으로 이어 분류하는 결정 트리 맛보기(규칙 기반 AI).',
      missions: [{ id: 'ch3-p3-m1', kind: 'classify', title: '사막 동물 맞히기', npc: 'robi', note: '질문 카드(날개가 있나요? 다리가 4개인가요?)로 트리를 만들고 동물 8마리를 분류.' }],
    },
    {
      id: 'ch3-boss',
      kind: 'boss',
      title: '모래 폭풍 미로',
      summary: '오른손 규칙으로 미로를 빠져나가고, 자세를 바꾸는 신기루 도마뱀을 고쳐요.',
      activity: '조건+반복으로 미로 자동 탈출, 행동 예고가 가려진 조건 전투, 로비에게 설명하기.',
      missions: [
        { id: 'ch3-boss-m1', kind: 'blockCode', title: '오른손 규칙', npc: 'robi', note: '반복 { 만약 오른쪽이 비었으면 오른쪽으로 돌고 앞으로, 아니면 … } 로 어떤 미로든 탈출.' },
        { id: 'ch3-boss-m2', kind: 'battle', title: '신기루 도마뱀', npc: 'robi', note: '행동 예고가 가려짐 → enemyAttack/enemyGuard 조건 카드 필요.' },
      ],
    },
  ],
};
