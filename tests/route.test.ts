import { describe, expect, it } from 'vitest';
import { getMission } from '../src/data/chapters';
import { MAPS } from '../src/data/maps';
import { ROUTE_ROUNDS, routeFlag, routeTier } from '../src/data/minigames/route';
import { ROBI_PARTS } from '../src/data/rpg/robiParts';
import type { Block, Cmd, MapObject, RouteRound } from '../src/data/schema';
import { ASSET_BY_KEY } from '../src/game/assets';
import { baseWalkable, buildCells, findPath, makePassable, objectSolid, type WorldQuery } from '../src/game/iso/mapRuntime';
import { lightOf } from '../src/game/light';
import { portalGate } from '../src/game/rpg/progress';
import { GameState, freshSave } from '../src/game/rpg/state';
import { MINIGAMES } from '../src/minigames/registry';
import { RouteEnv, findMark, runRoute, shortestPath, usesCmd, waveNumbers } from '../src/minigames/route/routeEnv';
import { countBlocks, run } from '../src/missions/core/interpreter';
import { CMD_LABEL, cmdIcon } from '../src/ui/labels';

const c = (cmd: Cmd): Block => ({ t: 'cmd', cmd });
const rep = (times: number, ...body: Block[]): Block => ({ t: 'repeat', times, body });
const U = c('up');
const D = c('down');
const L = c('left');
const R = c('right');
const W = c('followWave');
const round = (id: string) => ROUTE_ROUNDS.find((r) => r.id === id)!;

/** 판마다 별 3개짜리 풀이(블록 수 = optimal) */
const SOLUTIONS: Record<string, Block[]> = {
  r1: [R, D, R, D],
  r2: [R, R, R, D, D, R],
  r3: [rep(5, R), rep(2, D), rep(5, L)],
  r4: [rep(4, R, D)],
  r5: [rep(10, W)],
  r6: [rep(12, W)],
};

/** 미로마다 출발점에서 깃발까지 가장 짧은 걸음 수 */
const shortest = (rows: readonly string[]): number => {
  const s = findMark(rows, 'S');
  return waveNumbers(rows)[s.y][s.x] ?? -1;
};

describe('미로(RouteEnv)', () => {
  it('물결 숫자는 깃발에서 퍼진 걸음 수예요(벽은 없음, 벽을 돌아서 세요)', () => {
    expect(waveNumbers(['S.#', '#..', '##G'])).toEqual([
      [4, 3, null],
      [null, 2, 1],
      [null, null, 0],
    ]);
    // 두 갈래 길: 짧은 길(6걸음)이 출발점의 숫자예요.
    expect(shortest(round('r2').mazes[0])).toBe(6);
  });

  it('화살표는 한 칸씩 가고, 깃발에 닿으면 그 자리에서 멈춰요(남은 블록은 실행하지 않아요)', () => {
    const env = new RouteEnv(['S.#', '#..', '##G']);
    const res = run([R, D, R, D, L, L], env);
    expect(env.outcome(res.truncated)).toBe('success');
    expect(env.frames.map((f) => [f.event, f.x, f.y, f.arrive ?? false])).toEqual([
      ['move', 1, 0, false],
      ['move', 1, 1, false],
      ['move', 2, 1, false],
      ['move', 2, 2, true],
    ]);
  });

  it('벽(바위)이나 판 밖으로 가면 그 자리에서 멈춰요', () => {
    const wall = new RouteEnv(['S.#', '#..', '##G']);
    expect(wall.outcome(run([D], wall).truncated)).toBe('bump');
    expect(wall.frames).toEqual([{ x: 0, y: 0, path: '0', event: 'bump', toward: 'down' }]);
    const off = new RouteEnv(['S.#', '#..', '##G']);
    expect(off.outcome(run([U], off).truncated)).toBe('bump');
  });

  it('프로그램이 끝났는데 깃발에 못 닿으면 실패예요', () => {
    const env = new RouteEnv(['S.#', '#..', '##G']);
    expect(env.outcome(run([R, D], env).truncated)).toBe('notThere');
  });

  it('물결 따라가기는 숫자가 하나 작은 칸으로 가서 가장 짧은 길로 도착해요', () => {
    for (const r of ROUTE_ROUNDS) {
      for (const rows of r.mazes) {
        const env = new RouteEnv(rows);
        run([rep(12, W)], env);
        expect(env.outcome(false), `${r.id} ${rows.join('/')}`).toBe('success');
        expect(env.frames.length, `${r.id} ${rows.join('/')}`).toBe(shortest(rows));
        // 걸음마다 숫자가 하나씩 줄어요.
        const nums = env.frames.map((f) => env.wave[f.y][f.x]);
        nums.forEach((n, i) => expect(n).toBe(shortest(rows) - i - 1));
      }
    }
  });

  it('물결 숫자가 없는 칸에서는 따라갈 곳이 없어요', () => {
    // 출발점이 깃발과 이어지지 않은 미로
    const env = new RouteEnv(['S#G']);
    expect(env.outcome(run([W], env).truncated)).toBe('lost');
  });

  it('같은 프로그램은 언제나 같은 결과예요(운이 없어요)', () => {
    const a = runRoute(round('r6'), SOLUTIONS.r6);
    const b = runRoute(round('r6'), SOLUTIONS.r6);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('길찾기 판 데이터', () => {
  it('별 3개 풀이가 있고(블록 수 = optimal), 그 판의 블록만 써요', () => {
    for (const r of ROUTE_ROUNDS) {
      const program = SOLUTIONS[r.id];
      expect(runRoute(r, program).outcome, r.id).toBe('success');
      expect(countBlocks(program), r.id).toBe(r.optimal);
      const used = JSON.stringify(program);
      for (const cmd of Object.keys(CMD_LABEL) as Cmd[]) if (used.includes(`"${cmd}"`)) expect(r.palette, `${r.id}: ${cmd}`).toContain(cmd);
      if (used.includes('"repeat"')) expect(r.allowRepeat, r.id).toBe(true);
      for (const b of program) if (b.t === 'repeat') expect(b.times, r.id).toBeLessThanOrEqual(r.maxRepeat ?? 9);
    }
  });

  it('미로는 네모이고 출발·깃발이 하나씩, 출발점에서 깃발까지 길이 있어요', () => {
    for (const r of ROUTE_ROUNDS) {
      const w = r.mazes[0][0].length;
      const hgt = r.mazes[0].length;
      for (const rows of r.mazes) {
        expect([rows.length, ...rows.map((row) => row.length)], r.id).toEqual([hgt, ...rows.map(() => w)]);
        expect(rows.every((row) => /^[#.SG]+$/.test(row)), r.id).toBe(true);
        expect(rows.join('').split('S').length - 1, r.id).toBe(1);
        expect(rows.join('').split('G').length - 1, r.id).toBe(1);
        expect(shortest(rows), r.id).toBeGreaterThan(0);
        // 판에 놓는 칸이 너무 많지 않게(작은 화면)
        expect(w * hgt, r.id).toBeLessThanOrEqual(30);
      }
    }
  });

  it('반복 판은 반복을 써야 별 3개예요. 늘어놓기만 하면 블록이 많아요(학습 우회 방지)', () => {
    for (const r of ROUTE_ROUNDS) {
      const plain = shortest(r.mazes[0]);
      if (r.allowRepeat) expect(plain, r.id).toBeGreaterThan(r.optimal + 2);
      else expect(plain, r.id).toBe(r.optimal);
    }
  });

  it('2판: 긴 길로 가도 도착하지만, 짧은 길이어야 별 3개예요', () => {
    const long = [D, D, D, R, R, U, R, R];
    const res = runRoute(round('r2'), long);
    expect(res.outcome).toBe('success');
    expect(countBlocks(long)).toBeGreaterThan(round('r2').optimal);
  });

  it('6판: 첫 미로의 순서를 외운 프로그램은 다른 미로에서 틀려요. 물결 따라가기는 세 미로 모두 가요', () => {
    const r6 = round('r6');
    const memorized = [R, R, D, D, L, L, D, D, R, R, R, R];
    expect(runRoute({ ...r6, mazes: [r6.mazes[0]] }, memorized).outcome).toBe('success');
    const res = runRoute(r6, memorized);
    expect(res.outcome).not.toBe('success');
    expect(res.failedMaze).toBeGreaterThan(0);
    expect(usesCmd(memorized, 'followWave')).toBe(false);
    expect(usesCmd(SOLUTIONS.r6, 'followWave')).toBe(true);
    // 세 미로는 모양과 걸음 수가 달라요.
    expect(new Set(r6.mazes.map((m) => m.join('/'))).size).toBe(3);
    expect(new Set(r6.mazes.map(shortest)).size).toBe(3);
    // 반복 횟수가 모자라면 가장 먼 미로에서 깃발에 못 닿아요.
    const short = runRoute(r6, [rep(8, W)]);
    expect(short.outcome).toBe('notThere');
  });

  it('블록은 배운 차례로 늘어요: 화살표 → 반복(2장) → 물결 따라가기(6장) → 미로 세 개', () => {
    expect(ROUTE_ROUNDS.map(routeTier)).toEqual([
      '화살표',
      '화살표',
      '화살표 + 반복',
      '화살표 + 반복',
      '화살표 + 물결 따라가기 + 반복',
      '화살표 + 물결 따라가기 + 반복 + 미로 세 개',
    ]);
    for (const r of ROUTE_ROUNDS) {
      if (!r.unlock) continue;
      expect(getMission(r.unlock.mission), r.id).toBeDefined();
      if (r.unlock.part) expect(ROBI_PARTS[r.unlock.part], r.id).toBeDefined();
      expect(r.lockedText, r.id).toBeTruthy();
    }
    // 물결 판은 6장 '물결 탐색' 뒤에 열려요.
    expect(getMission(round('r5').unlock!.mission)?.part.title).toBe('물결 탐색');
    expect(round('r1').unlock).toBeUndefined();
    expect(round('r2').unlock).toBeUndefined();
    expect(CMD_LABEL.followWave).toBe('물결 따라가기');
  });

  it('학생에게 보이는 글은 2줄 이내, 한 줄 약 20자예요', () => {
    for (const t of ROUTE_ROUNDS.flatMap((r: RouteRound) => [r.intro, r.hint, r.lockedText ?? '', r.title])) {
      const rows = t.split('\n');
      expect(rows.length, t).toBeLessThanOrEqual(2);
      for (const row of rows) expect(row.length, row).toBeLessThanOrEqual(22);
      expect(/죽|처치|피를|코인|동전을 넣/.test(t), t).toBe(false);
    }
  });

  it('벽 지도에 그리는 가장 짧은 길은 출발점에서 깃발까지 이어져요', () => {
    for (const r of ROUTE_ROUNDS) {
      const rows = r.mazes[0];
      const path = shortestPath(rows);
      expect(path[0], r.id).toEqual(findMark(rows, 'S'));
      expect(path[path.length - 1], r.id).toEqual(findMark(rows, 'G'));
      expect(path.length - 1, r.id).toBe(shortest(rows));
      for (let i = 1; i < path.length; i++) expect(Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y), r.id).toBe(1);
    }
  });

  it('그림·카드·소품이 목록에 있고, 열린 지도방 문과 탁자가 빛나요', () => {
    for (const key of ['prop-route-house', 'prop-route-table', 'prop-globe', cmdIcon('followWave'), 'icon-goal', 'icon-robi', 'icon-cell-rock']) {
      expect(ASSET_BY_KEY.has(key), key).toBe(true);
    }
    expect(ASSET_BY_KEY.get('prop-route-map')?.frames).toBe(ROUTE_ROUNDS.length + 1);
    expect(lightOf('prop-route-house', 0)).toBeNull();
    expect(lightOf('prop-route-house', 1)).not.toBeNull();
    expect(lightOf('prop-route-table', 0)?.glow).toBe('cool');
  });
});

const world = (flags: string[] = []): WorldQuery => {
  const f = new Set(flags);
  return { hasFlag: (n) => f.has(n), check: (c) => !c || ((!c.flag || f.has(c.flag)) && (!c.notFlag || !f.has(c.notFlag)) && !c.mission && !c.notMission) };
};

describe('마을 지도방', () => {
  type Portal = Extract<MapObject, { type: 'portal' }>;
  const door = MAPS.village.objects.find((o): o is Portal => o.type === 'portal' && o.id === 'to-maproom')!;
  const room = MAPS.maproom;

  it('처음부터 열려 있고, 예전 빈 집(8,13) 자리에 서 있어요', () => {
    const s = new GameState(freshSave('별빛'));
    expect(portalGate(s, null, 'village', door)).toEqual({ open: true });
    expect(door.open).toBeUndefined();
    expect(door.sprite).toBe('prop-route-house');
    expect(door.at).toEqual({ x: 8, y: 13 });
    expect(MAPS.village.objects.some((o) => o.id.startsWith('house-c'))).toBe(false);
  });

  it('들어가면 지도방 안 빈 칸에 서고, 문 매트로 나오면 지도방 문 앞이에요', () => {
    expect(door.to.map).toBe('maproom');
    expect(baseWalkable(buildCells(room), door.to.at.x, door.to.at.y)).toBe(true);
    const exit = room.objects.find((o): o is Portal => o.type === 'portal')!;
    expect(exit.to.map).toBe('village');
    for (const flags of [[], ['village-restore-1']]) {
      expect(makePassable(MAPS.village, buildCells(MAPS.village), world(flags))(exit.to.at.x, exit.to.at.y), flags.join()).toBe(true);
    }
    expect(Math.max(Math.abs(exit.to.at.x - door.at.x), Math.abs(exit.to.at.y - door.at.y))).toBe(1);
  });

  it('마을 출발점에서 지도방 문까지 걸어갈 수 있어요', () => {
    const v = MAPS.village;
    const cells = buildCells(v);
    for (const flags of [[], ['village-restore-1']]) {
      const pass = makePassable(v, cells, world(flags));
      const goal = (x: number, y: number) => Math.max(Math.abs(x - door.at.x), Math.abs(y - door.at.y)) <= 1 && !(x === door.at.x && y === door.at.y);
      expect(findPath(pass, v.spawn, goal, door.at), flags.join()).not.toBeNull();
    }
  });

  it('길찾기 탁자와 나가는 문에 갈 수 있어요(벽 지도에 길이 모두 그려져도)', () => {
    const all = ROUTE_ROUNDS.map((r) => routeFlag(r.id));
    for (const flags of [[], all]) {
      const q = world(flags);
      const pass = makePassable(room, buildCells(room), q);
      for (const o of room.objects.filter((x) => x.type === 'game' || x.type === 'portal')) {
        const solid = objectSolid(room.id, o, q);
        const goal = solid
          ? (x: number, y: number) => Math.max(Math.abs(x - o.at.x), Math.abs(y - o.at.y)) <= 1 && !(x === o.at.x && y === o.at.y)
          : (x: number, y: number) => x === o.at.x && y === o.at.y;
        expect(findPath((x, y) => pass(x, y) || (!solid && x === o.at.x && y === o.at.y), room.spawn, goal, o.at), `${o.id} ${flags.length}`).not.toBeNull();
      }
    }
  });

  it('놀이 탁자는 등록된 미니게임을 열고, 판마다 벽 지도 하나가 비었다가 그 판의 길로 그려져요', () => {
    const table = room.objects.find((o) => o.type === 'game');
    expect(table?.type === 'game' && MINIGAMES[table.game]?.title).toBe('코딩 길찾기');
    ROUTE_ROUNDS.forEach((r, i) => {
      const empty = room.objects.find((o) => o.id === `map-${r.id}-empty`);
      const drawn = room.objects.find((o) => o.id === `map-${r.id}-drawn`);
      expect(empty?.when, r.id).toEqual({ notFlag: routeFlag(r.id) });
      expect(drawn?.when, r.id).toEqual({ flag: routeFlag(r.id) });
      expect(empty?.type === 'prop' && empty.frame, r.id).toBe(0);
      expect(drawn?.type === 'prop' && drawn.frame, r.id).toBe(i + 1);
      expect(empty?.at, r.id).toEqual(drawn?.at);
    });
  });
});
