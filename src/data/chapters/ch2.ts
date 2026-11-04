import type { Chapter } from '../schema';

export const ch2: Chapter = {
  id: 'ch2',
  index: 2,
  title: '반복의 동굴',
  grades: '3~4학년',
  summary: '되풀이되는 패턴을 찾아 반복 블록으로 프로그램을 줄여요.',
  concepts: ['반복', '패턴 찾기', '효율(더 짧은 프로그램)'],
  goals: ['되풀이되는 명령의 패턴을 찾는다.', '반복 블록을 사용해 프로그램을 간단하게 만든다.'],
  standards: { silgwa: ['6실05-02'], aiContent: [], ai4k12: [] },
  robiPart: 'memoryChip',
  dungeon: '같은 구조가 되풀이되는 동굴',
  mobs: ['echoBat'],
  status: 'planned',
  badge: 'badge-2',
  parts: [
    {
      id: 'ch2-p1',
      kind: 'part',
      title: '보석 줍기 패턴',
      summary: '보석이 놓인 규칙을 찾아요.',
      activity: '같은 간격으로 놓인 보석을 줍는 프로그램을 만들고, 되풀이되는 부분을 찾아 표시해요.',
      missions: [{ id: 'ch2-p1-m1', kind: 'blockCode', title: '반짝이는 길', npc: 'robi', note: 'mustCollect 퍼즐 3개. 같은 묶음(예: 앞으로·줍기)이 3번 이상 되풀이되게 배치.' }],
    },
    {
      id: 'ch2-p2',
      kind: 'part',
      title: '반복 블록으로 줄이기',
      summary: '긴 프로그램을 반복 블록으로 짧게 만들어요.',
      activity: 'maxBlocks 제한이 있어 반복 블록을 써야만 풀리는 퍼즐. 같은 결과를 내는 긴 프로그램과 짧은 프로그램을 비교해요.',
      missions: [{ id: 'ch2-p2-m1', kind: 'blockCode', title: '블록이 모자라!', npc: 'robi', note: 'allowRepeat, maxBlocks로 반복 사용을 유도. 반복 안의 반복은 2차 후반.' }],
    },
    {
      id: 'ch2-p3',
      kind: 'part',
      title: '반복으로 무늬 그리기',
      summary: '반복으로 동굴 벽에 무늬를 그려요.',
      activity: '정사각형·계단 무늬를 반복으로 그리며, 반복 횟수를 바꾸면 무늬가 어떻게 달라지는지 예측해요.',
      missions: [{ id: 'ch2-p3-m1', kind: 'blockCode', title: '동굴 벽화', npc: 'robi', note: '그리기 모드(지나간 칸 색칠) 퍼즐. 목표 무늬와 같게 만들기.' }],
    },
    {
      id: 'ch2-boss',
      kind: 'boss',
      title: '동굴 탈출',
      summary: '같은 행동을 되풀이하는 메아리 박쥐 대장을 고쳐요.',
      activity: '전투 칸이 모자라서 반복 카드를 써야 이기는 전투(roundTicks > 슬롯 수), 개념 퀴즈, 로비에게 설명하기.',
      missions: [
        { id: 'ch2-boss-m1', kind: 'battle', title: '메아리 박쥐 대장', npc: 'robi', note: 'roundTicks 6, 슬롯 4 → 반복 카드 필요.' },
        { id: 'ch2-boss-m2', kind: 'reflect', title: '로비에게 설명하기', npc: 'robi', note: '반복의 뜻과 좋은 점.' },
      ],
    },
  ],
};
