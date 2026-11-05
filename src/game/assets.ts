/**
 * 그림 키 목록 — 계약 파일.
 * Codex는 이 목록의 키·크기·프레임 수대로 그림을 만들고 public/assets/manifest.json에 적어요.
 * 그림이 없는 키는 BootScene이 임시 그림(placeholder)을 만들어 채워요.
 * 규격 설명: docs/asset-spec.md
 */

export type AssetKind = 'tile' | 'block' | 'prop' | 'char' | 'overlay' | 'mob' | 'icon' | 'fx';

export interface AssetSpec {
  key: string;
  kind: AssetKind;
  /** 프레임 하나의 너비·높이(px) */
  w: number;
  h: number;
  /** 가로로 이어 붙인 프레임 수 */
  frames: number;
  /** 무엇을 그릴지 */
  desc: string;
  /** 임시 그림 색 */
  color: number;
}

/** 캐릭터·겹침 레이어(16×24, 10프레임)의 프레임 순서 */
export const CHAR_FRAMES = {
  frontIdle: 0,
  frontWalk: [1, 2, 3, 4],
  backIdle: 5,
  backWalk: [6, 7, 8, 9],
} as const;

/** 몹(4프레임)의 프레임 순서 */
export const MOB_FRAMES = {
  idle: [0, 1],
  hit: 2,
  purified: 3,
} as const;

const spec = (kind: AssetKind, w: number, h: number, frames: number) =>
  (key: string, desc: string, color: number): AssetSpec => ({ key, kind, w, h, frames, desc, color });

const tile = spec('tile', 32, 16, 1);
const tile2 = spec('tile', 32, 16, 2);
const block = spec('block', 32, 24, 1);
const prop = (w: number, h: number, frames = 1) => spec('prop', w, h, frames);
const char = spec('char', 16, 24, 10);
const overlay = spec('overlay', 16, 24, 10);
const icon = spec('icon', 16, 16, 1);
const mob = (size: 16 | 24 | 48) => spec('mob', size, size, 4);
const fx = (w: number, h: number, frames: number) => spec('fx', w, h, frames);

export const ASSETS: AssetSpec[] = [
  // ── 타일(32×16 마름모 윗면) ──
  tile('tile-grass', '풀밭', 0x5fae4b),
  tile('tile-flower', '작은 꽃이 핀 풀밭', 0x7cc45a),
  tile('tile-path', '흙길', 0xc9a26b),
  tile2('tile-water', '물(2프레임 물결)', 0x3f8fd8),
  tile('tile-stone', '던전 돌바닥', 0x8a8f99),
  tile('tile-wood', '나무 마루(공방 안)', 0xa8743f),
  tile('tile-bridge', '나무 다리 판자', 0x9b6a3a),
  tile('tile-sand', '모래(3장)', 0xe3c77d),

  // ── 높이 블록(32×24: 윗면 + 옆면 8px) ──
  block('block-hedge', '숲 미로의 덤불 벽', 0x2f7d3a),
  block('block-wall', '던전 돌벽', 0x5c606b),

  // ── 소품(발 기준점 = 아래 가운데) ──
  prop(32, 48)('prop-tree', '둥근 활엽수', 0x3e9447),
  prop(32, 48)('prop-pine', '뾰족한 침엽수', 0x2d6e3c),
  prop(32, 24)('prop-bush', '덤불', 0x4c9a42),
  prop(32, 24)('prop-rock', '바위', 0x7d7f86),
  prop(16, 24)('prop-sign', '나무 표지판', 0xb07c45),
  prop(16, 16, 2)('prop-chest', '보물상자(0 닫힘, 1 열림)', 0xd29b3c),
  prop(32, 32, 2)('prop-door', '덩굴 문(0 닫힘, 1 열림)', 0x3b7a3a),
  prop(16, 16)('prop-key', '바닥에 놓인 열쇠', 0xf2c94c),
  prop(32, 32, 2)('prop-portal', '빛나는 이동 문(2프레임 반짝임)', 0x9b7bff),
  prop(32, 48, 2)('prop-house', '마을 집(0 낡음, 1 고쳐짐)', 0xd98a5c),
  prop(32, 32, 2)('prop-fountain', '분수(0 마름, 1 물이 나옴)', 0x9fb4c7),
  prop(32, 24)('prop-bridge-broken', '부서진 다리 조각', 0x7a5a3a),
  prop(32, 32)('prop-booth', '프롬프트 공방 체험 천막', 0xe46f9a),
  prop(16, 32)('prop-lamp', '가로등', 0x55606e),
  prop(32, 24)('prop-fence', '나무 울타리', 0xa57a4a),
  prop(16, 16)('prop-stump', '나무 그루터기', 0x8b5e34),
  prop(16, 16)('prop-mushroom', '버섯', 0xe05a4f),
  prop(32, 32, 2)('prop-gate', '숲·던전 입구 아치(0 닫힘, 1 열림)', 0x6b8f3a),

  // ── 캐릭터(16×24, 10프레임: 앞 대기·걷기4, 뒤 대기·걷기4) ──
  char('char-player', '견습 탐험가(학생). 성별이 드러나지 않는 디자인', 0x4a7bd1),
  char('char-robi', '도우미 로봇 로비(작고 둥근 몸, 안테나)', 0xc0c7d1),
  char('char-zen', '프롬프트 공방의 AI 젠(떠 있는 등불 모양)', 0xe46f9a),
  char('char-elder', '마을 촌장 다온(지팡이, 따뜻한 옷)', 0x9c6bb3),
  char('char-chef', '숲속 요리사 보리(앞치마)', 0xf0a04b),
  char('char-ranger', '숲지기 솔(초록 망토)', 0x3f9a5a),

  // ── 겹침 레이어(캐릭터와 같은 16×24, 10프레임 격자) ──
  overlay('equip-hat-cap', '천 모자', 0xd9534f),
  overlay('equip-hat-leaf', '나뭇잎 모자', 0x6abf4b),
  overlay('equip-hat-ranger', '숲지기 모자', 0x2f7d3a),
  overlay('equip-tool-stick', '나무 지팡이(손에 듦)', 0xa0703c),
  overlay('equip-tool-hammer', '고침 망치(손에 듦)', 0x8a8f99),
  overlay('equip-tool-brush', '수호자의 붓(손에 듦)', 0x7fd1c4),
  overlay('robi-part-wheel', '로비 부품: 바퀴 모터(발밑)', 0xf2c94c),

  // ── 몹(정사각형, 4프레임: 대기2, 맞음, 정화됨) ──
  mob(16)('mob-dummy', '연습용 허수아비 봇', 0xc9a26b),
  mob(24)('mob-vine-slime', '덩굴 슬라임(장난꾸러기)', 0x5bbf5b),
  mob(16)('mob-bug-worm', '버그 벌레(작은 벌레, 0과 1 무늬)', 0xd96bd1),
  mob(48)('boss-forest-guardian', '숲의 수호자(이끼 덮인 나무 거인, 무섭지 않게)', 0x4f7a3a),

  // ── 아이템 아이콘(16×16) ──
  icon('icon-item-cap', '천 모자', 0xd9534f),
  icon('icon-item-leafhat', '나뭇잎 모자', 0x6abf4b),
  icon('icon-item-rangerhat', '숲지기 모자', 0x2f7d3a),
  icon('icon-item-stick', '나무 지팡이', 0xa0703c),
  icon('icon-item-hammer', '고침 망치', 0x8a8f99),
  icon('icon-item-brush', '수호자의 붓', 0x7fd1c4),
  icon('icon-item-vest', '견습 조끼', 0x4a7bd1),
  icon('icon-item-cloak', '이끼 망토', 0x3f9a5a),
  icon('icon-item-boots', '가죽 신발', 0x8b5e34),
  icon('icon-item-windboots', '바람 신발', 0x7fc8f8),
  icon('icon-item-glasses', '디버그 안경', 0x9b7bff),
  icon('icon-item-flowmap', '순서도 지도', 0xe3c77d),
  icon('icon-item-apple', '회복 사과', 0xe05a4f),
  icon('icon-item-jelly', '에너지 젤리', 0xf2c94c),
  icon('icon-item-forestkey', '숲 열쇠', 0xf2c94c),
  icon('icon-item-vine', '덩굴 조각(재료)', 0x5bbf5b),
  icon('icon-part-wheel', '로비 부품: 바퀴 모터', 0xf2c94c),

  // ── 명령 카드 아이콘(16×16) ──
  icon('icon-card-up', '위로 화살표', 0x4a7bd1),
  icon('icon-card-down', '아래로 화살표', 0x4a7bd1),
  icon('icon-card-left', '왼쪽 화살표', 0x4a7bd1),
  icon('icon-card-right', '오른쪽 화살표', 0x4a7bd1),
  icon('icon-card-forward', '앞으로 가기', 0x4a7bd1),
  icon('icon-card-turnLeft', '왼쪽으로 돌기', 0x4a7bd1),
  icon('icon-card-turnRight', '오른쪽으로 돌기', 0x4a7bd1),
  icon('icon-card-collect', '줍기(손)', 0xf2c94c),
  icon('icon-card-attack', '고치기 공격(반짝이는 지팡이)', 0xe05a4f),
  icon('icon-card-guard', '막기(방패)', 0x4a7bd1),
  icon('icon-card-heal', '회복(하트)', 0x5bbf5b),
  icon('icon-card-wait', '쉬기(모래시계)', 0x8a8f99),
  icon('icon-card-repeat', '반복(돌아가는 화살표)', 0xf0a04b),
  icon('icon-card-if', '만약(물음표 갈림길)', 0x9b7bff),

  // ── 몹 행동 예고 아이콘(16×16) ──
  icon('icon-intent-attack', '공격 예고(주먹)', 0xe05a4f),
  icon('icon-intent-guard', '막기 예고(방패)', 0x4a7bd1),
  icon('icon-intent-charge', '힘 모으기 예고(번개)', 0xf2c94c),
  icon('icon-intent-smash', '강타 예고(큰 별 충격)', 0xd9534f),
  icon('icon-intent-heal', '회복 예고(하트)', 0x5bbf5b),
  icon('icon-intent-idle', '멍하니 있음(Zzz)', 0x8a8f99),

  // ── 퍼즐 칸(위에서 본 모습, 16×16) ──
  icon('icon-robi', '위에서 본 로비(위쪽을 바라봄)', 0xc0c7d1),
  icon('icon-goal', '목표 깃발', 0xd9534f),
  icon('icon-gem', '보석', 0x7fd1c4),
  icon('icon-cell-tree', '위에서 본 나무(막힌 칸)', 0x2f7d3a),
  icon('icon-cell-water', '위에서 본 물(막힌 칸)', 0x3f8fd8),
  icon('icon-cell-rock', '위에서 본 바위(막힌 칸)', 0x7d7f86),

  // ── UI 아이콘(16×16) ──
  icon('icon-star', '별(채움)', 0xf2c94c),
  icon('icon-star-empty', '별(빈칸)', 0x55606e),
  icon('icon-coin', '별가루 동전', 0xf2c94c),
  icon('icon-heart', '체력 하트', 0xe05a4f),
  icon('icon-energy', '에너지 번개', 0x7fc8f8),
  icon('icon-xp', '경험치 반짝이', 0x9b7bff),
  icon('icon-bag', '가방', 0xa0703c),
  icon('icon-book', '도감 책', 0x4a7bd1),
  icon('icon-gear', '설정 톱니', 0x8a8f99),
  icon('icon-lock', '자물쇠', 0x8a8f99),
  icon('icon-check', '체크 표시', 0x5bbf5b),
  icon('icon-hint', '힌트 전구', 0xf2c94c),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => icon(`icon-badge-${n}`, `${n}장 열쇠 배지`, 0xf2c94c)),

  // ── 효과(가로 프레임) ──
  fx(16, 16, 3)('fx-hit', '맞음 반짝', 0xffffff),
  fx(24, 24, 3)('fx-guard', '막기 방패 빛', 0x7fc8f8),
  fx(16, 16, 4)('fx-heal', '회복 하트 올라감', 0x5bbf5b),
  fx(32, 32, 6)('fx-purify', '정화 반짝임(몹이 친구가 됨)', 0xfff1a8),
  fx(32, 32, 6)('fx-levelup', '레벨업 빛기둥', 0xf2c94c),
  fx(8, 8, 4)('fx-sparkle', '작은 반짝이', 0xffffff),
];

export const ASSET_BY_KEY: ReadonlyMap<string, AssetSpec> = new Map(ASSETS.map((a) => [a.key, a]));

/** public/assets/manifest.json 한 줄 */
export interface ManifestEntry {
  key: string;
  /** public/assets/ 기준 경로 */
  file: string;
}
export interface Manifest {
  version: 1;
  /** 공용 팔레트(#rrggbb) */
  palette: string[];
  assets: ManifestEntry[];
  /**
   * 모든 그림을 묶은 한 장(선택). 있으면 게임은 이 한 장만 읽어요(로딩이 빨라져요).
   * data는 Phaser 아틀라스 JSON(frames 객체)이고, 프레임 이름 = 그림 키,
   * 프레임 크기 = 그 키의 가로 띠 전체(프레임 너비 × 프레임 수, 높이)예요.
   */
  atlas?: { image: string; data: string };
}

/** 화면에 놓을 때의 기준점(0~1). 소품·캐릭터·몹은 아래 가운데에서 2px 위가 발이에요. */
export function originOf(spec: AssetSpec): { x: number; y: number } {
  switch (spec.kind) {
    case 'tile':
      return { x: 0.5, y: 0.5 };
    case 'block':
      // 바닥 마름모의 중심 = 위에서 16px
      return { x: 0.5, y: 16 / spec.h };
    case 'prop':
    case 'char':
    case 'overlay':
    case 'mob':
      return { x: 0.5, y: (spec.h - 2) / spec.h };
    default:
      return { x: 0.5, y: 0.5 };
  }
}
