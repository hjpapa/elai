import Phaser from 'phaser';
import { EDGE_COLORS, edgeMaterial, type CliffFace, type EdgeFace, type RimEdge } from './edges';
import { HALF_LEVEL_PX, TILE_H, TILE_W, isoToScreen, liftPx } from './iso';

/** 땅 두께(논리 픽셀) */
export const EDGE_DEPTH = 10;

/**
 * 가장자리 옆면을 한 장의 그래픽으로 그려요. 타일보다 아래 깊이라서 타일 테두리 계단과
 * 어긋나지 않게 위로 2px 겹쳐 그려요(겹친 곳은 타일이 덮어요).
 */
export function drawEdges(scene: Phaser.Scene, faces: EdgeFace[], offset = { x: 0, y: 0 }, depth = -100001): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const band = (x0: number, y0: number, x1: number, y1: number, top: number, bottom: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillPoints(
      [new Phaser.Geom.Point(x0, y0 + top), new Phaser.Geom.Point(x1, y1 + top), new Phaser.Geom.Point(x1, y1 + bottom), new Phaser.Geom.Point(x0, y0 + bottom)],
      true,
    );
  };
  for (const f of faces) {
    const p = isoToScreen(f.x, f.y);
    const cx = p.x + offset.x;
    const cy = p.y + offset.y;
    const c = EDGE_COLORS[edgeMaterial(f.kind)];
    // 왼쪽 아래 변: 왼쪽 꼭짓점 → 아래 꼭짓점, 오른쪽 아래 변: 아래 꼭짓점 → 오른쪽 꼭짓점
    const [x0, y0, x1, y1] = f.side === 'left' ? [cx - hw, cy, cx, cy + hh] : [cx, cy + hh, cx + hw, cy];
    band(x0, y0, x1, y1, -2, EDGE_DEPTH, f.side === 'left' ? c.lit : c.dark);
    band(x0, y0, x1, y1, EDGE_DEPTH - 3, EDGE_DEPTH, c.base);
    if (c.lip) band(x0, y0, x1, y1, -2, 2, f.side === 'left' ? c.lip[0] : c.lip[1]);
  }
  return g;
}

/**
 * 높은 칸 하나의 옆면(cliffFaces)을 그 칸의 깊이로 그려요(앞의 캐릭터·소품과 바르게 겹쳐요).
 * 칸 타일이 위에 겹쳐 그려지도록 2px 위로 겹쳐 그리고, 한 단(8px)마다 가는 줄로 높이를 읽기 쉽게 해요.
 */
export function drawCliffs(scene: Phaser.Scene, faces: CliffFace[], depth: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const band = (x0: number, y0: number, x1: number, y1: number, top: number, bottom: number, color: number) => {
    if (bottom <= top) return;
    g.fillStyle(color, 1);
    g.fillPoints(
      [new Phaser.Geom.Point(x0, y0 + top), new Phaser.Geom.Point(x1, y1 + top), new Phaser.Geom.Point(x1, y1 + bottom), new Phaser.Geom.Point(x0, y0 + bottom)],
      true,
    );
  };
  for (const f of faces) {
    const p = isoToScreen(f.x, f.y);
    const c = EDGE_COLORS[edgeMaterial(f.kind)];
    const [x0, y0, x1, y1] = f.side === 'left' ? [p.x - hw, p.y, p.x, p.y + hh] : [p.x, p.y + hh, p.x + hw, p.y];
    const top = -liftPx(f.top);
    const bottom = f.bottom === null ? EDGE_DEPTH : -liftPx(f.bottom);
    band(x0, y0, x1, y1, top - 2, bottom, f.side === 'left' ? c.lit : c.dark);
    // 단 나눔 줄(한 단 = 반 단 두 개)과 발치의 그늘 띠
    for (let y = top + HALF_LEVEL_PX * 2; y < bottom - 1; y += HALF_LEVEL_PX * 2) band(x0, y0, x1, y1, y - 1, y, c.base);
    band(x0, y0, x1, y1, bottom - (f.bottom === null ? 3 : 1), bottom, c.base);
    if (c.lip) band(x0, y0, x1, y1, top - 2, top + 2, f.side === 'left' ? c.lip[0] : c.lip[1]);
  }
  return g;
}

/**
 * 높은 칸 윗면의 뒤쪽 테두리(rimEdges)를 그 칸 타일 바로 위 깊이로 그려요.
 * 변 바깥에 어두운 줄, 안쪽에 밝은 줄을 그어서 뒤쪽 낮은 땅(과 거기 선 캐릭터)과 윗면을 나눠요.
 */
export function drawRims(scene: Phaser.Scene, edges: RimEdge[], depth: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const band = (x0: number, y0: number, x1: number, y1: number, top: number, bottom: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillPoints(
      [new Phaser.Geom.Point(x0, y0 + top), new Phaser.Geom.Point(x1, y1 + top), new Phaser.Geom.Point(x1, y1 + bottom), new Phaser.Geom.Point(x0, y0 + bottom)],
      true,
    );
  };
  for (const e of edges) {
    const p = isoToScreen(e.x, e.y);
    const cy = p.y - liftPx(e.h);
    const [outer, inner] = EDGE_COLORS[edgeMaterial(e.kind)].rim;
    // 왼쪽 위 변: 왼쪽 꼭짓점 → 위 꼭짓점, 오른쪽 위 변: 위 꼭짓점 → 오른쪽 꼭짓점
    const [x0, y0, x1, y1] = e.side === 'left' ? [p.x - hw, cy, p.x, cy - hh] : [p.x, cy - hh, p.x + hw, cy];
    band(x0, y0, x1, y1, -1, 0, outer);
    band(x0, y0, x1, y1, 0, 1, inner);
  }
  return g;
}
