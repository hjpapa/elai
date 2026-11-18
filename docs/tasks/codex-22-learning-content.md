# Codex 작업 C22 — 학습 콘텐츠 대보강

## 목표
콘텐츠 점검에서 이런 문제가 나왔어요.
- 1~8장 일반 파트 24개 중 11개는 미션이 하나뿐이에요. 문서는 파트 하나를 1차시(플레이 25분)로 잡아요.
- 6장 '정확도 실험'은 제목과 달리 데이터 **양**이 아니라 **치우침**의 차이를 보여 줘요. 적은 예시 2개가 둘 다 '맑음'이기 때문이에요.
- 5장의 '치우친 데이터 체험'이 필수 과정에 없어요.
- 퀴즈 34문항 중 20문항은 혼자 가장 긴 보기가 정답이고, 뒤쪽 장에도 '마법 주문', '바닷물' 같은 보기가 있어요.
- 말투·사실 오류와 똑같이 반복되는 안내 글이 있어요.

앞 단계일수록 중요해요. **차례대로 하고 단계마다 커밋해요.**

| 단계 | 이름 | 결과 |
|---|---|---|
| 1 | 글·사실 바로잡기 | 말투, 동물 분류, 반복 글 |
| 2 | 선택 미션 틀 | 진도를 막지 않는 '더 해 보기' 미션 |
| 3 | 5·6장 학습 실험 | 치우침과 데이터 양을 실제로 비교 |
| 4 | 선택 미션 11개 | 미션이 하나뿐인 파트 보강 |
| 5 | 퀴즈 다시 쓰기 | 찍어서 맞히기 어려운 문항 |
| 6 | NPC 대사 | 장마다 말을 더 걸고 싶은 인물 |
| 7 | 교사용 안내 자료 | 차시별 도입·정리 질문과 주의점 |

## 먼저 읽을 것
1. `AGENTS.md`, `docs/tasks/codex-22-24-common.md`
2. `docs/curriculum.md`
3. `src/data/schema.ts`, `src/data/chapters/*.ts`
4. `src/game/rpg/progress.ts`, `unlock.ts`, `guide.ts`, `skip.ts`, `state.ts`, `demo.ts`
5. `src/game/scenes/WorldScene.ts`의 `talk`, `refreshGuide`
6. `src/missions/train/**`, `src/missions/classify/**`, `src/missions/quiz/**`, `src/missions/nextWord/**`, `src/missions/prompt/**`, `src/missions/factCheck/**`
7. `tests/curriculum.test.ts`, `tests/train.test.ts`, `tests/maps.test.ts`, `tests/unlock.test.ts`, `tests/guide.test.ts`, `tests/demo.test.ts`

## 고쳐도 되는 파일
| 단계 | 파일 |
|---|---|
| 모든 단계 | 새 테스트 `tests/**`, `docs/tasks/codex-22-progress.md` |
| 1 | `src/data/chapters/ch1.ts`, `ch3.ts`, `ch6.ts` |
| 2 | `src/data/schema.ts`(승인한 곳), `src/data/chapters/index.ts`, `src/game/rpg/progress.ts`, `unlock.ts`, `guide.ts`, `skip.ts`, `state.ts`(`partDone`, `nextMissionOf`만), `src/game/scenes/WorldScene.ts`(`talk`, `refreshGuide`와 새 도우미 메서드만) |
| 3 | `src/data/schema.ts`(승인한 곳), `src/missions/train/**`, `src/data/chapters/ch5.ts`, `ch6.ts`, `src/data/maps/observatory.ts`(문·표지판 글만), `docs/demo-guide.md`(5장 줄만) |
| 4 | `src/data/chapters/ch3.ts`~`ch8.ts`, 미션을 주는 NPC가 있는 `src/data/maps/*.ts`(해당 NPC의 `missions`만) |
| 5 | `src/data/chapters/*.ts`의 퀴즈 |
| 6 | 장 맵 `src/data/maps/{forest,maze,cave,cavedeep,desert,desertmaze,harbor,lighthouse,lab,labdeep,observatory,starmaze,workshop,bookmaze,castle,mirrormaze}.ts`의 `talk`만 |
| 7 | 새 파일 `src/data/lessonGuide.ts`, `docs/curriculum.md` |

## 미리 승인한 계약 변경(`src/data/schema.ts`)
`MissionBase`에 아래 필드를 더해요.

```ts
/** 선택 미션(더 해 보기): 장 진도·문 열림·목표 안내를 막지 않아요. 경험치는 주지 않아요. */
optional?: boolean;
```

`TrainData.comparison`을 아래 모양으로 바꿔요.

```ts
export interface TrainTrial {
  id: string;
  /** 시험 고르기 단추 글자 */
  label: string;
  /** 이 시험에 쓰는 예시 id */
  examples: string[];
  /** 일부러 틀린 이름표(예시 id → 이름표 id). 자료의 질을 비교할 때만 써요 */
  wrongLabels?: Record<string, string>;
}

comparison?: {
  trials: TrainTrial[];
  /** 저장·성공 판정에 쓰는 시험 */
  finalTrial: string;
  question: string;
  choices: string[];
  answer: number;
};
```

## 미리 승인한 테스트 변경
- `tests/train.test.ts`의 `evaluateComparison` 부분을 새 모양에 맞게 바꿔요. 조건은 약해지면 안 돼요.
- `tests/curriculum.test.ts`의 `같은 시험에 두 예시는50%, 여덟 예시는100%를…`을 3단계의 새 기준으로 바꿔요.

## 1단계: 글·사실 바로잡기
아래 뜻을 지키며 2줄·약 20자에 맞게 다듬어요.

1. **1장 '디버깅 퀴즈' 2번 보기**를 해요체로 바꿔요.
   - `프로그램을 다 지우고 새로 만들어요` / `한 단계씩 실행해서 틀린 곳을 찾아요` / `아무 블록이나 바꿔 봐요`
2. **3장 `ch3-p3-m1`**
   - 제목을 `스무고개 동물 맞히기`로 바꿔요. 붕어·송어가 나와서 '사막 동물'은 맞지 않아요.
   - 벌과 나비도 몸에 잔털이 있어서 `털이 있나요?` 질문은 사실과 맞지 않아요.
   - 질문을 `새끼에게 젖을 먹이나요?`로, 특징 id `fur`를 `milk`로 바꿔요. 고양이·여우만 해당해요.
   - 힌트를 `날개만 있으면 새와 곤충이 섞여요.\n깃털과 젖 먹이기도 물어봐요.`로 바꿔요.
3. **3장 센서 미션 `ch3-p2-m2`, `ch3-p2-m3`**: `ch3-p2-m1`과 똑같은 소개·힌트·정리를 바꿔요.
   - m2 핵심: 길이 달라져도 같은 규칙이 통해요. 길을 외우지 않아도 돼요.
   - m3 핵심: 길이 길어져도 같은 네 블록 프로그램으로 충분해요.
4. **6장 `ch6-boss-maze`**: `ch6-p1-m1`과 똑같은 글을 바꿔요. 더 넓은 미궁에서도 같은 방법이 통하고, 가장 짧은 길을 숫자로 찾는다는 뜻이에요.

테스트: 3단계에서 `ch6-p3-m1`의 힌트까지 바꾼 뒤, 미션끼리 `intro`, `hint`, `explain`이 완전히 같으면 실패하는 검사를 더해요. 예외 목록을 만들지 않아요.

## 2단계: 선택 미션 틀
선택 미션은 먼저 끝낸 학생이 더 해 보는 미션이에요. 진행 중인 학생을 뒤로 끌어당기지 않아야 해요.

**규칙**
- 파트의 `missions` 배열에서 필수 미션 뒤에 둬요. id는 `ch6-p1-x1`처럼 써요.
- 보상은 `{ coins: 5 }`~`{ coins: 10 }`만 줘요. 경험치·아이템·플래그·배지·칭호·로비 부품은 주지 않아요.
- 그 앞의 필수 미션을 끝내야 시작할 수 있어요.
- 안 해도 장 완료, 다음 미션, 다음 장, 문 열림, 엔딩, 목표 안내, 길 안내를 막지 않아요.

| 곳 | 바꿀 동작 |
|---|---|
| `src/data/chapters/index.ts` | `requiredMissions(part)` 도우미를 더해요 |
| `canStart` | 앞 미션 검사에서 선택 미션을 건너뛰어요 |
| `nextGoal` | 필수 미션만 다음 목표가 돼요 |
| `chapterDone`, `currentChapter` | 필수 미션만 봐요 |
| `GameState.partDone`, `nextMissionOf` | 필수 미션만 봐요 |
| `skipKit` | 선택 미션을 세지 않아요 |
| `hasNewMission` | 필수 미션만 봐요 |
| 새 `hasExtraMission(state, npc)` | 지금 시작할 수 있는 선택 미션이 있는지 봐요 |
| 새 `extraMissionFor(state, ids, afterId?)` | `afterId`와 같은 파트의 선택 미션을 먼저, 없으면 NPC의 다른 선택 미션을 돌려줘요 |
| `refreshGuide` | 필수는 지금 느낌표, 선택만 남았으면 같은 그림에 청록 틴트(`0x82cce0`)예요 |

**`WorldScene.talk` 흐름**
1. NPC의 필수 미션 중 안 끝낸 첫 미션이 있으면 지금처럼 진행해요.
2. 그 미션을 **성공**하면 같은 파트의 선택 미션을 권해요.
   - 확인창: `더 해 볼 미션이 있어요.\n지금 해 볼까요?`, 단추 `해 볼게요` / `다음에요`
3. 필수 미션이 없으면 대사를 말한 뒤 선택 미션을 권해요. 선택 미션이 없으면 지금의 "별을 더 받으러" 확인창으로 가요.

**테스트**
- 선택 미션을 안 했어도 다음 필수 미션, 장 완료, 다음 장 문, `nextGoal`이 지금과 같아요.
- 예전 저장(새 미션 기록 없음)이 뒤로 끌려가지 않아요.
- 선택 미션 보상은 동전 10 이하이고 다른 보상이 없어요. 모두 파트 끝에 있어요.
- 모든 선택 미션을 주는 NPC가 정확히 하나 있고, 그 NPC에게 갈 수 있어요.
- `tests/maps.test.ts`의 경험치 합계는 바꾸지 않아요.

## 3단계: 5·6장 학습 실험
`TrainMission`과 `evaluate.ts`를 시험 비교 방식으로 바꿔요.
- `comparison`이 있으면 시험 고르기 단추를 보여 줘요. 예시 체크 상자는 직접 바꾸지 않아요.
- 단추를 누르면 그 시험의 예시를 고르고, 학생이 `학습하기` → `새 예시로 시험`을 눌러요.
- 시험마다 정확도 막대를 남겨요. 시험 순서대로 비교해서 보여 줘요.
- `evaluateComparison(data, results, answer)`는 **모든 시험을 했고**, `finalTrial`이 통과 기준을 넘고, 답이 맞을 때만 참이에요.
- `학습 결과 저장`은 `finalTrial`의 모델을 써요. 틀린 이름표 시험의 모델을 저장하면 안 돼요.
- 별: 시도 수가 시험 수 이하이면 3개, 시험 수 + 2 이하이면 2개, 그보다 많으면 1개예요.
- 320px에서도 단추와 막대가 넘치지 않아요.

### `ch6-p3-m1` 정확도 실험
아래 자료를 그대로 넣어요. 맑음과 비를 **언제나 같은 수**로 두고 양만 늘려요. Claude가 현재 `predictLabel`로 계산해 확인한 값이에요.
- `presetLabels: true`, `saveModel: false`, `k: 3`, `threshold: 1`, `minExamples: 12`
- 특징은 `구름 양`, `바람 세기`, `습도`, 이름표는 `sunny`=맑음, `rain`=비예요.

| 예시 | 특징 | 이름표 | 시험 자료 | 특징 | 이름표 |
|---|---|---|---|---|---|
| `sky1` | 3,4,4 | sunny | `skyTest1` | 2,3,4 | sunny |
| `sky2` | 9,5,6 | rain | `skyTest2` | 9,6,8 | rain |
| `sky3` | 3,3,3 | sunny | `skyTest3` | 9,4,3 | sunny |
| `sky4` | 2,6,8 | rain | `skyTest4` | 3,5,7 | rain |
| `sky5` | 8,3,3 | sunny | `skyTest5` | 2,2,2 | sunny |
| `sky6` | 7,6,8 | rain | `skyTest6` | 8,5,7 | rain |
| `sky7` | 7,3,3 | sunny | `skyTest7` | 8,2,2 | sunny |
| `sky8` | 7,4,6 | rain | `skyTest8` | 1,6,6 | rain |
| `sky9` | 9,3,2 | sunny | | | |
| `sky10` | 3,4,7 | rain | | | |
| `sky11` | 8,3,2 | sunny | | | |
| `sky12` | 2,4,6 | rain | | | |

| 시험 id | 단추 | 예시 | 정확도 |
|---|---|---|---|
| `amount2` | 예시 2개 | `sky1`~`sky2` | 50% |
| `amount4` | 예시 4개 | `sky1`~`sky4` | 75% |
| `amount8` | 예시 8개 | `sky1`~`sky8` | 87.5%(화면 88%) |
| `amount12` | 예시 12개 | `sky1`~`sky12` | 100%, `finalTrial` |
| `noisy12` | 12개, 이름표 3개 틀림 | 12개 전부. `sky4`=sunny, `sky7`=rain, `sky12`=sunny로 바꿔요 | 75% |

- 소개: `구름·바람·습도 기록으로 비를 예측해요.\n예시 수만 바꾸며 시험해 봐요.`
- 힌트: `맑음과 비는 늘 같은 수예요.\n막대가 어떻게 달라지는지 봐요.`
- 질문: `이번 실험에서 알 수 있는 것은?`
- 보기: `고른 자료가 늘수록 더 잘 맞혔어요`(정답) / `예시가 많으면 언제나 100%예요` / `이름표가 틀려도 많기만 하면 돼요`
- 정리: `여러 상황을 고루 보면 더 잘 맞혀요.\n이름표가 틀리면 많아도 나빠져요.`
- `observatory`의 문과 표지판 글을 `예시 수를 바꿔 비교하면…`처럼 실험에 맞게 다듬어요.

### `ch5-p3-m1` 로비 학습 칩
학생이 이름표를 붙인 뒤 두 시험을 해요.
- `friendOnly`: `친구 예시만`, 친구 예시 4개(50%)
- `both`: `두 종류 모두`, 예시 8개(100%, `finalTrial`)
- 질문: `친구 예시만 배운 모델은 왜 틀렸을까요?`
- 보기: `장난꾸러기를 본 적이 없어서요`(정답) / `시험 문제가 너무 적어서요` / `예시에 숫자가 있어서요`
- 소개 글에 "한쪽 예시로 먼저 시험한다"는 흐름을 넣어요. 저장되는 모델은 8개 예시 모델이에요. 5장 보스 전투가 그대로 동작해야 해요.
- `docs/demo-guide.md`의 5장 줄을 새 흐름에 맞게 고쳐요.

**테스트**: 6장은 각 시험의 맑음·비 수가 같고 정확도가 표와 같아요. 5장은 50%→100%예요. 시험을 빼먹거나 답이 틀리면 저장할 수 없어요. 틀린 이름표 모델은 저장되지 않아요.

## 4단계: 선택 미션 11개
이 순서로 만들어요(뒤로 갈수록 덜 급해요): **6장 → 5장 → 7장 → 8장 → 3장 → 4장**. 기존 엔진만 쓰고, 미션을 끝까지 풀 수 있는지 테스트해요.

| id | 파트 | 종류 | 제목 예시 | 내용과 합격 조건 |
|---|---|---|---|---|
| `ch6-p1-x1` | 물결 탐색 | `classify` `search` | 두 갈래 별길 | 길이가 다른 두 길이 있는 미로. 최단 8칸 이상. 먼 길을 고르면 실패 |
| `ch6-p2-x1` | 날씨 예측 | `train` | 별똥별 관측 예보 | 구름 양·달빛·바람 세기로 보여요/안 보여요를 예측. `presetLabels`. 8개 예시, 4개 시험 |
| `ch6-p3-x1` | 데이터 양 | `quiz` | 정확도 막대 읽기 | 50→75→88→100%와 틀린 이름표 75%를 읽고 해석하는 3문항 |
| `ch5-p3-x1` | 나만의 분류 AI | `train` | 헷갈리는 표본 | 경계에 가까운 표본이 있어 8개를 모두 배워도 시험 4개 중 3개만 맞아요. `threshold: 0.75`, AI도 틀릴 수 있고 사람이 확인한다는 정리 |
| `ch7-p1-x1` | 다음 말 맞히기 | `nextWord` | 다른 글 모음 | 내용이 다른 두 글 모음에서 다음 말이 달라지는 것을 비교. 자주 나온 말이 사실은 아니라는 질문 |
| `ch7-p3-x1` | 그림 주문서 | `prompt` + `image` | 숲속 로봇 그림 | `바닷가 고양이 그림`처럼 칸마다 층이 있는 픽셀 그림. 처음 주문서의 빠진 칸을 고쳐 다시 부탁 |
| `ch8-p1-x1` | 치우친 데이터 | `classify` `balance` | 실제 구성 맞추기 | 실제 구성이 6·3·3인 자료. 모두 같은 수로 맞추면 실패하고 실제 구성으로 맞춰야 성공 |
| `ch8-p3-x1` | 진짜? 가짜? | `factCheck` | 소문 확인하기 | 가상의 섬 소식과 제작 기록·원본 자료를 비교. 실존 인물·실제 사진 없음. 틀린 문장을 근거로 고쳐요 |
| `ch3-p1-x1` | 신호등 규칙 | `blockCode` | 두 번째 신호등 | 신호가 둘인 더 긴 길. 같은 조건 프로그램이 통과하고 평평한 짧은 프로그램은 실패 |
| `ch3-p3-x1` | 스무고개 AI | `classify` `tree` | 교실 물건 스무고개 | 물건 8개를 질문 3개로 4종류의 순수한 잎으로 나눠요. 생물 사실 논란이 없는 물건을 써요 |
| `ch4-p3-x1` | 이진수 등대 | `classify` `binary` | 등대 글자 신호 | 글자마다 번호를 정한 표로 세 글자를 0과 1로 보내요. "컴퓨터도 글자마다 정한 번호를 쓴다"는 뜻을 쉽게 전해요 |

- 미션마다 `npc`를 파트의 기존 미션과 같게 두고, 맵 NPC의 `missions`에서 그 파트의 필수 미션 바로 뒤에 넣어요.
- 소개·힌트·정리는 기존 미션과 달라야 해요. 그 파트의 핵심을 다른 상황에 적용하게 해요.
- 같은 정답을 외워서 풀리지 않게 하고, `tests/curriculum.test.ts`의 기존 데이터 검사도 통과해야 해요.

## 5단계: 퀴즈 다시 쓰기
모든 퀴즈의 학습 내용은 지키고 문항의 질을 높여요.
- 보기는 학생이 실제로 할 만한 **오해**로 써요. 4~8장에는 장난스러운 오답을 쓰지 않아요.
- 4~8장의 퀴즈 미션마다 상황을 읽고 판단하는 문항을 하나 이상 넣어요.
- 0~3장은 쉬운 말을 유지해요.
- 정답마다 왜 그런지 해설을 달아요.

테스트(`tests/content-quality.test.ts`)
- 장마다 "혼자 가장 긴 보기가 정답"인 문항은 3분의 1 이하예요.
- 전체 정답 위치 1·2·3번이 각각 25% 이상이에요.
- 한 문항 안에 같은 보기가 없고, 보기·문제·해설은 비어 있지 않아요.

## 6단계: NPC 대사
- 장 맵의 일반 NPC는 `talk`를 3줄 이상으로 늘려요. 정화된 보스(`*-fixed`)는 2줄 이상이에요.
- 그 장의 개념을 다른 상황에 떠올리게 하는 말, 인물의 성격이 보이는 말을 섞어요.
- 정답이나 다음 미션 풀이를 그대로 알려 주지 않아요.
- 같은 맵 안에서 같은 말을 되풀이하지 않아요.

## 7단계: 교사용 안내 자료
화면 연결은 Claude가 해요(`src/teacher/**`는 고치지 않아요). 데이터만 만들어요.

```ts
export interface LessonPartGuide {
  part: string;
  /** 도입 5분에 물을 질문 1~2개 */
  opening: string[];
  /** 정리 10분에 물을 질문 1~2개 */
  closing: string[];
  /** 학생이 자주 오해하는 점이나 살필 점 */
  watch: string;
}
export interface LessonChapterGuide {
  chapter: string;
  /** 준비물 없이 하거나 교실에 있는 것으로 하는 활동 */
  unplugged: string;
  parts: LessonPartGuide[];
}
export const LESSON_GUIDE: LessonChapterGuide[];
```

- 0~8장의 모든 장과 파트를 채워요. `docs/curriculum.md`의 차시·평가 관점·언플러그드 활동과 맞춰요.
- 학생 개인정보를 요구하는 활동은 넣지 않아요.
- `docs/curriculum.md`에 선택 미션과 달라진 5·6장 실험을 반영해요. 6장 평가 관점은 "양과 질에 따른 정확도 막대 해석"으로 맞춰요.
- 테스트: 장·파트 id가 실제 데이터와 모두 맞고 빈칸이 없어요.

## 완료 기준
- 끝낸 단계의 요구 사항과 테스트를 채웠어요.
- `npm test`와 `npm run build`가 통과해요.
- 새 미션과 바뀐 미션을 `/?demo`에서 끝까지 플레이했어요.
- 일반 모드에서 선택 미션을 건너뛰어도 진행이 막히지 않아요.
- 허락된 파일만 바꿨어요.

## 확인 명령
```bash
npm test && npm run build
```
