import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { ASSETS } from '../src/game/assets.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
export const BASE_PALETTE = ['#293044','#4c3848','#56657a','#8c9bab','#c7d6dc','#fff4d2','#ffffff','#344d78','#478bc7','#82cce0','#49b5b1','#a4e3c2','#285c4b','#4c8f4c','#8dc567','#d6e69a','#684b3f','#a76c46','#d39a62','#edc890','#86513e','#bd7959','#e3ab80','#f6d4a5','#b94751','#ed7463','#cf719d','#f5b1b0','#7962ab','#b5a0dc','#e7b64f','#ffe59a'];
export const PILOT_KEYS = [
  'tile-grass','tile-flower','tile-path','tile-water','tile-bridge','tile-stone',
  'prop-house','prop-fountain','prop-lamp','prop-booth','prop-gate','prop-tree','prop-pine','prop-bush','prop-fence','prop-sign','prop-chest','prop-bridge-broken',
  'char-player','char-robi','char-elder','char-zen','equip-hat-cap','equip-tool-stick','robi-part-wheel','mob-dummy',
  'icon-quest-new','icon-quest-doing','icon-guide-arrow','icon-path-step','icon-talk','fx-target','ui-panel','ui-button','ui-bubble','ui-slot','ui-bar','ui-stick',
];

export function parsePalette(data) {
  if (data?.transparent !== '.' || !data.colors || typeof data.colors !== 'object' || Array.isArray(data.colors)) {
    throw new Error('palette.json: transparent는 ".", colors는 글자 → #rrggbb 객체여야 해요.');
  }
  const entries = Object.entries(data.colors);
  if (entries.length < 32 || entries.length > 64) throw new Error('팔레트는 기존 32색을 포함해 32~64색이어야 해요.');
  const colors = new Set(), symbols = new Map();
  for (const [symbol, color] of entries) {
    if (!/^[!-~]$/.test(symbol) || symbol === '.' || typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error(`팔레트 항목 오류: ${symbol}=${color}`);
    }
    const normalized = color.toLowerCase();
    if (colors.has(normalized)) throw new Error(`팔레트에 같은 색이 두 번 있어요: ${normalized}`);
    colors.add(normalized);
    symbols.set(symbol, [1, 3, 5].map(offset => Number.parseInt(normalized.slice(offset, offset + 2), 16)));
  }
  if (BASE_PALETTE.some((color, index) => [...colors][index] !== color)) throw new Error('팔레트 처음 32색의 순서와 값은 바꾸지 않아요. 숫자 키는 객체 순서를 바꾸므로 사용하지 않아요.');
  return { colors: [...colors], symbols };
}

export function parseFrames(text, spec, symbols, density = 1) {
  if (density !== 1 && density !== 2) throw new Error(`${spec.key}: 밀도는 1 또는 2여야 해요.`);
  const width = spec.w * density, height = spec.h * density;
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\n$/, '');
  const frames = normalized.split('\n\n').map(frame => frame.split('\n'));
  if (frames.length !== spec.frames) throw new Error(`${spec.key}: 프레임 ${frames.length}개, 계약은 ${spec.frames}개예요.`);
  frames.forEach((rows, f) => {
    if (rows.length !== height) throw new Error(`${spec.key} 프레임 ${f}: 높이 ${rows.length}, 밀도 ${density} 규격은 ${height}예요.`);
    rows.forEach((row, y) => {
      if (row.length !== width) throw new Error(`${spec.key} 프레임 ${f}, ${y + 1}행: 너비 ${row.length}, 밀도 ${density} 규격은 ${width}예요.`);
      for (const symbol of row) if (symbol !== '.' && !symbols.has(symbol)) throw new Error(`${spec.key} 프레임 ${f}, ${y + 1}행: 팔레트 밖 글자 ${JSON.stringify(symbol)}`);
    });
    if (!rows.some(row => /[^.]/.test(row))) throw new Error(`${spec.key} 프레임 ${f}: 그림이 비어 있어요.`);
  });
  return frames;
}

export function renderFrames(spec, frames, symbols, density = 1) {
  const w = spec.w * density, h = spec.h * density;
  const png = new PNG({ width: w * spec.frames, height: h });
  frames.forEach((rows, f) => rows.forEach((row, y) => [...row].forEach((symbol, x) => {
    if (symbol === '.') return;
    png.data.set([...symbols.get(symbol), 255], (y * png.width + f * w + x) * 4);
  })));
  return png;
}

async function optionalSource(path) {
  try { return await readFile(path, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

export async function loadAsset(spec, symbols, sourceRoot = resolve(root, 'assets-src')) {
  const legacyPath = resolve(sourceRoot, spec.kind, `${spec.key}.txt`);
  const hiresPath = resolve(sourceRoot, 'hires', spec.kind, `${spec.key}.txt`);
  const [oldText, newText] = await Promise.all([optionalSource(legacyPath), optionalSource(hiresPath)]);
  if (oldText === null && newText === null) throw new Error(`${spec.key}: 옛 원본과 2배 원본이 모두 없어요.`);
  // 잘못된 2배 원본을 옛 원본으로 조용히 대체하지 않아요. 비교용 옛 원본도 함께 검사해요.
  const legacy = oldText === null ? null : renderFrames(spec, parseFrames(oldText, spec, symbols), symbols);
  const density = newText === null ? 1 : 2;
  const png = newText === null ? legacy : renderFrames(spec, parseFrames(newText, spec, symbols, 2), symbols, 2);
  return { spec, density, png, legacy };
}

export function canvas(width, height, color) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) png.data.set([...color, 255], i);
  return png;
}
export function blitScaled(source, target, ox, oy, scale) {
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
    const from = (y * source.width + x) * 4;
    if (source.data[from + 3] === 0) continue;
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const tx = ox + x * scale + dx, ty = oy + y * scale + dy;
      if (tx >= 0 && ty >= 0 && tx < target.width && ty < target.height) target.data.set(source.data.subarray(from, from + 4), (ty * target.width + tx) * 4);
    }
  }
}
function contactSheet(assets, background) {
  const padding = 16, width = 1280;
  let x = padding, y = padding, rowH = 0;
  const placements = assets.map(({ png, density }) => {
    const scale = 4 / density, w = png.width * scale, h = png.height * scale;
    if (w > width - padding * 2) throw new Error('검토용 그림보다 넓은 스프라이트 시트예요.');
    if (x + w > width - padding) { x = padding; y += rowH + padding; rowH = 0; }
    const position = { x, y, png, scale }; x += w + padding; rowH = Math.max(rowH, h); return position;
  });
  const sheet = canvas(width, y + rowH + padding, background);
  for (const { x, y, png, scale } of placements) blitScaled(png, sheet, x, y, scale);
  return sheet;
}

// 검토판의 기술 키를 읽을 수 있는 작은 비트맵 글꼴. 제품 화면에는 쓰지 않아요.
const FONT = {
 A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
 '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],'-':['00000','00000','00000','11111','00000','00000','00000'],'/':['00001','00001','00010','00100','01000','10000','10000'],
};
export function label(png, text, x, y, color, scale = 2) {
  for (const char of text.toUpperCase()) {
    const rows = FONT[char];
    if (rows) for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (rows[j][i] === '1') {
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) png.data.set([...color, 255], ((y + j * scale + dy) * png.width + x + i * scale + dx) * 4);
    }
    x += 6 * scale;
  }
}
export function comparisonSheet(assets, palette, keys = PILOT_KEYS) {
  const pilots = keys.map(key => assets.find(asset => asset.spec.key === key)).filter(Boolean);
  const maxStrip = Math.max(...pilots.map(asset => asset.spec.w * asset.spec.frames * 4));
  const padding = 24, gap = 32, width = maxStrip * 2 + padding * 2 + gap;
  const height = 56 + pilots.reduce((sum, asset) => sum + asset.spec.h * 4 + 40, 0);
  const sheet = canvas(width, height, palette.symbols.get('O'));
  const textColor = palette.symbols.get('W'), right = padding + maxStrip + gap;
  label(sheet, '1X / 4X', padding, 16, textColor); label(sheet, '2X / 2X', right, 16, textColor);
  let y = 56;
  for (const asset of pilots) {
    label(sheet, asset.spec.key + (asset.legacyDensity === 2 ? ' - C11 2X / 2X' : ''), padding, y, textColor); label(sheet, asset.spec.key, right, y, textColor);
    const artY = y + 22;
    if (asset.legacy) blitScaled(asset.legacy, sheet, padding, artY, 4 / (asset.legacyDensity ?? 1));
    else label(sheet, 'NEW KEY - NO 1X SOURCE', padding, artY + 16, palette.symbols.get('A'));
    blitScaled(asset.png, sheet, right, artY, 4 / asset.density);
    y += asset.spec.h * 4 + 40;
  }
  return sheet;
}

export function packAtlas(assets) {
  const padding = 2;
  const order = assets.map((asset, i) => ({ ...asset, i })).sort((a, b) => b.png.height - a.png.height || b.png.width - a.png.width || a.i - b.i);
  for (const size of [256, 512, 1024, 2048, 4096]) {
    let x = padding, y = padding, rowH = 0; const placements = [];
    for (const { png, spec } of order) {
      if (png.width + padding * 2 > size) break;
      if (x + png.width + padding > size) { x = padding; y += rowH + padding * 2; rowH = 0; }
      if (y + png.height + padding > size) break;
      placements.push({ png, spec, x, y }); x += png.width + padding * 2; rowH = Math.max(rowH, png.height);
    }
    if (placements.length !== assets.length) continue;
    const atlas = new PNG({ width: size, height: size }), frames = {};
    for (const { png, spec, x, y } of placements) {
      PNG.bitblt(png, atlas, 0, 0, png.width, png.height, x, y);
      const w = png.width, h = png.height;
      frames[spec.key] = { frame: { x, y, w, h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h } };
    }
    return { image: atlas, data: { frames, meta: { image: 'atlas.png', format: 'RGBA8888', size: { w: size, h: size }, scale: '1' } } };
  }
  throw new Error('그림 묶음이 4096×4096을 넘어요.');
}

async function main() {
  const palette = parsePalette(JSON.parse(await readFile(resolve(root, 'assets-src/palette.json'), 'utf8')));
  const seen = new Set(), assets = [];
  // 모든 원본과 비교판을 먼저 검사/생성해, 잘못된 원본은 기존 결과를 덮어쓰기 전에 거절해요.
  for (const spec of ASSETS) {
    if (seen.has(spec.key) || ![spec.w, spec.h, spec.frames].every(n => Number.isInteger(n) && n > 0)) throw new Error(`계약의 키 또는 크기가 잘못됐어요: ${spec.key}`);
    seen.add(spec.key); assets.push(await loadAsset(spec, palette.symbols));
  }
  const atlas = packAtlas(assets);
  const sheet = contactSheet(assets, palette.symbols.get('O'));
  const pilot = comparisonSheet(assets, palette);
  const entries = assets.map(({ spec, density }) => ({ key: spec.key, file: `${spec.kind}/${spec.key}.png`, ...(density === 2 ? { density: 2 } : {}) }));
  for (let i = 0; i < entries.length; i++) {
    const target = resolve(root, 'public/assets', entries[i].file); await mkdir(dirname(target), { recursive: true }); await writeFile(target, PNG.sync.write(assets[i].png));
  }
  await mkdir(resolve(root, 'assets-preview'), { recursive: true });
  await writeFile(resolve(root, 'assets-preview/contact-sheet.png'), PNG.sync.write(sheet));
  await writeFile(resolve(root, 'assets-preview/pilot-sheet.png'), PNG.sync.write(pilot));
  await writeFile(resolve(root, 'public/assets/atlas.png'), PNG.sync.write(atlas.image));
  await writeFile(resolve(root, 'public/assets/atlas.json'), JSON.stringify(atlas.data, null, 2) + '\n');
  const manifest = { version: 1, palette: palette.colors, assets: entries, atlas: { image: 'atlas.png', data: 'atlas.json' } };
  await writeFile(resolve(root, 'public/assets/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`아틀라스: ${atlas.image.width}×${atlas.image.height}`);
  console.log(`그림 ${entries.length}개 · 2배 ${assets.filter(asset => asset.density === 2).length}개 · 팔레트 ${palette.colors.length}색 생성 완료`);
  console.log(`검토판: contact-sheet.png ${sheet.width}×${sheet.height}, pilot-sheet.png ${pilot.width}×${pilot.height} (1배 원본×4 / 2배 원본×2)`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(`그림 생성 실패: ${error.message}`); process.exitCode = 1; });
