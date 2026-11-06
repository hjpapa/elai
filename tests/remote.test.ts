import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MissionRecord } from '../src/data/schema';

type Then = (ok?: (v: unknown) => unknown, fail?: (e: unknown) => unknown) => Promise<unknown>;

/** 질의가 실제로 보내졌는지(await/then 됐는지) 기록하는 가짜 Supabase */
const sent: { table: string; row: unknown }[] = [];
let serverRows: { mission_id: string; stars: number; attempts: number; hints_used: number; completed_at: string | null }[] = [];
let selectError: { message: string } | null = null;
const thenable = (run: () => unknown): { then: Then } => ({ then: (ok, fail) => Promise.resolve().then(run).then(ok, fail) });
const fakeClient = {
  from: (table: string) => ({
    // Supabase 질의처럼 then을 부를 때만 보내요.
    upsert: (row: unknown) => thenable(() => (sent.push({ table, row }), { error: null })),
    select: () => ({ eq: () => thenable(() => ({ data: selectError ? null : serverRows, error: selectError })) }),
  }),
};
vi.mock('../src/services/supabase', () => ({ getSupabase: () => fakeClient, supabaseConfigured: true }));

const { backfillProgress, startRemoteSync } = await import('../src/services/remote');
const { GameState, freshSave } = await import('../src/game/rpg/state');

const link = { studentId: 'stu-1', className: '테스트', nickname: '별빛', unlocked: [] };
type Row = { student_id: string; mission_id: string; stars: number; attempts: number; hints_used: number; completed_at: string | null };
const rec = (r: Partial<MissionRecord>): MissionRecord => ({ stars: 0, attempts: 1, hints: 0, done: false, ...r });
const withMissions = (missions: Record<string, MissionRecord>) => {
  const save = freshSave('별빛');
  save.missions = missions;
  return new GameState(save);
};
/** 보낸 질의가 모두 처리되도록 기다려요 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  sent.length = 0;
  serverRows = [];
  selectError = null;
});

describe('학급 서버 기록', () => {
  it('미션을 끝내면 진도 기록(elai_progress)을 바로 보내요', async () => {
    const state = new GameState(freshSave('별빛'));
    startRemoteSync(state, link);
    state.completeMission('ch0-m1', { success: true, stars: 3, attempts: 2, hints: 1 });
    await flush();
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

  it('서버에 이미 같은 기록이 있으면 그 줄은 다시 보내지 않아요', async () => {
    const at = '2026-11-01T01:02:03.000Z';
    const state = withMissions({
      'ch0-m1': rec({ stars: 3, attempts: 2, done: true, at }),
      'ch0-m2': rec({ stars: 2, attempts: 1, hints: 1, done: true, at }),
      'ch3-p2-m1': rec({ attempts: 2 }),
    });
    // 서버의 시각 표기가 달라도(PostgREST는 +00:00) 서버 값을 그대로 쓰니 다시 보내지 않아요.
    serverRows = [{ mission_id: 'ch0-m1', stars: 3, attempts: 2, hints_used: 0, completed_at: '2026-11-01T01:02:03+00:00' }];
    startRemoteSync(state, link);
    await flush();
    expect(sent).toHaveLength(1);
    const rows = sent[0].row as Row[];
    expect(rows.map((r) => r.mission_id)).toEqual(['ch0-m2', 'ch3-p2-m1']);
    expect(rows[0]).toMatchObject({ student_id: 'stu-1', stars: 2, hints_used: 1, completed_at: at });
    expect(rows[1]).toMatchObject({ stars: 0, attempts: 2, completed_at: null });
  });

  it('서버가 앞선 값은 낮추지 않고(다른 기기의 오래된 저장), 저장이 앞선 값만 올려요', async () => {
    const at = '2026-11-02T00:00:00.000Z';
    const state = withMissions({ 'ch0-m1': rec({ stars: 2, attempts: 6, hints: 0, done: false }), 'ch0-m2': rec({ stars: 7, attempts: 1, done: true, at }) });
    serverRows = [
      { mission_id: 'ch0-m1', stars: 3, attempts: 5, hints_used: 2, completed_at: at },
      { mission_id: 'ch0-m2', stars: 3, attempts: 1, hints_used: 0, completed_at: at },
    ];
    expect(await backfillProgress(state, link)).toBe(1);
    expect(sent[0].row).toEqual([expect.objectContaining({ mission_id: 'ch0-m1', stars: 3, attempts: 6, hints_used: 2, completed_at: at })]);
  });

  it('기록이 없거나 서버 진도를 읽지 못하면 아무것도 보내지 않아요', async () => {
    startRemoteSync(new GameState(freshSave('별빛')), link);
    await flush();
    selectError = { message: 'Failed to fetch' };
    expect(await backfillProgress(withMissions({ 'ch0-m1': rec({ done: true, stars: 3 }) }), link)).toBe(0);
    expect(sent).toHaveLength(0);
  });
});
