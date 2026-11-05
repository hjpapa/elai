# Codex 작업 C10 — 8장 윤리의 성과 엔딩

## 목표
치우친 자료를 고치고 개인정보·합성물·정직한 사용·사람의 최종 결정을 배우며 8장과 마을 엔딩을 완성해요. C9 08bc845 위에서 진행해요.
## 먼저 읽을 것
AGENTS/CLAUDE,roadmap/run-all,C4/C9 지시서,curriculum/ch8,classify/factCheck/battle,state/WorldScene/ui,asset-spec.
## 고쳐도 되는 파일
C4와 동일: src/data/game/missions/ui/fx(core/types 제외),assets-src/public/assets,scripts/build-assets.mjs,tests,README/curriculum/docs/tasks. 서비스/교사/Supabase/패키지/잠금/배포설정/asset-spec은 바꾸지 않아요.
## 미리 승인한 계약 변경
schema에 castle/castlewall 타일·castle 테마, ClassifyData.mode balance와 선택 initialCounts:Record<string,number>, 선택 MobDef.balanceRule {flag:string;hp:number;atk:number;def:number}만 추가해요. 기존 SaveData.flags에 ch8-balanced/ending-seen을 사용하므로 저장 계약은 바꾸지 않아요. 새 카드·성장/슬롯 공식 변경 없음.
## 엔진
- balance: 게임 속 실제 구성비를 제시하고 초기 치우친 표본 개수를 학생이 증감해 고쳐요. 표·막대를 즉시 바꾸며 실제 자료와 정확히 같아야 성공해요. 이 섬의 세 로봇 종류는 실제로 네 대씩이라는 설정으로만 같은 수를 목표로 해요. 모든 현실 문제가 같은 개수로 공정해진다고 가르치지 않아요. 정확히 고친 미션 보상 ch8-balanced를 전투에 연결해요.
- factCheck: 기존 근거읽기/수정 엔진과 visual로 합성 그림·글의 제작 기록을 확인해요. 겉모습만으로 진위를 확정하지 않고 원본/제작자/신뢰할 자료/동의/AI 도움 표시를 다뤄요. 실제 학생 사진이나 정보를 입력하지 않아요.
- 골렘: ch8-balanced 없이는 보호막 때문에 공격으로 정화할 수 없어요. 고친 뒤 balanceRule의 낮은 HP/공격/방어를 적용하고 이를 시작 안내에 보여요. 복제/실제UI는 같은 약해진 수치를 쓰고 원본 MobDef는 바꾸지 않아요. 앞서 배운 반복·조건으로 강타를 막고 정화해요. 데이터 미수정 상태는 레벨을 올려도 우회하지 못해요.
- 엔딩: 배지1~8 모두와 ch8-clear가 있어야 마을에서 로비 대화→8부품 완성 모습→배지·칭호 돌아보기를 보여요. 닫기 대신 완료 버튼으로 ending-seen과 마지막 칭호를 저장하고, 새로고침 뒤 자동 반복하지 않아요. 중복/누락 배지·미완료 상태에서는 열리지 않아요. 완료 전 HUD는 마을로 돌아가도록 안내해요. 사람이 확인하고 결정하며 AI는 함께 배우고 자라는 일을 돕는다는 쉬운 말로 정리해요.
## 데이터
ch8 기존 메타·파트 id/제목 유지,status playable/entryMap castle. p1 balance와 ch8-balanced,p2 개인정보sort+상황quiz,p3 거울factCheck(제작기록과그림/글확인)와ethicsCore,boss 기존m1battle/추가boss-quiz/기존m2reflect로badge8/책임있는탐험가/장비/restore8/ch8-clear.
castle입구와 mirrormaze안개던전,keeper NPC,fakeShadow2마리,biasGolem NPC·상자·소품·표지판·마을포털. p3미션으로던전문개방,to-ch8는ch7-clear. 데이터고치기전에NPC안전접근. 권장Lv14와본편도달레벨에서밸런스확인.
## 그림
|키|규격|
|---|---|
|tile-castle|tile32×16 1|
|block-castle|block32×24 1|
|prop-mirror|prop32×48 2|
|prop-banner|prop24×32 1|
|char-keeper|char16×24 10|
|mob-fake-shadow|mob24×24 4|
|boss-bias-golem|mob48×48 4|
|robi-part-ethics|overlay16×24 10|
|icon-part-ethics|icon16×16 1|
공용32색/텍스트원본/PNG·atlas/기존키보존,8부품전체10프레임겹침검토.
## 테스트
balance초기분포실패/정확한비율성공·누락/과다거절,개인정보/합성물근거평가,균형플래그없이공격/최고레벨우회실패·수정후권장/자연레벨0피해승리·공격반복실패,원본수치/clone보존,엔딩8배지·완료플래그·중복/기존저장·재실행방지,성장/맵/게이트/이전139개회귀.
## 문서
README와curriculum의0~8장완료범위,8장30~33차시/마무리34차시를실제미션/엔딩에맞춰고쳐요. 교육부대원칙인사람의성장을지원하는AI를쉬운말로담아요. tasks목록/진행기록갱신.
## 완료 기준
assets/test/build 모두통과.375px자료균형·합성물근거·골렘전투·마을대화/완성로비/배지/칭호·저장복원확인. 모든0~8장playable과실제미션데이터연결확인.미확인범위기록.
## 최종 보고
파일/승인계약/그림/약화규칙·학습우회·성장/엔딩/자동·화면검증/미확인/필요한변경/C10커밋기록. 최종메시지에C4~C10커밋표를남겨요.
