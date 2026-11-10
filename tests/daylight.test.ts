import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import { DAY_CYCLE_MS, NO_DAYLIGHT, daylightAt, hasDayCycle } from '../src/game/daylight';
import { lightOf } from '../src/game/light';
import { freshSave } from '../src/game/rpg/state';

const min = (m: number) => m * 60_000;
/** 곱하기 색 판을 얹었을 때 채널마다 남는 밝기(1 = 그대로) */
const keep = (tint: number, alpha: number) => [16, 8, 0].map((s) => 1 - alpha * (1 - ((tint >> s) & 0xff) / 255));

describe('시간대 빛', () => {
  it('게임을 열면 낮에서 시작하고, 낮에는 화면을 바꾸지 않아요', () => {
    expect(daylightAt(0)).toEqual(NO_DAYLIGHT);
    expect(daylightAt(min(3))).toMatchObject({ phase: 'day', alpha: 0, night: 0 });
  });

  it('한 바퀴 10분 동안 낮 → 노을 → 밤 → 새벽 → 낮으로 바뀌어요', () => {
    expect(DAY_CYCLE_MS).toBe(min(10));
    expect(daylightAt(min(5.25)).phase).toBe('sunset');
    expect(daylightAt(min(7))).toMatchObject({ phase: 'night', night: 1 });
    expect(daylightAt(min(9.25)).phase).toBe('dawn');
    expect(daylightAt(min(10))).toEqual(daylightAt(0));
    expect(daylightAt(min(17))).toEqual(daylightAt(min(7)));
  });

  it('부드럽게 이어지고, 밤에도 길과 글자가 보일 만큼만 어두워요', () => {
    let prev = daylightAt(0);
    for (let s = 1; s <= 600; s++) {
      const d = daylightAt(s * 1000);
      expect(Math.abs(d.alpha - prev.alpha), `${s}초`).toBeLessThan(0.02);
      expect(Math.abs(d.night - prev.night), `${s}초`).toBeLessThan(0.03);
      // 어느 채널도 70%보다 어두워지지 않아요.
      for (const k of keep(d.tint, d.alpha)) expect(k, `${s}초`).toBeGreaterThanOrEqual(0.7);
      prev = d;
    }
  });

  it('바깥 맵에만 시간이 흘러요(동굴·건물 안·연구소·천문대·공방·성은 그대로)', () => {
    const cycling = Object.values(MAPS).filter((m) => hasDayCycle(m.theme)).map((m) => m.id).sort();
    expect(cycling).toEqual(['desert', 'desertmaze', 'forest', 'harbor', 'lighthouse', 'maze', 'village']);
    for (const id of ['cave', 'cavedeep', 'workroom', 'parcel', 'lab', 'observatory', 'workshop', 'castle']) expect(hasDayCycle(MAPS[id].theme), id).toBe(false);
  });

  it('새 저장은 시간대 빛이 켜진 상태예요(메뉴에서 끌 수 있어요)', () => {
    expect(freshSave('별빛').settings.timeLight).toBeUndefined();
  });

  it('건물 문 불빛은 문이 열린 프레임(1)에서만 켜져요', () => {
    for (const key of ['prop-workshop', 'prop-parcel-office']) {
      expect(lightOf(key, 0), key).toBeNull();
      expect(lightOf(key, 1), key).not.toBeNull();
    }
  });
});
