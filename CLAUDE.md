@AGENTS.md

# Claude 메모
- 계획 원본: 1차 계획(커리큘럼·RPG·협업 방식)은 `docs/curriculum.md`와 이 파일, `AGENTS.md`에 반영돼 있어요.
- Codex 작업은 `docs/tasks/codex-NN-*.md` 지시서로 맡겨요. Claude가 별도 worktree(`C:\code\elai-wt\codex-NN`, 브랜치 `codex/NN-이름`)를 만들고 `npm install`까지 해 두면, **사용자가 Codex 앱에서 직접 실행**해요(이 PC의 Codex CLI는 원하는 모델을 못 쓰고 Windows 샌드박스 도우미가 없어서 `codex exec`로 돌리지 않아요). 끝났다고 알려 주면 검토·테스트 후 커밋·머지해요.
- Supabase(tcontext)는 다른 앱과 같이 쓰는 프로젝트예요. `elai_` 접두사가 붙은 객체만 만들고, 기존 객체는 건드리지 않아요.

## 할당량 절약 기간(2026-11-05~)
- Codex가 C4(2장)부터 `docs/tasks/codex-roadmap.md` 순서대로 장을 만들어요. 작업 폴더 `C:\code\elai-wt\codex-04`, 브랜치 `codex/04-chapters`에 단계마다 커밋 하나(사용자가 요청할 때 Codex가 커밋).
- 이 기간에는 Codex가 엔진 파일과 미리 승인한 계약 변경까지 고쳐요(`AGENTS.md`). 할당량이 차면 커밋 단위로 검토하고, 통과한 단계까지 main에 머지한 뒤 엔진 구조 작업을 이어 가요.
- 검토 때 특히: 승인 범위 밖 계약 변경, `sim.ts`·`interpreter.ts`·`WorldScene.ts`·`runBattle.ts` 변경이 앞 장을 깨는지, 학습 우회 방지·성장 곡선 테스트가 약해지지 않았는지, 새 미션 엔진의 평가 함수 테스트.

## Codex 결과 검토 체크리스트
1. 지시서 범위 밖 파일·계약 파일을 바꿨는지
2. `npm test`, `npm run build`
3. 그림: `assets-preview/contact-sheet.png`를 직접 보기(규격·가독성·스타일 통일·팔레트)
4. 브라우저에서 해당 장면 플레이
5. 학생용 글: 콘텐츠 톤 규칙, 개념 정확성, 학년 수준
