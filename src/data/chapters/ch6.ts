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
  },
        {
          "id": "ch6-p1-x1",
          "kind": "classify",
          "title": "두 갈래 별길",
          "npc": "astronomer",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "mode": "search",
            "intro": "별 우체통까지 두 길이 이어져요.\n걸음 수가 적은 길을 골라요.",
            "cards": [
              {
                "id": "lanes",
                "label": "별 우체통",
                "group": "path",
                "features": [
                  "#######",
                  "#S....#",
                  "#.###.#",
                  "#.###.#",
                  "#.###.#",
                  "#.###G#",
                  "#.....#",
                  "#######"
                ]
              }
            ],
            "groups": [],
            "hint": "깃발보다 아래로 내려가면\n다시 올라오는 걸음도 세어야 해요.",
            "explain": "이어진 길이 여럿일 때에는\n걸음 수를 비교해 길을 골라요."
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
  },
        {
          "id": "ch6-p2-x1",
          "kind": "train",
          "title": "별똥별 관측 예보",
          "npc": "astronomer",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "features": [
              "구름 양",
              "달빛",
              "바람 세기"
            ],
            "labels": [
              {
                "id": "seen",
                "label": "보여요"
              },
              {
                "id": "hidden",
                "label": "안 보여요"
              }
            ],
            "examples": [
              {
                "id": "e1",
                "features": [
                  1,
                  1,
                  2
                ],
                "label": "seen"
              },
              {
                "id": "e2",
                "features": [
                  2,
                  2,
                  1
                ],
                "label": "seen"
              },
              {
                "id": "e3",
                "features": [
                  1,
                  3,
                  1
                ],
                "label": "seen"
              },
              {
                "id": "e4",
                "features": [
                  3,
                  1,
                  2
                ],
                "label": "seen"
              },
              {
                "id": "e5",
                "features": [
                  7,
                  8,
                  7
                ],
                "label": "hidden"
              },
              {
                "id": "e6",
                "features": [
                  9,
                  8,
                  8
                ],
                "label": "hidden"
              },
              {
                "id": "e7",
                "features": [
                  8,
                  7,
                  9
                ],
                "label": "hidden"
              },
              {
                "id": "e8",
                "features": [
                  8,
                  9,
                  8
                ],
                "label": "hidden"
              }
            ],
            "tests": [
              {
                "id": "t1",
                "features": [
                  2,
                  1,
                  1
                ],
                "label": "seen"
              },
              {
                "id": "t2",
                "features": [
                  8,
                  8,
                  9
                ],
                "label": "hidden"
              },
              {
                "id": "t3",
                "features": [
                  1,
                  2,
                  3
                ],
                "label": "seen"
              },
              {
                "id": "t4",
                "features": [
                  9,
                  9,
                  7
                ],
                "label": "hidden"
              }
            ],
            "minExamples": 8,
            "k": 3,
            "saveModel": false,
            "threshold": 1,
            "presetLabels": true,
            "intro": "섬의 관측 연습 기록을 읽어요.\n그날 별똥별이 보였을까요?",
            "hint": "새 기록과 비슷한 날에는\n별똥별을 보았는지 살펴봐요.",
            "explain": "이 모델은 연습 기록으로 예측해요.\n실제 밤하늘은 더 복잡해요."
          }
        }
      ],
    },
    {
      id: 'ch6-p3',
      kind: 'part',
      title: '데이터가 적으면? 많으면?',
      summary: '데이터 양을 바꿔 가며 예측 정확도를 비교해요.',
      activity: '같은 시험 자료에 학습 예시 수와 이름표를 바꾸어 정확도 막대를 비교해요.',
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
      "intro": "구름·바람·습도 기록으로 비를 예측해요.\n예시 수만 바꾸며 시험해 봐요.",
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
          "id": "sky1",
          "features": [
            3,
            4,
            4
          ],
          "label": "sunny"
        },
        {
          "id": "sky2",
          "features": [
            9,
            5,
            6
          ],
          "label": "rain"
        },
        {
          "id": "sky3",
          "features": [
            3,
            3,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "sky4",
          "features": [
            2,
            6,
            8
          ],
          "label": "rain"
        },
        {
          "id": "sky5",
          "features": [
            8,
            3,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "sky6",
          "features": [
            7,
            6,
            8
          ],
          "label": "rain"
        },
        {
          "id": "sky7",
          "features": [
            7,
            3,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "sky8",
          "features": [
            7,
            4,
            6
          ],
          "label": "rain"
        },
        {
          "id": "sky9",
          "features": [
            9,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "sky10",
          "features": [
            3,
            4,
            7
          ],
          "label": "rain"
        },
        {
          "id": "sky11",
          "features": [
            8,
            3,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "sky12",
          "features": [
            2,
            4,
            6
          ],
          "label": "rain"
        }
      ],
      "tests": [
        {
          "id": "skyTest1",
          "features": [
            2,
            3,
            4
          ],
          "label": "sunny"
        },
        {
          "id": "skyTest2",
          "features": [
            9,
            6,
            8
          ],
          "label": "rain"
        },
        {
          "id": "skyTest3",
          "features": [
            9,
            4,
            3
          ],
          "label": "sunny"
        },
        {
          "id": "skyTest4",
          "features": [
            3,
            5,
            7
          ],
          "label": "rain"
        },
        {
          "id": "skyTest5",
          "features": [
            2,
            2,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "skyTest6",
          "features": [
            8,
            5,
            7
          ],
          "label": "rain"
        },
        {
          "id": "skyTest7",
          "features": [
            8,
            2,
            2
          ],
          "label": "sunny"
        },
        {
          "id": "skyTest8",
          "features": [
            1,
            6,
            6
          ],
          "label": "rain"
        }
      ],
      "minExamples": 12,
      "k": 3,
      "threshold": 1,
      "presetLabels": true,
      "saveModel": false,
      "hint": "맑음과 비는 늘 같은 수예요.\n막대가 어떻게 달라지는지 봐요.",
      "explain": "여러 상황을 고루 보면 더 잘 맞혀요.\n이름표가 틀리면 많아도 나빠져요.",
      "comparison": {
        "trials": [
          {
            "id": "amount2",
            "label": "예시 2개",
            "examples": [
              "sky1",
              "sky2"
            ]
          },
          {
            "id": "amount4",
            "label": "예시 4개",
            "examples": [
              "sky1",
              "sky2",
              "sky3",
              "sky4"
            ]
          },
          {
            "id": "amount8",
            "label": "예시 8개",
            "examples": [
              "sky1",
              "sky2",
              "sky3",
              "sky4",
              "sky5",
              "sky6",
              "sky7",
              "sky8"
            ]
          },
          {
            "id": "amount12",
            "label": "예시 12개",
            "examples": [
              "sky1",
              "sky2",
              "sky3",
              "sky4",
              "sky5",
              "sky6",
              "sky7",
              "sky8",
              "sky9",
              "sky10",
              "sky11",
              "sky12"
            ]
          },
          {
            "id": "noisy12",
            "label": "12개, 이름표 3개 틀림",
            "examples": [
              "sky1",
              "sky2",
              "sky3",
              "sky4",
              "sky5",
              "sky6",
              "sky7",
              "sky8",
              "sky9",
              "sky10",
              "sky11",
              "sky12"
            ],
            "wrongLabels": {
              "sky4": "sunny",
              "sky7": "rain",
              "sky12": "sunny"
            }
          }
        ],
        "finalTrial": "amount12",
        "question": "이번 실험에서 알 수 있는 것은?",
        "choices": [
          "고른 자료가 늘수록 더 잘 맞혔어요",
          "예시가 많으면 언제나 100%예요",
          "이름표가 틀려도 많기만 하면 돼요"
        ],
        "answer": 0
      }
    }
  },
        {
          "id": "ch6-p3-x1",
          "kind": "quiz",
          "title": "정확도 막대 읽기",
          "npc": "astronomer",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "intro": "관측소의 다섯 막대를 읽어요.\n무엇을 바꾼 시험인지 살펴봐요.",
            "questions": [
              {
                "q": "예시 2·4·8·12개의 막대가 50·75·88·100%예요. 이번 자료에서 보인 변화는요?",
                "choices": [
                  "시험할 때마다 시험지가 달라졌어요",
                  "고른 예시가 늘며 더 잘 맞혔어요",
                  "이름표가 많아 시험 수가 줄었어요"
                ],
                "answer": 1,
                "explain": "같은 시험에서 예시 수를 늘렸어요."
              },
              {
                "q": "12개에 틀린 이름표를 섞으니 75%예요. 어느 막대와 비교할까요?",
                "choices": [
                  "예시 2개의 50%",
                  "예시 8개의 88%",
                  "바른 이름표 12개의 100%"
                ],
                "answer": 2,
                "explain": "예시 수가 같아야 이름표의 영향을 살펴요."
              },
              {
                "q": "여덟 시험을 모두 맞혔어요. 새날의 예측은요?",
                "choices": [
                  "새 기록으로 다시 확인해요",
                  "여덟 시험을 그대로 되풀이해요",
                  "한 번 맞혔으니 계속 믿어요"
                ],
                "answer": 0,
                "explain": "이번 결과만으로 다른 날도 모두 맞힐지는 몰라요."
              }
            ]
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
      "intro": "별빛 미궁이 더 넓어졌어요.\n물결 숫자로 짧은 길을 찾아요.",
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
      "hint": "깃발에 닿은 숫자를 살펴봐요.\n한 칸씩 줄어드는 길을 짚어요.",
      "explain": "넓은 미궁에도 물결이 퍼져요.\n깃발의 숫자가 가장 적은 걸음 수예요."
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
