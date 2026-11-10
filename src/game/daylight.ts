import type { MapDef } from '../data/schema';

/**
 * 시간대 빛(2.5D 2단계 남은 일). 바깥 맵이 한 바퀴 10분 동안 낮 → 노을 → 밤 → 새벽으로 천천히 바뀌어요.
 * 화면 전체에 곱하기(MULTIPLY) 색 판을 얹어 은은하게만 어둡게 해요(밤에도 길과 글자가 잘 보이게).
 * 밤에는 가로등·등대 같은 불빛을 그 판 위에 한 번 더 그려서 환하게 보여요(light.ts의 밤 불빛).
 * 메뉴에서 끌 수 있어요(settings.timeLight === false). 화면 글자·창(DOM)은 바뀌지 않아요.
 */
export type DayPhase = 'day' | 'sunset' | 'night' | 'dawn';

export interface Daylight {
  phase: DayPhase;
  /** 곱하기 색(0xRRGGBB) */
  tint: number;
  /** 색 판의 세기(0이면 아무 변화 없음) */
  alpha: number;
  /** 밤 불빛 세기(0~1) */
  night: number;
}

/** 한 바퀴 길이 */
export const DAY_CYCLE_MS = 10 * 60_000;
/** 시간대 빛 판의 깊이: 땅·소품·캐릭터 위, NPC 느낌표·말풍선 표시(900000) 아래 */
export const DAYLIGHT_DEPTH = 850000;
/** 아무 변화 없는 빛(낮, 꺼짐, 시간이 흐르지 않는 맵) */
export const NO_DAYLIGHT: Daylight = { phase: 'day', tint: 0xffffff, alpha: 0, night: 0 };

/** 바깥 맵만 시간이 흘러요. 동굴·건물 안·연구소·천문대·공방·성은 그대로예요. */
const OUTDOOR: ReadonlySet<MapDef['theme']> = new Set<MapDef['theme']>(['village', 'forest', 'dungeon', 'desert', 'harbor']);

export function hasDayCycle(theme: MapDef['theme']): boolean {
  return OUTDOOR.has(theme);
}

interface Key {
  /** 바퀴 안의 시각(분) */
  at: number;
  phase: DayPhase;
  tint: number;
  alpha: number;
  night: number;
}

/** 낮 4분 30초 → 노을 → 밤(6~8분 30초) → 새벽 → 낮. 사이는 부드럽게 이어요. */
const KEYS: readonly Key[] = [
  { at: 0, phase: 'day', tint: 0xffffff, alpha: 0, night: 0 },
  { at: 4.5, phase: 'day', tint: 0xffffff, alpha: 0, night: 0 },
  { at: 5.25, phase: 'sunset', tint: 0xffb488, alpha: 0.3, night: 0.35 },
  { at: 6, phase: 'night', tint: 0x5a6aa6, alpha: 0.42, night: 1 },
  { at: 8.5, phase: 'night', tint: 0x5a6aa6, alpha: 0.42, night: 1 },
  { at: 9.25, phase: 'dawn', tint: 0xe2b4d0, alpha: 0.2, night: 0.3 },
  { at: 10, phase: 'day', tint: 0xffffff, alpha: 0, night: 0 },
];

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function lerpColor(a: number, b: number, k: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  return [16, 8, 0].reduce((out, s) => out | (Math.round(lerp(ch(a, s), ch(b, s), k)) << s), 0);
}

/** 바퀴가 시작된 뒤 ms가 지났을 때의 빛 */
export function daylightAt(ms: number): Daylight {
  const m = ((((ms % DAY_CYCLE_MS) + DAY_CYCLE_MS) % DAY_CYCLE_MS) / DAY_CYCLE_MS) * (DAY_CYCLE_MS / 60_000);
  let i = 0;
  while (i < KEYS.length - 2 && m >= KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = b.at > a.at ? Math.min(1, Math.max(0, (m - a.at) / (b.at - a.at))) : 0;
  return {
    phase: k < 0.5 ? a.phase : b.phase,
    tint: lerpColor(a.tint, b.tint, k),
    alpha: lerp(a.alpha, b.alpha, k),
    night: lerp(a.night, b.night, k),
  };
}

/** 게임을 연 때부터 바퀴를 세요(늘 낮에서 시작해요). 맵을 옮겨도 이어져요. */
const START = Date.now();

export function daylightNow(): Daylight {
  return daylightAt(Date.now() - START);
}
