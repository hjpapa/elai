# Codex 작업 지시서

Claude가 지시서를 쓰고, 사용자가 Codex 앱에서 실행해요.

## 실행 방법
1. Claude가 알려 준 작업 폴더(예: `C:\code\elai-wt\codex-01`)를 Codex 앱에서 열어요. 브랜치와 `npm install`은 Claude가 미리 준비해 둬요.
2. 원하는 모델을 고르고 이렇게 부탁해요.
   > `docs/tasks/codex-01-assets.md` 지시서대로 작업해 줘. `AGENTS.md` 규칙을 지켜 줘.
3. Codex가 끝나면 Claude에게 "C1 끝났어"처럼 알려 주세요. Claude가 검토하고, 테스트한 뒤 커밋·머지해요.

### 할당량 절약 기간(C4~C10)
**한 번에 맡기기**: Codex 앱에서 `C:\code\elai-wt\codex-04`를 열고 이렇게만 부탁해요. 중간에 멈추면 같은 말을 다시 하면 이어서 해요.
> `docs/tasks/codex-run-all.md`대로 C4부터 C10까지 끝까지 진행해 줘. `AGENTS.md` 규칙을 지켜 줘.

**단계마다 맡기기**(Codex가 쓴 지시서를 중간에 보고 싶을 때):
1. Codex 앱에서 `C:\code\elai-wt\codex-04`(브랜치 `codex/04-chapters`)를 열고 이렇게 부탁해요.
   > `docs/tasks/codex-04-ch2.md` 지시서대로 작업해 줘. `AGENTS.md` 규칙을 지켜 줘.
2. 끝나면 최종 보고를 보고, 다음 단계로 넘어가요.
   > 지금 작업을 C4로 커밋해 줘. 그다음 `docs/tasks/codex-roadmap.md`의 C5를 진행해 줘.
3. C10까지 같은 폴더에서 이어 가요. Claude 할당량이 차면 "C4~C7 끝났어, 검토해 줘"처럼 알려 주세요. Claude가 커밋 단위로 검토해서 main에 머지해요.

## 규칙
- Codex는 지시서에 적힌 파일만 고치고, 커밋·push·브랜치 변경은 하지 않아요.
- 작업 폴더는 Claude가 일하는 폴더(`C:\code\code14_elai`)와 따로라서 서로 방해하지 않아요.

## 목록
| 번호 | 지시서 | 상태 |
|---|---|---|
| C1 | [codex-01-assets.md](codex-01-assets.md) — 픽셀아트 그림 전체 | 완료(114개, 검토 통과) |
| C2 | [codex-02-polish.md](codex-02-polish.md) — 아틀라스(로딩), 효과음·배경 음악, 전투 연출, 로비 안테나, 휴대폰 화면 | 완료(검토 통과, main 병합) |
| C3 | [codex-03-ch1-text.md](codex-03-ch1-text.md) — 0·1장 아이템·도감·NPC 대사·미션 안내 글 | 완료(검토 통과, main 병합) |
| C4 | [codex-04-ch2.md](codex-04-ch2.md) — 2장 반복의 동굴 전체(엔진·데이터·그림·테스트) | 완료(검토 통과, main 병합) |
| C5 | [codex-05-ch3.md](codex-05-ch3.md) — 3장 갈림길 사막 | 완료(검토 통과, main 병합) |
| C6 | [codex-06-ch4.md](codex-06-ch4.md) — 4장 데이터 항구 | 완료(검토 통과, main 병합) |
| C7 | [codex-07-ch5.md](codex-07-ch5.md) — 5장 인식의 연구소 | 완료(검토 통과, main 병합 · 친구 차례 규칙은 Claude가 수정) |
| C8 | [codex-08-ch6.md](codex-08-ch6.md) — 6장 길잡이 천문대 | 완료(검토 통과, main 병합) |
| C9 | [codex-09-ch7.md](codex-09-ch7.md) — 7장 프롬프트 공방 | 완료(검토 통과, main 병합) |
| C10 | [codex-10-ch8.md](codex-10-ch8.md) — 8장 윤리의 성과 엔딩 | 완료(검토 통과, main 병합) |
| 연속 실행 | [codex-run-all.md](codex-run-all.md) — C4~C10을 한 번에, 단계마다 커밋, 기록은 `codex-progress.md` | 완료(C4~C10) |

고치는 파일이 겹치지 않는 작업은 동시에 돌려도 돼요. 이때는 꼭 **각자의 작업 폴더**를 열어 주세요.
