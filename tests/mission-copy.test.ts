import { expect, it } from 'vitest';
import { allMissions } from '../src/data/chapters';

it('미션의 소개·힌트·정리는 각 활동에 맞춰 달라요', () => {
  for (const key of ['intro','hint','explain'] as const) {
    const seen = new Map<string,string>();
    for (const { mission } of allMissions()) {
      const text = mission.data && Reflect.get(mission.data, key);
      if (typeof text !== 'string' || !text) continue;
      expect(seen.get(text), mission.id + ' ' + key).toBeUndefined();
      seen.set(text, mission.id);
    }
  }
});
