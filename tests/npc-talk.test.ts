import { expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';

it('각 장 인물은 서로 다른 두 줄 이내의 이야기를 번갈아 들려줘요', () => {
  for (const map of Object.values(MAPS).filter(m => m.chapter && /^ch[1-8]$/.test(m.chapter))) {
    const seen = new Set<string>();
    for (const npc of map.objects) {
      if (npc.type !== 'npc') continue;
      const lines = npc.talk ?? [];
      expect(lines.length, map.id + '/' + npc.id).toBeGreaterThanOrEqual(npc.id.endsWith('-fixed') ? 2 : 3);
      for (const text of lines) {
        expect(seen.has(text), text).toBe(false);
        expect(text.trim(), npc.id).toBeTruthy();
        expect(text.split('\n').length, text).toBeLessThanOrEqual(2);
        seen.add(text);
      }
    }
  }
});
