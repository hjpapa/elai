import { describe, expect, it } from 'vitest';
import { CHAPTERS, getChapter } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { levelForXp } from '../src/data/rpg/levels';
import { MOBS } from '../src/data/rpg/mobs';
import type { BattleCmd, Block, Chapter, SaveData } from '../src/data/schema';
import { Battle } from '../src/game/battle/sim';
import { LOCKED_BY_TEACHER, LOCKED_BY_TUTORIAL, entryChapter, objective, portalGate } from '../src/game/rpg/progress';
import { applySkipKit, skipKit } from '../src/game/rpg/skip';
import { GameState, freshSave } from '../src/game/rpg/state';
import { derivedStats, programSlots } from '../src/game/rpg/stats';
import { chapterGate, classPath, currentChapter, startsDirectly, tutorialDone, type ClassUnlock } from '../src/game/rpg/unlock';
import type { MissionResult } from '../src/missions/core/types';

const ch = (id: string): Chapter => getChapter(id)!;
const ok: MissionResult = { success: true, stars: 3, attempts: 1, hints: 0 };
const ids = (list: Chapter[]) => list.map((c) => c.id);

/** 장의 모든 미션을 차례로 끝내요(보상도 받아요). */
function finish(state: GameState, ...chapters: string[]): GameState {
  for (const id of chapters) for (const p of ch(id).parts) for (const m of p.missions) state.completeMission(m.id, ok);
  return state;
}
const fresh = () => new GameState(freshSave('별빛'));

function door(id: string) {
  const o = MAPS.village.objects.find((x) => x.id === id);
  if (o?.type !== 'portal') throw new Error(`마을에 ${id} 문이 없어요`);
  return o;
}
const gate = (s: GameState, unlock: ClassUnlock, id: string) => portalGate(s, unlock, 'village', door(id));
const done = (s: GameState) => (id: string) => s.missionDone(id);

describe('체험 모드(학급 없음): 지금처럼 앞 장을 끝내면 차례로 열려요', () => {
  it('모든 장이 길에 있고, 앞 장을 끝내야 문이 열리며 건너뛰기는 없어요', () => {
    expect(ids(classPath(null))).toEqual(ids([...CHAPTERS]));
    const s = fresh();
    expect(gate(s, null, 'to-ch3')).toEqual({ open: false, text: door('to-ch3').lockedText });
    finish(s, 'ch0', 'ch1', 'ch2');
    expect(gate(s, null, 'to-ch3')).toEqual({ open: true });
    expect(gate(s, null, 'to-ch4').open).toBe(false);
    for (const c of CHAPTERS.filter((x) => x.index >= 2)) {
      expect(chapterGate(s.data, null, c, false), c.id).toEqual({ open: false, reason: 'previous' });
      expect(startsDirectly(null, c), c.id).toBe(false);
    }
  });

  it('목표 안내는 0장부터 차례로 이어져요', () => {
    const s = fresh();
    expect(objective(s)).toBe(objective(s, null));
    finish(s, 'ch0', 'ch1');
    expect(objective(s)).toBe('마을 동쪽 다리를 건너 반복의 동굴로 가요.');
    expect(currentChapter(null, done(s)).id).toBe('ch2');
  });
});

describe('학급: 선생님이 연 장까지만 들어가요', () => {
  it('연 장이 없으면 0·1장만 열리고, 1장을 끝내도 2장 문은 닫혀 있어요', () => {
    expect(ids(classPath([]))).toEqual(['ch0', 'ch1']);
    const s = finish(fresh(), 'ch0', 'ch1');
    expect(gate(s, [], 'to-ch2')).toEqual({ open: false, text: LOCKED_BY_TEACHER });
    expect(objective(s, [])).toBe('마을의 프롬프트 공방도 미리 해 봐요.');
    s.completeMission('ch7-p2-m1', ok);
    s.completeMission('ch7-p2-m2', ok);
    expect(objective(s, [])).toBe('다음 장은 선생님이 열어 주시면 갈 수 있어요.');
    // 체험 모드라면 같은 학생에게 2장이 열려 있어요.
    expect(gate(s, null, 'to-ch2').open).toBe(true);
  });

  it('3·4학년(2·3장): 열린 장 안에서는 차례로 가고, 4장은 닫혀요', () => {
    const unlock = ['ch2', 'ch3'];
    expect(ids(classPath(unlock))).toEqual(['ch0', 'ch1', 'ch2', 'ch3']);
    expect(CHAPTERS.filter((c) => startsDirectly(unlock, c))).toEqual([]);
    const s = finish(fresh(), 'ch0');
    expect(gate(s, unlock, 'to-ch2')).toEqual({ open: false, text: door('to-ch2').lockedText });
    expect(gate(s, unlock, 'to-ch3')).toEqual({ open: false, text: door('to-ch3').lockedText });
    finish(s, 'ch1');
    expect(gate(s, unlock, 'to-ch2')).toEqual({ open: true });
    finish(s, 'ch2');
    expect(gate(s, unlock, 'to-ch3')).toEqual({ open: true });
    finish(s, 'ch3');
    expect(gate(s, unlock, 'to-ch4')).toEqual({ open: false, text: LOCKED_BY_TEACHER });
  });

  it('5학년(3~5장): 마을 연습 뒤 3장부터 바로 시작하고, 4·5장은 차례로, 6장은 닫혀요', () => {
    const unlock = ['ch5', 'ch3', 'ch4'];
    expect(ids(classPath(unlock))).toEqual(['ch0', 'ch3', 'ch4', 'ch5']);
    expect(ids(CHAPTERS.filter((c) => startsDirectly(unlock, c)))).toEqual(['ch3']);
    const s = fresh();
    expect(gate(s, unlock, 'to-ch3')).toEqual({ open: false, text: LOCKED_BY_TUTORIAL });
    expect(currentChapter(unlock, done(s)).id).toBe('ch0');
    finish(s, 'ch0');
    expect(tutorialDone(s.data)).toBe(true);
    expect(gate(s, unlock, 'to-ch3')).toEqual({ open: true, skip: ch('ch3') });
    expect(objective(s, unlock)).toBe(`${MAPS.desert.name} 입구로 가요.`);
    expect(currentChapter(unlock, done(s)).id).toBe('ch3');
    expect(gate(s, unlock, 'to-ch4')).toEqual({ open: false, text: door('to-ch4').lockedText });
    expect(gate(s, unlock, 'to-ch6')).toEqual({ open: false, text: LOCKED_BY_TEACHER });
    finish(s, 'ch3');
    expect(gate(s, unlock, 'to-ch4')).toEqual({ open: true });
    finish(s, 'ch4', 'ch5');
    expect(currentChapter(unlock, done(s)).id).toBe('ch5');
    expect(gate(s, unlock, 'to-ch6')).toEqual({ open: false, text: LOCKED_BY_TEACHER });
  });

  it('6학년(5~8장): 5장부터 바로 시작해요', () => {
    const unlock = ['ch5', 'ch6', 'ch7', 'ch8'];
    expect(ids(classPath(unlock))).toEqual(['ch0', 'ch5', 'ch6', 'ch7', 'ch8']);
    const s = finish(fresh(), 'ch0');
    expect(gate(s, unlock, 'to-ch5')).toEqual({ open: true, skip: ch('ch5') });
    expect(gate(s, unlock, 'to-ch6').open).toBe(false);
  });

  it('앞 장을 이미 끝낸 학생은 건너뛰기가 아니에요(준비물 없이 들어가요)', () => {
    const s = finish(fresh(), 'ch0', 'ch1', 'ch2');
    expect(gate(s, ['ch3'], 'to-ch3')).toEqual({ open: true });
  });

  it('선생님이 앞 장을 닫으면 다음 장부터 바로 이어 가요', () => {
    // 3장을 하다가 선생님이 3장을 닫고 4장을 열었어요.
    const s = finish(fresh(), 'ch0');
    expect(gate(s, ['ch4'], 'to-ch4')).toEqual({ open: true, skip: ch('ch4') });
    expect(gate(s, ['ch4'], 'to-ch3')).toEqual({ open: false, text: LOCKED_BY_TEACHER });
  });

  it('뒤의 장부터 바로 들어가면 그 장 안에서는 그 장을, 마을에서는 길 순서대로 안내해요', () => {
    // 3·4·5장과 7장을 연 학급: 7장은 6장이 닫혀 있어서 바로 시작할 수 있어요.
    const unlock = ['ch3', 'ch4', 'ch5', 'ch7'];
    const s = finish(fresh(), 'ch0');
    expect(gate(s, unlock, 'to-ch7')).toEqual({ open: true, skip: ch('ch7') });
    expect(objective(s, unlock)).toBe(`${MAPS.desert.name} 입구로 가요.`);
    s.setLocation('workshop', 2, 13);
    expect(objective(s, unlock)).not.toContain(MAPS.desert.name);
    // 6장까지 차례로 끝내고 공방에 온 체험 모드 학생과 같은 안내예요.
    const inOrder = finish(fresh(), 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6');
    inOrder.setLocation('workshop', 2, 13);
    expect(objective(s, unlock)).toBe(objective(inOrder, null));
    expect(currentChapter(unlock, done(s), 'ch7').id).toBe('ch7');
    expect(currentChapter(unlock, done(s), 'ch0').id).toBe('ch3');
    // 길에 없는 장(1장 숲)에 있으면 길 순서를 따라요.
    expect(currentChapter(unlock, done(s), 'ch1').id).toBe('ch3');
  });

  it('모르는 장 이름은 무시해요', () => {
    expect(ids(classPath(['ch9', 'hello']))).toEqual(['ch0', 'ch1']);
  });

  it('장 입구 문만 학급 규칙을 따르고, 장 안의 문은 그대로예요', () => {
    expect(entryChapter('village', door('to-ch3'))?.id).toBe('ch3');
    expect(entryChapter('village', door('to-forest'))).toBeUndefined();
    const back = MAPS.cavedeep.objects.find((o) => o.id === 'to-cave');
    if (back?.type !== 'portal') throw new Error('to-cave');
    expect(entryChapter('cavedeep', back)).toBeUndefined();
    expect(portalGate(fresh(), [], 'cavedeep', back)).toEqual({ open: true });
  });
});

/** 앞 장들의 미션·몹·상자 경험치(성장 곡선 테스트와 같은 셈) */
function xpOf(chapters: Chapter[], skipBoss = false): number {
  let xp = 0;
  for (const c of chapters) {
    for (const p of c.parts) if (!(skipBoss && p.kind === 'boss')) for (const m of p.missions) xp += m.reward?.xp ?? 0;
    for (const def of Object.values(MAPS).filter((d) => d.chapter === c.id)) {
      for (const o of def.objects) {
        if (o.type === 'mob') xp += MOBS[o.mob].xp;
        if (o.type === 'chest') xp += o.reward.xp ?? 0;
      }
    }
  }
  return xp;
}

describe('건너뛰기 보정: 앞 장의 로비 부품·장비·레벨', () => {
  it('준비물은 앞 장들을 차례로 했을 때와 같고, 그 장의 부품은 주지 않아요', () => {
    for (const c of CHAPTERS.filter((x) => x.index >= 2)) {
      const kit = skipKit(c);
      const before = CHAPTERS.filter((x) => x.index < c.index);
      expect(kit.xp, c.id).toBe(xpOf(before));
      expect(kit.parts, c.id).toEqual(before.flatMap((x) => (x.robiPart ? [x.robiPart] : [])));
      expect(kit.parts, c.id).not.toContain(c.robiPart);
    }
    expect(new Set(skipKit(ch('ch6')).items)).toEqual(new Set(['rangerhat', 'brush', 'dataVest', 'researchBoots', 'glasses', 'flowmap']));
    expect(new Set(skipKit(ch('ch3')).items)).toEqual(new Set(['leafhat', 'brush', 'cloak', 'windboots', 'glasses', 'flowmap']));
  });

  it('준비물과 그 장 본편만으로 그 장 보스의 권장 레벨에 닿아요', () => {
    for (const c of CHAPTERS.filter((x) => x.index >= 3)) {
      const boss = Object.values(MOBS).find((m) => m.chapter === c.id && m.boss);
      if (!boss) continue;
      expect(levelForXp(skipKit(c).xp + xpOf([c], true)), `${c.id} ${boss.id}`).toBeGreaterThanOrEqual(boss.recommendedLevel);
    }
  });

  it('모자란 것만 채우고, 배지·마을 복구·장 완료 기록은 주지 않아요', () => {
    const s = finish(fresh(), 'ch0');
    const kit = skipKit(ch('ch6'));
    const got = applySkipKit(s, ch('ch6'));
    expect(got?.parts).toEqual(['wheel', 'memoryChip', 'sensor', 'dataLens', 'learningChip']);
    expect(s.data.level).toBe(levelForXp(kit.xp));
    expect(s.data.xp).toBe(kit.xp);
    expect(s.data.equipment).toEqual({ hat: 'rangerhat', tool: 'brush', outfit: 'dataVest', shoes: 'researchBoots', charm: 'glasses' });
    expect(s.data.hp).toBe(s.stats.maxHp);
    expect(s.data.badges).toEqual([]);
    expect(Object.keys(s.data.flags).filter((f) => f.endsWith('-clear') || f.startsWith('village-restore'))).toEqual([]);
    expect(applySkipKit(s, ch('ch6'))).toBeNull();
  });

  it('이미 더 좋은 장비와 더 많은 경험치가 있으면 그대로 둬요', () => {
    const s = finish(fresh(), 'ch0');
    s.addXp(5000);
    s.addItem('starCap');
    s.equip('starCap');
    const xp = s.data.xp;
    const got = applySkipKit(s, ch('ch5'));
    expect(s.data.xp).toBe(xp);
    expect(got?.xp).toBe(0);
    expect(s.data.equipment.hat).toBe('starCap');
    expect(s.data.equipment.tool).toBe('brush');
  });

  describe('6장 보스 별여우: 레벨이 모자라면 맞는 프로그램으로도 못 이겨요', () => {
    const cards = (...cs: BattleCmd[]): Block[] => cs.map((c) => ({ t: 'cmd', cmd: c }));
    const repeat = (times: number, body: Block[]): Block[] => [{ t: 'repeat', times, body }];
    const observe = repeat(12, cards('guard'));
    const forecastProgram = repeat(12, [{ t: 'if', cond: 'forecastRisk', yes: cards('guard'), no: cards('attack') }]);
    const fight = (save: SaveData, seed: number) => {
      const stats = derivedStats(save);
      const b = new Battle({ stats, hp: stats.maxHp, slots: programSlots(save), mob: { ...MOBS.starFox, forecastPattern: { seed } }, forecast: true });
      b.runRound(observe);
      while (b.outcome === 'continue') b.runRound(forecastProgram);
      return b.outcome;
    };
    /** 6장 예측 모듈은 6장 안(ch6-p3)에서 받아요. */
    const withPredict = (s: GameState) => (s.applyReward({ robiPart: 'predictModule' }), s.data);

    it('6장부터 바로 시작해 준비물을 받으면 이겨요', () => {
      const s = finish(fresh(), 'ch0');
      applySkipKit(s, ch('ch6'));
      for (let seed = 1; seed <= 10; seed++) expect(fight(withPredict(s), seed), `seed ${seed}`).toBe('win');
    });

    it('준비물이 없으면(마을 연습만 한 레벨) 이기지 못해요', () => {
      const s = finish(fresh(), 'ch0');
      for (let seed = 1; seed <= 10; seed++) expect(fight(withPredict(s), seed), `seed ${seed}`).not.toBe('win');
    });
  });
});
