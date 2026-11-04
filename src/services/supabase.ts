import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Supabase 설정이 있는지(없으면 이 기기에만 저장하는 체험 모드) */
export const supabaseConfigured = Boolean(url && key);

const clients = new Map<string, SupabaseClient>();

/**
 * 학생(게임)과 교사 페이지는 로그인 저장소를 따로 써요.
 * 같은 브라우저에서 교사가 게임을 열어도 교사 로그인이 익명 로그인으로 바뀌지 않게요.
 */
export function getSupabase(role: 'student' | 'teacher'): SupabaseClient | null {
  if (!url || !key) return null;
  let c = clients.get(role);
  if (!c) {
    c = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: `elai-${role}-auth` } });
    clients.set(role, c);
  }
  return c;
}

/** 서버 오류를 학생·교사가 읽을 수 있는 말로 */
export function friendlyError(e: unknown): string {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  if (msg.includes('no_class')) return '학급 코드를 찾을 수 없어요. 코드를 다시 확인해 주세요.';
  if (msg.includes('wrong_pin')) return '비밀 숫자가 맞지 않아요.';
  if (msg.includes('locked')) return '여러 번 틀려서 10분 동안 잠겼어요. 선생님께 말씀드려요.';
  if (msg.includes('bad_pin')) return '비밀 숫자는 숫자 4개예요.';
  if (msg.includes('bad_nickname')) return '별명은 1~10글자로 써 주세요.';
  if (msg.toLowerCase().includes('anonymous')) return '학급 입장이 아직 준비되지 않았어요.\n(선생님: Supabase에서 익명 로그인을 켜 주세요)';
  if (msg.includes('teacher_only') || msg.includes('42501')) return '선생님 계정으로만 할 수 있어요.';
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않아요.';
  if (msg.includes('Email not confirmed')) return '메일함에서 가입 확인 메일을 먼저 눌러 주세요.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return '인터넷 연결을 확인해 주세요.';
  return `문제가 생겼어요: ${msg}`;
}
