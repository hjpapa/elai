# Codex 작업 지시서

Claude가 지시서를 쓰고, 사용자가 Codex 앱에서 실행해요.

## 실행 방법
1. Claude가 알려 준 작업 폴더(예: `C:\code\elai-wt\codex-01`)를 Codex 앱에서 열어요. 브랜치와 `npm install`은 Claude가 미리 준비해 둬요.
2. 원하는 모델을 고르고 이렇게 부탁해요.
   > `docs/tasks/codex-01-assets.md` 지시서대로 작업해 줘. `AGENTS.md` 규칙을 지켜 줘.
3. Codex가 끝나면 Claude에게 "C1 끝났어"처럼 알려 주세요. Claude가 검토하고, 테스트한 뒤 커밋·머지해요.

## 규칙
- Codex는 지시서에 적힌 파일만 고치고, 커밋·push·브랜치 변경은 하지 않아요.
- 작업 폴더는 Claude가 일하는 폴더(`C:\code\code14_elai`)와 따로라서 서로 방해하지 않아요.

## 목록
| 번호 | 지시서 | 상태 |
|---|---|---|
| C1 | [codex-01-assets.md](codex-01-assets.md) — 픽셀아트 그림 전체 | 완료(114개, 검토 통과) |
| C2 | 1장 연출(걷기·전투 애니메이션, 효과음) | 1장 기준 구현 뒤 |
| C3 | 1장 글 채우기(아이템·도감·NPC 대사) | 1장 기준 구현 뒤 |
