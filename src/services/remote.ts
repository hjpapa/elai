import { getMission } from '../data/chapters';
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

/** 서버 진도 표(elai_progress) 한 줄 */
interface ProgressRow {
  student_id: string;
  mission_id: string;
  stars: number;
  attempts: number;
  hints_used: number;
  completed_at: string | null;
  updated_at: string;
}

/** 0 이상의 정수로(저장 데이터가 이상해도 서버 제약을 넘지 않게) */
const whole = (n: unknown, max = Number.MAX_SAFE_INTEGER): number => Math.max(0, Math.min(max, Math.round(Number(n)) || 0));

function progressRow(studentId: string, missionId: string, rec: MissionRecord, now: string): ProgressRow {
  return {
    student_id: studentId,
    mission_id: missionId,
    stars: whole(rec.stars, 3),
    attempts: whole(rec.attempts),
    hints_used: whole(rec.hints),
    completed_at: rec.done ? (rec.at ?? now) : null,
    updated_at: now,
  };
}

/**
 * 저장(missions)에는 있는데 서버 진도에 없거나 서버보다 앞선 기록을 한 번에 올려요.
 * 예전에 보내지 못한 기록(진도 전송 버그, 끊긴 인터넷)을 채워서 선생님 진도표가 맞게 보여요.
 * 서버 진도를 먼저 읽고, 서버 쪽이 앞선 값(별·시도·힌트·완료)은 낮추지 않아요
 * (다른 기기의 더 오래된 저장으로 시작해도 진도표가 뒤로 가지 않게). 올린 줄 수를 돌려줘요.
 * 지금 게임에 없는 미션 id가 섞이면 한꺼번에 실패하니 빼고 보내요.
 */
export async function backfillProgress(state: GameState, link: ClassLink): Promise<number> {
  const sb = getSupabase('student');
  if (!sb || !Object.keys(state.data.missions).some((id) => getMission(id))) return 0;
  const { data, error } = await sb.from('elai_progress').select('mission_id,stars,attempts,hints_used,completed_at').eq('student_id', link.studentId);
  if (error) return 0;
  type ServerRow = Pick<ProgressRow, 'mission_id' | 'stars' | 'attempts' | 'hints_used' | 'completed_at'>;
  const server = new Map(((data ?? []) as ServerRow[]).map((r) => [r.mission_id, r]));
  const now = new Date().toISOString();
  const rows: ProgressRow[] = [];
  // 서버 진도를 받은 뒤의 상태로 만들어요(그사이 끝낸 미션도 들어가요).
  for (const [id, rec] of Object.entries(state.data.missions)) {
    if (!getMission(id)) continue;
    const mine = progressRow(link.studentId, id, rec, now);
    const s = server.get(id);
    if (!s) {
      rows.push(mine);
      continue;
    }
    const merged: ProgressRow = {
      ...mine,
      stars: Math.max(mine.stars, s.stars),
      attempts: Math.max(mine.attempts, s.attempts),
      hints_used: Math.max(mine.hints_used, s.hints_used),
      completed_at: s.completed_at ?? mine.completed_at,
    };
    const ahead = merged.stars !== s.stars || merged.attempts !== s.attempts || merged.hints_used !== s.hints_used || merged.completed_at !== s.completed_at;
    if (ahead) rows.push(merged);
  }
  if (!rows.length) return 0;
  const { error: e2 } = await sb.from('elai_progress').upsert(rows);
  return e2 ? 0 : rows.length;
}

/**
 * 학급 서버와 맞추기: 저장은 최대 10초에 한 번, 미션 기록은 바로 올려요.
 * 시작할 때는 이 기기 저장의 미션 기록 중 서버에 없거나 서버보다 앞선 것을 채워요(backfillProgress).
 */
export function startRemoteSync(state: GameState, link: ClassLink): (data: SaveData) => Promise<void> {
  const sb = getSupabase('student');
  let last = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  const push = async (data: SaveData) => {
    if (!sb) return;
    last = Date.now();
    await sb.from('elai_saves').upsert({ student_id: link.studentId, data, version: 1, updated_at: new Date().toISOString() });
  };
  // Supabase 질의는 await(then)할 때 보내져요. void만 붙이면 보내지지 않아요.
  const sendProgress = async (row: ProgressRow) => {
    if (!sb) return;
    await sb.from('elai_progress').upsert(row);
  };
  state.on((e) => {
    if (e.type !== 'mission' || !sb) return;
    void sendProgress(progressRow(link.studentId, e.id, e.record, new Date().toISOString())).catch(() => undefined);
  });
  void backfillProgress(state, link).catch(() => 0);
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
