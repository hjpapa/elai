import type { MobDef } from '../schema';

const list: MobDef[] = [
  {
    id: 'dummy',
    name: '허수아비 봇',
    sprite: 'mob-dummy',
    size: 16,
    chapter: 'ch0',
    hp: 12,
    atk: 2,
    def: 0,
    pattern: ['idle', 'attack', 'idle', 'charge', 'smash'],
    xp: 5,
    coins: 5,
    dex: '연습을 좋아하는 마을 친구예요.\n번개 뒤 부딪힐 때 막아 봐요.',
    purified: '삐빅! 함께 연습해서 즐거웠어요.\n숲에서도 순서를 잘 살펴봐요!',
    recommendedLevel: 1,
  },
  {
    id: 'vineSlime',
    name: '덩굴 슬라임',
    sprite: 'mob-vine-slime',
    size: 24,
    chapter: 'ch1',
    hp: 14,
    atk: 3,
    def: 0,
    pattern: ['charge', 'smash', 'attack', 'idle'],
    xp: 8,
    coins: 6,
    drops: [
      { item: 'vine', chance: 0.5 },
      { item: 'apple', chance: 0.15 },
    ],
    dex: '덩굴을 꼬며 장난치는 친구예요.\n번개 뒤에는 세게 부딪혀요.',
    purified: '말랑! 엉킨 덩굴이 풀렸어요.\n다음에는 함께 놀아요!',
    recommendedLevel: 1,
  },
  {
    id: 'bugWorm',
    name: '버그 벌레',
    sprite: 'mob-bug-worm',
    size: 16,
    chapter: 'ch1',
    hp: 14,
    atk: 4,
    def: 1,
    pattern: ['charge', 'smash', 'idle', 'attack'],
    prefill: [
      { t: 'cmd', cmd: 'attack' },
      { t: 'cmd', cmd: 'attack' },
      { t: 'cmd', cmd: 'guard' },
    ],
    xp: 10,
    coins: 8,
    drops: [{ item: 'jelly', chance: 0.3 }],
    dex: '카드 순서를 헷갈리는 친구예요.\n번개 다음 칸은 막기로 고쳐 봐요.',
    purified: '꼬물! 이제 차례를 알겠어요.\n함께 천천히 해 봐요!',
    recommendedLevel: 2,
  },
  {
    id: 'forestGuardian',
    name: '숲의 수호자',
    sprite: 'boss-forest-guardian',
    size: 48,
    boss: true,
    chapter: 'ch1',
    hp: 40,
    atk: 4,
    def: 2,
    pattern: ['charge', 'smash', 'guard', 'attack', 'charge', 'smash', 'idle', 'heal'],
    smashRatio: 0.6,
    heal: 6,
    xp: 0,
    coins: 0,
    dex: '고장 나서 길을 막는 이끼 거인이에요.\n번개 뒤는 막고, 방패 땐 쉬어요.',
    purified: '머릿속 순서가 다시 이어졌어요.\n고마워요! 함께 숲을 돌봐요.',
    recommendedLevel: 4,
  },
{
  "id": "echoBat",
  "name": "메아리 박쥐",
  "sprite": "mob-echo-bat",
  "size": 24,
  "chapter": "ch2",
  "hp": 40,
  "atk": 6,
  "def": 1,
  "pattern": [
    "charge",
    "smash"
  ],
  "smashRatio": 0.3,
  "xp": 12,
  "coins": 8,
  "drops": [
    {
      "item": "jelly",
      "chance": 0.3
    }
  ],
  "dex": "메아리로 장난치는 친구예요.\n번개 뒤에는 막기로 받아 줘요.",
  "purified": "삐유! 메아리가 고르게 울려요.\n함께 노래해요!",
  "recommendedLevel": 5
},
{
  "id": "batKing",
  "name": "메아리 박쥐 대장",
  "sprite": "boss-bat-king",
  "size": 48,
  "boss": true,
  "chapter": "ch2",
  "hp": 120,
  "atk": 7,
  "def": 2,
  "pattern": [
    "guard",
    "charge",
    "smash",
    "idle"
  ],
  "roundTicks": 12,
  "smashRatio": 0.6,
  "xp": 0,
  "coins": 0,
  "dex": "네 행동을 되풀이하는 대장이에요.\n반복으로 모든 강타를 막아요.",
  "purified": "동굴 노래가 다시 들려요.\n함께 고쳐 줘서 고마워요!",
  "recommendedLevel": 6
},
{
  "id": "mirageLizard",
  "name": "신기루 도마뱀",
  "sprite": "mob-mirage-lizard",
  "size": 24,
  "chapter": "ch3",
  "hp": 150,
  "atk": 8,
  "def": 2,
  "pattern": [
    "guard",
    "smash"
  ],
  "hiddenPattern": {
    "choices": [
      "idle",
      "smash"
    ],
    "seed": 13
  },
  "roundTicks": 8,
  "smashRatio": 0.5,
  "xp": 18,
  "coins": 12,
  "recommendedLevel": 8,
  "dex": "신기루 뒤로 행동을 숨기는 친구예요.\n조건 카드로 강타를 알아내요.",
  "purified": "이제 숨바꼭질은 잠깐 쉴래요.\n함께 모래길을 걸어요!"
},
{
  "id": "lizardChief",
  "name": "신기루 도마뱀 대장",
  "sprite": "boss-lizard-chief",
  "size": 48,
  "boss": true,
  "chapter": "ch3",
  "hp": 180,
  "atk": 10,
  "def": 3,
  "pattern": [
    "guard",
    "smash"
  ],
  "hiddenPattern": {
    "choices": [
      "idle",
      "smash"
    ],
    "seed": 31
  },
  "roundTicks": 12,
  "smashRatio": 0.7,
  "xp": 0,
  "coins": 0,
  "recommendedLevel": 8,
  "dex": "방패 뒤의 다음 행동이 바뀌어요.\n센서로 살피고 조건으로 정해요.",
  "purified": "모래 바람이 잦아들었어요.\n친구들의 길을 함께 안내해요!"
},
{
  "id": "fogJelly",
  "name": "안개 해파리",
  "sprite": "mob-fog-jelly",
  "size": 24,
  "chapter": "ch4",
  "hp": 180,
  "atk": 10,
  "def": 3,
  "pattern": [
    "idle"
  ],
  "dataPattern": {
    "values": [1, 3, 2, 1, 2, 3, 1, 3, 3, 2, 1, 3, 2],
    "actions": [
      "idle",
      "guard",
      "smash"
    ]
  },
  "roundTicks": 12,
  "smashRatio": 0.55,
  "xp": 22,
  "coins": 14,
  "recommendedLevel": 10,
  "dex": "물결에 맞춰 움직이는 친구예요.\n높이와 행동을 함께 기록해 봐요.",
  "purified": "안개가 걷혀서 길이 잘 보여요.\n함께 물결을 살펴봐요!"
},
{
  "id": "ledgerOcto",
  "name": "장부 문어 대장",
  "sprite": "boss-ledger-octo",
  "size": 48,
  "boss": true,
  "chapter": "ch4",
  "hp": 250,
  "atk": 12,
  "def": 4,
  "pattern": [
    "idle"
  ],
  "dataPattern": {
    "values": [1, 3, 2, 1, 2, 3, 1, 3, 3, 2, 1, 3, 2],
    "actions": [
      "idle",
      "guard",
      "smash"
    ]
  },
  "roundTicks": 12,
  "smashRatio": 0.7,
  "xp": 0,
  "coins": 0,
  "recommendedLevel": 10,
  "dex": "엉킨 장부 때문에 헷갈리는 대장이에요.\n물결 기록표로 규칙을 찾아봐요.",
  "purified": "장부가 다시 가지런해졌어요.\n함께 항구의 기록을 지켜요!"
},
];

export const MOBS: Record<string, MobDef> = Object.fromEntries(list.map((m) => [m.id, m]));
