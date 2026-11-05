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
| C2 | [codex-02-polish.md](codex-02-polish.md) — 아틀라스(로딩), 효과음·배경 음악, 전투 연출, 로비 안테나, 휴대폰 화면 | 완료(검토 통과, main 병합) |
| C3 | [codex-03-ch1-text.md](codex-03-ch1-text.md) — 0·1장 아이템·도감·NPC 대사·미션 안내 글 | 완료(검토 통과, main 병합) |

고치는 파일이 겹치지 않는 작업은 동시에 돌려도 돼요. 이때는 꼭 **각자의 작업 폴더**를 열어 주세요.
