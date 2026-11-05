# Codex 작업 C8 — 6장 길잡이 천문대

## 목표
물결 탐색으로 가장 짧은 길을 찾고, 기록의 양·질에 따른 예측 정확도와 불확실성을 체험해요. C7 03278b3 위에서 진행해요.
## 먼저 읽을 것
AGENTS/CLAUDE, roadmap/run-all, C4/C7 지시서, curriculum/ch6, train/classify/battle 및 테스트, asset-spec.
## 고쳐도 되는 파일
C4와 동일: src/data/game/missions/ui/fx(단 missions/core/types 제외), assets-src/public/assets, scripts/build-assets.mjs, tests, README/curriculum/docs/tasks. 서비스/교사/Supabase/패키지/잠금/배포 설정과 asset-spec은 바꾸지 않아요.
## 미리 승인한 계약 변경
schema에 observatory/observatorywall 타일과 observatory 테마, Cond.forecastRisk, 선택 MobDef.forecastPattern {seed:number}, RobiPartDef.unlocks.forecast?를 추가해요. 기존 predictModule id를 유지해요. ClassifyData.mode에 search를 추가하고 첫 카드 features에 S/G/./# 격자 행을 넣어요. TrainData에 선택 comparison {smallCount:number;question:string;choices:string[];answer:number}, presetLabels?를 추가해요. 새 저장 기록은 필요 없고 예측은 이번 전투에서 실제 본 기록만 써요.
## 엔진
- search: BFS 순수 함수로 거리/최단 경로를 계산해요. 학생이 물결 한 단계씩 퍼뜨려 거리를 보고, 열린 칸을 눌러 최단 경로를 선택해요. 인접하지 않은 이동/벽/우회는 정답으로 인정하지 않아요. 기존 임시 blockCode 탐색을 직접 거리와 길을 조작하는 classify 화면으로 바꾸는 이유는 탐색 과정을 눈으로 확인하기 위해서예요.
- train: 연습용 구름·바람·습도 자료를 같은 가까운 이웃 평가로 예측해요. 비교 미션은 기록된 정답 이름표를 쓰고, 같은 시험 자료에 적은 예시와 충분한 예시를 각각 학습/시험해야 해요. 두 정확도 막대와 비교 질문을 확인해야 성공. 양만 많으면 항상 옳다는 설명은 하지 않아요.
- 예측: 전투에서 실제 지나간 행동의 전이 횟수(바로 전 행동 다음에 무엇을 했는지)로 다음 행동의 비율을 구해요. 알려지지 않았으면 자료 부족을 표시하고 조심해서 막아요. forecastRisk는 강타가 관찰된 비율이 0보다 크거나 아직 기록이 없을 때 참이에요. 처음 막기로 기록을 모은 뒤 예측 조건에 따라 공격/막기 프로그램을 만들어요.
- 여우는 씨앗에 따라 길이1~3의 힘모으기 또는 길이1~2의 막기 구간 후 강타/멍하니가 이어져요. 힘모으기 뒤 가끔 멍하니로 바뀌어 예측은 확정이 아니에요. 고정 공격/막기 반복도 모든 씨앗에서 통하지 않아요. 실제 미래 행동을 예측 계산/미리보기로 읽지 않으며, 현재 차례 이후 예측은 진행하며 다시 계산해요. clone은 기록을 깊게 복사해요. 직접 enemy/model/wave 조건은 예측 몹에서 우회하지 못해요.
## 데이터
ch6 메타/파트 id·제목 유지, p1 물결 최단 길, p2 날씨 예측, p3 같은 시험표로 적은 예시/많은 예시 비교와 predictModule. boss 앞 별자리 미궁 search(새 boss-maze id), 기존 boss-m1 starFox 전투, boss-quiz, 기존 boss-m2 설명하기. badge6/예측 길잡이/장비/restore6/ch6-clear.
observatory 입구와 starmaze 안개 던전, astronomer NPC, cometFox 2마리·상자·표지판·소품·마을포털. 모듈 전에 안전하게 NPC에 접근하고 비교 미션으로 던전 문이 열려요. village to-ch6는 ch5-clear. 권장Lv12와 본편 도달 레벨 모두 검사해요.
## 그림
|키|규격|
|---|---|
|tile-observatory|tile32×16 1|
|block-observatory|block32×24 1|
|prop-telescope|prop32×32 1|
|prop-starlamp|prop16×32 2|
|char-astronomer|char16×24 10|
|mob-meteor-fox|mob24×24 4|
|boss-star-fox|mob48×48 4|
|robi-part-predictor|overlay16×24 10|
|icon-part-predictor|icon16×16 1|
기존 키 보존/32색/텍스트 원본/PNG·atlas/부품 정렬 검토.
## 테스트
BFS 거리·최단 경로·벽/점프/우회/갈 수 없는 격자 거절, 같은 시험자료 소량/전체 비교·선택 변경·질문 오답 거절, 예측의 실제 과거 기록만 사용/불확실성/clone, 권장·자연레벨×여러씨앗 승리 및 공격/이전조건/고정반복 우회 실패, 성장/맵/게이트, 이전106개 회귀.
## 문서
README/curriculum/tasks 목록과 진행 기록 갱신.
## 완료 기준
assets/test/build 통과,375px 탐색/비교/예측 전투/보상 확인. 못 본 범위 기록.
## 최종 보고
파일·계약·그림·몹 수치·예측 규칙/우회·성장·화면·미확인·필요한 변경·단계 커밋 기록.
