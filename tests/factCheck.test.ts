import { describe, expect, it } from 'vitest';
import type { FactCheckData } from '../src/data/schema';
import { evaluateFactCheck, factCheckProblems, NO_SOURCE, type FactCheckAnswer } from '../src/missions/factCheck/evaluate';

const data: FactCheckData = {
  intro: '자료를 읽고 확인해요.',
  sources: [
    { id: 'map', title: '섬 지도', text: '등대는 마을 동쪽에 있어요.' },
    { id: 'notice', title: '공방 안내', text: '공방은 낮에 문을 열어요.' },
  ],
  claims: [
    { id: 'direction', text: '등대는 서쪽에 있어요.', source: 'map', choices: ['그대로 두어요.', '등대는 동쪽에 있어요.', '등대는 북쪽에 있어요.'], answer: 1 },
    { id: 'hours', text: '공방은 낮에 문을 열어요.', source: 'notice', choices: ['그대로 두어요.', '공방은 밤에만 열어요.'], answer: 0 },
  ],
  hint: '지도와 공방 안내를 읽어요.',
};
const answers: Record<string, FactCheckAnswer> = { direction: { choice: 1, source: 'map' }, hours: { choice: 0, source: 'notice' } };
const read = ['map', 'notice'];

describe('근거를 읽고 문장을 확인하기', () => {
  it('자료를 읽고 틀린 말만 정확히 고치면 통과해요', () => {
    const before = JSON.stringify({ data, answers, read });
    expect(evaluateFactCheck(data, answers, read)).toBe(true);
    expect(JSON.stringify({ data, answers, read })).toBe(before);
  });
  it('답을 알아도 근거 자료를 실제 열지 않았으면 통과하지 못해요', () => {
    expect(evaluateFactCheck(data, answers, [])).toBe(false);
    expect(evaluateFactCheck(data, answers, ['map'])).toBe(false);
    expect(evaluateFactCheck(data, answers, ['notice'])).toBe(false);
  });
  it('읽은 자료라도 문장을 뒷받침하지 않는 근거는 거절해요', () => {
    expect(evaluateFactCheck(data, { ...answers, direction: { choice: 1, source: 'notice' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, { ...answers, direction: { choice: 1, source: 'unknown' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, { ...answers, direction: { choice: 1, source: '' } }, read)).toBe(false);
  });
  it('그럴듯한 추측이나 올바른 말의 잘못된 수정은 거절해요', () => {
    expect(evaluateFactCheck(data, { ...answers, direction: { choice: 2, source: 'map' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, { ...answers, direction: { choice: 0, source: 'map' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, { ...answers, hours: { choice: 1, source: 'notice' } }, read)).toBe(false);
  });
  it('빈 답·범위 밖 답·알 수 없는 문장이나 자료 기록은 거절해요', () => {
    expect(evaluateFactCheck(data, {}, read)).toBe(false);
    expect(evaluateFactCheck(data, { direction: answers.direction }, read)).toBe(false);
    for (const choice of [-1, 0.5, NaN, Infinity, 99]) expect(evaluateFactCheck(data, { ...answers, direction: { choice, source: 'map' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, { ...answers, extra: { choice: 0, source: 'map' } }, read)).toBe(false);
    expect(evaluateFactCheck(data, answers, [...read, 'unknown'])).toBe(false);
  });
  it('중복 식별자·없는 정답 자료·빈 미션은 성공으로 처리하지 않아요', () => {
    expect(evaluateFactCheck({ ...data, claims: [] }, {}, read)).toBe(false);
    expect(evaluateFactCheck({ ...data, sources: [...data.sources, data.sources[0]] }, answers, read)).toBe(false);
    expect(evaluateFactCheck({ ...data, claims: [...data.claims, data.claims[0]] }, answers, read)).toBe(false);
    expect(evaluateFactCheck({ ...data, claims: [{ ...data.claims[0], source: 'missing' }, data.claims[1]] }, answers, read)).toBe(false);
    expect(evaluateFactCheck({ ...data, claims: [{ ...data.claims[0], answer: 9 }, data.claims[1]] }, answers, read)).toBe(false);
  });
  it('그림 설명이 있어도 사실 판단에는 근거 읽기와 정확한 답이 필요해요', () => {
    const visual: FactCheckData = { ...data, claims: data.claims.map(claim => ({ ...claim, visual: { key: 'prop-sign', frame: 0, caption: '게임 속 표지판 그림이에요.' } })) };
    expect(evaluateFactCheck(visual, answers, read)).toBe(true);
    expect(evaluateFactCheck(visual, answers, [])).toBe(false);
  });
});

const judge = ['자료와 같아요', '자료와 달라요', '자료에 없는 말이에요'];
const asked: FactCheckData = {
  intro: '같은 질문을 두 가지로 부탁했어요.',
  sources: [
    { id: 'ledger', title: '공방 준비 기록', text: '오늘 공방에는 붓 세 자루와\n종이 여섯 장을 준비했어요.' },
    { id: 'map', title: '섬 안내 지도', text: '공방은 마을 북쪽에 있어요.' },
  ],
  asks: [
    { id: 'plain', label: '그냥 물은 답', prompt: '공방에 무엇이 있는지 알려 줘.' },
    { id: 'grounded', label: '자료를 주고 물은 답', prompt: '이 자료만 보고 답해 줘.\n자료에 없으면 없다고 말해 줘.' },
  ],
  claims: [
    { id: 'p-brush', ask: 'plain', text: '공방에는 붓이 세 자루 있어요.', source: 'ledger', choices: judge, answer: 0 },
    { id: 'p-paint', ask: 'plain', text: '공방에는 물감이 열 통 있어요.', source: NO_SOURCE, choices: judge, answer: 2 },
    { id: 'p-paper', ask: 'plain', text: '종이는 두 장이에요.', source: 'ledger', choices: judge, answer: 1 },
    { id: 'g-brush', ask: 'grounded', text: '붓은 세 자루예요.', source: 'ledger', choices: judge, answer: 0 },
    { id: 'g-paint', ask: 'grounded', text: '물감은 자료에 나와 있지 않아요.', source: 'ledger', choices: judge, answer: 0 },
  ],
  compare: { q: '자료를 주고 물었더니 무엇이 달라졌나요?', choices: ['자료에 없는 말을 지어내지 않았어요', '답이 더 길어졌어요', '이제 확인하지 않아도 돼요'], answer: 0 },
  hint: '물감이 나오는 자료가 있는지 모두 열어 봐요.',
};
const right: Record<string, FactCheckAnswer> = Object.fromEntries(asked.claims.map(c => [c.id, { choice: c.answer, source: c.source }]));
const all = ['ledger', 'map'];

describe('두 부탁의 답을 자료와 비교하기', () => {
  it('자료에 없는 말은 모든 자료를 읽은 뒤 "찾을 수 없어요"로 골라야 해요', () => {
    expect(evaluateFactCheck(asked, right, all, 0)).toBe(true);
    expect(evaluateFactCheck(asked, right, ['ledger'], 0)).toBe(false);
    expect(evaluateFactCheck(asked, { ...right, 'p-paint': { choice: 2, source: 'ledger' } }, all, 0)).toBe(false);
    expect(evaluateFactCheck(asked, { ...right, 'p-paint': { choice: 1, source: NO_SOURCE } }, all, 0)).toBe(false);
    expect(evaluateFactCheck(asked, { ...right, 'p-brush': { choice: 0, source: NO_SOURCE } }, all, 0)).toBe(false);
  });
  it('비교 질문의 답과 두 답의 묶음이 모두 있어야 해요', () => {
    expect(evaluateFactCheck(asked, right, all, 1)).toBe(false);
    expect(evaluateFactCheck(asked, right, all)).toBe(false);
    expect(evaluateFactCheck({ ...asked, asks: asked.asks!.slice(0, 1) }, right, all, 0)).toBe(false);
    expect(evaluateFactCheck({ ...asked, claims: asked.claims.map(c => c.id === 'g-paint' ? { ...c, ask: undefined } : c) }, right, all, 0)).toBe(false);
    expect(evaluateFactCheck({ ...asked, claims: asked.claims.filter(c => c.ask === 'plain') }, right, all, 0)).toBe(false);
    expect(evaluateFactCheck({ ...asked, sources: [...asked.sources, { id: NO_SOURCE, title: '가짜', text: '가짜' }] }, right, [...all, NO_SOURCE], 0)).toBe(false);
  });
  it('데이터 점검은 자료에 없는 말과 비교 질문이 있는지 봐요', () => {
    expect(factCheckProblems(asked)).toEqual([]);
    expect(factCheckProblems(data)).toEqual([]);
    expect(factCheckProblems({ ...asked, claims: asked.claims.filter(c => c.source !== NO_SOURCE) })).toContain('자료에 없는 말이 하나 이상 있어야 해요.');
    expect(factCheckProblems({ ...asked, compare: undefined })).toContain('두 답을 비교하는 질문이 있어야 해요.');
    expect(factCheckProblems({ ...asked, compare: { ...asked.compare!, answer: 7 } })).toContain('비교 질문의 보기와 답을 살펴요.');
    expect(factCheckProblems({ ...asked, claims: [...asked.claims, { ...asked.claims[0], id: 'x', source: '없는자료' }] })).toContain('x: 근거 자료가 없어요.');
  });
});
