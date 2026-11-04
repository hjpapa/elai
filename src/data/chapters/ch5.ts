import type { Chapter } from '../schema';

export const ch5: Chapter = {
  id: 'ch5',
  index: 5,
  title: '인식의 연구소',
  grades: '5~6학년',
  summary: '컴퓨터가 그림을 보는 방법을 알고, 데이터에 이름표를 붙여 분류 AI를 학습시켜요.',
  concepts: ['컴퓨터의 인식(그림 = 숫자 격자)', '특징', '분류', '지도학습', '군집 맛보기', '데이터 편향'],
  goals: [
    '컴퓨터가 그림을 숫자(픽셀)로 받아들인다는 것을 안다.',
    '대상을 구별하는 특징을 찾는다.',
    '이름표(라벨)를 붙인 데이터로 분류 모델을 학습시키고 테스트한다.',
    '학습 데이터가 치우치면 결과도 치우친다는 것을 체험한다.',
  ],
  standards: { silgwa: ['6실05-04', '6실05-05'], aiContent: ['인식', '분류', '기계학습'], ai4k12: ['인식', '학습'] },
  robiPart: 'learningChip',
  dungeon: '진짜 문 골라내기(분류)',
  mobs: ['shapeSlime'],
  status: 'planned',
  badge: 'badge-5',
  parts: [
    {
      id: 'ch5-p1',
      kind: 'part',
      title: '컴퓨터의 눈',
      summary: '그림이 숫자 격자로 바뀌는 것을 보고, 구별하는 특징을 찾아요.',
      activity: '픽셀 격자를 칠해 그림을 숫자로 바꾸고, 사과와 토마토를 구별하는 특징(색·모양·꼭지)을 골라요.',
      missions: [{ id: 'ch5-p1-m1', kind: 'classify', title: '픽셀 돋보기', npc: 'robi', note: '8×8 픽셀 칠하기 → 숫자 보기. 특징 카드 고르기.' }],
    },
    {
      id: 'ch5-p2',
      kind: 'part',
      title: '이름표 붙이기',
      summary: '데이터에 이름표를 붙이고, 이름표 없이 비슷한 것끼리도 묶어 봐요.',
      activity: '지도학습(이름표 있음)과 군집(이름표 없이 묶기)을 비교해요.',
      missions: [{ id: 'ch5-p2-m1', kind: 'classify', title: '표본 정리', npc: 'robi', note: '라벨링 20장 + 이름표 없이 묶기 활동.' }],
    },
    {
      id: 'ch5-p3',
      kind: 'part',
      title: '나만의 분류 AI',
      summary: '내가 모은 데이터로 AI를 학습시키고 시험해요.',
      activity: '라벨링 → 학습(가까운 이웃 찾기) → 테스트. 한쪽 데이터만 많이 넣으면 정확도가 어떻게 바뀌는지 확인해요.',
      missions: [{ id: 'ch5-p3-m1', kind: 'train', title: '로비 학습 칩', npc: 'robi', note: 'KNN(k=3) 시각화. 학습시킨 모델이 로비의 분류 카드가 됨.' }],
    },
    {
      id: 'ch5-boss',
      kind: 'boss',
      title: '섞인 표본',
      summary: '친구 몹과 장난꾸러기 몹이 섞인 무리를 내가 학습시킨 AI로 구별해요.',
      activity: '분류 카드(내 모델)로 장난꾸러기 몹만 골라 정화하는 전투. 잘못 분류하면 결과로 바로 보여요.',
      missions: [
        { id: 'ch5-boss-m1', kind: 'battle', title: '변신 슬라임 무리', npc: 'robi', note: '분류 정확도가 전투 결과에 반영.' },
        { id: 'ch5-boss-m2', kind: 'reflect', title: '로비에게 설명하기', npc: 'robi', note: '지도학습 과정과 데이터 편향.' },
      ],
    },
  ],
};
