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
  mobs: ['cometFox', 'starFox'],
  status: 'playable',
  entryMap: 'observatory',
  badge: 'badge-6',
  parts: [
    {
      id: 'ch6-p1',
      kind: 'part',
      title: '물결 탐색',
      summary: '물결이 퍼지듯 길을 살펴 가장 짧은 길을 찾아요.',
      activity: '출발점에서 한 걸음, 두 걸음… 칸에 번호를 매기며 퍼져 나가는 탐색(너비 우선 탐색)을 손으로 해 보고 화면으로 확인해요.',
      missions: [
  {
    "id": "ch6-p1-m1",
    "kind": "classify",
    "title": "별빛 미로",
    "npc": "astronomer",
    "reward": {
      "xp": 20
    },
    "data": {
      "mode": "search",
      "intro": "한 걸음씩 물결을 퍼뜨려 봐요.\n숫자를 보며 가장 짧은 길을 골라요.",
      "cards": [
        {
          "id": "maze",
          "label": "별빛 길",
          "group": "path",
          "features": [
            "#######",
            "#S....#",
            "#.###.#",
            "#...#.#",
            "###.#.#",
            "#...#G#",
            "#######"
          ]
        }
      ],
      "groups": [],
      "hint": "낮은 숫자부터 하나씩 이어 가요.\n벽을 건너뛰거나 멀리 뛰지 않아요.",
      "explain": "가까운 칸부터 차례로 살펴보면\n걸음 수가 가장 적은 길을 찾아요."
    }
  }
],
    },
    {
      id: 'ch6-p2',
      kind: 'part',
      title: '날씨 예측',
      summary: '지난 날씨 기록으로 내일 날씨를 예측해요.',
      activity: '구름 양·바람 데이터를 보고 비가 올지 예측하고, 실제 결과와 비교해요.',
      missions: [
  {
    "id": "ch6-p2-m1",
    "kind": "train",
    "title": "천문대 일기 예보",
    "npc": "astronomer",
    "reward": {
      "xp": 20
    },
    "data": {
      "intro": "연습용 날씨 기록으로 배워요.\n처음 보는 기록의 날씨를 예측해요.",
      "features": [
        "구름 양",
        "바람 세기",
        "습도"
      ],
      "labels": [
        {
          "id": "sunny",
          "label": "맑음"
        },
        {
          "id": "rain",
          "label": "비"
        }
      ],
      "examples": [
        {
          "id": "weather1",
          "features": [
            1,
            1,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "weather2",
          "features": [
            2,
            2,
            1
          ],
          "label": "sunny"
        },
        {
          "id": "weather3",
          "features": [
            1,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "weather4",
          "features": [
            3,
            1,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "weather5",
          "features": [
            7,
            7,
            8
          ],
          "label": "rain"
        },
        {
          "id": "weather6",
          "features": [
            8,
            8,
            7
          ],
          "label": "rain"
        },
        {
          "id": "weather7",
          "features": [
            7,
            9,
            8
          ],
          "label": "rain"
        },
        {
          "id": "weather8",
          "features": [
            9,
            7,
            9
          ],
          "label": "rain"
        }
      ],
      "tests": [
        {
          "id": "forecast1",
          "features": [
            2,
            1,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "forecast2",
          "features": [
            2,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "forecast3",
          "features": [
            8,
            7,
            8
          ],
          "label": "rain"
        },
        {
          "id": "forecast4",
          "features": [
            8,
            9,
            8
          ],
          "label": "rain"
        }
      ],
      "minExamples": 6,
      "k": 3,
      "threshold": 1,
      "presetLabels": true,
      "saveModel": false,
      "hint": "맑음과 비의 기록을 고르게 골라요.\n배운 뒤 시험 결과를 살펴봐요.",
      "explain": "이번 자료에서는 가까운 기록으로\n새 기록의 날씨를 맞혀 봤어요."
    }
  }
],
    },
    {
      id: 'ch6-p3',
      kind: 'part',
      title: '데이터가 적으면? 많으면?',
      summary: '데이터 양을 바꿔 가며 예측 정확도를 비교해요.',
      activity: '같은 시험 자료에 학습 예시 2개와 8개를 적용해 정확도 막대를 비교해요.',
      missions: [
  {
    "id": "ch6-p3-m1",
    "kind": "train",
    "title": "정확도 실험",
    "npc": "astronomer",
    "reward": {
      "xp": 20,
      "robiPart": "predictModule"
    },
    "data": {
      "intro": "같은 시험에 예시 수만 바꿔 봐요.\n두 결과의 맞힌 비율을 비교해요.",
      "features": [
        "구름 양",
        "바람 세기",
        "습도"
      ],
      "labels": [
        {
          "id": "sunny",
          "label": "맑음"
        },
        {
          "id": "rain",
          "label": "비"
        }
      ],
      "examples": [
        {
          "id": "weather1",
          "features": [
            1,
            1,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "weather2",
          "features": [
            2,
            2,
            1
          ],
          "label": "sunny"
        },
        {
          "id": "weather3",
          "features": [
            1,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "weather4",
          "features": [
            3,
            1,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "weather5",
          "features": [
            7,
            7,
            8
          ],
          "label": "rain"
        },
        {
          "id": "weather6",
          "features": [
            8,
            8,
            7
          ],
          "label": "rain"
        },
        {
          "id": "weather7",
          "features": [
            7,
            9,
            8
          ],
          "label": "rain"
        },
        {
          "id": "weather8",
          "features": [
            9,
            7,
            9
          ],
          "label": "rain"
        }
      ],
      "tests": [
        {
          "id": "forecast1",
          "features": [
            2,
            1,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "forecast2",
          "features": [
            2,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "forecast3",
          "features": [
            8,
            7,
            8
          ],
          "label": "rain"
        },
        {
          "id": "forecast4",
          "features": [
            8,
            9,
            8
          ],
          "label": "rain"
        }
      ],
      "minExamples": 6,
      "k": 3,
      "threshold": 1,
      "presetLabels": true,
      "saveModel": false,
      "hint": "맑음과 비의 기록을 고르게 골라요.\n배운 뒤 시험 결과를 살펴봐요.",
      "explain": "이번에는 고른 예시가 도움이 됐어요.\n많아도 틀린 자료라면 잘못 배워요.",
      "comparison": {
        "smallCount": 2,
        "question": "이번 시험에서 무엇을 알 수 있나요?",
        "choices": [
          "예시가 많으면 언제나 완벽해요",
          "여러 종류를 고르게 모으는 것이 좋아요",
          "예측은 절대 틀리지 않아요"
        ],
        "answer": 1
      }
    }
  }
],
    },
    {
      id: 'ch6-boss',
      kind: 'boss',
      title: '별자리 미궁',
      summary: '별똥 여우의 행동 기록으로 다음 행동을 예측하며 미궁을 빠져나가요.',
      activity: '예측 모듈이 몹의 다음 행동 확률을 보여 주는 전투. 기록으로 예측을 고치고, 기록이 있어도 틀릴 수 있음을 살펴봐요.',
      missions: [
  {
    "id": "ch6-boss-maze",
    "kind": "classify",
    "title": "별자리 길 찾기",
    "npc": "starFox",
    "reward": {
      "xp": 20
    },
    "data": {
      "mode": "search",
      "intro": "한 걸음씩 물결을 퍼뜨려 봐요.\n숫자를 보며 가장 짧은 길을 골라요.",
      "cards": [
        {
          "id": "maze",
          "label": "별빛 길",
          "group": "path",
          "features": [
            "#########",
            "#S..#...#",
            "#.#.#.#.#",
            "#.#...#.#",
            "#.#####.#",
            "#......G#",
            "#########"
          ]
        }
      ],
      "groups": [],
      "hint": "낮은 숫자부터 하나씩 이어 가요.\n벽을 건너뛰거나 멀리 뛰지 않아요.",
      "explain": "가까운 칸부터 차례로 살펴보면\n걸음 수가 가장 적은 길을 찾아요."
    }
  },
  {
    "id": "ch6-boss-m1",
    "kind": "battle",
    "title": "별똥 여우",
    "npc": "starFox",
    "reward": {
      "xp": 60,
      "coins": 55,
      "flags": [
        "star-fixed"
      ]
    },
    "data": {
      "mob": "starFox",
      "intro": "여우가 했던 행동을 기록해요.\n다음 행동의 가능성을 살펴봐요.",
      "hint": "먼저 막기로 기록을 모아요.\n위험할 것 같으면 막고, 아니면 공격해요."
    }
  },
  {
    "id": "ch6-boss-quiz",
    "kind": "quiz",
    "title": "예측 퀴즈",
    "npc": "starFox",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "물결 탐색은 어디부터 살펴보나요?",
          "choices": [
            "가까운 칸부터",
            "아무 칸부터",
            "가장 먼 칸부터"
          ],
          "answer": 0,
          "explain": "한 걸음, 두 걸음 거리로 넓혀 가며\n가장 짧은 길을 찾을 수 있어요."
        },
        {
          "q": "예측이 비라고 하면 꼭 비가 올까요?",
          "choices": [
            "언제나 맞아요",
            "틀릴 수도 있어요",
            "자료는 필요 없어요"
          ],
          "answer": 1,
          "explain": "예측은 기록에서 찾은 가능성이에요.\n실제 결과와 다를 수도 있어요."
        },
        {
          "q": "어떤 학습 자료가 좋을까요?",
          "choices": [
            "한 종류만 아주 많이 모아요",
            "잘못 적혀도 많기만 하면 돼요",
            "여러 상황을 정확하게 기록해요"
          ],
          "answer": 2,
          "explain": "자료의 수뿐 아니라 종류와 정확함도\n판단에 영향을 줘요."
        }
      ]
    }
  },
  {
    "id": "ch6-boss-m2",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-6",
      "title": "예측 길잡이",
      "items": [
        {
          "id": "starCap",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-6",
        "ch6-clear"
      ]
    },
    "data": {
      "prompt": "탐색과 예측을 비교해 줘요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "탐색은 가능한 길을 차례로 살펴봐요.",
          "correct": true
        },
        {
          "text": "예측은 기록에서 배운 규칙을 써요.",
          "correct": true
        },
        {
          "text": "예측은 실제와 다를 수 있어요.",
          "correct": true
        },
        {
          "text": "자료가 많으면 언제나 정확해요.",
          "correct": false
        },
        {
          "text": "틀린 예측은 확인할 필요가 없어요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
