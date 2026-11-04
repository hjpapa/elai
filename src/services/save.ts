import type { SaveData } from '../data/schema';
import type { GameState } from '../game/rpg/state';

const KEY = 'elai-save-v1';

/** 이 기기에 저장된 게임(없거나 읽을 수 없으면 null) */
export function loadLocal(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data?.version === 1 ? data : null;
  } catch {
    return null;
  }
}

export function saveLocal(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 저장 공간이 막힌 환경(시크릿 창 등)에서는 저장 없이 계속해요.
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
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
