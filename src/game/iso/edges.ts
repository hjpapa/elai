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

/** 섬 가장자리 옆면(평지 칸만). 높은 칸의 옆면은 cliffFaces가 칸마다 따로 만들어요. */
export function edgeFaces(cells: Cell[][]): EdgeFace[] {
  const faces: EdgeFace[] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (!hasGround(cells, x, y) || (cell.h ?? 0) > 0) return;
      if (!hasGround(cells, x, y + 1)) faces.push({ x, y, side: 'left', kind: cell.kind });
      if (!hasGround(cells, x + 1, y)) faces.push({ x, y, side: 'right', kind: cell.kind });
    }),
  );
  return faces;
}

/** 높은 칸의 옆면. top·bottom은 높이(반 단). bottom이 null이면 섬 가장자리라 땅 두께 아래까지 내려가요. */
export interface CliffFace extends EdgeFace {
  top: number;
  bottom: number | null;
}

/**
 * 높은 칸(언덕·계단·고원)의 옆면: 화면 앞쪽 두 변(+y는 왼쪽 아래, +x는 오른쪽 아래)에서
 * 이웃이 더 낮으면 그 높이 차이만큼, 땅이 없으면 땅 두께 아래까지 옆면이 보여요. 뒤쪽 두 변은 칸에 가려 안 보여요.
 */
export function cliffFaces(cells: Cell[][]): CliffFace[] {
  const faces: CliffFace[] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      const h = cell.h ?? 0;
      if (h <= 0 || !hasGround(cells, x, y)) return;
      for (const [side, nx, ny] of [
        ['left', x, y + 1],
        ['right', x + 1, y],
      ] as const) {
        if (!hasGround(cells, nx, ny)) {
          faces.push({ x, y, side, kind: cell.kind, top: h, bottom: null });
          continue;
        }
        const nh = cells[ny][nx].h ?? 0;
        if (nh < h) faces.push({ x, y, side, kind: cell.kind, top: h, bottom: nh });
      }
    }),
  );
  return faces;
}

/** 높은 칸 윗면의 뒤쪽 테두리. side 'left'는 왼쪽 위 변(−x 이웃), 'right'는 오른쪽 위 변(−y 이웃)이에요. h는 그 칸 높이예요. */
export interface RimEdge {
  x: number;
  y: number;
  side: EdgeSide;
  kind: TileKind;
  h: number;
}

/**
 * 높은 칸의 뒤쪽 두 변(−x는 왼쪽 위, −y는 오른쪽 위)에서 이웃이 더 낮거나 땅이 없으면 윗면 테두리를 그려요.
 * 뒤쪽 옆면은 안 보이므로, 언덕 뒤에 선 캐릭터와 언덕 윗면을 이 테두리로 나눠요.
 */
export function rimEdges(cells: Cell[][]): RimEdge[] {
  const edges: RimEdge[] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      const h = cell.h ?? 0;
      if (h <= 0 || !hasGround(cells, x, y)) return;
      for (const [side, nx, ny] of [
        ['left', x - 1, y],
        ['right', x, y - 1],
      ] as const) {
        if (!hasGround(cells, nx, ny) || (cells[ny][nx].h ?? 0) < h) edges.push({ x, y, side, kind: cell.kind, h });
      }
    }),
  );
  return edges;
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

/**
 * 옆면 색(공용 팔레트). 빛이 왼쪽 위에서 와서 왼쪽 아래 면이 밝아요. lip은 풀 가장자리 띠예요.
 * rim은 높은 칸 윗면의 뒤쪽 테두리 [바깥 어두운 줄, 안쪽 밝은 줄]이에요.
 */
export const EDGE_COLORS: Record<EdgeMaterial, { lit: number; dark: number; base: number; lip?: [number, number]; rim: [number, number] }> = {
  soil: { lit: 0x815b45, dark: 0x684b3f, base: 0x4e3e43, lip: [0x4c8f4c, 0x397854], rim: [0x397854, 0xb4d77c] },
  sand: { lit: 0xd39a62, dark: 0xbd895b, base: 0xa76c46, rim: [0xa76c46, 0xefd5a0] },
  water: { lit: 0x367a96, dark: 0x294a68, base: 0x344d78, rim: [0x294a68, 0x82cce0] },
  stone: { lit: 0x718693, dark: 0x56657a, base: 0x445968, rim: [0x445968, 0xc7d6dc] },
  wood: { lit: 0x815b45, dark: 0x684b3f, base: 0x4e3e43, rim: [0x4e3e43, 0xd39a62] },
};
