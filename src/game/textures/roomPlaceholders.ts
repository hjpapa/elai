import type { AssetSpec } from '../assets';

/**
 * 마을 공방(C13) 임시 그림. Codex 그림이 오기 전에도 무엇인지 알아볼 수 있게
 * 벽·바닥·기계·인형을 단순한 모양으로 그려요(placeholders.ts가 불러요).
 */
type Pt = [number, number];

function poly(ctx: CanvasRenderingContext2D, pts: Pt[], fill: string): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function oval(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, fill: string): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

const diamondPts = (cx: number, cy: number, w: number, h: number): Pt[] => [
  [cx, cy - h / 2],
  [cx + w / 2, cy],
  [cx, cy + h / 2],
  [cx - w / 2, cy],
];

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

/** 건물 안 높은 벽(32×56): 윗면(벽 두께) + 두 옆면 + 굽도리 띠. 창문 벽은 두 옆면에 창이 있어요. */
export function drawRoomWall(ctx: CanvasRenderingContext2D, spec: AssetSpec): boolean {
  if (spec.key !== 'block-room-wall' && spec.key !== 'block-room-window') return false;
  const { w, h } = spec;
  const m = w / 2;
  poly(ctx, [[0, 8], [m, 16], [m, h], [0, h - 8]], '#e9d3a8');
  poly(ctx, [[w, 8], [m, 16], [m, h], [w, h - 8]], '#c9ad84');
  poly(ctx, [[0, h - 14], [m, h - 6], [m, h], [0, h - 8]], '#a76c46');
  poly(ctx, [[w, h - 14], [m, h - 6], [m, h], [w, h - 8]], '#86513e');
  poly(ctx, diamondPts(m, 8, w, 16), '#86513e');
  if (spec.key === 'block-room-window') {
    // 옆면 기울기(0.5)를 따라 기운 창
    poly(ctx, [[4, 18], [12, 22], [12, 34], [4, 30]], '#82cce0');
    poly(ctx, [[w - 4, 18], [w - 12, 22], [w - 12, 34], [w - 4, 30]], '#478bc7');
  }
  return true;
}

/** 공방 마루·깔개·문 매트 */
export function drawRoomTile(ctx: CanvasRenderingContext2D, spec: AssetSpec, f: number): boolean {
  const { key, w, h } = spec;
  const m = w / 2;
  if (key === 'tile-room') {
    poly(ctx, diamondPts(m, h / 2, w, h), '#c08552');
    ctx.strokeStyle = '#a76c46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m - 8, 4);
    ctx.lineTo(m + 8, 12);
    ctx.stroke();
    return true;
  }
  if (key === 'tile-rug') {
    poly(ctx, diamondPts(m, h / 2, w, h), '#cf719d');
    poly(ctx, diamondPts(m, h / 2, w * 0.5, h * 0.5), '#f5b1b0');
    return true;
  }
  if (key === 'tile-doormat') {
    poly(ctx, diamondPts(m, h / 2, w * 0.7, h * 0.7), '#86513e');
    poly(ctx, diamondPts(m, h / 2, w * 0.55, h * 0.55), '#d39a62');
    if (f === 1) poly(ctx, [[m - 4, h / 2 - 2], [m + 4, h / 2 - 2], [m, h / 2 + 3]], '#fff1a8');
    return true;
  }
  return false;
}

/** 공방 건물·가구·집게·인형 */
export function drawRoomProp(ctx: CanvasRenderingContext2D, spec: AssetSpec, f: number): boolean {
  const { key, w, h, color } = spec;
  const m = w / 2;
  switch (key) {
    case 'prop-workshop':
      rect(ctx, 4, h - 26, w - 8, 24, '#e3ab80');
      poly(ctx, [[1, h - 25], [m, h - 44], [w - 1, h - 25]], '#cf719d');
      rect(ctx, m - 4, h - 13, 8, 11, f === 1 ? '#ffe59a' : '#86513e');
      rect(ctx, 7, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#478bc7');
      rect(ctx, w - 12, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#478bc7');
      oval(ctx, m, h - 19, 3, 3, '#ffffff');
      oval(ctx, m, h - 19, 1.5, 1.5, '#cf719d');
      return true;
    case 'prop-claw-machine':
      rect(ctx, 3, h - 31, w - 6, 29, '#e46f9a');
      rect(ctx, 6, h - 44, w - 12, 15, '#82cce0');
      rect(ctx, 4, h - 47, w - 8, 4, f === 1 ? '#fff4d2' : '#ffe59a');
      rect(ctx, m - 1, h - 44, 2, 5, '#c7d6dc');
      oval(ctx, 11, h - 31, 3, 2.5, '#5bbf5b');
      oval(ctx, 17, h - 31, 3, 2.5, '#7962ab');
      oval(ctx, 23, h - 31, 3, 2.5, '#c9a26b');
      rect(ctx, 7, h - 14, 7, 7, '#293044');
      rect(ctx, w - 14, h - 22, 6, 3, f === 1 ? '#ffe59a' : '#fff4d2');
      return true;
    case 'prop-workbench':
      rect(ctx, 3, h - 18, 3, 16, '#86513e');
      rect(ctx, w - 6, h - 18, 3, 16, '#86513e');
      rect(ctx, 1, h - 22, w - 2, 6, '#d39a62');
      rect(ctx, 6, h - 26, 8, 4, '#8c9bab');
      oval(ctx, w - 9, h - 25, 3, 3, '#ed7463');
      return true;
    case 'prop-toybox':
      rect(ctx, 4, h - 15, w - 8, 13, '#e7b64f');
      oval(ctx, 11, h - 16, 4, 4, '#82cce0');
      oval(ctx, 20, h - 17, 3, 3, '#ed7463');
      rect(ctx, 4, h - 15, w - 8, 3, '#bd7959');
      return true;
    case 'prop-plant':
      rect(ctx, 5, h - 9, 6, 7, '#bd7959');
      oval(ctx, m, h - 14, 6, 6, '#8dc567');
      oval(ctx, m - 2, h - 16, 2, 2, '#d6e69a');
      return true;
    case 'prop-floorlamp':
      oval(ctx, m, h - 3, 4, 1.5, '#56657a');
      rect(ctx, m - 1, 10, 2, h - 12, '#56657a');
      poly(ctx, [[m - 3, 2], [m + 3, 2], [m + 6, 11], [m - 6, 11]], '#ffe59a');
      return true;
    case 'prop-cushion':
      oval(ctx, m, h - 6, 7, 4, '#cf719d');
      oval(ctx, m, h - 7, 4, 2, '#f5b1b0');
      return true;
    case 'prop-claw': {
      // 위 가운데 줄 + 집게 손가락(0 벌림, 1 오므림)
      rect(ctx, m - 1, 0, 2, 5, '#c7d6dc');
      rect(ctx, m - 4, 5, 8, 3, '#8c9bab');
      const spread = f === 1 ? 1 : 4;
      ctx.strokeStyle = '#c7d6dc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m - 3, 8);
      ctx.lineTo(m - 3 - spread, 12);
      ctx.lineTo(m - 2 - spread + (f === 1 ? 2 : 0), 15);
      ctx.moveTo(m + 3, 8);
      ctx.lineTo(m + 3 + spread, 12);
      ctx.lineTo(m + 2 + spread - (f === 1 ? 2 : 0), 15);
      ctx.stroke();
      return true;
    }
    default:
      if (!key.startsWith('prop-doll-')) return false;
      drawDoll(ctx, key, w, h, hex(color));
      return true;
  }
}

/** 섬 친구 인형: 둥근 천 몸 + 단추 눈. 인형마다 귀·날개·안테나가 달라요. */
function drawDoll(ctx: CanvasRenderingContext2D, key: string, w: number, h: number, body: string): void {
  const m = w / 2;
  if (key === 'prop-doll-bat') {
    poly(ctx, [[m - 5, h - 10], [1, h - 13], [3, h - 5]], body);
    poly(ctx, [[m + 5, h - 10], [w - 1, h - 13], [w - 3, h - 5]], body);
  }
  if (key === 'prop-doll-robi') rect(ctx, m - 0.5, 1, 1, 4, '#f2c94c');
  if (key === 'prop-doll-guardian') oval(ctx, m, h - 12, 6, 3, '#8dc567');
  oval(ctx, m, h - 7, 6, 5.5, body);
  if (key === 'prop-doll-slime') oval(ctx, m + 3, h - 12, 2, 1.5, '#a4e3c2');
  if (key === 'prop-doll-dummy') rect(ctx, m - 4, h - 14, 8, 2, '#a76c46');
  rect(ctx, m - 3, h - 8, 1.5, 1.5, '#1b1f2a');
  rect(ctx, m + 1.5, h - 8, 1.5, 1.5, '#1b1f2a');
  oval(ctx, m, h - 4.5, 1.5, 0.8, '#f5b1b0');
}

/** 출구 구멍과 집기 카드 */
export function drawRoomIcon(ctx: CanvasRenderingContext2D, spec: AssetSpec): boolean {
  const { key, w, h } = spec;
  if (key === 'icon-claw-exit') {
    rect(ctx, 1, 1, w - 2, h - 2, '#ffe59a');
    for (let i = 0; i < 4; i++) rect(ctx, 1 + i * 4, 1, 2, h - 2, '#e7b64f');
    rect(ctx, 3, 3, w - 6, h - 6, '#1b1f2a');
    rect(ctx, 4, 4, w - 8, h - 8, '#293044');
    return true;
  }
  if (key === 'icon-card-grab') {
    rect(ctx, 1, 1, w - 2, h - 2, '#e46f9a');
    const m = w / 2;
    rect(ctx, m - 1, 2, 2, 4, '#ffffff');
    rect(ctx, m - 4, 6, 8, 2, '#ffffff');
    rect(ctx, m - 5, 8, 2, 4, '#ffffff');
    rect(ctx, m + 3, 8, 2, 4, '#ffffff');
    rect(ctx, m - 3, 12, 2, 2, '#ffffff');
    rect(ctx, m + 1, 12, 2, 2, '#ffffff');
    return true;
  }
  return false;
}
