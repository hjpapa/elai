# Codex 작업 C7 — 5장 인식의 연구소

## 목표
숫자 격자와 특징, 이름표 붙이기와 묶기, 가까운 예시로 분류하는 학습을 직접 경험하고 내 모델로 변신 슬라임을 정화해요. C6 0804cd8 이후 진행해요.
## 먼저 읽을 것
AGENTS/CLAUDE, roadmap/run-all, C4/C6 지시서, curriculum 5장, ch5.ts, classify/battle/state와 해당 테스트, asset-spec을 읽어요.
## 고쳐도 되는 파일
C4와 동일: src/data/**, src/game/**, src/missions/**(core/types 제외), src/ui/**, src/fx/**, assets-src/**, public/assets/**, scripts/build-assets.mjs, tests/**, README.md, docs/curriculum.md, docs/tasks/**. 서비스/교사/Supabase/패키지/잠금/배포설정/asset-spec은 바꾸지 않아요.
## 미리 승인한 계약 변경
schema에 lab/labwall 타일, lab 테마, Cond.modelPlayful, 선택 MobDef.classifyPattern {samples:{features:number[];label:string}[];seed:number}, 선택 SaveData.classificationModel {samples:{features:number[];label:string}[];k:number}을 추가해요. TrainData로 train의 PlannedData를 구체화: intro,features(특징 이름),labels{id,label},examples{id,label,features},tests{id,label,features},minExamples,k,threshold,hint,explain?,saveModel?. ClassifyData에 pixels 모드를 더하고 cards.features의 0/1 문자열 행을 목표 격자로 사용해요. 학습 칩의 기존 id learningChip을 유지하고 modelPlayful 조건을 열어요. 기존 필드 삭제/의미 변경 없음.
## 엔진
- train 순수 평가: 수치 특징의 제곱거리, k개의 가까운 이웃 투표(동률은 거리·이름으로 결정), 빈/비정상/다른 차원 입력 거절. 실제 시험자료 정확도, 표본 부족·치우침 비교. 이름표/포함 체크→학습→시험의 단계를 분리하고 바꾸면 모델 시험 결과를 무효화해요. 선택된 이름표의 정확성·최소 표본·정확도 기준을 만족해야 완료해요. 미션 성공 때만 슬라임 모델을 안전히 복사 저장해요.
- 실패2회 힌트·3회 첫 이름표 도움. 학습 표본과 시험 표본을 분리하고 실제 예측/정답/맞힌 비율을 보여요. 개인정보나 외부 AI 연결 없음.
- classify pixels는 숫자 격자와 켜진 칸을 대응시키는 누르기 활동. 이름표 나누기와 이름 없는 군집 평가도 활용해요.
- 전투는 모델이 현재 숫자 특징을 분류한 결과로 modelPlayful 조건을 판단해요. playful이면 정화 공격, friend이면 막기로 기다려요. 진짜 행동 조건/기존 물결 조건은 이 몹에서 정답을 알려주지 않아요. 패턴은 씨앗으로 표본을 고르며 예고에는 특징만 보여요. 잘못된 모델·공격 반복·이전 장 조건은 우회하지 못해요. clone은 모델을 깊게 복사하고 미리 보기로 정답을 누설하지 않아요.
## 데이터
기존 장 메타·파트 id/제목 보존. p1 픽셀 격자와 특징 퀴즈, p2 이름표 분류와 군집, p3 분류 학습으로 learningChip 획득. boss-m1 shiftKing 전투, 기존 boss-m2 설명하기 id 유지, 그 앞에 별도 boss-quiz를 추가해요. 보상 badge5/학습 연구가/장비/restore5/ch5-clear.
lab 입구와 labdeep 안개 던전, researcher NPC, shapeSlime 2마리, 상자/소품/표지판/마을포털. 학습 모델 획득 전 안전한 NPC 접근과 학습 미션으로 던전 문 개방. village to-ch5는 ch4-clear. 보스 권장Lv11이며 자연 성장 레벨에서도 우회 방지 검증.
## 그림
|키|규격|
|---|---|
|tile-lab|tile 32×16 1|
|block-lab|block 32×24 1|
|prop-microscope|prop 24×32 1|
|prop-jar|prop 16×24 2|
|char-researcher|char 16×24 10|
|mob-shift-slime|mob 24×24 4|
|boss-shift-king|mob 48×48 4|
|robi-part-learnchip|overlay 16×24 10|
|icon-part-learnchip|icon 16×16 1|
32색 텍스트 원본과 PNG/atlas, 기존 키 규격 보존, 부품10프레임 정렬 검토.
## 테스트
학습 평가 거리·동률·치우친 표본 실패·정확한 표본 성공·입력 변경 무효화의 순수 로직, 픽셀 비교, 모델 저장 기본값/복사, 여러 씨앗/권장 및 실제 레벨 학습 전투 승리와 우회 실패, 맵 도달/게이트/성장, 이전90개 회귀.
## 문서
README/curriculum/tasks 목록/진행 기록 갱신.
## 완료 기준
assets/test/build 통과. 375px에서 픽셀/학습/분류 전투/보상 흐름 확인, 못 본 범위 기록.
## 최종 보고
파일 묶음/승인 계약/몹 수치·분류 규칙·우회/성장/화면·미확인/필요한 변경/단계 커밋을 기록해요.
