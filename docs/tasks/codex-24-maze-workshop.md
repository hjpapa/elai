# Codex 작업 C24 — 마을 미로 공작소와 코딩 미로 만들기

## 목표
학생이 **직접 만들고 친구와 나누는** 활동을 더해요. 성취기준 6실05-03(프로그램을 협력하여 작성하고 산출물을 공유한다)과 "이해·적용을 넘어 창작" 단계를 채워요.

- 마을 일곱째 건물 **마을 미로 공작소**에 들어가요.
- **코딩 미로 만들기** 6판: 조건에 맞는 미로를 설계하고, 블록 프로그램으로 직접 풀어 보고, 미로 코드로 친구와 바꿔 풀어요.
- 서버 저장은 쓰지 않아요. 미로 코드는 벽과 시작·깃발 자리만 담은 짧은 글자예요. 이름이나 자유 글을 넣지 않아요.

| 단계 | 이름 | 결과 |
|---|---|---|
| 1 | 미로 규칙과 코드 | 검사·코드 변환 순수 함수 |
| 2 | 건물과 방 | 임시 그림으로 들어가기 |
| 3 | 놀이 화면 | 설계 → 검사 → 직접 풀기 → 코드 |
| 4 | 연결과 전체 확인 | 도감·시연·알림·저장 |
| 5 | 건물과 소품 그림 | 2배 그림 4개 |
| 6 | 아이콘과 마무리 | 아이콘, 그림 검토 |

## 먼저 읽을 것
1. `AGENTS.md`, `docs/tasks/codex-22-24-common.md`, `docs/asset-spec.md`의 "고해상도 그림"
2. `src/data/minigames/route.ts`, `src/minigames/route/RouteGame.ts`, `routeEnv.ts`
3. `src/minigames/fruit/FruitGame.ts`, `src/minigames/types.ts`, `host.ts`, `registry.ts`, `catalog.ts`
4. `src/data/maps/fruitshop.ts`, `src/data/maps/village.ts`, `src/data/maps/index.ts`
5. `src/game/textures/roomPlaceholders.ts`, `src/game/assets.ts`, `src/game/light.ts`
6. `docs/tasks/codex-19-bakery.md`, `codex-20-fruitshop.md`, `codex-20-progress.md`
7. `tests/route.test.ts`, `tests/fruit.test.ts`, `tests/demo.test.ts`

## 고쳐도 되는 파일
| 단계 | 파일 |
|---|---|
| 모든 단계 | 새 테스트 `tests/**`, `docs/tasks/codex-24-progress.md` |
| 1 | 새 파일 `src/data/minigames/maze.ts`, `src/minigames/maze/mazeRules.ts`, `src/minigames/maze/mazeCode.ts`, `src/data/schema.ts`(승인한 곳), `src/game/rpg/state.ts`(승인한 곳) |
| 2 | 새 파일 `src/data/maps/mazeroom.ts`, `src/data/maps/index.ts`, `src/data/maps/village.ts`(`to-fruitshop` 줄 바로 뒤), `src/game/assets.ts`(승인한 곳), `src/game/light.ts`, `src/game/textures/roomPlaceholders.ts` |
| 3 | 새 파일 `src/minigames/maze/MazeGame.ts`, `src/minigames/maze/maze.css`, `src/minigames/registry.ts` |
| 4 | `src/minigames/catalog.ts` |
| 5·6 | `assets-src/**`(`palette.json` 제외), `scripts/build-assets.mjs`, `public/assets/**`, `src/game/light.ts` |

## 미리 승인한 계약 변경
`src/data/schema.ts`
- 끝에 `MazeRound`를 더해요(필요한 필드는 아래 판 표에 맞춰요).
- `SaveData`에 아래 필드를 더해요.

```ts
/** 코딩 미로 만들기에서 판별로 저장한 내 미로 코드 */
mazeWorks?: Record<string, string>;
```

`src/game/rpg/state.ts`
- 맨 위 `cleanMinigames` 옆에 `cleanMazeWorks(raw)`를 더해요. 지금 있는 판과 올바른 코드만 남겨요.
- 생성자에서 저장을 정리해요. 예전 저장에는 빈 값이 들어가요.
- `recordMinigame` 바로 뒤에 `saveMazeWork(round, code)`를 더해요.

`src/game/assets.ts`의 `// C10` 앞에 아래 묶음을 더해요.

```ts
prop(32, 48, 2)('prop-maze-house', '마을 미로 공작소 건물(0 문 닫힘, 1 문 열림·창에 불빛). 노란 지붕과 남색 격자무늬', 0xe7b64f),
prop(32, 48, 2)('prop-maze-bench', '미로 설계대(0·1 격자 화면 불빛이 번갈아 켜져요)', 0x82cce0),
prop(16, 24, 7)('prop-maze-frame', '벽 미로 액자(0 빈 액자, 1~6 판마다 다른 작은 미로)', 0xd39a62),
prop(32, 32)('prop-maze-shelf', '자·연필·종이 미로가 놓인 선반(장식)', 0xbd7959),
icon('icon-maze', '깃발로 이어지는 작은 미로. 판 고르기 카드에 써요', 0x478bc7),
```

## 미리 승인한 테스트 변경
없어요. `tests/demo.test.ts`의 놀이 목록 검사는 `catalog.ts`에 새 놀이를 넣으면 그대로 통과해야 해요.

## 1단계: 미로 규칙과 코드
미로는 항상 **7×7**이에요. 글자는 `#` 벽, `.` 길, `S` 출발, `G` 깃발이에요. 기존 `routeEnv`의 `waveNumbers`, `shortestPath`, `runRoute`, `usesCmd`를 다시 써요.

`mazeRules.ts`
- `checkMaze(rows)`: 크기, 출발·깃발 각각 1개, 길 연결, 최단 걸음, 막다른 길 수, 갈래 길 여부를 돌려줘요.
- 막다른 길: 출발·깃발이 아닌 길 칸 중 상하좌우로 이어진 길 칸이 하나뿐인 칸이에요.
- 갈래 길: 최단 경로의 칸 하나(출발·깃발 제외)를 막아도 깃발까지 갈 수 있는 경우가 있어요.

`mazeCode.ts`
- 벽 49비트, 출발 위치 6비트, 깃발 위치 6비트, 검사값 4비트, 모두 65비트를 13글자로 만들어요.
- 글자는 `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`이고, 보여 줄 때 `ABCD-EFGH-JKLMN`처럼 나눠요.
- `decodeMaze`는 소문자·띄어쓰기·하이픈을 받아 주고, 글자·길이·검사값·위치·연결이 틀리면 `null`이에요.

테스트: 만들고 되돌리면 같아요. 글자 하나를 바꾸면 거의 모두 걸러져요. 깃발까지 갈 수 없는 미로의 코드는 받지 않아요.

## 2단계: 건물과 방
- 문 id `to-mazeroom`, 자리 `(21,16)`, 라벨 `마을 미로 공작소`, 그림 `prop-maze-house`, 처음부터 열려 있어요.
- 방 안에서 나오면 `(21,17)`이에요. `to-fruitshop` 줄 바로 뒤에 문을 넣어요.
- 방 `mazeroom`은 `fruitshop`처럼 10×8 `theme: 'room'`이고 공방 벽·바닥을 함께 써요.
  - 설계대 `{ id: 'maze-bench', type: 'game', at: { x: 5, y: 1 }, game: 'mazemaker', sprite: 'prop-maze-bench' }`
  - 왼쪽 벽 앞 액자 6개: `maze:<판>` 플래그로 빈 액자/그 판의 액자를 바꿔요.
  - `prop-floorlamp`, `prop-plant`, `prop-maze-shelf`, 문 매트 `(6,7)`
- 불빛: `prop-maze-house`는 `{ at: 0.28, r: 12, frames: [1] }`, 설계대는 그림의 화면 높이에 맞춘 청록 빛이에요. **`at`은 발 기준점에서 잰 비율**이에요. 발은 2배 그림의 y 92예요.
- `roomPlaceholders.ts`에 임시 그림을 더해 그림 없이도 끝까지 동작하게 해요.
- 테스트: 문 앞과 방 안의 기계·문 매트에 갈 수 있고, 나무나 집이 문을 가리지 않아요.

## 3단계: 놀이 화면
놀이 id는 `mazemaker`, 창 제목은 `코딩 미로 만들기`예요. `src/data/minigames/maze.ts`에 판을 둬요.

| 판 | 제목 | 설계 조건 | 쓰는 블록 | 열림 |
|---|---|---|---|---|
| `r1` | 첫 미로 | 최단 4걸음 이상 | 화살표 | 처음부터 |
| `r2` | 막다른 길 | 최단 5걸음 이상, 막다른 길 2개 이상 | 화살표 | 처음부터 |
| `r3` | 두 갈래 길 | 최단 5걸음 이상, 갈래 길 있음 | 화살표 | 처음부터 |
| `r4` | 반복이 어울리는 길 | 최단 8걸음 이상, 프로그램에 반복을 쓰고 8블록 이하 | 화살표+반복 | `ch2-p2-m1`, `memoryChip` |
| `r5` | 물결로 찾는 길 | 최단 8걸음 이상, 막다른 길 1개 이상, `followWave` 반복으로 풀기 | 화살표+물결+반복 | `ch6-p1-m1`, `predictModule` |
| `r6` | 친구 미로 풀기 | 친구 코드나 섬 친구 예시 미로를 프로그램으로 풀기 | 화살표+열린 블록 | 처음부터 |

**r1~r5 흐름**
1. 7×7 칸을 눌러 벽·길을 바꾸고, 도구로 출발·깃발을 놓아요. `지우기`도 있어요.
2. 설계 조건이 하나씩 체크돼요. 걸음 수, 막다른 길, 갈래 길을 보여 줘요.
3. 조건을 채우면 `직접 풀어 보기`를 눌러 블록 프로그램을 만들어요. `RouteGame`의 프로그램 편집과 실행 화면 방식을 따라요.
4. 깃발에 닿으면 판 성공이에요. 최단 걸음으로 풀면 별 3개, 더 돌아가면 별 2개예요.
5. 첫 성공이면 `maze:<판>` 플래그가 켜지고, 미로가 `mazeWorks`에 저장돼요. 코드를 크게 보여 주고 `코드 복사`가 있어요.

**r6**
- 코드 입력칸과 `섬 친구 미로` 3개가 있어요. 예시 미로는 데이터에 넣고 만든 인물은 기존 NPC 이름을 써요.
- 입력칸은 13글자만 받아요. 틀리면 `코드를 다시 확인해요.`처럼 말해요.
- 친구 미로를 풀면 성공이에요. 어떤 코드든 다시 도전할 수 있어요.
- 모든 판을 처음 끝내면 칭호 `미로 설계사`를 줘요.

**화면**
- 칸은 누르기·키보드로 조작해요. 칸마다 `3행 4열 벽`처럼 읽을 수 있는 이름을 달아요.
- 320px에서 격자와 단추가 넘치지 않아요.
- 경험치와 동전은 주지 않아요.

## 4단계: 연결과 전체 확인
- `catalog.ts`에 `{ id: 'mazemaker', building: '마을 미로 공작소', map: 'mazeroom', name: '코딩 미로 만들기', icon: 'icon-maze', rounds: MAZE_ROUNDS, title: MAZE_TITLE }`을 더해요.
- 새 놀이 알림, 도감 '마을 놀이', 시연 메뉴의 건물·놀이 열기가 함께 동작해야 해요. 시연 모드에서는 모든 판이 열려요.
- 저장 후 다시 들어와 별·액자·내 미로 코드가 남아요.
- 두 브라우저 저장(또는 일반·시연 저장)으로 코드를 주고받아 풀어 봐요.

## 5단계: 건물과 소품 그림
`docs/tasks/codex-20-fruitshop.md`의 규칙과 검토판 방식을 따라요. 팔레트 64색은 그대로예요. 크기는 목록의 정확히 2배이고 발은 아래 가운데에서 4px 위, 반투명 픽셀과 발밑 그림자는 없어요.

| 키 | 2배 PNG 크기 | 그림 |
|---|---|---|
| `prop-maze-house` | 128×96 | 노란 지붕, 남색 격자 무늬 벽, 문 위 미로 모양 간판. 글자 없음. 프레임 1은 문이 열리고 창에 불빛 |
| `prop-maze-bench` | 128×96 | 격자가 보이는 책상형 설계대. 사람처럼 보이지 않게 그려요. 두 프레임은 화면 불빛이 번갈아요 |
| `prop-maze-frame` | 224×48 | 빈 액자와 서로 다른 작은 미로 6개 |
| `prop-maze-shelf` | 64×64 | 자, 연필, 접은 종이 미로가 놓인 선반 |

- 다른 마을 건물과 한눈에 구별돼요(공방 분홍, 택배소 파랑, 불빛 가게 보라, 지도방 초록, 빵집 빨강, 과일 가게 주황).
- `assets-preview/compare-24-1.png`에 임시 그림·새 그림과 방 배치를 보여 줘요.
- 진행 기록에 그림자·불빛 표를 적어요. 불빛 높이는 **발 기준 비율**로 적어요.

## 6단계: 아이콘과 마무리
- `icon-maze` 32×32를 그려요. 판 고르기 48px과 작은 크기에서도 읽혀야 해요.
- `assets-preview/compare-24-2.png`에 어두운 창·크림 바탕 위 크기별 모습을 보여 줘요.
- 그림이 들어온 상태로 건물 외관, 방, 액자 1~6, 놀이 화면을 게임에서 확인해요.

## 완료 기준
- 끝낸 단계의 요구 사항과 테스트를 채웠어요.
- 그림 단계는 `npm run assets && npm test && npm run build`가, 다른 단계는 `npm test && npm run build`가 통과해요.
- 새 키가 모두 `density: 2`이고 아틀라스가 4096×4096 이내예요.
- 6판을 일반 모드와 `/?demo`에서 끝까지 해 봤어요.
- 허락된 파일만 바꿨어요.

## 확인 명령
```bash
npm test && npm run build
```
그림을 바꾼 단계는 먼저 `npm run assets`를 돌려요.
