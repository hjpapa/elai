import type { Chapter } from '../schema';

export const ch8: Chapter = {
  id: 'ch8',
  index: 8,
  title: '윤리의 성',
  grades: '6학년',
  summary: 'AI를 공정하고 안전하게, 정직하게 쓰는 방법을 배우고 로비를 깨워요.',
  concepts: ['데이터 편향', '개인정보 보호', '딥페이크', 'AI가 만든 것 표시하기', '사람이 최종 결정'],
  goals: [
    '치우친 데이터가 불공정한 결과를 만든다는 것을 알고 고친다.',
    '개인정보를 지키는 습관을 기른다.',
    'AI가 만든 글·그림을 구별하고, AI 도움을 받았을 때 밝힌다.',
    'AI의 판단을 사람이 확인하고 책임 있게 결정해야 함을 안다.',
  ],
  standards: { silgwa: ['6실05-05', '6실04-03'], aiContent: ['AI 윤리'], ai4k12: ['사회적 영향'] },
  robiPart: 'ethicsCore',
  dungeon: '거울 미로: 진짜와 가짜 구별하기',
  mobs: ['fakeShadow', 'biasGolem'],
  status: 'playable',
  entryMap: 'castle',
  badge: 'badge-8',
  parts: [
    {
      id: 'ch8-p1',
      kind: 'part',
      title: '치우친 데이터',
      summary: '한쪽으로 치우친 데이터를 찾아요.',
      activity: '특정 모습만 많은 학습 데이터로 만든 AI가 어떤 실수를 하는지 보고, 데이터를 고르게 고쳐요.',
      missions: [
  {
    "id": "ch8-p1-m1",
    "kind": "classify",
    "title": "성의 초상화",
    "npc": "keeper",
    "reward": {
      "xp": 25,
      "flags": [
        "ch8-balanced"
      ]
    },
    "data": {
      "mode": "balance",
      "intro": "이 섬에는 바퀴·발·날개 로봇이\n실제로 네 대씩 살고 있어요.",
      "initialCounts": {
        "wheel": 8,
        "leg": 2,
        "wing": 0
      },
      "cards": [
        {
          "id": "wheel-1",
          "label": "바퀴 로봇 1호",
          "group": "wheel",
          "features": [
            "바퀴"
          ]
        },
        {
          "id": "wheel-2",
          "label": "바퀴 로봇 2호",
          "group": "wheel",
          "features": [
            "바퀴"
          ]
        },
        {
          "id": "wheel-3",
          "label": "바퀴 로봇 3호",
          "group": "wheel",
          "features": [
            "바퀴"
          ]
        },
        {
          "id": "wheel-4",
          "label": "바퀴 로봇 4호",
          "group": "wheel",
          "features": [
            "바퀴"
          ]
        },
        {
          "id": "leg-1",
          "label": "발 로봇 1호",
          "group": "leg",
          "features": [
            "발"
          ]
        },
        {
          "id": "leg-2",
          "label": "발 로봇 2호",
          "group": "leg",
          "features": [
            "발"
          ]
        },
        {
          "id": "leg-3",
          "label": "발 로봇 3호",
          "group": "leg",
          "features": [
            "발"
          ]
        },
        {
          "id": "leg-4",
          "label": "발 로봇 4호",
          "group": "leg",
          "features": [
            "발"
          ]
        },
        {
          "id": "wing-1",
          "label": "날개 로봇 1호",
          "group": "wing",
          "features": [
            "날개"
          ]
        },
        {
          "id": "wing-2",
          "label": "날개 로봇 2호",
          "group": "wing",
          "features": [
            "날개"
          ]
        },
        {
          "id": "wing-3",
          "label": "날개 로봇 3호",
          "group": "wing",
          "features": [
            "날개"
          ]
        },
        {
          "id": "wing-4",
          "label": "날개 로봇 4호",
          "group": "wing",
          "features": [
            "날개"
          ]
        }
      ],
      "groups": [
        {
          "id": "wheel",
          "label": "바퀴 로봇"
        },
        {
          "id": "leg",
          "label": "발 로봇"
        },
        {
          "id": "wing",
          "label": "날개 로봇"
        }
      ],
      "hint": "성의 자료를 실제 구성에 맞춰요.\n바퀴·발·날개를 네 대씩 기록해요.",
      "explain": "이 섬의 실제 수가 네 대씩이에요.\n같은 수가 늘 공정한 것은 아니에요."
    }
  },
        {
          "id": "ch8-p1-x1",
          "kind": "classify",
          "title": "실제 구성 맞추기",
          "npc": "keeper",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "mode": "balance",
            "intro": "오늘 모인 로봇 수가 달라요.\n오늘의 실제 명단에 맞춰요.",
            "cards": [
              {
                "id": "bot1",
                "label": "바퀴1",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot2",
                "label": "바퀴2",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot3",
                "label": "바퀴3",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot4",
                "label": "바퀴4",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot5",
                "label": "바퀴5",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot6",
                "label": "바퀴6",
                "group": "wheel",
                "features": []
              },
              {
                "id": "bot7",
                "label": "발7",
                "group": "foot",
                "features": []
              },
              {
                "id": "bot8",
                "label": "발8",
                "group": "foot",
                "features": []
              },
              {
                "id": "bot9",
                "label": "발9",
                "group": "foot",
                "features": []
              },
              {
                "id": "bot10",
                "label": "날개10",
                "group": "wing",
                "features": []
              },
              {
                "id": "bot11",
                "label": "날개11",
                "group": "wing",
                "features": []
              },
              {
                "id": "bot12",
                "label": "날개12",
                "group": "wing",
                "features": []
              }
            ],
            "groups": [
              {
                "id": "wheel",
                "label": "바퀴"
              },
              {
                "id": "foot",
                "label": "발"
              },
              {
                "id": "wing",
                "label": "날개"
              }
            ],
            "initialCounts": {
              "wheel": 4,
              "foot": 4,
              "wing": 4
            },
            "hint": "종류마다 같은 수로 정할까요?\n오늘의 명단부터 세어 봐요.",
            "explain": "무조건 같은 수로 맞추지 않아요.\n살펴볼 집단의 실제 구성을 봐요."
          }
        }
      ],
    },
    {
      id: 'ch8-p2',
      kind: 'part',
      title: '개인정보 지키기',
      summary: '알려 줘도 되는 정보와 지켜야 할 정보를 나눠요.',
      activity: '이름·주소·전화번호·얼굴 사진·비밀번호 등을 구별하고, 앱·AI에 입력하기 전에 생각할 점을 정리해요.',
      missions: [
  {
    "id": "ch8-p2-m1",
    "kind": "classify",
    "title": "비밀 금고",
    "npc": "keeper",
    "reward": {
      "xp": 20
    },
    "data": {
      "mode": "sort",
      "intro": "AI에 넣기 전 정보를 살펴봐요.\n개인정보는 지키는 쪽으로 옮겨요.",
      "cards": [
        {
          "id": "name",
          "label": "나의 실제 이름",
          "group": "keep",
          "features": []
        },
        {
          "id": "address",
          "label": "집 주소",
          "group": "keep",
          "features": []
        },
        {
          "id": "phone",
          "label": "전화번호",
          "group": "keep",
          "features": []
        },
        {
          "id": "school",
          "label": "다니는 학교",
          "group": "keep",
          "features": []
        },
        {
          "id": "face",
          "label": "친구의 얼굴 사진",
          "group": "keep",
          "features": []
        },
        {
          "id": "password",
          "label": "계정 비밀번호",
          "group": "keep",
          "features": []
        },
        {
          "id": "puzzle",
          "label": "가상 로봇의 숫자 퍼즐",
          "group": "share",
          "features": []
        },
        {
          "id": "story",
          "label": "사람 정보 없는 상상 동화",
          "group": "share",
          "features": []
        }
      ],
      "groups": [
        {
          "id": "keep",
          "label": "개인정보라 입력하지 않아요"
        },
        {
          "id": "share",
          "label": "개인정보 없는 가상 예시예요"
        }
      ],
      "hint": "이름·주소·연락처·학교·사진은\n사람을 알아보는 단서가 돼요.",
      "explain": "AI에 부탁할 때도 정보를 줄여요.\n가상 예시로 바꾸어 연습해요."
    }
  },
  {
    "id": "ch8-p2-m2",
    "kind": "quiz",
    "title": "보내기 전에 생각하기",
    "npc": "keeper",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "AI가 퀴즈를 내겠다며 얼굴 사진과\n학교를 물어요. 어떻게 할까요?",
          "choices": [
            "사진 크기만 줄여서 보내요",
            "학교 이름만 줄여서 적어요",
            "개인정보 없이 부탁해요"
          ],
          "answer": 2,
          "explain": "퀴즈에는 그 정보가 필요 없어요.\n개인정보를 빼고 안전하게 부탁해요."
        },
        {
          "q": "친구 사진으로 장난 그림을 만들어 달라는\n부탁을 받았어요. 어떻게 할까요?",
          "choices": [
            "친구의 이름만 빼고 만들어요",
            "가상의 인물을 새로 그려요",
            "모둠 안에서만 그림을 돌려요"
          ],
          "answer": 1,
          "explain": "사진에서 이름을 빼도 알아볼 수\n있어요. 친구의 선택을 존중해요."
        },
        {
          "q": "AI가 숙제 설명을 도와줬어요.\n제출하기 전에 할 일은요?",
          "choices": [
            "확인하고 도움을 밝혀요",
            "읽기 쉬우면 확인을 생략해요",
            "낱말을 바꾸고 도움을 숨겨요"
          ],
          "answer": 0,
          "explain": "내용을 이해하고 확인한 뒤\n어디에서 도움받았는지 밝혀요."
        }
      ]
    }
  }
],
    },
    {
      id: 'ch8-p3',
      kind: 'part',
      title: '진짜? 가짜?',
      summary: 'AI가 만든 그림·글을 살펴보고, AI 도움을 솔직히 밝혀요.',
      activity: '딥페이크의 위험을 알고, 친구 사진으로 장난 이미지를 만들지 않으며, 숙제에 AI 도움을 받았을 때 밝히는 방법을 연습해요.',
      missions: [
  {
    "id": "ch8-p3-m1",
    "kind": "factCheck",
    "title": "거울 속 그림자",
    "npc": "keeper",
    "reward": {
      "xp": 30,
      "robiPart": "ethicsCore"
    },
    "data": {
      "intro": "게임 속 그림과 글을 살펴봐요.\n학생 사진이나 실제 정보는 없어요.",
      "sources": [
        {
          "id": "drawing",
          "title": "첫 그림 제작 기록",
          "text": "성지기가 그린 상상 그림이에요.\nAI 합성은 쓰지 않았어요."
        },
        {
          "id": "composite",
          "title": "상상 그림 제작 기록",
          "text": "AI 도움으로 만든 로봇 그림이에요.\n실제 사람 사진은 쓰지 않았어요."
        },
        {
          "id": "consent",
          "title": "사진과 합성물 약속",
          "text": "다른 사람 사진은 먼저 동의를 구해요.\n상처를 줄 합성물은 나누지 않아요."
        },
        {
          "id": "writing",
          "title": "안내 글 검토 기록",
          "text": "AI가 초안을 돕고 성지기가 고쳤어요.\n지도와 비교하고 AI 도움을 밝혔어요."
        }
      ],
      "claims": [
        {
          "id": "looks",
          "text": "자연스러운 그림은 늘 진짜 사진이에요.",
          "source": "drawing",
          "choices": [
            "이 문장을 그대로 둬요",
            "겉모습만 말고 제작 기록도 확인해요"
          ],
          "answer": 1,
          "visual": {
            "key": "prop-mirror",
            "frame": 0,
            "caption": "첫째 연습 그림 · 실제 학생 사진 없음"
          }
        },
        {
          "id": "floating",
          "text": "이 그림은 실제 로봇을 찍은 사진이에요.",
          "source": "composite",
          "choices": [
            "이 문장을 그대로 둬요",
            "AI 도움으로 만든 상상 그림이에요"
          ],
          "answer": 1,
          "visual": {
            "key": "prop-mirror",
            "frame": 1,
            "caption": "둘째 연습 그림 · 제작 기록을 읽어요"
          }
        },
        {
          "id": "permission",
          "text": "친구 사진은 허락 없이 바꿔도 돼요.",
          "source": "consent",
          "choices": [
            "이 문장을 그대로 둬요",
            "동의를 구하고 줄 영향을 살펴요"
          ],
          "answer": 1
        },
        {
          "id": "disclosure",
          "text": "안내 글은 AI 도움을 밝히고 확인했어요.",
          "source": "writing",
          "choices": [
            "이 문장을 그대로 둬요",
            "AI가 쓰면 사람이 확인하지 않아도 돼요"
          ],
          "answer": 0
        }
      ],
      "hint": "그림만 보고 진위를 정하지 않아요.\n제작 기록과 믿을 만한 자료를 읽어요.",
      "explain": "원본과 만든 사람의 기록을 확인해요.\n동의를 지키고 AI 도움을 밝혀요."
    }
  },
        {
          "id": "ch8-p3-x1",
          "kind": "factCheck",
          "title": "소문 확인하기",
          "npc": "keeper",
          "optional": true,
          "reward": {
            "coins": 8
          },
          "data": {
            "intro": "섬 소식지에 소문이 들어왔어요.\n원본 기록을 찾아 고쳐 봐요.",
            "sources": [
              {
                "id": "log",
                "title": "공작소 작업 일지",
                "text": "초록 등 하나를 고쳤어요.\n다른 두 등은 내일 살펴요."
              },
              {
                "id": "poster",
                "title": "축제 포스터 제작 기록",
                "text": "종이별을 오려 붙인 그림이에요.\n실제 밤하늘 사진은 아니에요."
              }
            ],
            "claims": [
              {
                "id": "lamp",
                "text": "세 등을 모두 고쳤어요.",
                "source": "log",
                "choices": [
                  "세 등을 모두 고쳤어요",
                  "초록 등 하나를 고쳤어요"
                ],
                "answer": 1
              },
              {
                "id": "stars",
                "text": "포스터는 종이별로 만든 그림이에요.",
                "source": "poster",
                "choices": [
                  "기록대로 이 문장을 써요",
                  "실제 밤하늘을 찍은 사진이에요"
                ],
                "answer": 0
              }
            ],
            "hint": "작업 일지에는 고친 수가 있어요.\n그림은 제작 기록을 읽어 봐요.",
            "explain": "소문을 곧바로 옮기기 전에\n그 일을 기록한 자료를 확인해요."
          }
        }
      ],
    },
    {
      id: 'ch8-boss',
      kind: 'boss',
      title: '편향 골렘',
      summary: '치우친 데이터로 학습한 골렘을, 데이터를 고쳐 약하게 만들고 정화해요.',
      activity: '학습 데이터를 고칠수록 골렘이 약해지는 전투, 최종 퀴즈, 로비 각성(사람이 최종 결정해요).',
      missions: [
  {
    "id": "ch8-boss-m1",
    "kind": "battle",
    "title": "편향 골렘",
    "npc": "biasGolem",
    "reward": {
      "xp": 80,
      "coins": 80,
      "flags": [
        "golem-fixed"
      ]
    },
    "data": {
      "mob": "biasGolem",
      "intro": "실제 구성에 맞게 자료를 고쳐\n골렘의 보호막이 약해졌어요.",
      "hint": "강타라면 막고 아니면 공격해요.\n반복 안에 조건을 넣어 봐요."
    }
  },
  {
    "id": "ch8-boss-quiz",
    "kind": "quiz",
    "title": "책임 있는 AI 퀴즈",
    "npc": "biasGolem",
    "reward": {
      "xp": 10
    },
    "data": {
      "questions": [
        {
          "q": "섬에 세 종류의 로봇이 네 대씩 있어요.\n자료도 네 대씩 모은 까닭은요?",
          "choices": [
            "같은 수가 어떤 섬에서나 맞아서요",
            "적은 종류는 빼는 편이 나아서요",
            "섬의 실제 구성과 같아서요"
          ],
          "answer": 2,
          "explain": "실제 모습을 담으려면 그 섬의\n종류별 수를 살펴야 해요."
        },
        {
          "q": "축제 그림이 실제 밤하늘 사진이라는\n소문이 돌아요. 무엇을 찾아볼까요?",
          "choices": [
            "그림을 본 사람 수",
            "원본과 제작 기록",
            "소문을 퍼뜨린 횟수"
          ],
          "answer": 1,
          "explain": "제작 기록은 그림이 어떻게\n만들어졌는지 확인할 근거예요."
        },
        {
          "q": "AI가 도서관에 들일 책을 추천했어요.\n마지막 결정은 누가 할까요?",
          "choices": [
            "근거를 살핀 사람",
            "추천 점수가 높은 AI",
            "가장 빨리 답한 AI"
          ],
          "answer": 0,
          "explain": "AI는 판단을 도와요. 사람은 근거와\n영향을 살피고 결정에 책임져요."
        }
      ]
    }
  },
  {
    "id": "ch8-boss-m2",
    "kind": "reflect",
    "title": "생각하는 AI 깨우기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-8",
      "title": "책임 있는 탐험가",
      "items": [
        {
          "id": "ethicsCloak",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-8",
        "ch8-clear"
      ]
    },
    "data": {
      "prompt": "로비와 함께 약속을 골라요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "빠진 사람이나 상황이 없는지 살펴요.",
          "correct": true
        },
        {
          "text": "개인정보와 다른 사람의 동의를 지켜요.",
          "correct": true
        },
        {
          "text": "AI 도움을 밝히고 사람이 확인해요.",
          "correct": true
        },
        {
          "text": "사람이 책임 있게 마지막 결정을 해요.",
          "correct": true
        },
        {
          "text": "모든 자료는 같은 수면 언제나 공정해요.",
          "correct": false
        },
        {
          "text": "AI가 쓴 글은 근거 없이 믿어도 돼요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
