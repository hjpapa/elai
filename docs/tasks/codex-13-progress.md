# C13 — 마을 공방 그림 진행 기록

작업 브랜치: `codex/13-workshop` · 기준 커밋: `3439879` · 검토 포트: **5176만 사용**.
기존 1배 원본, 팔레트 64색, 계약/엔진/설정 파일은 보존해요. 공개 배포·push·merge는 하지 않아요.

## 1단계 — 공방 건물과 방

- 완료 11키: `prop-workshop`, `tile-room`, `tile-rug`, `tile-doormat`, `block-room-wall`, `block-room-window`, `prop-workbench`, `prop-toybox`, `prop-plant`, `prop-floorlamp`, `prop-cushion`. 모두 density 2, 합계 13프레임.
- 이번 단계 미완료 없음. 후속 10키(기계/집게/아이콘 4, 인형 6)는 임시 그림을 유지해요.
- 아틀라스 **2048×2048**, 전체 197키가 density 2예요.
- 생성기: 원본 둘 다 없는 키는 manifest/atlas에서 제외하고 개수·키를 출력해요. 잘못된 기존/2배 원본은 계속 거절해요. 새 2배 원본만 있어도 작동해요.
- 비교판: `assets-preview/compare-13-1.png`(11키 모든 프레임 + workroom의 실제 10×8 배치). 왼쪽은 엔진 `roomPlaceholders.ts` 함수를 브라우저 Canvas에서 그대로 실행한 기준본이에요. `assets-src/reference/c13-placeholders/`에 보관했고, 게임 원본/팔레트 검사에는 쓰지 않아요.
- 검증: `npm run assets`, `npm test` **21파일·229개**, `npm run build`, `node assets-src/tools/check-hires-pipeline.mjs` 통과. 4×4 마루 빈틈 0·경계 색 불일치 0, 양쪽 벽 80px 측면·y96 기준점·굽도리 연결 확인.
- 브라우저: 5176에서 가상 별명 `그림검토`로 새 로컬 체험을 만들고 실제 길찾기/걷기로 마을 (19,7) 공방 문을 밟아 실내 (6,6) 진입. 새 그림을 읽은 갤러리 207키·540프레임·605이미지의 크기/기준점 오류 0, pageerror 0. 실내 벽/깔개/가구 직접 확인. Supabase 미설정 환경이라 처음부터 로컬 체험 화면이었어요.
- 품질: 공방은 C11 집의 시점과 지붕을 유지하고 중앙 문·로비 간판·따뜻한 진열창으로 구별해요. 열린 문은 안쪽 깊이와 젖힌 문짝으로 구별해요. 마루 나뭇결 대비를 낮췄고, 깔개는 칸 테두리 없는 천이에요. 방석 높이는 물리 10px이에요.
- Claude 확인: 작은 화면에서 작업대 공구 가독성, 3단계 인형을 얹었을 때 방석 접지. 추가 색은 필요 없어요.
- 필요한 변경: 필수 없음. 공방 열린 문에 선택적으로 금색 불빛을 넣으려면 아래 표를 참고해 `src/game/light.ts`에서 연결해 주세요(범위 밖이라 수정하지 않음).

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 프레임) |
|---|---|---|
| `prop-workshop` | 없음 | 선택: 28%, 12, 프레임 1, 금색 |
| `prop-workbench` | 없음 | 없음 |
| `prop-toybox` | 없음 | 없음 |
| `prop-plant` | 10(기존 유지) | 없음 |
| `prop-floorlamp` | 8(기존 유지) | 80%, 10, 프레임 0, 금색(기존 유지) |
| `prop-cushion` | 없음 | 없음 |

재생성: `node assets-src/tools/draw-c13-1-workshop.mjs`, `node assets-src/tools/draw-c13-1-furniture.mjs`, `node assets-src/tools/draw-c13-1-room.mjs` → `npm run assets` → `node assets-src/tools/preview-c13.mjs 1`.
임시 그림 기준본 추출 도구 `assets-src/tools/capture-c13-placeholders.js`는 5176 갤러리에서 Playwright CLI `run-code --filename`으로 실행해요. 반환된 각 `png`는 base64 PNG예요.
