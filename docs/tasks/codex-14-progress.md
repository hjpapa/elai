# C14 진행 기록 — 마을 택배소

- 작업 기준: `119cd22`, 작업 폴더 `C:/code/elai-wt/codex-14`, 브랜치 `codex/14-parcel`.
- 지시서: `docs/tasks/codex-14-parcel.md`. 단계 순서대로 검증한 뒤 단계마다 커밋해요.
- 엔진·계약·팔레트·기존 1배 원본은 변경하지 않아요. 검토 서버는 5176만 사용해요.
- 실제 임시 그림 11개는 `assets-src/reference/c14-placeholders/`에 보관했어요. `capture-c14-placeholders.js`가 엔진의 임시 그림 함수를 호출해 얻은 기준본이에요.

## 1단계 — 택배소 건물과 방 소품

- 완료 4키·7프레임: `prop-parcel-office` 128×96/2, `prop-sorter` 128×96/2, `prop-parcel-stack` 64×48/2, `prop-parcel-pile` 64×64/1. 모두 density 2예요.
- 이번 단계 미완료 없음. 다음 단계 7키는 아직 임시 그림: `prop-sort-basket`, `icon-sort-heart`, `icon-sort-star`, `icon-sort-ball`, `icon-card-sendLeft`, `icon-card-sendRight`, `icon-stamp`.
- 아틀라스 **2048×2048**, 생성된 211키 전부 2배. 갤러리 계약 218키·555프레임·620이미지에서 프레임 크기/논리 표시 크기/기준점 오류 0, pageerror 0.
- `npm run assets`, `npm test` **22파일·247개**, `npm run build` 통과.
- `assets-preview/compare-14-1.png`: 왼쪽 실제 임시 그림/오른쪽 새 그림, 모든 프레임, 실제 parcel 맵 배치의 방 합성. 검토판은 커밋하지 않아요.
- 5176 체험 저장 `택배그림`으로 마을에서 문 닫힘 0 → 복구 플래그 → 열림 1 → 실제 이동/택배소 입장 → 기계 옆 Space로 놀이 목록 열기를 확인했어요. 분류기 프레임 0/1 교대도 확인했어요.
- 상자 여섯 자리의 실제 좌표와 논리 크기, 기준점을 확인했어요. 이 단계에서는 시각 확인 동안만 여섯 도장 플래그를 켰다가 원래대로 돌렸어요. 여섯 판 완료 검증은 아직 아니에요.
- 그림: 집·공방과 같은 시점/지붕, 파란 지붕과 상자 간판. 분류기는 벨트 2물리 px 이동과 전구 교대만 바뀌고 몸체는 고정돼요. 작은 더미는 40/60px에서도 하트/별로 구별해요. 장식 더미의 주소 칸은 비어 있어요.
- 알파는 0/255만, 소품 발 기준선 아래 불투명 픽셀 없음. 분류기는 발 기준 y92에 중앙 접점 1px가 있고 아래 3줄은 투명하며, 나머지 세 소품은 하단 4줄이 투명이에요. office와 stack의 두 프레임은 외곽 실루엣이 같아요. 바닥 그림자를 굽지 않았어요.
- 추가 색 필요 없음. Claude 확인: 작은 크기에서 상자 간판/열린 문, 분류기 벨트의 0.7초 움직임, 창 앞 여섯 더미의 시각 밀도. 필요한 범위 밖 변경 없음.

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 프레임) |
|---|---|---|
| `prop-parcel-office` | 없음(건물) | 28%, 12, 프레임 1, 금색 — 기존 설정 유지 |
| `prop-sorter` | 없음(넓은 바닥) | 80%, 10, 프레임 0·1, 청록 — 기존 설정 유지 |
| `prop-parcel-stack` | 없음 | 없음 |
| `prop-parcel-pile` | 없음 | 없음 |

재생성: `node assets-src/tools/draw-c14-1-office.mjs`, `node assets-src/tools/draw-c14-1-sorter.mjs`, `node assets-src/tools/draw-c14-1-parcels.mjs` → `npm run assets` → `node assets-src/tools/preview-c14.mjs 1`.

브라우저 증거와 실행 도구: `C:/Users/tbose/.codex/visualizations/2026/11/04/01a1a6c9-8349-7712-84d3-50667c5011e1/output/playwright/`의 `c14-stage1-office-closed.png`, `c14-stage1-office-open.png`, `c14-stage1-parcel.png`, `c14-stage1-parcel-all-stacks.png`, `c14-stage1-sort-list.png`, `c14-gallery-check.js`, `c14-stage1-world.js`. 실물 휴대폰 검증은 아니에요.


## 2단계 — 놀이 판 그림

- 완료 7키·8프레임: `prop-sort-basket` 64×32/2, `icon-sort-heart`, `icon-sort-star`, `icon-sort-ball`, `icon-card-sendLeft`, `icon-card-sendRight`, `icon-stamp` 각 32×32/1. 모두 density 2예요.
- 새 그림 총 11키·15프레임 완료, 못 한 키 없음. 전체 218키·555프레임이 2배이며 아틀라스는 **2048×2048**, 띠 직사각형 합계 기준 사용률 **30.01%**(패딩 제외)예요.
- `npm run assets`, `npm test` **22파일·247개**, `npm run build` 통과. 갤러리 620이미지의 크기/기준점 오류 0, pageerror 0. 생성 PNG와 아틀라스 1,258,752픽셀 불일치 0. C14 11키+벽 원본의 PNG 대응·팔레트·알파 검사 43,008픽셀 통과, 소품 발 기준선 아래 불투명 픽셀 0.
- 비교판 `assets-preview/compare-14-2.png`에 임시/새 그림의 모든 프레임을 넣었어요. `c14-2-items-sizes.png`는 40/48/60px, 밝은 칸/어두운 벨트, 원색/회색조를 함께 보여 줘요. 하트와 별은 실루엣 590px 및 외곽 86px이 같고 색과 표식만 달라요. 공은 둥근 대칭 실루엣이에요.
- 바구니는 몸체를 고정하고 내용물만 바뀌어요. 두 보내기 카드는 화살표만 좌우로 바꾸고 광원은 둘 다 왼쪽 위로 유지해요. 도장은 받기 전 회색, 받은 뒤 원색 40px와 결과 96px을 확인했어요.
- 5176 체험에서 지시서대로 메모리 칩/센서만 추가해 잠금을 열고 **6판 모두 실제 편집기 버튼으로 프로그램 작성·실행 → 별 3개 성공**을 확인했어요. 사용 블록 수는 순서대로 3/5/3/4/4/4개예요. 3·4판은 반복, 5판은 하트 조건, 6판은 둥근 물건 조건으로 세 줄 모두 성공했어요.
- 바구니 비움→담김 프레임 전환, 판마다 도장 플래그 추가, 최종 6도장 원색 표시, `분류 대장` 칭호, 실제 완료에 따른 방의 6더미 표시를 확인했어요. 이 단계의 최종 6더미는 시각용 플래그 주입이 아닌 실제 놀이 결과예요.
- 데스크톱 물건 약39.6~45.0px, 바구니58.4px, 명령 카드28px. 390×844에서는 물건32.3~35.9px·바구니46.0px에서도 하트/별/공을 직접 구별했어요. 실물 휴대폰 테스트는 아니에요.
- 1단계 기록의 발 설명을 정정했어요. 분류기 중앙의 마지막 1px는 발 기준 y92 위에 있고 그 아래 3행이 투명이에요. 나머지 1단계 소품은 하단 4행이 투명해요. 기준선 아래 픽셀은 모두 없으며 그림 자체는 변경하지 않았어요.
- 추가 색 필요 없음. Claude 확인: 작은 크기에서 별 끝과 하트 홈, 어두운 벨트 위 윤곽, 28px 카드 화살표, 받기 전 희미한 도장, 가득 쌓인 방의 밀도.
- 필요한 변경: 그림 연결에는 없음. 선택 후속으로 390px 폭의 6판 안내문에서 `오른쪽이에요`가 줄 중간에 갈려 전체 3줄이 되는 기존 표시를 다듬으려면 Claude가 `src/ui/styles.css`의 안내문 폭/줄바꿈을 검토해 주세요. 이 파일은 범위 밖이라 수정하지 않았어요.

| 키 | 발밑 그림자 너비(논리 px) | 불빛 |
|---|---|---|
| `prop-sort-basket` | 없음(넓은 바닥) | 없음 |

재생성: `draw-c14-2-items.mjs`, `draw-c14-2-cards.mjs`, `draw-c14-2-basket-stamp.mjs`(모두 `assets-src/tools/`) → `npm run assets` → `node assets-src/tools/preview-c14.mjs 2`.

브라우저 증거: 위 `output/playwright/` 폴더의 `c14-stage2-empty-stamps.png`, `c14-stage2-r1-program.png`~`c14-stage2-r6-program.png`, `c14-stage2-r1-success.png`~`c14-stage2-r6-success.png`, `c14-stage2-basket-filled.png`, `c14-stage2-mobile-board.png`, `c14-stage2-all-stamps.png`, `c14-stage2-earned-stacks.png`. 실제 클릭 재현 스크립트 `c14-stage2-*.js`, 픽셀 검증 `c14-audit.mjs`도 같은 폴더에 있어요.

## 3단계 — 동굴 벽 윗면 다듬기

- 완료: `block-cave` 64×48·1프레임·density 2. 이번 단계/전체 미완료 키 없음.
- C13 바닥과 같은 가는 돌 틈을 쓰되, 벽 윗면은 한 톤 낮춘 d 바탕 970px / S 가는 틈 94px / f 돌턱 18px / 흐린 광맥 6px로 정리했어요. 바닥과 벽이 같은 기본색이면 실제 되풀이 동굴에서 통로 구분이 약해져, 최종안은 벽의 기본색만 낮췄어요.
- 밝은 광물 22px → 0, 밝은 판돌 f/i 175px → 짧은 돌턱 f 18px. 윗면 마름모 1,088px 중 891px 변경, 윗면 밖 1,984px(옆면·투명 영역) 차이 **0**, 투명 마스크 차이 **0**. 전체 불투명 2,112px, 알파 0/255예요.
- 기준본 `assets-src/reference/c14-block-cave-before.txt`와 `.png`를 보관했어요. PNG의 Git blob은 시작점 `119cd22`와 동일해요. 기존 1배 벽·C13 바닥은 그대로예요.
- `assets-preview/compare-14-3.png`: 옛/새 벽, C13 바닥과 연결한 4×4 및 기존 수정을 함께 보여 줘요. 별도 `c14-3-cave-wall-small.png`, `c14-3-cave-wall-wide.png`(12×12), `c14-3-cave-wall-tones.png`(첫 색안/최종 색안)도 직접 확인했어요. 모두 검토용이며 커밋하지 않아요.
- 실제 `cave`의 바닥320개·벽98개, `cavedeep`의 바닥330개·벽283개를 전후 비교했어요. 최종안에서 밝은 통로와 어두운 벽 윗면이 구별되고 기존 남색 옆면으로 높이가 남아요. 벽 원본64×48·논리 표시32×24·origin(0.5, 2/3), 즉 논리 y16 기준을 확인했어요.
- 동굴 검토는 맵을 재시작하고 안개를 공개한 시각 검토 상태이며 2장 전체 완료 검증은 아니에요. 검토 후 원래 택배소 체험 상태를 복구했고 새로 열어 실제 도장6개/상자6더미가 남은 것을 확인했어요.
- `npm run assets`, `npm test` **22파일·247개**, `npm run build`, 기존 `check-hires-pipeline.mjs` 통과. 최종 픽셀 검사에서 C14 11키+벽 원본→PNG 43,008픽셀, 전체 PNG→아틀라스 1,258,752픽셀 불일치 0. 갤러리 **218키·555프레임·620이미지**, 모두 density 2, 크기/기준점 오류 0, pageerror 0, 콘솔 오류/경고 0.
- 아틀라스 **2048×2048**, 원본 누락 **0**, 띠 면적 합계 기준 사용률 **30.01%**(패딩 제외).
- 새 소품이 없는 단계이므로 추가 그림자·불빛 항목은 없어요. 기존 수정 그림/불빛은 바꾸지 않았어요. 추가 색 요청 없음.
- Claude 확인/품질 판단: 되풀이 동굴에서 길과 벽의 밝기 차이, 작은 화면의 돌턱, 단일 타일이라 남는 가는 균열의 반복을 봐 주세요. 밝은 판돌·광물의 반복은 크게 줄였고 옆면은 픽셀 단위로 보존했어요.
- 필요한 범위 밖 변경: 이번 동굴 그림에는 없음. 2단계에서 기록한 휴대폰 안내문 줄바꿈은 선택 후속이에요.

재생성 순서: 예전 `draw-c12-3-world.mjs`를 실행했다면 **`node assets-src/tools/draw-c13-4-cave.mjs` → `node assets-src/tools/draw-c14-3-cave-wall.mjs` → `npm run assets` → `node assets-src/tools/preview-c14.mjs 3`** 순서로 돌려 주세요. C14 벽 도구는 보관 기준본에서 시작하므로 옆면을 누적해서 바꾸지 않아요. 전체 그림을 다시 만들 때 C13 바닥과 C14 벽 보정을 마지막에 실행해요.

브라우저 증거: 위 `output/playwright/`의 `c14-stage3-before-cave.png`, `c14-stage3-before-cavedeep.png`, `c14-stage3-after-cave.png`, `c14-stage3-after-cavedeep.png`, `c14-final-parcel.png`; 재현 도구 `c14-caves-before.js`, `c14-caves-after.js`, `c14-final-parcel.js`.

## 최종 전달

- 1~3단계 완료: 새 그림11키·15프레임 + 기존 동굴 벽1키 재작화. 남은 키 없음.
- 단계1 `42226ca` — `C14-1: 택배소 건물과 방 소품 2배 그림`.
- 단계2 `b71877e` — `C14-2: 놀이 판 그림 2배 그림`.
- 단계3 해시는 이 문서를 포함하는 `C14-3: 동굴 벽 윗면 다듬기` 커밋에서 확인해 주세요.
- 허용된 `assets-src/**`, 생성된 `public/assets/**`, 이 진행 기록만 수정했어요. 엔진·계약·팔레트·기존 1배 원본·설정·테스트·공용 도구는 변경하지 않았어요. 별도 읽기 전용 검토에서도 신규11키 규격과 변경 범위를 확인했어요.
- 그림자·불빛은 1단계/2단계 표의 기존 설정을 유지하면 돼요. 추가 팔레트 색은 요청하지 않아요.
- Claude 검토 우선순위: 작은 하트/별/공 및 보내기 화살표 식별성 → 동굴의 통로 구분/균열 반복 → 휴대폰 안내문 줄바꿈. 기능상 필수 후속 변경은 없어요.
- 작업은 `C:/code/elai-wt/codex-14`의 `codex/14-parcel`에서만 했어요. main 커밋·브랜치 전환·push·merge·배포는 하지 않았고, 포트5173도 사용하지 않았어요.
