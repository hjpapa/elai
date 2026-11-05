# 엘라이 섬 (ELAI)

초등 3~6학년을 위한 AI·SW 교육 **성장형 2.5D RPG**예요. 학생은 아이소메트릭 섬을 탐험하며 레벨을 올리고, 장비를 모으고, 몹과 "프로그램 전투"를 하고, 미로 던전을 풀어요. 그 과정에서 알고리즘 → 프로그래밍 → 데이터 → AI 원리 → 생성형 AI 활용 → AI 윤리를 익혀요.

- 교육과정·성취기준 연결·34차시 운영안: [docs/curriculum.md](docs/curriculum.md)
- 지금 플레이할 수 있는 범위: **0장 코딩 마을, 1장 순서의 숲, 2장 반복의 동굴, 3장 갈림길 사막(조건·센서·질문 나무), 7장 프롬프트 공방 체험(글 주문서 2개)**. 4~8장 전체는 차례로 만들고 있어요.

## 빠르게 시작하기
```bash
npm install
npm run dev
```
- 게임: http://localhost:5173
- 교사 페이지: http://localhost:5173/teacher.html
- 그림 검토 화면: http://localhost:5173/?gallery

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm test` | 테스트(인터프리터·전투 밸런스·맵 도달 가능성·커리큘럼·그림 규격) |
| `npm run build` | 타입 검사 + 배포용 빌드(`dist/`) |
| `npm run assets` | `assets-src/` 텍스트 격자 → `public/assets/` PNG·매니페스트 |

Supabase 설정이 없으면 **체험 모드**(이 기기에만 저장)로 동작해요.

## 폴더 구조
```
src/
  data/        커리큘럼(chapters/ch0~ch8), 맵, 아이템·몹·로비 부품, 타입(schema.ts)
  game/        Phaser 장면(Boot·Title·World·Battle), 아이소 엔진, 성장·전투 계산
  missions/    미션 화면(블록 퍼즐, 순서 카드, 퀴즈, 설명하기, 프롬프트), 인터프리터, 전투 화면
  ui/          HUD, 대화창, 가방, 도감, 블록 편집기, 스타일
  services/    저장(이 기기·학급 서버), Supabase
  teacher/     교사 페이지
  fx/          효과음·배경 음악
assets-src/    픽셀아트 원본(텍스트 격자)과 팔레트
supabase/      데이터베이스 마이그레이션
docs/          교육과정, 그림 규격, Codex 작업 지시서
tests/         Vitest 테스트
```

## 학급 저장(Supabase)
학생은 이메일 없이 **학급 코드 + 별명 + 비밀 숫자 4자리**로 들어와요(익명 로그인). 비밀 숫자는 bcrypt로 암호화해 저장하고, 5번 틀리면 10분 동안 잠겨요. 선생님은 이메일로 로그인해서 자기 학급 학생의 진도만 볼 수 있어요.

1. Supabase 대시보드에서 **Authentication → Sign In / Providers → Anonymous sign-ins**를 켜요.
2. SQL 에디터에서 [supabase/migrations/001_elai_init.sql](supabase/migrations/001_elai_init.sql)을 실행해요. `elai_` 접두사가 붙은 테이블·함수만 만들고, 같은 프로젝트의 다른 객체는 건드리지 않아요. `pgcrypto`는 `extensions` 스키마에 이미 있어야 해요.
3. **Authentication → URL Configuration**에 배포 주소를 넣어요. Site URL과 Redirect URL에 `/teacher.html`을 포함해요(교사 가입 확인 메일용).
4. 환경변수를 넣어요. 로컬은 `.env.local`(`.env.example` 참고), Vercel은 Production·Preview·Development 모두에 넣어요.
   ```
   VITE_SUPABASE_URL=https://<프로젝트>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon(공개) 키>
   ```

| 테이블 | 내용 |
|---|---|
| `elai_classes` | 학급(교사, 이름, 6자리 코드, 미리 연 장) |
| `elai_students` | 학생(별명, 비밀 숫자 해시, 지금 연결된 기기) |
| `elai_progress` | 미션별 별·시도·힌트(교사 페이지의 과정 기록) |
| `elai_saves` | 게임 저장 전체(JSON) |

## 배포(Vercel)
GitHub 저장소를 Vercel에 연결하면 `main`에 push할 때마다 자동으로 배포돼요. PR마다 미리보기 주소도 생겨요. 설정은 [vercel.json](vercel.json)에 있어요. Vite 빌드를 쓰고, `cleanUrls`로 `/teacher`도 열려요.

## 교사 페이지
`/teacher.html`에서 할 수 있는 일이에요.
- 가입·로그인
- 학급 만들기(학생 입장 코드 발급), 입장 안내 인쇄
- 장 미리 열기
- 학생별 미션 별점·시도 횟수·힌트 사용 표, CSV 내려받기
- 학생 비밀 숫자 다시 정하기

## Claude·Codex 공동 작업
- 공통 규칙: [AGENTS.md](AGENTS.md)(Codex가 자동으로 읽음), [CLAUDE.md](CLAUDE.md)
- 계약 파일: `src/data/schema.ts`, `src/game/assets.ts`, `src/missions/core/types.ts`, `docs/asset-spec.md`
- Codex 작업은 [docs/tasks/](docs/tasks/README.md)의 지시서로 맡기고, 끝나면 Claude가 검토·테스트한 뒤 커밋해요.
