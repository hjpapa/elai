/**
 * 그림 키 목록 — 계약 파일.
 * Codex는 이 목록의 키·크기·프레임 수대로 그림을 만들고 public/assets/manifest.json에 적어요.
 * 그림이 없는 키는 BootScene이 임시 그림(placeholder)을 만들어 채워요.
 * 규격 설명: docs/asset-spec.md
 */

export type AssetKind = 'tile' | 'block' | 'prop' | 'char' | 'overlay' | 'mob' | 'icon' | 'fx' | 'ui';

export interface AssetSpec {
  key: string;
  kind: AssetKind;
  /**
   * 프레임 하나의 너비·높이(px). 게임 화면에서 차지하는 크기예요.
   * 고해상도 그림(매니페스트 density: 2)은 PNG가 이 크기의 2배이고, 게임이 반으로 줄여 같은 크기로 그려요.
   */
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
/** 건물 안 높은 벽: 윗면 16px + 옆면 40px(캐릭터보다 높게) */
const wall = spec('block', 32, 56, 1);
const prop = (w: number, h: number, frames = 1) => spec('prop', w, h, frames);
const char = spec('char', 16, 24, 10);
const overlay = spec('overlay', 16, 24, 10);
const icon = spec('icon', 16, 16, 1);
const mob = (size: 16 | 24 | 48) => spec('mob', size, size, 4);
const fx = (w: number, h: number, frames: number) => spec('fx', w, h, frames);
const ui = (w: number, h: number, frames = 1) => spec('ui', w, h, frames);

export const ASSETS: AssetSpec[] = [
  // C11: 2.5D 개선 — 길 안내 표시와 화면 테두리. 그림이 오기 전에는 임시 그림·지금 화면 모양을 써요.
  icon('icon-quest-new', '할 일이 있는 NPC 머리 위 느낌표 말풍선', 0xf2c94c),
  icon('icon-quest-doing', '하고 있는 일 표시(말줄임 말풍선)', 0x7fc8f8),
  icon('icon-guide-arrow', '목표 쪽을 가리키는 화살표(오른쪽을 가리켜요. 게임이 돌려요)', 0xf2c94c),
  icon('icon-path-step', '길 안내 발자국(바닥에 납작하게 놓인 작은 점)', 0xfff1a8),
  icon('icon-talk', '말하기 단추(말풍선과 점 세 개)', 0xfff4d2),
  fx(32, 16, 4)('fx-target', '누른 곳 바닥 표시(마름모 고리가 4프레임 동안 작아져요)', 0xfff1a8),
  ui(24, 24)('ui-panel', '창 테두리(9칸 나눔: 모서리 8px, 가운데는 늘어나는 면)', 0xfff4d2),
  ui(24, 24, 3)('ui-button', '단추(보통, 누름, 꺼짐. 9칸 나눔: 모서리 8px)', 0xe7b64f),
  ui(24, 24)('ui-bubble', '말풍선 몸통(9칸 나눔: 모서리 8px)', 0xffffff),
  ui(24, 24, 2)('ui-slot', '가방·장비 칸(보통, 고름. 9칸 나눔: 모서리 8px)', 0xc7d6dc),
  ui(24, 8)('ui-bar', '체력·경험치 막대 틀(양 끝 8px, 가운데는 늘어나요)', 0x56657a),
  ui(32, 32, 2)('ui-stick', '터치 조이스틱(0 바닥 고리, 1 손잡이)', 0x8c9bab),

  // C13: 2.5D 4단계 — 들어가는 건물(마을 공방)과 코딩 인형뽑기. 그림이 오기 전에는 임시 그림을 써요.
  prop(32, 48, 2)('prop-workshop', '마을 공방 건물(0 문 닫힘, 1 문 열림·창에 불빛). 문 위에 작은 인형 간판', 0xd98a5c),
  tile('tile-room', '공방 안 따뜻한 나무 마루', 0xc08552),
  tile('tile-rug', '인형 모음 깔개(이웃 칸과 이어지는 둥근 무늬 천)', 0xcf719d),
  tile2('tile-doormat', '나가는 문 매트(0 보통, 1 문틈 빛과 바깥쪽 화살표 무늬)', 0xa76c46),
  wall('block-room-wall', '공방 안쪽 높은 벽(윗면 16px + 옆면 40px, 아래에 굽도리 띠)', 0xedc890),
  wall('block-room-window', '창문이 난 높은 벽(두 옆면의 같은 높이에 창)', 0xedc890),
  prop(32, 48, 2)('prop-claw-machine', '코딩 인형뽑기 기계(유리 안에 인형과 집게, 앞에 출구. 0·1 불빛이 번갈아 깜빡여요). 동전 넣는 곳은 없어요', 0xe46f9a),
  prop(32, 32)('prop-workbench', '공구와 실타래가 놓인 작업대', 0xa76c46),
  prop(32, 24)('prop-toybox', '뚜껑이 열린 장난감 상자', 0xe7b64f),
  prop(16, 24)('prop-plant', '둥근 잎 화분', 0x8dc567),
  prop(16, 32)('prop-floorlamp', '따뜻한 빛의 스탠드', 0xffe59a),
  prop(16, 16)('prop-cushion', '인형을 앉히는 납작한 둥근 방석', 0xcf719d),
  prop(16, 16, 2)('prop-claw', '인형뽑기 집게(0 벌림, 1 오므림). 위 가운데에 줄이 이어져요', 0xc7d6dc),
  icon('icon-claw-exit', '인형이 나오는 출구 구멍(위에서 본 모습, 줄무늬 테두리)', 0x293044),
  icon('icon-card-grab', '집기 카드(집게)', 0xe46f9a),
  prop(16, 16)('prop-doll-dummy', '허수아비 봇 인형(둥근 천 인형, 단추 눈)', 0xc9a26b),
  prop(16, 16)('prop-doll-slime', '덩굴 슬라임 인형', 0x5bbf5b),
  prop(16, 16)('prop-doll-bug', '버그 벌레 인형(0과 1 무늬 천)', 0xd96bd1),
  prop(16, 16)('prop-doll-bat', '메아리 박쥐 인형', 0x7962ab),
  prop(16, 16)('prop-doll-guardian', '숲 수호자 인형(이끼 머리의 작은 나무 거인)', 0x4f7a3a),
  prop(16, 16)('prop-doll-robi', '로비 인형(안테나 달린 둥근 로봇)', 0xc0c7d1),

  // C14: 2.5D 4단계 — 마을 택배소와 코딩 택배 분류. 벽·바닥은 공방 그림을 같이 써요. 그림이 오기 전에는 임시 그림을 써요.
  prop(32, 48, 2)('prop-parcel-office', '마을 택배소 건물(0 낡고 닫힘, 1 고쳐지고 문 열림·창에 불빛). 문 위에 상자 간판', 0x478bc7),
  prop(32, 48, 2)('prop-sorter', '택배 분류 기계(위에서 벨트가 내려와 왼쪽·오른쪽 바구니로 갈라져요. 0·1 벨트 무늬가 움직이고 불빛이 번갈아 켜져요)', 0x49b5b1),
  prop(16, 24, 2)('prop-parcel-stack', '보낸 상자 더미(0 하트 상자 위주, 1 별 상자 위주). 바닥에 바로 놓여요', 0xd39a62),
  prop(32, 32)('prop-parcel-pile', '입구 옆에 쌓인 택배 상자 더미(장식)', 0xa76c46),
  prop(16, 16, 2)('prop-sort-basket', '분류 바구니(0 비어 있음, 1 물건이 담김)', 0xbd7959),
  icon('icon-sort-heart', '하트 그림이 붙은 빨간 상자(놀이 판에 서 있어요)', 0xed7463),
  icon('icon-sort-star', '별 그림이 붙은 파란 상자(놀이 판에 서 있어요)', 0x478bc7),
  icon('icon-sort-ball', '노란 공(둥근 물건, 놀이 판에 서 있어요)', 0xe7b64f),
  icon('icon-card-sendLeft', '왼쪽으로 보내기 카드(상자와 왼쪽 화살표)', 0x49b5b1),
  icon('icon-card-sendRight', '오른쪽으로 보내기 카드(상자와 오른쪽 화살표)', 0x49b5b1),
  icon('icon-stamp', '배달 도장(동그란 도장 자국, 상자 무늬)', 0xb94751),

  // C15: 2.5D 4단계 — 마을 불빛 가게와 코딩 불빛 그림. 벽·바닥은 공방 그림을 같이 써요. 그림이 오기 전에는 임시 그림을 써요.
  prop(32, 48, 2)('prop-light-shop', '마을 불빛 가게 건물(0 문 닫힘, 1 문 열림·창과 간판에 불빛). 문 위에 전구 간판', 0xe7b64f),
  prop(32, 48, 2)('prop-lightboard', '불빛 그림 기계(세워 둔 전구판 격자에 숫자 판이 붙어 있고, 위에 작은 불빛 붓. 0·1 전구가 번갈아 켜져요)', 0x7962ab),
  prop(16, 24, 7)('prop-light-frame', '불빛 그림 액자(0 불 꺼진 빈 액자, 1~6 판마다 켜진 그림: 1 점 둘, 2 버섯, 3 점선, 4 창문, 5 숫자 띠, 6 하트). 바닥에 세워요', 0xffe59a),
  prop(32, 32, 2)('prop-lamp-shelf', '전등 진열대(작은 전등들이 놓인 선반, 0·1 불빛이 번갈아 켜져요)', 0xd39a62),
  icon('icon-bulb-off', '꺼진 전구(놀이 판, 동그란 유리와 소켓)', 0x56657a),
  icon('icon-bulb-on', '켜진 전구(놀이 판, 노란 빛)', 0xffe59a),
  icon('icon-light-brush', '불빛 붓(작은 로봇 붓, 아래 끝이 빛나요)', 0xb5a0dc),
  icon('icon-card-lightOn', '켜기 카드(전구와 반짝임)', 0xe7b64f),
  icon('icon-card-nextRow', '다음 줄 카드(아래로 꺾여 왼쪽 끝으로 가는 화살표)', 0x4a7bd1),

  // C10: 윤리의 성
  tile('tile-castle', '따뜻한 빛의 성 돌바닥', 0xc7d6dc),
  block('block-castle', '성의 보랏빛 돌벽', 0x8c9bab),
  prop(32, 48, 2)('prop-mirror', '기록을 비추는 거울(흐림, 맑음)', 0x82cce0),
  prop(24, 32)('prop-banner', '책과 마음이 그려진 성 깃발', 0xb5a0dc),
  char('char-keeper', '성 지킴이(마음 배지와 기록장)', 0x7962ab),
  mob(24)('mob-fake-shadow', '모양을 흉내 내는 장난꾸러기 그림자', 0x7962ab),
  mob(48)('boss-bias-golem', '자료 균형을 지키는 돌 골렘', 0x8c9bab),
  overlay('robi-part-ethics', '로비의 마음 배지 윤리 코어', 0xa4e3c2),
  icon('icon-part-ethics', '윤리 코어', 0xa4e3c2),

  // C9: 프롬프트 공방. 기존 나무 바닥·벽·젠을 함께 써요.
  prop(24, 32)('prop-easel', '그림을 고쳐 그리는 이젤', 0xd39a62),
  prop(32, 40)('prop-bookshelf', '근거 자료를 모은 책장', 0xa76c46),
  mob(24)('mob-babble-parrot', '말을 따라 하는 장난꾸러기 앵무새', 0xed7463),
  mob(48)('boss-babble-king', '책 깃을 두른 앵무새 대장', 0x7962ab),
  overlay('robi-part-talk', '로비의 말풍선 대화 모듈', 0x82cce0),
  icon('icon-part-talk', '대화 모듈', 0x82cce0),

  // C8: 길잡이 천문대
  tile('tile-observatory', '별자리가 새겨진 천문대 바닥', 0x344d78),
  block('block-observatory', '금빛 테두리 천문대 벽', 0x7962ab),
  prop(32, 32)('prop-telescope', '별을 살피는 망원경', 0xe7b64f),
  prop(16, 32, 2)('prop-starlamp', '별 등불(은은한 빛, 반짝임)', 0xffe59a),
  char('char-astronomer', '별 지도를 든 천문학자', 0xb5a0dc),
  mob(24)('mob-meteor-fox', '별 꼬리 장난꾸러기 여우', 0xd39a62),
  mob(48)('boss-star-fox', '별자리를 두른 여우 대장', 0xb5a0dc),
  overlay('robi-part-predictor', '로비 별 안테나 예측 모듈', 0xffe59a),
  icon('icon-part-predictor', '예측 모듈', 0xffe59a),

  // C7: 인식의 연구소
  tile('tile-lab', '연구소의 숫자 격자 바닥', 0xc7d6dc),
  block('block-lab', '연구소의 푸른 수납벽', 0x478bc7),
  prop(24, 32)('prop-microscope', '특징을 살피는 현미경', 0x8c9bab),
  prop(16, 24, 2)('prop-jar', '관찰용 병(움직이는 방울)', 0x82cce0),
  char('char-researcher', '연구원(보안경과 기록판)', 0xc7d6dc),
  mob(24)('mob-shift-slime', '모양을 바꾸는 장난꾸러기 슬라임', 0xb5a0dc),
  mob(48)('boss-shift-king', '변신 슬라임 대장', 0x7962ab),
  overlay('robi-part-learnchip', '로비 옆구리에 붙는 학습 칩', 0xb5a0dc),
  icon('icon-part-learnchip', '학습 칩', 0xb5a0dc),

  // C6: 데이터 항구
  tile('tile-dock', '바닷물에 닳은 항구 나무 바닥', 0xa76c46),
  block('block-crate', '항구의 쌓은 나무 상자', 0xd39a62),
  prop(32, 48, 2)('prop-lighthouse', '등대(꺼진 등불, 켜진 등불)', 0xc7d6dc),
  prop(16, 24, 2)('prop-buoy', '물결에 흔들리는 부표', 0xed7463),
  char('char-harbor', '항구지기 모아(구명 조끼와 기록장)', 0x478bc7),
  mob(24)('mob-fog-jelly', '안개 속 물결을 읽는 해파리', 0x82cce0),
  mob(48)('boss-ledger-octo', '장부를 정리하는 문어 대장', 0xcf719d),
  overlay('robi-part-lens', '로비의 데이터 렌즈', 0x82cce0),
  icon('icon-part-lens', '데이터 렌즈', 0x82cce0),
  icon('icon-card-scan', '살펴보기(렌즈와 기록)', 0x82cce0),

  // C5: 갈림길 사막. tile-sand는 기존 키를 그대로 써요.
  block('block-sandstone', '따뜻한 빛의 사암 벽', 0xd39a62),
  prop(16, 24)('prop-cactus', '둥근 팔의 선인장', 0x8dc567),
  prop(16, 24, 2)('prop-signal', '신호등(빨강, 초록)', 0x49b5b1),
  char('char-guide', '길잡이 나루(햇빛 가리개와 지도 주머니)', 0xedc890),
  mob(24)('mob-mirage-lizard', '장난꾸러기 신기루 도마뱀', 0xd39a62),
  mob(48)('boss-lizard-chief', '신기루 도마뱀 대장', 0xd39a62),
  overlay('robi-part-sensor', '로비 머리 옆의 센서', 0x82cce0),
  icon('icon-part-sensor', '센서 모듈', 0x82cce0),

  // C4: 반복의 동굴
  tile('tile-cave', '수정 조각이 박힌 동굴 바닥', 0x56657a),
  block('block-cave', '동굴 바위벽', 0x344d78),
  prop(16, 24, 2)('prop-crystal', '동굴 수정(보통, 반짝)', 0x82cce0),
  prop(16, 24)('prop-stalagmite', '둥근 석순', 0x8c9bab),
  char('char-explorer', '탐험가 하루(헬멧 램프)', 0x49b5b1),
  mob(24)('mob-echo-bat', '장난꾸러기 메아리 박쥐', 0x7962ab),
  mob(48)('boss-bat-king', '메아리 박쥐 대장', 0x7962ab),
  overlay('robi-part-memory', '로비 등에 붙는 메모리 칩', 0x49b5b1),
  icon('icon-part-memory', '메모리 칩', 0x49b5b1),

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
  /** 픽셀 밀도: 2면 PNG(와 아틀라스 프레임)가 목록 크기의 가로·세로 2배인 고해상도 그림이에요. 없으면 1. */
  density?: 1 | 2;
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
      // 바닥 마름모의 중심 = 아래에서 8px 위(32×24 블록은 위에서 16px, 높은 벽 32×56은 위에서 48px)
      return { x: 0.5, y: (spec.h - 8) / spec.h };
    case 'prop':
    case 'char':
    case 'overlay':
    case 'mob':
      return { x: 0.5, y: (spec.h - 2) / spec.h };
    default:
      return { x: 0.5, y: 0.5 };
  }
}
