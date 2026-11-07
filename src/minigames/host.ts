import { app } from '../game/app';
import { playSfx } from '../fx/sfx';
import { icon } from '../ui/icons';
import { minigameUnlocked } from './progress';
import type { MinigameContext, MinigameDef } from './types';

/** 놀이 기계를 누르면 미니게임 창을 열고, 판 기록과 보상을 저장해요. */
export class MinigameHost {
  private running = false;

  constructor(private readonly games: Readonly<Record<string, MinigameDef>>) {}

  get busy(): boolean {
    return this.running;
  }

  has(gameId: string): boolean {
    return gameId in this.games;
  }

  /** 미니게임을 열어요. 창을 닫으면 끝나요. */
  async open(gameId: string): Promise<void> {
    const def = this.games[gameId];
    if (!def) {
      app.ui.toast('이 놀이는 아직 준비 중이에요.');
      return;
    }
    if (this.running) return;
    this.running = true;
    try {
      await new Promise<void>((resolve) => {
        const engine = def.create();
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          engine.unmount?.();
          handle.close();
          resolve();
        };
        const handle = app.ui.panel(() => undefined, { title: def.title, wide: true, className: `minigame minigame-${gameId}`, onClose: settle });
        const heading = handle.body.parentElement?.querySelector('.panel-head h2');
        const s = app.state;
        const ctx: MinigameContext = {
          root: handle.body,
          icon,
          sfx: playSfx,
          helpers: { debugGlasses: s.helpers.debugGlasses },
          best: () => s.data.minigames?.[gameId] ?? {},
          unlocked: (cond) => minigameUnlocked(s, cond),
          hasFlag: (name) => s.hasFlag(name),
          clear: (roundId, stars, firstReward) => {
            const rec = s.recordMinigame(gameId, roundId, stars);
            if (!rec.first || !firstReward) return rec;
            const sum = s.applyReward({ flags: firstReward.flags, title: firstReward.title });
            return { ...rec, ...(sum.title ? { title: sum.title } : {}) };
          },
          setTitle: (title) => {
            if (heading) heading.textContent = title;
          },
          close: settle,
        };
        engine.mount(ctx);
      });
    } finally {
      this.running = false;
    }
  }
}
