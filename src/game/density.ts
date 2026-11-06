import type Phaser from 'phaser';

/**
 * 그림 키마다 픽셀 밀도. 1은 목록(assets.ts) 크기 그대로, 2는 가로·세로 2배로 그린 고해상도 그림이에요.
 * 게임은 밀도로 나눈 배율로 그려서, 옛 그림과 새 그림이 같은 크기로 보여요(장마다 차례로 바꿀 수 있게).
 */
const densities = new Map<string, number>();

export function setDensity(key: string, density: number): void {
  if (density > 1) densities.set(key, density);
  else densities.delete(key);
}

export function densityOf(key: string): number {
  return densities.get(key) ?? 1;
}

/** 목록 크기로 보이게 하는 기본 배율 */
export function artScale(key: string): number {
  return 1 / densityOf(key);
}

/** 그림 오브젝트를 목록 크기로 맞춰요. 더 키우거나 줄이려면 times를 곱해요. */
export function fitArt<T extends Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>(obj: T, times = 1): T {
  obj.setScale(artScale(obj.texture.key) * times);
  return obj;
}
