# Codex 작업 C9 — 7장 프롬프트 공방

## 목표
작은 글 모음의 다음 낱말 횟수를 비교하고, 글·그림 주문서를 고쳐 묻고, 믿을 만한 게임 속 자료로 답을 확인해요. 실제 AI 서비스는 연결하지 않아요. C8 9c92201 이후 진행해요.
## 먼저 읽을 것
AGENTS/CLAUDE, roadmap/run-all,C4/C8 지시서,curriculum/ch7, prompt/evaluate·PromptMission,progress/registry,asset-spec.
## 고쳐도 되는 파일
C4와 동일: src/data/game/missions/ui/fx(단 core/types 제외), assets-src/public/assets, scripts/build-assets.mjs, tests, README/curriculum/docs/tasks. services/teacher/supabase/패키지/잠금/배포설정/asset-spec은 바꾸지 않아요.
## 미리 승인한 계약 변경
nextWord와 factCheck의 PlannedData를 실제 NextWordData/FactCheckData로 구체화해요. NextWordData는 intro,corpora{id,label,sentences[]}[],start,steps,question{q,choices,answer},hint,explain?. FactCheckData는 intro,sources{id,title,text}[],claims{id,text,source,choices[],answer,visual?{key,frame?,caption}}[],hint,explain?. PromptData에 선택 initialChoice와 image{width,height,palette,layers{slot,option,rows[]}[]}를 추가해요. 기존 필드/미션 종류/슬롯 id·뜻은 유지하며 그림 모드 화면에서만 주인공·배경·시간·스타일로 표시해요.
## 엔진
- nextWord: 띄어쓰기로 나눈 작은 글 모음의 바로 다음 말 횟수와 비율을 순수 함수로 계산해요. 학생이 후보를 골라 문장을 이어 가며 두 글 모음을 각각 바꿔 생성해요. 선택한 이어짐이 실제 기록에 있어야 하고 정해진 길이와 비교 질문을 만족해야 성공해요. 가장 흔한 말도 사실이라는 뜻은 아니라고 설명해요. 빈/미지 말/없는 연결을 거절해요.
- factCheck: 게임 속 자료 카드를 열어 읽고 각 문장의 그대로 두기/고친 문장과 근거 자료를 선택해요. 모든 답·자료가 정확하고 해당 자료를 열어 본 기록이 있어야 성공해요. 보기만 그럴듯한 오답/맞는 말의 부당한 수정/근거 없는 추측은 통과하지 않아요. 순수 평가와 실패2/3회 도움,375px/키보드 조작.
- 그림 prompt: 텍스트 격자 레이어를 주인공·배경·시간·스타일 선택으로 합성해 실제 픽셀 그림을 보여요. 그림 모드는 모든 요구 조건을 맞춰야 성공하고, 고쳐 묻기 횟수는 감점하지 않아요. initialChoice로 고칠 주문을 먼저 보여요. 기존 두 글 체험의 데이터/평가/보상은 유지해요.
- 안전 안내: 이름·주소·전화번호·학교·얼굴 사진을 넣지 않기, AI 도움 밝혀요. 학생 실제 정보 입력은 없고 선택형으로만 해요.
## 데이터
ch7 메타/파트 id·제목 유지,status playable/entryMap workshop. p1 nextWord,p2 기존 ch7-p2-m1/m2 그대로+고쳐묻기m3,p3 바닷가 고양이 그림(밤으로고치기)과talkModule. boss 기존m1은 5문장 중 잘못된2개를 자료로고치는factCheck,m2안전퀴즈,추가m3reflect와badge7/정직한질문가/장비/restore7/ch7-clear.
workshop 입구와 bookmaze 안개 던전, 기존젠 NPC재사용, babbleParrot2마리/상자/소품/표지판/마을포털,babbleKing NPC보스. 이 장의 정화는 사실확인 성공으로 이루어져 공격·레벨로 우회할 수 없어요(로드맵 C9보스형식). 일반 몹은 앞서 배운 기본프로그램으로 정화해요. 권장성장Lv13을 본편XP로 검사해요. to-ch7는ch6-clear,던전문은그림미션. 마을젠의 기존두미션은p1완료전에도기존순서대로미리해볼수있도록 canStart를해당두id만예외처리해요.
## 그림
기존 tile-wood/block-wall/char-zen을 재사용해요.
|키|규격|
|---|---|
|prop-easel|prop24×32 1|
|prop-bookshelf|prop32×40 1|
|mob-babble-parrot|mob24×24 4|
|boss-babble-king|mob48×48 4|
|robi-part-talk|overlay16×24 10|
|icon-part-talk|icon16×16 1|
32색 텍스트 원본/PNG/atlas, 기존 키 유지, 로비7부품10프레임겹침검토.
## 테스트
낱말횟수/모음변경/없는연결/생성·비교조건, 근거자료·정확수정·읽기기록·잘못된출처 거절, 그림레이어합성/조건누락/고쳐묻기3별, 기존글체험회귀와preview접근, 학습우회불가/성장/맵/게이트/이전120개회귀.
## 문서
README/curriculum/tasks목록/진행기록갱신.
## 완료 기준
assets/test/build 통과.375px생성/그림수정/사실확인/전체보상과마을미리해보기확인.미확인범위기록.
## 최종 보고
파일/계약/그림/엔진평가/성장·학습우회/화면/미확인/필요한변경/단계커밋기록.
