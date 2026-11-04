// 텍스트 원본을 그릴 때 쓰는 정수 픽셀 도구예요. PNG 생성에는 필요하지 않아요.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ASSETS } from '../../src/game/assets.ts';

export class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.rows = Array.from({ length: h }, () => Array(w).fill('.')); }
  get(x, y) { return this.rows[y]?.[x] ?? '.'; }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.rows[y][x] = c; return this; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); return this; }
  line(x0, y0, x1, y1, c) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) this.set(x0 + (x1 - x0) * (steps ? i / steps : 0), y0 + (y1 - y0) * (steps ? i / steps : 0), c);
    return this;
  }
  ellipse(cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.05) this.set(x, y, c); return this; }
  poly(points, c) {
    const ys = points.map(p => p[1]);
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
      for (let x = 0; x < this.w; x++) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const [xi, yi] = points[i], [xj, yj] = points[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.set(x, y, c);
      }
    }
    for (let i = 0; i < points.length; i++) this.line(...points[i], ...points[(i + 1) % points.length], c);
    return this;
  }
  stamp(rows, ox = 0, oy = 0) { rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') this.set(x + ox, y + oy, c); })); return this; }
  outline(c = 'O') { const rows = this.rows.map(r => [...r]); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (rows[y][x] !== '.') for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) if (this.get(x+dx,y+dy) === '.') this.set(x+dx,y+dy,c); return this; }
  text() { return this.rows.map(r => r.join('')).join('\n'); }
}

export function save(key, frames) {
  const spec = ASSETS.find(a => a.key === key);
  if (!spec || frames.length !== spec.frames || frames.some(g => g.w !== spec.w || g.h !== spec.h)) throw new Error(`원본 규격 불일치: ${key}`);
  const dir = fileURLToPath(new URL(`../${spec.kind}/`, import.meta.url));
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${key}.txt`, frames.map(g => g.text()).join('\n\n') + '\n', 'utf8');
}
