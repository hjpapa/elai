import type { SfxName } from '../missions/core/types';

/**
 * 미니게임 틀: 건물 안 놀이 기계(맵 오브젝트 type 'game')가 여는 놀이.
 * 미션과 달리 장 진도·교사 진도표에 들어가지 않고, 판별 가장 좋은 별과 판 보상(플래그·칭호)만 남겨요.
 * 결과는 학생 프로그램대로만 정해져요(운으로 뽑거나 코인을 거는 놀이는 만들지 않아요).
 */
export interface MinigameClear {
  /** 이 판을 처음 성공했는지 */
  first: boolean;
  /** 다시 해서 별이 늘었는지 */
  improved: boolean;
  /** 이번에 새로 받은 칭호 */
  title?: string;
}

export interface MinigameContext {
  /** 놀이 창의 본문(비어 있음) */
  root: HTMLElement;
  /** 그림 키(+프레임) → <img src>에 쓸 data URL */
  icon(key: string, frame?: number): string;
  sfx(name: SfxName): void;
  /** 장착한 학습 도우미(디버그 안경은 틀린 블록을 짚어 줘요) */
  helpers: { debugGlasses: boolean };
  /** 판 id → 가장 좋은 별(성공한 판만 있어요) */
  best(): Readonly<Record<string, number>>;
  /** 열림 조건: 이 미션을 끝냈거나 이 로비 부품이 있으면 true. 조건이 없으면 true */
  unlocked(cond: { mission: string; part?: string } | undefined): boolean;
  hasFlag(name: string): boolean;
  /**
   * 판을 성공했어요. 가장 좋은 별을 남기고, 처음 성공이면 firstReward(플래그·칭호)를 줘요.
   * 경험치·동전은 주지 않아요(레벨 성장 곡선과 학습 우회 방지).
   */
  clear(roundId: string, stars: number, firstReward?: { flags?: string[]; title?: string }): MinigameClear;
  /** 창 제목을 바꿔요(판 고르기 ↔ 판 놀이) */
  setTitle(title: string): void;
  /** 창을 닫아요 */
  close(): void;
}

export interface MinigameEngine {
  mount(ctx: MinigameContext): void;
  unmount?(): void;
}

export interface MinigameDef {
  id: string;
  /** 창 제목 */
  title: string;
  create(): MinigameEngine;
}
