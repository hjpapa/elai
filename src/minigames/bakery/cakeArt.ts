import type { CakeOrder } from '../../data/schema';

/**
 * 케이크 픽셀 그림(16×16). 손님 그림·구운 케이크·진열대 임시 그림이 같은 그림을 써요.
 * 모양(마스크) × 맛(크림 색) × 올릴 것(작은 그림 세 개) × 글씨 판(흰 판, 글씨 종류마다 점 색이 달라요).
 * 색은 모두 공용 팔레트 색이에요.
 */
export const CAKE_SIZE = 16;

const SHAPES: Record<string, string[]> = {
  round: ['...XXXXXX...', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.', '...XXXXXX...'],
  square: ['.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.'],
  heart: ['.XXX....XXX.', 'XXXXX..XXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.', '..XXXXXXXX..', '...XXXXXX...', '.....XX.....'],
  star: ['.....XX.....', '....XXXX....', 'XXXXXXXXXXXX', '.XXXXXXXXXX.', '..XXXXXXXX..', '..XXXXXXXX..', '.XXXX..XXXX.', 'XXX......XXX'],
  /** 오븐이 마음대로 고른 모양: 울퉁불퉁한 덩어리 */
  lump: ['....XXX.....', '..XXXXXX.X..', '.XXXXXXXXXX.', 'XXXXXXXXXXX.', '.XXXXXXXXXXX', 'XXXXXXXXXXX.', '.XXXXXXXXX..', '...XXXXX....'],
};

/** 맛 → [윗면, 몸, 그늘] 색. plain은 오븐이 고른 맛(크림 없는 빵)이에요. */
const FLAVORS: Record<string, readonly [string, string, string]> = {
  strawberry: ['#f5b1b0', '#cf719d', '#b94751'],
  choco: ['#bd7959', '#86513e', '#684b3f'],
  vanilla: ['#fff4d2', '#edc890', '#d39a62'],
  mint: ['#a4e3c2', '#49b5b1', '#367a96'],
  plain: ['#e3ab80', '#d39a62', '#a76c46'],
};

const TOPPINGS: Record<string, { rows: string[]; colors: Record<string, string> }> = {
  berry: { rows: ['.g.', 'rrr', '.r.'], colors: { r: '#ed7463', g: '#4c8f4c' } },
  cherry: { rows: ['..n', '.n.', 'kk.'], colors: { k: '#b94751', n: '#684b3f' } },
  flower: { rows: ['.w.', 'wyw', '.w.'], colors: { w: '#ffffff', y: '#e7b64f' } },
  candy: { rows: ['.y.', 'yYy', '.y.'], colors: { y: '#ffe59a', Y: '#e7b64f' } },
};

/** 글씨 판 점 색(글씨 종류마다 달라서 그림만 보고도 구별돼요) */
const MESSAGE_MARK: Record<string, string> = { birthday: '#ed7463', thanks: '#478bc7', cheer: '#e7b64f' };

const OUTLINE = '#4e3e43';
const PLATE: readonly [string, string] = ['#c7d6dc', '#8c9bab'];
const BODY_TOP = 6;
const BODY_LEFT = 2;

/** 케이크 픽셀(줄마다 색, 빈 곳은 null) */
export function cakePixels(cake: CakeOrder): (string | null)[][] {
  const px: (string | null)[][] = Array.from({ length: CAKE_SIZE }, () => Array<string | null>(CAKE_SIZE).fill(null));
  const mask = SHAPES[cake.shape] ?? SHAPES.lump;
  const [top, body, shade] = FLAVORS[cake.flavor] ?? FLAVORS.plain;
  const inBody = (x: number, y: number): boolean => mask[y - BODY_TOP]?.[x - BODY_LEFT] === 'X';
  // 몸: 칸마다 맨 위는 윗면 색, 맨 아래는 그늘 색
  for (let y = BODY_TOP; y < BODY_TOP + mask.length; y++)
    for (let x = BODY_LEFT; x < BODY_LEFT + 12; x++) {
      if (!inBody(x, y)) continue;
      px[y][x] = !inBody(x, y - 1) ? top : !inBody(x, y + 1) ? shade : body;
    }
  // 바깥 외곽선(몸 둘레 한 칸)
  for (let y = 0; y < CAKE_SIZE; y++)
    for (let x = 0; x < CAKE_SIZE; x++) {
      if (px[y][x] || inBody(x, y)) continue;
      if (inBody(x - 1, y) || inBody(x + 1, y) || inBody(x, y - 1) || inBody(x, y + 1)) px[y][x] = OUTLINE;
    }
  // 접시
  for (let x = 1; x <= 14; x++) px[14][x] = PLATE[0];
  for (let x = 2; x <= 13; x++) px[15][x] = PLATE[1];
  // 글씨 판
  const mark = cake.message ? MESSAGE_MARK[cake.message] : undefined;
  if (mark) {
    for (let x = 5; x <= 10; x++) {
      px[9][x] = '#ffffff';
      px[10][x] = '#ffffff';
    }
    px[10][6] = mark;
    px[10][8] = mark;
    px[9][7] = mark;
    px[9][9] = mark;
  }
  // 올릴 것(세 개)
  const topping = cake.topping ? TOPPINGS[cake.topping] : undefined;
  if (topping)
    for (const ox of [2, 6, 10])
      topping.rows.forEach((row, dy) =>
        [...row].forEach((ch, dx) => {
          const color = topping.colors[ch];
          if (color) px[3 + dy][ox + dx] = color;
        }),
      );
  return px;
}
