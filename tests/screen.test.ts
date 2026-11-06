import { describe, expect, it } from 'vitest';
import { BATTLE_ZOOM, TITLE_ZOOM, WORLD_ZOOM, canvasSize, crispZoom, pixelRatio } from '../src/game/screen';

/** 창(CSS 픽셀)과 화면 배율로 탐험 맵 배율을 구해요. */
const world = (cssW: number, cssH: number, dpr: number) => {
  const r = pixelRatio(cssW, cssH, dpr);
  const { width, height } = canvasSize(cssW, cssH, r);
  return crispZoom(width, height, r, WORLD_ZOOM);
};

describe('화면 배율', () => {
  it('캔버스는 기기 픽셀 크기이고 아주 작은 창도 최소 크기를 지켜요', () => {
    expect(canvasSize(1536, 864, 1.25)).toEqual({ width: 1920, height: 1080 });
    expect(canvasSize(100, 50, 2)).toEqual({ width: 640, height: 480 });
  });

  it('화면 배율은 1~3이고 캔버스가 4096px을 넘지 않게 줄여요', () => {
    expect(pixelRatio(1366, 768, 1)).toBe(1);
    expect(pixelRatio(1536, 864, 1.25)).toBe(1.25);
    expect(pixelRatio(400, 800, 4)).toBe(3);
    expect(pixelRatio(2560, 1440, 2)).toBe(1.6);
    expect(pixelRatio(800, 600, 0.5)).toBe(1);
  });

  it('카메라 배율은 언제나 짝수라서 2배 그림 한 픽셀이 화면 픽셀 정수 개가 돼요', () => {
    for (const [w, h] of [[1366, 768], [1536, 864], [1280, 720], [1920, 1080], [390, 844], [1024, 768], [2560, 1440], [800, 600]]) {
      for (const dpr of [1, 1.25, 1.5, 2, 3]) {
        const r = pixelRatio(w, h, dpr);
        const size = canvasSize(w, h, r);
        for (const rule of [WORLD_ZOOM, BATTLE_ZOOM, TITLE_ZOOM]) {
          const z = crispZoom(size.width, size.height, r, rule);
          expect(z % 2).toBe(0);
          expect(z).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('탐험 맵: 흔한 화면에서 고르는 배율', () => {
    expect(world(1366, 768, 1)).toBe(2); // 크롬북: 넓게 보여요
    expect(world(1920, 1080, 1)).toBe(4);
    expect(world(1536, 864, 1.25)).toBe(4); // 1080p 노트북 125%
    expect(world(1280, 720, 1.5)).toBe(4); // 1080p 노트북 150%
    expect(world(1440, 900, 2)).toBe(6); // 레티나: 예전과 같은 CSS 3배
    expect(world(390, 844, 3)).toBe(6); // 휴대폰: 예전과 같은 CSS 2배
    expect(world(375, 667, 2)).toBe(4);
  });

  it('예전 최소 크기(CSS 2배)보다 많이 작아지지 않아요', () => {
    // 좁은 창 150%: 2(CSS 1.33배)보다 4(CSS 2.67배)가 예전 2배에 가까워요. 첫 화면 섬이 상자 뒤에 숨지 않아요.
    expect(crispZoom(894, 1901, 1.5, TITLE_ZOOM)).toBe(4);
    expect(world(1024, 600, 1.5)).toBe(4);
    // 125%는 2(CSS 1.6배)가 예전 2배에 더 가까워요.
    expect(world(1024, 640, 1.25)).toBe(2);
  });

  it('보여야 하는 넓이가 들어가지 않으면 큰 배율을 쓰지 않아요', () => {
    // CSS 기준 3배(=4.5)에 가까운 짝수는 4와 6. 6이면 320×180만 보여서 4를 골라요.
    expect(crispZoom(1920, 1080, 1.5, WORLD_ZOOM)).toBe(4);
    // 전투 무대는 10%까지 모자라도 괜찮아서 크롬북에서 4배로 크게 보여요.
    expect(crispZoom(1366, 768 - 340, 1, BATTLE_ZOOM)).toBe(4);
  });
});
