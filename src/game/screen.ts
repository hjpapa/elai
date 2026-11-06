import type Phaser from 'phaser';

/**
 * 화면 배율(Windows 125%·150%, 레티나 화면)에 맞춰 캔버스를 기기 픽셀 크기로 만들어요.
 * CSS 픽셀 크기의 캔버스를 브라우저가 1.25배로 늘리면 그림 픽셀이 들쭉날쭉해지기 때문이에요.
 */
const MAX_RATIO = 3;
const MAX_CANVAS = 4096;

/** 기기 픽셀 비율. 너무 크면 느려지고, 캔버스가 4096px을 넘지 않게 줄여요. */
export function pixelRatio(cssW = window.innerWidth, cssH = window.innerHeight, dpr = window.devicePixelRatio || 1): number {
  const w = Math.max(320, cssW);
  const h = Math.max(240, cssH);
  return Math.max(1, Math.min(MAX_RATIO, dpr, MAX_CANVAS / w, MAX_CANVAS / h));
}

/** 창 크기(CSS 픽셀) → 캔버스 크기(기기 픽셀). 창이 아주 작아도 WebGL이 만들어지게 최소 크기를 둬요. */
export function canvasSize(cssW: number, cssH: number, ratio: number): { width: number; height: number } {
  return { width: Math.round(Math.max(320, cssW) * ratio), height: Math.round(Math.max(240, cssH) * ratio) };
}

let ratio = typeof window === 'undefined' ? 1 : pixelRatio();

/** 지금 캔버스 픽셀 ÷ CSS 픽셀. DOM 위치(CSS 픽셀)와 캔버스 좌표를 바꿀 때 써요. */
export function canvasRatio(): number {
  return ratio;
}

/** 창 크기나 화면 배율이 바뀌면 캔버스를 다시 맞춰요. 장면들은 RESIZE 이벤트로 배율을 다시 골라요. */
export function fitCanvas(game: Phaser.Game): void {
  ratio = pixelRatio();
  const { width, height } = canvasSize(window.innerWidth, window.innerHeight, ratio);
  const scale = game.scale;
  scale.zoom = 1 / ratio;
  if (scale.width !== width || scale.height !== height) scale.resize(width, height);
  // Phaser는 크기가 같으면 CSS 크기를 다시 쓰지 않아요. 배율만 바뀐 경우(브라우저 확대)를 위해 직접 맞춰요.
  game.canvas.style.width = `${width / ratio}px`;
  game.canvas.style.height = `${height / ratio}px`;
  scale.refresh();
}

export interface ZoomRule {
  /** 화면에 이만큼(논리 픽셀)은 보여야 해요. */
  viewW: number;
  viewH: number;
  /** 예전 규칙의 CSS 픽셀 기준 배율 범위 */
  minCss: number;
  maxCss: number;
  /** 보이는 넓이가 이 비율만큼 모자라도 큰 배율을 골라요(전투처럼 작은 무대). */
  slack?: number;
}

/**
 * 카메라 배율(캔버스 픽셀 기준)을 골라요. 2배 그림 한 픽셀이 캔버스 픽셀 정수 개가 되도록 짝수만 써요.
 * 예전 규칙(CSS 픽셀 기준 정수 배율)에 화면 배율을 곱한 값에 가장 가까운 짝수를 고르되,
 * 더 큰 짝수는 보여야 하는 넓이가 들어갈 때만 써요.
 */
export function crispZoom(width: number, height: number, ratioNow: number, rule: ZoomRule): number {
  const slack = rule.slack ?? 0;
  const fit = Math.min(width / rule.viewW, height / rule.viewH);
  const css = Math.min(rule.maxCss, Math.max(rule.minCss, Math.floor(fit / ratioNow + 1e-6)));
  const raw = css * ratioNow;
  const lo = Math.max(2, 2 * Math.floor(raw / 2 + 1e-6));
  const hi = Math.max(lo, 2 * Math.ceil(raw / 2 - 1e-6));
  if (hi === lo) return lo;
  const nearer = hi / raw < raw / lo ? hi : lo;
  // 작은 짝수가 예전 최소 크기(CSS minCss배)보다 작아지면, 넓이와 상관없이 가까운 쪽을 골라요(좁은 창·150% 화면).
  if (lo < rule.minCss * ratioNow - 1e-6) return nearer;
  const fits = width / hi >= rule.viewW * (1 - slack) && height / hi >= rule.viewH * (1 - slack);
  return fits ? nearer : lo;
}

/** 마을·숲 같은 탐험 맵 */
export const WORLD_ZOOM: ZoomRule = { viewW: 400, viewH: 240, minCss: 2, maxCss: 6 };
/** 전투 무대(위 막대와 아래 카드 패널 사이) */
export const BATTLE_ZOOM: ZoomRule = { viewW: 230, viewH: 110, minCss: 2, maxCss: 5, slack: 0.1 };
/** 첫 화면의 작은 섬 */
export const TITLE_ZOOM: ZoomRule = { viewW: 260, viewH: 200, minCss: 2, maxCss: 6, slack: 0.1 };
