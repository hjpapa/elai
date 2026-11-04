import type { Chapter } from '../schema';

export const ch8: Chapter = {
  id: 'ch8',
  index: 8,
  title: '윤리의 성',
  grades: '6학년',
  summary: 'AI를 공정하고 안전하게, 정직하게 쓰는 방법을 배우고 로비를 깨워요.',
  concepts: ['데이터 편향', '개인정보 보호', '딥페이크', 'AI가 만든 것 표시하기', '사람이 최종 결정'],
  goals: [
    '치우친 데이터가 불공정한 결과를 만든다는 것을 알고 고친다.',
    '개인정보를 지키는 습관을 기른다.',
    'AI가 만든 글·그림을 구별하고, AI 도움을 받았을 때 밝힌다.',
    'AI의 판단을 사람이 확인하고 책임 있게 결정해야 함을 안다.',
  ],
  standards: { silgwa: ['6실05-05', '6실04-03'], aiContent: ['AI 윤리'], ai4k12: ['사회적 영향'] },
  robiPart: 'ethicsCore',
  dungeon: '거울 미로: 진짜와 가짜 구별하기',
  mobs: ['fakeShadow', 'biasGolem'],
  status: 'planned',
  badge: 'badge-8',
  parts: [
    {
      id: 'ch8-p1',
      kind: 'part',
      title: '치우친 데이터',
      summary: '한쪽으로 치우친 데이터를 찾아요.',
      activity: '특정 모습만 많은 학습 데이터로 만든 AI가 어떤 실수를 하는지 보고, 데이터를 고르게 고쳐요.',
      missions: [{ id: 'ch8-p1-m1', kind: 'classify', title: '성의 초상화', npc: 'robi', note: '데이터 분포 막대 보고 부족한 쪽 보충하기.' }],
    },
    {
      id: 'ch8-p2',
      kind: 'part',
      title: '개인정보 지키기',
      summary: '알려 줘도 되는 정보와 지켜야 할 정보를 나눠요.',
      activity: '이름·주소·전화번호·얼굴 사진·비밀번호 등을 구별하고, 앱·AI에 입력하기 전에 생각할 점을 정리해요.',
      missions: [{ id: 'ch8-p2-m1', kind: 'classify', title: '비밀 금고', npc: 'robi', note: '정보 카드 분류 + 상황 퀴즈.' }],
    },
    {
      id: 'ch8-p3',
      kind: 'part',
      title: '진짜? 가짜?',
      summary: 'AI가 만든 그림·글을 살펴보고, AI 도움을 솔직히 밝혀요.',
      activity: '딥페이크의 위험을 알고, 친구 사진으로 장난 이미지를 만들지 않으며, 숙제에 AI 도움을 받았을 때 밝히는 방법을 연습해요.',
      missions: [{ id: 'ch8-p3-m1', kind: 'factCheck', title: '거울 속 그림자', npc: 'robi', note: '단서 찾기 + 상황 판단 퀴즈.' }],
    },
    {
      id: 'ch8-boss',
      kind: 'boss',
      title: '편향 골렘',
      summary: '치우친 데이터로 학습한 골렘을, 데이터를 고쳐 약하게 만들고 정화해요.',
      activity: '학습 데이터를 고칠수록 골렘이 약해지는 전투, 최종 퀴즈, 로비 각성(사람이 최종 결정해요).',
      missions: [
        { id: 'ch8-boss-m1', kind: 'battle', title: '편향 골렘', npc: 'robi', note: '전투 사이에 데이터셋 수정 단계. 공정해질수록 골렘 방어력 감소.' },
        { id: 'ch8-boss-m2', kind: 'reflect', title: '생각하는 AI 깨우기', npc: 'robi', note: '8장 전체 정리.' },
      ],
    },
  ],
};
