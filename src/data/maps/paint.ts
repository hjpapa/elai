import type { Point } from '../schema';

/** 맵 글자 격자를 코드로 그리는 도구(직접 문자열을 치는 것보다 실수가 적어요). */
export class Painter {
  private readonly g: string[][];

  constructor(
    readonly w: number,
    readonly h: number,
    fill = '.',
  ) {
    this.g = Array.from({ length: h }, () => Array<string>(w).fill(fill));
  }

  set(x: number, y: number, c: string): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = c;
    return this;
  }

  get(x: number, y: number): string | undefined {
    return this.g[y]?.[x];
  }

  rect(x0: number, y0: number, x1: number, y1: number, c: string): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, c);
    return this;
  }

  hline(x0: number, x1: number, y: number, c: string): this {
    return this.rect(Math.min(x0, x1), y, Math.max(x0, x1), y, c);
  }

  vline(x: number, y0: number, y1: number, c: string): this {
    return this.rect(x, Math.min(y0, y1), x, Math.max(y0, y1), c);
  }

  border(c: string): this {
    this.hline(0, this.w - 1, 0, c).hline(0, this.w - 1, this.h - 1, c);
    return this.vline(0, 0, this.h - 1, c).vline(this.w - 1, 0, this.h - 1, c);
  }

  /** 정해진 칸들에 같은 글자 */
  dots(points: Point[], c: string): this {
    for (const p of points) this.set(p.x, p.y, c);
    return this;
  }

  /** 같은 씨앗이면 늘 같은 자리에 흩뿌려요(on 글자 위에만). */
  scatter(c: string, count: number, seed: number, on = '.'): this {
    const rand = mulberry32(seed);
    for (let n = 0, tries = 0; n < count && tries < count * 50; tries++) {
      const x = Math.floor(rand() * this.w);
      const y = Math.floor(rand() * this.h);
      if (this.get(x, y) !== on) continue;
      this.set(x, y, c);
      n++;
    }
    return this;
  }

  rows(): string[] {
    return this.g.map((r) => r.join(''));
  }
}

/** 작고 빠른 씨앗 난수 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 여러 맵이 함께 쓰는 글자 뜻 */
export const BASE_LEGEND = {
  '.': 'grass',
  ',': 'flower',
  '=': 'path',
  '~': 'water',
  B: 'bridge',
  c: 'cave',
  R: 'rockwall',
  H: 'dock',
  q: 'crate',
  D: 'sand',
  d: 'sandstone',
  s: 'stone',
  w: 'wood',
  '#': 'hedge',
  W: 'wall',
  ' ': 'void',
} as const;

export const BASE_GLYPHS = {
  T: { tile: 'grass', sprite: 'prop-tree', solid: true },
  P: { tile: 'grass', sprite: 'prop-pine', solid: true },
  b: { tile: 'grass', sprite: 'prop-bush', solid: true },
  r: { tile: 'grass', sprite: 'prop-rock', solid: true },
  f: { tile: 'grass', sprite: 'prop-fence', solid: true },
  u: { tile: 'grass', sprite: 'prop-stump', solid: true },
  m: { tile: 'grass', sprite: 'prop-mushroom', solid: false },
} as const;
