# Codex 작업 C6 — 4장 데이터 항구

## 목표
수집·분류·정리·표/그래프·0과1을 직접 조작하고 데이터로 전투 규칙을 찾는 4장을 완성해요. C5 d70db08 위에서 진행해요.
## 먼저 읽을 것
AGENTS/CLAUDE,로드맵/연속실행,교육과정4장,ch4.ts,C5 classify와battle/자료/테스트,그림규격을 읽어요.
## 고쳐도 되는 파일
C4/C5와 동일. src/data/game/missions/ui/fx,assets-src/public-assets,생성스크립트,tests,README/curriculum/tasks문서. core/types·asset-spec·services·teacher·supabase·패키지·배포설정은 변경하지 않아요.
## 미리 승인한 계약 변경
로드맵의 추가 범위만 사용: TileKind dock/crate,theme harbor, BattleCmd scan,Cond waveHigh/waveMiddle,선택MobDef.dataPattern {values:number[];actions:MobAction[]},선택SaveData.observations Record<몹id,{value:number;action:MobAction}[]>.
classify 실제데이터에 table/binary 모드를 추가해 기존 카드/그룹필드를 재사용해요. QuizData 계약을 바꾸는 대신 표만들기/등불조작을 classify 엔진의 작은 화면으로 구성해요. 기존ch4임시미션 kind는 이학습목표에맞춰조정해요. freshSave/GameState에서 선택기록의 기본값을 채워 옛저장을 유지해요(services는변경하지않아요).
## 엔진
- classify table: cards의 group을 세어 그룹별 빈도표를 학생이 숫자버튼으로 채우고, 입력과 연동한 막대그래프를 만들어요. 전부 정확해야 성공. 그래프해석은 뒤퀴즈에서확인해요.
- classify binary: 카드별 목표수(card.group에십진문자열),4개의 비트(8/4/2/1)를 켜고끄며 합계/0과1을 보여줘요. 목표와정확히같아야성공. groups는4개비트의id/라벨로써요. 순수평가함수검증.
- scan 에너지0. 그라운드에실제로관찰한물결값/행동을기록해도감표에남겨요. 같은관측중복누적을제한하고저장크기를제한해요. scan은dataLens가해금해요.
- dataPattern몹은행동예고대신물결값1~3이보여요. 실제행동은 actions[value-1]로정해져요. 안개속직접행동조건(enemySmash등)은판단할수없어false. 스캔한자료가있어야waveHigh/waveMiddle을사용할수있어요. 첫관찰라운드는 scan 뒤막기로안전하게자료를모으고, 다음라운드에값조건프로그램으로승리해요. preview가실행전정답을노출하지않아요. clone은관찰기록을깊은복사해요.
- 도감에물결값/행동표를보여요. 옛저장에는빈기록을기본으로써요. 맵/전투바닥/아이콘/목표안내연결,기존성장공식유지.
## 데이터
ch4의장메타/파트id제목유지,status playable,entryMap harbor. p1 아날로그/디지털 및숫자/글/그림/소리나누기(2미션),p2표/그래프만들기+해석퀴즈,p3이진수등불과데이터렌즈보상. boss-m1자료의누락/중복/단위오류를고치는선택형정리,classify sort의그룹라벨을고친값/삭제조치로써요. boss-m2 ledgerOcto전투,boss-m3퀴즈,boss-m4설명하기/배지4/데이터기록가/장비/복구4/ch4-clear.
harbor입구(항구지기모아harborKeeper,NPC/몹fogJelly2/상자/소품/표지판/마을포털),lighthouse안개던전(이진수미션완료로진입문개방·보스방·상자). to-ch4는ch3-clear. 권장보스Lv10,본편실제도달레벨까지밸런스검사.
## 그림
|키|규격|
|---|---|
|tile-dock|tile32×16,1|
|block-crate|block32×24,1|
|prop-lighthouse|prop32×48,2|
|prop-buoy|prop16×24,2|
|char-harbor|char16×24,10|
|mob-fog-jelly|mob24×24,4|
|boss-ledger-octo|mob48×48,4|
|robi-part-lens|overlay16×24,10|
|icon-part-lens|icon16×16,1|
|icon-card-scan|icon16×16,1|
32색/기존키유지,原본은텍스트격자,개별PNG/atlas생성. 렌즈는기존부품정렬.
## 테스트
나누기/표의정확한집계/이진수범위·불일치거절,스캔자료후조건전투승리·스캔/자료조건없이우회실패,clone/미리보기비노출,옛저장기록기본값,도감기록,맵gate/보스접근,누적XP성장.앞75개회귀통과.
## 문서
README/curriculum/tasks목록/진행기록갱신.
## 완료 기준
assets/test/build 모두통과,375px에서표/그래프·등불·스캔도감·보스흐름을실제검증해요. 못본범위는기록해요.
## 최종 보고
파일묶음/승인계약/몹수치·수집규칙·우회/성장검사/화면·미확인/필요한변경/C6커밋해시를진행문서에남겨요.
