import { getMission, getPart } from '../../data/chapters';
import { ITEMS } from '../../data/rpg/items';
import { MOBS } from '../../data/rpg/mobs';
import type { Observation } from '../battle/sim';
import { levelForXp } from '../../data/rpg/levels';
import type { Condition, EquipSlot, MissionRecord, Reward, SaveData, Stats } from '../../data/schema';
import type { MissionResult } from '../../missions/core/types';
import { derivedStats, helpers, programSlots } from './stats';

export type StateEvent =
  | { type: 'change' }
  | { type: 'levelUp'; level: number }
  | { type: 'item'; id: string; qty: number }
  | { type: 'mission'; id: string; record: MissionRecord };

/** 보상을 받은 뒤 화면에 보여 줄 요약 */
export interface RewardSummary {
  xp: number;
  coins: number;
  items: { id: string; qty: number }[];
  levelUps: number[];
  robiPart?: string;
  badge?: string;
  title?: string;
}

export const START_MAP = { map: 'village', x: 12, y: 16 };

export function freshSave(nickname: string): SaveData {
  return {
    version: 1,
    nickname,
    level: 1,
    xp: 0,
    hp: 20,
    coins: 0,
    inventory: [],
    equipment: {},
    robiParts: [],
    missions: {},
    flags: {},
    dex: { mobs: [], items: [] },
    observations: {},
    badges: [],
    titles: [],
    location: { ...START_MAP },
    visited: {},
    settings: { sound: true },
    updatedAt: new Date().toISOString(),
  };
}

/** 저장 데이터를 들고 바꾸는 곳. 바뀔 때마다 'change'를 알려요(자동 저장·HUD 갱신). */
export class GameState {
  private listeners = new Set<(e: StateEvent) => void>();

  constructor(public data: SaveData) {
    const saved = data.observations ?? {};
    data.observations = {};
    for (const [id, rows] of Object.entries(saved)) {
      if (!MOBS[id]?.dataPattern || !Array.isArray(rows)) continue;
      data.observations[id] = this.cleanObservations(rows);
    }
  }

  private cleanObservations(rows: Observation[]): Observation[] {
    const result: Observation[] = [];
    for (const row of rows) {
      if (!row || !Number.isInteger(row.value) || row.value < 1 || row.value > 3 || !['attack', 'guard', 'charge', 'smash', 'heal', 'idle'].includes(row.action)) continue;
      if (!result.some(r => r.value === row.value && r.action === row.action)) result.push({ value: row.value, action: row.action });
      if (result.length >= 24) break;
    }
    return result;
  }

  /** 실제로 본 기록만 저장하고, 같은 값과 행동은 한 줄로 모아요. */
  recordObservations(mobId: string, rows: Observation[]): void {
    if (!MOBS[mobId]?.dataPattern) return;
    const all = this.data.observations ??= {};
    const before = all[mobId] ?? [];
    const merged = this.cleanObservations([...before, ...rows]);
    if (merged.length === before.length) return;
    all[mobId] = merged;
    this.changed();
  }

  on(fn: (e: StateEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: StateEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  private changed(): void {
    this.data.updatedAt = new Date().toISOString();
    this.emit({ type: 'change' });
  }

  // ── 읽기 ──
  get stats(): Stats {
    return derivedStats(this.data);
  }
  get slots(): number {
    return programSlots(this.data);
  }
  get helpers(): { debugGlasses: boolean; flowMap: boolean } {
    return helpers(this.data);
  }
  itemQty(id: string): number {
    return this.data.inventory.find((s) => s.id === id)?.qty ?? 0;
  }
  hasFlag(name: string): boolean {
    return this.data.flags[name] === true;
  }
  missionDone(id: string): boolean {
    return this.data.missions[id]?.done === true;
  }
  partDone(partId: string): boolean {
    const p = getPart(partId);
    return !!p && p.part.missions.every((m) => this.missionDone(m.id));
  }
  /** 이 파트에서 다음에 할 미션(앞 미션을 끝내야 다음이 열려요) */
  nextMissionOf(partId: string): string | undefined {
    const p = getPart(partId);
    return p?.part.missions.find((m) => !this.missionDone(m.id))?.id;
  }
  check(cond: Condition | undefined): boolean {
    if (!cond) return true;
    if (cond.flag && !this.hasFlag(cond.flag)) return false;
    if (cond.notFlag && this.hasFlag(cond.notFlag)) return false;
    if (cond.mission && !this.missionDone(cond.mission)) return false;
    if (cond.notMission && this.missionDone(cond.notMission)) return false;
    return true;
  }

  // ── 바꾸기 ──
  addXp(n: number): number[] {
    if (n <= 0) return [];
    const before = this.data.level;
    this.data.xp += n;
    const after = levelForXp(this.data.xp);
    const ups: number[] = [];
    if (after > before) {
      const oldMax = this.stats.maxHp;
      this.data.level = after;
      // 레벨이 오르면 늘어난 최대 체력만큼 함께 회복해요.
      this.data.hp = Math.min(this.stats.maxHp, this.data.hp + (this.stats.maxHp - oldMax));
      for (let l = before + 1; l <= after; l++) {
        ups.push(l);
        this.emit({ type: 'levelUp', level: l });
      }
    }
    this.changed();
    return ups;
  }

  addCoins(n: number): void {
    this.data.coins = Math.max(0, this.data.coins + n);
    this.changed();
  }

  addItem(id: string, qty = 1): void {
    if (!ITEMS[id] || qty <= 0) return;
    const slot = this.data.inventory.find((s) => s.id === id);
    if (slot) slot.qty += qty;
    else this.data.inventory.push({ id, qty });
    if (!this.data.dex.items.includes(id)) this.data.dex.items.push(id);
    this.emit({ type: 'item', id, qty });
    this.changed();
  }

  removeItem(id: string, qty = 1): boolean {
    const slot = this.data.inventory.find((s) => s.id === id);
    if (!slot || slot.qty < qty) return false;
    slot.qty -= qty;
    if (slot.qty === 0) {
      this.data.inventory = this.data.inventory.filter((s) => s !== slot);
      for (const [k, v] of Object.entries(this.data.equipment)) {
        if (v === id) delete this.data.equipment[k as EquipSlot];
      }
    }
    this.changed();
    return true;
  }

  equip(id: string): boolean {
    const item = ITEMS[id];
    if (!item?.slot || this.itemQty(id) < 1) return false;
    this.data.equipment[item.slot] = id;
    this.data.hp = Math.min(this.data.hp, this.stats.maxHp);
    this.changed();
    return true;
  }

  unequip(slot: EquipSlot): void {
    delete this.data.equipment[slot];
    this.data.hp = Math.min(this.data.hp, this.stats.maxHp);
    this.changed();
  }

  setHp(hp: number): void {
    this.data.hp = Math.max(0, Math.min(this.stats.maxHp, Math.round(hp)));
    this.changed();
  }

  fullHeal(): void {
    this.setHp(this.stats.maxHp);
  }

  /** 소모품 쓰기(전투 밖: 회복 사과만) */
  useItem(id: string): boolean {
    const item = ITEMS[id];
    if (item?.kind !== 'consumable' || !item.effect?.heal) return false;
    if (this.data.hp >= this.stats.maxHp) return false;
    if (!this.removeItem(id)) return false;
    this.setHp(this.data.hp + item.effect.heal);
    return true;
  }

  setFlag(name: string): void {
    this.data.flags[name] = true;
    this.changed();
  }

  updateSettings(patch: Partial<SaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...patch };
    this.changed();
  }

  addDexMob(id: string): void {
    if (!this.data.dex.mobs.includes(id)) {
      this.data.dex.mobs.push(id);
      this.changed();
    }
  }

  setLocation(map: string, x: number, y: number): void {
    this.data.location = { map, x, y };
    this.changed();
  }

  /** 던전 안개: 가 본 칸 표시 */
  setVisited(mapId: string, bits: string): void {
    this.data.visited[mapId] = bits;
    this.changed();
  }

  /** 미션 결과 기록. 별은 가장 좋았던 기록을 남겨요. */
  recordMission(id: string, result: MissionResult): MissionRecord {
    const prev = this.data.missions[id];
    const rec: MissionRecord = {
      stars: Math.max(prev?.stars ?? 0, result.success ? result.stars : 0),
      attempts: (prev?.attempts ?? 0) + result.attempts,
      hints: (prev?.hints ?? 0) + result.hints,
      done: (prev?.done ?? false) || result.success,
      at: result.success && !prev?.done ? new Date().toISOString() : prev?.at,
    };
    this.data.missions[id] = rec;
    this.emit({ type: 'mission', id, record: rec });
    this.changed();
    return rec;
  }

  applyReward(r: Reward | undefined): RewardSummary {
    const sum: RewardSummary = { xp: r?.xp ?? 0, coins: r?.coins ?? 0, items: [...(r?.items ?? [])], levelUps: [] };
    if (!r) return sum;
    for (const it of r.items ?? []) this.addItem(it.id, it.qty);
    if (r.coins) this.addCoins(r.coins);
    for (const f of r.flags ?? []) this.data.flags[f] = true;
    if (r.robiPart && !this.data.robiParts.includes(r.robiPart)) {
      this.data.robiParts.push(r.robiPart);
      sum.robiPart = r.robiPart;
    }
    if (r.badge && !this.data.badges.includes(r.badge)) {
      this.data.badges.push(r.badge);
      sum.badge = r.badge;
    }
    if (r.title && !this.data.titles.includes(r.title)) {
      this.data.titles.push(r.title);
      sum.title = r.title;
    }
    sum.levelUps = this.addXp(r.xp ?? 0);
    this.changed();
    return sum;
  }

  /** 미션을 처음 성공했을 때만 보상을 줘요. 다시 해서 별을 올리는 건 언제든 가능해요. */
  completeMission(id: string, result: MissionResult): { record: MissionRecord; reward?: RewardSummary } {
    const firstClear = result.success && !this.missionDone(id);
    const record = this.recordMission(id, result);
    if (!firstClear) return { record };
    return { record, reward: this.applyReward(getMission(id)?.mission.reward) };
  }
}
