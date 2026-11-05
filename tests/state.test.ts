import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import { levelForXp, xpForLevel } from '../src/data/rpg/levels';
import type { PromptData } from '../src/data/schema';
import { GameState, freshSave } from '../src/game/rpg/state';
import { evaluatePrompt } from '../src/missions/prompt/evaluate';

describe('레벨 곡선', () => {
  it('누적 경험치와 레벨이 서로 맞아요', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(4)).toBe(120);
    for (let l = 1; l <= 20; l++) {
      expect(levelForXp(xpForLevel(l))).toBe(l);
      if (l > 1) expect(levelForXp(xpForLevel(l) - 1)).toBe(l - 1);
    }
  });
});

describe('게임 상태', () => {
  it('경험치로 레벨이 오르면 체력도 늘어요', () => {
    const s = new GameState(freshSave('별빛'));
    const ups = s.addXp(75);
    expect(ups).toEqual([2, 3]);
    expect(s.data.level).toBe(3);
    expect(s.stats.maxHp).toBe(30);
    expect(s.data.hp).toBe(30);
  });

  it('장비를 착용하면 능력치가 바뀌고, 없는 아이템은 착용할 수 없어요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(s.equip('stick')).toBe(false);
    s.addItem('stick');
    expect(s.equip('stick')).toBe(true);
    expect(s.stats.atk).toBe(4);
    s.unequip('tool');
    expect(s.stats.atk).toBe(3);
  });

  it('설정(소리 크기)을 바꾸면 저장 데이터에 남고 변경을 알려요', () => {
    const s = new GameState(freshSave('별빛'));
    let changes = 0;
    s.on((e) => {
      if (e.type === 'change') changes++;
    });
    s.updateSettings({ volume: 1 });
    expect(s.data.settings).toEqual({ sound: true, volume: 1 });
    expect(changes).toBe(1);
  });

  it('디버그 안경은 장착해야, 순서도 지도는 가지고만 있어도 도와줘요', () => {
    const s = new GameState(freshSave('별빛'));
    s.addItem('glasses');
    s.addItem('flowmap');
    expect(s.helpers).toEqual({ debugGlasses: false, flowMap: true });
    s.equip('glasses');
    expect(s.helpers.debugGlasses).toBe(true);
  });

  it('미션 보상은 처음 성공할 때만 받고, 별은 가장 좋은 기록을 남겨요', () => {
    const s = new GameState(freshSave('별빛'));
    const first = s.completeMission('ch0-m4', { success: true, stars: 2, attempts: 1, hints: 0 });
    expect(first.reward?.items.map((i) => i.id)).toEqual(['cap', 'stick', 'apple']);
    expect(s.itemQty('apple')).toBe(2);
    const again = s.completeMission('ch0-m4', { success: true, stars: 3, attempts: 1, hints: 1 });
    expect(again.reward).toBeUndefined();
    expect(s.itemQty('apple')).toBe(2);
    expect(s.data.missions['ch0-m4']).toMatchObject({ stars: 3, attempts: 2, hints: 1, done: true });
  });

  it('파트의 미션은 순서대로 열려요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(s.nextMissionOf('ch1-p1')).toBe('ch1-p1-m1');
    s.completeMission('ch1-p1-m1', { success: true, stars: 3, attempts: 1, hints: 0 });
    expect(s.nextMissionOf('ch1-p1')).toBe('ch1-p1-m2');
    expect(s.partDone('ch1-p1')).toBe(false);
  });

  it('1장 보스 보상으로 로비 부품·배지·마을 복구 플래그를 받아요', () => {
    const s = new GameState(freshSave('별빛'));
    const slotsBefore = s.slots;
    s.completeMission('ch1-boss-m3', { success: true, stars: 3, attempts: 1, hints: 0 });
    expect(s.data.robiParts).toContain('wheel');
    expect(s.data.badges).toContain('badge-1');
    expect(s.hasFlag('village-restore-1')).toBe(true);
    expect(s.slots).toBe(slotsBefore + 1);
  });
});

describe('프롬프트 평가(젠)', () => {
  const data = (() => {
    const m = getMission('ch7-p2-m1')?.mission;
    if (m?.kind !== 'prompt' || !m.data) throw new Error('no prompt');
    return m.data as PromptData;
  })();

  it('4칸을 모두 잘 채우면 별 3개, 쉬운 글이 나와요', () => {
    const o = evaluatePrompt(data, { role: 'dentist', task: 'why', how: 'easy', format: 'list' });
    expect(o).toMatchObject({ success: true, stars: 3, score: 8, render: 'list' });
    expect(o.lines[0]).toBe('이가 썩지 않게 지켜 줘요.');
    expect(o.issues).toEqual([]);
  });

  it('"어떻게"를 비우면 어렵고 긴 글이 나오고 이유를 알려 줘요', () => {
    const o = evaluatePrompt(data, { role: 'dentist', task: 'why', format: 'list' });
    expect(o.lines[0]).toContain('법랑질');
    expect(o.issues.map((i) => [i.slot, i.kind])).toEqual([['how', 'missing']]);
    expect(o.success).toBe(true);
    expect(o.stars).toBe(1);
  });

  it('할 일이 엉뚱하면 실패하고, 개인정보를 넣으면 먼저 알려 줘요', () => {
    expect(evaluatePrompt(data, { role: 'dentist', task: 'story', how: 'easy', format: 'list' }).success).toBe(false);
    const p = evaluatePrompt(data, { role: 'dentist', task: 'why', how: 'private', format: 'list' });
    expect(p.privacy).toBe(true);
    expect(p.success).toBe(false);
    expect(p.issues[0].kind).toBe('privacy');
  });

  it('아무것도 고르지 않으면 기본 문장과 한 덩어리 모양이 나와요', () => {
    const o = evaluatePrompt(data, {});
    expect(o.opening).toBe(data.fallback.opening);
    expect(o.lines).toEqual(data.fallback.body);
    expect(o.render).toBe('paragraph');
    expect(o.issues).toHaveLength(4);
  });
});


it('메모리 칩은 반복을 열고 슬롯을 늘리지 않아요', () => {
  const state = new GameState(freshSave('별빛'));
  state.addXp(500);
  const slots = state.slots;
  state.completeMission('ch2-p2-m3', { success: true, stars: 3, attempts: 1, hints: 0 });
  expect(state.data.robiParts).toContain('memoryChip');
  expect(state.data.robiParts.some(id => ROBI_PARTS[id].unlocks.repeat)).toBe(true);
  expect(state.slots).toBe(slots);
});


it('센서를 받으면 강타 조건을 열고 슬롯은 그대로예요', () => {
  const state=new GameState(freshSave('별빛'));state.addXp(500);const before=state.slots;
  state.completeMission('ch3-p2-m3',{success:true,stars:3,attempts:1,hints:0});
  expect(state.data.robiParts).toContain('sensor');expect(ROBI_PARTS.sensor.unlocks.conds).toContain('enemySmash');expect(state.slots).toBe(before);
});
