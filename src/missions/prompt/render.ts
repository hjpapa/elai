import type { PromptData } from '../../data/schema';
import { h } from '../../ui/dom';
import type { PromptChoice, PromptOutcome } from './evaluate';
import { composePromptImage } from './image';

/** 결과를 고른 모양(목록·문단·표·시)으로 그려요. */
export function renderOutput(o: PromptOutcome): HTMLElement {
  const box = h('div', {}, h('div', { class: 'opening' }, o.opening));
  if (o.render === 'list') box.append(h('ol', {}, ...o.lines.map((l) => h('li', {}, l))));
  else if (o.render === 'table') {
    box.append(h('table', {}, ...o.lines.map((l, i) => h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, l)))));
  } else if (o.render === 'poem') {
    box.append(h('div', { class: 'poem' }, ...o.lines.flatMap((l) => [h('p', {}, `♪ ${l} ♪`), h('p', {}, '랄라라 랄라라, 노래는 계속돼요 ♪')])));
  } else box.append(h('p', {}, o.lines.join(' ')));
  return box;
}

/** 그림 주문서: 고른 칸의 층을 합친 픽셀 그림 */
export function renderPromptImage(data: PromptData, choice: PromptChoice): HTMLElement {
  const pixels = composePromptImage(data, choice);
  if (!pixels) return h('p', {}, '그림 자료를 다시 살펴봐요.');
  const canvas = h('canvas', { width: pixels[0].length, height: pixels.length, role: 'img', 'aria-label': '선택한 주문서의 픽셀 그림', style: 'width:256px;max-width:100%;height:auto;image-rendering:pixelated' });
  const drawing = canvas.getContext('2d');
  if (drawing) pixels.forEach((row, y) => row.forEach((color, x) => { if (color) { drawing.fillStyle = color; drawing.fillRect(x, y, 1, 1); } }));
  return h('figure', { style: 'margin:8px 0' }, canvas, h('figcaption', {}, '그림 주문서 연습 결과'));
}
