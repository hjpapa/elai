import { readFileSync } from 'node:fs';
import { root } from './c12-common.mjs';
import { FRUITS } from '../../src/data/minigames/fruit.ts';
import { fruitPixels } from '../../src/minigames/fruit/fruitArt.ts';

const { colors } = JSON.parse(readFileSync(root + 'assets-src/palette.json', 'utf8'));
const symbols = new Map(Object.entries(colors).map(([symbol, color]) => [color, symbol]));

// Use the same silhouettes, highlight colors and melon stripes as the lesson cards.
export function fruit(grid, id, x, y, size = 16) {
  const pixels = fruitPixels(FRUITS[id]);
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const color = pixels[Math.floor(dy * 16 / size)][Math.floor(dx * 16 / size)];
      if (color) grid.set(x + dx, y + dy, symbols.get(color));
    }
  }
}
