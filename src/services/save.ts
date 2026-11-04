import type { SaveData } from '../data/schema';
import type { GameState } from '../game/rpg/state';

const BASE_KEY = 'elai-save-v1';
/** 학급 학생이면 학생마다 따로 저장해요(한 기기를 여러 학생이 같이 쓰는 교실을 위해). */
let profile: string | null = null;

const keyOf = () => (profile ? `${BASE_KEY}:${profile}` : BASE_KEY);

export function setSaveProfile(id: string | null): void {
  profile = id;
}

/** 이 기기에 저장된 게임(없거나 읽을 수 없으면 null) */
export function loadLocal(): SaveData | null {
  try {
    const raw = localStorage.getItem(keyOf());
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data?.version === 1 ? data : null;
  } catch {
    return null;
  }
}

export function saveLocal(data: SaveData): void {
  try {
    localStorage.setItem(keyOf(), JSON.stringify(data));
  } catch {
    // 저장 공간이 막힌 환경(시크릿 창 등)에서는 저장 없이 계속해요.
  }
}

/** 두 저장 중 더 최근 것 */
export function newer(a: SaveData | null, b: SaveData | null): SaveData | null {
  if (!a) return b;
  if (!b) return a;
  return a.updatedAt >= b.updatedAt ? a : b;
}

type Remote = (data: SaveData) => Promise<void>;
let timer: ReturnType<typeof setTimeout> | null = null;
let state: GameState | null = null;
let remote: Remote | null = null;

/** 바뀐 뒤 잠깐 기다렸다가 저장해요(이 기기 + 연결되어 있으면 학급 서버). */
export function requestSave(): void {
  if (!state) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushSave, 800);
}

export function flushSave(): void {
  if (!state) return;
  if (timer) clearTimeout(timer);
  timer = null;
  saveLocal(state.data);
  void remote?.(state.data).catch(() => undefined);
}

export function initAutosave(s: GameState, remoteSave?: Remote): void {
  state = s;
  remote = remoteSave ?? null;
  s.on((e) => {
    if (e.type === 'change') requestSave();
  });
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });
}
