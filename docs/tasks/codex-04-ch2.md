# Codex 작업 C4 — 2장 "반복의 동굴" 전체 만들기

> Claude 할당량을 아끼는 기간이라, 이번 작업은 **엔진 수정까지 Codex가 맡아요**. 아래 "고쳐도 되는 파일"과 "미리 승인한 계약 변경"의 범위 안에서만 고치고, 끝나면 최종 보고를 남겨 주세요. Claude가 나중에 검토해요.

## 목표
1장까지 플레이할 수 있는 게임에 **2장 반복의 동굴**을 처음부터 끝까지 플레이할 수 있게 더해요.
- 마을 동쪽 다리 → 동굴 입구 → 되풀이 동굴(던전) → 보스 → 마을 복구 2단계
- 배울 것: **반복, 패턴 찾기, 효율(더 짧은 프로그램)**. 3~4학년 수준이에요.
- 1장과 7장 체험은 지금처럼 그대로 동작해야 해요.

## 먼저 읽을 것
1. `AGENTS.md`(공동 규칙, 콘텐츠 톤), `CLAUDE.md`
2. `docs/curriculum.md`의 2장 부분, `src/data/chapters/ch2.ts`(지금은 구성과 메모만 있어요)
3. 1장 구현 전체를 본보기로 삼아요.
   - 데이터: `src/data/chapters/ch1.ts`, `src/data/maps/forest.ts`, `src/data/maps/maze.ts`, `src/data/rpg/*.ts`, `src/data/npcs.ts`
   - 엔진: `src/missions/core/interpreter.ts`, `src/missions/core/gridEnv.ts`, `src/game/battle/sim.ts`, `src/missions/battle/runBattle.ts`, `src/missions/blockCode/BlockCodeMission.ts`, `src/ui/programEditor.ts`, `src/game/scenes/WorldScene.ts`, `src/game/iso/mapRuntime.ts`
   - 테스트: `tests/*.test.ts`
4. `docs/asset-spec.md`, `src/game/assets.ts`(그림 규격), `assets-src/README.md`(그림 원본 형식)

## 고쳐도 되는 파일
- 데이터: `src/data/**`
- 엔진·화면: `src/game/**`, `src/missions/**`, `src/ui/**`, `src/fx/**`
- 그림: `assets-src/**`, `scripts/build-assets.mjs`, `public/assets/**`
- 테스트: `tests/**`
- 문서: `docs/curriculum.md`, `docs/tasks/README.md`, `README.md`

고치지 않는 파일: `supabase/**`, `src/services/**`, `src/teacher/**`(2장 미션은 교사 표에 자동으로 나와요), `package.json`과 잠금 파일(새 라이브러리 금지), `vercel.json`, `vite.config.ts`, `src/missions/core/types.ts`, `docs/asset-spec.md`.

## 미리 승인한 계약 변경(이것만 바꿔요)
`src/data/schema.ts`
- `TileKind`에 `'cave'`(동굴 바닥, 걸을 수 있음)와 `'rockwall'`(동굴 바위벽, 높이 블록, 못 지나감)을 더해요.
- `MapDef.theme`에 `'cave'`를 더해요.
- `BlockCodeData`에 `paint?: string[]`를 더해요(무늬 그리기 목표). `grid`와 크기가 같고 `'x'`가 칠할 칸이에요. 무늬 그리기 미션에는 `'G'`가 없어요.
- `RobiPartDef.unlocks`에 `repeat?: boolean`(전투 반복 카드)을, `RobiPartDef`에 `icon?: string`(부품 아이콘 키)을 더해요.

`src/game/assets.ts`의 `ASSETS`에 아래 키를 더해요(크기·프레임은 이대로).
| 키 | 종류·크기 | 내용 |
|---|---|---|
| `tile-cave` | tile 32×16 | 동굴 바닥(어두운 돌, 작은 수정 조각) |
| `block-cave` | block 32×24 | 동굴 바위벽 |
| `prop-crystal` | prop 16×24, 2프레임 | 빛나는 수정(0 보통, 1 반짝) |
| `prop-stalagmite` | prop 16×24 | 석순 |
| `char-explorer` | char 16×24, 10프레임 | 동굴 탐험가 하루(헬멧 램프, 성별이 드러나지 않게) |
| `mob-echo-bat` | mob 24×24, 4프레임 | 메아리 박쥐(장난꾸러기, 무섭지 않게) |
| `boss-bat-king` | mob 48×48, 4프레임 | 메아리 박쥐 대장 |
| `robi-part-memory` | overlay 16×24, 10프레임 | 로비 부품: 등에 붙는 메모리 칩(`char-robi`에 맞춰요) |
| `icon-part-memory` | icon 16×16 | 메모리 칩 아이콘 |

## 1. 엔진 바꾸기

### 1-1. 전투 에너지 규칙: "반복 안의 카드는 에너지를 한 번만"
- `src/game/battle/sim.ts`: 한 라운드 안에서 같은 위치(path)의 카드는 **처음 실행할 때만** 에너지를 내요. 반복으로 여러 번 실행돼도 다시 내지 않아요. 모자라면 지금처럼 그 카드는 쉬기로 바뀌고 `wanted`에 원래 카드를 남겨요.
- 평평한(반복 없는) 프로그램은 지금과 결과가 똑같아야 해요. 1장 테스트가 그대로 통과해야 해요.
- `flatCost`를 `programCost(program)`로 바꿔요. 반복 몸체는 한 번만 세요. 쓰는 곳도 함께 바꿔요.
- `Battle.clone()`을 더해요. 현재 체력·패턴 위치·에너지 보너스를 복사해서 "실행 미리 보기"에 써요.

### 1-2. 전투 "프로그램 모드"(메모리 칩이 있을 때)
- 플레이어가 `unlocks.repeat`가 있는 로비 부품을 가지면 전투 화면을 프로그램 모드로 보여 줘요. 없으면 지금의 칸 모드 그대로예요.
- 위 줄은 몹 행동 예고예요. `ticksPerRound` 칸을 다 보여 주고, 12칸도 휴대폰에서 가로로 스크롤돼야 해요.
- 가운데 줄은 **실행 미리 보기**예요. `battle.clone().runRound(program)`의 결과로 차례마다 실제로 나갈 카드를 보여 줘요. 비는 차례는 흐린 "쉬기", 에너지가 모자라 바뀐 카드는 빨간 표시로 보여 줘요.
- 아래는 `ProgramEditor`예요.
  - 팔레트: 공격·막기·회복·쉬기 + 반복. 카드마다 에너지 비용 배지를 붙여요(`EditorConfig`에 선택 항목으로 더해요).
  - `maxBlocks = 프로그램 칸 수`(반복 블록과 그 안의 카드도 1칸씩 세요).
  - 전투 패널에 맞게 가로로 흐르는 배치를 써요(`.editor.inline` 같은 CSS 변형).
- 에너지 표시는 `programCost`예요. 실행 중에는 편집기에서 지금 실행하는 블록을 강조하고, 미리 보기 줄에서는 지금 차례를 강조해요.
- 라운드가 끝나도 프로그램은 그대로 남겨요(반복 패턴은 다음 라운드에도 쓸 수 있어서). 버그 벌레의 `prefill`은 프로그램 모드에서도 첫 프로그램으로 들어가요.
- 디버그 안경을 끼고 있으면, 피드백이 가리키는 차례의 카드 위치(path)를 편집기에서 빨갛게 표시해요.

### 1-3. 무늬 그리기 퍼즐(`paint`)
- `GridEnv`: `paint`가 있으면 시작 칸과 로비가 지나간 칸을 "칠한 칸"으로 기록해요.
  - 막힌 칸에 부딪히면 실패예요.
  - 프로그램이 끝났을 때 **칠한 칸 = 목표 칸**(정확히 같음)이면 성공이에요.
  - 그 밖에는 새 결과 `'wrongPaint'`예요. 목표에 닿아도 중간에 멈추지 않아요.
- `BlockCodeMission`: 목표 칸은 점선 테두리나 흐린 색으로, 칠한 칸은 진한 색으로 보여 줘요. `wrongPaint` 문구도 더해요("그림과 조금 달라요. 칠한 칸을 비교해 봐요").

### 1-4. 동굴 타일·테마
- `mapRuntime.ts`: `cave`는 `tile-cave`로 그리고 걸을 수 있어요. `rockwall`은 바닥 `tile-cave` 위에 `block-cave` 블록을 세우고 못 지나가요.
- `paint.ts`의 기본 글자에 `c` → `cave`, `R` → `rockwall`을 더해요.
- `WorldScene`: 테마 `cave`는 배경을 아주 어둡게, 음악은 `dungeon`, 전투 바닥은 `tile-cave`로 해요(`BattleSceneData.floor`에 더하기).
- 로비 부품 아이콘: 도감(`src/ui/dex.ts`)과 보상 창(`src/ui/rewards.ts`)이 `part.icon`을 쓰게 바꿔요(지금은 바퀴 아이콘이 박혀 있어요). 바퀴 모터에는 `icon: 'icon-part-wheel'`을 넣어요.

### 1-5. 걷기 조작은 그대로
방향키는 화면 방향 그대로 움직이고(↑ 위, → 오른쪽), 좁은 길에서 막히면 길을 따라 미끄러져요(`WorldScene.keyStep`, 두 키를 함께 누르면 대각선). 이 동작은 바꾸지 않아요. 동굴 맵도 미로처럼 칸 방향(↗↘↙↖)으로 길을 내면 돼요.

### 1-6. 목표 안내
`src/game/rpg/progress.ts`의 `objective()`에서, 다음 미션이 있는 장의 맵에 아직 오지 않았다면 길을 알려 줘요. 예: "마을 동쪽 다리를 건너 반복의 동굴로 가요". 지금 맵은 `state.data.location.map`과 맵의 `chapter`로 알 수 있어요.

## 2. 2장 데이터

### 2-1. 로비 부품·몹·NPC
- `robiParts.ts`: `memoryChip` → `unlocks: { repeat: true }`, `overlay: 'robi-part-memory'`, `icon: 'icon-part-memory'`. 능력 문구는 "반복 카드를 쓸 수 있어요. 반복 안의 카드는 에너지를 한 번만 써요."
- `mobs.ts`(숫자는 시작값이에요. 아래 테스트를 통과하도록 조정해도 돼요)
  - `echoBat` 메아리 박쥐: hp 40, atk 6, def 1, pattern `['charge','smash']`, smashRatio 0.3, xp 12, coins 8, drops 젤리 30%, recommendedLevel 5, chapter `ch2`
  - `batKing` 메아리 박쥐 대장(보스): hp 120, atk 7, def 2, pattern `['guard','charge','smash','idle']`, **roundTicks 12**, smashRatio 0.6, xp 0, recommendedLevel 6, chapter `ch2`
  - 의도: 한 라운드 12칸이 프로그램 칸(Lv6~8에서 6~7칸)보다 많아요. 그래서 반복 없이는 강타 하나가 꼭 비어서 져요. `반복 3번 { 쉬기, 공격, 막기, 공격 }`(5칸, 에너지 3)이면 다치지 않고 이겨요.
- `npcs.ts`: `explorer` "탐험가 하루"(`char-explorer`), `batKing` "메아리 박쥐 대장"(`boss-bat-king`)

### 2-2. 맵
- `src/data/maps/cave.ts` **동굴 입구**(약 20×16, 안개 없음, 테마 `cave`)
  - 하루 NPC(미션 2장 파트 1~3), 메아리 박쥐 2마리(wander 1~2), 보물상자 1개, 수정·석순 소품, 표지판 2개
  - 마을로 돌아가는 포털
  - 되풀이 동굴 포털: `open: { mission: 'ch2-p3-m2' }`, lockedText "무늬 그리기를 끝내면 동굴 안쪽이 열려요."
- `src/data/maps/cavedeep.ts` **되풀이 동굴**(안개, 테마 `cave`)
  - **같은 모양의 방 4개**를 가로로 이어요. 방마다 길이 같은 모양으로 꺾여서, 한 방의 길을 찾으면 끝까지 갈 수 있게 해요.
  - 코드로 방 틀 하나를 반복해 만들어요(`maze.ts`처럼).
  - 입구 표지판: "같은 방이 4번 되풀이돼요. 한 방의 길을 찾으면 끝까지 갈 수 있어요!"
  - 2·3번 방에 메아리 박쥐, 보물상자 2개(망토 `cloak` / 젤리 `jelly`와 동전)
  - 끝 방에 박쥐 대장 NPC 두 개(`notFlag: 'batking-fixed'`일 때 보통 모습, `flag`일 때 정화 모습 frame 3. 미션 2장 보스 m1~m3)
  - `ch2-clear`일 때 나타나는 마을 포털
- `src/data/maps/index.ts`에 등록해요.
- `village.ts`
  - `to-ch2` 포털이 `cave`로 가게 바꾸고 `open: { flag: 'ch1-clear' }`로 해요(lockedText "1장을 끝내면 다리를 건널 수 있어요.").
  - 복구 2단계: `village-restore-2`이면 광장 둘레에 `prop-crystal` 두세 개가 나타나요.

### 2-3. `src/data/chapters/ch2.ts`(status `playable`, entryMap `cave`)
장의 제목·학년·개념·학습 목표·성취기준·로비 부품·배지와 파트 id·제목은 유지해요. 지금 파트마다 들어 있는 임시 미션 한 개씩(`note`만 있는 것)은 **아래 표의 미션으로 바꿔요**(id·제목·npc·data). 파트의 `activity` 문장이 새 미션과 어긋나면 맞게 고쳐요(예: 보스 파트의 "roundTicks 6, 슬롯 4" 메모는 아래 설계로). NPC는 파트 1~3이 `explorer`, 보스 전투·퀴즈는 `batKing`, 설명하기는 `robi`예요(1장 수호자와 같은 방식). 보상 경험치는 1장과 비슷하게(미션 10~15, 보스 전투 40) 줘요.
| 미션 | 종류 | 내용 |
|---|---|---|
| p1-m1 보석 계단 | blockCode, mustCollect | 계단 모양 보석(오른쪽·아래가 되풀이). 반복 없이 풀어요. 정리: "오른쪽·아래가 4번 되풀이됐어요. 이런 규칙을 패턴이라고 해요." |
| p1-m2 톱니 보석 | blockCode, mustCollect | 톱니 모양(위·오른쪽·아래·오른쪽)이 3번 되풀이 |
| p2-m1 긴 굴 | blockCode, allowRepeat, maxBlocks 2 | 곧은 길 8칸. `반복 8번 { 오른쪽 }` |
| p2-m2 계단 줄이기 | blockCode, allowRepeat, maxBlocks 4 | p1-m1 계단을 반복으로 |
| p2-m3 세 번 꺾기 | blockCode, allowRepeat, maxBlocks 4 | "오른쪽 2, 아래 1"이 3번. 보상: 로비 부품 `memoryChip` |
| p3-m1 계단 벽화 | blockCode, `paint`, allowRepeat | 계단 무늬 그리기 |
| p3-m2 톱니 벽화 | blockCode, `paint`, allowRepeat | 톱니 무늬 그리기. 보상에 되풀이 동굴이 열린다는 안내 |
| boss-m1 박쥐 대장 | battle `batKing` | 반복 카드로 12칸 패턴 덮기. 힌트: "예고가 4칸마다 되풀이돼요. 4칸을 반복으로 감싸 봐요." |
| boss-m2 반복 퀴즈 | quiz 3문항 | 반복이란? / 블록 수가 줄어드는 까닭 / 무늬에서 되풀이되는 묶음 찾기 |
| boss-m3 로비에게 설명하기 | reflect | 맞는 문장 3개 이상, 틀린 문장 2개 |

보스 m3 보상: `badge: 'badge-2'`, `title: '반복의 탐험가'`, `items: [{ id: 'windboots', qty: 1 }]`, `flags: ['village-restore-2', 'ch2-clear']`. 보스 m1 보상 flags에는 `batking-fixed`를 넣어요.

### 2-4. 글
모든 학생용 글은 `AGENTS.md` 콘텐츠 톤을 지켜요. 해요체, 말풍선 2줄, 쉬운 말, 비폭력이에요. "반복(같은 일을 여러 번 되풀이하는 것)"처럼 뜻을 함께 써요.

## 3. 그림
- 위 새 키 9개를 `assets-src/`에 그리고 `npm run assets`로 PNG·아틀라스를 다시 만들어요. 스타일·팔레트는 1장과 같게 해요.
- `robi-part-memory`는 `char-robi`의 10프레임과 정확히 맞춰요(바퀴 모터와 함께 있어도 어색하지 않게).
- `tests/assets.test.ts`의 아틀라스 검사는 레지스트리 전체가 아니라 **매니페스트에 있는 키**를 기준으로 돌게 고쳐요. 그림이 없는 새 키가 생겨도 테스트가 깨지지 않게요.

## 4. 테스트(더하거나 고치기)
- `tests/battle.test.ts`
  - 반복 몸체 카드는 한 라운드에 에너지를 한 번만 내요. `programCost`가 반복 몸체를 한 번만 세요.
  - **박쥐 대장**: Lv6~8, 1·2장 장비로 `반복 3번 { 쉬기, 공격, 막기, 공격 }`은 다치지 않고 이겨요. 반복 없이 칸 수만큼 맞게 짠 평평한 프로그램은 져요.
  - **메아리 박쥐**: 맞게 짜면 다치지 않고, 공격만 반복하면 체력을 20% 넘게 잃어요.
  - 1장 기존 테스트는 그대로 통과해요.
- `tests/interpreter.test.ts`: 무늬 그리기 성공(정확히 같음), 덜 칠함, 더 칠함, 부딪힘
- `tests/curriculum.test.ts`
  - 2장 미션은 데이터가 모두 있어요.
  - 무늬 그리기 미션은 `'G'`가 0개이고 `paint`의 크기가 `grid`와 같아요(아니면 `'G'`가 정확히 1개).
  - 반복 퍼즐(p2)은 테스트에 적어 둔 **의도한 풀이**가 성공하고 블록 수가 `optimal`과 같아요. 반복 없는 가장 짧은 풀이의 블록 수는 `maxBlocks`보다 커요(반복이 꼭 필요함).
- `tests/maps.test.ts`: 동굴 입구·되풀이 동굴의 NPC·상자·포털에 갈 수 있어요(보스 방은 앞 방들을 지나서 가요). **성장 곡선**: 0~2장 본편(미션·몹·상자)만으로 박쥐 대장 권장 레벨에 닿아요.
- `tests/state.test.ts`: 메모리 칩 보상 뒤 `unlocks.repeat` 부품을 가진 것으로 판단돼요.

## 5. 문서
- `docs/curriculum.md`: "지금 플레이할 수 있는 범위"에 2장을 더해요.
- `README.md`: 플레이할 수 있는 범위를 고쳐요.
- `docs/tasks/README.md`: C4를 "완료(검토 대기)"로 표시해요.

## 완료 기준
```bash
npm run assets && npm test && npm run build
```
모두 통과하고, `npm run dev`에서 아래를 직접 확인해요(체험 모드).
1. 1장을 마친 기록으로 마을 동쪽 다리 → 동굴 입구 → 하루의 미션 p1~p3(무늬 그리기 성공·실패 문구 포함)
2. 메모리 칩을 받은 뒤 전투가 프로그램 모드로 바뀌고, 실행 미리 보기가 실제 실행과 같아요.
3. 되풀이 동굴 안개·같은 방 4개·박쥐·상자 → 박쥐 대장을 반복 카드로 이김 → 퀴즈·설명하기 → 배지·칭호·마을 수정 장식
4. 375px 폭에서 12칸 전투 화면을 끝까지 쓸 수 있어요.
5. 1장 처음부터의 흐름(연습 전투, 숲 퍼즐, 미로, 수호자)이 그대로 동작해요.

테스트용 기록은 체험 모드 저장 키(`elai-save-v1`)에 직접 넣어도 되지만, 기존 기록이 있으면 미리 따로 보관했다가 되돌려 놓아요.

## 다음 단계
이 작업이 끝나면 3~8장은 `docs/tasks/codex-roadmap.md`의 순서와 규칙대로 이어 가요(사용자가 요청할 때).

## 최종 보고(마지막 메시지)
- 바꾼 파일 목록(엔진·데이터·그림·테스트·문서로 묶어서)
- 계약 변경을 위 승인 범위 안에서 했는지 확인
- 박쥐·박쥐 대장 최종 숫자와, 테스트로 확인한 밸런스 결과(레벨별)
- 무늬 그리기·프로그램 모드 화면 설명(가능하면 스크린샷 파일 경로)
- 확인하지 못한 것, Claude가 꼭 봐 줬으면 하는 곳
- 커밋 여부(`codex-run-all.md`로 연속 실행 중이면 커밋 해시, 아니면 커밋하지 않았다는 확인)
