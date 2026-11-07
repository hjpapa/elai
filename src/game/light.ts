import type Phaser from 'phaser';
import { ASSET_BY_KEY } from './assets';
import { SHADOW_DEPTH } from './shadow';

/** 빛 색: warm은 등불(금색), cool은 수정·이동 문(청록). 둘 다 팔레트 색이에요. */
type Glow = 'warm' | 'cool';

/**
 * 불빛 있는 소품 위에 빛 무리를, 발밑에는 빛 웅덩이를 더해요(더하기 섞기).
 * - at: 불빛 높이(발 기준점에서 그림 높이에 대한 비율)
 * - r: 빛 반지름(논리 픽셀)
 * - frames: 빛이 켜지는 프레임(없으면 모든 프레임). 예: 꺼진 등대(0)·켜진 등대(1)
 * - glow: 빛 색(없으면 warm)
 * 값은 C12 진행 기록(docs/tasks/codex-12-progress.md)의 불빛 표를 발 기준점으로 바꾼 거예요.
 */
type Light = { at: number; r: number; frames?: readonly number[]; glow?: Glow };

const LIGHTS: Record<string, Light> = {
  'prop-lamp': { at: 0.8, r: 10 },
  'prop-starlamp': { at: 0.6, r: 10 },
  'prop-lighthouse': { at: 0.63, r: 14, frames: [1] },
  'prop-buoy': { at: 0.71, r: 4 },
  'prop-crystal': { at: 0.62, r: 8, frames: [1], glow: 'cool' },
  'prop-portal': { at: 0.39, r: 12, glow: 'cool' },
  // C13 마을 공방: 스탠드 전등갓, 인형뽑기 기계 위 불빛, 열린 공방 문에서 새어 나오는 빛
  'prop-floorlamp': { at: 0.8, r: 10 },
  'prop-claw-machine': { at: 0.82, r: 12, glow: 'cool' },
  'prop-workshop': { at: 0.28, r: 12, frames: [1] },
  // C14 마을 택배소: 열린 문 불빛(공방과 같아요), 분류 기계 위 불빛
  'prop-parcel-office': { at: 0.28, r: 12, frames: [1] },
  'prop-sorter': { at: 0.8, r: 10, glow: 'cool' },
};

const GLOW: Record<Glow, readonly number[]> = {
  warm: [255, 229, 154],
  cool: [130, 204, 224],
};

/** key 그림의 frame 프레임에 켜지는 빛. 빛이 없으면 null이에요. */
export function lightOf(key: string, frame = 0): Light | null {
  const light = LIGHTS[key];
  if (!light || (light.frames && !light.frames.includes(frame))) return null;
  return light;
}

/** 줄마다 칠하는 픽셀 그림 원(2배 밀도). 세 겹으로 칠해서 가운데가 진해요. */
function glowTexture(scene: Phaser.Scene, rw: number, rh: number, name: string, glow: Glow): string {
  const key = `glow-${glow}-${name}-${rw}x${rh}`;
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
    ctx.fillStyle = `rgba(${GLOW[glow].join(',')},${alpha})`;
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

/** 발 기준점(x, y)에 서 있는 소품 key(frame 프레임)의 빛. 빛이 없으면 빈 배열이에요. */
export function addLight(scene: Phaser.Scene, key: string, x: number, y: number, depth: number, frame = 0): Phaser.GameObjects.Image[] {
  const light = lightOf(key, frame);
  const spec = ASSET_BY_KEY.get(key);
  if (!light || !spec) return [];
  const glow = light.glow ?? 'warm';
  const head = scene.add
    .image(x, y - spec.h * light.at, glowTexture(scene, light.r, light.r, 'head', glow))
    .setScale(0.5)
    .setBlendMode('ADD')
    .setDepth(depth + 1);
  const pool = scene.add
    .image(x, y, glowTexture(scene, Math.round(light.r * 1.2), Math.round(light.r * 0.5), 'pool', glow))
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
