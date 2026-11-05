# Codex 연속 실행 기록

작업 폴더: C:/code/elai-wt/codex-04 · 브랜치: codex/04-chapters
단계 커밋 첫 줄로 완료 여부를 확인해요. push/merge/브랜치 전환은 하지 않아요.

## C4 — 2장 반복의 동굴

- 상태: 완료(검토 대기). 이 항목을 포함한 커밋 첫 줄은 “C4: 2장 반복의 동굴”이에요. 해시는 git log에서 확인해요.
- 엔진: src/game/battle/sim.ts (path당 에너지 1회, programCost, clone), src/missions/battle/runBattle.ts (프로그램 모드·실행 미리 보기·강조·보존), src/ui/programEditor.ts 및 styles.css (비용/잠금/12칸 스크롤), src/missions/core/gridEnv.ts 및 blockCode/BlockCodeMission.ts (정확한 칠하기), src/game/iso/mapRuntime.ts, scenes/WorldScene.ts·BattleScene.ts, rpg/progress.ts, src/ui/dex.ts·rewards.ts.
- 데이터: src/data/chapters/ch2.ts, maps/cave.ts·cavedeep.ts·index.ts·paint.ts·village.ts, npcs.ts, rpg/mobs.ts·robiParts.ts. 실제 미션 10개, 입구 20×16, 안개 동굴 30×11의 동일 꺾인 방 4개. 반복 퍼즐을 마치면 메모리 칩, 벽화 뒤 던전, 전투·퀴즈·설명하기 뒤 배지/칭호/바람 신발/복구 플래그를 받아요.
- 그림: src/game/assets.ts에 승인된 9키만 추가. assets-src/tools/draw-cave.mjs 및 9종 텍스트 원본, public/assets의 PNG·manifest·atlas. 기존 규격/32색 팔레트 유지. 총 123키·304프레임, 512×512 atlas. 로비+바퀴+메모리 칩 10프레임 겹침 검토.
- 계약: schema.ts의 cave/rockwall, theme cave, paint?, unlocks.repeat?, part.icon?만 추가. 기존 필드 삭제/의미 변경 없음. missions/core/types.ts, asset-spec, 서비스/교사/Supabase/패키지/배포 설정은 수정하지 않았어요.
- 테스트: tests/assets·battle·curriculum·interpreter·maps·state.test.ts. 생성/61개 테스트/빌드/diff 검사 모두 통과.
- 밸런스: 메아리 박쥐 HP40/공격6/방어1/강타0.3/XP12, 권장Lv5. 대장 HP120/공격7/방어2/강타0.6/12차례, 권장Lv6. Lv6·7·8에서 반복3회{쉬기,공격,막기,공격}은 0피해 승리, 슬롯 수만큼의 평평한 프로그램과 공격 반복은 패배. 일반 박쥐도 올바른 반복은 0피해, 공격만 반복하면 체력20% 초과 손실. 본편 보스 전 XP421(미션282+몹92+상자47)로 Lv8에 도달해 권장Lv6 충족.
- 화면: 375×812에서 반복 추가/횟수/몸체 실제 클릭 완료, 7개 퍼즐 실행과 벽화 실패→수정 성공, 보스 반복 프로그램 3별 승리, 퀴즈/설명하기 완료로 10개 미션 기록 모두 확인. 별도 테스트 프로필과 1장 완료 fixture를 사용했으며 일부 프로그램/장면은 개발 인터페이스로 주입했어요. 전투 아래패널 397.875px, 12칸 영역 폭341/내용572px, 마지막 칸까지 스크롤 확인. 배지2/반복의 탐험가/복구 플래그/마을 수정2개 표시 확인.
- 화면 자료: 외부 검증 폴더 C:/Users/tbose/.codex/visualizations/2026/11/04/01a1a6c9-8349-7712-84d3-50667c5011e1/output/playwright/c4-{paint-fail,paint-success,battle-mobile,boss-win,complete,cavedeep}.png. 아트 검토는 assets-preview/c4-art.png·c4-robi-chip.png.
- 회귀: 새 캐릭터/0장 대화, 기존 칸 전투1라운드, 숲 첫퍼즐3별, 미로/수호자 화면, 7장 글 주문서3별·보상저장 확인. 회귀 브라우저 오류/경고0. 구현 중 HMR로 검증 페이지가 재시작된 경우는 안정화 후 재검증했어요.
- 확인 못 함: 맵을 처음부터 걷는 전체 연속 플레이, 0·1장 전체 재완주, 실물 휴대폰·장시간 플레이. 지도 도달성/방 순서/게이트/성장/보스 밸런스는 자동 테스트로 확인했어요.
- Claude 검토 요청: 반복 에너지 path 규칙과 clone 부작용 없음, 12칸 UI 스크롤, 후속 장 능력 확장 때 학습 우회 방지 유지.
- 필요한 변경: 승인 범위 밖 필수 변경 없음.
- 문서: README.md, docs/curriculum.md, docs/tasks/README.md의 플레이 범위/상태 갱신.
