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

## 2단계 — 놀이 판 그림

- 완료 **5키·5프레임**: `icon-bulb-off`, `icon-bulb-on`, `icon-light-brush`, `icon-card-lightOn`, `icon-card-nextRow`, 각각 32×32·density 2. 이번 단계와 C15 전체 남은 그림 키 없음.
- C15 합계 **9키·18프레임**. 전체 **227키·573프레임**, 모두 density 2, 원본 누락 0. 아틀라스 **2048×2048** 한 장을 유지해요.
- `npm run assets`, `npm test` **26파일·306개**, `npm run build`, `node assets-src/tools/check-c15.mjs 2` 통과. C15 원본→PNG 48,640픽셀, 전체 PNG→아틀라스 1,307,392픽셀 불일치 0. 팔레트는 기존 64색, 알파 0/255, 액자 58칸 일치. 갤러리 227키·573프레임·638이미지의 프레임 크기·논리 크기·기준점 오류 0, pageerror 0.
- 비교판 **`assets-preview/compare-15-2.png`**(커밋 제외): 임시/새 그림 5종, 어두운 전구판 위 꺼짐·켜짐·붓, 숫자 판 위치, 회색조를 함께 보여 줘요. 개별 `c15-bulbs-draft.png`, `c15-cards-draft.png`는 28/40/48/60px 식별성을 확인한 검토판이에요.
- 전구 몸체 352px의 모양·위치와 소켓 색을 그대로 맞추고, 켜짐에만 짧은 빛줄기 12px를 더했어요. 동일 몸체의 회색조 가중 평균 밝기는 **93.57 → 186.87**(0~255)로 구별돼요. 숫자는 UI가 붙이므로 그림에 넣지 않았어요.
- 붓은 보라 로봇 머리·눈 두 개·아래로 모이는 빛나는 붓끝이에요. 마지막 불투명 y18, 하단 **13행 투명**으로 실제 CSS가 올려 놓는 위치에서 전구와 겹치지 않게 했어요. 켜기/다음 줄 카드는 기존 카드와 동일한 투명 마스크·2px 여백, 다음 줄은 오른쪽 위에서 아래→왼쪽으로 꺾여요.
- 지시서가 허용한 체험 저장의 메모리 칩·데이터 렌즈·학습 칩으로 잠금을 열고, **6판 모두 실제 편집기 버튼으로 프로그램 작성·실행 → 별 3개 성공**을 확인했어요. 최적 블록 수는 4/8/4/5/4/6개예요. 4판 중첩 반복, 5·6판 숫자 조건으로 각각 다른 그림 세 장 모두 성공했어요.
- 실제 성공으로 `light:r1`~`light:r6`과 **불빛 화가** 칭호를 얻었어요. 방의 여섯 액자와 새로고침·이어하기 뒤 별/플래그/칭호 복원을 확인했어요. XP·코인은 0을 유지해요. 학습 미션을 자연 진행해 해금한 검증이나 학급 서버 저장 검증은 아니에요.
- 320/390/720/1360px × 6판, **24조합**을 확인했어요. 안내문 모두 2줄·가로 넘침 0, 붓의 불투명 픽셀과 전구/숫자 글자 경계 겹침 0. 전구 원본32×32, 실제 표시 폭 약18.7~55.5px, 명령 카드28px을 확인했어요. 실물 휴대폰 테스트는 아니에요.
- **필요한 변경(범위 밖)**: 기존 `.light-cell`은 정사각형인데 `.light-code`의 글자 높이는 고정돼 있어 **320px 3·5·6판, 390px 3·5판에서 숫자 판이 전구 아랫부분과 겹쳐요**. 소스는 수정하지 않았어요. 브라우저에만 `.light-cell { width:100%; min-height:48px; }`을 임시 적용했을 때 320/390px의 3·5·6판 여섯 사례 모두 겹침 0을 확인한 뒤 임시 스타일을 제거했어요. Claude가 `src/ui/styles.css`에서 작은 화면의 칸 높이·전구·숫자 배치를 검토해 주세요. 이 제안은 전체 반응형 CSS를 검증한 확정 수정안은 아니에요.
- 추가 색 요청 없음. Claude 확인: 작은 크기 전구 소켓과 숫자 판의 여유, 붓의 눈/끝 식별성, 28px 다음 줄 방향, 실제 숫자 그림과 보상 액자의 일치. 새 UI 아이콘은 발밑 그림자·맵 불빛 대상이 아니에요.

재생성: `node assets-src/tools/draw-c15-2-bulbs.mjs` → `node assets-src/tools/draw-c15-2-brush.mjs` → `node assets-src/tools/draw-c15-2-cards.mjs` → `npm run assets` → `node assets-src/tools/preview-c15.mjs 2` → `node assets-src/tools/check-c15.mjs 2`.

브라우저 증거/실행 도구는 위 `output/playwright/`의 `c15-stage2-r1-program.png`~`c15-stage2-r6-program.png`, `c15-stage2-r1-success.png`~`c15-stage2-r6-success.png`, `c15-stage2-bulbs-on-off.png`, `c15-stage2-mobile-board.png`, `c15-stage2-earned-frames.png`, `c15-layout-320-r3.png` 등, `c15-stage2-final-result.txt`, `c15-layout-proposal-result.txt`, `c15-stage2-*.js`예요.

## 최종 전달

- 1→2단계 순서대로 그림 9키·18프레임 완료. 남은 그림 키 없음. 각 단계의 필수 assets/test/build가 통과했고 각각 한 커밋으로 저장해요.
- 1단계 **`0ee9030`** — `C15-1: 불빛 가게 건물과 방 소품 2배 그림`.
- 2단계 해시는 이 문서를 포함하는 `C15-2: 불빛 그림 놀이 판 2배 그림` 커밋에서 확인해 주세요.
- 그림자·불빛은 1단계 표의 기존 값을 유지하면 돼요. 추가 팔레트 색은 필요 없어요.
- 허용 경로의 원본·전용 작성/검토 도구·임시 그림 기준본·생성물·이 진행 기록만 변경했어요. 엔진·계약·팔레트·기존 1배 원본·설정·테스트·공용 생성기는 변경하지 않았어요. 독립 읽기 전용 검토에서도 규격·픽셀·변경 범위를 확인했어요.
- 남은 범위 밖 후속은 **진열대 0/1 교대 연결**과 **작은 화면 숫자 판/전구 겹침** 두 가지예요. 그림 원본은 준비됐으며 관련 위치와 검증 근거는 위 단계에 적었어요.
- 작업은 `C:/code/elai-wt/codex-15`의 `codex/15-lightshop`에서만 했어요. main 변경·브랜치 전환·push·merge·배포는 하지 않았고, 포트5173은 쓰지 않았어요.
