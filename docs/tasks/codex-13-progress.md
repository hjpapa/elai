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

## 2단계 — 인형뽑기 기계와 놀이 그림

- 완료 4키: `prop-claw-machine`, `prop-claw`, `icon-claw-exit`, `icon-card-grab`. 모두 density 2, 합계 6프레임. 이번 단계 미완료 없음; 남은 키는 3단계 인형 6키예요.
- 아틀라스 **2048×2048**, 전체 201키가 density 2예요. 비교판 `assets-preview/compare-13-2.png`에 임시/새 그림의 모든 프레임을 모았어요.
- 검증: `npm run assets`, `npm test` **21파일·229개**, `npm run build` 통과. 갤러리 전체 207키·540프레임의 크기/기준점 오류 0, pageerror 0. 이 단계 빌드에는 Vite 플러그인 소요시간 안내가 있었으나 성공했어요.
- 실제 놀이: 기계 간판 프레임 0/1 교대를 관찰하고 Space로 열었어요. 첫 판에서 위·위·오른쪽·오른쪽·집기 5블록을 클릭/실행해 별 3개, `doll:dummy` 보상을 확인했어요. 집게 내려감→오므림→인형 들기→출구 전달 장면과 성공 화면을 캡처하고 직접 봤어요. 이 단계의 인형 자체는 아직 1배 임시 그림이에요.
- 품질: 넓은 유리 2면에 집게와 섬 친구들이 보이고, 앞 출구/분홍 몸체/청록 간판이 구분돼요. 조작 패널로 오해할 수 있는 옆면 장식은 하트 천 모양으로 바꿨어요. 구조는 고정하고 간판 278px만 색이 바뀌어요.
- 집게는 위 중앙 줄을 유지하고 닫힘 중앙 6px를 비워 인형 얼굴을 가리지 않아요. 출구는 연보라 판과 대비되는 줄무늬, 집기 카드는 기존 카드와 같은 2px 여백/테두리를 사용해요.
- Claude 확인: 작은 기계 유리 속 인형과 출구 가독성, 청록 불빛 강도. 추가 색 필요 없음. 필요한 변경 없음.

| 키 | 발밑 그림자 너비(논리 px) | 불빛(아래에서 높이 %, 반지름 논리 px, 프레임) |
|---|---|---|
| `prop-claw-machine` | 없음 | 82%, 12, 프레임 0·1, 청록(기존 유지, 물리 y13 간판 중심) |
| `prop-claw` | 없음(UI 집게) | 없음 |

재생성 도구: `draw-c13-2-machine.mjs`, `draw-c13-2-claw.mjs`, `draw-c13-2-icons.mjs`(모두 `assets-src/tools/`) → `npm run assets` → `node assets-src/tools/preview-c13.mjs 2`.

## 3단계 — 섬 친구 인형

- 완료 6키: `prop-doll-dummy`, `prop-doll-slime`, `prop-doll-bug`, `prop-doll-bat`, `prop-doll-guardian`, `prop-doll-robi`. 각각 32×32·1프레임·density 2. 미완료 키 없음.
- C13 새 그림 **21키·25프레임 완료**, 생성기 출력은 **원본이 없는 키 0개**예요. 전체 **207키·540프레임**, 아틀라스 **2048×2048**를 유지해요.
- 검증: `npm run assets`, `npm test` **21파일·229개**, `npm run build` 통과. 갤러리의 모든 키가 density 2, 크기/기준점 오류 0, pageerror 0.
- 비교판: `assets-preview/compare-13-3.png`(임시/새 인형 6종 + 동일 발 기준의 방석 합성). 각 담당 검토판에는 정화 몹 원본·32/48px·밝은/어두운 배경도 있어요.
- 실제 놀이 첫 판을 새 32×32 인형으로 재실행해 집기/운반/별 3개 성공 화면을 확인했어요. 집게 아래에서 얼굴이 보이고 보상 그림도 정상이에요.
- 실내 6개 자리 확인: 시각 검토 동안만 인형 보유 플래그 6개를 켰다가 복원했어요. 모든 인형은 원본 32×32·논리 16×16·originY 0.875로 각각 방석과 같은 좌표에 앉아요. 진열장 6종도 원본 32×32 → 표시 48×48을 확인했어요. **6판 전체를 실제 완료했다는 뜻은 아니에요.**
- 390×844 브라우저 창에서도 놀이판·출구·집게·주문 인형을 직접 확인했어요(실물 휴대폰 테스트는 아님). 집게 표시 너비 약41.6px, 출구 약52.9px, 주문 인형48px, 집기 카드28px예요.
- 품질: 허수아비 모자, 슬라임 잎, 벌레 0·1, 박쥐 날개, 수호자 이끼/꽃/나무, 로비 화면/안테나를 유지해요. 정화 몹의 색을 이어 받아 임시 그림과 달리 박쥐는 민트색이에요. 둥근 단추와 실구멍, 짧은 봉제선으로 천 인형을 표현했어요.
- Claude 확인: 여섯 인형의 실루엣과 단추 눈, 작은 크기에서 벌레 0·1 읽힘. 추가 색 필요 없음.
- 필요한 변경: 그림 연결에는 없음. 진열장 설명의 `인형`이 `인 / 형`으로 갈리는 기존 줄바꿈을 관찰했어요. 다듬으려면 Claude가 `src/ui/styles.css`의 이름 줄바꿈/너비를 검토해 주세요(이번 범위 밖이라 수정하지 않음).

| 키 | 발밑 그림자 너비(논리 px) | 불빛 |
|---|---|---|
| `prop-doll-dummy` | 없음 | 없음 |
| `prop-doll-slime` | 없음 | 없음 |
| `prop-doll-bug` | 없음 | 없음 |
| `prop-doll-bat` | 없음 | 없음 |
| `prop-doll-guardian` | 없음 | 없음 |
| `prop-doll-robi` | 없음 | 없음 |

재생성 도구: `draw-c13-3-dummy-robi.mjs`, `draw-c13-3-slime-guardian.mjs`, `draw-c13-3-bug-bat.mjs`(모두 `assets-src/tools/`) → `npm run assets` → `node assets-src/tools/preview-c13.mjs 3`.
