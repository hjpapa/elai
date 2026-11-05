import { composePromptImage } from './image';
import type { PromptData, PromptOption, PromptQuality, PromptRender, PromptSlotId } from '../../data/schema';
import type { Stars } from '../core/types';

/** 칸별로 고른 선택지 id(비우면 undefined) */
export type PromptChoice = Partial<Record<PromptSlotId, string>>;

export interface PromptIssue {
  slot: PromptSlotId;
  kind: 'missing' | 'meh' | 'bad' | 'privacy';
  text: string;
}

export interface PromptOutcome {
  opening: string;
  lines: string[];
  render: PromptRender;
  issues: PromptIssue[];
  /** 칸마다 good 2, meh 1, 그 밖 0 → 0~8 */
  score: number;
  privacy: boolean;
  success: boolean;
  stars: Stars;
}

const POINTS: Record<PromptQuality, number> = { good: 2, meh: 1, bad: 0 };

/**
 * 게임 속 AI '젠'의 답 만들기. 실제 AI가 아니라 미리 써 둔 조각을 조합해요.
 * 빠지거나 맞지 않는 칸마다 정해진 문제가 결과에 나타나요.
 */
export function evaluatePrompt(data: PromptData, choice: PromptChoice): PromptOutcome {
  const pick = (id: PromptSlotId): PromptOption | undefined => {
    const slot = data.slots.find((s) => s.id === id);
    return slot?.options.find((o) => o.id === choice[id]);
  };
  const role = pick('role');
  const task = pick('task');
  const how = pick('how');
  const format = pick('format');

  const issues: PromptIssue[] = [];
  let score = 0;
  let privacy = false;
  for (const slot of data.slots) {
    const opt = pick(slot.id);
    if (!opt) {
      issues.push({ slot: slot.id, kind: 'missing', text: slot.missing });
      continue;
    }
    score += POINTS[opt.quality];
    if (opt.privacy) {
      privacy = true;
      issues.unshift({ slot: slot.id, kind: 'privacy', text: opt.feedback ?? '개인정보는 넣지 않아요.' });
    } else if (opt.quality !== 'good') {
      issues.push({ slot: slot.id, kind: opt.quality, text: opt.feedback ?? '' });
    }
  }

  const opening = role?.opening ?? data.fallback.opening;
  let lines: string[];
  if (!task) lines = data.fallback.body;
  else if (task.quality === 'good') {
    const easy = how !== undefined && how.quality !== 'bad';
    lines = (easy ? task.body : task.hardBody) ?? task.body ?? [];
  } else lines = task.body ?? [];

  const imageMatches = !data.image || (data.slots.every(slot => pick(slot.id)?.quality === 'good' && data.image?.layers.some(layer => layer.slot === slot.id && layer.option === choice[slot.id])) && composePromptImage(data, choice)?.some(row => row.some(Boolean)) === true);
  const success = imageMatches && !privacy && task?.quality === 'good' && score >= 6;
  const stars: Stars = !success ? 0 : score === 8 ? 3 : score >= 7 ? 2 : 1;
  return { opening, lines, render: format?.render ?? 'paragraph', issues, score, privacy, success, stars };
}
