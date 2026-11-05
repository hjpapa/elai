import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data/rpg/items';
import { getMission } from '../src/data/chapters';
import { MOBS } from '../src/data/rpg/mobs';
import type { BattleCmd, Block, ClassificationModel, MobAction, SaveData } from '../src/data/schema';
import { Battle, programCost, type BattleOutcome } from '../src/game/battle/sim';
import { freshSave } from '../src/game/rpg/state';
import { derivedStats, programSlots } from '../src/game/rpg/stats';
import { xpForLevel } from '../src/data/rpg/levels';

/** 1장에서 얻는 장비를 갖춘 레벨 n 플레이어 */
function player(level: number, gear: string[] = ['cap', 'stick', 'vest', 'boots']): SaveData {
  const s = freshSave('test');
  s.level = level;
  s.xp = xpForLevel(level);
  for (const id of gear) s.inventory.push({ id, qty: 1 });
  for (const id of gear) {
    const slot = ITEMS[id].slot;
    if (slot) s.equipment[slot] = id;
  }
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

const repeat = (times: number, body: Block[]): Block[] => [{ t: 'repeat', times, body }];

describe('2장: 반복은 같은 카드 위치의 에너지를 한 번만 써요', () => {
  it('반복 비용은 한 번, 서로 다른 위치의 카드는 각각 내요', () => {
    expect(programCost(repeat(9, cards('attack', 'guard')))).toBe(2);
    expect(programCost(cards('attack', 'attack', 'guard'))).toBe(3);
    expect(programCost(repeat(3, repeat(3, cards('heal'))))).toBe(2);
    const stats = { maxHp: 100, maxEn: 2, atk: 1, def: 1 };
    const mob = { ...MOBS.dummy, hp: 999, pattern: ['idle'] as MobAction[], roundTicks: 6 };
    const b = new Battle({ stats, hp: 100, slots: 3, mob });
    const result = b.runRound(repeat(3, cards('attack', 'guard')));
    expect(result.ticks.map(t => t.energy)).toEqual([1, 0, 0, 0, 0, 0]);
    expect(result.ticks.every(t => !t.wanted)).toBe(true);
    expect(b.runRound(repeat(3, cards('attack', 'guard'))).ticks[0].energy).toBe(1);
  });

  it('처음부터 비용이 모자란 반복 카드는 계속 쉬어요', () => {
    const stats = { maxHp: 100, maxEn: 1, atk: 1, def: 1 };
    const b = new Battle({ stats, hp: 20, slots: 3, mob: { ...MOBS.dummy, pattern: ['idle'], roundTicks: 3 } });
    const r = b.runRound(repeat(3, cards('heal')));
    expect(r.ticks.map(t => [t.card, t.wanted, t.energy])).toEqual(Array(3).fill(['wait', 'heal', 1]));
  });

  it('복제 미리 보기는 체력·차례·보너스를 보존하고 실제 실행과 같아요', () => {
    const stats = derivedStats(player(6));
    const battle = new Battle({ stats, hp: 20, slots: 6, mob: MOBS.batKing });
    battle.runRound(repeat(3, cards('wait', 'attack', 'guard', 'attack')));
    battle.addEnergy(2);
    const before = { hp: battle.playerHp, mobHp: battle.mobHp, round: battle.round, energy: battle.energy, intents: battle.intents() };
    const p = repeat(3, cards('wait', 'attack', 'guard', 'attack'));
    const preview = battle.clone().runRound(p);
    expect({ hp: battle.playerHp, mobHp: battle.mobHp, round: battle.round, energy: battle.energy, intents: battle.intents() }).toEqual(before);
    expect(battle.runRound(p)).toEqual(preview);
  });

  it('박쥐 대장: Lv6~8에서 반복은 무피해 승리, 슬롯만큼 평평하게 놓으면 패배해요', () => {
    for (const level of [6, 7, 8]) {
      const save = player(level, ['leafhat', 'brush', 'cloak', 'boots']);
      save.robiParts = ['wheel', 'memoryChip'];
      const good = fight(save, 'batKing', () => repeat(3, cards('wait', 'attack', 'guard', 'attack')));
      const bad = fight(save, 'batKing', intents => ideal(intents).slice(0, programSlots(save)));
      const attackOnly = fight(save, 'batKing', () => repeat(9, cards('attack')));
      expect(good.outcome, 'Lv' + level).toBe('win');
      expect(good.lostRatio, 'Lv' + level).toBe(0);
      expect(bad.outcome, 'Lv' + level).toBe('lose');
      expect(attackOnly.outcome, 'Lv' + level).toBe('lose');
    }
  });

  it('메아리 박쥐: 맞는 반복은 무피해, 공격 반복은 20% 넘게 잃어요', () => {
    const save = player(5, ['cap', 'brush', 'cloak', 'boots']);
    save.robiParts = ['wheel', 'memoryChip'];
    const good = fight(save, 'echoBat', i => repeat(4, ideal(i.slice(0, 2))));
    const bad = fight(save, 'echoBat', () => repeat(9, cards('attack')));
    expect(good.outcome).toBe('win');
    expect(good.lostRatio).toBe(0);
    expect(bad.lostRatio).toBeGreaterThan(.2);
  });
});

const conditional: Block[] = [{ t: 'repeat', times: 12, body: [{ t: 'if', cond: 'enemySmash', yes: cards('guard'), no: cards('attack') }] }];

describe('3장 조건 학습과 숨은 행동', () => {
  const setup = (mobId: string, seed: number, level = 8) => {
    const save = player(level, ['rangerhat', 'brush', 'cloak', 'windboots']);
    save.robiParts = ['wheel', 'memoryChip', 'sensor'];
    const stats = derivedStats(save);
    const mob = { ...MOBS[mobId], hiddenPattern: { choices: ['idle', 'smash'] as MobAction[], seed } };
    return new Battle({ stats, hp: stats.maxHp, slots: programSlots(save), mob });
  };
  const finish = (b: Battle, program: Block[]) => {
    while (b.outcome === 'continue') b.runRound(program);
    return b;
  };
  it('씨앗 1~20에서 조건은 무피해 승리하고, 고정 프로그램은 우회하지 못해요', () => {
    for (const level of [8, 9, 10]) for (const mobId of ['mirageLizard', 'lizardChief']) for (let seed = 1; seed <= 20; seed++) {
      const good = finish(setup(mobId, seed, level), conditional);
      expect(good.outcome, mobId + ' Lv' + level + ' seed ' + seed).toBe('win');
      expect(good.playerHp).toBe(good.stats.maxHp);
      const spam = finish(setup(mobId, seed, level), repeat(12, cards('attack')));
      expect(spam.outcome, '공격 ' + mobId + ' Lv' + level + ' seed ' + seed).toBe('lose');
      const flat = finish(setup(mobId, seed, level), cards('wait', 'attack', 'wait', 'guard', 'wait', 'attack', 'guard'));
      expect(flat.outcome, '고정 ' + mobId + ' Lv' + level + ' seed ' + seed).not.toBe('win');
      const fixedRepeat = finish(setup(mobId, seed, level), repeat(6, cards('attack', 'guard')));
      expect(fixedRepeat.outcome, '고정 반복 ' + mobId + ' Lv' + level + ' seed ' + seed).toBe('timeout');
    }
  });
  it('같은 씨앗과 복제의 계산은 같고, 씨앗이 달라도 공개 미리 보기는 같아요', () => {
    const first = setup('lizardChief', 1);
    expect(first.displayIntents()).toEqual(Array.from({ length: 12 }, (_, i) => i % 2 ? null : 'guard'));
    expect(first.preview(conditional)).toEqual(Array(12).fill(null));
    expect(first.preview(cards('attack'))).toEqual(Array(12).fill(null));
    const actual = first.clone().runRound(conditional);
    expect(first.runRound(conditional)).toEqual(actual);
    expect(setup('lizardChief', 1).runRound(conditional)).toEqual(actual);
    const second = setup('lizardChief', 2);
    expect(second.preview(conditional)).toEqual(Array(12).fill(null));
    expect(second.intents()).not.toEqual(setup('lizardChief', 1).intents());
    expect(first.clone().runRound(conditional)).toEqual(first.runRound(conditional));
  });
});

const waveProgram: Block[] = [{ t: 'repeat', times: 12, body: [{ t: 'if', cond: 'waveHigh', yes: cards('guard'), no: [
  { t: 'if', cond: 'waveMiddle', yes: cards('wait'), no: cards('attack') },
] }] }];
const observeProgram: Block[] = [...cards('scan'), ...repeat(11, cards('guard'))];

describe('4장 데이터 관찰과 규칙', () => {
  const setup = (mobId: string, level = 10) => {
    const save = player(level, ['rangerhat', 'brush', 'cloak', 'windboots']);
    save.robiParts = ['wheel', 'memoryChip', 'sensor', 'dataLens'];
    const stats = derivedStats(save);
    return new Battle({ stats, hp: stats.maxHp, slots: programSlots(save), mob: MOBS[mobId] });
  };
  const finish = (b: Battle, p: Block[]) => { while (b.outcome === 'continue') b.runRound(p); return b; };
  it('Lv10~12에서 안전하게 관찰한 뒤 값 조건으로 무피해 승리해요', () => {
    for (const level of [10, 11, 12]) for (const id of ['fogJelly', 'ledgerOcto']) {
      const good = setup(id, level);
      const observation = good.runRound(observeProgram);
      expect(observation.ticks.reduce((n, t) => n + t.taken, 0)).toBe(0);
      expect(good.observations).toHaveLength(3);
      expect(observation.ticks.filter(t => t.observation)).toHaveLength(12);
      expect(programCost(observeProgram)).toBe(1);
      finish(good, waveProgram);
      expect(good.outcome, id + ' Lv' + level).toBe('win');
      expect(good.playerHp, id + ' Lv' + level).toBe(good.stats.maxHp);
      expect(finish(setup(id, level), waveProgram).outcome, '기록 없이 ' + id + level).toBe('lose');
      expect(finish(setup(id, level), conditional).outcome, '직접 행동 조건 ' + id + level).toBe('lose');
      expect(finish(setup(id, level), repeat(12, cards('attack'))).outcome, '공격만 ' + id + level).toBe('lose');
      const fixed = setup(id, level);fixed.runRound(observeProgram);
      expect(finish(fixed, repeat(4, cards('attack', 'guard', 'guard'))).outcome, '고정 반복 ' + id + level).toBe('lose');
    }
  });
  it('관찰 전에는 값 조건도 닫히고, 미리 보기와 복제는 기록을 누설·변경하지 않아요', () => {
    const battle = setup('ledgerOcto');
    expect(battle.values()).toEqual(MOBS.ledgerOcto.dataPattern!.values.slice(0, 12));
    expect(battle.displayIntents()).toEqual(Array(12).fill(null));
    expect(battle.preview(observeProgram)).toEqual(Array(12).fill(null));
    expect(battle.observations).toEqual([]);
    expect(battle.test('waveHigh')).toBe(false);
    const copy = battle.clone();copy.runRound(observeProgram);
    expect(copy.observations).toHaveLength(3);
    expect(battle.observations).toEqual([]);
    expect(battle.runRound(observeProgram)).toEqual(setup('ledgerOcto').runRound(observeProgram));
    const learnedCopy = battle.clone();learnedCopy.observations[0].value = 99;
    expect(battle.observations[0].value).toBe(1);
    expect(battle.preview(waveProgram)).toEqual(Array(12).fill(null));
    expect(battle.test('enemyGuard')).toBe(false);
  });
  it('관찰 카드를 쓰기 전의 차례는 기록하지 않고, 같은 관찰을 중복하지 않아요', () => {
    const b = setup('fogJelly');
    const r = b.runRound([...cards('wait','guard','scan'), ...repeat(9, cards('guard'))]);
    expect(r.ticks[0].observation).toBeUndefined();expect(r.ticks[1].observation).toBeUndefined();
    expect(r.ticks[2].observation).toEqual({ value: 2, action: 'guard' });
    expect(b.observations).toHaveLength(3);
    b.runRound(observeProgram);expect(b.observations).toHaveLength(3);
  });
});

const modelProgram: Block[] = [{ t: 'repeat', times: 12, body: [{ t:'if', cond:'modelPlayful', yes:cards('attack'), no:cards('guard') }] }];

describe('5장 내 분류 모델 전투', () => {
  const training = getMission('ch5-p3-m1')?.mission;
  if (training?.kind !== 'train' || !training.data) throw new Error('5장 학습 미션이 없어요');
  const model: ClassificationModel = { samples: training.data.examples.map(sample => ({ features: [...sample.features], label: sample.label })), k: training.data.k };
  const setup = (id: string, level: number, seed: number, classificationModel?: ClassificationModel) => {
    const save = player(level, ['rangerhat', 'brush', 'cloak', 'windboots']);save.robiParts=['wheel','memoryChip','sensor','dataLens','learningChip'];
    const stats=derivedStats(save), original=MOBS[id];
    const mob={...original,classifyPattern:{samples:original.classifyPattern!.samples,seed}};
    return new Battle({stats,hp:stats.maxHp,slots:programSlots(save),mob,classificationModel});
  };
  const finish=(b:Battle,p:Block[])=>{while(b.outcome==='continue')b.runRound(p);return b;};
  it('Lv11~14·씨앗1~20에서 바른 모델은 무피해, 빈 모델·치우친 모델·이전 조건은 실패해요',()=>{
    for(const level of [11,12,13,14])for(const id of ['shapeSlime','shiftKing'])for(let seed=1;seed<=20;seed++){
      const message=id+' Lv'+level+' seed'+seed;
      const good=finish(setup(id,level,seed,model),modelProgram);
      expect(good.outcome,message).toBe('win');expect(good.playerHp,message).toBe(good.stats.maxHp);
      expect(finish(setup(id,level,seed),modelProgram).outcome,'빈 모델 '+message).toBe('timeout');
      for(const label of ['friend','playful']){
        const biased={samples:model.samples.map(sample=>({...sample,label})),k:3};
        expect(finish(setup(id,level,seed,biased),modelProgram).outcome,'치우침 '+label+message).not.toBe('win');
      }
      expect(finish(setup(id,level,seed,model),conditional).outcome,'이전 행동 조건 '+message).toBe('lose');
      expect(finish(setup(id,level,seed,model),waveProgram).outcome,'이전 물결 조건 '+message).toBe('lose');
      expect(finish(setup(id,level,seed,model),repeat(12,cards('attack'))).outcome,'공격반복 '+message).toBe('lose');
    }
  });
  it('진짜 이름표는 미리 보기에 없고, 모델과 특징은 복제본에서 공유하지 않아요',()=>{
    const b=setup('shiftKing',11,1,model);
    expect(b.displayIntents()).toEqual(Array(12).fill(null));expect(b.preview(modelProgram)).toEqual(Array(12).fill(null));
    expect(b.features().every(f=>f?.length===2)).toBe(true);
    const copy=b.clone();copy.classificationModel.samples[0].features[0]=99;
    expect(b.classificationModel.samples[0].features[0]).toBe(1);expect(model.samples[0].features[0]).toBe(1);
    const visible=b.features();visible[0]![0]=99;expect(b.features()[0]![0]).not.toBe(99);
    expect(b.clone().runRound(modelProgram)).toEqual(b.runRound(modelProgram));
  });
  it('친구를 공격해도 정화는 진행되지 않고 잘못 분류한 사실을 알려줘요',()=>{
    const b=setup('shiftKing',11,1,model);
    const r=b.runRound(repeat(12,cards('attack')));
    const mistakes=r.ticks.filter(t=>t.classification?.actual==='friend');
    expect(mistakes.length).toBeGreaterThan(0);
    expect(mistakes.every(t=>t.blocked&&t.dealt===0&&t.taken>0)).toBe(true);
  });
});
