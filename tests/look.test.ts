import { afterEach, describe, expect, it } from 'vitest';
import { setDensity } from '../src/game/density';
import { EDGE_COLORS, edgeFaces, edgeMaterial } from '../src/game/iso/edges';
import type { Cell } from '../src/game/iso/mapRuntime';
import { lightOf } from '../src/game/light';
import { shadowSize } from '../src/game/shadow';

const grid = (rows: string[]): Cell[][] =>
  rows.map((r) => [...r].map((ch): Cell => ({ kind: ch === '.' ? 'grass' : ch === '~' ? 'water' : 'void' })));

describe('발밑 그림자', () => {
  afterEach(() => {
    for (const k of ['char-player', 'prop-tree', 'prop-house', 'mob-dummy']) setDensity(k, 1);
  });

  it('옛 1배 그림은 그림 안에 그림자가 있어서 더하지 않아요', () => {
    expect(shadowSize('char-player')).toBeNull();
    expect(shadowSize('prop-tree')).toBeNull();
  });

  it('2배 캐릭터·몹·나무에는 납작한 타원 그림자를 깔아요', () => {
    setDensity('char-player', 2);
    setDensity('prop-tree', 2);
    setDensity('mob-dummy', 2);
    expect(shadowSize('char-player')).toEqual({ w: 12, h: 4 });
    expect(shadowSize('prop-tree')).toEqual({ w: 20, h: 7 });
    expect(shadowSize('mob-dummy')?.w).toBe(11);
  });

  it('바닥이 넓은 건물(집)은 그림자를 두지 않아요', () => {
    setDensity('prop-house', 2);
    expect(shadowSize('prop-house')).toBeNull();
  });
});

describe('등불', () => {
  it('가로등에만 빛이 있어요', () => {
    expect(lightOf('prop-lamp')).not.toBeNull();
    expect(lightOf('prop-tree')).toBeNull();
  });
});

describe('섬 가장자리', () => {
  it('아래쪽 두 변(+x, +y 이웃이 없는 칸)에만 옆면이 생겨요', () => {
    const faces = edgeFaces(grid(['..', '..']));
    expect(faces).toEqual([
      { x: 1, y: 0, side: 'right', kind: 'grass' },
      { x: 0, y: 1, side: 'left', kind: 'grass' },
      { x: 1, y: 1, side: 'left', kind: 'grass' },
      { x: 1, y: 1, side: 'right', kind: 'grass' },
    ]);
  });

  it('빈 칸(void) 옆도 가장자리예요', () => {
    const faces = edgeFaces(grid(['. ', '~.']));
    expect(faces).toContainEqual({ x: 0, y: 0, side: 'right', kind: 'grass' });
    expect(faces).toContainEqual({ x: 0, y: 1, side: 'left', kind: 'water' });
  });

  it('바닥 종류마다 옆면 재질과 색이 있어요', () => {
    expect(edgeMaterial('grass')).toBe('soil');
    expect(edgeMaterial('water')).toBe('water');
    expect(edgeMaterial('sand')).toBe('sand');
    expect(edgeMaterial('castle')).toBe('stone');
    for (const c of Object.values(EDGE_COLORS)) expect(c.lit).not.toBe(c.dark);
  });
});
