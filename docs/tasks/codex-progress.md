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

## C5 — 3장 갈림길 사막

- 상태: 완료(검토 대기). 커밋 첫 줄 “C5: 3장 갈림길 사막”으로 해시를 확인해요.
- 엔진: missions/classify/{evaluate,ClassifyMission}.ts 및 registry (질문나무/나누기/묶기 순수평가·입력UI·2/3회 실패도움·키보드포커스), gridEnv/BlockCodeMission 및 ui/labels (신호조건/빨강진입실패/기다리기/색·글자), game/battle/sim·missions/battle/runBattle·ui/programEditor·styles (씨앗숨은행동/센서조건/숨김미리보기/최대12회반복), mapRuntime/paint/WorldScene/BattleScene/progress (사막타일·바닥·길안내).
- 데이터: chapters/ch3.ts의 기존 장메타/파트id·제목 유지, 실제9미션(신호1·센서3·질문나무1·보스미로/전투/퀴즈/설명하기4). maps/desert.ts(20×16)·desertmaze.ts(11×9 안개), maps/index·village, npcs, rpg/mobs·robiParts. 센서/배지3/조건의길잡이/숲지기모자/복구3 플래그 연결.
- 계약: schema의 Cond.signalRed, TileKind.sandstone, theme.desert, 선택 MobDef.hiddenPattern, classify의 PlannedData→ClassifyData 구체화만 승인범위에서 추가. 기존 타일 tile-sand는 그대로 재사용. hiddenPattern의 0-based 홀수차례(2·4·6번째)는 씨앗으로 선택되고 나머지는 기존 패턴이에요.
- 그림: assets-src/tools/draw-desert.mjs와8종텍스트/PNG, assets.ts 8키추가, manifest/atlas/원본README. 전체131키337프레임,512×512atlas,32색. 로비센서+기존부품10프레임정렬검토. 검토판 assets-preview/c5-art.png,c5-robi-parts.png.
- 테스트: 기존61개 보존, classify/interpreter/battle/curriculum/maps/state/그림 포함 총75개 통과, assets생성/build/diff 검사 통과.
- 밸런스: 일반도마뱀 HP150/공격8/방어2/8차례/강타0.5,대장HP180/공격10/방어3/12차례/강타0.7. 둘다 visible guard,hidden idle 또는smash. HP70/130에서 발견한공격우회는150으로수정. Lv8·9·10×씨앗1~20×두몹=120조건전투 모두0피해승리, 같은경우 공격반복패배·고정평평한프로그램승리불가·공격막기고정반복시간초과. clone동일결과와공개preview전부null로정보누출없음을검사.
- 성장: 본편보스전누적655XP(이전421+2장보스60+3장미션100+3장몹54+상자20),Lv10까지도달하여권장Lv8충족. 실제도달Lv10도우회방지검사포함.
- 화면: 전용테스트저장(C4완료이어하기),375×812. 신호/동일센서프로그램3길/질문나무/오른손규칙미로/조건보스/퀴즈/설명하기 전9미션3별기록과badge3,title,clear/restore확인. 일부프로그램/장면은개발인터페이스로준비하고 실제실행/선택/보상흐름을검증. Lv8조건보스0피해3별. 예고6칸은?, 미리보기12칸모두실행하며결정, 패널397.875px. 별도질문나무실패2회힌트/3회첫질문,Tab/Enter포커스,4개순수잎각2장,1별4시도2힌트보상검증. 질문나무가로넘침없음(357/357px),세로스크롤로완료접근,해당브라우저오류/경고0.
- 화면자료: 외부검증폴더 output/playwright/c5-{signal-mobile,tree-leaves,tree-success,right-hand-win,hidden-battle,boss-win,complete}.png(C4와동일기본경로).
- 확인못함: 모든맵을걸어다니는전체연속플레이,실물휴대폰,장시간. 맵접근/gate/보상/성장자동검증. 센서획득전안전NPC접근경로도읽기검토했어요.
- Claude 검토요청: 숨은행동정보가미리보기로새지않는지,조건카드가씨앗에따라실행되는지,질문나무의이진경로표시와학년난이도. 미로보스제공NPC와HUD안내불일치는수정했어요.
- 필요한변경: 승인범위밖필수변경없음. 문서 README/curriculum/tasks목록과 C5상세지시서를갱신했어요.
