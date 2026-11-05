import type { BattleCmd, Block, Cmd, Cond, MobAction, MobDef, Stats } from '../../data/schema';
import { run, type Env } from '../../missions/core/interpreter';

/** 카드 에너지 비용 */
export const CARD_COST: Record<BattleCmd, number> = { attack: 1, guard: 1, heal: 2, wait: 0, scan: 0 };
/** 이만큼 지나도 끝나지 않으면 로비가 지쳐서 져요(막기만 반복하는 경우 방지) */
export const MAX_ROUNDS = 12;

export const ACTION_LABEL: Record<MobAction, string> = {
  attack: '공격',
  guard: '막기',
  charge: '힘 모으기',
  smash: '강타',
  heal: '회복',
  idle: '멍하니 있기',
};

export interface Observation { value: number; action: MobAction }

export interface TickEvent {
  /** 이 차례에 실제로 수집한 기록 */
  observation?: Observation;
  /** 라운드 안의 차례(0부터) */
  tick: number;
  /** 실행한 카드의 위치. 카드가 모자라 쉰 차례는 null */
  path: string | null;
  /** 실제로 한 행동 */
  card: BattleCmd;
  /** 에너지가 모자라 바뀌기 전 카드 */
  wanted?: BattleCmd;
  mobAction: MobAction;
  /** 플레이어가 준 피해 */
  dealt: number;
  /** 플레이어가 받은 피해 */
  taken: number;
  /** 플레이어 공격이 몹의 막기에 막힘 */
  blocked: boolean;
  /** 플레이어가 몹 공격을 막음 */
  guarded: boolean;
  healed: number;
  mobHealed: number;
  playerHp: number;
  mobHp: number;
  energy: number;
}

export type BattleOutcome = 'continue' | 'win' | 'lose' | 'timeout';

export interface RoundResult {
  ticks: TickEvent[];
  outcome: BattleOutcome;
}

export interface BattleSetup {
  observations?: Observation[];
  stats: Stats;
  hp: number;
  slots: number;
  mob: MobDef;
}

const BATTLE_CMDS: ReadonlySet<Cmd> = new Set<Cmd>(['attack', 'guard', 'heal', 'wait', 'scan']);

/** 전투 계산(화면과 따로). 한 라운드 = 몹 행동 예고 칸 수만큼의 차례. */
export class Battle {
  readonly mob: MobDef;
  readonly stats: Stats;
  readonly slots: number;
  readonly observations: Observation[];
  playerHp: number;
  mobHp: number;
  round = 0;
  outcome: BattleOutcome = 'continue';
  private patternIndex = 0;
  private energyBonus = 0;

  constructor(setup: BattleSetup) {
    this.mob = setup.mob;
    this.observations = (setup.observations ?? []).map(row => ({ ...row }));
    this.stats = setup.stats;
    this.slots = setup.slots;
    this.playerHp = Math.min(setup.hp, setup.stats.maxHp);
    this.mobHp = setup.mob.hp;
  }

  /** 미리 보기는 실제 전투 상태를 바꾸지 않아요. */
  clone(): Battle {
    const copy = new Battle({ stats: { ...this.stats }, hp: this.playerHp, slots: this.slots, mob: this.mob, observations: this.observations });
    copy.mobHp = this.mobHp;
    copy.round = this.round;
    copy.outcome = this.outcome;
    copy.patternIndex = this.patternIndex;
    copy.energyBonus = this.energyBonus;
    return copy;
  }

  get ticksPerRound(): number {
    return this.mob.roundTicks ?? this.slots;
  }

  /** 씨앗과 절대 차례를 섞어요. 복제·재실행에서도 같은 행동이에요. */
  private actionAt(index: number): MobAction {
    const data = this.mob.dataPattern;
    if (data?.values.length) return data.actions[data.values[index % data.values.length] - 1] ?? 'idle';
    const hidden = this.mob.hiddenPattern;
    if (hidden?.choices.length && index % 2 === 1) {
      let hash = (hidden.seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
      hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
      hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
      hash = (hash ^ (hash >>> 16)) >>> 0;
      return hidden.choices[hash % hidden.choices.length];
    }
    return this.mob.pattern[index % this.mob.pattern.length];
  }

  /** 조건 인터프리터는 현재 차례의 진짜 행동을 읽어요. */
  intents(n = this.ticksPerRound): MobAction[] {
    return Array.from({ length: n }, (_, i) => this.actionAt(this.patternIndex + i));
  }

  /** 물결은 행동과 별개로 눈에 보이는 입력값이에요. */
  values(n = this.ticksPerRound): (number | null)[] {
    const values = this.mob.dataPattern?.values;
    return Array.from({ length: n }, (_, i) => values?.length ? values[(this.patternIndex + i) % values.length] : null);
  }

  /** 화면에는 가려진 차례를 null로 돌려줘요. */
  displayIntents(n = this.ticksPerRound): (MobAction | null)[] {
    if (this.mob.dataPattern) return Array(n).fill(null);
    return this.intents(n).map((action, i) => this.mob.hiddenPattern?.choices.length && (this.patternIndex + i) % 2 === 1 ? null : action);
  }

  /** 숨은 행동의 조건 결과·생존 여부도 미리 보기로 새지 않게 해요. */
  preview(program: Block[]): (TickEvent | null)[] {
    if (this.mob.hiddenPattern?.choices.length || this.mob.dataPattern) return Array(this.ticksPerRound).fill(null);
    return this.clone().runRound(program).ticks;
  }

  get energy(): number {
    return this.stats.maxEn + this.energyBonus;
  }

  /** 에너지 젤리: 다음 라운드 에너지 추가 */
  addEnergy(n: number): void {
    this.energyBonus += n;
  }

  /** 회복 사과: 바로 회복 */
  healPlayer(n: number): number {
    const before = this.playerHp;
    this.playerHp = Math.min(this.stats.maxHp, this.playerHp + n);
    return this.playerHp - before;
  }

  playerAttackDamage(): number {
    return Math.max(1, Math.round(this.stats.atk - this.mob.def * 0.5));
  }

  mobDamage(action: 'attack' | 'smash'): number {
    const base = Math.max(1, Math.round(this.mob.atk - this.stats.def * 0.5));
    if (action === 'attack') return base;
    const smash = Math.max(1, Math.round(this.mob.atk * 3 - this.stats.def * 0.5));
    const floor = this.mob.smashRatio ? Math.ceil(this.stats.maxHp * this.mob.smashRatio) : 0;
    return Math.max(smash, floor);
  }

  healAmount(): number {
    return Math.max(4, Math.round(this.stats.maxHp * 0.25));
  }

  /** 한 라운드 실행. 프로그램이 짧으면 남은 차례는 쉬어요(몹은 계속 움직여요). */
  runRound(program: Block[]): RoundResult {
    if (this.outcome !== 'continue') return { ticks: [], outcome: this.outcome };
    const ticks: TickEvent[] = [];
    const total = this.ticksPerRound;
    const paid = new Set<string>();
    let scanning = false;
    let energy = this.energy;
    this.energyBonus = 0;

    const doTick = (wanted: BattleCmd, path: string | null): void => {
      let card = wanted;
      const cost = path !== null && paid.has(path) ? 0 : CARD_COST[card];
      if (cost > energy) card = 'wait';
      else {
        energy -= cost;
        if (path !== null) paid.add(path);
      }
      const mobAction = this.intents(1)[0];
      if (card === 'scan') scanning = true;
      const ev: TickEvent = {
        tick: ticks.length,
        path,
        card,
        wanted: card !== wanted ? wanted : undefined,
        mobAction,
        dealt: 0,
        taken: 0,
        blocked: false,
        guarded: false,
        healed: 0,
        mobHealed: 0,
        playerHp: 0,
        mobHp: 0,
        energy,
      };
      // 1) 플레이어 행동
      if (card === 'attack') {
        if (mobAction === 'guard') ev.blocked = true;
        else {
          ev.dealt = Math.min(this.mobHp, this.playerAttackDamage());
          this.mobHp -= ev.dealt;
        }
      } else if (card === 'heal') {
        ev.healed = this.healPlayer(this.healAmount());
      }
      // 2) 몹 행동(몹이 정화되면 행동하지 않아요)
      if (this.mobHp > 0) {
        if (mobAction === 'attack' || mobAction === 'smash') {
          if (card === 'guard') ev.guarded = true;
          else {
            ev.taken = Math.min(this.playerHp, this.mobDamage(mobAction));
            this.playerHp -= ev.taken;
          }
        } else if (mobAction === 'heal') {
          const before = this.mobHp;
          this.mobHp = Math.min(this.mob.hp, this.mobHp + (this.mob.heal ?? 0));
          ev.mobHealed = this.mobHp - before;
        }
      }
      const value = this.values(1)[0];
      if (scanning && value !== null && this.mobHp > 0) {
        ev.observation = { value, action: mobAction };
        if (!this.observations.some(row => row.value === value && row.action === mobAction)) {
          this.observations.push({ ...ev.observation });
          if (this.observations.length > 24) this.observations.shift();
        }
      }
      this.patternIndex++;
      ev.playerHp = this.playerHp;
      ev.mobHp = this.mobHp;
      ticks.push(ev);
      if (this.mobHp <= 0) this.outcome = 'win';
      else if (this.playerHp <= 0) this.outcome = 'lose';
    };

    const env: Env = {
      exec: (cmd, path) => doTick(BATTLE_CMDS.has(cmd) ? (cmd as BattleCmd) : 'wait', path),
      test: (cond: Cond) => this.test(cond),
      halted: () => this.outcome !== 'continue' || ticks.length >= total,
    };
    run(program, env, total);
    while (this.outcome === 'continue' && ticks.length < total) doTick('wait', null);

    this.round++;
    if (this.outcome === 'continue' && this.round >= MAX_ROUNDS) this.outcome = 'timeout';
    return { ticks, outcome: this.outcome };
  }

  test(cond: Cond): boolean {
    const now = this.intents(1)[0];
    if (this.mob.dataPattern && cond.startsWith('enemy')) return false;
    if (cond === 'waveHigh' || cond === 'waveMiddle') {
      const value = this.values(1)[0];
      return value !== null && this.observations.some(row => row.value === value) && value === (cond === 'waveHigh' ? 3 : 2);
    }
    switch (cond) {
      case 'enemyAttack':
        return now === 'attack' || now === 'smash';
      case 'enemyGuard':
        return now === 'guard';
      case 'enemyCharge':
        return now === 'charge';
      case 'enemySmash':
        return now === 'smash';
      case 'lowHp':
        return this.playerHp < this.stats.maxHp * 0.4;
      default:
        return false;
    }
  }
}

/** 프로그램의 각 카드 위치에 드는 에너지. 반복 몸체는 한 번만 세요. */
export function programCost(program: Block[]): number {
  let cost = 0;
  for (const b of program) {
    if (b.t === 'cmd' && BATTLE_CMDS.has(b.cmd)) cost += CARD_COST[b.cmd as BattleCmd];
    else if (b.t === 'repeat') cost += programCost(b.body);
    else if (b.t === 'if') cost += programCost(b.yes) + programCost(b.no);
  }
  return cost;
}
