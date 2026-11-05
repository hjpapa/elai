import { ClassifyMission } from './classify/ClassifyMission';
import type { Mission, MissionKind } from '../data/schema';
import { app } from '../game/app';
import { battleMission } from './battle/runBattle';
import { BlockCodeMission } from './blockCode/BlockCodeMission';
import type { CustomRunner } from './core/MissionHost';
import type { MissionRegistry, MissionResult } from './core/types';
import { PromptMission } from './prompt/PromptMission';
import { QuizMission } from './quiz/QuizMission';
import { ReflectMission } from './reflect/ReflectMission';
import { SequenceMission } from './sequence/SequenceMission';

/** 창 안에 그리는 미션 */
export const ENGINES: MissionRegistry = {
  classify: () => new ClassifyMission(),
  blockCode: () => new BlockCodeMission(),
  sequence: () => new SequenceMission(),
  quiz: () => new QuizMission(),
  reflect: () => new ReflectMission(),
  prompt: () => new PromptMission(),
};

async function dialogueMission(mission: Mission): Promise<MissionResult | null> {
  if (mission.kind !== 'dialogue' || !mission.data) return null;
  await app.ui.dialogue(mission.data.lines);
  return { success: true, stars: 3, attempts: 1, hints: 0 };
}

/** 자기 화면을 쓰는 미션 */
export const CUSTOM: Partial<Record<MissionKind, CustomRunner>> = {
  dialogue: dialogueMission,
  battle: battleMission,
};
