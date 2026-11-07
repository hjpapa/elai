# AGENTS.md — ELAI 공동 작업 규칙

이 저장소는 Claude와 Codex가 함께 만들어요. Codex는 이 파일을 자동으로 읽고, Claude는 `CLAUDE.md`에서 이 파일을 불러와요.

## 프로젝트
초등 3~6학년 AI·SW 교육용 성장형 2.5D(아이소메트릭) RPG "엘라이 섬".
- Vite + TypeScript + Phaser 3.90, 픽셀아트 PNG, Supabase(선택), Vercel 배포
- 실행 `npm run dev` · 테스트 `npm test` · 빌드 `npm run build` · 그림 생성 `npm run assets`
- 커리큘럼: `docs/curriculum.md`, 그림 규격: `docs/asset-spec.md`, 작업 지시서: `docs/tasks/`

## 담당 (같은 파일을 동시에 고치지 않아요)
| 담당 | 경로 |
|---|---|
| Claude | `src/game/`(iso, scenes, rpg, battle), `src/missions/`, `src/minigames/`, `src/services/`, `src/ui/`, `src/teacher/`, `src/data/schema.ts`, `supabase/`, 설정 파일 |
| Codex | `assets-src/`, `scripts/build-assets.mjs`, `public/assets/`, `src/fx/`, 지시서가 허락한 데이터 파일 |

- 사용자가 지시서 경로를 알려 주면 그 지시서대로 작업하고, 마지막 메시지에 지시서의 "최종 보고" 항목을 남겨요.
- 작업 지시서(`docs/tasks/codex-NN-*.md`)에 적힌 파일만 고쳐요.
- 지시서에 없는 파일을 고쳐야 하면 고치지 말고, 최종 보고에 "필요한 변경"으로 적어 주세요.

### 2.5D 개선 기간(2026-11-06부터)
학생 테스트 뒤 조작·길 안내·2.5D 그림·건물 미니게임을 다듬어요. 단계와 담당은 `docs/tasks/README.md`에 있어요.
- 엔진(`src/game/**`, `src/missions/**`, `src/minigames/**`, `src/ui/**`, `src/data/**`)은 Claude가 먼저 만들어요. Codex는 지시서가 허락한 엔진 파일만 고쳐요(Claude가 사용량 한도로 넘길 때).
- Codex는 고해상도 그림(`docs/asset-spec.md`의 "고해상도 그림")과 지시서가 허락한 데이터·글을 맡아요.
- 계약 파일은 지시서의 "미리 승인한 계약 변경"에 적힌 것만 바꿔요.
- `supabase/**`, `src/services/**`, `src/teacher/**`, `package.json`·잠금 파일, `vercel.json`, `vite.config.ts`, `src/missions/core/types.ts`, `docs/asset-spec.md`는 Codex가 고치지 않아요.
- 커밋은 **사용자가 요청할 때만** 작업 브랜치(`codex/…`)에 단계마다 하나씩 해요. main 브랜치, push, 머지, 브랜치 바꾸기는 하지 않아요.

## 계약 파일 (Claude 승인 없이 바꾸지 않아요)
- `src/data/schema.ts` — 게임 데이터 타입
- `src/game/assets.ts` — 그림 키·크기·프레임 목록
- `src/missions/core/types.ts` — 미션 엔진 인터페이스
- `docs/asset-spec.md` — 그림 규격

## 코드 규칙
- TypeScript strict. `any`는 쓰지 않아요(불가피하면 이유를 주석으로).
- 화면에 보이는 글은 한국어. 식별자는 영어.
- 새 라이브러리를 추가하지 않아요(필요하면 보고).
- 끝내기 전에 `npm test`와 `npm run build`가 통과해야 해요.
- 커밋·push·브랜치 변경은 하지 않아요. Claude가 검토한 뒤 커밋해요(Codex가 작업 브랜치에 커밋하는 경우는 위 "담당"을 보세요).

## 콘텐츠 톤 (학생에게 보이는 모든 글)
- 해요체. 말풍선 한 번에 2줄 이내(한 줄 약 20자).
- 0~3장(3~4학년)은 쉬운 낱말. 어려운 용어는 뜻과 함께 써요: "알고리즘(문제를 푸는 순서)".
- 실존 인물·브랜드·기존 게임의 캐릭터·이름은 쓰지 않아요.
- 성별·외모·직업 고정관념이 없는 예시, 다양한 이름.
- 비폭력: 몹은 "고장 난/장난꾸러기" 존재이고 이기면 "수리/정화"되어 친구가 돼요. "죽이다, 처치, 피" 같은 말은 쓰지 않아요.
- 학생의 이름·주소·전화번호·학교·얼굴 사진을 묻거나 넣게 하지 않아요.

## 그림 규칙 요약 (자세히는 `docs/asset-spec.md`)
- 픽셀아트, 공용 팔레트(`assets-src/palette.json`, 64색 이내. 앞의 32색은 바꾸지 않아요)만 써요.
- 고해상도 그림은 목록 크기의 2배 PNG로 그리고 매니페스트에 `density: 2`를 적어요(`docs/asset-spec.md`).
- 원본은 `assets-src/`의 텍스트 격자. `npm run assets`가 `public/assets/`에 PNG와 `manifest.json`을 만들어요.
- 키·크기·프레임 수는 `src/game/assets.ts` 목록을 그대로 따라요.
