import { describe, expect, it } from 'vitest';
import type { PromptData } from '../src/data/schema';
import { applyFollowUp, changedSlots, checkCause, checkCriteriaPick, criteriaResults, evaluatePrompt, goodChoice, problemSlots, promptProblems } from '../src/missions/prompt/evaluate';

const base: PromptData = {
  client: '1학년 동생', request: '양치를 왜 하는지 알려 줘요.\n쉬운 말로 세 가지만요.',
  fallback: { opening: '안내예요.', body: ['안녕하세요.'] },
  slots: [
    { id: 'role', label: '누구처럼', question: '누구처럼?', missing: '역할이 빠졌어요.', options: [
      { id: 'dentist', text: '치과 선생님처럼', quality: 'good', opening: '안녕! 알려 줄게.' },
      { id: 'teacher', text: '선생님처럼', quality: 'meh', opening: '알려 줄게요.', feedback: '어떤 선생님인지 말해요.' },
      { id: 'pirate', text: '해적처럼', quality: 'bad', opening: '크하하!', feedback: '말투가 맞지 않아요.' }] },
    { id: 'task', label: '무엇을', question: '무엇을?', missing: '할 일이 빠졌어요.', options: [
      { id: 'why', text: '까닭을 알려 줘', quality: 'good', body: ['이가 튼튼해요.', '냄새가 좋아요.', '잘 씹어요.'], hardBody: ['법랑질을 지켜요.', '치주 질환을 막아요.', '저작 기능을 지켜요.'] },
      { id: 'about', text: '양치 이야기를 해 줘', quality: 'meh', body: ['칫솔로 닦아요.', '하루에 여러 번 해요.', '칫솔을 바꿔요.'], feedback: '까닭을 물었어요.' },
      { id: 'story', text: '재미있는 이야기를 해 줘', quality: 'bad', body: ['옛날 옛적에…'], feedback: '의뢰와 달라요.' }] },
    { id: 'how', label: '어떻게', question: '누구에게?', missing: '읽는 사람이 빠졌어요.', options: [
      { id: 'easy', text: '1학년 말로 짧게', quality: 'good' },
      { id: 'short', text: '짧게', quality: 'meh', feedback: '누가 읽는지 말해요.' },
      { id: 'hard', text: '어려운 말로 길게', quality: 'bad', feedback: '너무 어려워요.' },
      { id: 'private', text: '이름과 주소를 넣어서', quality: 'bad', privacy: true, feedback: '개인정보는 넣지 않아요.' }] },
    { id: 'format', label: '어떤 모양으로', question: '어떤 모양?', missing: '모양이 빠졌어요.', options: [
      { id: 'list', text: '번호 붙여 세 줄로', quality: 'good', render: 'list' },
      { id: 'table', text: '표로', quality: 'meh', render: 'table', feedback: '줄이 더 쉬워요.' },
      { id: 'poem', text: '긴 시처럼', quality: 'bad', render: 'poem', feedback: '모양이 맞지 않아요.' }] },
  ],
};

const withCriteria: PromptData = { ...base, criteria: { cards: [
  { id: 'reason', text: '양치하는 까닭이 들어 있어요', wanted: true, check: { slot: 'task', options: ['why'] }, feedback: '의뢰는 양치하는 까닭이었어요.' },
  { id: 'plain', text: '1학년이 아는 쉬운 말이에요', wanted: true, check: { plain: true }, feedback: '1학년에게는 낱말이 어려워요.' },
  { id: 'three', text: '번호를 붙인 세 줄이에요', wanted: true, check: { slot: 'format', options: ['list'] }, feedback: '세 가지로 짧게 원했어요.' },
  { id: 'safe', text: '개인정보가 없어요', wanted: true, check: { safe: true }, feedback: '이름과 주소는 넣지 않아요.' },
  { id: 'long', text: '길게 쓸수록 좋아요', wanted: false, feedback: '의뢰는 짧게였어요.' },
  { id: 'fun', text: '재미있는 이야기가 들어 있어요', wanted: false, feedback: '이야기는 부탁하지 않았어요.' },
] } };

const best = { role: 'dentist', task: 'why', how: 'easy', format: 'list' };
const met = (choice: Record<string, string | undefined>) => Object.fromEntries(criteriaResults(withCriteria, choice).map(r => [r.id, r.met]));

describe('기준표: 좋은 답의 조건을 세우고 확인해요', () => {
  it('답이 실제로 어떻게 나왔는지로 조건을 판정해요', () => {
    expect(met(best)).toEqual({ reason: true, plain: true, three: true, safe: true });
    expect(met({ ...best, how: 'hard' })).toMatchObject({ plain: false, reason: true });
    expect(met({ ...best, how: undefined })).toMatchObject({ plain: false });
    // 할 일이 맞지 않으면 본문은 쉬운 글이지만 까닭은 빠져요.
    expect(met({ ...best, task: 'about', how: 'hard' })).toMatchObject({ plain: true, reason: false });
    expect(met({ ...best, format: 'table' })).toMatchObject({ three: false });
    expect(met({ ...best, how: 'private' })).toMatchObject({ safe: false });
    expect(evaluatePrompt(base, { ...best, how: 'hard' }).hard).toBe(true);
    expect(evaluatePrompt(base, best).hard).toBe(false);
    expect(criteriaResults(base, best)).toEqual([]);
  });
  it('의뢰문의 조건을 모두, 그리고 그것만 골라야 해요', () => {
    expect(checkCriteriaPick(withCriteria, ['reason', 'plain', 'three', 'safe']).ok).toBe(true);
    expect(checkCriteriaPick(withCriteria, ['reason', 'plain', 'three', 'safe', 'long'])).toMatchObject({ ok: false, wrong: ['long'] });
    expect(checkCriteriaPick(withCriteria, ['reason', 'plain'])).toMatchObject({ ok: false, missing: ['three', 'safe'] });
    expect(checkCriteriaPick(withCriteria, ['reason', 'plain', 'three', 'safe', '없는카드']).ok).toBe(false);
    expect(checkCriteriaPick(base, []).ok).toBe(false);
  });
  it('데이터 점검은 확인할 수 없거나 늘 지켜지는 조건을 찾아요', () => {
    expect(promptProblems(withCriteria)).toEqual([]);
    const cards = withCriteria.criteria!.cards;
    const swap = (i: number, card: object) => ({ ...withCriteria, criteria: { cards: cards.map((c, j) => j === i ? { ...c, ...card } : c) } });
    expect(promptProblems(swap(4, { check: { plain: true } }))).toContain('long: 함정 카드에는 확인 방법을 넣지 않아요.');
    expect(promptProblems(swap(0, { check: undefined }))).toContain('reason: 확인 방법이 없어요.');
    expect(promptProblems(swap(0, { check: { slot: 'task', options: ['없음'] } }))).toEqual(expect.arrayContaining(['reason: 확인할 칸이나 선택지가 없어요.']));
    expect(promptProblems(swap(0, { check: { slot: 'task', options: ['story'] } }))).toContain('reason: 좋은 주문서로도 지켜지지 않아요.');
    const noPrivacy = { ...withCriteria, slots: base.slots.map(s => ({ ...s, options: s.options.filter(o => !o.privacy) })) };
    expect(promptProblems(noPrivacy)).toContain('safe: 어떤 칸을 바꿔도 늘 지켜져서 확인할 거리가 없어요.');
    expect(promptProblems({ ...withCriteria, criteria: { cards: cards.filter(c => c.wanted) } })).toContain('기준 카드는 조건 두 개 이상과 함정 하나 이상이에요.');
  });
});

const diagnose: PromptData = { ...base, diagnose: {
  intro: '친구가 받은 답이에요.\n어느 칸이 문제인지 찾아요.',
  hint: '의뢰문의 조건과 답을 한 줄씩 비교해요.',
  hidden: { role: 'dentist', task: 'why', how: 'hard', format: 'poem' },
  followUps: [
    { id: 'easy', text: '1학년이 아는 말로 바꿔 줘', change: { how: 'easy' }, specific: true, feedback: '낱말이 쉬워졌어요.' },
    { id: 'list', text: '번호를 붙여 세 줄로 나눠 줘', change: { format: 'list' }, specific: true, feedback: '세 줄로 나뉘었어요.' },
    { id: 'again', text: '다시 써 줘', change: {}, specific: false, feedback: '무엇을 바꿀지 몰라서 그대로예요.' },
    { id: 'fancy', text: '더 멋지게 해 줘', change: { format: 'table' }, specific: false, feedback: '모양은 바뀌었지만 의뢰와 아직 달라요.' },
  ],
} };

describe('원인 찾기와 구체적으로 고쳐 묻기', () => {
  it('가려진 주문서의 문제 칸을 정확히 골라야 해요', () => {
    expect(problemSlots(diagnose, diagnose.diagnose!.hidden)).toEqual(['how', 'format']);
    expect(checkCause(diagnose, ['format', 'how']).ok).toBe(true);
    expect(checkCause(diagnose, ['how'])).toMatchObject({ ok: false, missing: ['format'] });
    expect(checkCause(diagnose, ['role', 'how', 'format'])).toMatchObject({ ok: false, wrong: ['role'] });
    expect(checkCause(base, ['how']).ok).toBe(false);
  });
  it('구체적인 말은 문제 칸만 고치고, 막연한 말은 고치지 못해요', () => {
    const [easy, list, again, fancy] = diagnose.diagnose!.followUps;
    const start = diagnose.diagnose!.hidden;
    expect(changedSlots(diagnose, start, applyFollowUp(start, again))).toEqual([]);
    expect(changedSlots(diagnose, start, applyFollowUp(start, fancy))).toEqual(['format']);
    expect(problemSlots(diagnose, applyFollowUp(start, fancy))).toEqual(['how', 'format']);
    const fixed = applyFollowUp(applyFollowUp(start, easy), list);
    expect(changedSlots(diagnose, start, fixed)).toEqual(['how', 'format']);
    expect(problemSlots(diagnose, fixed)).toEqual([]);
    expect(evaluatePrompt(diagnose, fixed)).toMatchObject({ success: true, stars: 3 });
    expect(goodChoice(diagnose)).toEqual(best);
  });
  it('데이터 점검은 끝까지 고칠 수 있는지와 말의 역할을 확인해요', () => {
    expect(promptProblems(diagnose)).toEqual([]);
    const rule = diagnose.diagnose!;
    const set = (patch: object) => promptProblems({ ...diagnose, diagnose: { ...rule, ...patch } });
    expect(set({ hidden: best })).toContain('가려진 주문서의 답이 의뢰를 해결하지 못해야 해요.');
    expect(set({ hidden: { ...rule.hidden, how: 'private' } })).toContain('가려진 주문서에는 개인정보 선택지를 넣지 않아요.');
    expect(set({ followUps: rule.followUps.filter(f => f.id !== 'list') })).toEqual(expect.arrayContaining(['format: 이 칸을 고치는 구체적인 말이 없어요.']));
    expect(set({ followUps: rule.followUps.map(f => f.id === 'again' ? { ...f, change: { how: 'easy' } } : f) })).toContain('again: 막연한 말은 문제 칸을 고치지 못하고, 다른 칸도 망가뜨리지 않아요.');
    expect(set({ followUps: rule.followUps.map(f => f.id === 'fancy' ? { ...f, change: { role: 'pirate' } } : f) })).toContain('fancy: 막연한 말은 문제 칸을 고치지 못하고, 다른 칸도 망가뜨리지 않아요.');
    expect(set({ followUps: rule.followUps.map(f => f.id === 'easy' ? { ...f, change: { role: 'dentist' } } : f) })).toContain('easy: 구체적인 말은 문제 칸 하나를 좋은 선택지로 바꿔요.');
    expect(set({ followUps: rule.followUps.filter(f => f.specific) })).toEqual(expect.arrayContaining(['막연한 고쳐 묻기가 하나 이상 있어야 해요.']));
  });
});
