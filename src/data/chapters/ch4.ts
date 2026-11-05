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
  mobs: ['fogJelly', 'ledgerOcto'],
  status: 'playable',
  entryMap: 'harbor',
  badge: 'badge-4',
  parts: [
    {
      id: 'ch4-p1',
      kind: 'part',
      title: '데이터 모으기',
      summary: '항구의 물고기 데이터를 모으고 종류를 나눠요.',
      activity: '숫자·글자·소리·그림 데이터 나누기, 아날로그(시계 바늘)와 디지털(숫자 시계) 비교.',
      missions: [
  {
    "id": "ch4-p1-m1",
    "kind": "classify",
    "title": "아날로그와 디지털",
    "npc": "harborKeeper",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "sort",
      "intro": "연속으로 바뀌면 아날로그예요.\n값을 나눠 기록하면 디지털이에요.",
      "cards": [
        {
          "id": "needle",
          "label": "눈금 사이를 움직이는 온도계",
          "group": "analog",
          "features": []
        },
        {
          "id": "record",
          "label": "소리의 흔들림을 그대로 새긴 음반",
          "group": "analog",
          "features": []
        },
        {
          "id": "clock",
          "label": "숫자로 시간을 표시하는 시계",
          "group": "digital",
          "features": []
        },
        {
          "id": "audio",
          "label": "소리를 0과 1로 저장한 파일",
          "group": "digital",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "analog",
          "label": "아날로그"
        },
        {
          "id": "digital",
          "label": "디지털"
        }
      ],
      "hint": "아날로그는 연속된 값으로 나타내요.\n디지털은 구분된 값으로 기록해요.",
      "explain": "같은 소리도 기록하는 방법에 따라\n아날로그나 디지털이 될 수 있어요."
    }
  },
  {
    "id": "ch4-p1-m2",
    "kind": "classify",
    "title": "데이터 상자 정리",
    "npc": "harborKeeper",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "sort",
      "intro": "기록의 종류를 살펴봐요.\n숫자·글·그림·소리로 나눠요.",
      "cards": [
        {
          "id": "count",
          "label": "물고기 수 12",
          "group": "number",
          "features": []
        },
        {
          "id": "height",
          "label": "물결 높이 3",
          "group": "number",
          "features": []
        },
        {
          "id": "temp",
          "label": "물 온도 18도",
          "group": "number",
          "features": []
        },
        {
          "id": "name",
          "label": "물고기 이름: 붕어",
          "group": "text",
          "features": []
        },
        {
          "id": "memo",
          "label": "관찰 메모: 천천히 헤엄쳐요",
          "group": "text",
          "features": []
        },
        {
          "id": "rule",
          "label": "항구 약속: 차례대로 걸어요",
          "group": "text",
          "features": []
        },
        {
          "id": "fish",
          "label": "물고기 사진",
          "group": "image",
          "features": []
        },
        {
          "id": "map",
          "label": "항구 지도 그림",
          "group": "image",
          "features": []
        },
        {
          "id": "sign",
          "label": "구명조끼 모양 그림",
          "group": "image",
          "features": []
        },
        {
          "id": "wave",
          "label": "파도 녹음",
          "group": "sound",
          "features": []
        },
        {
          "id": "bell",
          "label": "배 종소리 녹음",
          "group": "sound",
          "features": []
        },
        {
          "id": "bird",
          "label": "갈매기 울음 녹음",
          "group": "sound",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "number",
          "label": "숫자"
        },
        {
          "id": "text",
          "label": "글"
        },
        {
          "id": "image",
          "label": "그림"
        },
        {
          "id": "sound",
          "label": "소리"
        }
      ],
      "hint": "어떤 내용을 담았는지 살펴봐요.\n숫자인지, 글·그림·소리인지 봐요.",
      "explain": "AI는 여러 종류의 데이터를 써요.\n종류를 알면 알맞게 정리할 수 있어요."
    }
  }
],
    },
    {
      id: 'ch4-p2',
      kind: 'part',
      title: '표와 그래프',
      summary: '모은 데이터를 표와 막대그래프로 나타내요.',
      activity: '스캔한 몹 데이터를 표로 정리하고 막대그래프를 만들어 가장 많은 것·적은 것을 읽어요.',
      missions: [
  {
    "id": "ch4-p2-m1",
    "kind": "classify",
    "title": "물결 기록표",
    "npc": "harborKeeper",
    "reward": {
      "xp": 15
    },
    "data": {
      "mode": "table",
      "intro": "물결 관찰 기록 여섯 개를 세어요.\n표를 채우고 막대 길이를 비교해요.",
      "cards": [
        {
          "id": "o1",
          "label": "1번 기록: 낮음",
          "group": "low",
          "features": []
        },
        {
          "id": "o2",
          "label": "2번 기록: 높음",
          "group": "high",
          "features": []
        },
        {
          "id": "o3",
          "label": "3번 기록: 낮음",
          "group": "low",
          "features": []
        },
        {
          "id": "o4",
          "label": "4번 기록: 중간",
          "group": "middle",
          "features": []
        },
        {
          "id": "o5",
          "label": "5번 기록: 중간",
          "group": "middle",
          "features": []
        },
        {
          "id": "o6",
          "label": "6번 기록: 낮음",
          "group": "low",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "low",
          "label": "낮음"
        },
        {
          "id": "middle",
          "label": "중간"
        },
        {
          "id": "high",
          "label": "높음"
        }
      ],
      "hint": "같은 이름이 몇 번 나오는지 세어요.\n낮음은 세 번 기록됐어요.",
      "explain": "많이 기록될수록 막대가 길어요.\n표와 그래프로 쉽게 비교할 수 있어요."
    }
  },
  {
    "id": "ch4-p2-m2",
    "kind": "quiz",
    "title": "물결 그래프 읽기",
    "npc": "harborKeeper",
    "reward": {
      "xp": 10
    },
    "data": {
      "intro": "낮음 3번, 중간 2번, 높음 1번이에요.\n기록표를 떠올리며 답해 봐요.",
      "questions": [
        {
          "q": "가장 긴 막대는 무엇일까요?",
          "choices": [
            "낮음",
            "중간",
            "높음"
          ],
          "answer": 0,
          "explain": "낮음이 세 번으로 가장 많아요.\n막대도 가장 길어요."
        },
        {
          "q": "높음과 낮음의 기록 수 차이는?",
          "choices": [
            "1번",
            "2번",
            "3번"
          ],
          "answer": 1,
          "explain": "세 번에서 한 번을 빼면\n두 번 차이가 나요."
        },
        {
          "q": "기록이 적은데 단정해도 될까요?",
          "choices": [
            "한 번 보면 충분해요",
            "무조건 같은 일이 생겨요",
            "더 모으고 비교해 봐요"
          ],
          "answer": 2,
          "explain": "기록이 적으면 놓치는 일이 있어요.\n더 모아 살펴보면 도움이 돼요."
        }
      ]
    }
  }
],
    },
    {
      id: 'ch4-p3',
      kind: 'part',
      title: '이진수 등대',
      summary: '불빛 0과 1로 숫자와 글자를 나타내요.',
      activity: '등대 불빛 켜짐(1)/꺼짐(0)으로 숫자를 만들어 문을 열어요. 컴퓨터가 모든 데이터를 0과 1로 저장한다는 것을 알아요.',
      missions: [
  {
    "id": "ch4-p3-m1",
    "kind": "classify",
    "title": "등대 신호",
    "npc": "harborKeeper",
    "reward": {
      "xp": 20,
      "robiPart": "dataLens"
    },
    "data": {
      "mode": "binary",
      "intro": "켜진 등불은 1, 꺼진 등불은 0이에요.\n자리 값을 더해 목표 수를 만들어요.",
      "cards": [
        {
          "id": "gate3",
          "label": "첫째 문: 3",
          "group": "3",
          "features": []
        },
        {
          "id": "gate5",
          "label": "둘째 문: 5",
          "group": "5",
          "features": []
        },
        {
          "id": "gate10",
          "label": "마지막 문: 10",
          "group": "10",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "8",
          "label": "8의 자리"
        },
        {
          "id": "4",
          "label": "4의 자리"
        },
        {
          "id": "2",
          "label": "2의 자리"
        },
        {
          "id": "1",
          "label": "1의 자리"
        }
      ],
      "hint": "5는 4와 1의 등불을 켜요.\n10은 8과 2의 등불을 켜요.",
      "explain": "0과 1로 수를 나타냈어요.\n데이터 렌즈와 등대 문이 열렸어요."
    }
  }
],
    },
    {
      id: 'ch4-boss',
      kind: 'boss',
      title: '엉망 장부',
      summary: '빠지고 잘못된 데이터를 고쳐 안개 해파리를 정화해요.',
      activity: '빈칸·중복·잘못된 값을 찾아 고치는 데이터 전처리, 도감 데이터로 약점을 찾는 전투.',
      missions: [
  {
    "id": "ch4-boss-m1",
    "kind": "classify",
    "title": "장부 고치기",
    "npc": "ledgerOcto",
    "reward": {
      "xp": 20
    },
    "data": {
      "mode": "sort",
      "intro": "원본 기록과 장부를 비교해요.\n빠짐·겹침·잘못된 값을 고쳐요.",
      "cards": [
        {
          "id": "missing",
          "label": "원본 3마리 / 장부 빈칸",
          "group": "fill",
          "features": []
        },
        {
          "id": "duplicate",
          "label": "같은 관찰 번호가 두 줄 있어요",
          "group": "remove",
          "features": []
        },
        {
          "id": "unit",
          "label": "원본 1kg / 장부 1000kg",
          "group": "unit",
          "features": []
        },
        {
          "id": "correct",
          "label": "원본 2마리 / 장부 2마리",
          "group": "keep",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "fill",
          "label": "빈칸을 3으로 채워요"
        },
        {
          "id": "remove",
          "label": "겹친 줄 하나를 지워요"
        },
        {
          "id": "unit",
          "label": "1kg으로 고쳐요"
        },
        {
          "id": "keep",
          "label": "그대로 둬요"
        }
      ],
      "hint": "짐작해서 빈칸을 채우지 않아요.\n원본 자료를 보고 고쳐요.",
      "explain": "쓰기 전에 자료를 정리하는 일을\n전처리라고 해요."
    }
  },
  {
    "id": "ch4-boss-m2",
    "kind": "battle",
    "title": "장부 문어 대장",
    "npc": "ledgerOcto",
    "reward": {
      "xp": 50,
      "coins": 45,
      "flags": [
        "ledger-fixed"
      ]
    },
    "data": {
      "mob": "ledgerOcto",
      "intro": "물결 높이와 행동을 기록해요.\n살펴보기 카드로 자료를 모아요.",
      "hint": "먼저 살펴보고 남은 칸은 막아요.\n다음에는 물결 높이 조건을 써요."
    }
  },
  {
    "id": "ch4-boss-m3",
    "kind": "quiz",
    "title": "데이터 퀴즈",
    "npc": "ledgerOcto",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "컴퓨터는 데이터를 무엇으로 저장할까요?",
          "choices": [
            "0과 1",
            "마법 주문",
            "바닷물"
          ],
          "answer": 0,
          "explain": "숫자·글·그림·소리 모두\n컴퓨터에서는 0과 1로 나타내요."
        },
        {
          "q": "같은 관찰을 두 번 적었다면?",
          "choices": [
            "더 큰 값으로 바꿔요",
            "원본을 확인해 겹친 줄을 지워요",
            "그냥 더해요"
          ],
          "answer": 1,
          "explain": "겹친 기록을 두 번 세면\n결과가 달라질 수 있어요."
        },
        {
          "q": "물결 기록을 모으면 무엇이 좋을까요?",
          "choices": [
            "모든 미래를 확실히 알아요",
            "틀린 기록도 정답이 돼요",
            "값과 행동 사이 규칙을 찾아요"
          ],
          "answer": 2,
          "explain": "자료를 나란히 놓고 비교하면\n규칙을 찾는 데 도움이 돼요."
        }
      ]
    }
  },
  {
    "id": "ch4-boss-m4",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-4",
      "title": "데이터 기록가",
      "items": [
        {
          "id": "dataVest",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-4",
        "ch4-clear"
      ]
    },
    "data": {
      "prompt": "데이터에 대해 배운 것을 알려 줘요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "데이터에는 숫자·글·그림·소리가 있어요.",
          "correct": true
        },
        {
          "text": "표와 그래프로 자료를 비교할 수 있어요.",
          "correct": true
        },
        {
          "text": "빠지거나 겹친 기록을 확인해야 해요.",
          "correct": true
        },
        {
          "text": "빈칸은 아무 수로 채워도 괜찮아요.",
          "correct": false
        },
        {
          "text": "컴퓨터는 소리를 저장할 수 없어요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
