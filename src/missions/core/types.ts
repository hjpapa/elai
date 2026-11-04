/**
 * 미션 엔진 인터페이스 — 계약 파일.
 * 새 미션 유형(classify, train 등)은 이 인터페이스를 구현해서 missions/<유형>/ 폴더에 만들어요.
 */
import type { Mission, MissionKind } from '../../data/schema';

export type Stars = 0 | 1 | 2 | 3;

export interface MissionResult {
  success: boolean;
  stars: Stars;
  /** 실행·제출한 횟수 */
  attempts: number;
  /** 힌트를 본 횟수 */
  hints: number;
  /** 보너스 배지 등 특별 결과 */
  bonus?: string;
}

export type SfxName =
  | 'click'
  | 'step'
  | 'success'
  | 'fail'
  | 'hit'
  | 'guard'
  | 'heal'
  | 'purify'
  | 'levelup'
  | 'item'
  | 'open';

export interface MissionContext {
  /** 미션 UI를 그릴 곳(이미 비어 있음) */
  root: HTMLElement;
  mission: Mission;
  /** 장착·보유한 학습 도우미 */
  helpers: { debugGlasses: boolean; hintNotes: number };
  /** 힌트 쪽지를 하나 써요. 남은 게 없으면 false */
  useHintNote(): boolean;
  /** 그림 키(+프레임) → <img src>에 쓸 data URL */
  icon(key: string, frame?: number): string;
  sfx(name: SfxName): void;
  /** 미션을 끝내요. 결과는 저장·보상 처리로 넘어가요. */
  finish(result: MissionResult): void;
  /** 결과 없이 닫기(나중에 다시 하기) */
  close(): void;
}

export interface MissionEngine {
  mount(ctx: MissionContext): void;
  unmount?(): void;
}

export type MissionEngineFactory = () => MissionEngine;
export type MissionRegistry = Partial<Record<MissionKind, MissionEngineFactory>>;
