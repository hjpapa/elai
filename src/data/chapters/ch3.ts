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
  mobs: ['mirageLizard', 'lizardChief'],
  status: 'playable',
  entryMap: 'desert',
  badge: 'badge-3',
  parts: [
    {
      id: 'ch3-p1',
      kind: 'part',
      title: '신호등 규칙',
      summary: '"만약 빨간불이라면 멈춰요"처럼 규칙을 만들어요.',
      activity: '신호 색에 따라 다르게 움직이는 조건 블록 퍼즐.',
      missions: [
  {
    "id": "ch3-p1-m1",
    "kind": "blockCode",
    "title": "모래 신호등",
    "npc": "guide",
    "reward": {
      "xp": 15
    },
    "data": {
      "intro": "빨간 신호 앞에서는 잠깐 기다려요.\n초록으로 바뀌면 앞으로 가요.",
      "grid": [
        "S!..G"
      ],
      "palette": [
        "forward",
        "wait"
      ],
      "allowRepeat": true,
      "allowIf": [
        "signalRed"
      ],
      "optimal": 4,
      "maxBlocks": 4,
      "hint": "반복 안에 만약을 넣어요.\n빨강이면 쉬고, 아니면 앞으로 가요.",
      "explain": "조건은 무엇을 할지 정하는 기준이에요.\n신호에 맞게 다르게 움직였어요."
    }
  }
],
    },
    {
      id: 'ch3-p2',
      kind: 'part',
      title: '센서 로봇',
      summary: '센서로 장애물을 알아차리고 피해 가요.',
      activity: '상대 이동(앞으로·돌기)과 센서 조건을 섞어 장애물을 피하는 로봇 프로그램.',
      missions: [
  {
    "id": "ch3-p2-m1",
    "kind": "blockCode",
    "title": "바위 피하기",
    "npc": "guide",
    "reward": {
      "xp": 15
    },
    "data": {
      "intro": "센서로 앞에 막힌 칸이 있는지 봐요.\n막혔으면 돌고, 아니면 앞으로 가요.",
      "grid": [
        "S..#",
        "##.#",
        "##G#"
      ],
      "startDir": "right",
      "palette": [
        "forward",
        "turnRight"
      ],
      "allowRepeat": true,
      "allowIf": [
        "wallAhead"
      ],
      "optimal": 4,
      "maxBlocks": 4,
      "hint": "만약 앞이 막혔으면 오른쪽으로 돌아요.\n아니면 앞으로 가요. 반복도 써요.",
      "explain": "센서는 주변을 알아내는 장치예요.\n조건에 따라 다른 명령을 실행해요."
    }
  },
  {
    "id": "ch3-p2-m2",
    "kind": "blockCode",
    "title": "다른 길에서도",
    "npc": "guide",
    "reward": {
      "xp": 15
    },
    "data": {
      "intro": "센서로 앞에 막힌 칸이 있는지 봐요.\n막혔으면 돌고, 아니면 앞으로 가요.",
      "grid": [
        "S..",
        "##.",
        "G.."
      ],
      "startDir": "right",
      "palette": [
        "forward",
        "turnRight"
      ],
      "allowRepeat": true,
      "allowIf": [
        "wallAhead"
      ],
      "optimal": 4,
      "maxBlocks": 4,
      "hint": "만약 앞이 막혔으면 오른쪽으로 돌아요.\n아니면 앞으로 가요. 반복도 써요.",
      "explain": "센서는 주변을 알아내는 장치예요.\n조건에 따라 다른 명령을 실행해요."
    }
  },
  {
    "id": "ch3-p2-m3",
    "kind": "blockCode",
    "title": "더 긴 센서 길",
    "npc": "guide",
    "reward": {
      "xp": 15,
      "robiPart": "sensor"
    },
    "data": {
      "intro": "센서로 앞에 막힌 칸이 있는지 봐요.\n막혔으면 돌고, 아니면 앞으로 가요.",
      "grid": [
        "S...",
        "###.",
        "#G.."
      ],
      "startDir": "right",
      "palette": [
        "forward",
        "turnRight"
      ],
      "allowRepeat": true,
      "allowIf": [
        "wallAhead"
      ],
      "optimal": 4,
      "maxBlocks": 4,
      "hint": "만약 앞이 막혔으면 오른쪽으로 돌아요.\n아니면 앞으로 가요. 반복도 써요.",
      "explain": "센서는 주변을 알아내는 장치예요.\n조건에 따라 다른 명령을 실행해요."
    }
  }
],
    },
    {
      id: 'ch3-p3',
      kind: 'part',
      title: '스무고개 AI',
      summary: '"예/아니요" 질문을 이어 동물을 맞히는 규칙을 만들어요.',
      activity: '질문 규칙을 나무 모양으로 이어 분류하는 결정 트리 맛보기(규칙 기반 AI).',
      missions: [
  {
    "id": "ch3-p3-m1",
    "kind": "classify",
    "title": "사막 동물 맞히기",
    "npc": "guide",
    "reward": {
      "xp": 20
    },
    "data": {
      "mode": "tree",
      "intro": "질문을 골라 동물 카드를 나눠요.\n끝마다 한 종류만 남게 해요.",
      "cards": [
        {
          "id": "sparrow",
          "label": "참새",
          "group": "bird",
          "features": [
            "wings",
            "feathers"
          ]
        },
        {
          "id": "owl",
          "label": "부엉이",
          "group": "bird",
          "features": [
            "wings",
            "feathers"
          ]
        },
        {
          "id": "cat",
          "label": "고양이",
          "group": "mammal",
          "features": [
            "fur"
          ]
        },
        {
          "id": "fox",
          "label": "여우",
          "group": "mammal",
          "features": [
            "fur"
          ]
        },
        {
          "id": "carp",
          "label": "붕어",
          "group": "fish",
          "features": []
        },
        {
          "id": "trout",
          "label": "송어",
          "group": "fish",
          "features": []
        },
        {
          "id": "bee",
          "label": "벌",
          "group": "insect",
          "features": [
            "wings"
          ]
        },
        {
          "id": "butterfly",
          "label": "나비",
          "group": "insect",
          "features": [
            "wings"
          ]
        }
      ],
      "groups": [
        {
          "id": "bird",
          "label": "새"
        },
        {
          "id": "mammal",
          "label": "포유류"
        },
        {
          "id": "fish",
          "label": "물고기"
        },
        {
          "id": "insect",
          "label": "곤충"
        }
      ],
      "questions": [
        {
          "id": "wings",
          "label": "날개가 있나요?",
          "feature": "wings"
        },
        {
          "id": "feathers",
          "label": "깃털이 있나요?",
          "feature": "feathers"
        },
        {
          "id": "fur",
          "label": "털이 있나요?",
          "feature": "fur"
        }
      ],
      "maxQuestions": 3,
      "hint": "날개만 있으면 새와 곤충이 섞여요.\n깃털과 털도 물어봐요.",
      "explain": "질문 규칙을 잇는 것이 질문 나무예요.\n카드의 특징으로 종류를 나눴어요."
    }
  }
],
    },
    {
      id: 'ch3-boss',
      kind: 'boss',
      title: '모래 폭풍 미로',
      summary: '오른손 규칙으로 미로를 빠져나가고, 자세를 바꾸는 신기루 도마뱀을 고쳐요.',
      activity: '조건+반복으로 미로 자동 탈출, 행동 예고가 가려진 조건 전투, 로비에게 설명하기.',
      missions: [
  {
    "id": "ch3-boss-m1",
    "kind": "blockCode",
    "title": "오른손 규칙",
    "npc": "lizardChief",
    "reward": {
      "xp": 20
    },
    "data": {
      "intro": "오른쪽 길이 열리면 그쪽으로 가요.\n막혔으면 앞, 그다음 왼쪽을 봐요.",
      "grid": [
        "#########",
        "#S..#...#",
        "###.#.#G#",
        "#...#.#.#",
        "#.###.#.#",
        "#.......#",
        "#########"
      ],
      "palette": [
        "forward",
        "turnLeft",
        "turnRight"
      ],
      "allowRepeat": true,
      "allowIf": [
        "pathRight",
        "pathAhead",
        "pathLeft",
        "wallAhead"
      ],
      "optimal": 8,
      "maxBlocks": 8,
      "hint": "오른쪽 길이 있으면 돌고 앞으로 가요.\n없으면 앞으로, 막혔으면 왼쪽으로 돌아요.",
      "explain": "오른쪽 벽을 따라 미로를 나왔어요.\n모든 미로에서 통하는 것은 아니에요."
    }
  },
  {
    "id": "ch3-boss-m2",
    "kind": "battle",
    "title": "신기루 도마뱀 대장",
    "npc": "lizardChief",
    "reward": {
      "xp": 45,
      "coins": 40,
      "flags": [
        "lizard-fixed"
      ]
    },
    "data": {
      "mob": "lizardChief",
      "intro": "물음표 뒤의 행동이 바뀌어요.\n센서의 만약 카드로 살펴봐요.",
      "hint": "강타라면 막고, 아니면 공격해요.\n조건 묶음을 반복해 봐요."
    }
  },
  {
    "id": "ch3-boss-m3",
    "kind": "quiz",
    "title": "조건 퀴즈",
    "npc": "lizardChief",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "조건은 어떤 역할을 하나요?",
          "choices": [
            "상황에 맞는 행동을 골라요",
            "항상 같은 행동만 해요",
            "순서를 지워요"
          ],
          "answer": 0,
          "explain": "조건을 확인한 결과에 따라\n다른 명령을 실행해요."
        },
        {
          "q": "센서는 무엇을 하나요?",
          "choices": [
            "바퀴를 돌려요",
            "주변 정보를 알아내요",
            "정답을 모두 외워요"
          ],
          "answer": 1,
          "explain": "센서는 주변을 알아내는 입력 장치예요.\n로봇은 그 정보로 행동을 정해요."
        },
        {
          "q": "질문 하나로 종류가 섞여 있다면?",
          "choices": [
            "아무 이름이나 붙여요",
            "나누기를 포기해요",
            "다른 특징도 질문해요"
          ],
          "answer": 2,
          "explain": "구별할 수 있는 특징을 더 물으면\n같은 종류끼리 나눌 수 있어요."
        }
      ]
    }
  },
  {
    "id": "ch3-boss-m4",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-3",
      "title": "조건의 길잡이",
      "items": [
        {
          "id": "rangerhat",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-3",
        "ch3-clear"
      ]
    },
    "data": {
      "prompt": "조건과 센서에 대해 알려 줘요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "조건에 따라 다른 명령을 해요.",
          "correct": true
        },
        {
          "text": "센서는 주변 정보를 알아내요.",
          "correct": true
        },
        {
          "text": "질문 규칙으로 종류를 나눌 수 있어요.",
          "correct": true
        },
        {
          "text": "센서는 바퀴를 돌리는 장치예요.",
          "correct": false
        },
        {
          "text": "질문은 언제나 하나면 충분해요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
