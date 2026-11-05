/**
 * 효과음 — Codex 담당(C2). 지금은 WebAudio로 짧은 소리만 내요.
 * 바깥에서는 playSfx(name)과 setSoundEnabled(on)만 써요(시그니처는 유지).
 */
import type { SfxName } from '../missions/core/types';

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

/** 배경 음악 분위기. 실제 음악은 Codex C2에서 만들어요(지금은 자리만 있어요). */
export type MusicTheme = 'title' | 'village' | 'forest' | 'dungeon' | 'battle';
let music: MusicTheme | null = null;

export function playMusic(theme: MusicTheme | null): void {
  music = theme;
}

export function currentMusic(): MusicTheme | null {
  return music;
}

const TONES: Record<SfxName, { f: number; d: number; type: OscillatorType }> = {
  click: { f: 660, d: 0.05, type: 'square' },
  step: { f: 220, d: 0.03, type: 'triangle' },
  success: { f: 880, d: 0.25, type: 'triangle' },
  fail: { f: 160, d: 0.25, type: 'sawtooth' },
  hit: { f: 300, d: 0.08, type: 'square' },
  guard: { f: 520, d: 0.1, type: 'triangle' },
  heal: { f: 740, d: 0.2, type: 'sine' },
  purify: { f: 990, d: 0.4, type: 'sine' },
  levelup: { f: 1046, d: 0.5, type: 'triangle' },
  item: { f: 784, d: 0.15, type: 'square' },
  open: { f: 440, d: 0.12, type: 'triangle' },
};

export function playSfx(name: SfxName): void {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const t = TONES[name];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = t.type;
    osc.frequency.value = t.f;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t.d);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + t.d);
  } catch {
    // 소리를 낼 수 없는 환경(자동 재생 제한 등)에서는 조용히 넘어가요.
  }
}
