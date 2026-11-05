import { describe, expect, it } from 'vitest';
import type { FactCheckData } from '../src/data/schema';
import { evaluateFactCheck, type FactCheckAnswer } from '../src/missions/factCheck/evaluate';

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
