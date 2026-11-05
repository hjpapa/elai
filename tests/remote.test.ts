import { describe, expect, it, vi } from 'vitest';

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

describe('학급 서버 기록', () => {
  it('미션을 끝내면 진도 기록(elai_progress)을 바로 보내요', async () => {
    const state = new GameState(freshSave('별빛'));
    startRemoteSync(state, { studentId: 'stu-1', className: '테스트', nickname: '별빛', unlocked: [] });
    state.completeMission('ch0-m1', { success: true, stars: 3, attempts: 2, hints: 1 });
    await Promise.resolve();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ table: 'elai_progress', row: { student_id: 'stu-1', mission_id: 'ch0-m1', stars: 3, attempts: 2, hints_used: 1 } });
  });
});
