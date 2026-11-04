@AGENTS.md

# Claude 메모
- 계획 원본: 1차 계획(커리큘럼·RPG·협업 방식)은 `docs/curriculum.md`와 이 파일, `AGENTS.md`에 반영돼 있어요.
- Codex 작업은 `docs/tasks/codex-NN-*.md` 지시서로 맡기고, 별도 worktree(`C:\code\elai-wt\codex-NN`, 브랜치 `codex/NN-이름`)에서 `codex exec -C <폴더> -s workspace-write -o <결과파일> -`로 실행해요. `npm install`은 먼저 해 둬요.
- Supabase(tcontext)는 다른 앱과 같이 쓰는 프로젝트예요. `elai_` 접두사가 붙은 객체만 만들고, 기존 객체는 건드리지 않아요.

## Codex 결과 검토 체크리스트
1. 지시서 범위 밖 파일·계약 파일을 바꿨는지
2. `npm test`, `npm run build`
3. 그림: `assets-preview/contact-sheet.png`를 직접 보기(규격·가독성·스타일 통일·팔레트)
4. 브라우저에서 해당 장면 플레이
5. 학생용 글: 콘텐츠 톤 규칙, 개념 정확성, 학년 수준
