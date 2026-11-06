# Codex 작업 C12 — 장별 고해상도(2배) 그림

## 목표
C11 마을 시범 그림을 사용자가 좋다고 해서 main에 병합했어요(2026-11-06). 같은 방식으로 **나머지 148개 그림을 2배 해상도(density 2)로** 다시 그려요.
아홉 단계(1장 → 화면 아이콘 → 2~8장)로 나눠서, 단계마다 끝내고 커밋해요. Claude가 커밋 단위로 검토해요.
게임 규칙·맵·키 이름·게임 속 크기는 그대로예요. 엔진은 이미 2배 그림을 읽고, 발밑 그림자·등불 빛·섬 가장자리를 그려요.

## 먼저 읽을 것
1. `AGENTS.md` — 공동 작업 규칙(2.5D 개선 기간)
2. `docs/asset-spec.md` — **"고해상도 그림(2배 밀도)"**
3. `src/game/assets.ts` — 키·크기·프레임 수·설명(계약)
4. `docs/tasks/codex-11-hires-pilot.md` — **그림 방향(품질 기준)**. 이번에도 같아요.
5. `assets-src/README.md`의 C11 절, `assets-src/hires/**`, `assets-src/tools/draw-hires-*.mjs` — C11 원본과 도구. 같은 그리기 도구·자세 함수를 이어 써서 마을 그림과 스타일을 맞춰요.
6. 참고만(고치지 않아요): `src/game/shadow.ts`(발밑 그림자), `src/game/light.ts`(등불 빛), `src/game/iso/edges.ts`(섬 가장자리)

## 고쳐도 되는 파일
- `assets-src/**` (단, `palette.json`은 바꾸지 않아요)
- `scripts/build-assets.mjs`
- `public/assets/**` (스크립트가 만드는 결과물)
- `docs/tasks/codex-12-progress.md` (진행 기록, 새로 만들어요)

그 밖의 파일은 고치지 않아요(`src/**`, `tests/**`, 다른 `docs/**`, `package.json` 등). 바꿔야 할 것 같으면 진행 기록과 최종 보고의 "필요한 변경"에 적어 주세요.

## 공통 규칙
- **팔레트**: 64색이 가득 찼어요. 지금 색만 써요(바꾸거나 늘리지 않아요). 색이 모자라면 가까운 색으로 그리고 진행 기록에 "더 있으면 좋을 색"을 적어요.
- **원본**: 2배 원본은 `assets-src/hires/<kind>/<key>.txt`. 옛 1배 원본은 지우지 않아요(비교·되돌리기용).
- **규격**(asset-spec "고해상도 그림" 그대로):
  - 크기는 정확히 목록 × 2예요.
  - 발은 아래 가운데에서 4px 위, 블록 바닥 마름모의 중심은 위에서 32px이에요.
  - 반투명 픽셀이 없고, 발밑 그림자를 그리지 않아요(게임이 그려요).
- **스타일**: C11처럼 빛은 왼쪽 위, 바깥 외곽선, 3~4단 명암이에요. 장마다 분위기는 달라도 같은 섬으로 보여야 해요. 옛 그림의 색·옷·모양을 이어 가서 학생이 같은 캐릭터·장소로 알아보게 해요.
- **타일 64×32**: C11처럼 행 너비 4, 8, …, 64, …, 4의 마름모예요. 같은 장의 바닥끼리 이음새 없이 맞아요.
- **블록 64×48**: 윗면 마름모(64×32) 아래에 16px 옆면을 붙이고 왼쪽 면을 밝게 해요.
- **캐릭터·겹침 32×48**:
  - 2배 `char-player`·`char-robi`의 같은 프레임에 얹었을 때 머리·손·발밑에 정확히 맞아요(걷기 흔들림, 좌우 반전 포함).
  - 로비 부품 8개를 모두 달아도 서로 겹치지 않고 얼굴 화면을 가리지 않아요.
- **몹·보스**:
  - 크기는 16→32, 24→48, 48→96이에요.
  - 무섭지 않게 그려요. 프레임 3(정화)은 웃는 친구 모습이에요.
  - 보스도 귀엽고 커다란 "고장 난" 친구예요.
- **아이콘 32×32**:
  - 어두운 창(#262c3b)과 크림색 대화창 위에서 모두 또렷하게 보이게, 바깥 외곽선을 짙게 해요.
  - 한 묶음(아이템·카드·예고·칸)은 크기·선 두께·여백을 맞춰요.
- **사람 캐릭터**: 다양한 피부색·나이로 그려요. 성별·직업 고정관념이 없어야 해요(AGENTS.md 콘텐츠 규칙).
- **효과(fx)**: 반투명 대신 밝은 픽셀의 수와 간격으로 사라짐을 표현해요(C1과 같아요).
- 기존 게임의 캐릭터·타일을 따라 그리지 않아요.

## 단계(차례대로 해요)
| 단계 | 이름 | 키 |
|---|---|---|
| 1 | 1장 순서의 숲(17) | `block-hedge`, `block-wall`, `prop-rock`, `prop-stump`, `prop-mushroom`, `prop-door`(2), `prop-key`, `prop-portal`(2), `char-chef`, `char-ranger`, `equip-hat-leaf`, `equip-hat-ranger`, `equip-tool-hammer`, `equip-tool-brush`, `mob-vine-slime`, `mob-bug-worm`, `boss-forest-guardian` |
| 2 | 화면 아이콘·효과(69) | `icon-item-*` 16개, `icon-part-wheel`, `icon-card-*` 14개(`icon-card-scan` 제외), `icon-intent-*` 6개, `icon-robi`, `icon-goal`, `icon-gem`, `icon-cell-tree`, `icon-cell-water`, `icon-cell-rock`, `icon-star`, `icon-star-empty`, `icon-coin`, `icon-heart`, `icon-energy`, `icon-xp`, `icon-bag`, `icon-book`, `icon-gear`, `icon-lock`, `icon-check`, `icon-hint`, `icon-badge-1`~`8`, `fx-hit`, `fx-guard`, `fx-heal`, `fx-purify`, `fx-levelup`, `fx-sparkle` + **`icon-path-step` 다시 그리기**(아래) |
| 3 | 2장 반복의 동굴(9) | `tile-cave`, `block-cave`, `prop-crystal`(2), `prop-stalagmite`, `char-explorer`, `mob-echo-bat`, `boss-bat-king`, `robi-part-memory`, `icon-part-memory` |
| 4 | 3장 갈림길 사막(9) | `tile-sand`, `block-sandstone`, `prop-cactus`, `prop-signal`(2), `char-guide`, `mob-mirage-lizard`, `boss-lizard-chief`, `robi-part-sensor`, `icon-part-sensor` |
| 5 | 4장 데이터 항구(10) | `tile-dock`, `block-crate`, `prop-lighthouse`(2), `prop-buoy`(2), `char-harbor`, `mob-fog-jelly`, `boss-ledger-octo`, `robi-part-lens`, `icon-part-lens`, `icon-card-scan` |
| 6 | 5장 인식의 연구소(9) | `tile-lab`, `block-lab`, `prop-microscope`, `prop-jar`(2), `char-researcher`, `mob-shift-slime`, `boss-shift-king`, `robi-part-learnchip`, `icon-part-learnchip` |
| 7 | 6장 길잡이 천문대(9) | `tile-observatory`, `block-observatory`, `prop-telescope`, `prop-starlamp`(2), `char-astronomer`, `mob-meteor-fox`, `boss-star-fox`, `robi-part-predictor`, `icon-part-predictor` |
| 8 | 7장 프롬프트 공방(7) | `tile-wood`, `prop-easel`, `prop-bookshelf`, `mob-babble-parrot`, `boss-babble-king`, `robi-part-talk`, `icon-part-talk` |
| 9 | 8장 윤리의 성(9) | `tile-castle`, `block-castle`, `prop-mirror`(2), `prop-banner`, `char-keeper`, `mob-fake-shadow`, `boss-bias-golem`, `robi-part-ethics`, `icon-part-ethics` |

- 프레임 수는 `assets.ts` 그대로예요(괄호는 프레임이 여러 개인 키).
- **`icon-path-step` 다시 그리기**(C11 검토): 금색 흙길 위에서 길 안내 발자국이 잘 안 보였어요. 밝은 크림색 발자국에 짙은 외곽선을 둘러서 풀·흙길·돌·물 위에서 모두 보이게 해요(납작한 바닥 표시라는 점은 같아요).
- **1단계 장비 겹침**: 새 모자·도구는 2배 몸에 맞춰요. 옛 1배 겹침과 같은 자리(머리 위, 오른손)를 이어 가요.

## 단계마다 할 일
1. 그 단계의 2배 원본을 그려요.
2. `npm run assets && npm test && npm run build`가 통과해야 해요.
3. 검토판을 만들어요(`assets-preview/`는 커밋되지 않아요).
   - `assets-preview/compare-<단계 번호>.png`: 그 단계 키만 모아 **왼쪽 옛 그림 ×4 / 오른쪽 새 그림 ×2**로 나란히 보여 줘요. 프레임은 전부 보여 줘요. C11의 `pilot-sheet.png`처럼 만들고, 생성 스크립트에 키 목록을 넘기는 방법은 자유예요.
   - 캐릭터·겹침 단계(1단계, 로비 부품이 있는 3~9단계): 2배 몸에 그 단계까지의 겹침을 모두 얹은 10프레임 합성판 `assets-preview/overlays.png`를 새로 만들어요.
4. 진행 기록 `docs/tasks/codex-12-progress.md`에 단계 결과를 적어요(아래 형식).
5. 사용자가 단계마다 커밋하라고 했으면 작업 브랜치 `codex/12-hires-chapters`에 커밋 하나를 해요.
   - 메시지는 `C12-<단계>: <이름> 2배 그림`이에요(예: `C12-1: 1장 순서의 숲 2배 그림`).
   - main·push·머지·브랜치 바꾸기는 하지 않아요.

중간에 멈췄다가 다시 시작하면 진행 기록을 먼저 읽고 끝나지 않은 단계부터 이어서 해요.

## 진행 기록 형식(`docs/tasks/codex-12-progress.md`)
단계마다 아래를 적어요.
- 완료한 키 / 못 한 키
- 아틀라스 크기
- 그림자·불빛 표(소품만). 게임은 캐릭터·몹에는 그림자를 자동으로 깔고, 소품은 Claude가 이 표를 보고 목록(`shadow.ts`, `light.ts`)에 넣어요.

  | 키 | 발밑 그림자 너비(논리 px, 없으면 "없음") | 불빛(높이: 아래에서 그림 높이의 %, 반지름 논리 px, 켜지는 프레임) |
  |---|---|---|
  | 예: `prop-rock` | 20 | 없음 |
  | 예: `prop-lighthouse` | 없음(바닥이 넓은 건물) | 85%, 14, 프레임 1 |

  - 문·아치·이동 문·벽처럼 바닥이 넓거나 그림 바닥이 땅에 닿는 것은 그림자 "없음"이에요.
- 더 있으면 좋을 색(팔레트가 모자랐던 곳)
- Claude가 봐 줬으면 하는 그림, 고민한 점

## 완료 기준(단계마다)
- 그 단계의 키가 모두 `density: 2`이고 PNG·아틀라스 프레임이 정확히 2배예요.
- 아틀라스가 한 장 4096×4096 이내예요.
- `npm test`(팔레트 그대로·2배 크기·반투명 없음 포함)와 `npm run build`가 통과해요.
- `npm run dev` 뒤 `http://localhost:5173/?gallery`에서 새 그림이 옛 그림과 같은 크기로 칸 가운데에 서 있어요.

## 확인 명령
```bash
npm run assets && npm test && npm run build
```

## 최종 보고(마지막 메시지: 모든 단계를 마쳤거나 멈출 때)
- 단계별로 끝낸 것과 남은 키, 커밋 목록
- 아틀라스 크기
- 그림자·불빛 표가 있는 곳(진행 기록), 더 있으면 좋을 색
- Claude가 봐 줬으면 하는 그림, 품질에서 고민한 점
- 필요한 변경(지시서 범위 밖이라 고치지 않은 것)
