import type { TileKind } from '../../data/schema';
import { TILE_TEXTURE, type Cell } from './mapRuntime';

/**
 * 섬 가장자리 땅 두께. 아이소 화면에서 보이는 아래쪽 두 변(+y 이웃이 없으면 왼쪽 아래 면,
 * +x 이웃이 없으면 오른쪽 아래 면)에 땅 옆면을 그려서 맵이 떠 있는 섬처럼 보여요.
 */
export type EdgeSide = 'left' | 'right';

export interface EdgeFace {
  x: number;
  y: number;
  side: EdgeSide;
  kind: TileKind;
}

export type EdgeMaterial = 'soil' | 'sand' | 'water' | 'stone' | 'wood';

export function hasGround(cells: Cell[][], x: number, y: number): boolean {
  const c = cells[y]?.[x];
  return !!c && TILE_TEXTURE[c.kind] !== null;
}

export function edgeFaces(cells: Cell[][]): EdgeFace[] {
  const faces: EdgeFace[] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (!hasGround(cells, x, y)) return;
      if (!hasGround(cells, x, y + 1)) faces.push({ x, y, side: 'left', kind: cell.kind });
      if (!hasGround(cells, x + 1, y)) faces.push({ x, y, side: 'right', kind: cell.kind });
    }),
  );
  return faces;
}

export function edgeMaterial(kind: TileKind): EdgeMaterial {
  switch (kind) {
    case 'water':
      return 'water';
    case 'sand':
    case 'sandstone':
      return 'sand';
    case 'dock':
    case 'crate':
    case 'wood':
    case 'bridge':
    case 'room':
    case 'rug':
    case 'roomwall':
    case 'roomwindow':
      return 'wood';
    case 'grass':
    case 'flower':
    case 'hedge':
    case 'path':
      return 'soil';
    default:
      return 'stone';
  }
}

/** 옆면 색(공용 팔레트). 빛이 왼쪽 위에서 와서 왼쪽 아래 면이 밝아요. lip은 풀 가장자리 띠예요. */
export const EDGE_COLORS: Record<EdgeMaterial, { lit: number; dark: number; base: number; lip?: [number, number] }> = {
  soil: { lit: 0x815b45, dark: 0x684b3f, base: 0x4e3e43, lip: [0x4c8f4c, 0x397854] },
  sand: { lit: 0xd39a62, dark: 0xbd895b, base: 0xa76c46 },
  water: { lit: 0x367a96, dark: 0x294a68, base: 0x344d78 },
  stone: { lit: 0x718693, dark: 0x56657a, base: 0x445968 },
  wood: { lit: 0x815b45, dark: 0x684b3f, base: 0x4e3e43 },
};
