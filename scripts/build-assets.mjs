import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { ASSETS } from '../src/game/assets.ts';

const root = fileURLToPath(new URL('../', import.meta.url));

export function parsePalette(data) {
  if (data?.transparent !== '.' || !data.colors || typeof data.colors !== 'object' || Array.isArray(data.colors)) {
    throw new Error('palette.json: transparent는 ".", colors는 글자 → #rrggbb 객체여야 해요.');
  }
  const entries = Object.entries(data.colors);
  if (entries.length < 1 || entries.length > 32) throw new Error('팔레트는 1~32색이어야 해요.');
  const colors = new Set();
  const symbols = new Map();
  for (const [symbol, color] of entries) {
    if (!/^[!-~]$/.test(symbol) || symbol === '.' || !/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error(`팔레트 항목 오류: ${symbol}=${color}`);
    }
    const normalized = color.toLowerCase();
    if (colors.has(normalized)) throw new Error(`팔레트에 같은 색이 두 번 있어요: ${normalized}`);
    colors.add(normalized);
    symbols.set(symbol, [1, 3, 5].map(offset => Number.parseInt(normalized.slice(offset, offset + 2), 16)));
  }
  return { colors: [...colors], symbols };
}

export function parseFrames(text, spec, symbols) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\n$/, '');
  const frames = normalized.split('\n\n').map(frame => frame.split('\n'));
  if (frames.length !== spec.frames) throw new Error(`${spec.key}: 프레임 ${frames.length}개, 계약은 ${spec.frames}개예요.`);
  frames.forEach((rows, f) => {
    if (rows.length !== spec.h) throw new Error(`${spec.key} 프레임 ${f}: 높이 ${rows.length}, 계약은 ${spec.h}예요.`);
    rows.forEach((row, y) => {
      if (row.length !== spec.w) throw new Error(`${spec.key} 프레임 ${f}, ${y + 1}행: 너비 ${row.length}, 계약은 ${spec.w}예요.`);
      for (const symbol of row) if (symbol !== '.' && !symbols.has(symbol)) {
        throw new Error(`${spec.key} 프레임 ${f}, ${y + 1}행: 팔레트 밖 글자 ${JSON.stringify(symbol)}`);
      }
    });
    if (!rows.some(row => /[^.]/.test(row))) throw new Error(`${spec.key} 프레임 ${f}: 그림이 비어 있어요.`);
  });
  return frames;
}

function render(spec, frames, symbols) {
  const png = new PNG({ width: spec.w * spec.frames, height: spec.h });
  frames.forEach((rows, f) => rows.forEach((row, y) => [...row].forEach((symbol, x) => {
    if (symbol === '.') return;
    const offset = (y * png.width + f * spec.w + x) * 4;
    png.data.set([...symbols.get(symbol), 255], offset);
  })));
  return png;
}

function contactSheet(images, background) {
  const scale = 4, padding = 16, width = 1280;
  let x = padding, y = padding, rowH = 0;
  const placements = images.map(png => {
    const w = png.width * scale, h = png.height * scale;
    if (w > width - padding * 2) throw new Error('검토용 그림보다 넓은 스프라이트 시트예요.');
    if (x + w > width - padding) { x = padding; y += rowH + padding; rowH = 0; }
    const position = { x, y, png };
    x += w + padding;
    rowH = Math.max(rowH, h);
    return position;
  });
  const sheet = new PNG({ width, height: y + rowH + padding });
  for (let i = 0; i < sheet.data.length; i += 4) sheet.data.set([...background, 255], i);
  for (const { x: ox, y: oy, png } of placements) {
    for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
      const from = (y * png.width + x) * 4;
      if (png.data[from + 3] === 0) continue;
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
        const to = ((oy + y * scale + dy) * width + ox + x * scale + dx) * 4;
        sheet.data.set(png.data.subarray(from, from + 4), to);
      }
    }
  }
  return sheet;
}

async function main() {
  const palette = parsePalette(JSON.parse(await readFile(resolve(root, 'assets-src/palette.json'), 'utf8')));
  const seen = new Set();
  // 모든 원본을 먼저 검사해서 잘못된 원본이 있으면 기존 PNG를 덮어쓰지 않아요.
  const images = [];
  for (const spec of ASSETS) {
    if (seen.has(spec.key) || ![spec.w, spec.h, spec.frames].every(n => Number.isInteger(n) && n > 0)) {
      throw new Error(`계약의 키 또는 크기가 잘못됐어요: ${spec.key}`);
    }
    seen.add(spec.key);
    const source = resolve(root, 'assets-src', spec.kind, `${spec.key}.txt`);
    const frames = parseFrames(await readFile(source, 'utf8'), spec, palette.symbols);
    images.push(render(spec, frames, palette.symbols));
  }
  const sheet = contactSheet(images, palette.symbols.get('O') ?? [...palette.symbols.values()][0]);
  const entries = ASSETS.map(spec => ({ key: spec.key, file: `${spec.kind}/${spec.key}.png` }));
  for (let i = 0; i < entries.length; i++) {
    const target = resolve(root, 'public/assets', entries[i].file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, PNG.sync.write(images[i]));
  }
  const preview = resolve(root, 'assets-preview/contact-sheet.png');
  await mkdir(dirname(preview), { recursive: true });
  await writeFile(preview, PNG.sync.write(sheet));
  const manifest = { version: 1, palette: palette.colors, assets: entries };
  await writeFile(resolve(root, 'public/assets/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`그림 ${entries.length}개 · 팔레트 ${palette.colors.length}색 생성 완료`);
  console.log(`검토용 그림: assets-preview/contact-sheet.png (${sheet.width}×${sheet.height}, 4배)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`그림 생성 실패: ${error.message}`); process.exitCode = 1; });
}
