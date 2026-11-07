import type Phaser from 'phaser';
import { ASSET_BY_KEY } from './assets';
import { densityOf } from './density';

/**
 * 발밑 그림자. 고해상도(2배) 그림에는 그림자를 그리지 않기로 했어요(docs/asset-spec.md).
 * 게임이 바닥에 반투명 타원을 깔아요. 옛 1배 그림은 그림 안에 그림자가 있어서 건너뛰어요.
 */
export const SHADOW_ALPHA = 0.28;
/** 바닥 타일(-100000 + y)보다 위, 길 안내 발자국(-50000 + y)보다 아래 */
export const SHADOW_DEPTH = -60000;
const SHADOW_COLOR = '#293044';

/**
 * 소품 그림자 너비(논리 픽셀). 집·문·울타리·분수·등대·책장·거울처럼 바닥이 넓은 건물·가구는
 * 그림 바닥이 땅에 닿아서 두지 않아요. 1~8장 소품은 C12 진행 기록의 그림자 표를 따라요.
 */
const PROP_SHADOW: Record<string, number> = {
  // 마을(C11)
  'prop-tree': 20,
  'prop-pine': 16,
  'prop-bush': 22,
  'prop-lamp': 8,
  'prop-sign': 8,
  'prop-chest': 16,
  'prop-booth': 26,
  // 1장 숲
  'prop-rock': 20,
  'prop-stump': 12,
  'prop-mushroom': 12,
  // 2장 동굴
  'prop-crystal': 12,
  'prop-stalagmite': 10,
  // 3장 사막
  'prop-cactus': 10,
  'prop-signal': 8,
  // 4장 항구
  'prop-buoy': 10,
  // 5장 연구소
  'prop-jar': 10,
  // 6장 천문대
  'prop-telescope': 18,
  'prop-starlamp': 8,
  // 7장 공방
  'prop-easel': 18,
  // 8장 성
  'prop-banner': 8,
  // 마을 공방(C13). 기계·작업대·상자·방석은 바닥이 넓어서, 인형은 방석에 앉아서 그림자를 두지 않아요.
  'prop-plant': 10,
  'prop-floorlamp': 8,
};

/** 그림자 크기(논리 픽셀). 그림자가 필요 없는 그림이면 null이에요. */
export function shadowSize(key: string): { w: number; h: number } | null {
  if (densityOf(key) < 2) return null;
  const spec = ASSET_BY_KEY.get(key);
  if (!spec) return null;
  let w = 0;
  if (spec.kind === 'char') w = Math.round(spec.w * 0.75);
  else if (spec.kind === 'mob') w = Math.round(spec.w * 0.7);
  else if (spec.kind === 'prop') w = PROP_SHADOW[key] ?? 0;
  if (w <= 0) return null;
  return { w, h: Math.max(3, Math.round(w / 3)) };
}

/** 픽셀 그림 타원(2배 밀도). 가장자리가 반투명하게 번지지 않게 줄마다 칠해요. */
function shadowTexture(scene: Phaser.Scene, w: number, h: number): string {
  const key = `shadow-${w}x${h}`;
  if (scene.textures.exists(key)) return key;
  const W = w * 2;
  const H = h * 2;
  const tex = scene.textures.createCanvas(key, W, H);
  if (!tex) return key;
  const ctx = tex.getContext();
  ctx.fillStyle = SHADOW_COLOR;
  for (let y = 0; y < H; y++) {
    const dy = (y + 0.5 - H / 2) / (H / 2);
    const half = Math.round((W / 2) * Math.sqrt(Math.max(0, 1 - dy * dy)));
    if (half > 0) ctx.fillRect(W / 2 - half, y, half * 2, 1);
  }
  tex.refresh();
  return key;
}

/** 발 기준점(x, y)에 그림자를 놓아요. 그림자가 필요 없는 그림이면 null이에요. */
export function addShadow(scene: Phaser.Scene, key: string, x: number, y: number): Phaser.GameObjects.Image | null {
  const size = shadowSize(key);
  if (!size) return null;
  return scene.add
    .image(x, y, shadowTexture(scene, size.w, size.h))
    .setScale(0.5)
    .setAlpha(SHADOW_ALPHA)
    .setDepth(SHADOW_DEPTH + y);
}
