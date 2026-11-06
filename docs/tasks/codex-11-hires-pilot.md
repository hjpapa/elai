# Codex 작업 C11 — 고해상도 2.5D 그림 시범(마을)

## 목표
학생 테스트에서 "도트 그림이 조금 거칠어 보인다"는 의견이 나왔어요. 마을에서 보이는 그림을 **2배 해상도(density 2)**로 다시 그려서 새 품질 기준을 정하는 시범이에요. 사용자가 시범을 보고 좋다고 하면 같은 방식으로 1~8장 그림을 차례로 바꿔요.
게임 규칙·맵·키 이름·게임 속 크기는 그대로예요. 2배 그림은 게임이 반으로 줄여 옛 그림과 같은 크기로 그려요(엔진은 이미 준비돼 있어요).

## 먼저 읽을 것
1. `AGENTS.md` — 공동 작업 규칙(2.5D 개선 기간)
2. `docs/asset-spec.md` — 특히 **"고해상도 그림(2배 밀도)"**, **"화면 테두리(ui)"**
3. `src/game/assets.ts` — 키·크기·설명. 맨 위 C11 묶음(길 안내 표시·화면 테두리)은 새 키예요.
4. `src/game/density.ts`, `src/game/scenes/BootScene.ts` — 게임이 2배 그림을 읽고 줄여 그리는 방법(참고만)
5. `assets-src/README.md`, `scripts/build-assets.mjs` — 지금 원본 형식과 생성 스크립트

## 고쳐도 되는 파일
- `assets-src/**` (`palette.json` 포함)
- `scripts/build-assets.mjs`
- `public/assets/**` (스크립트가 만드는 결과물)

그 밖의 파일은 고치지 않아요(`src/**`, `tests/**`, `docs/**`, `package.json` 등). 바꿔야 할 것 같으면 최종 보고의 "필요한 변경"에 적어 주세요.

## 할 일
1. **팔레트** `assets-src/palette.json`: 64색까지 늘려요.
   - 처음 32색은 순서·값을 그대로 둬요(테스트가 확인해요). 새 색은 뒤에 붙여요.
   - 권장: 풀·잎 초록 4단계, 흙·나무 갈색 4단계, 돌 회색 4단계, 물 파랑 4단계, 지붕 붉은색 3단계, 다양한 피부색 4단계 이상, 화면 테두리용 크림색·금색.
   - 원본 글자가 모자라면 숫자·기호를 써도 돼요. 대응표를 `assets-src/README.md`에 적어요.
2. **생성 스크립트** `scripts/build-assets.mjs`
   - 원본마다 밀도를 정할 수 있게 해요(예: 원본 첫 줄 `density: 2`, 또는 `assets-src/hires/<kind>/` 폴더). 정한 방식은 `assets-src/README.md`에 적어요.
   - 2배 원본은 크기가 목록(`assets.ts`) 크기 × 2인지 확인하고, 아니면 오류로 멈춰요.
   - 매니페스트 항목에 `"density": 2`를 적고, 아틀라스에도 2배 크기 프레임으로 넣어요. 아틀라스는 한 장 4096×4096 이내예요.
   - 같은 키에 옛 원본(1배)과 2배 원본이 모두 있으면 2배 원본을 써요. 옛 원본은 지우지 말고 남겨 둬요(비교·되돌리기용).
   - `assets-preview/contact-sheet.png`: 같은 크기로 비교되게 1배 그림은 4배, 2배 그림은 2배로 키워요.
   - `assets-preview/pilot-sheet.png`(새로): 이번 시범 키만 모아 **옛 그림(4배)과 새 그림(2배)을 나란히** 보여 줘요. 키 이름 라벨은 없어도 돼요.
3. **그림(모두 density 2)** — 38개
   - 바닥: `tile-grass`, `tile-flower`, `tile-path`, `tile-water`(2프레임), `tile-bridge`, `tile-stone`(광장)
   - 소품: `prop-house`(2프레임), `prop-fountain`(2), `prop-lamp`, `prop-booth`, `prop-gate`(2), `prop-tree`, `prop-pine`, `prop-bush`, `prop-fence`, `prop-sign`, `prop-chest`(2), `prop-bridge-broken`
   - 캐릭터·겹침·몹: `char-player`, `char-robi`, `char-elder`, `char-zen`, `equip-hat-cap`, `equip-tool-stick`, `robi-part-wheel`, `mob-dummy`
   - 새 키(C11 묶음): `icon-quest-new`, `icon-quest-doing`, `icon-guide-arrow`, `icon-path-step`, `icon-talk`, `fx-target`, `ui-panel`, `ui-button`, `ui-bubble`, `ui-slot`, `ui-bar`, `ui-stick`
4. **시간이 모자라면** 이 순서로 해요: `char-player`·`char-robi` → 바닥 타일 → 집·나무 → 나머지 소품 → 새 키 → 겹침·몹.

## 그림 방향(품질 기준)
`docs/asset-spec.md`의 "고해상도 그림" 기준을 따르고, 아래를 더 지켜요.
- **분위기**: 햇살 좋은 바닷가 작은 마을, 따뜻한 오후 빛. 고치기 전(낡음) 모습은 색이 바래고 조금 금이 간 정도로, 무섭지 않게요.
- **이어 가기**: 지금 그림의 색·옷·모양을 이어 가서, 학생이 같은 캐릭터·같은 마을로 알아보게 해요.
- **캐릭터 32×48**: 머리는 약 18~20px. 눈은 2×3px 정도에 하이라이트 1px. 옷 주름·가방 끈 같은 작은 정보는 1~2개만.
  - `char-player`: 성별이 드러나지 않는 견습 탐험가.
  - `char-robi`: 작고 둥근 은색 로봇. 화면 같은 얼굴에 표정, 안테나. 금속은 밝은 반사 1~2px.
  - 걷기 4프레임은 팔·다리가 번갈아 움직이고 몸이 1px(2배 기준 2px) 오르내려요.
- **겹침 레이어**: 2배 `char-player`·`char-robi`의 같은 프레임 위에 얹었을 때 머리·손·발밑에 정확히 맞아야 해요(걷기 흔들림 포함).
- **타일 64×32**: 0~15행 너비 4, 8, …, 64px, 16~31행 64, …, 4px(2:1 계단, 가운데 정렬). 이웃 타일과 이음새 없이 맞아요. 풀·흙·물·돌 가장자리 색을 서로 어울리게 맞춰요.
- **집 64×96**: 문은 화면 왼쪽 아래를 보는 면에 또렷하게 그려요(다음 단계에서 집 안으로 들어가요). 프레임 0 낡음, 1 고쳐짐.
- **아이콘 32×32**: 길 안내 표시(`icon-quest-*`, `icon-guide-arrow`, `icon-path-step`)는 어떤 바닥 위에서도 잘 보이게 바깥 외곽선을 짙게 해요.
- **ui**: 크림색 종이 + 짙은 남색 테두리 + 금색 모서리 장식 정도로 차분하게. 9칸 나눔 모서리는 2배 그림에서 16px. 단추 3프레임은 보통·누름(2px 내려간 모습)·꺼짐(회색).
- **발밑 그림자**는 그리지 않아요. 게임이 따로 그려요.
- 기존 게임의 캐릭터·타일을 따라 그리지 않아요.

## 완료 기준
- `npm run assets`가 오류 없이 PNG, `manifest.json`, `contact-sheet.png`, `pilot-sheet.png`를 만들어요.
- `npm test`가 통과해요(팔레트 64색 이내·처음 32색 그대로·2배 크기·반투명 픽셀 검사 포함).
- `npm run build`가 통과해요.
- `npm run dev` 뒤 `http://localhost:5173/?gallery`에서 바닥 위에 세운 캐릭터·모자·지팡이·나무·집이 칸 가운데에 맞게 서 있고, 옛 그림과 크기가 같아요.

## 확인 명령
```bash
npm run assets && npm test && npm run build
```

## 커밋
사용자가 요청하면 작업 브랜치 `codex/11-hires-pilot`에 `C11: 마을 고해상도 그림 시범`으로 커밋 하나를 해요. main·push·머지·브랜치 바꾸기는 하지 않아요.

## 최종 보고(마지막 메시지)
- 2배로 그린 키 목록 / 못 그린 키
- 팔레트: 늘린 색 수와 쓰임
- 원본 형식에서 바꾼 점(밀도 표시 방법)
- 아틀라스 크기
- Claude가 봐 줬으면 하는 그림, 품질에서 고민한 점
- 필요한 변경(지시서 범위 밖이라 고치지 않은 것)
- 커밋했는지
