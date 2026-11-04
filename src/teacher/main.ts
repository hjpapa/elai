import '../ui/styles.css';
import './teacher.css';
import { allMissions } from '../data/chapters';
import { CHAPTERS } from '../data/chapters';
import { friendlyError, getSupabase } from '../services/supabase';
import { append, clear, h } from '../ui/dom';

interface ClassRow {
  id: string;
  name: string;
  code: string;
  unlocked_chapters: string[];
}

const root = document.getElementById('teacher')!;
const sb = getSupabase('teacher');
const wrap = h('div', { class: 't-wrap' });
root.append(wrap);

/** 표에 보여 줄 미션(지금 플레이할 수 있는 것) */
const MISSIONS = allMissions().filter((e) => e.mission.data !== undefined);

function head(email?: string): HTMLElement {
  return h(
    'div',
    { class: 't-head' },
    h('h1', {}, '엘라이 섬 · 선생님'),
    email ? h('span', { class: 'muted' }, email) : null,
    email ? h('button', { class: 'btn small', onclick: async () => (await sb!.auth.signOut(), void render()) }, '로그아웃') : null,
  );
}

async function render(): Promise<void> {
  clear(wrap);
  if (!sb) {
    wrap.append(head(), h('div', { class: 't-card' }, h('h2', {}, '학급 저장이 설정되지 않았어요'), h('p', {}, 'VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해 주세요. README를 참고하세요.')));
    return;
  }
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user || user.is_anonymous) return renderLogin();
  wrap.append(head(user.email));
  await renderClasses();
}

function renderLogin(): void {
  const email = h('input', { type: 'email', placeholder: '이메일', autocomplete: 'email' }) as HTMLInputElement;
  const pw = h('input', { type: 'password', placeholder: '비밀번호(6자 이상)', autocomplete: 'current-password' }) as HTMLInputElement;
  const msg = h('div', { class: 't-msg' });
  const act = async (kind: 'in' | 'up') => {
    msg.textContent = '';
    const { error, data } =
      kind === 'in'
        ? await sb!.auth.signInWithPassword({ email: email.value, password: pw.value })
        : await sb!.auth.signUp({ email: email.value, password: pw.value, options: { emailRedirectTo: `${location.origin}/teacher.html` } });
    if (error) return void (msg.textContent = friendlyError(error));
    if (kind === 'up' && !data.session) {
      msg.className = 't-msg t-ok';
      msg.textContent = '가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.';
      return;
    }
    void render();
  };
  wrap.append(
    head(),
    h(
      'div',
      { class: 't-card' },
      h('h2', {}, '선생님 로그인'),
      h('div', { class: 'row' }, email, pw),
      h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn primary', onclick: () => void act('in') }, '로그인'), h('button', { class: 'btn', onclick: () => void act('up') }, '처음이면 가입하기')),
      msg,
    ),
  );
}

async function renderClasses(): Promise<void> {
  const { data, error } = await sb!.from('elai_classes').select('id,name,code,unlocked_chapters').order('created_at');
  const card = h('div', { class: 't-card' }, h('h2', {}, '내 학급'));
  if (error) return void wrap.append(h('div', { class: 't-card' }, h('p', { class: 't-msg' }, friendlyError(error))));
  const grid = h('div', { class: 't-grid' });
  for (const c of (data ?? []) as ClassRow[]) {
    grid.append(h('button', { class: 't-class', onclick: () => void renderClass(c) }, h('b', {}, c.name), `학급 코드 ${c.code}`));
  }
  const name = h('input', { placeholder: '새 학급 이름(예: 5학년 2반)', maxlength: 40 }) as HTMLInputElement;
  const msg = h('div', { class: 't-msg' });
  const create = async () => {
    if (!name.value.trim()) return;
    const { error: e } = await sb!.rpc('elai_create_class', { p_name: name.value.trim() });
    if (e) return void (msg.textContent = friendlyError(e));
    void render();
  };
  append(card, [
    (data ?? []).length ? grid : h('p', { class: 'muted' }, '아직 학급이 없어요. 아래에서 만들어 보세요.'),
    h('div', { class: 'row', style: 'margin-top:12px' }, name, h('button', { class: 'btn primary', onclick: () => void create() }, '학급 만들기')),
    msg,
  ]);
  wrap.append(card);
}

async function renderClass(c: ClassRow): Promise<void> {
  clear(wrap);
  const { data: s } = await sb!.auth.getSession();
  wrap.append(head(s.session?.user.email));
  const back = h('button', { class: 'btn small', onclick: () => void render() }, '← 학급 목록');
  const { data: studs } = await sb!.from('elai_students').select('id,nickname').eq('class_id', c.id).order('nickname');
  const students = (studs ?? []) as { id: string; nickname: string }[];
  const ids = students.map((x) => x.id);
  const [{ data: prog }, { data: saves }] = ids.length
    ? await Promise.all([
        sb!.from('elai_progress').select('student_id,mission_id,stars,attempts,hints_used,completed_at').in('student_id', ids),
        sb!.from('elai_saves').select('student_id,updated_at,level:data->level').in('student_id', ids),
      ])
    : [{ data: [] }, { data: [] }];
  const progress = new Map<string, { stars: number; attempts: number; hints_used: number; completed_at: string | null }>();
  for (const p of (prog ?? []) as { student_id: string; mission_id: string; stars: number; attempts: number; hints_used: number; completed_at: string | null }[]) {
    progress.set(`${p.student_id}/${p.mission_id}`, p);
  }
  const saveOf = new Map(((saves ?? []) as { student_id: string; updated_at: string; level: number }[]).map((x) => [x.student_id, x]));

  // 학생 입장 안내 + 장 열기
  const unlocked = new Set(c.unlocked_chapters);
  const chapterBoxes = CHAPTERS.filter((ch) => ch.index >= 2).map((ch) => {
    const box = h('input', { type: 'checkbox', checked: unlocked.has(ch.id) }) as HTMLInputElement;
    box.addEventListener('change', async () => {
      if (box.checked) unlocked.add(ch.id);
      else unlocked.delete(ch.id);
      await sb!.from('elai_classes').update({ unlocked_chapters: [...unlocked] }).eq('id', c.id);
    });
    return h('label', { class: 'chip' }, box, ` ${ch.index}장 ${ch.title}${ch.status === 'planned' ? '(준비 중)' : ''}`);
  });
  wrap.append(
    h(
      'div',
      { class: 't-card' },
      h('div', { class: 'row' }, back, h('h2', { style: 'margin:0;flex:1' }, c.name), h('button', { class: 'btn small', onclick: () => window.print() }, '입장 안내 인쇄')),
      h('p', {}, '학생 입장 코드'),
      h('div', { class: 't-code' }, c.code),
      h('p', { class: 'muted' }, `학생은 ${location.origin} 에서 "학급으로 시작"을 누르고 코드·별명·비밀 숫자 4자리를 써요.`),
      h('p', { style: 'margin-top:12px' }, '장 미리 열기(0·1장과 7장 체험은 늘 열려 있어요)'),
      h('div', { class: 'row' }, ...chapterBoxes),
    ),
    h('div', { class: 't-print' }, h('h1', {}, `${c.name} · 엘라이 섬`), h('p', {}, location.origin), h('div', { class: 't-code' }, c.code), h('p', {}, '"학급으로 시작" → 코드, 별명, 비밀 숫자 4자리')),
  );

  // 진도 표(과정 기록: 별, 시도, 힌트)
  const thead = h('thead', {}, h('tr', {}, h('th', {}, '별명'), h('th', {}, 'Lv'), h('th', {}, '별'), ...MISSIONS.map((m) => h('th', { title: m.part.title }, m.mission.title)), h('th', {}, '')));
  const tbody = h('tbody');
  const csv: string[][] = [['별명', 'Lv', '별 합계', ...MISSIONS.map((m) => m.mission.id)]];
  for (const st of students) {
    let total = 0;
    const cells = MISSIONS.map((m) => {
      const p = progress.get(`${st.id}/${m.mission.id}`);
      if (!p) return h('td', {}, '·');
      total += p.stars;
      const stars = '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars);
      return h(
        'td',
        { title: `시도 ${p.attempts}번 · 힌트 ${p.hints_used}번` },
        p.completed_at ? h('span', { class: 'stars' }, stars) : h('span', { class: 'trying' }, '도전 중'),
        h('small', {}, `시도 ${p.attempts}·힌트 ${p.hints_used}`),
      );
    });
    const sv = saveOf.get(st.id);
    const reset = h('button', {
      class: 'btn small',
      onclick: async () => {
        const pin = prompt(`${st.nickname}의 새 비밀 숫자 4자리`);
        if (!pin) return;
        const { error } = await sb!.rpc('elai_reset_pin', { p_student: st.id, p_pin: pin });
        alert(error ? friendlyError(error) : '비밀 숫자를 바꿨어요.');
      },
    }, '비밀 숫자');
    tbody.append(h('tr', {}, h('td', {}, st.nickname), h('td', {}, String(sv?.level ?? 1)), h('td', {}, String(total)), ...cells, h('td', {}, reset)));
    csv.push([st.nickname, String(sv?.level ?? 1), String(total), ...MISSIONS.map((m) => String(progress.get(`${st.id}/${m.mission.id}`)?.stars ?? ''))]);
  }
  const download = h('button', {
    class: 'btn small',
    onclick: () => {
      const text = '﻿' + csv.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: `${c.name}-진도.csv` });
      a.click();
    },
  }, 'CSV 내려받기');
  wrap.append(
    h(
      'div',
      { class: 't-card' },
      h('div', { class: 'row' }, h('h2', { style: 'margin:0;flex:1' }, `학생 ${students.length}명`), h('button', { class: 'btn small', onclick: () => void renderClass(c) }, '새로고침'), download),
      students.length ? h('div', { class: 't-table-wrap', style: 'margin-top:10px' }, h('table', { class: 't-table' }, thead, tbody)) : h('p', { class: 'muted' }, '아직 들어온 학생이 없어요.'),
      h('p', { class: 't-legend' }, '★ 별점(가장 좋은 기록) · 시도 = 실행·제출 횟수 · 힌트 = 힌트를 본 횟수. 결과보다 시도와 힌트의 변화를 보면 과정을 알 수 있어요.'),
    ),
  );
}

void render();
