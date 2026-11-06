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
    for (const k of ['char-player', 'prop-tree', 'prop-house', 'mob-dummy', 'prop-rock', 'prop-lighthouse', 'prop-key']) setDensity(k, 1);
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

  it('바닥이 넓은 건물(집·등대)과 바닥에 놓인 열쇠는 그림자를 두지 않아요', () => {
    for (const k of ['prop-house', 'prop-lighthouse', 'prop-key']) {
      setDensity(k, 2);
      expect(shadowSize(k), k).toBeNull();
    }
  });

  it('장별 소품은 진행 기록의 그림자 너비를 따라요', () => {
    setDensity('prop-rock', 2);
    expect(shadowSize('prop-rock')).toEqual({ w: 20, h: 7 });
  });
});

describe('불빛', () => {
  it('가로등·별 등불·부표는 늘 켜져 있고, 나무에는 빛이 없어요', () => {
    for (const k of ['prop-lamp', 'prop-starlamp', 'prop-buoy']) {
      expect(lightOf(k, 0), k).not.toBeNull();
      expect(lightOf(k, 1), k).not.toBeNull();
    }
    expect(lightOf('prop-tree')).toBeNull();
  });

  it('등대는 켜진 프레임(1)에서만, 수정은 반짝이는 프레임(1)에서만 빛나요', () => {
    expect(lightOf('prop-lighthouse', 0)).toBeNull();
    expect(lightOf('prop-lighthouse', 1)).not.toBeNull();
    expect(lightOf('prop-crystal', 0)).toBeNull();
    expect(lightOf('prop-crystal', 1)?.glow).toBe('cool');
  });

  it('이동 문은 두 반짝임 프레임 모두 청록 빛이에요', () => {
    expect(lightOf('prop-portal', 0)?.glow).toBe('cool');
    expect(lightOf('prop-portal', 1)?.glow).toBe('cool');
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
