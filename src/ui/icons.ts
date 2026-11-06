import type Phaser from 'phaser';
import { h } from './dom';

/** Phaser 텍스처의 한 프레임을 DOM <img>로 쓰기 위한 data URL로 바꿔요. */
let textures: Phaser.Textures.TextureManager | null = null;
const cache = new Map<string, string>();

export function initIcons(manager: Phaser.Textures.TextureManager): void {
  textures = manager;
  cache.clear();
}

export function icon(key: string, frame = 0): string {
  const id = `${key}#${frame}`;
  const hit = cache.get(id);
  if (hit) return hit;
  if (!textures?.exists(key)) return '';
  const url = textures.getBase64(key, frame);
  cache.set(id, url);
  return url;
}

/** 여러 레이어(캐릭터 + 모자 + 도구)를 한 장으로 합쳐요. */
export function composite(layers: { key: string; frame?: number }[]): string {
  const id = layers.map((l) => `${l.key}#${l.frame ?? 0}`).join('+');
  const hit = cache.get(id);
  if (hit || !textures) return hit ?? '';
  const manager = textures;
  const frames = layers.filter((l) => manager.exists(l.key)).map((l) => manager.getFrame(l.key, l.frame ?? 0)).filter((f): f is Phaser.Textures.Frame => !!f);
  if (!frames.length) return '';
  // 레이어마다 밀도가 다를 수 있어요(고해상도 몸 + 옛 모자). 가장 큰 그림 크기에 맞춰 늘려 그려요.
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(...frames.map((f) => f.cutWidth));
  canvas.height = Math.max(...frames.map((f) => f.cutHeight));
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.imageSmoothingEnabled = false;
  for (const frame of frames) {
    const src = frame.source.image as CanvasImageSource;
    ctx?.drawImage(src, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, canvas.width, canvas.height);
  }
  const url = canvas.toDataURL();
  cache.set(id, url);
  return url;
}

/** 픽셀이 뭉개지지 않는 <img> */
export function pxImg(src: string, size: number, alt = '', extraClass = ''): HTMLImageElement {
  return h('img', { class: `px ${extraClass}`.trim(), src, alt, width: size, height: size, draggable: 'false' });
}
