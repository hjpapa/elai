import type Phaser from 'phaser';
import { densityOf } from '../game/density';

/**
 * 화면 테두리 입히기. ui-* 그림(2배, 크림색 종이 + 남색 테두리 + 금색 모서리)을 CSS border-image로 써요.
 * 지금 창과 단추는 어두운 색이라 종이색만 바꾼 판을 만들어서 글자 색은 그대로 두고 테두리 모양만 바꿔요.
 * 고해상도 테두리 그림이 없으면(임시 그림) 예전 모양 그대로예요.
 */

/** 원본 그림의 종이 색(공용 팔레트): & 종이, ? 위쪽 밝은 줄, * 아래쪽 그늘 줄, - 단추 아랫단 */
const PAPER = { fill: '#f8e9bd', light: '#faf5e8', shade: '#dcc69a', lip: '#725c45' };

interface Paper {
  fill: string;
  light: string;
  shade: string;
  lip?: string;
}

/** 바꿀 색. 키는 CSS 변수 이름이에요. */
const DARK_PANEL: Paper = { fill: '#262c3b', light: '#333b50', shade: '#1e2330' };
const ME_DIALOG: Paper = { fill: '#e9f1ff', light: '#f7faff', shade: '#c9d6ee' };
const BUTTONS: Record<string, Paper> = {
  '--skin-btn': { fill: '#3b4560', light: '#4c5774', shade: '#2f3750', lip: '#222837' },
  '--skin-btn-primary': { fill: '#3f9a5a', light: '#56b571', shade: '#327c48', lip: '#21533a' },
  '--skin-btn-accent': { fill: '#c99a2e', light: '#e0b448', shade: '#a77f22', lip: '#6e5317' },
  '--skin-btn-blue': { fill: '#3f6fc2', light: '#5a8ddf', shade: '#3159a0', lip: '#223f73' },
};

type Rgb = [number, number, number];
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const hexOf = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/** 그림 한 프레임을 캔버스에 옮겨 그리고, 종이 색을 바꿔 data URL로 돌려줘요. */
function framePng(textures: Phaser.Textures.TextureManager, key: string, frame: number, paper?: Paper): string | null {
  if (!textures.exists(key)) return null;
  const f = textures.getFrame(key, frame);
  if (!f) return null;
  const canvas = document.createElement('canvas');
  canvas.width = f.cutWidth;
  canvas.height = f.cutHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(f.source.image as CanvasImageSource, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
  if (paper) {
    const swap = new Map<string, Rgb>([
      [PAPER.fill, rgb(paper.fill)],
      [PAPER.light, rgb(paper.light)],
      [PAPER.shade, rgb(paper.shade)],
      ...(paper.lip ? ([[PAPER.lip, rgb(paper.lip)]] as [string, Rgb][]) : []),
    ]);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const to = swap.get(hexOf(d[i], d[i + 1], d[i + 2]));
      if (to) [d[i], d[i + 1], d[i + 2]] = to;
    }
    ctx.putImageData(img, 0, 0);
  }
  return canvas.toDataURL();
}

/** 그림 한 픽셀이 기기 픽셀 정수 개가 되는 CSS 길이(화면 배율 150%면 2/1.5px). */
function updateSkinPx(): void {
  const dpr = window.devicePixelRatio || 1;
  document.documentElement.style.setProperty('--skin-px', `${Math.max(1, Math.round(dpr)) / dpr}px`);
}

export function applySkin(textures: Phaser.Textures.TextureManager): boolean {
  if (densityOf('ui-panel') < 2 || densityOf('ui-button') < 2) return false;
  const root = document.documentElement;
  const vars: Record<string, string | null> = {
    '--skin-panel': framePng(textures, 'ui-panel', 0, DARK_PANEL),
    '--skin-dialog': framePng(textures, 'ui-bubble', 0),
    '--skin-dialog-me': framePng(textures, 'ui-bubble', 0, ME_DIALOG),
    '--skin-stick': framePng(textures, 'ui-stick', 0),
    '--skin-knob': framePng(textures, 'ui-stick', 1),
  };
  for (const [name, paper] of Object.entries(BUTTONS)) vars[name] = framePng(textures, 'ui-button', 0, paper);
  if (Object.values(vars).some((v) => !v)) return false;
  for (const [name, url] of Object.entries(vars)) root.style.setProperty(name, `url("${url}")`);
  updateSkinPx();
  window.addEventListener('resize', updateSkinPx);
  root.classList.add('skinned');
  return true;
}
