@AGENTS.md

# Claude 메모
- 계획 원본: 1차 계획(커리큘럼·RPG·협업 방식)은 `docs/curriculum.md`와 이 파일, `AGENTS.md`에 반영돼 있어요.
- Codex 작업은 `docs/tasks/codex-NN-*.md` 지시서로 맡겨요. Claude가 별도 worktree(`C:\code\elai-wt\codex-NN`, 브랜치 `codex/NN-이름`)를 만들고 `npm install`까지 해 두면, **사용자가 Codex 앱에서 직접 실행**해요(이 PC의 Codex CLI는 원하는 모델을 못 쓰고 Windows 샌드박스 도우미가 없어서 `codex exec`로 돌리지 않아요). 끝났다고 알려 주면 검토·테스트 후 커밋·머지해요.
- Supabase(tcontext)는 다른 앱과 같이 쓰는 프로젝트예요. `elai_` 접두사가 붙은 객체만 만들고, 기존 객체는 건드리지 않아요.

## 2.5D 개선 기간(2026-11-06~)
- 학생 테스트 의견(회전 블록, 조작, 길 안내, 2.5D 느낌, 들어가는 건물·미니게임, 그림 품질)을 단계로 나눠 진행해요. 단계와 담당: `docs/tasks/README.md`.
- 엔진은 Claude가 먼저 만들어요. 사용량 한도에 걸리면 남은 엔진 작업을 지시서로 써서 Codex에 넘겨요.
- 그림은 Codex: 먼저 마을 시범(C11, `C:\code\elai-wt\codex-11`, 브랜치 `codex/11-hires-pilot`), 사용자가 좋다고 하면 장마다.
- 검토 때 특히: 2배 그림이 목록 크기의 정확히 2배인지, 앞의 32색이 그대로인지(옛 그림이 깨지지 않게), 겹침 레이어 정렬, 아틀라스 크기(4096px 이내). 2장 이후 검토 기준(학습 우회 방지·성장 곡선 테스트가 약해지지 않았는지)은 그대로예요.

## Codex 결과 검토 체크리스트
1. 지시서 범위 밖 파일·계약 파일을 바꿨는지
2. `npm test`, `npm run build`
3. 그림: `assets-preview/contact-sheet.png`를 직접 보기(규격·가독성·스타일 통일·팔레트)
4. 브라우저에서 해당 장면 플레이
5. 학생용 글: 콘텐츠 톤 규칙, 개념 정확성, 학년 수준
