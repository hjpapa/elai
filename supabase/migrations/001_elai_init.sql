-- 엘라이 섬(ELAI): 학급·학생·진도·저장
-- tcontext 프로젝트를 다른 앱과 함께 써요. 그래서 모든 객체 이름에 elai_ 접두사를 붙이고,
-- 기존 테이블·함수는 건드리지 않아요(만들기만 하고 지우지 않아요).
--
-- 학생: 익명 로그인(이메일 없음) + 학급 코드 + 별명 + 비밀 숫자 4자리
--       (기기를 바꿔도 이어하기 위해. 비밀 숫자는 bcrypt로 암호화해 저장해요)
-- 교사: 이메일 로그인. 자기 학급의 학생 진도만 볼 수 있어요.

-- 다른 앱도 쓰는 확장은 만들거나 옮기지 않고, 준비되어 있는지만 확인해요.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_extension e
    join pg_catalog.pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pgcrypto' and n.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must already be installed in extensions';
  end if;
end;
$$;

-- ── 테이블 ───────────────────────────────────────────────
create table if not exists public.elai_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  unlocked_chapters text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.elai_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.elai_classes (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 10),
  pin_hash text not null,
  -- 지금 이 학생으로 들어와 있는 익명 사용자(기기)
  auth_uid uuid references auth.users (id) on delete set null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, nickname)
);
create index if not exists elai_students_auth_uid_idx on public.elai_students (auth_uid);

create table if not exists public.elai_progress (
  student_id uuid not null references public.elai_students (id) on delete cascade,
  mission_id text not null check (char_length(mission_id) between 1 and 40),
  stars smallint not null default 0 check (stars between 0 and 3),
  attempts int not null default 0 check (attempts >= 0),
  hints_used int not null default 0 check (hints_used >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, mission_id)
);

create table if not exists public.elai_saves (
  student_id uuid primary key references public.elai_students (id) on delete cascade,
  data jsonb not null,
  version int not null default 1,
  updated_at timestamptz not null default now(),
  constraint elai_saves_size check (pg_column_size(data) < 200000)
);

-- ── 도우미 함수 ──────────────────────────────────────────
-- 이메일로 로그인한 사용자(익명이 아닌 사용자)인지
create or replace function public.elai_is_teacher()
returns boolean
language sql
stable
set search_path = ''
as $$
  select auth.uid() is not null
     and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

-- 지금 기기에 연결된 학생 id
create or replace function public.elai_my_student_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id from public.elai_students s where s.auth_uid = auth.uid() limit 1;
$$;

-- 이 학생이 내(교사) 학급 학생인지
create or replace function public.elai_teaches(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.elai_students s
    join public.elai_classes c on c.id = s.class_id
    where s.id = p_student and c.teacher_id = auth.uid()
  );
$$;

-- ── 행 단위 보안(RLS) ────────────────────────────────────
alter table public.elai_classes enable row level security;
alter table public.elai_students enable row level security;
alter table public.elai_progress enable row level security;
alter table public.elai_saves enable row level security;

-- 학급: 교사는 자기 학급을 보고 고치고 지워요. 학생은 자기 학급을 볼 수만 있어요.
drop policy if exists elai_classes_teacher_all on public.elai_classes;
create policy elai_classes_teacher_all on public.elai_classes
  for all to authenticated
  using (teacher_id = auth.uid() and public.elai_is_teacher())
  with check (teacher_id = auth.uid() and public.elai_is_teacher());

drop policy if exists elai_classes_student_read on public.elai_classes;
create policy elai_classes_student_read on public.elai_classes
  for select to authenticated
  using (exists (select 1 from public.elai_students s where s.class_id = elai_classes.id and s.id = public.elai_my_student_id()));

-- 학생: 자기 행, 교사는 자기 학급 학생(추가·이어하기는 elai_join_class 함수로만)
drop policy if exists elai_students_read on public.elai_students;
create policy elai_students_read on public.elai_students
  for select to authenticated
  using (auth_uid = auth.uid() or public.elai_teaches(id));

drop policy if exists elai_students_teacher_delete on public.elai_students;
create policy elai_students_teacher_delete on public.elai_students
  for delete to authenticated
  using (public.elai_teaches(id));

-- 진도: 학생은 자기 것만 쓰고, 교사는 자기 학급 학생 것을 읽어요.
drop policy if exists elai_progress_student_rw on public.elai_progress;
create policy elai_progress_student_rw on public.elai_progress
  for all to authenticated
  using (student_id = public.elai_my_student_id())
  with check (student_id = public.elai_my_student_id());

drop policy if exists elai_progress_teacher_read on public.elai_progress;
create policy elai_progress_teacher_read on public.elai_progress
  for select to authenticated
  using (public.elai_teaches(student_id));

-- 저장: 학생은 자기 것만, 교사는 자기 학급 학생 것을 읽어요(레벨 표시용).
drop policy if exists elai_saves_student_rw on public.elai_saves;
create policy elai_saves_student_rw on public.elai_saves
  for all to authenticated
  using (student_id = public.elai_my_student_id())
  with check (student_id = public.elai_my_student_id());

drop policy if exists elai_saves_teacher_read on public.elai_saves;
create policy elai_saves_teacher_read on public.elai_saves
  for select to authenticated
  using (public.elai_teaches(student_id));

-- 권한: 로그인하지 않은 사용자(anon)는 아무것도 못 해요.
-- 학생 표는 비밀 숫자 해시 같은 열을 아무도 직접 읽지 못하게 열 단위로 열어 줘요.
revoke all on public.elai_classes, public.elai_students, public.elai_progress, public.elai_saves from anon;
revoke all on public.elai_students from authenticated;
grant select (id, class_id, nickname, created_at) on public.elai_students to authenticated;
grant delete on public.elai_students to authenticated;
grant select, insert, update, delete on public.elai_classes to authenticated;
grant select, insert, update on public.elai_progress to authenticated;
grant select, insert, update on public.elai_saves to authenticated;

-- ── 함수(RPC) ────────────────────────────────────────────
-- 교사: 학급 만들기(헷갈리는 글자 0·O·1·I를 뺀 6자리 코드)
create or replace function public.elai_create_class(p_name text)
returns public.elai_classes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_row public.elai_classes;
  v_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if not public.elai_is_teacher() then
    raise exception 'teacher_only' using errcode = '42501';
  end if;
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.elai_classes where code = v_code);
  end loop;
  insert into public.elai_classes (teacher_id, name, code)
  values (auth.uid(), btrim(p_name), v_code)
  returning * into v_row;
  return v_row;
end;
$$;

-- 학생: 학급 입장(처음이면 학생을 만들고, 이미 있으면 비밀 숫자를 확인해 이 기기와 연결해요)
create or replace function public.elai_join_class(p_code text, p_nickname text, p_pin text)
returns table (student_id uuid, class_name text, unlocked_chapters text[], is_new boolean, error_code text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_class public.elai_classes;
  v_student public.elai_students;
  v_nick text := btrim(p_nickname);
begin
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'bad_pin';
  end if;
  if v_nick is null or char_length(v_nick) not between 1 and 10 then
    raise exception 'bad_nickname';
  end if;
  select * into v_class from public.elai_classes c where c.code = upper(btrim(p_code));
  if not found then
    raise exception 'no_class';
  end if;

  -- 같은 학생으로 동시에 시도해도 실패 횟수를 차례대로 확인하고 바꿔요.
  select * into v_student from public.elai_students s where s.class_id = v_class.id and s.nickname = v_nick for update;
  if not found then
    update public.elai_students set auth_uid = null where auth_uid = auth.uid();
    insert into public.elai_students (class_id, nickname, pin_hash, auth_uid)
    values (v_class.id, v_nick, extensions.crypt(p_pin, extensions.gen_salt('bf')), auth.uid())
    returning * into v_student;
    return query select v_student.id, v_class.name, v_class.unlocked_chapters, true, null::text;
    return;
  end if;

  if v_student.locked_until is not null and v_student.locked_until > now() then
    return query select null::uuid, null::text, null::text[], false, 'locked'::text;
    return;
  end if;
  if extensions.crypt(p_pin, v_student.pin_hash) is distinct from v_student.pin_hash then
    update public.elai_students
      set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
          locked_until = case when failed_attempts + 1 >= 5 then now() + interval '10 minutes' else locked_until end
      where id = v_student.id
      returning * into v_student;
    -- 예외를 일으키면 실패 횟수도 취소되므로 오류 코드를 돌려줘요.
    return query select null::uuid, null::text, null::text[], false,
      case when v_student.locked_until > now() then 'locked'::text else 'wrong_pin'::text end;
    return;
  end if;

  update public.elai_students set auth_uid = null where auth_uid = auth.uid() and id <> v_student.id;
  update public.elai_students
    set auth_uid = auth.uid(), failed_attempts = 0, locked_until = null
    where id = v_student.id;
  return query select v_student.id, v_class.name, v_class.unlocked_chapters, false, null::text;
end;
$$;

-- 교사: 학생 비밀 숫자 다시 정하기
create or replace function public.elai_reset_pin(p_student uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.elai_teaches(p_student) then
    raise exception 'not_your_student' using errcode = '42501';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'bad_pin';
  end if;
  update public.elai_students
    set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')), failed_attempts = 0, locked_until = null
    where id = p_student;
end;
$$;

revoke all on function public.elai_create_class(text) from public, anon;
revoke all on function public.elai_join_class(text, text, text) from public, anon;
revoke all on function public.elai_reset_pin(uuid, text) from public, anon;
revoke all on function public.elai_my_student_id() from public, anon;
revoke all on function public.elai_teaches(uuid) from public, anon;
grant execute on function public.elai_create_class(text) to authenticated;
grant execute on function public.elai_join_class(text, text, text) to authenticated;
grant execute on function public.elai_reset_pin(uuid, text) to authenticated;
grant execute on function public.elai_my_student_id() to authenticated;
grant execute on function public.elai_teaches(uuid) to authenticated;
grant execute on function public.elai_is_teacher() to authenticated;
