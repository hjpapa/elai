import type { MapDef, MapObject, Point } from '../schema';
import { BASE_LEGEND, mulberry32 } from './paint';

const N = 17;
const SPAWN: Point = { x: 9, y: 15 };
const DOOR: Point = { x: 9, y: 4 };
const ARROW: Record<string, string> = { '1,0': '↘', '-1,0': '↖', '0,1': '↙', '0,-1': '↗' };
const DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const isRoom = (x: number, y: number) => x >= 7 && x <= 9 && y >= 1 && y <= 3;

function bfs(open: (x: number, y: number) => boolean, from: Point): { dist: Map<string, number>; prev: Map<string, string> } {
  const dist = new Map([[`${from.x},${from.y}`, 0]]);
  const prev = new Map<string, string>();
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    const d = dist.get(`${p.x},${p.y}`)!;
    for (const [dx, dy] of DIRS) {
      const x = p.x + dx;
      const y = p.y + dy;
      const k = `${x},${y}`;
      if (!open(x, y) || dist.has(k)) continue;
      dist.set(k, d + 1);
      prev.set(k, `${p.x},${p.y}`);
      queue.push({ x, y });
    }
  }
  return { dist, prev };
}

function pathTo(prev: Map<string, string>, from: Point, to: Point): Point[] {
  const out: Point[] = [];
  let k: string | undefined = `${to.x},${to.y}`;
  while (k && k !== `${from.x},${from.y}`) {
    const [x, y] = k.split(',').map(Number);
    out.unshift({ x, y });
    k = prev.get(k);
  }
  out.unshift(from);
  return out;
}

/** 길을 화살표 묶음으로: "↗ 2칸 → ↖ 3칸 → …" */
function arrowRuns(path: Point[], max = 3): string {
  const runs: { a: string; n: number }[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = ARROW[`${path[i].x - path[i - 1].x},${path[i].y - path[i - 1].y}`];
    const last = runs[runs.length - 1];
    if (last?.a === a) last.n++;
    else runs.push({ a, n: 1 });
  }
  const shown = runs.slice(0, max).map((r) => `${r.a} ${r.n}칸`);
  return shown.join(' → ') + (runs.length > max ? ' → …' : '');
}

/**
 * 1장 던전 "표지판 숲 미로"(17×17, 안개). 같은 씨앗이면 모든 학생이 같은 미로를 받아요.
 * 맨 위에는 수호자의 방(덩굴 문으로만 들어가요), 가장 먼 막다른 길에는 열쇠 상자가 있어요.
 */
export function buildMaze(seed = 20261104): MapDef {
  const rand = mulberry32(seed);
  const g = Array.from({ length: N }, () => Array<string>(N).fill('#'));
  const open = (x: number, y: number) => g[y]?.[x] !== undefined && g[y][x] !== '#';

  // 칸(홀수 좌표) 사이의 벽을 허무는 미로 만들기(방 칸은 빼요)
  g[SPAWN.y][SPAWN.x] = '.';
  const seen = new Set([`${SPAWN.x},${SPAWN.y}`]);
  const stack = [SPAWN];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const next = DIRS.map(([dx, dy]) => ({ x: cur.x + dx * 2, y: cur.y + dy * 2 })).filter(
      (c) => c.x > 0 && c.y > 0 && c.x < N - 1 && c.y < N - 1 && !isRoom(c.x, c.y) && !seen.has(`${c.x},${c.y}`),
    );
    if (next.length === 0) {
      stack.pop();
      continue;
    }
    const pick = next[Math.floor(rand() * next.length)];
    g[(cur.y + pick.y) / 2][(cur.x + pick.x) / 2] = '.';
    g[pick.y][pick.x] = '.';
    seen.add(`${pick.x},${pick.y}`);
    stack.push(pick);
  }
  for (let y = 1; y <= 3; y++) for (let x = 7; x <= 9; x++) g[y][x] = '.';
  g[DOOR.y][DOOR.x] = '.';
  g[N - 1][SPAWN.x] = '.'; // 입구

  // 문과 방을 빼고 입구에서의 거리
  const outside = (x: number, y: number) => open(x, y) && !isRoom(x, y) && !(x === DOOR.x && y === DOOR.y) && y < N - 1;
  const fromSpawn = bfs(outside, SPAWN);
  const dead: Point[] = [];
  for (let y = 1; y < N - 1; y += 2) {
    for (let x = 1; x < N - 1; x += 2) {
      if (!outside(x, y) || (x === SPAWN.x && y === SPAWN.y) || (x === DOOR.x && y === DOOR.y + 1)) continue;
      const exits = DIRS.filter(([dx, dy]) => outside(x + dx, y + dy)).length;
      if (exits === 1) dead.push({ x, y });
    }
  }
  const distOf = (m: Map<string, number>, p: Point) => m.get(`${p.x},${p.y}`) ?? -1;
  dead.sort((a, b) => distOf(fromSpawn.dist, b) - distOf(fromSpawn.dist, a));
  const key = dead[0];
  const fromKey = bfs(outside, key);
  const rest = dead.slice(1);
  rest.sort(
    (a, b) =>
      Math.min(distOf(fromSpawn.dist, b), distOf(fromKey.dist, b)) - Math.min(distOf(fromSpawn.dist, a), distOf(fromKey.dist, a)),
  );
  const chest2 = rest[0];
  const chest3 = rest.find((p) => p !== chest2 && Math.abs(p.x - chest2.x) + Math.abs(p.y - chest2.y) > 4) ?? rest[1];

  const toKey = pathTo(fromSpawn.prev, SPAWN, key);
  const toChest2 = pathTo(fromSpawn.prev, SPAWN, chest2);
  const slime = toKey[Math.floor(toKey.length * 0.6)];
  let bug = toChest2[Math.floor(toChest2.length * 0.5)];
  if (bug.x === slime.x && bug.y === slime.y) bug = toChest2[Math.floor(toChest2.length * 0.7)];

  // 열쇠 가는 길의 갈림길마다 표지판
  const signs: MapObject[] = [];
  for (let i = 1; i < toKey.length - 2 && signs.length < 3; i++) {
    const p = toKey[i];
    const exits = DIRS.filter(([dx, dy]) => outside(p.x + dx, p.y + dy)).length;
    if (exits < 3) continue;
    if ([slime, bug].some((m) => m.x === p.x && m.y === p.y)) continue;
    signs.push({ id: `sign-key-${signs.length + 1}`, type: 'sign', at: p, text: `열쇠 가는 길\n${arrowRuns(toKey.slice(i))}` });
  }

  const startSign = DIRS.map(([dx, dy]) => ({ x: SPAWN.x + dx, y: SPAWN.y + dy })).find((p) => outside(p.x, p.y)) ?? SPAWN;

  // 꽃 바닥 조금(장식)
  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) if (g[y][x] === '.' && !isRoom(x, y) && rand() < 0.12) g[y][x] = ',';
  }

  return {
    id: 'maze',
    name: '표지판 숲 미로',
    theme: 'dungeon',
    chapter: 'ch1',
    rows: g.map((r) => r.join('')),
    legend: { ...BASE_LEGEND },
    spawn: SPAWN,
    fog: true,
    checkpoint: { map: 'maze', at: SPAWN },
    objects: [
      {
        id: 'sign-start',
        type: 'sign',
        at: startSign,
        text: '표지판 숲 미로: 화살표 순서대로 가면 열쇠가 있어요!\n방향키 ↑=↗ →=↘ ↓=↙ ←=↖ (화면을 눌러도 걸어가요)',
      },
      ...signs,
      { id: 'chest-key', type: 'chest', at: key, reward: { xp: 5, items: [{ id: 'forestkey', qty: 1 }] } },
      { id: 'chest-hat', type: 'chest', at: chest2, reward: { xp: 5, items: [{ id: 'leafhat', qty: 1 }] } },
      { id: 'chest-jelly', type: 'chest', at: chest3, reward: { xp: 5, coins: 15, items: [{ id: 'jelly', qty: 1 }] } },
      { id: 'slime-m', type: 'mob', at: slime, mob: 'vineSlime', wander: 1 },
      { id: 'bug-m', type: 'mob', at: bug, mob: 'bugWorm', wander: 1 },
      { id: 'vine-door', type: 'door', at: DOOR, key: 'forestkey' },
      { id: 'sign-door', type: 'sign', at: { x: DOOR.x, y: DOOR.y + 1 }, text: '덩굴 문\n숲 열쇠가 있어야 열려요.' },
      { id: 'guardian', type: 'npc', at: { x: 8, y: 2 }, npc: 'guardian', missions: ['ch1-boss-m1', 'ch1-boss-m2', 'ch1-boss-m3'], when: { notFlag: 'guardian-fixed' } },
      {
        id: 'guardian-fixed',
        type: 'npc',
        at: { x: 8, y: 2 },
        npc: 'guardian',
        sprite: 'boss-forest-guardian',
        frame: 3,
        missions: ['ch1-boss-m1', 'ch1-boss-m2', 'ch1-boss-m3'],
        talk: ['숲이 다시 조용해졌어요.', '코딩 마을에도 가 봐요. 무언가 달라졌을 거예요.'],
        when: { flag: 'guardian-fixed' },
      },
      { id: 'to-forest', type: 'portal', at: { x: SPAWN.x, y: N - 1 }, to: { map: 'forest', at: { x: 13, y: 4 } }, label: '순서의 숲' },
      {
        id: 'to-village',
        type: 'portal',
        at: { x: 7, y: 1 },
        to: { map: 'village', at: { x: 12, y: 14 } },
        label: '코딩 마을',
        when: { flag: 'ch1-clear' },
      },
    ],
  };
}

export const maze = buildMaze();
