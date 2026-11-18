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
  mobs: ['shapeSlime', 'shiftKing'],
  status: 'playable',
  entryMap: 'lab',
  badge: 'badge-5',
  parts: [
    {
      id: 'ch5-p1',
      kind: 'part',
      title: '컴퓨터의 눈',
      summary: '그림이 숫자 격자로 바뀌는 것을 보고, 구별하는 특징을 찾아요.',
      activity: '픽셀 격자를 칠해 그림을 숫자로 바꾸고, 사과와 토마토를 구별하는 특징(색·모양·꼭지)을 골라요.',
      missions: [
  {
    "id": "ch5-p1-m1",
    "kind": "classify",
    "title": "픽셀 돋보기",
    "npc": "researcher",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "pixels",
      "intro": "픽셀은 그림을 이루는 작은 칸이에요.\n숫자 1인 칸을 켜서 그림을 만들어요.",
      "cards": [
        {
          "id": "robi",
          "label": "로비의 작은 불빛",
          "group": "pixel",
          "features": [
            "0110",
            "1111",
            "0110",
            "0010"
          ]
        }
      ],
      "groups": [],
      "hint": "1은 켜고, 0은 꺼 둬요.\n줄과 칸을 하나씩 맞춰 봐요.",
      "explain": "컴퓨터는 그림도 수로 받아들여요.\n칸마다 색을 숫자로 나타낼 수 있어요."
    }
  },
  {
    "id": "ch5-p1-m2",
    "kind": "quiz",
    "title": "구별하는 특징",
    "npc": "researcher",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "빨간 사과와 빨간 토마토를 가려야\n해요. 어떤 특징을 더 볼까요?",
          "choices": [
            "빨간색의 이름",
            "바구니에 놓인 순서",
            "꼭지와 모양"
          ],
          "answer": 2,
          "explain": "두 종류에 같은 색이 있으면\n모양처럼 다른 특징도 보아요."
        },
        {
          "q": "그림을 키우니 작은 색 칸이\n보여요. 픽셀은 무엇일까요?",
          "choices": [
            "그림을 이루는 한 칸",
            "같은 색 칸을 모은 줄",
            "그림 전체의 가로 길이"
          ],
          "answer": 0,
          "explain": "작은 색 칸들이 모여\n하나의 그림을 이루어요."
        }
      ]
    }
  }
],
    },
    {
      id: 'ch5-p2',
      kind: 'part',
      title: '이름표 붙이기',
      summary: '데이터에 이름표를 붙이고, 이름표 없이 비슷한 것끼리도 묶어 봐요.',
      activity: '지도학습(이름표 있음)과 군집(이름표 없이 묶기)을 비교해요.',
      missions: [
  {
    "id": "ch5-p2-m1",
    "kind": "classify",
    "title": "표본 정리",
    "npc": "researcher",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "sort",
      "intro": "이번 실험의 표본에 이름표를 붙여요.\n친구와 장난꾸러기의 특징을 봐요.",
      "cards": [
        {
          "id": "label0",
          "label": "표본 1: 높이 1, 점 1",
          "group": "friend",
          "features": []
        },
        {
          "id": "label1",
          "label": "표본 2: 높이 2, 점 2",
          "group": "friend",
          "features": []
        },
        {
          "id": "label2",
          "label": "표본 3: 높이 3, 점 3",
          "group": "friend",
          "features": []
        },
        {
          "id": "label3",
          "label": "표본 4: 높이 1, 점 1",
          "group": "friend",
          "features": []
        },
        {
          "id": "label4",
          "label": "표본 5: 높이 2, 점 2",
          "group": "friend",
          "features": []
        },
        {
          "id": "label5",
          "label": "표본 6: 높이 3, 점 3",
          "group": "friend",
          "features": []
        },
        {
          "id": "label6",
          "label": "표본 7: 높이 1, 점 1",
          "group": "friend",
          "features": []
        },
        {
          "id": "label7",
          "label": "표본 8: 높이 2, 점 2",
          "group": "friend",
          "features": []
        },
        {
          "id": "label8",
          "label": "표본 9: 높이 3, 점 3",
          "group": "friend",
          "features": []
        },
        {
          "id": "label9",
          "label": "표본 10: 높이 1, 점 1",
          "group": "friend",
          "features": []
        },
        {
          "id": "label10",
          "label": "표본 11: 높이 8, 점 8",
          "group": "playful",
          "features": []
        },
        {
          "id": "label11",
          "label": "표본 12: 높이 9, 점 9",
          "group": "playful",
          "features": []
        },
        {
          "id": "label12",
          "label": "표본 13: 높이 7, 점 7",
          "group": "playful",
          "features": []
        },
        {
          "id": "label13",
          "label": "표본 14: 높이 8, 점 8",
          "group": "playful",
          "features": []
        },
        {
          "id": "label14",
          "label": "표본 15: 높이 9, 점 9",
          "group": "playful",
          "features": []
        },
        {
          "id": "label15",
          "label": "표본 16: 높이 7, 점 7",
          "group": "playful",
          "features": []
        },
        {
          "id": "label16",
          "label": "표본 17: 높이 8, 점 8",
          "group": "playful",
          "features": []
        },
        {
          "id": "label17",
          "label": "표본 18: 높이 9, 점 9",
          "group": "playful",
          "features": []
        },
        {
          "id": "label18",
          "label": "표본 19: 높이 7, 점 7",
          "group": "playful",
          "features": []
        },
        {
          "id": "label19",
          "label": "표본 20: 높이 8, 점 8",
          "group": "playful",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "friend",
          "label": "친구"
        },
        {
          "id": "playful",
          "label": "장난꾸러기"
        }
      ],
      "hint": "높이·점이 1~3이면 친구예요.\n7~9이면 장난꾸러기로 붙여요.",
      "explain": "정답 이름표를 붙인 예시로 배우는 것을\n지도학습이라고 해요."
    }
  },
  {
    "id": "ch5-p2-m2",
    "kind": "classify",
    "title": "이름 없이 묶기",
    "npc": "researcher",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "cluster",
      "intro": "이번에는 종류 이름표가 없어요.\n특징이 비슷한 표본끼리 묶어요.",
      "cards": [
        {
          "id": "cluster0",
          "label": "표본 1: 높이 1, 점 1",
          "group": "a",
          "features": []
        },
        {
          "id": "cluster1",
          "label": "표본 2: 높이 1, 점 3",
          "group": "a",
          "features": []
        },
        {
          "id": "cluster2",
          "label": "표본 3: 높이 3, 점 1",
          "group": "a",
          "features": []
        },
        {
          "id": "cluster3",
          "label": "표본 4: 높이 3, 점 3",
          "group": "a",
          "features": []
        },
        {
          "id": "cluster4",
          "label": "표본 5: 높이 7, 점 7",
          "group": "b",
          "features": []
        },
        {
          "id": "cluster5",
          "label": "표본 6: 높이 7, 점 9",
          "group": "b",
          "features": []
        },
        {
          "id": "cluster6",
          "label": "표본 7: 높이 9, 점 7",
          "group": "b",
          "features": []
        },
        {
          "id": "cluster7",
          "label": "표본 8: 높이 9, 점 9",
          "group": "b",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "a",
          "label": "묶음 1"
        },
        {
          "id": "b",
          "label": "묶음 2"
        }
      ],
      "hint": "높이와 점 수가 가까운 것끼리 묶어요.\n묶음 이름보다 함께 모인 것을 봐요.",
      "explain": "이름표 없이 비슷한 것을 묶는 것이\n군집이에요. 이름표 학습과 달라요."
    }
  }
],
    },
    {
      id: 'ch5-p3',
      kind: 'part',
      title: '나만의 분류 AI',
      summary: '내가 모은 데이터로 AI를 학습시키고 시험해요.',
      activity: '라벨링 → 학습(가까운 이웃 찾기) → 테스트. 한쪽 데이터만 많이 넣으면 정확도가 어떻게 바뀌는지 확인해요.',
      missions: [
  {
    "id": "ch5-p3-m1",
    "kind": "train",
    "title": "로비 학습 칩",
    "npc": "researcher",
    "reward": {
      "xp": 25,
      "robiPart": "learningChip"
    },
    "data": {
      "intro": "먼저 친구 예시만 가르쳐요.\n두 종류를 가르친 뒤와 비교해요.",
      "features": [
        "뛰는 높이",
        "점무늬 수"
      ],
      "labels": [
        {
          "id": "friend",
          "label": "친구"
        },
        {
          "id": "playful",
          "label": "장난꾸러기"
        }
      ],
      "examples": [
        {
          "id": "sample1",
          "features": [
            1,
            1
          ],
          "label": "friend"
        },
        {
          "id": "sample2",
          "features": [
            1,
            3
          ],
          "label": "friend"
        },
        {
          "id": "sample3",
          "features": [
            3,
            1
          ],
          "label": "friend"
        },
        {
          "id": "sample4",
          "features": [
            3,
            3
          ],
          "label": "friend"
        },
        {
          "id": "sample5",
          "features": [
            7,
            7
          ],
          "label": "playful"
        },
        {
          "id": "sample6",
          "features": [
            7,
            9
          ],
          "label": "playful"
        },
        {
          "id": "sample7",
          "features": [
            9,
            7
          ],
          "label": "playful"
        },
        {
          "id": "sample8",
          "features": [
            9,
            9
          ],
          "label": "playful"
        }
      ],
      "tests": [
        {
          "id": "test1",
          "features": [
            2,
            1
          ],
          "label": "friend"
        },
        {
          "id": "test2",
          "features": [
            2,
            3
          ],
          "label": "friend"
        },
        {
          "id": "test3",
          "features": [
            8,
            7
          ],
          "label": "playful"
        },
        {
          "id": "test4",
          "features": [
            8,
            9
          ],
          "label": "playful"
        }
      ],
      "minExamples": 6,
      "k": 3,
      "threshold": 1,
      "saveModel": true,
      "hint": "1~3은 친구, 7~9는 장난꾸러기예요.\n두 종류에서 고르게 예시를 골라요.",
      "explain": "가까운 예시 세 개로 이름표를 정해요.\n학습한 모델을 전투에서 써 봐요.",
      "comparison": {
        "trials": [
          {
            "id": "friendOnly",
            "label": "친구 예시만",
            "examples": [
              "sample1",
              "sample2",
              "sample3",
              "sample4"
            ]
          },
          {
            "id": "both",
            "label": "두 종류 모두",
            "examples": [
              "sample1",
              "sample2",
              "sample3",
              "sample4",
              "sample5",
              "sample6",
              "sample7",
              "sample8"
            ]
          }
        ],
        "finalTrial": "both",
        "question": "친구 예시만 배운 모델은 왜 틀렸을까요?",
        "choices": [
          "장난꾸러기를 본 적이 없어서요",
          "시험 문제가 너무 적어서요",
          "예시에 숫자가 있어서요"
        ],
        "answer": 0
      }
    }
  },
        {
          "id": "ch5-p3-x1",
          "kind": "train",
          "title": "헷갈리는 표본",
          "npc": "researcher",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "features": [
              "뛰는 높이",
              "점무늬 수"
            ],
            "labels": [
              {
                "id": "friend",
                "label": "친구"
              },
              {
                "id": "playful",
                "label": "장난꾸러기"
              }
            ],
            "examples": [
              {
                "id": "e1",
                "features": [
                  1,
                  1
                ],
                "label": "friend"
              },
              {
                "id": "e2",
                "features": [
                  1,
                  3
                ],
                "label": "friend"
              },
              {
                "id": "e3",
                "features": [
                  3,
                  1
                ],
                "label": "friend"
              },
              {
                "id": "e4",
                "features": [
                  3,
                  3
                ],
                "label": "friend"
              },
              {
                "id": "e5",
                "features": [
                  7,
                  7
                ],
                "label": "playful"
              },
              {
                "id": "e6",
                "features": [
                  7,
                  9
                ],
                "label": "playful"
              },
              {
                "id": "e7",
                "features": [
                  9,
                  7
                ],
                "label": "playful"
              },
              {
                "id": "e8",
                "features": [
                  9,
                  9
                ],
                "label": "playful"
              }
            ],
            "tests": [
              {
                "id": "t1",
                "features": [
                  2,
                  2
                ],
                "label": "friend"
              },
              {
                "id": "t2",
                "features": [
                  8,
                  8
                ],
                "label": "playful"
              },
              {
                "id": "t3",
                "features": [
                  2,
                  3
                ],
                "label": "friend"
              },
              {
                "id": "t4",
                "features": [
                  4,
                  4
                ],
                "label": "playful"
              }
            ],
            "minExamples": 8,
            "k": 3,
            "saveModel": false,
            "threshold": 0.75,
            "presetLabels": true,
            "intro": "연구원이 경계 표본을 가져왔어요.\n두 가지 특징만으로 나눠 봐요.",
            "hint": "비슷해 보이는 표본도 있어요.\n예상과 실제 이름표를 대조해요.",
            "explain": "모든 예시를 써도 틀릴 수 있어요.\n사람이 다시 살펴봐야 해요."
          }
        }
      ],
    },
    {
      id: 'ch5-boss',
      kind: 'boss',
      title: '섞인 표본',
      summary: '친구 몹과 장난꾸러기 몹이 섞인 무리를 내가 학습시킨 AI로 구별해요.',
      activity: '분류 카드(내 모델)로 장난꾸러기 몹만 골라 정화하는 전투. 잘못 분류하면 결과로 바로 보여요.',
      missions: [
  {
    "id": "ch5-boss-m1",
    "kind": "battle",
    "title": "변신 슬라임 무리",
    "npc": "shiftKing",
    "reward": {
      "xp": 55,
      "coins": 50,
      "flags": [
        "shift-fixed"
      ]
    },
    "data": {
      "mob": "shiftKing",
      "intro": "모습을 바꾸는 슬라임을 살펴봐요.\n내가 학습한 모델로 구별해요.",
      "hint": "모델이 장난꾸러기라면 공격해요.\n친구라면 공격하지 말고 기다려요."
    }
  },
  {
    "id": "ch5-boss-quiz",
    "kind": "quiz",
    "title": "학습 퀴즈",
    "npc": "shiftKing",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "연구원이 표본마다 종류를 적고 AI에\n보여 줘요. AI는 무엇으로 배울까요?",
          "choices": [
            "시험할 때 알려 준 정답",
            "특징과 이름표의 짝",
            "모은 표본의 차례만"
          ],
          "answer": 1,
          "explain": "이름표가 있는 예시에서 특징과\n종류의 관계를 배워요."
        },
        {
          "q": "친구 표본만 배운 로비가 장난꾸러기\n표본을 봤어요. 예상되는 일은요?",
          "choices": [
            "친구로 잘못 고를 수 있어요",
            "새 이름표를 저절로 만들어요",
            "예전 표본과 같은 만큼 맞혀요"
          ],
          "answer": 0,
          "explain": "배운 이름표가 한쪽에만 있으면\n다른 종류를 구별하기 어려워요."
        },
        {
          "q": "학습에 쓴 표본을 모두 맞혔어요.\n다음 시험에 쓸 것은요?",
          "choices": [
            "이름표를 외운 표본",
            "점수가 가장 높았던 표본",
            "처음 보는 표본"
          ],
          "answer": 2,
          "explain": "새 표본으로 시험해야 처음 보는\n상황도 구별하는지 알 수 있어요."
        }
      ]
    }
  },
  {
    "id": "ch5-boss-m2",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-5",
      "title": "학습 연구가",
      "items": [
        {
          "id": "researchBoots",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-5",
        "ch5-clear"
      ]
    },
    "data": {
      "prompt": "분류 AI가 배우는 방법을 알려 줘요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "그림도 숫자 격자로 나타낼 수 있어요.",
          "correct": true
        },
        {
          "text": "이름표를 붙인 예시로 배울 수 있어요.",
          "correct": true
        },
        {
          "text": "치우친 예시는 판단을 흐릴 수 있어요.",
          "correct": true
        },
        {
          "text": "친구 예시만 있으면 모든 것을 알아요.",
          "correct": false
        },
        {
          "text": "배운 뒤에는 시험하지 않아도 돼요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
