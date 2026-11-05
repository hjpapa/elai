# Codex 작업 C5 — 3장 갈림길 사막

## 목표
조건·센서·질문 규칙을 게임 능력으로 연결해 입구→미로→보스→배지까지 완성해요. C4 커밋 ff84ed4 위에서 시작해요.

## 먼저 읽을 것
AGENTS.md, CLAUDE.md, codex-roadmap.md, codex-run-all.md, curriculum 3장, ch3.ts, C4의 GridEnv/ProgramEditor/Battle와 데이터·테스트, asset-spec을 읽어요.

## 고쳐도 되는 파일
C4와 동일: src/data/**, src/game/**, src/missions/**(core/types.ts 제외), src/ui/**, src/fx/**, assets-src/**, scripts/build-assets.mjs, public/assets/**, tests/**, README.md, docs/curriculum.md, docs/tasks/README.md 및 본 지시서/진행 문서.
서비스·교사·Supabase·패키지/잠금·Vite/Vercel 설정·asset-spec은 고치지 않아요.

## 미리 승인한 계약 변경
로드맵 범위 안에서만 추가해요: TileKind sandstone, MapDef.theme desert, Cond signalRed. MobDef에 선택 hiddenPattern { choices: MobAction[]; seed: number }를 추가해 씨앗과 차례로 가려진 행동을 재현해요. MissionDataMap.classify의 PlannedData를 ClassifyData로 교체해요(질문 나무/tree, 나누기/sort, 묶기/cluster; 카드·질문·그룹·힌트). 기존 필드/키는 유지해요. 센서는 기존 unlocks.conds를 사용해요.

## 엔진
- GridEnv의 ! 신호 칸은 실행 차례에 따라 빨강/초록으로 바뀌어요. 빨강일 때 진입하면 실패하고 wait 후 초록에 이동해요. signalRed는 바로 앞 신호를 확인해요. 판에 색/글자로 상태를 보여요.
- 여러 길을 한 미션에서 임의 생성하는 대신, 다른 길의 독립 미션과 같은 프로그램을 세 길에 적용하는 테스트로 확인해요. 이유: 승인된 BlockCodeData 계약에 새 시나리오 필드를 추가하지 않고 기존 grid 형식을 유지해요.
- classify 엔진은 MissionEngine 그대로 구현하고 순수 평가 함수를 분리해요. 질문을 눌러 이진 분기 규칙을 만들고 카드가 예/아니요 경로로 나뉘는 결과를 보여요. 모든 잎이 한 종류이면 성공. 실패2회 힌트,3회 첫 질문 도움. 끌기 없이 버튼으로 전부 조작해요.
- 전투의 hiddenPattern은 씨앗+절대차례에 따라 진짜 행동을 만들어요. 예고는 ?, 조건은 실제 행동을 읽어요. clone은 같은 결과를 내고 미리 보기는 숨은 행동이나 조건 결과를 먼저 노출하지 않아요. 실제 실행 뒤에만 공개해요. sensor 보유 시 전투에 만약 카드/해금 조건을 제공해요.
- 사막 타일/벽/테마와 전투 바닥·음악·목표 안내를 연결해요. 걷기 조작/성장 공식은 유지해요.

## 데이터
- 기존 ch3 제목/목표/성취기준/파트 id·제목 유지. status playable, entryMap desert.
- p1 신호 조건 퍼즐, p2 상대 방향 센서 퍼즐 2개 이상(동일 조건 프로그램이 여러 길에서 성공), p3 동물8카드를 질문 나무로 나누기. p2 끝에 sensor 보상.
- boss-m1 오른손 규칙 미로, boss-m2 lizardChief 전투, boss-m3 퀴즈3문항, boss-m4 설명하기(맞음3/틀림2). 최종 badge-3/조건의 길잡이/장비/flags village-restore-3,ch3-clear.
- desert 입구 NPC guide(길잡이 나루), mirageLizard2마리·상자·표지판·마을포털, desertmaze 안개·개념연습 미로·보스방. 던전은 p3 완료 뒤 열려요. 마을 to-ch3는 ch2-clear 이후 열리고 복구 장식이 나타나요.
- 보스 권장Lv8, 수치는 테스트로 조정. 좋은 조건 프로그램은 여러 씨앗에서 0피해 또는 거의0피해 승리. 공격반복과 고정 평평한 프로그램은 실패.

## 그림
| 키 | 규격 |
|---|---|
| tile-sand | 기존32×16 유지·재사용 |
| block-sandstone | block32×24,1프레임 |
| prop-cactus | prop16×24,1 |
| prop-signal | prop16×24,2(빨강/초록) |
| char-guide | char16×24,10 |
| mob-mirage-lizard | mob24×24,4 |
| boss-lizard-chief | mob48×48,4 |
| robi-part-sensor | overlay16×24,10 |
| icon-part-sensor | icon16×16,1 |
32색 공용팔레트/텍스트원본/개별PNG+atlas를 유지해요. 로비 기존 부품과 정렬해요.

## 테스트
신호 빨강에서 이동실패/대기후통과, 동일 센서 프로그램 다중길 성공, 오른손 규칙 미로, classify 혼합잎실패/순수잎성공/빈입력실패, 조건전투 씨앗1~20 성공과 공격·고정프로그램 우회실패, clone/미리보기 비누설, NPC·상자·포털접근 및 gate, 본편 누적XP로 Lv8 도달, sensor 보상/조건해금. 이전61개 테스트 보존.

## 문서
README·curriculum 플레이범위·tasks목록 갱신. codex-progress에 실제 검증과 미검증 항목을 기록해요.

## 완료 기준
npm run assets, npm test, npm run build 모두 통과. 375px에서 신호·질문나무·조건전투를 확인하고 가능한 범위의 전체 미션/보상을 실행해요.

## 최종 보고
파일 목록(엔진/데이터/그림/테스트/문서), 승인계약 범위, 최종 몹수치/씨앗별 학습우회/성장결과, 화면·검증·미확인 항목, 필요한 변경, C5 커밋 해시를 진행 문서에 기록해요.
