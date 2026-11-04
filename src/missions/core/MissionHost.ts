import { getMission } from '../../data/chapters';
import type { Mission, MissionKind } from '../../data/schema';
import { app } from '../../game/app';
import { playSfx } from '../../fx/sfx';
import { icon } from '../../ui/icons';
import { showResult } from '../../ui/rewards';
import type { MissionContext, MissionRegistry, MissionResult } from './types';

/** 창 없이 따로 화면을 쓰는 미션(대화, 전투) */
export type CustomRunner = (mission: Mission) => Promise<MissionResult | null>;

/** 미션을 열고, 결과를 기록하고, 보상 창을 보여 줘요. */
export class MissionHost {
  private running = false;

  constructor(
    private readonly engines: MissionRegistry,
    private readonly custom: Partial<Record<MissionKind, CustomRunner>>,
  ) {}

  get busy(): boolean {
    return this.running;
  }

  async run(missionId: string): Promise<MissionResult | null> {
    const entry = getMission(missionId);
    if (!entry || this.running) return null;
    const mission = entry.mission;
    this.running = true;
    try {
      const result = await this.play(mission);
      if (!result) return null;
      const wasDone = app.state.missionDone(mission.id);
      const prevStars = app.state.data.missions[mission.id]?.stars ?? 0;
      const { reward } = app.state.completeMission(mission.id, result);
      const explain = mission.data && 'explain' in mission.data ? mission.data.explain : undefined;
      const hasReward = !!reward && (reward.xp > 0 || reward.coins > 0 || reward.items.length > 0 || !!reward.robiPart || !!reward.badge);
      if (mission.kind !== 'dialogue' || hasReward) {
        await showResult({
          title: result.success ? '미션 성공!' : '다음에 다시 해 봐요',
          success: result.success,
          stars: mission.kind === 'dialogue' ? undefined : result.stars,
          explain: result.success ? explain : undefined,
          reward,
          bonus: result.bonus,
          improved: wasDone && result.stars > prevStars,
        });
      }
      return result;
    } finally {
      this.running = false;
    }
  }

  private play(mission: Mission): Promise<MissionResult | null> {
    const custom = this.custom[mission.kind];
    if (custom) return custom(mission);
    const factory = this.engines[mission.kind];
    if (!factory || !mission.data) {
      app.ui.toast('이 미션은 아직 준비 중이에요.');
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const engine = factory();
      let settled = false;
      const settle = (r: MissionResult | null) => {
        if (settled) return;
        settled = true;
        engine.unmount?.();
        handle.close();
        resolve(r);
      };
      const handle = app.ui.panel(() => undefined, {
        title: mission.title,
        wide: true,
        className: `mission-${mission.kind}`,
        onClose: () => settle(null),
      });
      const helpers = app.state.helpers;
      const ctx: MissionContext = {
        root: handle.body,
        mission,
        helpers: { debugGlasses: helpers.debugGlasses, hintNotes: 0 },
        useHintNote: () => false,
        icon,
        sfx: playSfx,
        finish: (r) => settle(r),
        close: () => settle(null),
      };
      engine.mount(ctx);
    });
  }
}
