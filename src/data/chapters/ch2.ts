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
  mobs: ['echoBat', 'batKing'],
  status: 'playable',
  entryMap: 'cave',
  badge: 'badge-2',
  parts: [
    {
      id: 'ch2-p1',
      kind: 'part',
      title: '보석 줍기 패턴',
      summary: '보석이 놓인 규칙을 찾아요.',
      activity: '같은 간격으로 놓인 보석을 줍는 프로그램을 만들고, 되풀이되는 부분을 찾아 표시해요.',
      missions: [
  {
    "id": "ch2-p1-m1",
    "kind": "blockCode",
    "title": "보석 계단",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "intro": "계단을 따라 보석을 모아요.\n어떤 움직임이 되풀이되나요?",
      "grid": [
        "S*###",
        "#**##",
        "##**#",
        "###**",
        "####G"
      ],
      "mustCollect": true,
      "optimal": 8,
      "hint": "오른쪽, 아래로 한 칸씩 가요.\n같은 묶음이 네 번 나와요.",
      "explain": "같은 규칙을 패턴이라고 해요.\n오른쪽·아래가 네 번 나왔어요."
    }
  },
  {
    "id": "ch2-p1-m2",
    "kind": "blockCode",
    "title": "톱니 보석",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "intro": "톱니 모양 길의 보석을 모아요.\n위아래로 오가며 살펴봐요.",
      "grid": [
        "******#",
        "S*****G"
      ],
      "mustCollect": true,
      "optimal": 12,
      "hint": "위·오른쪽·아래·오른쪽이에요.\n이 묶음을 세 번 놓아요.",
      "explain": "네 움직임이 한 묶음이에요.\n같은 묶음이 세 번 나왔어요."
    }
  }
],
    },
    {
      id: 'ch2-p2',
      kind: 'part',
      title: '반복 블록으로 줄이기',
      summary: '긴 프로그램을 반복 블록으로 짧게 만들어요.',
      activity: 'maxBlocks 제한이 있어 반복 블록을 써야만 풀리는 퍼즐. 같은 결과를 내는 긴 프로그램과 짧은 프로그램을 비교해요.',
      missions: [
  {
    "id": "ch2-p2-m1",
    "kind": "blockCode",
    "title": "긴 굴",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "allowRepeat": true,
      "intro": "여덟 칸을 두 블록으로 가요.\n반복 안에 오른쪽을 넣어요.",
      "grid": [
        "S.......G"
      ],
      "optimal": 2,
      "maxBlocks": 2,
      "hint": "반복 횟수를 여덟 번으로 바꿔요.\n안에는 오른쪽 하나를 넣어요.",
      "explain": "반복은 같은 일을 되풀이해요.\n여덟 명령을 두 블록으로 줄였어요."
    }
  },
  {
    "id": "ch2-p2-m2",
    "kind": "blockCode",
    "title": "계단 줄이기",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "allowRepeat": true,
      "intro": "아까의 보석 계단을 다시 가요.\n이번에는 반복으로 줄여 봐요.",
      "grid": [
        "S*###",
        "#**##",
        "##**#",
        "###**",
        "####G"
      ],
      "mustCollect": true,
      "optimal": 3,
      "maxBlocks": 4,
      "hint": "반복 안에 오른쪽·아래를 넣어요.\n네 번 되풀이해요.",
      "explain": "반복 안의 순서도 중요해요.\n같은 길을 짧게 나타냈어요."
    }
  },
  {
    "id": "ch2-p2-m3",
    "kind": "blockCode",
    "title": "세 번 꺾기",
    "npc": "explorer",
    "reward": {
      "xp": 15,
      "robiPart": "memoryChip"
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "allowRepeat": true,
      "intro": "오른쪽 두 칸, 아래 한 칸이에요.\n세 번 꺾인 길을 따라가요.",
      "grid": [
        "S..####",
        "##...##",
        "####...",
        "######G"
      ],
      "optimal": 4,
      "maxBlocks": 4,
      "hint": "오른쪽·오른쪽·아래를 묶어요.\n반복 횟수는 세 번이에요.",
      "explain": "메모리 칩을 찾았어요!\n전투에서도 반복을 써 봐요."
    }
  }
],
    },
    {
      id: 'ch2-p3',
      kind: 'part',
      title: '반복으로 무늬 그리기',
      summary: '반복으로 동굴 벽에 무늬를 그려요.',
      activity: '계단·톱니 무늬를 반복으로 그리며, 반복 횟수를 바꾸면 무늬가 어떻게 달라지는지 예측해요.',
      missions: [
  {
    "id": "ch2-p3-m1",
    "kind": "blockCode",
    "title": "계단 벽화",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "allowRepeat": true,
      "intro": "로비가 지나간 칸에 색이 칠해져요.\n점선의 계단을 모두 칠해요.",
      "grid": [
        "S.###",
        "#..##",
        "##..#",
        "###..",
        "####."
      ],
      "paint": [
        "xx...",
        ".xx..",
        "..xx.",
        "...xx",
        "....x"
      ],
      "optimal": 3,
      "maxBlocks": 4,
      "hint": "시작 칸도 이미 칠해졌어요.\n오른쪽·아래를 네 번 반복해요.",
      "explain": "되풀이되는 움직임으로\n계단 무늬를 완성했어요."
    }
  },
  {
    "id": "ch2-p3-m2",
    "kind": "blockCode",
    "title": "톱니 벽화",
    "npc": "explorer",
    "reward": {
      "xp": 15
    },
    "data": {
      "palette": [
        "up",
        "down",
        "left",
        "right"
      ],
      "allowRepeat": true,
      "intro": "톱니 무늬를 모두 칠해요.\n점선 밖은 칠하지 않아요.",
      "grid": [
        "......#",
        "S......"
      ],
      "paint": [
        "xxxxxx.",
        "xxxxxxx"
      ],
      "optimal": 5,
      "maxBlocks": 5,
      "hint": "위·오른쪽·아래·오른쪽이에요.\n세 번 되풀이하면 맞아요.",
      "explain": "무늬를 완성했어요!\n되풀이 동굴 안쪽이 열렸어요."
    }
  }
],
    },
    {
      id: 'ch2-boss',
      kind: 'boss',
      title: '동굴 탈출',
      summary: '같은 행동을 되풀이하는 메아리 박쥐 대장을 고쳐요.',
      activity: '전투 칸이 모자라서 반복 카드를 써야 이기는 전투(roundTicks > 슬롯 수), 개념 퀴즈, 로비에게 설명하기.',
      missions: [
  {
    "id": "ch2-boss-m1",
    "kind": "battle",
    "title": "메아리 박쥐 대장",
    "npc": "batKing",
    "reward": {
      "xp": 40,
      "coins": 35,
      "flags": [
        "batking-fixed"
      ]
    },
    "data": {
      "mob": "batKing",
      "intro": "대장의 예고가 되풀이돼요.\n반복으로 열두 칸을 채워요.",
      "hint": "쉬기·공격·막기·공격을\n세 번 반복해 봐요."
    }
  },
  {
    "id": "ch2-boss-m2",
    "kind": "quiz",
    "title": "반복 퀴즈",
    "npc": "batKing",
    "reward": {
      "xp": 10
    },
    "data": {
      "intro": "메아리가 다시 고르게 울려요.\n배운 것을 함께 떠올려 봐요.",
      "questions": [
        {
          "q": "반복은 어떤 뜻일까요?",
          "choices": [
            "같은 일을 여러 번 되풀이해요",
            "모든 순서를 뒤집어요",
            "아무 일이나 골라요"
          ],
          "answer": 0,
          "explain": "같은 일을 되풀이하는 것이\n반복이에요."
        },
        {
          "q": "반복을 쓰면 왜 블록이 줄까요?",
          "choices": [
            "할 일을 빼먹기 때문이에요",
            "같은 묶음을 한 번만 적어요",
            "로비가 알아서 고쳐요"
          ],
          "answer": 1,
          "explain": "같은 묶음을 한 번만 적고\n몇 번 할지 정하기 때문이에요."
        },
        {
          "q": "위·아래·위·아래의 묶음은?",
          "choices": [
            "위·위",
            "아래·아래",
            "위·아래"
          ],
          "answer": 2,
          "explain": "위·아래라는 묶음이\n두 번 되풀이돼요."
        }
      ]
    }
  },
  {
    "id": "ch2-boss-m3",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-2",
      "title": "반복의 탐험가",
      "items": [
        {
          "id": "windboots",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-2",
        "ch2-clear"
      ]
    },
    "data": {
      "prompt": "반복에 대해 설명해 줘요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "반복은 같은 일을 되풀이해요.",
          "correct": true
        },
        {
          "text": "반복 안의 명령도 순서대로 해요.",
          "correct": true
        },
        {
          "text": "반복으로 프로그램을 줄일 수 있어요.",
          "correct": true
        },
        {
          "text": "반복 횟수는 결과와 상관없어요.",
          "correct": false
        },
        {
          "text": "반복은 순서를 저절로 고쳐 줘요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
