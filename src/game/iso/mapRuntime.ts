import type { Condition, MapDef, MapObject, Point, TileKind } from '../../data/schema';

export const WALKABLE: Record<TileKind, boolean> = {
  cave: true,
  lab: true,
  labwall: false,
  dock: true,
  crate: false,
  rockwall: false,
  grass: true,
  flower: true,
  path: true,
  sand: true,
  sandstone: false,
  stone: true,
  wood: true,
  bridge: true,
  water: false,
  hedge: false,
  wall: false,
  void: false,
};

export const TILE_TEXTURE: Record<TileKind, string | null> = {
  cave: 'tile-cave',
  lab: 'tile-lab',
  labwall: 'tile-lab',
  dock: 'tile-dock',
  crate: 'tile-dock',
  rockwall: 'tile-cave',
  grass: 'tile-grass',
  flower: 'tile-flower',
  path: 'tile-path',
  sand: 'tile-sand',
  sandstone: 'tile-sand',
  stone: 'tile-stone',
  wood: 'tile-wood',
  bridge: 'tile-bridge',
  water: 'tile-water',
  hedge: 'tile-grass',
  wall: 'tile-stone',
  void: null,
};

export const BLOCK_TEXTURE: Partial<Record<TileKind, string>> = { hedge: 'block-hedge', wall: 'block-wall', rockwall: 'block-cave', sandstone: 'block-sandstone', crate: 'block-crate', labwall: 'block-lab' };

export interface Cell {
  kind: TileKind;
  glyph?: { sprite: string; solid: boolean };
}

export function buildCells(def: MapDef): Cell[][] {
  return def.rows.map((row) =>
    [...row].map((ch): Cell => {
      const g = def.glyphs?.[ch];
      if (g) return { kind: g.tile, glyph: { sprite: g.sprite, solid: g.solid ?? true } };
      return { kind: def.legend[ch] ?? 'void' };
    }),
  );
}

export function baseWalkable(cells: Cell[][], x: number, y: number): boolean {
  const c = cells[y]?.[x];
  return !!c && WALKABLE[c.kind] && !c.glyph?.solid;
}

/** 오브젝트 상태 플래그 이름 */
export const objFlag = {
  chest: (map: string, id: string) => `chest:${map}:${id}`,
  door: (map: string, id: string) => `door:${map}:${id}`,
  mob: (map: string, id: string) => `mob:${map}:${id}`,
  pickup: (map: string, id: string) => `pick:${map}:${id}`,
};

export interface WorldQuery {
  check(cond: Condition | undefined): boolean;
  hasFlag(name: string): boolean;
}

export function objectVisible(map: string, o: MapObject, q: WorldQuery): boolean {
  if (!q.check(o.when)) return false;
  if (o.type === 'pickup' && q.hasFlag(objFlag.pickup(map, o.id))) return false;
  return true;
}

/** 길을 막는 오브젝트인지(표지판·포털·주울 물건·정화된 몹은 지나갈 수 있어요) */
export function objectSolid(map: string, o: MapObject, q: WorldQuery): boolean {
  if (!objectVisible(map, o, q)) return false;
  switch (o.type) {
    case 'npc':
    case 'chest':
      return true;
    case 'door':
      return !q.hasFlag(objFlag.door(map, o.id));
    case 'mob':
      return !q.hasFlag(objFlag.mob(map, o.id));
    case 'prop':
      return o.solid ?? false;
    default:
      return false;
  }
}

export const DIRS8: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

/**
 * A* 길찾기(8방향, 모서리 가로지르기 금지).
 * goalOk가 있으면 그 칸에 닿으면 끝나요(예: NPC 옆 칸).
 */
export function findPath(
  passable: (x: number, y: number) => boolean,
  from: Point,
  goalOk: (x: number, y: number) => boolean,
  heuristicTo: Point,
  maxNodes = 4000,
): Point[] | null {
  const key = (x: number, y: number) => `${x},${y}`;
  const open = new Map<string, { x: number; y: number; g: number; f: number }>();
  const came = new Map<string, string>();
  const closed = new Set<string>();
  const h = (x: number, y: number) => {
    const dx = Math.abs(x - heuristicTo.x);
    const dy = Math.abs(y - heuristicTo.y);
    return Math.max(dx, dy) + 0.4 * Math.min(dx, dy);
  };
  open.set(key(from.x, from.y), { x: from.x, y: from.y, g: 0, f: h(from.x, from.y) });
  let visited = 0;
  while (open.size && visited++ < maxNodes) {
    let best: { x: number; y: number; g: number; f: number } | null = null;
    let bestKey = '';
    for (const [k, n] of open) {
      if (!best || n.f < best.f) {
        best = n;
        bestKey = k;
      }
    }
    if (!best) break;
    open.delete(bestKey);
    if (goalOk(best.x, best.y)) {
      const path: Point[] = [{ x: best.x, y: best.y }];
      let k = came.get(bestKey);
      while (k) {
        const [x, y] = k.split(',').map(Number);
        path.unshift({ x, y });
        k = came.get(k);
      }
      return path;
    }
    closed.add(bestKey);
    for (const [dx, dy] of DIRS8) {
      const x = best.x + dx;
      const y = best.y + dy;
      const k = key(x, y);
      if (closed.has(k) || !passable(x, y)) continue;
      if (dx !== 0 && dy !== 0 && !(passable(best.x + dx, best.y) && passable(best.x, best.y + dy))) continue;
      const g = best.g + (dx !== 0 && dy !== 0 ? 1.4 : 1);
      const prev = open.get(k);
      if (prev && prev.g <= g) continue;
      open.set(k, { x, y, g, f: g + h(x, y) });
      came.set(k, bestKey);
    }
  }
  return null;
}

/** 지나갈 수 있는지 판단기(바닥 + 막는 오브젝트) */
export function makePassable(def: MapDef, cells: Cell[][], q: WorldQuery, ignore?: (o: MapObject) => boolean): (x: number, y: number) => boolean {
  const blocked = new Set<string>();
  for (const o of def.objects) {
    if (ignore?.(o)) continue;
    if (objectSolid(def.id, o, q)) blocked.add(`${o.at.x},${o.at.y}`);
  }
  return (x, y) => baseWalkable(cells, x, y) && !blocked.has(`${x},${y}`);
}
