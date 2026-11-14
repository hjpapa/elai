import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import type { MapDef, MapObject, Point } from '../src/data/schema';
import { cliffFaces, edgeFaces, rimEdges } from '../src/game/iso/edges';
import { HALF_LEVEL_PX, liftPx } from '../src/game/iso/iso';
import { buildCells, canStep, findPath, heightAt, makePassable, makeStep, objectSolid, type Cell, type WorldQuery } from '../src/game/iso/mapRuntime';

const grid = (rows: string[], heights?: string[]): Cell[][] =>
  buildCells({ id: 't', name: 't', theme: 'village', rows, heights, legend: { '.': 'grass', ' ': 'void' }, objects: [], spawn: { x: 0, y: 0 } });

const world = (): WorldQuery => ({ hasFlag: () => false, check: (c) => !c || (!c.flag && !c.mission) });

function reach(def: MapDef, o: MapObject, step = true, cells = buildCells(def)): boolean {
  const q = world();
  const pass = makePassable(def, cells, q);
  const solid = objectSolid(def.id, o, q);
  const goal = solid
    ? (x: number, y: number) => Math.max(Math.abs(x - o.at.x), Math.abs(y - o.at.y)) <= 1 && !(x === o.at.x && y === o.at.y)
    : (x: number, y: number) => x === o.at.x && y === o.at.y;
  return findPath((x, y) => pass(x, y) || (!solid && x === o.at.x && y === o.at.y), def.spawn, goal, o.at, 20000, step ? makeStep(cells) : undefined) !== null;
}

describe('높낮이 규칙', () => {
  it('높이는 숫자 하나 = 반 단(4px)이고, 높이 줄이 없으면 모두 평지예요', () => {
    expect(HALF_LEVEL_PX).toBe(4);
    expect(liftPx(4)).toBe(16);
    const cells = grid(['...', '...'], ['012', '340']);
    expect([heightAt(cells, 0, 0), heightAt(cells, 2, 0), heightAt(cells, 1, 1), heightAt(cells, 9, 9)]).toEqual([0, 2, 4, 0]);
    expect(heightAt(grid(['..']), 1, 0)).toBe(0);
  });

  it('반 단까지는 오르내리고, 한 단 이상 차이는 절벽이라 못 가요', () => {
    const cells = grid(['....'], ['0124']);
    expect(canStep(cells, 0, 0, 1, 0)).toBe(true);
    expect(canStep(cells, 2, 0, 1, 0)).toBe(true);
    expect(canStep(cells, 2, 0, 3, 0)).toBe(false);
  });

  it('대각선은 네 칸 높이가 같을 때만 가요(비탈 모서리를 가로지르지 않아요)', () => {
    expect(canStep(grid(['..', '..'], ['11', '11']), 0, 0, 1, 1)).toBe(true);
    expect(canStep(grid(['..', '..'], ['01', '00']), 0, 0, 1, 1)).toBe(false);
    expect(canStep(grid(['..', '..'], ['00', '01']), 0, 0, 1, 1)).toBe(false);
  });

  it('길찾기는 절벽을 돌아 계단으로 올라가요', () => {
    // 가운데 줄은 높이 4의 고원, 오른쪽 끝만 1·2·3 계단이에요.
    const cells = grid(['.....', '.....', '.....'], ['00000', '44443', '00012']);
    const pass = () => true;
    const path = findPath(pass, { x: 0, y: 2 }, (x, y) => x === 0 && y === 1, { x: 0, y: 1 }, 4000, makeStep(cells));
    expect(path?.map((p) => `${p.x},${p.y}`)).toEqual(['0,2', '1,2', '2,2', '3,2', '4,2', '4,1', '3,1', '2,1', '1,1', '0,1']);
    // 높이 규칙이 없으면 바로 올라가요(예전 평지 길찾기).
    expect(findPath(pass, { x: 0, y: 2 }, (x, y) => x === 0 && y === 1, { x: 0, y: 1 })).toHaveLength(2);
  });
});

describe('높은 칸의 옆면', () => {
  it('앞쪽 두 변에서 이웃이 낮을 때만 그 차이만큼 옆면이 보여요', () => {
    const cells = grid(['...', '...', '...'], ['000', '042', '000']);
    expect(cliffFaces(cells)).toEqual([
      { x: 1, y: 1, side: 'left', kind: 'grass', top: 4, bottom: 0 },
      { x: 1, y: 1, side: 'right', kind: 'grass', top: 4, bottom: 2 },
      { x: 2, y: 1, side: 'left', kind: 'grass', top: 2, bottom: 0 },
      { x: 2, y: 1, side: 'right', kind: 'grass', top: 2, bottom: null },
    ]);
  });

  it('섬 가장자리의 높은 칸은 옆면이 땅 두께까지 내려가고, 평지 가장자리 옆면에서는 빠져요', () => {
    const cells = grid(['..'], ['20']);
    expect(cliffFaces(cells)).toEqual([
      { x: 0, y: 0, side: 'left', kind: 'grass', top: 2, bottom: null },
      { x: 0, y: 0, side: 'right', kind: 'grass', top: 2, bottom: 0 },
    ]);
    expect(edgeFaces(cells).map((f) => `${f.x},${f.y},${f.side}`)).toEqual(['1,0,left', '1,0,right']);
  });

  it('뒤쪽 두 변은 이웃이 낮거나 땅이 없을 때 윗면 테두리를 그려요', () => {
    const cells = grid(['...', '...', '...'], ['000', '042', '000']);
    expect(rimEdges(cells)).toEqual([
      { x: 1, y: 1, side: 'left', kind: 'grass', h: 4 },
      { x: 1, y: 1, side: 'right', kind: 'grass', h: 4 },
      { x: 2, y: 1, side: 'right', kind: 'grass', h: 2 },
    ]);
    // 맵 가장자리(뒤에 땅이 없음)도 테두리를 그리고, 평지 칸은 그리지 않아요.
    expect(rimEdges(grid(['..'], ['20']))).toEqual([
      { x: 0, y: 0, side: 'left', kind: 'grass', h: 2 },
      { x: 0, y: 0, side: 'right', kind: 'grass', h: 2 },
    ]);
  });
});

describe('맵의 높낮이', () => {
  it('높이 줄은 맵과 같은 크기의 0~4 숫자예요(언덕 뒤 캐릭터가 많이 가려지지 않게)', () => {
    for (const def of Object.values(MAPS)) {
      if (!def.heights) continue;
      expect(def.heights.length, def.id).toBe(def.rows.length);
      for (const [y, row] of def.heights.entries()) {
        expect(row.length, `${def.id} ${y}`).toBe(def.rows[y].length);
        expect(/^[0-4]+$/.test(row), `${def.id} ${y}`).toBe(true);
      }
    }
  });

  it('숲 언덕: 고원 위 상자는 오솔길 끝 계단으로만 갈 수 있어요', () => {
    const def = MAPS.forest;
    const chest = def.objects.find((o) => o.id === 'chest-hill')!;
    const cells = buildCells(def);
    expect(heightAt(cells, chest.at.x, chest.at.y)).toBe(4);
    expect(reach(def, chest)).toBe(true);
    // 계단을 없애면(평지로) 절벽에 막혀 못 가요.
    for (const y of [15, 16, 17]) cells[y][23].h = 0;
    expect(reach(def, chest, true, cells)).toBe(false);
    // 고원 둘레는 계단 자리 말고는 모두 한 단보다 높아요.
    const step = makeStep(buildCells(def));
    const edge: Point[] = [];
    for (let x = 19; x <= 24; x++) edge.push({ x, y: 15 });
    for (let y = 12; y <= 14; y++) edge.push({ x: 25, y }, { x: 18, y });
    const open = edge.filter((p) => step(p.x, p.y, Math.min(24, Math.max(19, p.x)), Math.min(14, Math.max(12, p.y))));
    expect(open).toEqual([{ x: 23, y: 15 }]);
  });

  it('숲의 다른 NPC·상자·문은 예전처럼 평지라서 그대로 갈 수 있어요', () => {
    const def = MAPS.forest;
    for (const id of ['chef', 'chest-forest', 'to-village', 'sign-entry']) {
      const o = def.objects.find((x) => x.id === id)!;
      expect(heightAt(buildCells(def), o.at.x, o.at.y), id).toBe(0);
      expect(reach(def, o), id).toBe(true);
    }
  });

  it('마을 전망 언덕: 둘레에서 걸어 올라 꼭대기 표지판에 닿아요', () => {
    const def = MAPS.village;
    const sign = def.objects.find((o) => o.id === 'sign-hill')!;
    expect(heightAt(buildCells(def), sign.at.x, sign.at.y)).toBe(3);
    expect(reach(def, sign)).toBe(true);
  });
});


// C16: 실제 높낮이 길찾기와 기존 대화·보상 자리를 함께 보호해요.
const chapterHills: { id: string; top: Point; height: number; stairs: Point[]; chest: string; sign: string }[] = [
  { id: 'observatory', top: { x: 10, y: 4 }, height: 3, stairs: [{ x: 10, y: 6 }, { x: 11, y: 6 }], chest: 'chest-observation', sign: 'sign-observation' },
  { id: 'harbor', top: { x: 5, y: 8 }, height: 3, stairs: [{ x: 6, y: 10 }, { x: 6, y: 11 }], chest: 'chest-pier', sign: 'sign-pier' },
  { id: 'desert', top: { x: 14, y: 3 }, height: 4, stairs: [{ x: 15, y: 4 }, { x: 16, y: 4 }, { x: 17, y: 4 }], chest: 'chest-dune', sign: 'sign-dune' },
];

for (const hill of chapterHills) describe(`C16 ${hill.id} 높낮이`, () => {
  const def = MAPS[hill.id];
  it('고원은 계단으로 오르내리고, 계단을 평지로 바꾸면 닿지 못해요', () => {
    const cells = buildCells(def);
    const pass = makePassable(def, cells, world());
    const route = (from: Point, to: Point) => findPath(pass, from, (x, y) => x === to.x && y === to.y, to, 20000, makeStep(cells));
    expect(heightAt(cells, hill.top.x, hill.top.y)).toBe(hill.height);
    const path = route(def.spawn, hill.top);
    expect(path).not.toBeNull();
    for (const stair of hill.stairs) expect(path).toContainEqual(stair);
    expect(route(hill.top, def.spawn)).not.toBeNull();
    for (const p of hill.stairs) cells[p.y][p.x].h = 0;
    expect(route(def.spawn, hill.top)).toBeNull();
  });

  it('기존 NPC·상자·포털·표지판과 출발점 둘레 8칸은 평지이고 모두 갈 수 있어요', () => {
    const cells = buildCells(def);
    const objects = def.objects.filter((o) => ['npc', 'chest', 'portal', 'sign'].includes(o.type) && o.id !== hill.chest && o.id !== hill.sign);
    for (const p of [def.spawn, ...objects.map((o) => o.at)]) {
      for (let y = p.y - 1; y <= p.y + 1; y++) for (let x = p.x - 1; x <= p.x + 1; x++) {
        expect(heightAt(cells, x, y), `${x},${y}`).toBe(0);
      }
    }
    for (const o of objects) expect(reach(def, o), o.id).toBe(true);
  });

  it('높은 곳은 바닥에만 있고 벽·가장자리와 떨어져 있으며 몹 활동 자리는 평지예요', () => {
    const cells = buildCells(def);
    const pass = makePassable(def, cells, world());
    for (let y = 0; y < cells.length; y++) for (let x = 0; x < cells[y].length; x++) {
      if (heightAt(cells, x, y) === 0) continue;
      expect(def.rows[y][x], `${x},${y}`).toBe('.');
      expect(x).toBeGreaterThanOrEqual(2);
      expect(x).toBeLessThanOrEqual(cells[y].length - 3);
      expect(y).toBeGreaterThanOrEqual(2);
      expect(y).toBeLessThanOrEqual(cells.length - 3);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) expect(def.rows[y + dy][x + dx]).not.toBe('#');
      // 상자 등 단 위 고정 소품 칸을 빼고, 높은 모든 칸에 실제로 걸어갈 수 있어요.
      if (pass(x, y)) expect(findPath(pass, def.spawn, (gx, gy) => gx === x && gy === y, { x, y }, 20000, makeStep(cells)), `${x},${y}`).not.toBeNull();
    }
    for (const o of def.objects) if (o.type === 'mob') {
      const r = o.wander ?? 0;
      for (let y = o.at.y - r; y <= o.at.y + r; y++) for (let x = o.at.x - r; x <= o.at.x + r; x++) expect(heightAt(cells, x, y), o.id).toBe(0);
    }
  });

  it('언덕 상자와 표지판에 닿고, 추가 보상은 경험치 없이 작은 소모품 하나예요', () => {
    const chest = def.objects.find((o) => o.id === hill.chest)!;
    const sign = def.objects.find((o) => o.id === hill.sign)!;
    expect(chest.type).toBe('chest');
    expect(sign.type).toBe('sign');
    for (const o of [chest, sign]) {
      expect(heightAt(buildCells(def), o.at.x, o.at.y)).toBeGreaterThanOrEqual(2);
      expect(reach(def, o), o.id).toBe(true);
    }
    if (chest.type === 'chest') {
      expect(chest.reward.xp).toBeUndefined();
      expect(chest.reward.coins).toBeLessThanOrEqual(10);
      expect(chest.reward.items).toHaveLength(1);
      expect(chest.reward.items?.[0].qty).toBe(1);
      expect(['apple', 'jelly']).toContain(chest.reward.items?.[0].id);
    }
    if (sign.type === 'sign') expect(sign.text.split('\n').length).toBeLessThanOrEqual(2);
  });
});
