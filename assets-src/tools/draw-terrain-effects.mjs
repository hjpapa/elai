import { Grid, save } from './pixel.mjs';

function tile(key, frame = 0) {
  const grid = new Grid(32, 16);
  const base = { grass: 'g', flower: 'g', path: 'T', water: 'B', stone: 'A', wood: 'e', bridge: 'e', sand: 't' }[key];
  for (let y = 0; y < 16; y++) {
    const width = 4 * (y < 8 ? y + 1 : 16 - y), left = (32 - width) / 2;
    for (let x = left; x < left + width; x++) {
      const edge = x < left + 2 || x >= left + width - 2 || y === 0 || y === 15;
      let c = base;
      if (!edge) {
        if (key === 'grass' || key === 'flower') {
          if ((x * 13 + y * 7) % 23 === 0) c = 'L';
          else if ((x + y * 7) % 29 === 0) c = 'G';
        } else if (key === 'path') {
          if ((x * 5 + y * 13) % 23 === 0) c = 't';
          else if ((x * 7 + y * 3) % 31 === 0) c = 'e';
        } else if (key === 'water') {
          if ((x + y * 2 + frame * 3) % 13 < 4 && y % 3 === 1) c = 'b';
          else if ((x + y * 2) % 19 === 0) c = 'N';
        } else if (key === 'stone') {
          if ((y + Math.floor(x / 2)) % 7 === 0 || (y - Math.floor(x / 2) + 16) % 11 === 0) c = 'S';
          else if ((y + Math.floor(x / 2)) % 7 === 1) c = 'a';
        } else if (key === 'wood' || key === 'bridge') {
          if ((y + Math.floor(x / 2)) % 5 === 0) c = 'E';
          else if ((y + Math.floor(x / 2)) % 5 === 1) c = 'T';
          else if ((x + y * 3) % 17 === 0) c = 'T';
        } else if (key === 'sand') {
          if ((x + y * 3) % 19 < 5 && y % 4 === 0) c = 'Y';
          else if ((x * 7 + y * 11) % 31 === 0) c = 'W';
        }
      }
      grid.set(x, y, c);
    }
  }
  if (key === 'flower') {
    for (const [x, y, color] of [[9, 7, 'p'], [21, 6, 'y'], [18, 11, 'W']]) {
      grid.set(x, y + 1, 'G').set(x - 1, y, color).set(x + 1, y, color).set(x, y - 1, color).set(x, y, 'Y');
    }
  }
  if (key === 'bridge') for (const [x, y] of [[6, 7], [11, 10], [21, 5], [26, 8]]) grid.set(x, y, 'S').set(x, y - 1, 'a');
  return grid;
}
for (const key of ['grass', 'flower', 'path', 'water', 'stone', 'wood', 'bridge', 'sand']) save(`tile-${key}`, key === 'water' ? [tile(key), tile(key, 1)] : [tile(key)]);

for (const key of ['hedge', 'wall']) {
  const g = new Grid(32, 24), hedge = key === 'hedge';
  for (let x = 0; x < 32; x++) {
    const top = 8 + Math.floor(Math.min(x, 31 - x) / 2);
    for (let y = top + 1; y <= top + 8; y++) {
      let color = hedge ? (x < 16 ? 'g' : 'G') : (x < 16 ? 'S' : 'N');
      if (hedge && (x * 3 + y * 7) % 17 === 0) color = x < 16 ? 'L' : 'g';
      if (!hedge && ((y - top) % 4 === 0 || (x + (y > top + 4 ? 4 : 0)) % 9 === 0)) color = 'O';
      if (y === top + 8) color = hedge ? 'G' : 'O';
      g.set(x, y, color);
    }
  }
  const top = tile(hedge ? 'grass' : 'stone');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) if (top.get(x, y) !== '.') g.set(x, y, top.get(x, y));
  if (hedge) for (const [x, y] of [[6, 7], [12, 5], [18, 9], [24, 7]]) g.line(x - 1, y, x, y - 1, 'L').line(x, y, x + 2, y, 'G');
  save(`block-${key}`, [g]);
}

function sparkle(g, x, y, r, color = 'W') {
  g.line(x - r, y, x + r, y, color).line(x, y - r, x, y + r, color);
  if (r >= 2) g.rect(x - 1, y - 1, 3, 3, color).set(x, y, 'w');
}
function heart(g, x, y, color) { g.stamp([`.${color}.${color}.`, `${color.repeat(5)}`, `${color.repeat(5)}`, `.${color.repeat(3)}.`, `..${color}..`], x - 2, y - 2); }
function shield(g, ox, oy, color) {
  g.line(ox - 6, oy - 6, ox, oy - 8, color).line(ox, oy - 8, ox + 6, oy - 6, color);
  g.line(ox - 6, oy - 6, ox - 5, oy + 2, color).line(ox + 6, oy - 6, ox + 5, oy + 2, color);
  g.line(ox - 5, oy + 2, ox, oy + 7, color).line(ox + 5, oy + 2, ox, oy + 7, color);
}

save('fx-hit', Array.from({ length: 3 }, (_, f) => {
  const g = new Grid(16, 16);
  if (f < 2) {
    g.poly([[8, 2 - f], [9, 5], [14 + f, 7], [10, 9], [8, 14 + f], [6, 10], [1 - f, 8], [5, 6]], f ? 'y' : 'W');
    sparkle(g, 8, 8, 2, 'w');
  } else for (const [x, y] of [[3, 3], [12, 3], [3, 12], [12, 12]]) sparkle(g, x, y, 1, 'Y');
  return g;
}));
save('fx-guard', Array.from({ length: 3 }, (_, f) => {
  const g = new Grid(24, 24);
  shield(g, 12, 12, f === 1 ? 'W' : 'b');
  if (f !== 2) {
    g.line(12, 7, 12, 16, 'w').line(9, 10, 15, 10, 'w');
    if (f === 1) { sparkle(g, 3, 5, 1, 'b'); sparkle(g, 21, 5, 1, 'b'); }
  }
  else { sparkle(g, 3, 5, 1, 'b'); sparkle(g, 21, 15, 1, 'W'); }
  return g;
}));
save('fx-heal', Array.from({ length: 4 }, (_, f) => {
  const g = new Grid(16, 16);
  heart(g, 8, 11 - f * 2, f === 3 ? 'c' : 'L');
  g.set(7, 9 - f * 2, 'W');
  sparkle(g, f % 2 ? 12 : 3, 12 - f * 2, 1, 'y');
  if (f === 1 || f === 2) g.set(5, 14, 'c').set(10, 13, 'c');
  return g;
}));
save('fx-purify', Array.from({ length: 6 }, (_, f) => {
  const g = new Grid(32, 32), radius = 4 + f * 2;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4 + f * 0.14;
    const x = Math.round(16 + Math.cos(angle) * radius), y = Math.round(16 + Math.sin(angle) * radius);
    sparkle(g, x, y, f === 2 || f === 3 ? 2 : 1, i % 2 ? 'c' : 'y');
  }
  if (f < 3) sparkle(g, 16, 16, 3 - f, 'W');
  if (f >= 2 && f <= 4) heart(g, 16, 16 - (f - 2) * 3, 'p');
  return g;
}));
save('fx-levelup', Array.from({ length: 6 }, (_, f) => {
  const g = new Grid(32, 32), top = Math.max(1, 21 - f * 4);
  for (let x = 10; x <= 22; x += 3) g.line(x, top + Math.abs(x - 16), x, 27 - (f % 2), x === 16 ? 'W' : f > 3 ? 'y' : 'Y');
  g.line(5, 27, 12, 30, 'Y').line(12, 30, 24, 29, 'Y').line(24, 29, 28, 26, 'y');
  const cy = 22 - f * 3;
  g.poly([[16, cy - 4], [21, cy + 1], [18, cy + 1], [18, cy + 5], [14, cy + 5], [14, cy + 1], [11, cy + 1]], 'y');
  sparkle(g, f % 2 ? 6 : 26, 22 - f * 3, 2, 'W');
  return g;
}));
save('fx-sparkle', [1, 2, 3, 1].map((r, f) => { const g = new Grid(8, 8); sparkle(g, 3, 3, r, f === 3 ? 'y' : 'W'); if (f === 2) g.set(1, 1, 'Y').set(5, 5, 'Y'); return g; }));
