import type { FruitColor, FruitPattern, FruitPic, FruitRound, FruitShape, MinigameUnlock } from '../schema';

/**
 * 과일 AI 가르치기(마을 과일 가게). 예시 카드를 학습 상자에 넣어 과일 분류 로봇을 가르치고, 바구니 과일로 시험해요.
 * 5장 '나만의 분류 AI'(라벨링 → 학습 → 테스트), 6장 '데이터가 적으면? 많으면?', 8장 '치우친 데이터'를 놀이로 다시 해요.
 * 로봇은 실제 AI가 아니라 색·모양·무늬만 보고 가장 많이 닮은 예시를 따라 하는 작은 모델이에요(fruitEnv).
 * 판을 처음 성공하면 가게 왼쪽 벽 앞 빈 상자에 그 판의 과일이 담겨요. 이름표가 틀린 카드가 상자에 남으면 별이 하나 줄어요.
 */
export const FRUIT_TITLE = '과일 AI 선생님';

/** 과일 상자 플래그(판마다 하나) */
export const fruitFlag = (roundId: string): string => `fruit:${roundId}`;

/** 과일 종류 → 이름표 글자 */
export const FRUIT_KINDS: Record<string, string> = {
  apple: '사과',
  tangerine: '귤',
  banana: '바나나',
  grape: '포도',
  watermelon: '수박',
  lemon: '레몬',
};

/** 로봇이 보는 특징 이름과 값 */
export const FRUIT_FEATURES = { color: '색', shape: '모양', pattern: '무늬' } as const;
export const FRUIT_COLORS: Record<FruitColor, string> = { red: '빨강', green: '초록', yellow: '노랑', purple: '보라', orange: '주황' };
export const FRUIT_SHAPES: Record<FruitShape, string> = { round: '둥근', long: '길쭉한', bunch: '송이', oval: '타원' };
export const FRUIT_PATTERNS: Record<FruitPattern, string> = { plain: '매끈', stripes: '줄무늬' };

const pic = (kind: string, name: string, color: FruitColor, shape: FruitShape, pattern: FruitPattern = 'plain'): FruitPic => ({ kind, name, color, shape, pattern });

/** 과일 그림 전체(예시 카드와 시험 바구니가 같은 그림을 써요) */
export const FRUITS: Record<string, FruitPic> = {
  'apple-red': pic('apple', '빨간 사과', 'red', 'round'),
  'apple-green': pic('apple', '초록 사과', 'green', 'round'),
  'apple-yellow': pic('apple', '노란 사과', 'yellow', 'round'),
  tangerine: pic('tangerine', '귤', 'orange', 'round'),
  banana: pic('banana', '노란 바나나', 'yellow', 'long'),
  'banana-green': pic('banana', '초록 바나나', 'green', 'long'),
  grape: pic('grape', '보라 포도', 'purple', 'bunch'),
  'grape-green': pic('grape', '청포도', 'green', 'bunch'),
  watermelon: pic('watermelon', '수박', 'green', 'round', 'stripes'),
  lemon: pic('lemon', '레몬', 'yellow', 'oval'),
};

/** 판을 처음 성공하면 가게 과일 상자에 담기는 과일(상자 그림 1~6프레임이 이 과일이에요) */
export const CRATE_FRUITS: Record<string, string[]> = {
  r1: ['apple-red', 'banana'],
  r2: ['grape', 'apple-red'],
  r3: ['tangerine', 'apple-green'],
  r4: ['watermelon', 'grape-green'],
  r5: ['apple-yellow', 'lemon'],
  r6: ['apple-red', 'apple-green', 'apple-yellow'],
};

/** 카드 묶음 만들기: [과일 그림, 이름표] 차례대로 c1, c2, … */
const cards = (...rows: [string, string][]): FruitRound['pool'] => rows.map(([fruit, label], i) => ({ id: `c${i + 1}`, fruit, label }));
const ONE_BASKET = '오늘 온 과일';

/** 5장 '나만의 분류 AI'를 끝냈거나 5장 부품(학습 칩)이 있으면 */
const LEARN_UNLOCK: MinigameUnlock = { mission: 'ch5-p3-m1', part: 'learningChip' };
/** 6장 '데이터가 적으면? 많으면?'을 끝냈거나 6장 부품(예측 모듈)이 있으면 */
const DATA_UNLOCK: MinigameUnlock = { mission: 'ch6-p3-m1', part: 'predictModule' };
/** 8장 '치우친 데이터'를 끝냈거나 8장 부품(윤리 코어)이 있으면 */
const FAIR_UNLOCK: MinigameUnlock = { mission: 'ch8-p1-m1', part: 'ethicsCore' };

export const FRUIT_ROUNDS: FruitRound[] = [
  {
    id: 'r1',
    title: '첫 학습',
    labels: ['apple', 'banana'],
    pool: cards(['apple-red', 'apple'], ['apple-red', 'apple'], ['banana', 'banana'], ['banana', 'banana']),
    boxSize: 2,
    baskets: [{ name: ONE_BASKET, fruits: ['apple-red', 'banana', 'banana', 'apple-red'] }],
    intro: '사과와 바나나를 나누는 로봇이에요.\n예시 카드로 가르쳐요.',
    hint: '로봇은 본 적 있는 것만 알아요.\n두 과일을 다 보여 줘요.',
    lesson: '로봇은 이름표가 붙은 예시로\n배워요(지도학습).',
  },
  {
    id: 'r2',
    title: '틀린 이름표',
    labels: ['apple', 'banana', 'grape'],
    // 세 장은 이름표가 틀렸어요(c2·c4·c6). c6 초록 사과는 시험에 나오지 않아서 찾기 어려워요.
    pool: cards(['apple-red', 'apple'], ['apple-red', 'grape'], ['banana', 'banana'], ['banana', 'apple'], ['grape', 'grape'], ['apple-green', 'banana']),
    initial: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
    relabel: true,
    boxSize: 6,
    baskets: [{ name: ONE_BASKET, fruits: ['apple-red', 'banana', 'grape', 'grape', 'apple-red', 'banana'] }],
    intro: '이름표가 틀린 카드가 섞였어요.\n그림을 보고 이름표를 고쳐요.',
    hint: '그림과 이름표가 다른 카드가\n세 장 있어요. 하나씩 살펴봐요.',
    lesson: '이름표가 틀리면\n로봇도 틀리게 배워요.',
  },
  {
    id: 'r3',
    title: '닮은 점 찾기',
    labels: ['apple', 'tangerine'],
    pool: cards(['apple-red', 'apple'], ['apple-red', 'apple'], ['apple-green', 'apple'], ['apple-yellow', 'apple'], ['tangerine', 'tangerine'], ['tangerine', 'tangerine']),
    boxSize: 4,
    baskets: [{ name: ONE_BASKET, fruits: ['apple-red', 'tangerine', 'apple-green', 'apple-yellow', 'tangerine', 'apple-green'] }],
    unlock: LEARN_UNLOCK,
    lockedText: "5장 '나만의 분류 AI'를 하면\n이 판이 열려요.",
    intro: '로봇은 가장 많이 닮은 예시를\n따라 해요. 색·모양·무늬를 봐요.',
    hint: '사과는 색이 여러 가지예요.\n색마다 예시를 하나씩 넣어요.',
    lesson: '가장 닮은 예시를 따라 하니까\n여러 모습을 보여 줘야 해요.',
  },
  {
    id: 'r4',
    title: '예시가 늘면',
    labels: ['apple', 'banana', 'grape', 'watermelon'],
    pool: cards(
      ['apple-red', 'apple'],
      ['banana', 'banana'],
      ['apple-red', 'apple'],
      ['apple-red', 'apple'],
      ['apple-green', 'apple'],
      ['banana-green', 'banana'],
      ['grape', 'grape'],
      ['grape-green', 'grape'],
      ['watermelon', 'watermelon'],
    ),
    initial: ['c1', 'c2'],
    boxSize: 8,
    baskets: [{ name: ONE_BASKET, fruits: ['apple-red', 'apple-green', 'banana', 'banana-green', 'grape', 'grape-green', 'watermelon', 'apple-red'] }],
    history: true,
    unlock: DATA_UNLOCK,
    lockedText: "6장 '데이터가 적으면?'을 하면\n이 판이 열려요.",
    intro: '처음엔 예시가 두 장뿐이에요.\n늘려 가며 정확도를 봐요.',
    hint: '같은 예시를 또 넣으면 그대로예요.\n다른 모습의 예시를 넣어요.',
    lesson: '다른 모습의 예시가 늘면\n정확도(맞힌 비율)가 올라요.',
  },
  {
    id: 'r5',
    title: '치우친 상자',
    labels: ['apple', 'tangerine', 'lemon'],
    pool: cards(
      ['apple-red', 'apple'],
      ['apple-red', 'apple'],
      ['apple-red', 'apple'],
      ['apple-red', 'apple'],
      ['tangerine', 'tangerine'],
      ['lemon', 'lemon'],
      ['apple-green', 'apple'],
      ['apple-yellow', 'apple'],
    ),
    initial: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
    boxSize: 6,
    baskets: [{ name: ONE_BASKET, fruits: ['apple-red', 'apple-green', 'apple-yellow', 'tangerine', 'apple-red', 'apple-green', 'apple-yellow', 'lemon'] }],
    bias: true,
    unlock: FAIR_UNLOCK,
    lockedText: "8장 '치우친 데이터'를 하면\n이 판이 열려요.",
    intro: '빨간 사과만 잔뜩 배운 로봇이에요.\n무엇을 헷갈리는지 봐요.',
    hint: '상자가 꽉 찼어요. 같은 사과를\n빼고 다른 색 사과를 넣어요.',
    lesson: '예시가 한쪽으로 치우치면\n어떤 과일은 못 알아봐요.',
  },
  {
    id: 'r6',
    title: '세 농장',
    labels: ['apple', 'tangerine', 'banana', 'grape'],
    pool: cards(
      ['apple-red', 'apple'],
      ['apple-red', 'apple'],
      ['apple-green', 'apple'],
      ['apple-yellow', 'apple'],
      ['tangerine', 'tangerine'],
      ['tangerine', 'tangerine'],
      ['banana', 'banana'],
      ['banana', 'banana'],
      ['banana-green', 'banana'],
      ['grape', 'grape'],
      ['grape-green', 'grape'],
    ),
    boxSize: 8,
    baskets: [
      { name: '해님 농장', fruits: ['apple-red', 'tangerine', 'banana', 'grape'] },
      { name: '초록 농장', fruits: ['apple-green', 'banana-green', 'grape-green', 'tangerine'] },
      { name: '노을 농장', fruits: ['apple-yellow', 'banana', 'grape', 'tangerine'] },
    ],
    bias: true,
    unlock: FAIR_UNLOCK,
    lockedText: "8장 '치우친 데이터'를 하면\n이 판이 열려요.",
    intro: '농장 세 곳에서 과일이 와요.\n한 상자로 모두 맞혀야 해요.',
    hint: '농장마다 과일 색이 달라요.\n모든 모습을 하나씩 넣어요.',
    lesson: '고른 예시로 배워야\n어느 농장 과일이든 잘 나눠요.',
  },
];

/** 놀이 창에서 로비가 하는 말 */
export const FRUIT_SAY = {
  list: '예시로 로봇을 가르쳐요.\n바구니 과일로 시험해요.',
  listDone: '상자를 모두 채웠어요!\n별을 더 받으러 다시 해도 좋아요.',
  startPick: '예시 카드를 눌러 상자에 넣어요.\n다 넣으면 시험을 봐요.',
  startRelabel: '이름표를 누르면 바뀌어요.\n그림에 맞게 고쳐요.',
  startGrow: '카드를 더 넣고 시험해 봐요.\n맞힌 수가 어떻게 바뀔까요?',
  startBias: '먼저 그대로 시험해 봐요.\n어떤 과일을 못 맞힐까요?',
  startFarms: '세 농장의 과일을 살펴봐요.\n어떤 모습들이 있나요?',
  boxFull: '상자가 꽉 찼어요.\n카드를 하나 뺀 뒤 넣어요.',
  boxEmpty: '학습 상자가 비었어요.\n예시 카드를 넣어 봐요.',
  thinking: '로봇이 예시를 보고\n과일을 나누는 중이에요.',
  changed: '상자가 바뀌었어요.\n다시 시험해 봐요.',
  whyIdle: '시험을 보면 로봇이 왜 그렇게\n답했는지 보여 줘요.',
  failLabel: '이름표가 틀린 카드가 있어요.\n그림과 이름표를 살펴봐요.',
  failMissing: '상자에 없는 과일이 있어요.\n그 과일의 예시도 넣어요.',
  failConfused: '헷갈린 과일이 있어요.\n그 모습의 예시를 넣어 봐요.',
  failWrong: '다른 과일로 잘못 알았어요.\n더 닮은 예시를 넣어 봐요.',
  failBias: '잘 맞히는 모습과 못 맞히는\n모습이 갈렸어요. 치우쳤어요.',
  failFarm: '농장마다 맞힌 수가 달라요.\n못 맞힌 농장을 살펴봐요.',
  success: '과일을 모두 맞혔어요!\n잘 가르쳤어요.',
  leftLabel: '이름표가 틀린 카드가 남아서\n별이 하나 적어요.',
  first: '처음 가르친 판이에요.\n가게 상자에 과일이 담겼어요.',
} as const;

/** 판 고르기 카드에 보여 줄 설명 */
export function fruitTier(round: FruitRound): string {
  const parts = [`과일 ${round.labels.length}가지`, `상자 ${round.boxSize}칸`];
  const initial = round.initial?.length ?? 0;
  if (round.relabel) parts.push('틀린 이름표');
  else if (initial >= round.boxSize) parts.push('치우친 상자');
  else if (initial > 0) parts.push('예시 늘리기');
  if (round.baskets.length > 1) parts.push(`농장 ${round.baskets.length}곳`);
  return parts.join(' + ');
}
