import { beforeEach, describe, expect, it, vi } from 'vitest';

/** 질의가 실제로 보내졌는지(await/then 됐는지) 기록하는 가짜 Supabase */
const sent: { table: string; row: unknown }[] = [];
const fakeClient = {
  from: (table: string) => ({
    upsert: (row: unknown) => ({
      // Supabase 질의처럼 then을 부를 때만 보내요.
      then: (ok?: (v: { error: null }) => unknown, fail?: (e: unknown) => unknown) => {
        sent.push({ table, row });
        return Promise.resolve({ error: null }).then(ok, fail);
      },
    }),
  }),
};
vi.mock('../src/services/supabase', () => ({ getSupabase: () => fakeClient, supabaseConfigured: true }));

const { startRemoteSync } = await import('../src/services/remote');
const { GameState, freshSave } = await import('../src/game/rpg/state');

const link = { studentId: 'stu-1', className: '테스트', nickname: '별빛', unlocked: [] };
/** 보낸 질의가 모두 처리되도록 기다려요 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

type Row = { student_id: string; mission_id: string; stars: number; attempts: number; hints_used: number; completed_at: string | null };

describe('학급 서버 기록', () => {
  beforeEach(() => {
    sent.length = 0;
  });

  it('미션을 끝내면 진도 기록(elai_progress)을 바로 보내요', async () => {
    const state = new GameState(freshSave('별빛'));
    startRemoteSync(state, link);
    state.completeMission('ch0-m1', { success: true, stars: 3, attempts: 2, hints: 1 });
    await Promise.resolve();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ table: 'elai_progress', row: { student_id: 'stu-1', mission_id: 'ch0-m1', stars: 3, attempts: 2, hints_used: 1 } });
  });

  it('시작할 때 이 기기 저장의 미션 기록을 한 번에 올려요(보내지 못한 예전 기록 채우기)', async () => {
    const state = new GameState(freshSave('별빛'));
    state.completeMission('ch0-m1', { success: true, stars: 3, attempts: 2, hints: 1 });
    state.completeMission('ch0-m2', { success: false, stars: 0, attempts: 1, hints: 0 });
    // 지금 게임에 없는 미션 기록이 섞이면 한꺼번에 실패하니 빼요.
    state.data.missions['old-mission'] = { stars: 2, attempts: 1, hints: 0, done: true };
    startRemoteSync(state, link);
    await flush();
    expect(sent).toHaveLength(1);
    expect(sent[0]?.table).toBe('elai_progress');
    const rows = sent[0]?.row as Row[];
    expect(rows.map((r) => r.mission_id).sort()).toEqual(['ch0-m1', 'ch0-m2']);
    const done = rows.find((r) => r.mission_id === 'ch0-m1');
    expect(done).toMatchObject({ student_id: 'stu-1', stars: 3, attempts: 2, hints_used: 1 });
    expect(done?.completed_at).toBe(state.data.missions['ch0-m1']?.at);
    expect(rows.find((r) => r.mission_id === 'ch0-m2')).toMatchObject({ stars: 0, attempts: 1, completed_at: null });
  });

  it('기록이 없으면 시작할 때 아무것도 보내지 않아요', async () => {
    startRemoteSync(new GameState(freshSave('별빛')), link);
    await flush();
    expect(sent).toHaveLength(0);
  });
});
