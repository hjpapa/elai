# C15 진행 기록 — 마을 불빛 가게

- 기준 커밋: `8cd322e`, 작업 폴더: `C:/code/elai-wt/codex-15`, 브랜치: `codex/15-lightshop`.
- 지시서: `docs/tasks/codex-15-lightshop.md`. 1단계 검증·커밋 뒤 2단계를 진행해요.
- 팔레트·기존 1배 원본·엔진·계약·설정·테스트 파일은 바꾸지 않아요. 검토 서버는 **5176**만 사용해요.
- 임시 그림 9키는 실제 `roomPlaceholders.ts` 함수를 브라우저에서 호출해 `assets-src/reference/c15-placeholders/`에 저장했어요. 재현 도구는 `assets-src/tools/capture-c15-placeholders.js`예요.

## 1단계 — 불빛 가게 건물과 방 소품

- 완료 **4키·13프레임**: `prop-light-shop` 128×96/2, `prop-lightboard` 128×96/2, `prop-light-frame` 224×48/7, `prop-lamp-shelf` 128×64/2. 모두 density 2예요. 이번 단계 미완료 없음. 다음 단계 아이콘 5키는 임시 그림이에요.
- 아틀라스 **2048×2048**, 생성된 222키 모두 2배. 갤러리 계약 **227키·573프레임·638이미지**에서 프레임 크기·논리 표시 크기·기준점 오류 0, pageerror 0.
- `npm run assets`, `npm test` **26파일·306개**, `npm run build`, `node assets-src/tools/check-hires-pipeline.mjs` 통과. 새 원본→PNG 43,520픽셀, 전체 PNG→아틀라스 1,302,272픽셀 불일치 0. 발 기준 아래 검사 1,824픽셀 모두 투명. 액자 1~6의 **58칸**은 각 판 첫 숫자 그림과 정확히 일치해요.
- 비교판 **`assets-preview/compare-15-1.png`**(커밋 제외): 왼쪽 실제 임시 그림 / 오른쪽 새 그림, 모든 프레임과 실제 `lightshop` 10×8 배치의 꺼진/켜진 액자 방 두 장을 넣었어요.
- 5176 별도 체험 `불빛그림`으로 새로 시작 → 실제 걷기로 마을 (8,6) 문 입장 → 가게 안 기계 옆 Space → 6판 목록을 확인했어요. 건물은 처음부터 열린 프레임 1, 전구판은 0.7초 간격으로 0/1 교대예요. 1·2판 열림, 3~6판 잠금도 확인했어요.
- 액자 6자리는 시각 검토 동안만 `light:r1`~`light:r6`을 켰다가 원래대로 복원했어요. 각 액자는 논리16×24·originY 11/12, 좌표 (1,1)~(1,6)에 서요. 이 단계는 6판 전체 성공 검증은 아니에요.
- 그림 품질: 기존 건물과 같은 지붕 시점·문·기단, 보라 지붕/전구 간판/처마 전구로 구별해요. 전구판과 진열대는 실루엣·몸체가 고정되고 전구/숫자 판만 교대해요. 액자는 4px 간격의 밝은 칸과 남색 칸, 다리 끝 y44 접지를 써요. 반투명·발밑 그림자·돈·가격표·실제 브랜드는 없어요. 추가 색 필요 없음.
- Claude 확인: 작은 창에서 전구판의 0·1, 3·5판 액자의 점선 차이와 6판 하트 식별성, 여섯 액자의 방 안 밀도. 조명·그림자 값은 아래 기존 설정을 유지하면 돼요.
- **필요한 변경(범위 밖)**: `src/game/scenes/WorldScene.ts`의 `animateTiles()`는 `type: 'game'`인 소품만 교대해요. `prop-lamp-shelf`는 `type: 'prop'`여서 실제 방에서는 **프레임 0에 고정**돼요. 두 점등 그림은 완성했고 갤러리/비교판에서 확인했으나, 진열대의 0.7초 교대를 원하면 엔진에 해당 키를 추가해야 해요. 지시서에 따라 엔진은 고치지 않았어요.

재생성: `node assets-src/tools/draw-c15-1-shop.mjs` → `node assets-src/tools/draw-c15-1-furniture.mjs` → `node assets-src/tools/draw-c15-1-frames.mjs` → `npm run assets` → `node assets-src/tools/preview-c15.mjs 1` → `node assets-src/tools/check-c15.mjs 1`.

브라우저 증거/실행 도구는 `C:/Users/tbose/.codex/visualizations/2026/11/04/01a1a6c9-8349-7712-84d3-50667c5011e1/output/playwright/`의 `c15-stage1-village-shop.png`, `c15-stage1-room-off.png`, `c15-stage1-room-on.png`, `c15-stage1-rounds.png`, `c15-stage1-world.js`, `c15-gallery-check.js`예요.

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 켜지는 프레임) |
|---|---|---|
| `prop-light-shop` | 없음(건물) | 28%, 12, 프레임 1, 금색 — 기존 설정 유지 |
| `prop-lightboard` | 없음(넓은 받침) | 70%, 12, 프레임 0·1, 금색 — 기존 설정 유지 |
| `prop-light-frame` | 없음 | 55%, 6, 프레임 1~6, 금색 — 기존 설정 유지 |
| `prop-lamp-shelf` | 없음(넓은 바닥) | 60%, 10, 프레임 0·1, 금색 — 기존 설정 유지 |
