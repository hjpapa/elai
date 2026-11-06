import { describe, expect, it } from 'vitest';
import { stickToGrid } from '../src/ui/touchControls';

describe('터치 조이스틱', () => {
  it('화면에서 민 쪽으로 걸어요(아이소라서 화면 위쪽 = 칸의 (-1, -1))', () => {
    expect(stickToGrid(0, -50)).toEqual([-1, -1]); // 위
    expect(stickToGrid(50, 0)).toEqual([1, -1]); // 오른쪽
    expect(stickToGrid(0, 50)).toEqual([1, 1]); // 아래
    expect(stickToGrid(-50, 0)).toEqual([-1, 1]); // 왼쪽
  });

  it('대각선은 방향키 두 개를 함께 누른 것과 같아요', () => {
    expect(stickToGrid(40, -40)).toEqual([0, -1]); // 오른쪽 위 = 위 + 오른쪽
    expect(stickToGrid(40, 40)).toEqual([1, 0]); // 오른쪽 아래
    expect(stickToGrid(-40, 40)).toEqual([0, 1]); // 왼쪽 아래
    expect(stickToGrid(-40, -40)).toEqual([-1, 0]); // 왼쪽 위
  });

  it('가운데 가까이에서는 멈춰요', () => {
    expect(stickToGrid(5, -5)).toBeNull();
    expect(stickToGrid(0, 0)).toBeNull();
  });
});
