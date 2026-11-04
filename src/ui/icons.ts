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
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  for (const l of layers) {
    if (!textures.exists(l.key)) continue;
    const frame = textures.getFrame(l.key, l.frame ?? 0);
    if (!frame) continue;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = frame.cutWidth;
      canvas.height = frame.cutHeight;
      ctx = canvas.getContext('2d');
    }
    const src = frame.source.image as CanvasImageSource;
    ctx?.drawImage(src, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
  }
  const url = canvas?.toDataURL() ?? '';
  cache.set(id, url);
  return url;
}

/** 픽셀이 뭉개지지 않는 <img> */
export function pxImg(src: string, size: number, alt = '', extraClass = ''): HTMLImageElement {
  return h('img', { class: `px ${extraClass}`.trim(), src, alt, width: size, height: size, draggable: 'false' });
}
