# Codex 작업 C2 — 연출·소리·로딩 다듬기

## 목표
1장까지 플레이할 수 있는 게임을 더 빠르고, 더 생생하고, 휴대폰에서도 편하게 만들어요. 게임 규칙과 데이터는 바꾸지 않아요.

## 먼저 읽을 것
1. `AGENTS.md`, `docs/asset-spec.md`
2. `src/game/assets.ts`의 `Manifest.atlas` 설명(그림 한 장 묶음 규격)
3. `src/game/scenes/BootScene.ts`(아틀라스를 읽는 쪽, 고치지 않아요)
4. `src/fx/sfx.ts`(지금은 짧은 삑 소리와 음악 자리만 있어요)
5. `src/game/scenes/BattleScene.ts`, `src/missions/battle/runBattle.ts`(전투 연출을 부르는 쪽, 뒤 파일은 고치지 않아요)

## 고쳐도 되는 파일
- `scripts/build-assets.mjs`, `assets-src/**`, `public/assets/**`
- `src/fx/**`
- `src/game/scenes/BattleScene.ts` — **연출만**. 공개 메서드(`playerAct`, `mobAct`, `purify`, `faint`)의 이름·인자·반환 형태는 그대로 둬요.
- `src/ui/styles.css` — 보기만 바꿔요(클래스 이름은 그대로).

그 밖의 파일, 특히 계약 파일(`src/data/schema.ts`, `src/game/assets.ts`, `src/missions/core/types.ts`, `docs/asset-spec.md`), `tests/**`, `package.json`은 고치지 않아요.

## 할 일
1. **로딩 속도(아틀라스)**: `npm run assets`가 개별 PNG와 함께 `public/assets/atlas.png`, `public/assets/atlas.json`도 만들고, `manifest.json`에 `"atlas": { "image": "atlas.png", "data": "atlas.json" }`를 넣어요.
   - JSON은 Phaser 아틀라스 형식(`frames` 객체 + `meta`)이에요. 프레임 이름 = 그림 키, 프레임 = 그 키의 가로 띠 전체(프레임 너비 × 프레임 수, 높이).
   - 띠 사이에 1px 이상 여백을 둬서 옆 그림이 번지지 않게 하고, 아틀라스는 2048×2048 이내로 만들어요.
   - 개별 PNG는 테스트와 검토에 쓰니 지우지 않아요.
2. **효과음**: `playSfx(name)`의 11가지 소리를 WebAudio로 더 듣기 좋게 만들어요(짧고, 귀에 거슬리지 않게, 음량은 작게). 소리 파일이나 새 라이브러리는 쓰지 않아요.
3. **배경 음악**: `playMusic(theme)`을 구현해요. 분위기는 `title`, `village`, `forest`, `dungeon`, `battle`이고, `null`이면 멈춰요.
   - WebAudio로 만든 짧은 반복 칩튠으로 해요. 아주 작은 음량으로 하고, 분위기가 바뀌면 부드럽게 넘어가게 해요.
   - 브라우저 자동 재생 제한 때문에 첫 클릭·터치·키 입력 뒤에 시작해요.
   - `setSoundEnabled(false)`면 음악도 멈춰요. `export`하는 이름과 시그니처는 그대로 둬요.
4. **전투 연출**(`BattleScene.ts`): 공격 반짝임, 맞을 때 흔들림, 막기 방패, 회복 하트, 정화 축하 반짝임을 더 또렷하고 즐겁게 다듬어요. 쓰러질 때는 무섭지 않게 해요. 한 차례 연출이 지금보다 길어지지 않게 해요.
5. **그림 손보기**: `char-robi`의 안테나 끝이 머리와 떨어져 떠 보여요. 10프레임 모두 이어지게 고쳐요(`robi-part-wheel`과 정렬 유지).
6. **휴대폰 화면**(`styles.css`, 375×812 기준)
   - 전투 아래 패널이 화면 절반을 넘지 않게 해요(카드·칸 크기와 글자 크기 줄이기, 줄바꿈).
   - HUD와 목표 안내가 겹치지 않게 하고, 미션 창은 세로로 잘 쌓이게 해요.

## 완료 기준
- `npm run assets && npm test && npm run build` 통과. 아틀라스 검사 테스트(`tests/assets.test.ts`)가 이제 건너뛰지 않고 통과해야 해요.
- `npm run dev`에서 개발자 도구 네트워크를 보면 그림 PNG 114개 대신 `atlas.png` 하나를 읽어요. 게임 화면은 지금과 같아요.
- 첫 클릭 뒤 제목·마을·숲·미로·전투에서 음악이 바뀌고, 메뉴에서 소리를 끄면 음악과 효과음이 모두 멈춰요.
- 375px 폭에서 전투·가방·블록 퍼즐 창을 끝까지 쓸 수 있어요.

## 확인 명령
```bash
npm run assets && npm test && npm run build
```

## 최종 보고(마지막 메시지)
- 바꾼 파일 목록, 아틀라스 크기
- 음악·효과음 설계(분위기별 음계·박자 요약)
- 휴대폰 화면에서 바꾼 점
- 필요한 변경(지시서 범위 밖이라 고치지 않은 것)
- 커밋하지 않았다는 확인
