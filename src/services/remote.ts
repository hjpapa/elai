import type { MissionRecord, SaveData } from '../data/schema';
import type { GameState } from '../game/rpg/state';
import { getSupabase } from './supabase';

/** 이 기기에 연결된 학급 학생 정보 */
export interface ClassLink {
  studentId: string;
  className: string;
  nickname: string;
  unlocked: string[];
}

const LINK_KEY = 'elai-class-link';

export function loadLink(): ClassLink | null {
  try {
    const raw = localStorage.getItem(LINK_KEY);
    return raw ? (JSON.parse(raw) as ClassLink) : null;
  } catch {
    return null;
  }
}

function saveLink(link: ClassLink | null): void {
  try {
    if (link) localStorage.setItem(LINK_KEY, JSON.stringify(link));
    else localStorage.removeItem(LINK_KEY);
  } catch {
    // 저장 공간이 막힌 환경
  }
}

export function forgetLink(): void {
  saveLink(null);
}

/** 학급 입장: 익명 로그인(필요하면) → 학급 코드·별명·비밀 숫자 확인 */
export async function joinClass(code: string, nickname: string, pin: string): Promise<ClassLink> {
  const sb = getSupabase('student');
  if (!sb) throw new Error('학급 저장이 설정되지 않았어요.');
  const { data: s } = await sb.auth.getSession();
  if (!s.session) {
    const { error } = await sb.auth.signInAnonymously();
    if (error) throw error;
  }
  const { data, error } = await sb.rpc('elai_join_class', { p_code: code, p_nickname: nickname, p_pin: pin });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as {
    student_id: string | null;
    class_name: string | null;
    unlocked_chapters: string[] | null;
    error_code: string | null;
  } | undefined;
  if (row?.error_code) throw new Error(row.error_code);
  if (!row?.student_id || !row.class_name) throw new Error('no_class');
  const link: ClassLink = { studentId: row.student_id, className: row.class_name, nickname: nickname.trim(), unlocked: row.unlocked_chapters ?? [] };
  saveLink(link);
  return link;
}

/**
 * 선생님이 연 장을 서버에서 다시 받아 연결 정보에 넣어요(수업 중에 선생님이 장을 열 수 있어요).
 * 받지 못하면 저장해 둔 값을 그대로 써요. 바뀌었으면 true.
 */
export async function refreshUnlocked(link: ClassLink): Promise<boolean> {
  const sb = getSupabase('student');
  if (!sb) return false;
  const { data: me, error } = await sb.from('elai_students').select('class_id').eq('id', link.studentId).maybeSingle();
  if (error || !me) return false;
  const { data, error: e2 } = await sb.from('elai_classes').select('unlocked_chapters').eq('id', (me as { class_id: string }).class_id).maybeSingle();
  if (e2 || !data) return false;
  const next = [...((data as { unlocked_chapters: string[] | null }).unlocked_chapters ?? [])].sort();
  const before = [...(link.unlocked ?? [])].sort();
  if (next.join() === before.join()) return false;
  link.unlocked = next;
  saveLink(link);
  return true;
}

/** 저장된 연결이 아직 이 기기 로그인과 맞는지 확인(다른 기기에서 같은 학생으로 들어가면 끊겨요) */
export async function checkLink(link: ClassLink): Promise<boolean> {
  const sb = getSupabase('student');
  if (!sb) return false;
  const { data: s } = await sb.auth.getSession();
  if (!s.session) return false;
  const { data, error } = await sb.from('elai_students').select('id').eq('id', link.studentId).maybeSingle();
  return !error && !!data;
}

export async function fetchRemoteSave(studentId: string): Promise<SaveData | null> {
  const sb = getSupabase('student');
  if (!sb) return null;
  const { data, error } = await sb.from('elai_saves').select('data').eq('student_id', studentId).maybeSingle();
  if (error || !data) return null;
  const save = data.data as SaveData;
  return save?.version === 1 ? save : null;
}

/** 학급 서버와 맞추기: 저장은 최대 10초에 한 번, 미션 기록은 바로 올려요. */
export function startRemoteSync(state: GameState, link: ClassLink): (data: SaveData) => Promise<void> {
  const sb = getSupabase('student');
  let last = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  const push = async (data: SaveData) => {
    if (!sb) return;
    last = Date.now();
    await sb.from('elai_saves').upsert({ student_id: link.studentId, data, version: 1, updated_at: new Date().toISOString() });
  };
  state.on((e) => {
    if (e.type !== 'mission' || !sb) return;
    const rec: MissionRecord = e.record;
    // Supabase 질의는 await(then)할 때 보내져요. void만 붙이면 보내지지 않아요.
    const send = async () => {
      await sb.from('elai_progress').upsert({
        student_id: link.studentId,
        mission_id: e.id,
        stars: rec.stars,
        attempts: rec.attempts,
        hints_used: rec.hints,
        completed_at: rec.done ? (rec.at ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      });
    };
    void send().catch(() => undefined);
  });
  return (data) => {
    const wait = Math.max(0, 10_000 - (Date.now() - last));
    if (pending) clearTimeout(pending);
    if (wait === 0 || document.visibilityState === 'hidden') return push(data);
    return new Promise<void>((resolve) => {
      pending = setTimeout(() => {
        pending = null;
        void push(data).finally(resolve);
      }, wait);
    });
  };
}
