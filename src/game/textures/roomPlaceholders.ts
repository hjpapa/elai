import { LIGHT_ROUNDS } from '../../data/minigames/light';
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
    // C14 마을 택배소
    case 'prop-parcel-office':
      rect(ctx, 4, h - 26, w - 8, 24, f === 1 ? '#c7d6dc' : '#8c9bab');
      poly(ctx, [[1, h - 25], [m, h - 44], [w - 1, h - 25]], f === 1 ? '#478bc7' : '#56657a');
      rect(ctx, m - 4, h - 13, 8, 11, f === 1 ? '#ffe59a' : '#684b3f');
      rect(ctx, m - 5, h - 23, 10, 6, '#d39a62');
      rect(ctx, m - 1, h - 23, 2, 6, '#a76c46');
      rect(ctx, 6, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#56657a');
      rect(ctx, w - 11, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#56657a');
      return true;
    case 'prop-sorter':
      rect(ctx, 4, h - 20, w - 8, 18, '#2f8a86');
      rect(ctx, m - 3, h - 46, 6, 28, '#56657a');
      for (let y = h - 44; y < h - 20; y += 4) rect(ctx, m - 3, y + (f === 1 ? 2 : 0), 6, 1, '#8c9bab');
      rect(ctx, 2, h - 14, 9, 8, '#bd7959');
      rect(ctx, w - 11, h - 14, 9, 8, '#bd7959');
      rect(ctx, 6, h - 26, 4, 3, f === 1 ? '#ffe59a' : '#fff4d2');
      rect(ctx, w - 10, h - 26, 4, 3, f === 1 ? '#fff4d2' : '#ffe59a');
      return true;
    case 'prop-parcel-stack': {
      const top = f === 1 ? '#478bc7' : '#ed7463';
      rect(ctx, 2, h - 9, 12, 7, '#d39a62');
      rect(ctx, 4, h - 15, 9, 6, top);
      rect(ctx, 5, h - 20, 7, 5, '#d39a62');
      rect(ctx, 7, h - 13, 3, 2, '#ffffff');
      return true;
    }
    case 'prop-parcel-pile':
      rect(ctx, 3, h - 12, 12, 10, '#d39a62');
      rect(ctx, 16, h - 12, 12, 10, '#bd7959');
      rect(ctx, 8, h - 22, 14, 10, '#a76c46');
      rect(ctx, 14, h - 22, 2, 10, '#e3ab80');
      return true;
    case 'prop-sort-basket':
      oval(ctx, m, h - 6, 7, 4, '#86513e');
      rect(ctx, m - 7, h - 11, 14, 5, '#bd7959');
      if (f === 1) {
        oval(ctx, m - 3, h - 12, 3, 2, '#ed7463');
        oval(ctx, m + 3, h - 12, 3, 2, '#478bc7');
      }
      return true;
    // C15 마을 불빛 가게
    case 'prop-light-shop':
      rect(ctx, 4, h - 26, w - 8, 24, '#7962ab');
      poly(ctx, [[1, h - 25], [m, h - 44], [w - 1, h - 25]], '#293044');
      rect(ctx, m - 4, h - 13, 8, 11, f === 1 ? '#ffe59a' : '#4e3e43');
      oval(ctx, m, h - 20, 3, 3, f === 1 ? '#ffe59a' : '#c7d6dc');
      rect(ctx, m - 1, h - 17, 2, 2, '#56657a');
      rect(ctx, 6, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#478bc7');
      rect(ctx, w - 11, h - 21, 5, 5, f === 1 ? '#ffe59a' : '#478bc7');
      for (let i = 0; i < 5; i++) oval(ctx, 5 + i * 5.5, h - 26, 1, 1, i % 2 === f % 2 ? '#ffe59a' : '#ed7463');
      return true;
    case 'prop-lightboard':
      rect(ctx, m - 2, h - 10, 4, 8, '#56657a');
      rect(ctx, m - 8, h - 4, 16, 2, '#56657a');
      rect(ctx, 3, h - 42, w - 6, 32, '#293044');
      for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) oval(ctx, 7 + x * 4.5, h - 37 + y * 7, 1.6, 1.6, (x + y + f) % 2 === 0 ? '#ffe59a' : '#56657a');
      rect(ctx, m - 3, h - 46, 6, 4, '#b5a0dc');
      return true;
    case 'prop-light-frame': {
      rect(ctx, 1, h - 22, w - 2, 18, '#a76c46');
      rect(ctx, 2, h - 21, w - 4, 16, '#293044');
      rect(ctx, m - 1, h - 4, 2, 3, '#86513e');
      // 1~6프레임: 그 판의 (첫) 숫자 그림을 켠 모습
      const pic = f > 0 ? LIGHT_ROUNDS[f - 1]?.pictures[0] : undefined;
      if (pic) {
        const pw = pic[0].length;
        const ph = pic.length;
        const s = Math.max(1, Math.floor(Math.min(12 / pw, 16 / ph)));
        const ox = 2 + Math.floor((12 - pw * s) / 2);
        const oy = h - 21 + Math.floor((16 - ph * s) / 2);
        pic.forEach((row, y) => [...row].forEach((c, x) => rect(ctx, ox + x * s, oy + y * s, s, s, c === '1' ? '#ffe59a' : '#344d78')));
      }
      return true;
    }
    case 'prop-lamp-shelf':
      rect(ctx, 2, h - 22, w - 4, 20, '#a76c46');
      rect(ctx, 2, h - 13, w - 4, 2, '#86513e');
      for (let i = 0; i < 3; i++) {
        const on = (i + f) % 2 === 0;
        oval(ctx, 8 + i * 8, h - 17, 2.5, 2.5, on ? '#ffe59a' : '#c7d6dc');
        oval(ctx, 8 + i * 8, h - 7, 2.5, 2.5, on ? '#c7d6dc' : '#ffe59a');
      }
      return true;
    default:
      if (!key.startsWith('prop-doll-')) return false;
      drawDoll(ctx, key, w, h, hex(color));
      return true;
  }
}

/** 하트(가운데 위 cx, cy, 크기 s) */
function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, fill: string): void {
  oval(ctx, cx - s / 2, cy, s / 2, s / 2, fill);
  oval(ctx, cx + s / 2, cy, s / 2, s / 2, fill);
  poly(ctx, [[cx - s, cy + 0.5], [cx + s, cy + 0.5], [cx, cy + s * 1.5]], fill);
}

/** 별(가운데 cx, cy, 반지름 r) */
function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string): void {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  poly(ctx, pts, fill);
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
  if (key === 'icon-sort-heart' || key === 'icon-sort-star') {
    const heartBox = key === 'icon-sort-heart';
    rect(ctx, 2, 4, w - 4, h - 5, heartBox ? '#b94751' : '#344d78');
    rect(ctx, 3, 5, w - 6, h - 7, heartBox ? '#ed7463' : '#478bc7');
    if (heartBox) heart(ctx, w / 2, 8, 2.5, '#ffffff');
    else star(ctx, w / 2, 9.5, 4, '#ffe59a');
    return true;
  }
  if (key === 'icon-sort-ball') {
    oval(ctx, w / 2, h / 2 + 1, 6, 6, '#bd7959');
    oval(ctx, w / 2, h / 2 + 1, 5, 5, '#e7b64f');
    oval(ctx, w / 2 - 2, h / 2 - 1, 1.5, 1.5, '#ffe59a');
    return true;
  }
  if (key === 'icon-card-sendLeft' || key === 'icon-card-sendRight') {
    const left = key === 'icon-card-sendLeft';
    rect(ctx, 1, 1, w - 2, h - 2, '#2f8a86');
    rect(ctx, left ? 8 : 3, 5, 5, 5, '#d39a62');
    poly(ctx, left ? [[2, 8], [7, 4], [7, 12]] : [[w - 2, 8], [w - 7, 4], [w - 7, 12]], '#ffffff');
    return true;
  }
  if (key === 'icon-stamp') {
    oval(ctx, w / 2, h / 2, 7, 7, '#b94751');
    oval(ctx, w / 2, h / 2, 5.5, 5.5, '#fff4d2');
    rect(ctx, w / 2 - 3, h / 2 - 3, 6, 6, '#b94751');
    rect(ctx, w / 2 - 0.5, h / 2 - 3, 1, 6, '#fff4d2');
    return true;
  }
  // C15 코딩 불빛 그림: 전구, 불빛 붓, 켜기·다음 줄 카드
  if (key === 'icon-bulb-off' || key === 'icon-bulb-on') {
    const on = key === 'icon-bulb-on';
    if (on) oval(ctx, w / 2, 7, 7, 7, '#fff4d2');
    oval(ctx, w / 2, 7, 5, 5, on ? '#e7b64f' : '#445968');
    oval(ctx, w / 2, 7, 4, 4, on ? '#ffe59a' : '#8c9bab');
    oval(ctx, w / 2 - 1.5, 5.5, 1.2, 1.2, '#ffffff');
    rect(ctx, w / 2 - 2, 11, 4, 3, on ? '#bd895b' : '#56657a');
    return true;
  }
  if (key === 'icon-light-brush') {
    const m = w / 2;
    rect(ctx, m - 4, 1, 8, 8, '#7962ab');
    rect(ctx, m - 3, 2, 6, 6, '#b5a0dc');
    rect(ctx, m - 2, 4, 1, 1, '#1b1f2a');
    rect(ctx, m + 1, 4, 1, 1, '#1b1f2a');
    poly(ctx, [[m - 3, 9], [m + 3, 9], [m, 15]], '#c7d6dc');
    oval(ctx, m, 13.5, 1.5, 1.5, '#ffe59a');
    return true;
  }
  if (key === 'icon-card-lightOn') {
    rect(ctx, 1, 1, w - 2, h - 2, '#c58a2a');
    oval(ctx, w / 2, 7, 4, 4, '#ffffff');
    rect(ctx, w / 2 - 1.5, 10, 3, 3, '#fff4d2');
    rect(ctx, 2, 6, 2, 1, '#ffffff');
    rect(ctx, w - 4, 6, 2, 1, '#ffffff');
    rect(ctx, w / 2 - 0.5, 1.5, 1, 1.5, '#ffffff');
    return true;
  }
  if (key === 'icon-card-nextRow') {
    rect(ctx, 1, 1, w - 2, h - 2, '#4a7bd1');
    rect(ctx, 11, 3, 2, 7, '#ffffff');
    rect(ctx, 6, 8, 7, 2, '#ffffff');
    poly(ctx, [[2, 9], [6, 5.5], [6, 12.5]], '#ffffff');
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
