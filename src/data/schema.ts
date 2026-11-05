/**
 * ELAI 게임 데이터 타입 — 계약 파일.
 * 장·미션·맵·아이템·몹·저장 데이터의 모양을 정해요.
 * 바꾸려면 Claude 승인이 필요해요(AGENTS.md "계약 파일").
 */

// ── 좌표·방향 ─────────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}
export type Dir = 'up' | 'right' | 'down' | 'left';

// ── 프로그램(블록) ────────────────────────────────────────
// 퍼즐(GridEnv)과 전투(BattleEnv)가 같은 인터프리터로 실행해요.

/** 퍼즐 명령: 절대 방향 이동(1~2장) + 상대 방향 이동(3장~) + 줍기 */
export type GridCmd = 'up' | 'down' | 'left' | 'right' | 'forward' | 'turnLeft' | 'turnRight' | 'collect';
/** 전투 명령 */
export type BattleCmd = 'scan' | 'attack' | 'guard' | 'heal' | 'wait';
export type Cmd = GridCmd | BattleCmd;

/** 조건 블록이 묻는 질문 */
export type Cond =
  | 'forecastRisk'
  | 'modelPlayful'
  | 'waveHigh'
  | 'waveMiddle'
  | 'signalRed'
  | 'wallAhead'
  | 'pathAhead'
  | 'pathLeft'
  | 'pathRight'
  | 'onGem'
  | 'enemyAttack'
  | 'enemyGuard'
  | 'enemyCharge'
  | 'enemySmash'
  | 'lowHp';

export type Block =
  | { t: 'cmd'; cmd: Cmd }
  | { t: 'repeat'; times: number; body: Block[] }
  | { t: 'if'; cond: Cond; yes: Block[]; no: Block[] };

// ── 보상 ─────────────────────────────────────────────────
export interface ItemStack {
  id: string;
  qty: number;
}
export interface Reward {
  xp?: number;
  coins?: number;
  items?: ItemStack[];
  robiPart?: string;
  badge?: string;
  title?: string;
  /** 켜 줄 플래그(마을 복구, 문 열림 등) */
  flags?: string[];
}

// ── 미션 데이터 ───────────────────────────────────────────
/** who: NPC id, 'robi', 'player' 중 하나 */
export interface DialogueLine {
  who: string;
  text: string;
}
export interface DialogueData {
  lines: DialogueLine[];
}

export interface BlockCodeData {
  intro: string;
  /** '.' 길, '#' 막힘, '~' 물, 'S' 시작, 'G' 목표, '*' 보석 */
  grid: string[];
  /** 칠할 목표 칸(x). 칠한 칸 전체가 정확히 같아야 성공해요. */
  paint?: string[];
  startDir?: Dir;
  /** 쓸 수 있는 명령 블록 */
  palette: Cmd[];
  allowRepeat?: boolean;
  /** 쓸 수 있는 조건(없으면 조건 블록 없음) */
  allowIf?: Cond[];
  /** 가장 짧은 풀이의 블록 수(별점 기준) */
  optimal: number;
  maxBlocks?: number;
  /** 디버깅 미션: 처음부터 들어 있는 고장 난 프로그램 */
  initialProgram?: Block[];
  /** 보석을 모두 주워야 성공 */
  mustCollect?: boolean;
  hint: string;
  /** 성공 후 로비가 정리해 주는 말 */
  explain?: string;
}

export interface SequenceData {
  intro: string;
  /** 정답 순서대로 */
  steps: string[];
  display: 'cards' | 'flowchart';
  hint: string;
  explain?: string;
}

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}
export interface QuizData {
  intro?: string;
  questions: QuizQuestion[];
}

export type PromptSlotId = 'role' | 'task' | 'how' | 'format';
export type PromptQuality = 'good' | 'meh' | 'bad';
export type PromptRender = 'list' | 'paragraph' | 'table' | 'poem';
export interface PromptOption {
  id: string;
  text: string;
  quality: PromptQuality;
  /** 젠의 설명(meh/bad일 때) */
  feedback?: string;
  /** role 칸: 결과 첫 줄 */
  opening?: string;
  /** task 칸: 결과 본문(good이면 쉬운 버전, bad면 엉뚱한 내용) */
  body?: string[];
  /** task 칸(good): '어떻게'가 부족할 때 나오는 어렵고 긴 버전 */
  hardBody?: string[];
  /** format 칸: 결과 모양 */
  render?: PromptRender;
  /** 개인정보가 들어간 선택지 */
  privacy?: boolean;
}
export interface PromptSlot {
  id: PromptSlotId;
  label: string;
  question: string;
  options: PromptOption[];
  /** 칸을 비웠을 때 젠의 설명 */
  missing: string;
}
export interface PromptData {
  client: string;
  request: string;
  slots: PromptSlot[];
  /** 칸을 비웠을 때 나오는 결과(role 칸 → opening, task 칸 → body) */
  fallback: { opening: string; body: string[] };
  explain?: string;
}

export interface BattleData {
  mob: string;
  intro?: string;
  /** 전투 시작 때 미리 들어 있는 프로그램(디버깅 전투) */
  prefill?: Block[];
  hint?: string;
}

/** 장 끝 "로비에게 설명하기": 맞는 설명 문장 고르기 */
export interface ReflectData {
  prompt: string;
  sentences: { text: string; correct: boolean }[];
}

/** 아직 만들지 않은 미션 유형(2차 이후) */
export interface PlannedData {
  note: string;
}

export interface ClassifyData {
  mode: 'tree' | 'sort' | 'cluster' | 'table' | 'binary' | 'pixels' | 'search';
  intro: string;
  cards: { id: string; label: string; group: string; features: string[] }[];
  groups: { id: string; label: string }[];
  questions?: { id: string; label: string; feature: string }[];
  maxQuestions?: number;
  hint: string;
  explain?: string;
}

export interface TrainingSample { features: number[]; label: string }
export interface ClassificationModel { samples: TrainingSample[]; k: number }
export interface TrainData {
  comparison?: { smallCount: number; question: string; choices: string[]; answer: number };
  presetLabels?: boolean;
  intro: string;
  features: string[];
  labels: { id: string; label: string }[];
  examples: (TrainingSample & { id: string })[];
  tests: (TrainingSample & { id: string })[];
  minExamples: number;
  k: number;
  threshold: number;
  hint: string;
  explain?: string;
  saveModel?: boolean;
}

export interface MissionDataMap {
  dialogue: DialogueData;
  blockCode: BlockCodeData;
  sequence: SequenceData;
  quiz: QuizData;
  prompt: PromptData;
  battle: BattleData;
  reflect: ReflectData;
  classify: ClassifyData;
  train: TrainData;
  nextWord: PlannedData;
  factCheck: PlannedData;
}
export type MissionKind = keyof MissionDataMap;

interface MissionBase {
  id: string;
  title: string;
  /** 미션을 주는 NPC id */
  npc?: string;
  reward?: Reward;
  /** 아직 만들지 않은 미션: 무엇을 만들지 메모 */
  note?: string;
}
export type Mission = {
  [K in MissionKind]: MissionBase & { kind: K; data?: MissionDataMap[K] };
}[MissionKind];

// ── 장·파트 ──────────────────────────────────────────────
export interface Part {
  /** 'ch1-p1', 'ch1-boss' */
  id: string;
  kind: 'part' | 'boss';
  title: string;
  /** 학생용 한 줄 소개 */
  summary: string;
  /** 교사용: 무엇을 하며 무엇을 배우는지 */
  activity: string;
  missions: Mission[];
}

export interface Standards {
  /** 2022 개정 실과 성취기준 코드 */
  silgwa: string[];
  /** 초·중등 인공지능 교육 내용기준 영역 */
  aiContent: string[];
  /** AI4K12 5대 아이디어 */
  ai4k12: string[];
}

/** playable: 1차에 플레이 가능 / preview: 일부 체험 / planned: 구성만 */
export type ChapterStatus = 'playable' | 'preview' | 'planned';

export interface Chapter {
  id: string;
  index: number;
  title: string;
  grades: string;
  summary: string;
  concepts: string[];
  /** 교사용 학습 목표 */
  goals: string[];
  standards: Standards;
  robiPart?: string;
  dungeon: string;
  mobs: string[];
  parts: Part[];
  status: ChapterStatus;
  badge?: string;
  /** 장 입구 맵 */
  entryMap?: string;
}

// ── 맵 ───────────────────────────────────────────────────
export type TileKind =
  | 'grass'
  | 'flower'
  | 'path'
  | 'water'
  | 'sand'
  | 'stone'
  | 'wood'
  | 'bridge'
  | 'hedge'
  | 'wall'
  | 'cave'
  | 'observatory'
  | 'observatorywall'
  | 'lab'
  | 'labwall'
  | 'dock'
  | 'crate'
  | 'sandstone'
  | 'rockwall'
  | 'void';

/** 오브젝트가 보일 조건. 모두 만족해야 보여요. */
export interface Condition {
  flag?: string;
  notFlag?: string;
  /** 이 미션을 끝냈을 때 */
  mission?: string;
  /** 이 미션을 아직 안 끝냈을 때 */
  notMission?: string;
}

interface ObjectBase {
  id: string;
  at: Point;
  when?: Condition;
}
export type MapObject =
  | (ObjectBase & {
      type: 'npc';
      npc: string;
      /** 이 NPC가 주는 미션(아직 안 끝낸 첫 미션을 줘요. 장 안에서는 앞 미션을 끝내야 열려요) */
      missions?: string[];
      /** 미션이 없거나 다 끝났을 때 하는 말 */
      talk?: string[];
      /** 다른 그림으로 보이기(예: 정화된 수호자) */
      sprite?: string;
      frame?: number;
    })
  | (ObjectBase & { type: 'mob'; mob: string; wander?: number })
  | (ObjectBase & { type: 'chest'; reward: Reward })
  | (ObjectBase & { type: 'door'; key: string })
  | (ObjectBase & { type: 'pickup'; item: string })
  | (ObjectBase & { type: 'sign'; text: string })
  | (ObjectBase & {
      type: 'portal';
      to: { map: string; at: Point };
      label: string;
      /** 들어갈 수 있는 조건(없으면 항상) */
      open?: Condition;
      lockedText?: string;
      /** 입구 그림(없으면 prop-portal). 2프레임 그림은 0 닫힘, 1 열림 */
      sprite?: string;
    })
  | (ObjectBase & { type: 'prop'; sprite: string; solid?: boolean; frame?: number });

export interface MapDef {
  id: string;
  name: string;
  theme: 'village' | 'forest' | 'dungeon' | 'workshop' | 'cave' | 'desert' | 'harbor' | 'lab' | 'observatory';
  chapter?: string;
  /** 타일 글자 지도(모든 줄의 길이가 같아야 해요) */
  rows: string[];
  legend: Record<string, TileKind>;
  /** 소품 글자: 이 글자 칸에는 바닥 타일과 소품을 함께 놓아요(예: 'T' → 풀 + 나무) */
  glyphs?: Record<string, { tile: TileKind; sprite: string; solid?: boolean }>;
  objects: MapObject[];
  spawn: Point;
  /** 안개: 가 본 곳만 보여요 */
  fog?: boolean;
  /** 이 맵에서 쓰러지면 돌아갈 곳 */
  checkpoint?: { map: string; at: Point };
}

// ── NPC ──────────────────────────────────────────────────
export interface NpcDef {
  id: string;
  name: string;
  sprite: string;
  role: string;
}

// ── 아이템 ───────────────────────────────────────────────
export type EquipSlot = 'hat' | 'outfit' | 'tool' | 'shoes' | 'charm';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legend';
export interface Stats {
  maxHp: number;
  maxEn: number;
  atk: number;
  def: number;
}
export interface ItemEffect {
  heal?: number;
  energy?: number;
  /** 학습 도우미: 틀린 카드 표시 / 지나온 길 표시 / 힌트 보기 */
  helper?: 'debugGlasses' | 'flowMap' | 'hintNote';
}
export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  kind: 'equip' | 'consumable' | 'helper' | 'material' | 'quest';
  slot?: EquipSlot;
  rarity: Rarity;
  stats?: Partial<Stats>;
  effect?: ItemEffect;
  /** 캐릭터 그림에 겹치는 레이어(모자·도구) */
  overlay?: string;
  desc: string;
  price?: number;
}

// ── 몹 ───────────────────────────────────────────────────
export type MobAction = 'attack' | 'guard' | 'charge' | 'smash' | 'heal' | 'idle';
export interface MobDef {
  id: string;
  name: string;
  sprite: string;
  size: 16 | 24 | 48;
  boss?: boolean;
  chapter: string;
  hp: number;
  atk: number;
  def: number;
  /** 되풀이되는 행동 순서 */
  pattern: MobAction[];
  /** 씨앗과 차례로 정해지는 가려진 행동 */
  hiddenPattern?: { choices: MobAction[]; seed: number };
  forecastPattern?: { seed: number };
  classifyPattern?: { samples: TrainingSample[]; seed: number };
  dataPattern?: { values: number[]; actions: MobAction[] };
  /** 한 번 실행할 때의 칸 수(없으면 플레이어 슬롯 수) */
  roundTicks?: number;
  /** 강타 피해 = 플레이어 최대 체력 × 비율(보스: 막지 않으면 버틸 수 없게) */
  smashRatio?: number;
  /** heal 행동으로 회복하는 양 */
  heal?: number;
  xp: number;
  coins: number;
  drops?: { item: string; chance: number }[];
  /** 도감 설명 */
  dex: string;
  /** 정화된 뒤 하는 말 */
  purified: string;
  /** 전투 시작 때 망가진 프로그램(버그 몹) */
  prefill?: Block[];
  recommendedLevel: number;
}

// ── 로비 부품 ────────────────────────────────────────────
export interface RobiPartDef {
  id: string;
  name: string;
  chapter: string;
  ability: string;
  unlocks: { forecast?: boolean; cards?: Cmd[]; conds?: Cond[]; repeat?: boolean };
  icon?: string;
  /** 전투 프로그램 칸 추가 */
  slotBonus?: number;
  overlay: string;
  desc: string;
}

// ── 저장 데이터(Supabase elai_saves.data와 같은 모양) ───
export interface MissionRecord {
  stars: number;
  attempts: number;
  hints: number;
  done: boolean;
  at?: string;
}
export interface SaveData {
  version: 1;
  classificationModel?: ClassificationModel;
  observations?: Record<string, { value: number; action: MobAction }[]>;
  nickname: string;
  level: number;
  xp: number;
  hp: number;
  coins: number;
  inventory: ItemStack[];
  equipment: Partial<Record<EquipSlot, string>>;
  robiParts: string[];
  missions: Record<string, MissionRecord>;
  flags: Record<string, true>;
  dex: { mobs: string[]; items: string[] };
  badges: string[];
  titles: string[];
  location: { map: string; x: number; y: number };
  /** 맵별로 가 본 칸('0'/'1' 문자열, 안개용) */
  visited: Record<string, string>;
  /** volume: 소리 크기 0~1(없으면 기본값) */
  settings: { sound: boolean; volume?: number };
  updatedAt: string;
}
