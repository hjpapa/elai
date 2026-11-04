import Phaser from 'phaser';
import { ASSETS, type AssetSpec } from '../assets';

/** 매니페스트에 없는 그림 키를 단색 도형으로 채워요(Codex 그림이 오기 전까지). */
export function makePlaceholders(scene: Phaser.Scene): void {
  for (const spec of ASSETS) {
    if (scene.textures.exists(spec.key)) continue;
    const tex = scene.textures.createCanvas(spec.key, spec.w * spec.frames, spec.h);
    if (!tex) continue;
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    for (let f = 0; f < spec.frames; f++) {
      ctx.save();
      ctx.translate(f * spec.w, 0);
      drawFrame(ctx, spec, f);
      ctx.restore();
      tex.add(f, 0, f * spec.w, 0, spec.w, spec.h);
    }
    tex.refresh();
  }
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

function shade(c: number, k: number): string {
  const r = Math.min(255, Math.max(0, Math.round(((c >> 16) & 0xff) * k)));
  const g = Math.min(255, Math.max(0, Math.round(((c >> 8) & 0xff) * k)));
  const b = Math.min(255, Math.max(0, Math.round((c & 0xff) * k)));
  return `rgb(${r},${g},${b})`;
}

function diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
}

function drawFrame(ctx: CanvasRenderingContext2D, spec: AssetSpec, f: number): void {
  const { w, h, color } = spec;
  const outline = '#1b1f2a';
  switch (spec.kind) {
    case 'tile': {
      diamond(ctx, w / 2, h / 2, w, h);
      ctx.fillStyle = f === 1 ? shade(color, 1.1) : hex(color);
      ctx.fill();
      ctx.fillStyle = shade(color, 0.85);
      ctx.fillRect(w / 2 - 1, h / 2 - 1, 2, 2);
      return;
    }
    case 'block': {
      // 옆면
      ctx.fillStyle = shade(color, 0.8);
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(w / 2, 16);
      ctx.lineTo(w / 2, 24);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(color, 0.6);
      ctx.beginPath();
      ctx.moveTo(w, 8);
      ctx.lineTo(w / 2, 16);
      ctx.lineTo(w / 2, 24);
      ctx.lineTo(w, 16);
      ctx.closePath();
      ctx.fill();
      diamond(ctx, w / 2, 8, w, 16);
      ctx.fillStyle = shade(color, 1.15);
      ctx.fill();
      return;
    }
    case 'prop':
      drawProp(ctx, spec, f);
      return;
    case 'char':
    case 'overlay':
      drawCharLike(ctx, spec, f);
      return;
    case 'mob': {
      const s = w;
      const bob = f === 1 ? 1 : 0;
      ctx.fillStyle = f === 3 ? shade(color, 1.35) : f === 2 ? shade(color, 0.7) : hex(color);
      ctx.beginPath();
      ctx.ellipse(s / 2, s * 0.62 + bob, s * 0.42, s * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = outline;
      const eye = Math.max(1, Math.round(s / 12));
      ctx.fillRect(Math.round(s * 0.36), Math.round(s * 0.55) + bob, eye, eye * (f === 2 ? 1 : 2));
      ctx.fillRect(Math.round(s * 0.6), Math.round(s * 0.55) + bob, eye, eye * (f === 2 ? 1 : 2));
      if (f === 3) {
        ctx.fillRect(Math.round(s * 0.42), Math.round(s * 0.72), Math.round(s * 0.18), eye);
      }
      return;
    }
    case 'icon': {
      ctx.fillStyle = hex(color);
      roundRect(ctx, 1, 1, w - 2, h - 2, 3);
      ctx.fill();
      ctx.fillStyle = outline;
      drawGlyph(ctx, spec.key, w, h);
      return;
    }
    case 'fx': {
      const t = (f + 1) / spec.frames;
      ctx.globalAlpha = 1 - t * 0.7;
      ctx.strokeStyle = hex(color);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.max(1, (Math.min(w, h) / 2 - 1) * t), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }
  }
}

function drawProp(ctx: CanvasRenderingContext2D, spec: AssetSpec, f: number): void {
  const { key, w, h, color } = spec;
  if (key === 'prop-tree' || key === 'prop-pine') {
    ctx.fillStyle = '#7a4f2a';
    ctx.fillRect(w / 2 - 2, h - 14, 4, 12);
    ctx.fillStyle = hex(color);
    if (key === 'prop-tree') {
      ctx.beginPath();
      ctx.arc(w / 2, h - 26, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(w / 2, 2);
      ctx.lineTo(w / 2 + 11, h - 12);
      ctx.lineTo(w / 2 - 11, h - 12);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }
  if (key === 'prop-house') {
    ctx.fillStyle = f === 0 ? shade(color, 0.7) : hex(color);
    ctx.fillRect(4, h - 26, w - 8, 24);
    ctx.fillStyle = f === 0 ? '#6b5a4a' : '#b5523b';
    ctx.beginPath();
    ctx.moveTo(1, h - 25);
    ctx.lineTo(w / 2, h - 44);
    ctx.lineTo(w - 1, h - 25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3b2a1e';
    ctx.fillRect(w / 2 - 3, h - 12, 6, 10);
    return;
  }
  // 열림·켜짐 프레임은 밝게
  ctx.fillStyle = f === 1 ? shade(color, 1.3) : hex(color);
  roundRect(ctx, 1, Math.max(0, h - Math.min(h, w) - 1), w - 2, Math.min(h, w), 3);
  ctx.fill();
  ctx.fillStyle = '#1b1f2a';
  ctx.fillRect(w / 2 - 1, h - Math.min(h, w) / 2 - 1, 2, 2);
}

function drawCharLike(ctx: CanvasRenderingContext2D, spec: AssetSpec, f: number): void {
  const { key, w, color } = spec;
  const back = f >= 5;
  const step = f % 5; // 0 = 대기, 1~4 = 걷기
  const bob = step === 1 || step === 3 ? -1 : 0;
  if (spec.kind === 'overlay') {
    ctx.fillStyle = hex(color);
    if (key.includes('-hat-')) {
      ctx.fillRect(4, 1 + bob, 8, 3);
      ctx.fillRect(3, 3 + bob, 10, 1);
    } else if (key.includes('-tool-')) {
      ctx.fillRect(back ? 2 : 13, 9 + bob, 1, 11);
      ctx.fillRect(back ? 1 : 12, 8 + bob, 3, 2);
    } else {
      ctx.fillRect(4, 21, 8, 2);
    }
    return;
  }
  // 몸
  ctx.fillStyle = shade(color, 0.85);
  ctx.fillRect(4, 11 + bob, 8, 9);
  // 다리(걷기 프레임은 번갈아)
  ctx.fillStyle = '#3b3f4a';
  const legShift = step === 1 ? 1 : step === 3 ? -1 : 0;
  ctx.fillRect(5, 20, 2, 2 + Math.max(0, legShift));
  ctx.fillRect(9, 20, 2, 2 + Math.max(0, -legShift));
  // 머리
  ctx.fillStyle = key === 'char-robi' ? hex(color) : '#f1c9a5';
  ctx.fillRect(4, 3 + bob, 8, 8);
  ctx.fillStyle = hex(color);
  ctx.fillRect(4, 3 + bob, 8, back ? 6 : 2);
  if (!back) {
    ctx.fillStyle = '#1b1f2a';
    ctx.fillRect(8, 6 + bob, 1, 2);
    ctx.fillRect(10, 6 + bob, 1, 2);
  }
  if (key === 'char-robi') {
    ctx.fillStyle = '#f2c94c';
    ctx.fillRect(w / 2 - 1, 0 + bob, 2, 3);
  }
}

function drawGlyph(ctx: CanvasRenderingContext2D, key: string, w: number, h: number): void {
  const cx = w / 2;
  const cy = h / 2;
  const arrow = (dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * 5, cy + dy * 5);
    ctx.lineTo(cx - dy * 4 - dx * 2, cy + dx * 4 - dy * 2);
    ctx.lineTo(cx + dy * 4 - dx * 2, cy - dx * 4 - dy * 2);
    ctx.closePath();
    ctx.fill();
  };
  if (key.endsWith('-up') || key === 'icon-robi' || key.endsWith('-forward')) return arrow(0, -1);
  if (key.endsWith('-down')) return arrow(0, 1);
  if (key.endsWith('-left') || key.endsWith('-turnLeft')) return arrow(-1, 0);
  if (key.endsWith('-right') || key.endsWith('-turnRight')) return arrow(1, 0);
  ctx.fillRect(cx - 2, cy - 2, 4, 4);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
