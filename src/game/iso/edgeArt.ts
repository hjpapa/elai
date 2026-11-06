import Phaser from 'phaser';
import { EDGE_COLORS, edgeMaterial, type EdgeFace } from './edges';
import { TILE_H, TILE_W, isoToScreen } from './iso';

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
