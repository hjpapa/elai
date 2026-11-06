import type Phaser from 'phaser';
import { ASSET_BY_KEY } from './assets';
import { SHADOW_DEPTH } from './shadow';

/**
 * 등불 빛. 불빛이 있는 소품 위에 따뜻한 빛 무리를, 발밑에는 빛 웅덩이를 더해요(더하기 섞기).
 * at: 불빛 높이(그림 높이에 대한 비율, 아래에서부터), r: 빛 반지름(논리 픽셀)
 */
const LIGHTS: Record<string, { at: number; r: number }> = {
  'prop-lamp': { at: 0.8, r: 10 },
};

const GLOW = [255, 229, 154];

export function lightOf(key: string): { at: number; r: number } | null {
  return LIGHTS[key] ?? null;
}

/** 줄마다 칠하는 픽셀 그림 원(2배 밀도). 세 겹으로 칠해서 가운데가 진해요. */
function glowTexture(scene: Phaser.Scene, rw: number, rh: number, name: string): string {
  const key = `glow-${name}-${rw}x${rh}`;
  if (scene.textures.exists(key)) return key;
  const W = rw * 4;
  const H = rh * 4;
  const tex = scene.textures.createCanvas(key, W, H);
  if (!tex) return key;
  const ctx = tex.getContext();
  // 낮에도 은은하게: 겹친 가운데도 0.3 정도예요.
  for (const [scale, alpha] of [
    [1, 0.06],
    [0.66, 0.09],
    [0.36, 0.16],
  ] as const) {
    ctx.fillStyle = `rgba(${GLOW.join(',')},${alpha})`;
    const ry = (H / 2) * scale;
    for (let y = 0; y < H; y++) {
      const dy = (y + 0.5 - H / 2) / ry;
      if (Math.abs(dy) > 1) continue;
      const half = Math.round((W / 2) * scale * Math.sqrt(1 - dy * dy));
      if (half > 0) ctx.fillRect(W / 2 - half, y, half * 2, 1);
    }
  }
  tex.refresh();
  return key;
}

function calm(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 발 기준점(x, y)에 서 있는 소품 key의 빛. 빛이 없는 소품이면 빈 배열이에요. */
export function addLight(scene: Phaser.Scene, key: string, x: number, y: number, depth: number): Phaser.GameObjects.Image[] {
  const light = lightOf(key);
  const spec = ASSET_BY_KEY.get(key);
  if (!light || !spec) return [];
  const head = scene.add
    .image(x, y - spec.h * light.at, glowTexture(scene, light.r, light.r, 'head'))
    .setScale(0.5)
    .setBlendMode('ADD')
    .setDepth(depth + 1);
  const pool = scene.add
    .image(x, y, glowTexture(scene, Math.round(light.r * 1.2), Math.round(light.r * 0.5), 'pool'))
    .setScale(0.5)
    .setAlpha(0.7)
    .setBlendMode('ADD')
    .setDepth(SHADOW_DEPTH + y + 1);
  if (!calm()) {
    // 불꽃처럼 살짝 일렁여요. 등불마다 박자가 달라요.
    scene.tweens.add({ targets: head, alpha: 0.72, duration: 900 + Math.random() * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  return [head, pool];
}
