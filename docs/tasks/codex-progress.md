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


## C6 — 4장 데이터 항구

- 상태: 완료(검토 대기). 커밋 첫 줄 “C6: 4장 데이터 항구”로 해시를 확인해요.
- 엔진: classify의 표·막대그래프 및 4비트 등불 조작과 순수 평가, battle/sim·runBattle의 살펴보기 카드와 물결 조건, state 관찰 기록 정리·저장, dex 관찰표, programEditor/labels, 맵·장면의 항구 타일/바닥, progress의 보스 NPC 안내를 연결했어요.
- 데이터: ch4의 기존 메타·파트 id/제목을 유지한 9미션, harbor 입구 20×16과 lighthouse 안개 던전 13×13, 모아 NPC·해파리 2마리·상자·이진수 게이트. 렌즈·배지4·데이터 기록가·기록자 조끼·복구4·clear4 보상을 연결했어요.
- 계약: schema에 dock/crate·harbor, scan, waveHigh/waveMiddle, 선택 MobDef.dataPattern 및 SaveData.observations, ClassifyData table/binary만 승인 범위로 추가했어요. 오래된 저장은 관찰표를 빈 값으로 시작하고, 기록은 알려진 몹/값/행동만 중복 없이 최대24행 남겨요.
- 그림: draw-harbor.mjs와 텍스트 원본/PNG 10키36프레임, assets.ts 추가만 수행. 전체141키373프레임, 1024×1024 atlas, 32색. 렌즈와 기존 부품의 10프레임 정렬을 검토했어요.
- 밸런스: 해파리 HP180/공격10/방어3/강타0.55/XP22, 문어 HP250/공격12/방어4/강타0.7, 둘 다 12차례/권장Lv10. 13개 물결값 순환으로 1=멍하니,2=막기,3=강타. 살펴보기 이후 실제 실행된 행동만 수집하며, 직접 행동 조건과 실행 미리 보기는 정답을 노출하지 않아요.
- 테스트: assets 생성, 90개 테스트(7파일), build, diff 검사 통과. Lv10·11·12 × 두 몹에서 관찰→물결 조건은 0피해 승리, 기록 없는 조건/직접 행동 조건/공격 반복/고정 공격·막기 반복은 실패. clone 관찰 깊은 복사, 0..15 이진수 범위, 빈 자료/미지 그룹 거절, 기존 저장, 게이트/도달성/성장 회귀를 포함해요.
- 성장: 본편 보스 전 누적905XP로 Lv12까지 도달하여 권장Lv10을 충족해요. 성장 공식과 슬롯 수는 바꾸지 않았어요.
- 화면: 375×812에서 9미션 전부3별 완료, 렌즈/배지4/칭호/clear·restore 확인. 관찰1라운드 후 물결조건6라운드로 보스 정화, HP71/71 유지, 실제 관찰3행 확인. 별도 검증에서 표/등불3회 실패의 단계별 도움과 키보드 포커스, 장부 미선택 거절·수정 선택을 확인했어요. 표3/2/1·그래프50/33.33/16.67%, 등불0011/0101/1010, 가로 넘침 없음, 자료 미션 브라우저 오류/경고0.
- 화면 자료: 이전과 동일 외부 검증 폴더의 output/playwright/c6-{table,binary,clean,scan-battle,boss-win,ch4-boss-m3,ch4-boss-m4}.png 및 assets-preview/c6-art.png,c6-robi-parts.png.
- 확인 못 함: 모든 맵을 직접 걷는 연속 완주, 실물 휴대폰·장시간 플레이. 전용 테스트 저장을 이어 썼고 일부 장면/프로그램과 권장Lv10 XP는 개발 인터페이스로 준비했어요. 본편 자연 성장과 접근 경로는 자동 테스트로 별도 확인했어요.
- Claude 검토 요청: 관찰 시작 시점과 실제 실행 기록, 물결 조건의 학습 우회 방지, 자료 UI의 교육 난이도.
- 필요한 변경: 승인 범위 밖 필수 변경 없음. README/curriculum/tasks목록과 C6 상세 지시서를 갱신했어요.


### C6 추가 확인
- C6 커밋 직후 같은 검증 저장의 도감에서 문어 관찰3행(1=멍하니,3=강타,2=막기)을 확인했어요. 새로고침·이어하기 후에도 관찰표·배지1~4·ch4-clear가 보존됐어요. 화면 자료 c6-dex-observations.png,c6-dex-restored.png.


## C7 — 5장 인식의 연구소

- 상태: 완료(검토 대기). 커밋 첫 줄은 “C7: 5장 인식의 연구소”예요.
- 엔진: missions/train/{evaluate,TrainMission}.ts와 registry에 이름표→학습→새 예시 시험→저장 흐름, 가까운 이웃 3개 투표·정확도·편향·재학습 평가를 추가했어요. classify pixels는 숫자 격자와 각 픽셀 위치를 맞추며 누르기/키보드를 지원해요. 2회 실패 힌트·3회 첫 예시 도움을 적용했어요.
- 데이터: 기존 ch5 메타·파트 id·제목 유지, 실제 8미션(픽셀/특징 퀴즈/이름표20개/군집8개/학습/전투/퀴즈/기존boss-m2 설명하기). lab18×14, labdeep19×11, 연구원 여울·슬라임·상자·소품·게이트. learningChip 기존 id와 새 분류 조건, badge5/학습 연구가/연구 신발/복구5/clear5 연결.
- 계약: lab/labwall·lab테마, modelPlayful, 선택 MobDef.classifyPattern과 SaveData.classificationModel, TrainData 구체화, ClassifyData pixels만 추가. 옛 저장은 빈 모델로 시작하고 모델 표본은 알려진 이름표·유한0..10 숫자 두 개·최대20개·유효k로 정리해 깊은 복사해요.
- 학습: 훈련8개와 시험4개를 분리했어요. 두 특징의 작은 수치로 친구/장난꾸러기를 분류해요. 올바른 표본 정확도100%, 친구만 넣은 표본50%. 선택/이름표 변경 시 이전 모델·시험 결과는 무효화되고 성공 때만 모델을 저장해요. 시험은 새 표본의 특징·예상·정답·비율을 표시해요.
- 전투: shapeSlime HP220/공격12/방어4/강타0.6/XP26, shiftKing HP320/공격14/방어5/강타0.7, 둘 다12차례·권장Lv11. 씨앗에 따라 숫자 특징이 달라지고 학생 모델의 분류로 장난꾸러기면 공격, 친구면 막아요. 실제 정답·행동은 실행 전 공개하지 않으며 친구 오분류 공격은 정화가 진행되지 않아요.
- 그림: draw-lab.mjs, 새9키34프레임, 전체150키407프레임·1024atlas·32색. 타일/벽/현미경/표본병/NPC/슬라임/대장/학습칩/아이콘. 기존 키 보존과 로비 부품10프레임 겹침 검토. 검토판 assets-preview/c7-art.png,c7-robi-parts.png.
- 테스트: assets 생성, 106개 테스트(8파일), build, diff 검사 통과. 실제 학습자료 기반 Lv11~14 × 두 몹 ×20씨앗=160전투 모두0피해 승리. 빈 모델은 시간초과, 치우친 모델/이전조건/공격반복은 승리불가. 입력·동률·차원·학습스냅샷·픽셀 위치·깊은복사·저장·맵접근·게이트·이전 장 회귀 포함.
- 성장: 본편 보스 전1157XP로 Lv13(문턱1020), 권장Lv11 충족. 성장/슬롯 공식 유지. 학습 전 안전한 NPC 접근 경로 확인.
- 필요한 변경: 승인 범위 밖 필수 변경 없음. README/curriculum/tasks목록과 상세 C7 지시서 갱신.

- 학습 화면: 375×812에서 픽셀9칸3별, 친구4개 학습50%/저장 차단, 실패2/3회 도움, 전체8개100%/저장 활성 확인. 이름표 변경 시 결과 제거·재학습 필요, 키보드 변경 뒤 초점 유지. 재학습 결과 samples8/k3·학습칩·XP25와 픽셀XP15 저장, 새로고침 뒤 유지. 가로넘침0(문서375,패널357/357), 세로스크롤로 전체 조작 가능, 콘솔 오류/경고0. 화면 자료 output/playwright/c7-{pixels,train-results,train-success}.png.

- 정상 경로 화면: 전용 C6 완료 저장을 이어 8/8미션 전부3별. 권장Lv11에서 모델 조건 보스5라운드 승리, 배지5/칭호/연구 신발/학습 칩/복구5/clear5 획득. 모델8개/k3, 완료8개, 배지·플래그가 새로고침 뒤 유지되고 도감에도 모델 요약이 표시돼요. 375×812 예고의 높이·점·모델 문구는 셀 안에 들어가고 목록 내부 스크롤을 사용해요.
- 확인 못 함: 전체 자연 이동 연속 완주, 실물 휴대폰·장시간 플레이. 테스트 저장에서 장면·권장레벨·프로그램은 개발 인터페이스로 준비하고 미션 입력·실행·보상은 실제 UI로 확인했어요. HMR 중 준비 스크립트가 타이틀 상태에서 한 번 실행되어 오류가 났지만 새로고침 후 안정된 경로를 끝까지 재검증했어요.
- Claude 검토 요청: 학습 예시와 시험 예시의 분리, 모델 저장 정규화, 친구 오분류 안내, 실제 모델 판단과 전투 조건 연결.
