import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { ASSETS, ASSET_BY_KEY, type Manifest } from '../src/game/assets';

const ASSET_DIR = 'public/assets';
const MANIFEST = join(ASSET_DIR, 'manifest.json');

/** 처음 32색. 팔레트를 64색까지 늘려도 이 색은 그대로 둬야 옛 그림이 깨지지 않아요. */
const BASE_PALETTE = [
  '#293044', '#4c3848', '#56657a', '#8c9bab', '#c7d6dc', '#fff4d2', '#ffffff', '#344d78',
  '#478bc7', '#82cce0', '#49b5b1', '#a4e3c2', '#285c4b', '#4c8f4c', '#8dc567', '#d6e69a',
  '#684b3f', '#a76c46', '#d39a62', '#edc890', '#86513e', '#bd7959', '#e3ab80', '#f6d4a5',
  '#b94751', '#ed7463', '#cf719d', '#f5b1b0', '#7962ab', '#b5a0dc', '#e7b64f', '#ffe59a',
];

/** 고해상도 그림(density 2)은 PNG가 목록 크기의 2배예요. */
const densityOf = (e: { density?: number }) => e.density ?? 1;

describe('그림 키 목록', () => {
  it('키가 겹치지 않아요', () => {
    expect(ASSET_BY_KEY.size).toBe(ASSETS.length);
  });

  it('크기와 프레임 수가 규격에 맞아요', () => {
    for (const a of ASSETS) {
      expect(a.w, a.key).toBeGreaterThan(0);
      expect(a.h, a.key).toBeGreaterThan(0);
      expect(a.frames, a.key).toBeGreaterThanOrEqual(1);
      if (a.kind === 'tile') expect([a.w, a.h], a.key).toEqual([32, 16]);
      // 블록은 32×24, 건물 안 높은 벽은 32×56이에요(옆면만 길어요).
      if (a.kind === 'block') expect([[32, 24], [32, 56]], a.key).toContainEqual([a.w, a.h]);
      if (a.kind === 'char' || a.kind === 'overlay') expect([a.w, a.h, a.frames], a.key).toEqual([16, 24, 10]);
      if (a.kind === 'icon') expect([a.w, a.h], a.key).toEqual([16, 16]);
      if (a.kind === 'mob') expect(a.frames, a.key).toBe(4);
      if (a.kind === 'prop') expect(a.w <= 32 && a.h <= 48, a.key).toBe(true);
      // 화면 테두리는 8px 단위로 9칸 나눔을 해요.
      if (a.kind === 'ui') expect(a.w % 8 === 0 && a.h % 8 === 0, a.key).toBe(true);
    }
  });
});

describe.skipIf(!existsSync(MANIFEST))('매니페스트와 PNG', () => {
  const manifest = existsSync(MANIFEST) ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest) : null;

  it('팔레트는 64색 이내의 #rrggbb이고, 처음 32색은 그대로예요', () => {
    expect(manifest!.palette.length).toBeGreaterThanOrEqual(BASE_PALETTE.length);
    expect(manifest!.palette.length).toBeLessThanOrEqual(64);
    for (const c of manifest!.palette) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest!.palette.slice(0, BASE_PALETTE.length).map((c) => c.toLowerCase())).toEqual(BASE_PALETTE);
    expect(new Set(manifest!.palette.map((c) => c.toLowerCase())).size, '같은 색이 두 번 있어요').toBe(manifest!.palette.length);
  });

  it('픽셀 밀도는 1(목록 크기) 또는 2(고해상도)예요', () => {
    for (const e of manifest!.assets) expect([1, 2], e.key).toContain(densityOf(e));
  });

  it('모든 항목이 목록에 있는 키이고 파일이 있어요', () => {
    const seen = new Set<string>();
    for (const e of manifest!.assets) {
      expect(ASSET_BY_KEY.has(e.key), `목록에 없는 키: ${e.key}`).toBe(true);
      expect(seen.has(e.key), `중복 키: ${e.key}`).toBe(false);
      seen.add(e.key);
      expect(existsSync(join(ASSET_DIR, e.file)), `파일 없음: ${e.file}`).toBe(true);
    }
  });

  it.skipIf(!manifest?.atlas)('아틀라스(한 장 묶음)의 프레임이 키마다 가로 띠 크기와 같고 그림 안에 있어요', () => {
    const atlas = manifest!.atlas!;
    const png = PNG.sync.read(readFileSync(join(ASSET_DIR, atlas.image)));
    const data = JSON.parse(readFileSync(join(ASSET_DIR, atlas.data), 'utf8')) as {
      frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>;
    };
    for (const entry of manifest!.assets) {
      const spec = ASSET_BY_KEY.get(entry.key)!;
      const f = data.frames[spec.key]?.frame;
      const d = densityOf(entry);
      expect(f, `아틀라스에 없는 키: ${spec.key}`).toBeDefined();
      expect([f.w, f.h], spec.key).toEqual([spec.w * spec.frames * d, spec.h * d]);
      expect(f.x >= 0 && f.y >= 0 && f.x + f.w <= png.width && f.y + f.h <= png.height, spec.key).toBe(true);
    }
  });

  it('PNG 크기·팔레트·투명도가 규격에 맞아요', () => {
    const palette = new Set(manifest!.palette.map((c) => c.toLowerCase()));
    for (const e of manifest!.assets) {
      const spec = ASSET_BY_KEY.get(e.key);
      if (!spec) continue;
      const png = PNG.sync.read(readFileSync(join(ASSET_DIR, e.file)));
      const d = densityOf(e);
      expect([png.width, png.height], e.key).toEqual([spec.w * spec.frames * d, spec.h * d]);
      const bad = new Set<string>();
      for (let i = 0; i < png.data.length; i += 4) {
        const a = png.data[i + 3];
        if (a === 0) continue;
        if (a !== 255) {
          bad.add(`반투명 픽셀(alpha=${a})`);
          continue;
        }
        const c = `#${[png.data[i], png.data[i + 1], png.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        if (!palette.has(c)) bad.add(`팔레트 밖 색 ${c}`);
      }
      expect([...bad], e.key).toEqual([]);
    }
  });
});
