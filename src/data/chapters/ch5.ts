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
          "q": "사과와 토마토가 둘 다 빨갛다면?",
          "choices": [
            "빨강만으로 완전히 구별해요",
            "모양과 꼭지도 함께 살펴봐요",
            "둘은 무조건 같은 종류예요"
          ],
          "answer": 1,
          "explain": "특징은 대상을 구별하는 단서예요.\n여러 특징을 함께 살펴봐요."
        },
        {
          "q": "픽셀은 무엇일까요?",
          "choices": [
            "그림을 이루는 작은 칸",
            "컴퓨터의 이름",
            "그림의 제목"
          ],
          "answer": 0,
          "explain": "작은 칸마다 색을 나타내면\n칸들이 모여 그림이 돼요."
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
      "intro": "예시에 이름표를 붙여 학습해요.\n처음 보는 표본으로 시험해 봐요.",
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
      "explain": "가까운 예시 세 개로 이름표를 정해요.\n학습한 모델을 전투에서 써 봐요."
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
          "q": "이름표를 붙인 예시로 배우는 것은?",
          "choices": [
            "지도학습",
            "무작위 추측",
            "자료 지우기"
          ],
          "answer": 0,
          "explain": "입력과 정답 이름표를 함께 보고\n분류하는 규칙을 배워요."
        },
        {
          "q": "친구 예시만 넣으면 어떻게 될까요?",
          "choices": [
            "모든 종류를 완벽히 알아요",
            "장난꾸러기를 잘못 알아볼 수 있어요",
            "시험이 필요 없어요"
          ],
          "answer": 1,
          "explain": "한쪽으로 치우친 예시만 보면\n다른 종류를 구별하기 어려워요."
        },
        {
          "q": "학습 뒤 새 표본으로 시험하는 까닭은?",
          "choices": [
            "외운 예시만 확인하려고",
            "이름표를 없애려고",
            "처음 보는 것에도 맞는지 보려고"
          ],
          "answer": 2,
          "explain": "배운 예시와 다른 표본으로\n잘 구별하는지 확인해야 해요."
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
