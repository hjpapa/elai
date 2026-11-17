# C18 마을 지도방 진행 기록

- 작업 폴더 `C:/code/elai-wt/codex-18`, 브랜치 `codex/18-maproom`, 기준 `08d6186`.
- 지시서 `docs/tasks/codex-18-maproom.md`의 1→2단계 순서로 작업해요. 원본/전용 도구/생성물/이 기록만 바꿔요. 엔진·계약·팔레트·설정·기존 테스트는 그대로예요.
- 5176 별도 로컬 체험 `지도산책` 사용. 5173이나 학급 서버 저장은 사용하지 않아요.
- 실제 임시 그림 5키는 `roomPlaceholders.ts` 함수를 브라우저에서 호출해 `assets-src/reference/c18-placeholders/`에 보관했어요. 재현 도구 `assets-src/tools/capture-c18-placeholders.js`.

## 1단계 — 지도방 건물과 방 소품

- 완료 **4키·12프레임**, 모두 density 2: `prop-route-house` 128×96/2, `prop-route-table` 128×96/2, `prop-route-map` 224×48/7, `prop-globe` 32×48/1. 이번 단계 못 한 키 없음. 다음 단계 `icon-card-followWave`는 임시 그림이에요.
- 초록 박공 지붕·지도/깃발 간판·나침반 진열창으로 다른 마을 건물과 구분해요. 집은 문 닫힘/열림과 창 불빛만 달라요. 나무 탁자의 몸체·미로·로봇·깃발은 고정이고 깃발 발치의 청록 고리만 작게/크게 바뀌어요.
- 벽 지도는 밝은 종이·청록 길·빨간 깃발·짙은 회색 바위예요. 빈 지도에는 옅은 격자와 접힌 자국이 있어요. 1~6프레임은 각 판 첫 미로에서 너비 우선 탐색으로 구한 최단 경로예요. 4px 간격, 다리 끝 y44 접지. 지구본은 나라 이름/국경 없이 둥근 땅 덩어리와 넓은 받침을 그렸어요.
- `npm run assets`, `npm test` **27파일·359개**, `npm run build` 통과. `node assets-src/tools/check-c18.mjs 1` 통과: 새 원본→PNG **36,864픽셀**, 발밑 **1,536픽셀 투명**, 전체 PNG→아틀라스 **1,344,256픽셀 일치**. 지도 **122칸**이 지시서/미로와 일치하고 경로 길이도 최단 거리와 같아요.
- 아틀라스 **2048×2048** 한 장, 생성된 231키 모두 density 2. 갤러리 계약 232키·586프레임·651이미지의 크기/원점 오류 0, 페이지 오류 0. 팔레트 기존 64색 유지, 반투명·발밑 그림자 없음.
- 실제 마을에서 `(8,13)` 집까지 걸어 입장했어요. 처음부터 열린 프레임 1, 논리32×48. 실내 지도 여섯 자리 `(1,1~6)`의 빈/완성 모습, 논리16×24·originY 11/12를 확인했어요. 완성 플래그는 촬영 후 원래 상태로 복원했어요.
- 탁자 프레임 0·1 교대 확인, 지구본은 프레임 0. 탁자 옆 `(5,3)`에서 Space → 코딩 길찾기 6판 목록 열기 확인. 1·2판 열림/3~6판 잠금 정상, 페이지 오류 0. 6판 성공 검사는 아직 하지 않았어요.
- 비교판 `assets-preview/compare-18-1.png`: 실제 임시/새 그림 모든 프레임, 실제 maproom과 동일한 10×8 배치의 빈/완성 지도 방 두 장. 검토판은 커밋되지 않아요.
- Claude 확인: 작은 창에서 간판의 지도·깃발 식별, 탁자의 작은 물결 교대, 얇은 지도 경로와 종이의 대비. 추가 색 필요 없음. 필요한 범위 밖 변경 없음.
- 도구 작성 중 Python의 한글 소스 인코딩 오류는 UTF-8로 파일을 읽어 실행하는 방식으로 해결했어요. 최종 생성/검증 도구는 Node.js예요.

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 켜지는 프레임) |
|---|---|---|
| `prop-route-house` | 없음(건물) | 28%, 12, 프레임 1, 금색 — 기존 설정 유지 |
| `prop-route-table` | 없음(넓은 바닥) | 55%, 10, 프레임 0·1, 청록 — 기존 설정 유지 |
| `prop-route-map` | 없음(두 발과 뒤 받침) | 없음 |
| `prop-globe` | 없음(넓은 받침) | 없음 |

재생성: `node assets-src/tools/draw-c18-1-house.mjs` → `node assets-src/tools/draw-c18-1-furniture.mjs` → `node assets-src/tools/draw-c18-1-maps.mjs` → `npm run assets` → `node assets-src/tools/preview-c18.mjs 1` → `node assets-src/tools/check-c18.mjs 1`.

브라우저 증거: `C:/Users/tbose/.codex/visualizations/2026/11/04/01a1a6c9-8349-7712-84d3-50667c5011e1/output/playwright/`의 `c18-stage1-*`, `c18-gallery-1-result.txt`.
