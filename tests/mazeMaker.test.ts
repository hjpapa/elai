import { describe, expect, it } from 'vitest';
import { ISLAND_MAZES, MAZE_ROUNDS } from '../src/data/minigames/maze';
import { GameState, freshSave } from '../src/game/rpg/state';
import { decodeMaze, encodeMaze } from '../src/minigames/maze/mazeCode';
import { checkMaze } from '../src/minigames/maze/mazeRules';

describe('미로 공작소', () => {
  it('섬 친구 미로 세 개를 코드로 바꿔 다시 열어요', () => {
    for (const { rows } of ISLAND_MAZES) {
      const code = encodeMaze(rows)!;
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{5}$/);
      expect(decodeMaze(code.toLowerCase().replaceAll('-', ' '))).toEqual(rows);
    }
    expect(checkMaze(ISLAND_MAZES[0].rows)).toMatchObject({ steps: 4, deadEnds: 0, detour: false });
    expect(checkMaze(ISLAND_MAZES[2].rows).detour).toBe(true);
  });
  it('잘못된 지도와 복사 오류를 걸러요', () => {
    const rows = [...ISLAND_MAZES[0].rows];
    rows[1] = '#S.#.G#';
    expect(encodeMaze(rows)).toBeNull();
    const valid = encodeMaze(ISLAND_MAZES[1].rows)!.replaceAll('-', '');
    let rejected = 0;
    for (let i = 0; i < valid.length; i++) for (const c of 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
      if (valid[i] !== c && !decodeMaze(valid.slice(0,i) + c + valid.slice(i+1))) rejected++;
    }
    expect(rejected).toBeGreaterThan(380);
    expect(decodeMaze('이름')).toBeNull();
  });
  it('옛 저장과 깨진 작품을 정리하고 올바른 작품만 남겨요', () => {
    const save = freshSave('체험');
    const code = encodeMaze(ISLAND_MAZES[1].rows)!;
    save.mazeWorks = { r1: code, r2: '오류', other: code };
    const state = new GameState(save);
    expect(state.data.mazeWorks).toEqual({ r1: code });
    state.saveMazeWork(MAZE_ROUNDS[1].id, code);
    state.saveMazeWork('r1', '오류');
    expect(state.data.mazeWorks).toEqual({ r1: code, r2: code });
    expect(new GameState(freshSave('체험')).data.mazeWorks).toEqual({});
  });
});
