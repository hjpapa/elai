import type { Chapter } from '../schema';
import { imagePromptData } from './imagePromptData';

export const ch7: Chapter = {
  id: 'ch7',
  index: 7,
  title: '프롬프트 공방',
  grades: '5~6학년',
  summary: '생성형 AI에게 원하는 것을 잘 부탁하는 주문서(프롬프트)를 만들어요.',
  concepts: ['생성형 AI의 원리(다음 말 예측)', '좋은 프롬프트 4칸', '고쳐 묻기', '사실 확인', '개인정보 지키기'],
  goals: [
    '생성형 AI가 다음에 올 말을 예측하며 글을 만든다는 것을 이해하고, 틀릴 수 있음을 안다.',
    '역할·할 일·조건·형식을 갖춘 프롬프트를 작성하고, 결과를 보고 고쳐 묻는다.',
    'AI가 만든 결과를 믿을 만한 자료로 확인하고, 프롬프트에 개인정보를 넣지 않는다.',
  ],
  standards: {
    silgwa: ['6실05-05'],
    aiContent: ['AI 원리와 활용', 'AI의 사회적 영향(영향력)'],
    ai4k12: ['자연스러운 상호작용', '사회적 영향'],
  },
  robiPart: 'talkModule',
  dungeon: '다음 말 갈림길: 문장을 이어 가며 길을 고르는 미로',
  mobs: ['babbleParrot'],
  status: 'playable',
  entryMap: 'workshop',
  badge: 'badge-7',
  parts: [
    {
      id: 'ch7-p1',
      kind: 'part',
      title: '다음 말 맞히기',
      summary: '생성형 AI가 어떻게 문장을 만드는지 체험해요.',
      activity: '확률 막대를 보고 다음 낱말을 골라 문장을 이어 가며, 생성형 AI가 다음 말을 예측한다는 것과 그래서 그럴듯해도 틀릴 수 있다는 것을 알아요.',
      missions: [
        {
          id: 'ch7-p1-m1',
          kind: 'nextWord',
          title: '문장 이어 가기',
          npc: 'zen',
          reward: { xp: 20 },
          data: {
  "intro": "작은 글 모음에서 다음 말을 골라요.\n두 모음을 바꿔 가며 비교해 봐요.",
  "corpora": [
    {
      "id": "island",
      "label": "섬 탐험 기록",
      "sentences": [
        "로비는 동굴에서 수정을 찾아요.",
        "로비는 동굴에서 보석을 찾아요.",
        "로비는 숲에서 나뭇잎을 찾아요."
      ]
    },
    {
      "id": "pretend",
      "label": "상상 놀이 글",
      "sentences": [
        "로비는 달에서 수정을 먹어요.",
        "로비는 달에서 보석을 먹어요.",
        "로비는 숲에서 수정을 찾아요."
      ]
    }
  ],
  "start": "로비는",
  "steps": 3,
  "question": {
    "q": "가장 많이 나온 말은 꼭 사실일까요?",
    "choices": [
      "횟수가 많아도 사실인지 확인해요",
      "자주 나오면 언제나 사실이에요",
      "글 모음이 바뀌어도 결과는 같아요"
    ],
    "answer": 0
  },
  "hint": "동굴에서와 달에서의 횟수를 비교해요.\n상상 놀이 글은 사실 기록이 아니에요.",
  "explain": "많이 나온 말도 틀릴 수 있어요.\n글 모음에 따라 다음 말이 달라져요."
},
        },
      ],
    },
    {
      id: 'ch7-p2',
      kind: 'part',
      title: '글 주문서',
      summary: '4칸 주문서(누구처럼·무엇을·어떻게·어떤 모양으로)로 원하는 글을 받아요.',
      activity: '의뢰에 맞게 주문서 4칸을 채우고, 빠지거나 맞지 않는 칸 때문에 결과에 어떤 문제가 생기는지 확인한 뒤 고쳐서 다시 부탁해요.',
      missions: [
        {
          id: 'ch7-p2-m1',
          kind: 'prompt',
          title: '동생에게 양치 알려 주기',
          npc: 'zen',
          reward: { xp: 15, coins: 10 },
          data: {
            client: '1학년 동생 하늘',
            request: '양치를 왜 해야 하는지 알려 주세요.\n저도 알 수 있게, 세 가지로 짧게요!',
            fallback: {
              opening: '양치를 해야 하는 이유입니다.',
              body: ['안녕하세요.', '무엇을 도와드릴까요?', '오늘은 날씨가 참 좋네요.'],
            },
            slots: [
              {
                id: 'role',
                label: '누구처럼',
                question: '누구처럼 말해 줄까요?',
                missing: '누구처럼 말할지 몰라서 딱딱한 말투가 됐어요.',
                options: [
                  { id: 'dentist', text: '친절한 치과 선생님처럼', quality: 'good', opening: '안녕, 하늘아! 치과 선생님이 알려 줄게.' },
                  {
                    id: 'teacher',
                    text: '선생님처럼',
                    quality: 'meh',
                    opening: '양치에 대해 알려 줄게요.',
                    feedback: '어떤 선생님인지 더 자세히 말하면\n말투가 더 잘 맞아요.',
                  },
                  {
                    id: 'pirate',
                    text: '무서운 해적 선장처럼',
                    quality: 'bad',
                    opening: '크하하! 이 해적 선장님이 알려 주마!',
                    feedback: '재미있지만, 동생에게 양치를 알려 주기에는\n말투가 맞지 않아요.',
                  },
                ],
              },
              {
                id: 'task',
                label: '무엇을',
                question: '무엇을 해 줄까요?',
                missing: '무엇을 해 달라는지 몰라서\n아무 말이나 했어요.',
                options: [
                  {
                    id: 'why',
                    text: '양치를 해야 하는 까닭을 알려 줘',
                    quality: 'good',
                    body: ['이가 썩지 않게 지켜 줘요.', '입에서 좋은 냄새가 나요.', '밥을 꼭꼭 맛있게 씹을 수 있어요.'],
                    hardBody: [
                      '양치질은 구강 내 세균이 만든 산으로부터 치아의 법랑질이 부식되는 것을 예방하는 위생 습관입니다.',
                      '또한 치태와 치석의 형성을 억제하여 치주 질환의 위험을 낮추고, 구취를 유발하는 세균 번식을 줄입니다.',
                      '아울러 저작 기능을 원활하게 유지하여 영양 섭취와 소화에도 긍정적인 영향을 줍니다.',
                    ],
                  },
                  {
                    id: 'about',
                    text: '양치에 대해 말해 줘',
                    quality: 'meh',
                    body: ['양치는 칫솔과 치약으로 해요.', '양치는 하루에 여러 번 해요.', '칫솔은 자주 바꿔 줘요.'],
                    feedback: '양치 이야기는 맞지만,\n의뢰는 "왜 해야 하는지"였어요.',
                  },
                  {
                    id: 'story',
                    text: '재미있는 이야기를 해 줘',
                    quality: 'bad',
                    body: ['옛날 옛적 숲속에 춤추는 버섯이 살았어요.', '버섯은 밤마다 달님과 노래를 불렀어요.', '그러던 어느 날…'],
                    feedback: '해 달라는 일이 의뢰와 달라서\n양치 이야기가 하나도 없어요.',
                  },
                ],
              },
              {
                id: 'how',
                label: '어떻게',
                question: '누구에게, 얼마나, 어떤 말로 할까요?',
                missing: '누구에게 얼마나 말할지 몰라서\n어렵고 긴 글이 됐어요.',
                options: [
                  { id: 'easy', text: '1학년이 아는 쉬운 말로, 짧게', quality: 'good' },
                  {
                    id: 'short',
                    text: '짧게',
                    quality: 'meh',
                    feedback: '누구에게 하는 말인지 알려 주면\n낱말을 더 쉽게 골라요.',
                  },
                  {
                    id: 'hard',
                    text: '어려운 낱말을 많이 써서 길게',
                    quality: 'bad',
                    feedback: '동생이 읽기에는 너무 어렵고 길어요.',
                  },
                  {
                    id: 'private',
                    text: '동생 이름과 우리 집 주소를 넣어서',
                    quality: 'bad',
                    privacy: true,
                    feedback: 'AI에게는 이름·주소 같은 개인정보를\n알려 주지 않아요!',
                  },
                ],
              },
              {
                id: 'format',
                label: '어떤 모양으로',
                question: '어떤 모양으로 보여 줄까요?',
                missing: '모양을 정하지 않아서\n한 덩어리 글이 됐어요.',
                options: [
                  { id: 'list', text: '번호를 붙여 세 줄로', quality: 'good', render: 'list' },
                  {
                    id: 'table',
                    text: '표로 정리해서',
                    quality: 'meh',
                    render: 'table',
                    feedback: '표도 좋지만, 동생에게는\n번호 붙인 짧은 줄이 더 읽기 쉬워요.',
                  },
                  {
                    id: 'poem',
                    text: '긴 시처럼 늘여서',
                    quality: 'bad',
                    render: 'poem',
                    feedback: '"세 가지로 짧게"라는 의뢰와\n모양이 맞지 않아요.',
                  },
                ],
              },
            ],
            explain: '좋은 주문서에는 누구처럼·무엇을·어떻게·어떤 모양으로가\n모두 들어 있어요. 결과를 보고 고쳐 묻는 것도 실력이에요.',
          },
        },
        {
          id: 'ch7-p2-m2',
          kind: 'prompt',
          title: '도서관 약속 안내문',
          npc: 'zen',
          reward: { xp: 15, coins: 10 },
          data: {
            client: '도서부 친구 나래',
            request: '도서관에서 지킬 약속을 게시판에 붙일 안내문으로\n만들어 주세요. 3학년이 읽기 쉽게요.',
            fallback: {
              opening: '도서관 이용 안내입니다.',
              body: ['안녕하세요.', '궁금한 것이 있으면 물어보세요.', '좋은 하루 보내세요.'],
            },
            slots: [
              {
                id: 'role',
                label: '누구처럼',
                question: '누구처럼 말해 줄까요?',
                missing: '누구처럼 말할지 몰라서 딱딱한 말투가 됐어요.',
                options: [
                  { id: 'librarian', text: '다정한 도서관 사서 선생님처럼', quality: 'good', opening: '친구들, 도서관에 온 걸 환영해요!' },
                  {
                    id: 'robot',
                    text: '기계처럼',
                    quality: 'bad',
                    opening: '안내. 규칙. 입력 완료.',
                    feedback: '기계 말투는 친구들이 읽기에\n딱딱하고 어색해요.',
                  },
                  {
                    id: 'friend',
                    text: '친구처럼',
                    quality: 'meh',
                    opening: '얘들아, 도서관 약속 알려 줄게.',
                    feedback: '친구 말투도 좋지만, 게시판 안내문에는\n조금 더 바른 말투가 어울려요.',
                  },
                ],
              },
              {
                id: 'task',
                label: '무엇을',
                question: '무엇을 해 줄까요?',
                missing: '무엇을 해 달라는지 몰라서\n아무 말이나 했어요.',
                options: [
                  {
                    id: 'rules',
                    text: '도서관에서 지킬 약속을 정리해 줘',
                    quality: 'good',
                    body: ['조용히 소곤소곤 말해요.', '읽은 책은 제자리에 꽂아요.', '빌린 책은 날짜를 지켜 돌려줘요.'],
                    hardBody: [
                      '도서관 이용자는 타인의 학습권을 존중하기 위해 정숙을 유지하여야 하며, 불필요한 대화를 삼가야 합니다.',
                      '열람을 마친 자료는 분류 기호에 따라 지정된 서가에 정확히 반납하여 자료의 체계적 관리에 협조하여야 합니다.',
                      '대출 자료는 반납 기한을 준수하여야 하며, 연체 시 일정 기간 대출이 제한될 수 있습니다.',
                    ],
                  },
                  {
                    id: 'books',
                    text: '재미있는 책을 추천해 줘',
                    quality: 'bad',
                    body: ['모험 이야기책을 읽어 보세요.', '동물 그림책도 재미있어요.', '과학 만화책도 인기가 많아요.'],
                    feedback: '책 추천은 의뢰와 달라요.\n의뢰는 "도서관 약속"이었어요.',
                  },
                ],
              },
              {
                id: 'how',
                label: '어떻게',
                question: '누구에게, 얼마나, 어떤 말로 할까요?',
                missing: '누구에게 얼마나 말할지 몰라서\n어렵고 긴 글이 됐어요.',
                options: [
                  { id: 'easy3', text: '3학년이 읽기 쉬운 말로, 한 줄씩 짧게', quality: 'good' },
                  {
                    id: 'polite',
                    text: '바른 말로',
                    quality: 'meh',
                    feedback: '누가 읽는지와 길이를 알려 주면\n더 알맞은 글이 나와요.',
                  },
                  {
                    id: 'long',
                    text: '자세하고 길게',
                    quality: 'bad',
                    feedback: '게시판 안내문은 짧아야 한눈에 읽혀요.',
                  },
                ],
              },
              {
                id: 'format',
                label: '어떤 모양으로',
                question: '어떤 모양으로 보여 줄까요?',
                missing: '모양을 정하지 않아서\n한 덩어리 글이 됐어요.',
                options: [
                  { id: 'list', text: '번호를 붙인 목록으로', quality: 'good', render: 'list' },
                  {
                    id: 'poem',
                    text: '노래 가사처럼',
                    quality: 'meh',
                    render: 'poem',
                    feedback: '노래도 재미있지만, 안내문은\n목록이 더 빨리 읽혀요.',
                  },
                  {
                    id: 'paragraph',
                    text: '한 문단으로 이어서',
                    quality: 'bad',
                    render: 'paragraph',
                    feedback: '약속이 한 덩어리로 붙어 있어서\n하나씩 찾아 읽기 어려워요.',
                  },
                ],
              },
            ],
            explain: '읽는 사람(3학년)과 쓰임새(게시판)를 알려 주면\nAI가 알맞은 낱말과 모양을 골라요.',
          },
        },
        {
  "id": "ch7-p2-m3",
  "kind": "prompt",
  "title": "빠진 주문 고쳐 묻기",
  "npc": "zen",
  "reward": {
    "xp": 20
  },
  "data": {
    "client": "섬 책장 지킴이",
    "request": "공동 책장의 약속을 알려 주세요.\n쉬운 말로 세 줄이면 좋겠어요.",
    "initialChoice": {
      "role": "kind",
      "task": "books"
    },
    "fallback": {
      "opening": "책장을 안내해요.",
      "body": [
        "어떤 안내가 필요한가요?"
      ]
    },
    "slots": [
      {
        "id": "role",
        "label": "누구처럼",
        "question": "누구처럼 말할까요?",
        "missing": "말하는 역할이 빠졌어요.",
        "options": [
          {
            "id": "kind",
            "text": "친절한 책장 지킴이처럼",
            "quality": "good",
            "opening": "책장을 함께 쓰는 약속이에요."
          },
          {
            "id": "vague",
            "text": "누군가처럼",
            "quality": "bad",
            "opening": "무엇을 알려 드릴까요?",
            "feedback": "어떤 역할인지 또렷하게 알려요."
          }
        ]
      },
      {
        "id": "task",
        "label": "무엇을",
        "question": "무엇을 부탁할까요?",
        "missing": "할 일이 빠졌어요.",
        "options": [
          {
            "id": "rules",
            "text": "공동 책장 이용 약속 알려 줘",
            "quality": "good",
            "body": [
              "읽은 책은 제자리에 놓아요.",
              "책을 깨끗하게 다뤄요.",
              "다른 친구도 읽도록 나눠 봐요."
            ],
            "hardBody": [
              "자료의 원래 위치를 유지해요.",
              "공동 자료를 훼손하지 않아요.",
              "다른 이용자의 접근 기회를 보장해요."
            ]
          },
          {
            "id": "books",
            "text": "책 제목을 추천해 줘",
            "quality": "bad",
            "body": [
              "어떤 책이 좋을까요?"
            ],
            "feedback": "추천 대신 이용 약속을 부탁해요."
          }
        ]
      },
      {
        "id": "how",
        "label": "어떻게",
        "question": "어떤 말로 쓸까요?",
        "missing": "읽는 사람과 길이를 알려 줘요.",
        "options": [
          {
            "id": "easy",
            "text": "어린 친구도 아는 말로 짧게",
            "quality": "good"
          },
          {
            "id": "long",
            "text": "어려운 말로 아주 길게",
            "quality": "bad",
            "feedback": "쉬운 말로 짧게 바꿔 봐요."
          }
        ]
      },
      {
        "id": "format",
        "label": "어떤 모양으로",
        "question": "어떤 모양으로 보여 줄까요?",
        "missing": "세 줄이라는 조건을 넣어요.",
        "options": [
          {
            "id": "list",
            "text": "번호를 붙여 세 줄로",
            "quality": "good",
            "render": "list"
          },
          {
            "id": "paragraph",
            "text": "긴 한 문단으로",
            "quality": "bad",
            "render": "paragraph",
            "feedback": "세 줄로 나누면 읽기 쉬워요."
          }
        ]
      }
    ],
    "explain": "빠진 조건을 넣어 고쳐 물었어요.\n결과를 보고 다시 부탁해도 괜찮아요."
  }
},
      ],
    },
    {
      id: 'ch7-p3',
      kind: 'part',
      title: '그림 주문서 + 고쳐 묻기',
      summary: '그림을 부탁하고, 결과를 보고 고쳐서 다시 부탁해요.',
      activity: '주인공·배경·시간·스타일 카드로 그림을 요청하고, 결과의 문제를 후속 요청으로 고쳐요. 고쳐 묻기는 감점하지 않아요.',
      missions: [
        {
          id: 'ch7-p3-m1',
          kind: 'prompt',
          title: '바닷가 고양이 그림',
          npc: 'zen',
          reward: { xp: 20, robiPart: 'talkModule' },
          data: imagePromptData,
        },
      ],
    },
    {
      id: 'ch7-boss',
      kind: 'boss',
      title: '엉터리 AI',
      summary: '그럴듯한 거짓말을 하는 AI의 답을 확인하고, 개인정보가 든 주문서를 골라내요.',
      activity: '공방 도서관 자료와 비교해 AI 답의 틀린 문장을 찾고(사실 확인), 개인정보가 들어간 프롬프트를 고르고, 마지막 주문서를 완성해요.',
      missions: [
  {
    "id": "ch7-boss-m1",
    "kind": "factCheck",
    "title": "헛소리 앵무새",
    "npc": "babbleKing",
    "reward": {
      "xp": 60,
      "coins": 60,
      "flags": [
        "parrot-fixed"
      ]
    },
    "data": {
      "intro": "앵무새의 다섯 문장을 확인해요.\n자료를 읽고 틀린 두 문장을 고쳐요.",
      "sources": [
        {
          "id": "map",
          "title": "섬 안내 지도",
          "text": "코딩 마을 동쪽 다리를 건너면\n반복의 동굴 입구가 나와요."
        },
        {
          "id": "ledger",
          "title": "공방 준비 기록",
          "text": "오늘 공방에는 붓 세 자루와\n종이 여섯 장을 준비했어요."
        },
        {
          "id": "note",
          "title": "로비 관찰 노트",
          "text": "로비는 바퀴 모터로 움직여요.\n메모리 칩으로 반복 카드를 써요."
        }
      ],
      "claims": [
        {
          "id": "bridge",
          "text": "동쪽 다리 너머는 반복의 동굴이에요.",
          "source": "map",
          "choices": [
            "이 문장은 그대로 둬요",
            "동쪽 다리 너머는 달이에요"
          ],
          "answer": 0
        },
        {
          "id": "brushes",
          "text": "공방에는 붓이 여섯 자루 있어요.",
          "source": "ledger",
          "choices": [
            "이 문장은 그대로 둬요",
            "공방에는 붓이 세 자루 있어요"
          ],
          "answer": 1
        },
        {
          "id": "paper",
          "text": "공방에는 종이가 여섯 장 있어요.",
          "source": "ledger",
          "choices": [
            "이 문장은 그대로 둬요",
            "공방에는 종이가 두 장 있어요"
          ],
          "answer": 0
        },
        {
          "id": "wheel",
          "text": "로비는 날개로 움직여요.",
          "source": "note",
          "choices": [
            "이 문장은 그대로 둬요",
            "로비는 바퀴 모터로 움직여요"
          ],
          "answer": 1
        },
        {
          "id": "memory",
          "text": "메모리 칩으로 반복 카드를 써요.",
          "source": "note",
          "choices": [
            "이 문장은 그대로 둬요",
            "메모리 칩은 소리를 없애요"
          ],
          "answer": 0
        }
      ],
      "hint": "자료 제목만 보지 말고 내용을 읽어요.\n붓의 수와 로비의 이동 방법을 봐요.",
      "explain": "그럴듯한 답도 자료로 확인해요.\nAI 도움을 받았으면 밝혀요."
    }
  },
  {
    "id": "ch7-boss-m2",
    "kind": "quiz",
    "title": "안전한 주문서",
    "npc": "babbleKing",
    "reward": {
      "xp": 10
    },
    "data": {
      "intro": "이름·주소·전화번호·학교·얼굴 사진은\nAI 주문서에 넣지 않아요.",
      "questions": [
        {
          "q": "AI에게 안전하게 부탁하는 말은?",
          "choices": [
            "내 주소와 얼굴 사진을 넣어 줘",
            "가상의 섬에 관한 짧은 이야기를 써 줘",
            "우리 학교와 친구 전화번호를 넣어 줘"
          ],
          "answer": 1,
          "explain": "실제 개인정보 없이\n가상의 상황으로 부탁할 수 있어요."
        },
        {
          "q": "AI 도움을 받아 글을 썼다면?",
          "choices": [
            "도움을 받은 부분을 밝혀요",
            "전부 혼자 썼다고 해요",
            "확인 없이 그대로 내요"
          ],
          "answer": 0,
          "explain": "AI 도움을 정직하게 밝히고\n내용은 사람이 확인해요."
        },
        {
          "q": "AI 답이 자신 있게 쓰여 있다면?",
          "choices": [
            "무조건 맞아요",
            "확인할 필요가 없어요",
            "믿을 만한 자료와 비교해요"
          ],
          "answer": 2,
          "explain": "말투가 자신 있어도 틀릴 수 있어요.\n근거를 확인하는 습관을 가져요."
        }
      ]
    }
  },
  {
    "id": "ch7-boss-m3",
    "kind": "reflect",
    "title": "로비에게 설명하기",
    "npc": "robi",
    "reward": {
      "xp": 10,
      "badge": "badge-7",
      "title": "정직한 질문가",
      "items": [
        {
          "id": "scribeBrush",
          "qty": 1
        }
      ],
      "flags": [
        "village-restore-7",
        "ch7-clear"
      ]
    },
    "data": {
      "prompt": "AI에게 부탁하고 확인하는 법을 알려요.\n맞는 문장을 모두 골라요.",
      "sentences": [
        {
          "text": "다음 말의 횟수는 사실을 보장하지 않아요.",
          "correct": true
        },
        {
          "text": "빠진 조건을 넣어 고쳐 물을 수 있어요.",
          "correct": true
        },
        {
          "text": "AI 도움을 밝히고 자료로 확인해요.",
          "correct": true
        },
        {
          "text": "내 주소를 넣을수록 좋은 답이 나와요.",
          "correct": false
        },
        {
          "text": "자신 있는 말투면 언제나 사실이에요.",
          "correct": false
        }
      ]
    }
  }
],
    },
  ],
};
