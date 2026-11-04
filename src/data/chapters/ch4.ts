import type { Chapter } from '../schema';

export const ch4: Chapter = {
  id: 'ch4',
  index: 4,
  title: '데이터 항구',
  grades: '5학년',
  summary: '데이터를 모으고 정리해서 표와 그래프로 나타내요.',
  concepts: ['아날로그·디지털 데이터', '데이터의 종류(숫자·글자·소리·그림)', '수집·정리·시각화', '0과 1', '데이터 전처리'],
  goals: [
    '디지털 데이터와 아날로그 데이터의 특징을 비교한다.',
    'AI에 쓸 수 있는 데이터의 종류를 안다.',
    '데이터를 모아 표와 그래프로 나타내고 해석한다.',
    '잘못되거나 빠진 데이터를 찾아 정리한다.',
  ],
  standards: { silgwa: ['6실05-04'], aiContent: ['데이터'], ai4k12: ['학습(데이터)'] },
  robiPart: 'dataLens',
  dungeon: '이진수 신호로 여는 등대 문',
  mobs: ['fogJelly'],
  status: 'planned',
  badge: 'badge-4',
  parts: [
    {
      id: 'ch4-p1',
      kind: 'part',
      title: '데이터 모으기',
      summary: '항구의 물고기 데이터를 모으고 종류를 나눠요.',
      activity: '숫자·글자·소리·그림 데이터 나누기, 아날로그(시계 바늘)와 디지털(숫자 시계) 비교.',
      missions: [{ id: 'ch4-p1-m1', kind: 'classify', title: '데이터 상자 정리', npc: 'robi', note: '카드 12장을 숫자/글자/소리/그림, 아날로그/디지털로 분류.' }],
    },
    {
      id: 'ch4-p2',
      kind: 'part',
      title: '표와 그래프',
      summary: '모은 데이터를 표와 막대그래프로 나타내요.',
      activity: '스캔한 몹 데이터를 표로 정리하고 막대그래프를 만들어 가장 많은 것·적은 것을 읽어요.',
      missions: [{ id: 'ch4-p2-m1', kind: 'quiz', title: '항구 장부 읽기', npc: 'robi', note: '그래프 만들기 미니게임 + 해석 퀴즈. 도감 데이터와 연결.' }],
    },
    {
      id: 'ch4-p3',
      kind: 'part',
      title: '이진수 등대',
      summary: '불빛 0과 1로 숫자와 글자를 나타내요.',
      activity: '등대 불빛 켜짐(1)/꺼짐(0)으로 숫자를 만들어 문을 열어요. 컴퓨터가 모든 데이터를 0과 1로 저장한다는 것을 알아요.',
      missions: [{ id: 'ch4-p3-m1', kind: 'quiz', title: '등대 신호', npc: 'robi', note: '4비트 전등 토글 미니게임.' }],
    },
    {
      id: 'ch4-boss',
      kind: 'boss',
      title: '엉망 장부',
      summary: '빠지고 잘못된 데이터를 고쳐 안개 해파리를 정화해요.',
      activity: '빈칸·중복·잘못된 값을 찾아 고치는 데이터 전처리, 도감 데이터로 약점을 찾는 전투.',
      missions: [
        { id: 'ch4-boss-m1', kind: 'classify', title: '장부 고치기', npc: 'robi', note: '전처리: 빈칸 채우기, 중복 지우기, 단위 맞추기.' },
        { id: 'ch4-boss-m2', kind: 'battle', title: '안개 해파리', npc: 'robi', note: '스캔 카드로 모은 데이터 표를 보고 약점 속성 고르기.' },
      ],
    },
  ],
};
