/** 아이소 좌표 변환. 타일은 32×16(2:1) 마름모예요. */
export const TILE_W = 32;
export const TILE_H = 16;

/** 땅 높이 반 단의 화면 높이(논리 픽셀). 한 단 = 블록 옆면 8px */
export const HALF_LEVEL_PX = 4;

/** 높이(반 단 단위) → 화면에서 올라가는 픽셀 */
export function liftPx(h: number): number {
  return h * HALF_LEVEL_PX;
}

/** 칸 좌표 → 화면 좌표(칸 마름모의 가운데) */
export function isoToScreen(x: number, y: number): { x: number; y: number } {
  return { x: (x - y) * (TILE_W / 2), y: (x + y) * (TILE_H / 2) };
}

/** 화면 좌표 → 칸 좌표(가장 가까운 칸) */
export function screenToIso(sx: number, sy: number): { x: number; y: number } {
  const fx = sx / (TILE_W / 2);
  const fy = sy / (TILE_H / 2);
  return { x: Math.round((fy + fx) / 2), y: Math.round((fy - fx) / 2) };
}

/** 칸 이동 방향 → 화면 방향. 캐릭터가 앞(아래)/뒤(위)를 볼지, 좌우를 뒤집을지 정해요. */
export function facingOf(dx: number, dy: number, prev: { back: boolean; flip: boolean }): { back: boolean; flip: boolean } {
  const sx = dx - dy;
  const sy = dx + dy;
  const back = sy < 0 ? true : sy > 0 ? false : prev.back;
  const flip = sx < 0 ? true : sx > 0 ? false : prev.flip;
  return { back, flip };
}
