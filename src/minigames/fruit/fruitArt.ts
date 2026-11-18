import type { FruitColor, FruitPic, FruitShape } from '../../data/schema';

/**
 * 과일 픽셀 그림(16×16). 예시 카드·시험 바구니·과일 상자 임시 그림이 같은 그림을 써요.
 * 모양(몸 마스크) × 색(밝은·보통·짙은 3단) × 무늬(줄무늬)로 그리고, 꼭지·잎은 종류마다 조금 달라요.
 * 바깥선은 짙은 색, 빛은 왼쪽 위예요. 색은 모두 공용 팔레트 색이에요.
 * fresh는 시험 바구니의 과일이에요. 모습(색·모양·무늬)은 같아도 예시와는 다른, 로봇이 처음 보는 과일이라
 * 꼭지·잎 방향(바나나는 휜 방향)이 달라요.
 */
export const FRUIT_SIZE = 16;
const N = FRUIT_SIZE;

const OUTLINE = '#4e3e43';
const STEM = '#815b45';
const LEAF = '#4c8f4c';
const LEAF_LIGHT = '#8dc567';
const STRIPE = '#285c4b';
const TIP = '#684b3f';

const TONES: Record<FruitColor, { light: string; base: string; dark: string }> = {
  red: { light: '#ed7463', base: '#b94751', dark: '#793e4d' },
  green: { light: '#b4d77c', base: '#70ac61', dark: '#397854' },
  yellow: { light: '#ffe59a', base: '#e7b64f', dark: '#ad884b' },
  purple: { light: '#b5a0dc', base: '#7962ab', dark: '#4c3848' },
  orange: { light: '#f6bd88', base: '#e08b69', dark: '#b95754' },
};

type Tone = 'light' | 'base' | 'dark';
type Grid = (string | null)[][];

const empty = (): Grid => Array.from({ length: N }, () => Array<string | null>(N).fill(null));

/** 몸 픽셀마다 밝기 단계(없으면 빈 칸) */
function body(shape: FruitShape): (Tone | null)[][] {
  const t: (Tone | null)[][] = Array.from({ length: N }, () => Array<Tone | null>(N).fill(null));
  const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
  if (shape === 'bunch') {
    // 포도알(4×4 둥근 알) 여섯 개를 세모 모양으로 쌓아요. 알마다 왼쪽 위가 밝고 오른쪽 아래가 짙어요.
    const grape = ['.lb.', 'lbbb', 'bbbd', '.bdd'];
    const at: [number, number][] = [[2, 4], [6, 4], [10, 4], [4, 7], [8, 7], [6, 10]];
    for (const [gx, gy] of at)
      grape.forEach((row, dy) => [...row].forEach((c, dx) => {
        if (c !== '.') t[gy + dy][gx + dx] = c === 'l' ? 'light' : c === 'd' ? 'dark' : 'base';
      }));
    return t;
  }
  if (shape === 'long') {
    // 바나나: 오른쪽 위 꼭지에서 왼쪽 아래로 휘어진 초승달
    const rows = [
      '................',
      '................',
      '.............##.',
      '.............##.',
      '............###.',
      '...........####.',
      '..........####..',
      '........######..',
      '......#######...',
      '...#########....',
      '.##########.....',
      '.########.......',
      '..#####.........',
      '................',
      '................',
      '................',
    ];
    rows.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === '#') t[y][x] = 'base';
    }));
  } else {
    const [cx, cy, rx, ry] = shape === 'oval' ? [8, 10, 6.4, 4.4] : [8, 9.5, 5.6, 5.6];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inEllipse(x, y, cx, cy, rx, ry)) t[y][x] = 'base';
    if (shape === 'round') {
      // 위쪽 가운데가 살짝 들어가요(꼭지 자리)
      t[4][7] = null;
      t[4][8] = null;
    } else {
      // 레몬처럼 양 끝이 뾰족해요
      for (const y of [9, 10]) {
        t[y][1] = 'base';
        t[y][14] = 'base';
      }
    }
  }
  // 오른쪽·아래 가장자리는 짙게, 왼쪽 위 안쪽에는 밝은 반짝임
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < N && y < N && t[y][x] !== null;
  const rim: [number, number][] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (on(x, y) && (!on(x + 1, y) || !on(x, y + 1)) && (shape === 'long' ? !on(x, y + 1) : x + y >= 15)) rim.push([x, y]);
  for (const [x, y] of rim) t[y][x] = 'dark';
  if (shape === 'long') {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (on(x, y) && !on(x, y - 1) && t[y][x] === 'base') t[y][x] = 'light';
  } else {
    const gloss: [number, number][] = shape === 'oval' ? [[4, 7], [5, 7], [4, 8]] : [[4, 6], [5, 6], [4, 7]];
    for (const [x, y] of gloss) if (on(x, y)) t[y][x] = 'light';
  }
  return t;
}

/** 과일 그림 16×16(줄마다 색 또는 빈 칸) */
export function fruitPixels(fruit: FruitPic, fresh = false): Grid {
  const tone = TONES[fruit.color];
  const shape = body(fruit.shape);
  const g = empty();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const s = shape[y][x];
    if (s) g[y][x] = tone[s];
  }
  // 줄무늬(수박): 공 표면을 따라 휘는 세로 줄
  if (fruit.pattern === 'stripes') {
    for (let y = 0; y < N; y++) {
      const half = Math.sqrt(Math.max(0, 5.6 ** 2 - (y + 0.5 - 9.5) ** 2));
      for (const k of [-2, -1, 0, 1, 2]) {
        const x = Math.floor(8 + k * 0.42 * half);
        if (g[y][x] && shape[y][x] !== 'dark') g[y][x] = STRIPE;
      }
    }
  }
  // 꼭지·잎(바깥선보다 먼저 놓아서 함께 테두리가 생겨요)
  const put = (pts: [number, number][], c: string) => {
    for (const [x, y] of pts) g[y][fresh && fruit.shape !== 'long' ? N - 1 - x : x] = c;
  };
  if (fruit.shape === 'round') {
    put([[8, 2], [8, 3], [7, 4]], STEM);
    if (fruit.kind !== 'watermelon') {
      put([[9, 2], [10, 1], [11, 1]], LEAF);
      put([[10, 2]], LEAF_LIGHT);
    }
  } else if (fruit.shape === 'bunch') {
    put([[8, 1], [8, 2], [8, 3]], STEM);
    put([[9, 1], [10, 1], [10, 2]], LEAF);
    put([[9, 2]], LEAF_LIGHT);
  } else if (fruit.shape === 'long') {
    put([[14, 2], [13, 2], [1, 10], [1, 11]], TIP);
  } else {
    put([[10, 4]], LEAF);
  }
  if (fresh && fruit.shape === 'long') g.forEach((row) => row.reverse());
  // 바깥선: 그림 둘레의 빈 칸(위·아래·왼쪽·오른쪽 이웃)
  const filled = g.map((row) => row.map((c) => c !== null));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (filled[y][x]) continue;
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled[y + dy]?.[x + dx]);
      if (near) g[y][x] = OUTLINE;
    }
  return g;
}
