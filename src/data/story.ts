import type { DialogueLine } from './schema';

export const STORIES: Record<string, {enter: DialogueLine[]; clear: DialogueLine[]}> = {
  ch1: {
    enter: [
      { who: 'ranger', text: '집게가 씨앗보다 물을 먼저 줘요.' },
      { who: 'robi', text: '혼자 일한 지 오래됐대요.' },
      { who: 'ranger', text: '함께 할 일부터 줄을 세워요.' },
    ],
    clear: [
      { who: 'ranger', text: '이젠 씨앗을 심고 물을 줘요.' },
      { who: 'robi', text: '하던 일을 차례로 살폈어요.' },
      { who: 'ranger', text: '작은 싹이 고개를 들었어요.' },
    ],
  },
  ch2: {
    enter: [
      { who: 'explorer', text: '수레가 같은 돌만 옮겨요.' },
      { who: 'robi', text: '언제 멈출지 잊었나 봐요.' },
      { who: 'explorer', text: '몇 번 옮길지 함께 세어 봐요.' },
    ],
    clear: [
      { who: 'explorer', text: '돌을 옮긴 수레가 섰어요.' },
      { who: 'robi', text: '같은 일을 묶으니 편해졌어요.' },
      { who: 'explorer', text: '멈출 때도 약속한 덕분이에요.' },
    ],
  },
  ch3: {
    enter: [
      { who: 'guide', text: '모래 봇이 바위에 부딪혀요.' },
      { who: 'robi', text: '앞이 막힌 걸 못 봤나 봐요.' },
      { who: 'guide', text: '어떤 신호인지 같이 살펴요.' },
    ],
    clear: [
      { who: 'guide', text: '바위 앞에서 길을 돌았어요.' },
      { who: 'robi', text: '길이 트이면 다시 앞으로 가요.' },
      { who: 'guide', text: '상황에 맞게 고른 거예요.' },
    ],
  },
  ch4: {
    enter: [
      { who: 'harborKeeper', text: '상자는 셋인데 기록은 넷이에요.' },
      { who: 'robi', text: '같은 줄이 두 번 적혔어요.' },
      { who: 'harborKeeper', text: '빠진 상자도 함께 찾아봐요.' },
    ],
    clear: [
      { who: 'harborKeeper', text: '상자와 장부가 딱 맞아요.' },
      { who: 'robi', text: '빠진 줄을 채우고 겹친 줄을 뺐어요.' },
      { who: 'harborKeeper', text: '믿고 쓸 기록이 생겼어요.' },
    ],
  },
  ch5: {
    enter: [
      { who: 'researcher', text: '표본 상자의 이름표가 섞였어요.' },
      { who: 'robi', text: '닮은 둘을 어떻게 가를까요?' },
      { who: 'researcher', text: '예시부터 하나씩 살펴봐요.' },
    ],
    clear: [
      { who: 'researcher', text: '새 표본에도 이름표를 골랐어요.' },
      { who: 'robi', text: '처음 보는 예시로 시험했어요.' },
      { who: 'researcher', text: '틀린 것도 함께 살펴봐요.' },
    ],
  },
  ch6: {
    enter: [
      { who: 'astronomer', text: '비 온 날에도 맑다고 했어요.' },
      { who: 'robi', text: '무슨 기록으로 짐작했을까요?' },
      { who: 'astronomer', text: '예보와 하늘을 같이 살펴요.' },
    ],
    clear: [
      { who: 'astronomer', text: '오늘 하늘을 기록에 보탰어요.' },
      { who: 'robi', text: '어제 예보와 나란히 보니 달라요.' },
      { who: 'astronomer', text: '다음 예보도 다시 확인해요.' },
    ],
  },
  ch7: {
    enter: [
      { who: 'zen', text: '그럴듯한 답인데 책과 달라요.' },
      { who: 'robi', text: '어디서 나온 말인지 물어봐요.' },
      { who: 'zen', text: '질문을 바꿔 근거를 찾아요.' },
    ],
    clear: [
      { who: 'zen', text: '근거가 있는 줄을 찾았어요.' },
      { who: 'robi', text: '말이 술술 나와도 틀릴 수 있어요.' },
      { who: 'zen', text: '답을 쓰기 전에 확인해요.' },
    ],
  },
  ch8: {
    enter: [
      { who: 'keeper', text: '벽에는 같은 모습만 보여요.' },
      { who: 'robi', text: '누가 그림에서 빠졌을까요?' },
      { who: 'keeper', text: '빈자리의 이야기도 들어 봐요.' },
    ],
    clear: [
      { who: 'keeper', text: '이제 여러 모습이 함께 보여요.' },
      { who: 'robi', text: '기계와 사람이 함께 살폈어요.' },
      { who: 'keeper', text: '중요한 결정은 사람이 살펴요.' },
    ],
  },
};
