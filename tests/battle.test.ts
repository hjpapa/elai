import { describe, expect, it } from 'vitest';
import { MOBS } from '../src/data/rpg/mobs';
import type { BattleCmd, Block, MobAction, SaveData } from '../src/data/schema';
import { Battle, type BattleOutcome } from '../src/game/battle/sim';
import { freshSave } from '../src/game/rpg/state';
import { derivedStats, programSlots } from '../src/game/rpg/stats';
import { xpForLevel } from '../src/data/rpg/levels';

/** 1장에서 얻는 장비를 갖춘 레벨 n 플레이어 */
function player(level: number, gear: string[] = ['cap', 'stick', 'vest', 'boots']): SaveData {
  const s = freshSave('test');
  s.level = level;
  s.xp = xpForLevel(level);
  for (const id of gear) s.inventory.push({ id, qty: 1 });
  const slotOf: Record<string, keyof SaveData['equipment']> = { cap: 'hat', stick: 'tool', vest: 'outfit', boots: 'shoes' };
  for (const id of gear) s.equipment[slotOf[id]] = id;
  return s;
}

const cards = (...cs: BattleCmd[]): Block[] => cs.map((c) => ({ t: 'cmd', cmd: c }));

/** 행동 예고를 읽고 맞게 짠 프로그램: 공격·강타는 막고, 막을 때는 쉬고, 나머지는 공격 */
const ideal = (intents: MobAction[]): Block[] =>
  cards(...intents.map((a): BattleCmd => (a === 'attack' || a === 'smash' ? 'guard' : a === 'guard' ? 'wait' : 'attack')));
const spam = (intents: MobAction[]): Block[] => cards(...intents.map((): BattleCmd => 'attack'));

function fight(save: SaveData, mobId: string, strategy: (i: MobAction[]) => Block[], first?: Block[]) {
  const stats = derivedStats(save);
  const b = new Battle({ stats, hp: stats.maxHp, slots: programSlots(save), mob: MOBS[mobId] });
  let outcome: BattleOutcome = 'continue';
  let program = first;
  while (outcome === 'continue') {
    outcome = b.runRound(program ?? strategy(b.intents())).outcome;
    program = undefined;
  }
  return { outcome, lostRatio: (stats.maxHp - b.playerHp) / stats.maxHp, rounds: b.round };
}

describe('전투 규칙', () => {
  it('막기는 강타를 막고, 몹이 막을 때는 공격이 통하지 않아요', () => {
    const save = player(4);
    const stats = derivedStats(save);
    const b = new Battle({ stats, hp: stats.maxHp, slots: 4, mob: MOBS.forestGuardian });
    // 수호자 행동: 힘 모으기, 강타, 막기, 공격
    const r = b.runRound(cards('attack', 'guard', 'attack', 'guard'));
    expect(r.ticks[1].guarded).toBe(true);
    expect(r.ticks[1].taken).toBe(0);
    expect(r.ticks[2].blocked).toBe(true);
    expect(r.ticks[2].dealt).toBe(0);
  });

  it('에너지가 모자라면 카드가 쉬기로 바뀌어요', () => {
    const save = player(1);
    const stats = derivedStats(save);
    const b = new Battle({ stats, hp: 5, slots: 3, mob: MOBS.dummy });
    const r = b.runRound(cards('heal', 'heal'));
    expect(stats.maxEn).toBe(3);
    expect(r.ticks[0].card).toBe('heal');
    expect(r.ticks[1].card).toBe('wait');
    expect(r.ticks[1].wanted).toBe('heal');
  });

  it('프로그램이 짧으면 남은 차례는 쉬고, 몹은 계속 움직여요', () => {
    const save = player(1);
    const stats = derivedStats(save);
    const b = new Battle({ stats, hp: stats.maxHp, slots: 3, mob: MOBS.dummy });
    const r = b.runRound(cards('attack'));
    expect(r.ticks).toHaveLength(3);
    expect(r.ticks[1].path).toBeNull();
    expect(r.ticks[1].mobAction).toBe('attack');
  });
});

describe('학습 우회 방지: 행동 예고를 읽어야 이겨요', () => {
  it('숲의 수호자: 권장 레벨 근처에서 맞게 짜면 이기고, 공격만 반복하면 져요', () => {
    for (const level of [3, 4, 5]) {
      expect(fight(player(level), 'forestGuardian', ideal).outcome, `Lv${level} 맞게`).toBe('win');
      expect(fight(player(level), 'forestGuardian', spam).outcome, `Lv${level} 공격만`).toBe('lose');
    }
  });

  it('일반 몹: 맞게 짜면 거의 안 다치고, 공격만 반복하면 체력을 40% 넘게 잃어요', () => {
    for (const [mob, level] of [
      ['vineSlime', 1],
      ['bugWorm', 2],
    ] as const) {
      const good = fight(player(level, ['cap', 'stick']), mob, ideal);
      const bad = fight(player(level, ['cap', 'stick']), mob, spam);
      expect(good.outcome, mob).toBe('win');
      expect(good.lostRatio, mob).toBeLessThanOrEqual(0.2);
      expect(bad.outcome === 'lose' || bad.lostRatio >= 0.4, mob).toBe(true);
    }
  });

  it('버그 벌레의 망가진 프로그램은 다치고, 고친 프로그램은 안 다쳐요', () => {
    const save = player(2, ['cap', 'stick']);
    const stats = derivedStats(save);
    const broken = new Battle({ stats, hp: stats.maxHp, slots: 3, mob: MOBS.bugWorm }).runRound(MOBS.bugWorm.prefill!);
    const fixed = new Battle({ stats, hp: stats.maxHp, slots: 3, mob: MOBS.bugWorm }).runRound(cards('attack', 'guard', 'attack'));
    expect(broken.ticks.reduce((n, t) => n + t.taken, 0)).toBeGreaterThan(0);
    expect(fixed.ticks.reduce((n, t) => n + t.taken, 0)).toBe(0);
  });

  it('막기만 반복하면 끝나지 않아서 결국 져요', () => {
    expect(fight(player(4), 'forestGuardian', (i) => cards(...i.map((): BattleCmd => 'guard'))).outcome).toBe('timeout');
  });
});
