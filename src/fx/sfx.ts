/** 절차적 효과음·칩튠. 소리 파일 없이 WebAudio만 사용해요. */
import type { SfxName } from '../missions/core/types';

export type MusicTheme = 'title' | 'village' | 'forest' | 'dungeon' | 'battle';
type Voice = { oscillator: OscillatorNode; gain: GainNode };
type Track = { bus: GainNode; voices: Set<Voice>; timer: number; next: number; step: number; theme: MusicTheme };
/** 메뉴의 소리 크기(작게·보통·크게) 기본값 */
export const DEFAULT_VOLUME = 0.75;
/** 배경 음악은 효과음보다 작게 깔려요. */
const MUSIC_LEVEL = 0.6;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let volume = DEFAULT_VOLUME;
let unlocked = false;
let music: MusicTheme | null = null;
let track: Track | null = null;
const tracks = new Set<Track>();
const effects = new Set<Voice>();

// 반 박자 단위 16음. -1은 쉼표예요. 각 곡은 4/4박자 두 마디로 돌아요.
const SONGS: Record<MusicTheme, { bpm: number; notes: number[]; bass: number[] }> = {
  title: { bpm: 84, notes: [72, -1, 76, 79, 81, -1, 79, 76, 74, -1, 76, 79, 76, 74, 72, -1], bass: [48, 53, 55, 48] },
  village: { bpm: 96, notes: [72, 76, 79, -1, 76, 74, 72, -1, 77, 81, 79, 76, 74, -1, 72, -1], bass: [48, 53, 55, 48] },
  forest: { bpm: 88, notes: [74, -1, 77, 81, 79, -1, 77, -1, 74, 77, 79, -1, 81, 77, 74, -1], bass: [50, 53, 55, 50] },
  dungeon: { bpm: 72, notes: [69, -1, -1, 72, 76, -1, 74, -1, 72, -1, 69, -1, 67, -1, 69, -1], bass: [45, 48, 43, 45] },
  battle: { bpm: 120, notes: [69, 72, 76, 72, 74, 77, 76, -1, 69, 72, 79, 76, 74, 72, 69, -1], bass: [45, 53, 55, 45] },
};
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

function note(bus: GainNode, voices: Set<Voice>, frequency: number, at: number, duration: number, volume: number, type: OscillatorType = 'triangle', end = frequency): void {
  if (!ctx || voices.size >= 32) return;
  const oscillator = ctx.createOscillator(), gain = ctx.createGain();
  const voice = { oscillator, gain };
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, end), at + duration);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + Math.min(0.012, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(bus);
  voices.add(voice);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices.delete(voice); };
  oscillator.start(at);
  oscillator.stop(at + duration + 0.015);
}

function stopVoices(voices: Set<Voice>): void {
  for (const voice of voices) {
    voice.oscillator.onended = null;
    try { voice.oscillator.stop(); } catch { /* 이미 끝난 소리도 안전하게 정리해요. */ }
    voice.oscillator.disconnect();
    voice.gain.disconnect();
  }
  voices.clear();
}

function retire(t: Track, immediate: boolean): void {
  window.clearInterval(t.timer);
  if (!ctx) return;
  const now = ctx.currentTime;
  t.bus.gain.cancelScheduledValues(now);
  t.bus.gain.setValueAtTime(t.bus.gain.value, now);
  if (immediate) {
    stopVoices(t.voices); t.bus.disconnect(); tracks.delete(t);
  } else {
    t.bus.gain.linearRampToValueAtTime(0, now + 0.18);
    window.setTimeout(() => { stopVoices(t.voices); t.bus.disconnect(); tracks.delete(t); }, 220);
  }
}

function syncMusic(): void {
  const canPlay = enabled && unlocked && ctx?.state === 'running' && !document.hidden;
  if (track && canPlay && track.theme === music) return;
  if (track) { retire(track, !canPlay); track = null; }
  if (!canPlay || !music || !ctx || !master) return;
  const bus = ctx.createGain();
  bus.connect(master);
  bus.gain.setValueAtTime(0, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + 0.2);
  const t: Track = { bus, voices: new Set(), timer: 0, next: ctx.currentTime + 0.025, step: 0, theme: music };
  const schedule = () => {
    if (!ctx || ctx.state !== 'running' || document.hidden) return;
    const song = SONGS[t.theme], beat = 60 / song.bpm / 2;
    // 오래 멈춘 뒤에는 지나간 음을 한꺼번에 재생하지 않아요.
    if (t.next < ctx.currentTime - 0.1) t.next = ctx.currentTime + 0.025;
    while (t.next < ctx.currentTime + 0.12) {
      const n = song.notes[t.step % song.notes.length]!;
      if (n >= 0) note(bus, t.voices, midi(n), t.next, beat * 0.78, 0.1);
      if (t.step % 4 === 0) note(bus, t.voices, midi(song.bass[Math.floor(t.step / 4) % 4]!), t.next, beat * 2.7, 0.08, 'sine');
      t.step++; t.next += beat;
    }
  };
  track = t; tracks.add(t); schedule();
  t.timer = window.setInterval(schedule, 30);
}

async function unlock(event: Event): Promise<void> {
  if (!event.isTrusted) return;
  try {
    ctx ??= new AudioContext();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = enabled ? volume : 0;
      // 여러 소리가 겹쳐도 찢어지지 않게 가볍게 눌러 줘요.
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.knee.value = 6;
      limiter.ratio.value = 6;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      master.connect(limiter).connect(ctx.destination);
    }
    await ctx.resume();
    unlocked = ctx.state === 'running';
    syncMusic();
  } catch { /* 소리를 낼 수 없는 환경에서도 게임은 계속돼요. */ }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('touchend', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      for (const t of [...tracks]) retire(t, true);
      track = null; stopVoices(effects);
    } else syncMusic();
  });
}

function applyMasterGain(): void {
  if (!master || !ctx) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(enabled ? volume : 0, ctx.currentTime);
}

/** 소리 크기(0~1). 메뉴의 작게·보통·크게가 이 값을 바꿔요. */
export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  applyMasterGain();
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  applyMasterGain();
  if (!on) {
    for (const t of [...tracks]) retire(t, true);
    track = null; stopVoices(effects);
  } else if (typeof document !== 'undefined') syncMusic();
}
export function playMusic(theme: MusicTheme | null): void {
  music = theme;
  if (typeof document !== 'undefined') syncMusic();
}
export function currentMusic(): MusicTheme | null { return music; }

const CUES: Record<SfxName, number[]> = {
  click: [76], step: [43], success: [72, 76, 79], fail: [64, 60], hit: [55, 62],
  guard: [67, 74], heal: [72, 76, 81], purify: [72, 76, 79, 84],
  levelup: [67, 72, 76, 79, 84], item: [76, 84], open: [60, 67],
};
export function playSfx(name: SfxName): void {
  if (!enabled || !unlocked || !ctx || !master || ctx.state !== 'running' || document.hidden) return;
  const short = name === 'step' || name === 'click';
  CUES[name].forEach((n, i) => {
    const duration = short ? 0.045 : name === 'hit' ? 0.07 : 0.13;
    note(master!, effects, midi(n), ctx!.currentTime + i * 0.065, duration,
      name === 'step' ? 0.06 : 0.2, 'triangle', name === 'hit' ? midi(n - 5) : midi(n));
  });
}
