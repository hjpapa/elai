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
- 알파는 0/255만, 소품 발 아래 4줄 투명. office와 stack의 두 프레임은 외곽 실루엣이 같아요. 바닥 그림자를 굽지 않았어요.
- 추가 색 필요 없음. Claude 확인: 작은 크기에서 상자 간판/열린 문, 분류기 벨트의 0.7초 움직임, 창 앞 여섯 더미의 시각 밀도. 필요한 범위 밖 변경 없음.

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 프레임) |
|---|---|---|
| `prop-parcel-office` | 없음(건물) | 28%, 12, 프레임 1, 금색 — 기존 설정 유지 |
| `prop-sorter` | 없음(넓은 바닥) | 80%, 10, 프레임 0·1, 청록 — 기존 설정 유지 |
| `prop-parcel-stack` | 없음 | 없음 |
| `prop-parcel-pile` | 없음 | 없음 |

재생성: `node assets-src/tools/draw-c14-1-office.mjs`, `node assets-src/tools/draw-c14-1-sorter.mjs`, `node assets-src/tools/draw-c14-1-parcels.mjs` → `npm run assets` → `node assets-src/tools/preview-c14.mjs 1`.

브라우저 증거와 실행 도구: `C:/Users/tbose/.codex/visualizations/2026/11/04/01a1a6c9-8349-7712-84d3-50667c5011e1/output/playwright/`의 `c14-stage1-office-closed.png`, `c14-stage1-office-open.png`, `c14-stage1-parcel.png`, `c14-stage1-parcel-all-stacks.png`, `c14-stage1-sort-list.png`, `c14-gallery-check.js`, `c14-stage1-world.js`. 실물 휴대폰 검증은 아니에요.
