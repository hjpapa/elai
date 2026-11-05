import Phaser from 'phaser';
import { ITEMS } from '../../data/rpg/items';
import { MOBS } from '../../data/rpg/mobs';
import { ROBI_PARTS } from '../../data/rpg/robiParts';
import { MAPS } from '../../data/maps';
import type { BattleCmd, Block, Mission, MobAction } from '../../data/schema';
import { app } from '../../game/app';
import { Battle, CARD_COST, programCost, type TickEvent } from '../../game/battle/sim';
import type { BattleScene, BattleSceneData } from '../../game/scenes/BattleScene';
import { currentMusic, playMusic, playSfx } from '../../fx/sfx';
import { clear, h, lines, sleep } from '../../ui/dom';
import { icon, pxImg } from '../../ui/icons';
import { CMD_LABEL, INTENT_LABEL, cmdIcon, intentIcon } from '../../ui/labels';
import { cmdKind, ProgramEditor } from '../../ui/programEditor';
import { playerLook } from '../../ui/portraits';
import type { MissionResult, Stars } from '../core/types';

export interface BattleOptions {
  intro?: string;
  hint?: string;
  /** 첫 라운드에 미리 들어 있는 카드(버그 벌레) */
  prefill?: Block[];
  canFlee?: boolean;
  floor?: BattleSceneData['floor'];
}

export interface BattleReport {
  outcome: 'win' | 'lose' | 'timeout' | 'flee';
  rounds: number;
  hints: number;
  /** 받은 피해 합계 */
  taken: number;
  maxHp: number;
}

const CARDS: BattleCmd[] = ['attack', 'guard', 'heal', 'wait'];
const TICK_MS = 260;

function feedbackFor(ticks: TickEvent[]): { index: number; text: string } | null {
  for (const t of ticks) {
    if (t.classification?.actual === 'friend' && t.card === 'attack') return { index: t.tick, text: '친구를 잘못 골랐어요.\n학습 예시와 이름표를 살펴봐요.' };
    if (t.taken > 0 && t.mobAction === 'smash') return { index: t.tick, text: '강타를 막지 못했어요!\n강타 예고 칸에는 막기를 놓아요.' };
    if (t.taken > 0) return { index: t.tick, text: '공격 예고 칸에 막기를 놓으면\n다치지 않아요.' };
    if (t.blocked) return { index: t.tick, text: '몹이 막을 때는 공격이 통하지 않아요.\n그때는 쉬거나 회복해요.' };
    if (t.wanted) return { index: t.tick, text: '에너지가 모자라서 카드가 쉬기로 바뀌었어요.' };
  }
  return null;
}

/** 전투 한 판: Battle 장면(연출) + DOM 전투 화면(카드 놓기). 끝나면 결과를 돌려줘요. */
export async function runBattle(mobId: string, opts: BattleOptions = {}): Promise<BattleReport> {
  const mob = MOBS[mobId];
  const s = app.state;
  const stats = s.stats;
  const battle = new Battle({ stats, hp: s.data.hp, slots: s.slots, mob, observations: s.data.observations?.[mobId], classificationModel: s.data.classificationModel });
  const battleCards: BattleCmd[] = s.data.robiParts.some(id => ROBI_PARTS[id]?.unlocks.cards?.includes('scan')) ? [...CARDS, 'scan'] : CARDS;
  const repeatUnlocked = s.data.robiParts.some(id => ROBI_PARTS[id]?.unlocks.repeat);
  const conditions = [...new Set(s.data.robiParts.flatMap(id => ROBI_PARTS[id]?.unlocks.conds ?? []))];
  const programMode = repeatUnlocked || conditions.length > 0;
  const editor = programMode ? new ProgramEditor({ palette: battleCards, allowRepeat: repeatUnlocked, allowIf: conditions, maxBlocks: s.slots, maxRepeat: battle.ticksPerRound, costs: CARD_COST }, opts.prefill) : null;
  editor?.el.classList.add('inline');
  const sm = app.game.scene;
  const worldOn = sm.isActive('World');
  if (worldOn) sm.pause('World');
  app.ui.hud.hidden = true;
  const prevMusic = currentMusic();
  playMusic('battle');

  const scene = sm.getScene('Battle') as BattleScene;
  const ready = new Promise<void>((r) => scene.events.once(Phaser.Scenes.Events.CREATE, () => r()));
  sm.run('Battle', { mob, save: s.data, floor: opts.floor ?? (MAPS[s.data.location.map]?.theme === 'cave' ? 'tile-cave' : MAPS[s.data.location.map]?.theme === 'desert' ? 'tile-sand' : MAPS[s.data.location.map]?.theme === 'harbor' ? 'tile-dock' : MAPS[s.data.location.map]?.theme === 'lab' ? 'tile-lab' : 'tile-grass') } satisfies BattleSceneData);
  await ready;

  // ── DOM ──
  const mobHp = h('div', { class: 'bar hp' }, h('i'), h('span'));
  const top = h(
    'div',
    { class: 'battle-top' },
    h('div', { class: 'row' }, pxImg(icon(mob.sprite, 0), mob.size === 48 ? 56 : 40), h('div', { class: 'grow' }, h('h3', {}, mob.name, mob.boss ? ' · 보스' : ''), mobHp)),
  );
  const myHp = h('div', { class: 'bar hp' }, h('i'), h('span'));
  const myEn = h('div', { class: 'bar en' }, h('i'), h('span'));
  const grid = h('div', { class: 'ticks' });
  const palette = h('div', { class: 'palette' });
  const recordTable = h('table', { class: 'observation-table' });
  const records = h('details', { class: 'battle-records', hidden: !mob.dataPattern }, h('summary', {}, '관찰 기록 보기'), recordTable);
  const say = h('div', { class: 'robi-say' });
  const runBtn = h('button', { class: 'btn primary' }, '▶ 실행');
  const hintBtn = h('button', { class: 'btn accent' }, pxImg(icon('icon-hint'), 22), '힌트');
  const appleBtn = h('button', { class: 'btn small' });
  const jellyBtn = h('button', { class: 'btn small' });
  const fleeBtn = h('button', { class: 'btn small ghost', hidden: !opts.canFlee }, '도망가기');
  const bottom = h(
    'div',
    { class: 'battle-bottom' + (programMode ? ' program-mode' : '') },
    h('div', { class: 'fighters' }, pxImg(playerLook(s.data), 40), h('div', { class: 'grow' }, myHp, myEn)),
    grid,
    h('div', { style: 'height:8px' }),
    editor?.el ?? palette,
    records,
    h('div', { style: 'height:8px' }),
    say,
    h('div', { class: 'row end', style: 'margin-top:8px' }, fleeBtn, appleBtn, jellyBtn, hintBtn, runBtn),
  );
  app.ui.dock.append(top, bottom);

  const talk = (text: string, mood = '') => {
    say.className = `robi-say ${mood}`;
    clear(say);
    say.append(pxImg(icon('char-robi', 0), 36), h('div', {}, ...lines(text)));
  };
  const setBar = (bar: HTMLElement, v: number, max: number, label: string) => {
    (bar.firstChild as HTMLElement).style.width = `${Math.max(0, v / max) * 100}%`;
    (bar.lastChild as HTMLElement).textContent = label;
  };

  const refreshRecords = () => {
    clear(recordTable);
    recordTable.append(h('thead', {}, h('tr', {}, h('th', {}, '물결'), h('th', {}, '관찰한 행동'))));
    const rows = s.data.observations?.[mobId] ?? [];
    const body = h('tbody');
    if (!rows.length) body.append(h('tr', {}, h('td', { colspan: 2 }, '살펴보기로 기록을 모아요.')));
    for (const row of rows) body.append(h('tr', {}, h('td', {}, String(row.value)), h('td', {}, INTENT_LABEL[row.action])));
    recordTable.append(body);
  };
  refreshRecords();

  let slots: (BattleCmd | null)[] = [];
  let cursor = 0;
  let hints = 0;
  let taken = 0;
  let busy = false;
  let firstRound = true;

  const program = (): Block[] => editor?.value ?? slots.map(c => ({ t: 'cmd', cmd: c ?? 'wait' }));
  const energyUse = () => programCost(program());
  const refreshBars = () => {
    setBar(mobHp, battle.mobHp, mob.hp, `${battle.mobHp} / ${mob.hp}`);
    setBar(myHp, battle.playerHp, stats.maxHp, `체력 ${battle.playerHp} / ${stats.maxHp}`);
    const use = energyUse();
    setBar(myEn, battle.energy - use, battle.energy, `에너지 ${battle.energy - use} / ${battle.energy}`);
    myEn.classList.toggle('over', use > battle.energy);
    appleBtn.textContent = `사과 ${s.itemQty('apple')}`;
    appleBtn.prepend(pxImg(icon(ITEMS.apple.icon), 20));
    appleBtn.disabled = busy || s.itemQty('apple') === 0 || battle.playerHp >= stats.maxHp;
    jellyBtn.textContent = `젤리 ${s.itemQty('jelly')}`;
    jellyBtn.prepend(pxImg(icon(ITEMS.jelly.icon), 20));
    jellyBtn.disabled = busy || s.itemQty('jelly') === 0;
    runBtn.disabled = busy;
    editor?.setLocked(busy);
    hintBtn.disabled = busy;
  };

  /** 실행 중에는 이번 라운드에 몹이 실제로 한 행동을 보여 줘요(계산이 이미 다음 라운드로 넘어가 있어서). */
  let shownIntents: (MobAction | null)[] | null = null;
  let revealedTicks = 0;
  let shownValues: (number | null)[] | null = null;
  let shownFeatures: (number[] | null)[] | null = null;
  let shownPredictions: (string | null)[] | null = null;
  let shownTicks: TickEvent[] | null = null;
  const renderGrid = (marks: Map<number, 'run' | 'err'> = new Map()) => {
    const n = battle.ticksPerRound;
    const intents = shownIntents ?? battle.displayIntents(n);
    grid.style.gridTemplateColumns = `56px repeat(${n}, minmax(40px, 1fr))`;
    clear(grid);
    grid.append(h('div', { class: 'muted', style: 'align-self:center' }, mob.name.length > 4 ? '몹' : mob.name));
    const values = shownValues ?? battle.values(n);
    const features = shownFeatures ?? battle.features(n);
    const predictions = shownPredictions ?? battle.predictions(n);
    intents.forEach((a, i) => grid.append(a === null
      ? features[i]
        ? h('div', { class: 'intent unknown', 'aria-label': '뛰는 높이 ' + features[i]?.[0] + ', 점무늬 수 ' + features[i]?.[1] },
          h('span', {}, '높이 ' + features[i]?.[0]), h('span', {}, '점 ' + features[i]?.[1]),
          h('small', {}, '내 모델: ' + (predictions[i] === 'playful' ? '장난' : predictions[i] === 'friend' ? '친구' : '미학습')))
        : h('div', { class: 'intent unknown', 'aria-label': values[i] === null ? '실행할 때 알 수 있어요' : '물결 ' + values[i] }, values[i] === null ? '?' : '물결 ' + values[i])
      : h('div', { class: 'intent ' + a }, pxImg(icon(intentIcon(a)), 32), INTENT_LABEL[a])));
    grid.append(h('div', { class: 'muted', style: 'align-self:center' }, editor ? '미리 보기' : '나'));
    if (editor) {
      const preview = shownTicks
        ? Array.from({ length: n }, (_, i) => (mob.hiddenPattern || mob.dataPattern || mob.classifyPattern) && i >= revealedTicks ? null : shownTicks?.[i] ?? null)
        : battle.preview(editor.value);
      for (let i = 0; i < n; i++) {
        const t = preview[i];
        if (!t && (mob.hiddenPattern || mob.dataPattern || mob.classifyPattern)) {
          grid.append(h('div', { class: 'tick' }, h('div', { class: 'bslot unknown', 'aria-label': (i + 1) + '번째: 실행하며 결정' }, '?', h('small', {}, '실행하며 결정'))));
          continue;
        }
        const card = t?.card ?? 'wait';
        const cell = h('div', { class: ['bslot filled', cmdKind(card), t?.path == null ? 'empty' : '', t?.wanted ? 'err' : '', marks.get(i) ?? ''].join(' '),
          'aria-label': (i + 1) + '번째 미리 보기: ' + CMD_LABEL[card], title: t?.wanted ? '에너지가 모자라 쉬어요' : CMD_LABEL[card] },
          pxImg(icon(cmdIcon(card)), 30), CMD_LABEL[card]);
        grid.append(h('div', { class: 'tick' }, cell));
        if (marks.get(i) === 'run') cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      return;
    }
    for (let i = 0; i < n; i++) {
      const c = slots[i];
      const mark = marks.get(i);
      const slot = h(
        'button',
        {
          class: `bslot ${c ? `filled ${cmdKind(c)}` : ''} ${i === cursor && !busy ? 'cur' : ''} ${mark ?? ''}`,
          'aria-label': `${i + 1}번째 칸`,
          onclick: () => {
            if (busy) return;
            cursor = i;
            renderGrid();
          },
        },
        c ? pxImg(icon(cmdIcon(c)), 30) : null,
        c ? CMD_LABEL[c] : `${i + 1}`,
      );
      if (c && !busy) {
        slot.append(
          h(
            'button',
            {
              class: 'x',
              'aria-label': '카드 빼기',
              onclick: (e: Event) => {
                e.stopPropagation();
                slots[i] = null;
                cursor = i;
                renderGrid();
                refreshBars();
              },
            },
            '✕',
          ),
        );
      }
      grid.append(h('div', { class: 'tick' }, slot));
    }
  };

  const renderPalette = () => {
    clear(palette);
    for (const c of battleCards) {
      palette.append(
        h(
          'button',
          {
            class: `pblock ${cmdKind(c)}`,
            onclick: () => {
              if (busy) return;
              slots[cursor] = c;
              playSfx('click');
              const next = slots.findIndex((x, i) => i > cursor && !x);
              cursor = next >= 0 ? next : Math.min(cursor + 1, battle.ticksPerRound - 1);
              renderGrid();
              refreshBars();
            },
          },
          pxImg(icon(cmdIcon(c)), 28),
          CMD_LABEL[c],
          h('span', { class: 'cost' }, `에너지 ${CARD_COST[c]}`),
        ),
      );
    }
  };

  const newRound = () => {
    slots = Array(battle.ticksPerRound).fill(null);
    if (firstRound && opts.prefill) {
      opts.prefill.forEach((b, i) => {
        if (b.t === 'cmd' && i < slots.length) slots[i] = b.cmd as BattleCmd;
      });
    }
    firstRound = false;
    cursor = Math.max(0, slots.indexOf(null));
    renderGrid();
    refreshBars();
  };

  editor?.onChange(() => { renderGrid(); refreshBars(); });

  appleBtn.addEventListener('click', () => {
    if (busy || !s.removeItem('apple')) return;
    battle.healPlayer(ITEMS.apple.effect?.heal ?? 10);
    playSfx('heal');
    renderGrid();
    refreshBars();
  });
  jellyBtn.addEventListener('click', () => {
    if (busy || !s.removeItem('jelly')) return;
    battle.addEnergy(ITEMS.jelly.effect?.energy ?? 2);
    playSfx('item');
    talk('에너지가 늘었어요!\n이번 차례에 더 쓸 수 있어요.', 'good');
    renderGrid();
    refreshBars();
  });
  hintBtn.addEventListener('click', () => {
    hints++;
    talk(`힌트: ${opts.hint ?? '몹의 예고를 보고, 공격·강타에는 막기, 나머지에는 공격을 놓아 봐요.'}`, 'hint');
  });

  renderPalette();
  newRound();
  talk(opts.intro ?? `${mob.name}의 예고를 보고 카드를 놓아요.\n준비되면 ▶ 실행!`);

  const outcome = await new Promise<BattleReport['outcome']>((resolve) => {
    fleeBtn.addEventListener('click', () => !busy && resolve('flee'));
    runBtn.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      refreshBars();
      renderGrid();
      shownIntents = battle.displayIntents();
      shownValues = battle.values();
      shownFeatures = battle.features();
      shownPredictions = battle.predictions();
      revealedTicks = 0;
      const result = battle.runRound(program());
      shownTicks = result.ticks;

      let shownMobHp = battle.mobHp + result.ticks.reduce((n, t) => n + t.dealt - t.mobHealed, 0);
      let shownHp = battle.playerHp + result.ticks.reduce((n, t) => n + t.taken - t.healed, 0);
      for (const t of result.ticks) {
        revealedTicks = t.tick + 1;
        shownIntents[t.tick] = t.mobAction;
        renderGrid(new Map([[t.tick, 'run']]));
        editor?.highlight(t.path);
        await scene.playerAct(t.card, t.dealt, t.blocked, t.healed);
        playSfx(t.card === 'attack' ? (t.blocked ? 'guard' : 'hit') : t.card === 'heal' ? 'heal' : t.card === 'guard' ? 'guard' : 'click');
        shownMobHp -= t.dealt;
        shownHp += t.healed;
        setBar(mobHp, shownMobHp, mob.hp, `${shownMobHp} / ${mob.hp}`);
        if (t.mobHp > 0 || t.dealt === 0) {
          await scene.mobAct(t.mobAction, t.taken, t.guarded, t.mobHealed);
          if (t.taken) playSfx('hit');
          shownHp -= t.taken;
          shownMobHp += t.mobHealed;
        }
        if (t.observation) { s.recordObservations(mobId, [t.observation]); refreshRecords(); }
        taken += t.taken;
        setBar(myHp, shownHp, stats.maxHp, `체력 ${shownHp} / ${stats.maxHp}`);
        setBar(mobHp, shownMobHp, mob.hp, `${shownMobHp} / ${mob.hp}`);
        await sleep(TICK_MS);
      }
      if (result.outcome === 'win') {
        await scene.purify();
        playSfx('purify');
        resolve('win');
        return;
      }
      if (result.outcome !== 'continue') {
        await scene.faint();
        resolve(result.outcome);
        return;
      }
      const fb = feedbackFor(result.ticks);
      if (fb) {
        const glasses = s.helpers.debugGlasses;
        if (glasses && editor) editor.highlight(result.ticks[fb.index]?.path ?? null, 'err');
        renderGrid(glasses ? new Map([[fb.index, 'err']]) : new Map());
        talk(fb.text, 'bad');
        await sleep(1400);
      } else talk('잘했어요! 다음 예고를 보고 또 카드를 놓아요.', 'good');
      busy = false;
      shownIntents = null;
      shownValues = null;
      shownFeatures = null;
      shownPredictions = null;
      shownTicks = null;
      revealedTicks = 0;
      editor?.highlight(null);
      newRound();
    });
  });

  // ── 정리 ──
  top.remove();
  bottom.remove();
  sm.stop('Battle');
  if (worldOn) sm.resume('World');
  app.ui.hud.hidden = false;
  playMusic(prevMusic);

  if (outcome === 'win' || outcome === 'flee') s.setHp(battle.playerHp);
  else s.fullHeal();
  if (outcome === 'win') s.addDexMob(mobId);
  return { outcome, rounds: battle.round, hints, taken, maxHp: stats.maxHp };
}

export function battleStars(r: BattleReport): Stars {
  if (r.taken === 0) return 3;
  return r.taken <= r.maxHp * 0.3 ? 2 : 1;
}

/** 전투 미션(연습 전투, 보스) */
export async function battleMission(mission: Mission): Promise<MissionResult | null> {
  if (mission.kind !== 'battle' || !mission.data) return null;
  const d = mission.data;
  const r = await runBattle(d.mob, { intro: d.intro, hint: d.hint, prefill: d.prefill ?? MOBS[d.mob]?.prefill });
  if (r.outcome === 'flee') return null;
  if (r.outcome !== 'win') {
    app.ui.toast(r.outcome === 'timeout' ? '로비가 지쳤어요. 쉬고 다시 해 봐요!' : '쓰러졌어요! 로비가 치료해 줬어요.', icon('char-robi', 0));
  }
  return { success: r.outcome === 'win', stars: r.outcome === 'win' ? battleStars(r) : 0, attempts: Math.max(1, r.rounds), hints: r.hints };
}
