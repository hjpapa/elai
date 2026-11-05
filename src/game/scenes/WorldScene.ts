import Phaser from 'phaser';
import { MAPS } from '../../data/maps';
import { NPCS } from '../../data/npcs';
import { ITEMS } from '../../data/rpg/items';
import { MOBS } from '../../data/rpg/mobs';
import { ROBI_PARTS } from '../../data/rpg/robiParts';
import type { MapDef, MapObject, Point } from '../../data/schema';
import { playMusic, playSfx } from '../../fx/sfx';
import { runBattle } from '../../missions/battle/runBattle';
import { flushSave, requestSave } from '../../services/save';
import { icon } from '../../ui/icons';
import { showResult } from '../../ui/rewards';
import { app } from '../app';
import { ASSET_BY_KEY, originOf } from '../assets';
import { Actor } from '../iso/actor';
import { isoToScreen, screenToIso } from '../iso/iso';
import {
  BLOCK_TEXTURE,
  TILE_TEXTURE,
  baseWalkable,
  buildCells,
  findPath,
  objFlag,
  objectSolid,
  objectVisible,
  type Cell,
} from '../iso/mapRuntime';
import { canStart } from '../rpg/progress';

export interface WorldData {
  map?: string;
  at?: Point;
}

interface View {
  obj: MapObject;
  actor?: Actor;
  image?: Phaser.GameObjects.Image;
  home: Point;
  talkIndex: number;
}

const WALK_TYPES = new Set(['portal', 'pickup', 'sign']);
/**
 * 방향키 → 칸 방향. 키가 가리키는 화면 방향 그대로 움직여요(아이소라서 화면 위쪽 = 칸의 (-1, -1)).
 * 두 키를 함께 누르면 대각선(↗↘↙↖)으로 가요. 좁은 길에서 막히면 keyStep이 길을 따라 옆으로 미끄러져요.
 */
const KEY_DIRS: { keys: string[]; d: [number, number] }[] = [
  { keys: ['ArrowUp', 'Up', 'KeyW', 'w'], d: [-1, -1] },
  { keys: ['ArrowRight', 'Right', 'KeyD', 'd'], d: [1, -1] },
  { keys: ['ArrowDown', 'Down', 'KeyS', 's'], d: [1, 1] },
  { keys: ['ArrowLeft', 'Left', 'KeyA', 'a'], d: [-1, 1] },
];
/** 두 키를 "함께" 누를 때 손가락이 조금 어긋나도 한 번에 대각선으로 가도록 첫 걸음을 이만큼 기다려요(ms). */
const CHORD_MS = 60;
const ACTION_KEYS = new Set(['Space', ' ', 'Enter', 'KeyE', 'e']);

/** 아이소 월드: 맵 그리기, 걷기·길찾기, 오브젝트와 상호작용, 안개, 몹 돌아다니기 */
export class WorldScene extends Phaser.Scene {
  private def!: MapDef;
  private cells!: Cell[][];
  private player!: Actor;
  private robi: Actor | null = null;
  private views: View[] = [];
  /** 칸마다 그 칸에 그려진 바닥·블록·소품 그림(안개용) */
  private artAt = new Map<string, Phaser.GameObjects.Image[]>();
  private water: Phaser.GameObjects.Image[] = [];
  private visited!: Uint8Array;
  private walking = false;
  private interrupted = false;
  private lastStep = 0;
  private graceUntil = 0;
  private dirty = true;
  private offState: (() => void) | null = null;
  /** 눌려 있는 키(event.code와 event.key를 함께 기록) */
  private pressed = new Set<string>();
  /** 첫 걸음을 기다리는 동안 눌린 키(그사이 손을 떼도 한 칸은 가요) */
  private tapKeys = new Set<string>();
  private tapPending = false;
  /** 앞서 미끄러져 간 쪽(같은 길을 계속 따라가게) */
  private lastSlide: [number, number] | null = null;

  constructor() {
    super('World');
  }

  create(data: WorldData): void {
    const s = app.state;
    const mapId = data.map && MAPS[data.map] ? data.map : MAPS[s.data.location.map] ? s.data.location.map : 'village';
    this.def = MAPS[mapId];
    this.cells = buildCells(this.def);
    this.views = [];
    this.artAt = new Map();
    this.water = [];
    this.robi = null;
    this.walking = false;

    const w = this.def.rows[0].length;
    const hgt = this.def.rows.length;
    const saved = s.data.visited[mapId];
    this.visited = new Uint8Array(w * hgt);
    if (saved) for (let i = 0; i < saved.length && i < this.visited.length; i++) this.visited[i] = saved[i] === '1' ? 1 : 0;

    this.drawTiles();
    for (const obj of this.def.objects) this.views.push(this.makeView(obj));

    let at = data.at ?? (s.data.location.map === mapId ? { x: s.data.location.x, y: s.data.location.y } : this.def.spawn);
    if (!this.passable(at.x, at.y)) at = this.def.spawn;
    this.player = new Actor(this, 'char-player', at.x, at.y, this.playerOverlays());
    s.setLocation(mapId, at.x, at.y);

    const cam = this.cameras.main;
    cam.setBackgroundColor(this.def.theme === 'observatory' ? '#293044' : this.def.theme === 'lab' ? '#344d78' : this.def.theme === 'harbor' ? '#344d78' : this.def.theme === 'desert' ? '#684b3f' : this.def.theme === 'cave' ? '#0d101c' : this.def.theme === 'dungeon' ? '#10161a' : '#1b1f2a');
    cam.setRoundPixels(true);
    this.fitZoom();
    cam.startFollow(this.player.sprite, true, 0.2, 0.2);
    cam.fadeIn(250);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitZoom, this);

    this.pressed.clear();
    this.tapKeys.clear();
    this.tapPending = false;
    this.lastSlide = null;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => void this.onPointer(p));

    this.time.addEvent({ delay: 700, loop: true, callback: () => this.animateTiles() });
    this.time.addEvent({ delay: 1300, loop: true, callback: () => this.wanderMobs() });
    this.offState = s.on((e) => {
      if (e.type === 'change') this.dirty = true;
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.offState?.();
      this.scale.off(Phaser.Scale.Events.RESIZE, this.fitZoom, this);
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
      window.removeEventListener('blur', this.onBlur);
    });

    playMusic(this.def.theme === 'observatory' ? 'village' : this.def.theme === 'lab' ? 'village' : this.def.theme === 'harbor' ? 'village' : this.def.theme === 'desert' ? 'forest' : this.def.theme === 'cave' ? 'dungeon' : this.def.theme === 'dungeon' ? 'dungeon' : this.def.theme === 'forest' ? 'forest' : 'village');
    this.faded = [];
    this.reveal(at.x, at.y);
    this.updateOcclusion();
    this.refresh();
    app.hud.refresh();
    app.ui.toast(this.def.name, icon('icon-book'), 1600);
  }

  // ── 그리기 ──
  private fitZoom(): void {
    const zoom = Phaser.Math.Clamp(Math.floor(Math.min(this.scale.width / 400, this.scale.height / 240)), 2, 6);
    this.cameras.main.setZoom(zoom);
  }

  private originFor(key: string): { x: number; y: number } {
    const spec = ASSET_BY_KEY.get(key);
    return spec ? originOf(spec) : { x: 0.5, y: 0.9 };
  }

  private drawTiles(): void {
    this.cells.forEach((row, y) =>
      row.forEach((cell, x) => {
        const art: Phaser.GameObjects.Image[] = [];
        const p = isoToScreen(x, y);
        const tex = TILE_TEXTURE[cell.kind];
        if (tex) {
          const img = this.add.image(p.x, p.y, tex, 0).setDepth(-100000 + p.y);
          art.push(img);
          if (cell.kind === 'water') this.water.push(img);
        }
        const block = BLOCK_TEXTURE[cell.kind];
        if (block) {
          const o = this.originFor(block);
          art.push(this.add.image(p.x, p.y, block, 0).setOrigin(o.x, o.y).setDepth((x + y) * 10 + 5));
        }
        if (cell.glyph) {
          const o = this.originFor(cell.glyph.sprite);
          art.push(this.add.image(p.x, p.y, cell.glyph.sprite, 0).setOrigin(o.x, o.y).setDepth((x + y) * 10 + 5));
        }
        this.artAt.set(`${x},${y}`, art);
      }),
    );
  }

  private makeView(obj: MapObject): View {
    const v: View = { obj, home: { ...obj.at }, talkIndex: 0 };
    const p = isoToScreen(obj.at.x, obj.at.y);
    const image = (key: string, frame = 0) => {
      const o = this.originFor(key);
      return this.add.image(p.x, p.y, key, frame).setOrigin(o.x, o.y).setDepth((obj.at.x + obj.at.y) * 10 + 5);
    };
    switch (obj.type) {
      case 'npc': {
        const sprite = obj.sprite ?? NPCS[obj.npc]?.sprite ?? 'char-elder';
        v.actor = new Actor(this, sprite, obj.at.x, obj.at.y, [], sprite.startsWith('char-') ? 'char' : 'mob');
        if (obj.frame !== undefined) v.actor.frameOverride = obj.frame;
        break;
      }
      case 'mob':
        v.actor = new Actor(this, MOBS[obj.mob].sprite, obj.at.x, obj.at.y, [], 'mob');
        break;
      case 'chest':
        v.image = image('prop-chest');
        break;
      case 'door':
        v.image = image('prop-door');
        break;
      case 'pickup':
        v.image = image(ITEMS[obj.item]?.kind === 'quest' ? 'prop-key' : (ITEMS[obj.item]?.icon ?? 'prop-key'));
        break;
      case 'sign':
        v.image = image('prop-sign');
        break;
      case 'portal':
        v.image = image(obj.sprite ?? 'prop-portal');
        break;
      case 'prop':
        v.image = image(obj.sprite, obj.frame ?? 0);
        break;
    }
    return v;
  }

  private playerOverlays(): string[] {
    const d = app.state.data;
    return (['hat', 'tool'] as const).flatMap((slot) => {
      const id = d.equipment[slot];
      const o = id ? ITEMS[id]?.overlay : undefined;
      return o ? [o] : [];
    });
  }

  private robiOverlays(): string[] {
    return app.state.data.robiParts.flatMap((id) => {
      const o = ROBI_PARTS[id]?.overlay;
      return o && this.textures.exists(o) ? [o] : [];
    });
  }

  private revealed(x: number, y: number): boolean {
    return !this.def.fog || this.visited[y * this.def.rows[0].length + x] === 1;
  }

  /** 상태가 바뀐 뒤 그림 맞추기(문 열림, 상자, 조건부 오브젝트, 장비, 로비) */
  private refresh(): void {
    const s = app.state;
    const q = { check: (c: Parameters<typeof s.check>[0]) => s.check(c), hasFlag: (n: string) => s.hasFlag(n) };
    for (const v of this.views) {
      const o = v.obj;
      const pos = v.actor ? v.actor.tile : o.at;
      const show = objectVisible(this.def.id, o, q) && this.revealed(pos.x, pos.y);
      v.actor?.setVisible(show);
      v.image?.setVisible(show);
      if (o.type === 'chest') v.image?.setFrame(s.hasFlag(objFlag.chest(this.def.id, o.id)) ? 1 : 0);
      if (o.type === 'door') v.image?.setFrame(s.hasFlag(objFlag.door(this.def.id, o.id)) ? 1 : 0);
      if (o.type === 'portal' && o.sprite) v.image?.setFrame(s.check(o.open) ? 1 : 0);
      if (o.type === 'mob' && v.actor) {
        v.actor.frameOverride = s.hasFlag(objFlag.mob(this.def.id, o.id)) ? 3 : null;
        v.actor.sync();
      }
    }
    this.player.setOverlays(this.playerOverlays());
    const joined = s.missionDone('ch0-m3');
    if (joined && !this.robi) {
      const t = this.player.tile;
      const spot = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ].find(([dx, dy]) => baseWalkable(this.cells, t.x + dx, t.y + dy)) ?? [0, 0];
      this.robi = new Actor(this, 'char-robi', t.x + spot[0], t.y + spot[1], this.robiOverlays());
    }
    this.robi?.setOverlays(this.robiOverlays());
    const map = this.def.fog && s.helpers.flowMap ? this.def : null;
    app.hud.drawMinimap(map, Array.from(this.visited).join(''), this.player.tile);
    this.dirty = false;
  }

  private animateTiles(): void {
    for (const img of this.water) img.setFrame(img.frame.name === '0' ? 1 : 0);
    for (const v of this.views) {
      if (v.obj.type === 'portal' && !v.obj.sprite && v.image) v.image.setFrame(v.image.frame.name === '0' ? 1 : 0);
    }
  }

  // ── 가림 ──
  private faded: Phaser.GameObjects.Image[] = [];

  /** 플레이어 바로 앞(화면 아래쪽)의 키 큰 나무·벽은 반투명하게 해서 플레이어가 가려지지 않게 해요. */
  private updateOcclusion(): void {
    for (const img of this.faded) img.setAlpha(1);
    this.faded = [];
    const { x: px, y: py } = this.player.tile;
    for (let ty = py - 1; ty <= py + 3; ty++) {
      for (let tx = px - 1; tx <= px + 3; tx++) {
        if (tx + ty <= px + py) continue;
        for (const img of this.artAt.get(`${tx},${ty}`) ?? []) {
          if (img.depth < 0) continue; // 바닥 타일은 그대로
          img.setAlpha(0.45);
          this.faded.push(img);
        }
      }
    }
  }

  // ── 안개 ──
  private reveal(cx: number, cy: number): void {
    if (!this.def.fog) return;
    const w = this.def.rows[0].length;
    let changed = false;
    for (let y = cy - 2; y <= cy + 2; y++) {
      for (let x = cx - 2; x <= cx + 2; x++) {
        if (x < 0 || y < 0 || x >= w || y >= this.def.rows.length) continue;
        const i = y * w + x;
        if (this.visited[i]) continue;
        this.visited[i] = 1;
        changed = true;
      }
    }
    for (const [k, art] of this.artAt) {
      const [x, y] = k.split(',').map(Number);
      const on = this.visited[y * w + x] === 1;
      for (const a of art) a.setVisible(on);
    }
    if (changed) {
      app.state.data.visited[this.def.id] = Array.from(this.visited).join('');
      requestSave();
      this.dirty = true;
    }
  }

  // ── 통행 ──
  private solidAt(x: number, y: number): View | undefined {
    const s = app.state;
    const q = { check: (c: Parameters<typeof s.check>[0]) => s.check(c), hasFlag: (n: string) => s.hasFlag(n) };
    return this.views.find((v) => {
      const t = v.actor ? v.actor.tile : v.obj.at;
      return t.x === x && t.y === y && objectSolid(this.def.id, v.obj, q);
    });
  }

  private passable(x: number, y: number): boolean {
    return baseWalkable(this.cells, x, y) && !this.solidAt(x, y);
  }

  private viewAt(x: number, y: number): View | undefined {
    const s = app.state;
    const q = { check: (c: Parameters<typeof s.check>[0]) => s.check(c), hasFlag: (n: string) => s.hasFlag(n) };
    return this.views.find((v) => {
      const t = v.actor ? v.actor.tile : v.obj.at;
      return t.x === x && t.y === y && objectVisible(this.def.id, v.obj, q) && v.obj.type !== 'prop';
    });
  }

  // ── 입력 ──
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    const busy = this.blocked();
    const isMove = KEY_DIRS.some((k) => k.keys.includes(e.code) || k.keys.includes(e.key));
    if (isMove && !app.ui.isBusy()) e.preventDefault();
    this.pressed.add(e.code);
    this.pressed.add(e.key);
    if (isMove && !e.repeat && !busy) {
      // 짧게 한 번 눌러도 한 칸은 움직여요(계속 누르고 있으면 update가 이어서 걸어요).
      // 바로 걷지 않고 CHORD_MS만큼 기다려서, 거의 함께 누른 두 키를 합쳐 대각선으로 가요.
      this.tapKeys.add(e.code);
      this.tapKeys.add(e.key);
      if (!this.tapPending) {
        this.tapPending = true;
        this.time.delayedCall(CHORD_MS, () => {
          this.tapPending = false;
          const [dx, dy] = this.keyDir(this.tapKeys);
          this.tapKeys.clear();
          if ((dx || dy) && !this.blocked()) void this.keyStep(dx, dy);
        });
      }
      return;
    }
    if (!e.repeat && !busy && (ACTION_KEYS.has(e.code) || ACTION_KEYS.has(e.key))) {
      e.preventDefault();
      void this.interactNearby();
    }
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    this.pressed.delete(e.code);
    this.pressed.delete(e.key);
  };

  private readonly onBlur = (): void => {
    this.pressed.clear();
    this.tapKeys.clear();
  };

  /** 눌린 키(와 extra)를 합친 칸 방향. 위+오른쪽이면 (0, -1)처럼 대각선이 돼요. */
  private keyDir(extra?: Set<string>): [number, number] {
    let dx = 0;
    let dy = 0;
    for (const k of KEY_DIRS) {
      if (k.keys.some((name) => this.pressed.has(name) || extra?.has(name))) {
        dx += k.d[0];
        dy += k.d[1];
      }
    }
    return [Math.sign(dx), Math.sign(dy)];
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.robi?.update(delta);
    for (const v of this.views) v.actor?.update(delta);
    if (this.dirty) this.refresh();
    if (this.blocked() || this.tapPending) return;
    const [dx, dy] = this.keyDir();
    if ((dx || dy) && this.time.now - this.lastStep > 60) void this.keyStep(dx, dy);
  }

  /**
   * 방향키 한 걸음. 화면 위·아래·왼쪽·오른쪽은 칸으로는 대각선이라,
   * 막히면 그 방향에 가까운 두 칸 방향 중 갈 수 있는 쪽으로 미끄러져 가요(벽을 따라 걷기).
   */
  private async keyStep(dx: number, dy: number): Promise<void> {
    const t = this.player.tile;
    const can = (ax: number, ay: number) =>
      this.passable(t.x + ax, t.y + ay) && (ax === 0 || ay === 0 || (this.passable(t.x + ax, t.y) && this.passable(t.x, t.y + ay)));
    if (can(dx, dy)) {
      await this.stepTo(t.x + dx, t.y + dy);
      return;
    }
    // 바로 그 칸에 NPC·상자·문·몹이 있으면 그쪽과 상호작용해요.
    const target = this.viewAt(t.x + dx, t.y + dy);
    if (target && !WALK_TYPES.has(target.obj.type)) {
      await this.stepTo(t.x + dx, t.y + dy);
      return;
    }
    if (dx !== 0 && dy !== 0) {
      const options: [number, number][] = [
        [dx, 0],
        [0, dy],
      ];
      if (this.lastSlide && this.lastSlide[0] === options[1][0] && this.lastSlide[1] === options[1][1]) options.reverse();
      for (const [ax, ay] of options) {
        if (!this.passable(t.x + ax, t.y + ay)) continue;
        this.lastSlide = [ax, ay];
        await this.stepTo(t.x + ax, t.y + ay);
        return;
      }
    }
    this.player.face(dx, dy);
  }

  private blocked(): boolean {
    return this.walking || app.ui.isBusy() || app.missions.busy || !this.scene.isActive();
  }

  private async onPointer(p: Phaser.Input.Pointer): Promise<void> {
    if (this.blocked()) {
      if (this.walking) this.interrupted = true;
      return;
    }
    const wx = p.worldX;
    const wy = p.worldY;
    // 키가 큰 그림(NPC, 상자)을 눌렀는지 먼저 봐요.
    let target: View | undefined;
    let bestDepth = -Infinity;
    for (const v of this.views) {
      if (v.obj.type === 'prop') continue;
      const img = v.actor?.sprite ?? v.image;
      if (!img?.visible) continue;
      if (img.getBounds().contains(wx, wy) && img.depth > bestDepth) {
        target = v;
        bestDepth = img.depth;
      }
    }
    const tile = screenToIso(wx, wy);
    target ??= this.viewAt(tile.x, tile.y);
    await this.walkToward(target ? (target.actor ? target.actor.tile : target.obj.at) : tile, target);
  }

  private async walkToward(goal: Point, target?: View): Promise<void> {
    const from = this.player.tile;
    const walkOn = !target || WALK_TYPES.has(target.obj.type);
    const near = (x: number, y: number) => Math.max(Math.abs(x - goal.x), Math.abs(y - goal.y)) <= 1 && !(x === goal.x && y === goal.y);
    if (!walkOn && near(from.x, from.y)) return this.interact(target!);
    const pass = (x: number, y: number) => this.passable(x, y) || (walkOn && x === goal.x && y === goal.y && baseWalkable(this.cells, x, y));
    const path = findPath(pass, from, walkOn ? (x, y) => x === goal.x && y === goal.y : near, goal);
    if (!path) {
      if (target) this.player.face(goal.x - from.x, goal.y - from.y);
      return;
    }
    this.interrupted = false;
    for (const step of path.slice(1)) {
      if (this.interrupted) break;
      const ok = await this.stepTo(step.x, step.y, true);
      if (!ok) return;
    }
    if (target && !this.interrupted && !walkOn) await this.interact(target);
  }

  /** 한 칸 걷기. 걸은 뒤 밟은 것·옆의 몹을 처리해요. 계속 걸어도 되면 true */
  private async stepTo(x: number, y: number, fromPath = false): Promise<boolean> {
    const from = this.player.tile;
    const dx = x - from.x;
    const dy = y - from.y;
    if (!this.passable(x, y)) {
      // 막힌 칸: NPC·상자·문·몹이면 그쪽을 보고 상호작용해요.
      this.player.face(dx, dy);
      const v = this.viewAt(x, y);
      if (v && !fromPath) await this.interact(v);
      return false;
    }
    if (dx !== 0 && dy !== 0 && !(this.passable(from.x + dx, from.y) && this.passable(from.x, from.y + dy))) return false;
    this.walking = true;
    this.lastStep = this.time.now;
    const robiTarget = { ...from };
    if (this.robi) void this.robi.moveTo(robiTarget.x, robiTarget.y, 170).then(() => this.robi?.stopWalking());
    await this.player.moveTo(x, y, dx !== 0 && dy !== 0 ? 190 : 150);
    this.walking = false;
    const keepMoving = this.anyMoveKey() || fromPath;
    if (!keepMoving) this.player.stopWalking();
    app.state.data.location = { map: this.def.id, x, y };
    requestSave();
    this.reveal(x, y);
    this.updateOcclusion();
    return this.afterStep(x, y);
  }

  private anyMoveKey(): boolean {
    const [dx, dy] = this.keyDir();
    return dx !== 0 || dy !== 0;
  }

  private async afterStep(x: number, y: number): Promise<boolean> {
    const here = this.viewAt(x, y);
    if (here && WALK_TYPES.has(here.obj.type)) {
      this.player.stopWalking();
      await this.interact(here);
      if (here.obj.type === 'portal') return false;
    }
    if (this.time.now < this.graceUntil) return true;
    const mob = this.views.find((v) => {
      if (v.obj.type !== 'mob' || !v.actor?.sprite.visible) return false;
      if (app.state.hasFlag(objFlag.mob(this.def.id, v.obj.id))) return false;
      const t = v.actor.tile;
      return Math.max(Math.abs(t.x - x), Math.abs(t.y - y)) <= 1;
    });
    if (mob) {
      this.player.stopWalking();
      await this.fightMob(mob);
      return false;
    }
    return true;
  }

  private async interactNearby(): Promise<void> {
    const t = this.player.tile;
    const f = this.player.facing;
    // 바라보는 쪽 칸을 먼저, 그다음 둘레 8칸
    const ahead = { x: t.x + (f.back ? (f.flip ? -1 : 0) : f.flip ? 0 : 1), y: t.y + (f.back ? (f.flip ? 0 : -1) : f.flip ? 1 : 0) };
    const cands = [ahead];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) cands.push({ x: t.x + dx, y: t.y + dy });
    for (const c of cands) {
      const v = this.viewAt(c.x, c.y);
      if (v) return this.interact(v);
    }
  }

  // ── 상호작용 ──
  private async interact(v: View): Promise<void> {
    const t = this.player.tile;
    const at = v.actor ? v.actor.tile : v.obj.at;
    this.player.face(at.x - t.x, at.y - t.y);
    this.player.stopWalking();
    const o = v.obj;
    switch (o.type) {
      case 'npc':
        return this.talk(v);
      case 'chest':
        return this.openChest(v);
      case 'door':
        return this.openDoor(v);
      case 'sign':
        return app.ui.dialogue([{ who: 'sign', text: o.text }]);
      case 'mob':
        return this.fightMob(v);
      case 'portal':
        return this.usePortal(v);
      case 'pickup':
        return this.pickUp(v);
      default:
        return;
    }
  }

  private async talk(v: View): Promise<void> {
    if (v.obj.type !== 'npc') return;
    const s = app.state;
    const o = v.obj;
    const ids = o.missions ?? [];
    const next = ids.find((id) => !s.missionDone(id));
    if (next) {
      if (canStart(s, next)) {
        await app.missions.run(next);
        this.dirty = true;
        app.hud.refresh();
      } else {
        await app.ui.dialogue([{ who: o.npc, text: '지금은 다른 일을 먼저 끝내고 와요.\n화면 아래 목표를 확인해 봐요!' }]);
      }
      return;
    }
    const lines = o.talk?.length ? o.talk : ['고마워요, 탐험가!'];
    await app.ui.dialogue([{ who: o.npc, text: lines[v.talkIndex % lines.length] }]);
    v.talkIndex++;
    const replay = ids.find((id) => (s.data.missions[id]?.stars ?? 0) < 3 && canStart(s, id));
    if (replay && (await app.ui.confirm('별을 더 받으러 미션을 다시 해 볼까요?', '다시 하기', '괜찮아요'))) {
      await app.missions.run(replay);
      this.dirty = true;
    }
  }

  private async openChest(v: View): Promise<void> {
    if (v.obj.type !== 'chest') return;
    const s = app.state;
    const flag = objFlag.chest(this.def.id, v.obj.id);
    if (s.hasFlag(flag)) {
      app.ui.toast('빈 상자예요.');
      return;
    }
    s.setFlag(flag);
    v.image?.setFrame(1);
    playSfx('open');
    const reward = s.applyReward(v.obj.reward);
    await showResult({ title: '보물상자!', success: true, reward });
  }

  private async openDoor(v: View): Promise<void> {
    if (v.obj.type !== 'door') return;
    const s = app.state;
    const flag = objFlag.door(this.def.id, v.obj.id);
    if (s.hasFlag(flag)) return;
    if (s.itemQty(v.obj.key) > 0) {
      s.setFlag(flag);
      v.image?.setFrame(1);
      playSfx('open');
      app.ui.toast(`${ITEMS[v.obj.key]?.name ?? '열쇠'}로 문을 열었어요!`, icon(ITEMS[v.obj.key]?.icon ?? 'icon-lock'));
    } else {
      await app.ui.dialogue([{ who: 'sign', text: `잠겨 있어요.\n${ITEMS[v.obj.key]?.name ?? '열쇠'}가 필요해요.` }]);
    }
  }

  private async pickUp(v: View): Promise<void> {
    if (v.obj.type !== 'pickup') return;
    const s = app.state;
    s.setFlag(objFlag.pickup(this.def.id, v.obj.id));
    s.addItem(v.obj.item);
    v.image?.setVisible(false);
    playSfx('item');
    app.ui.toast(`${ITEMS[v.obj.item]?.name}을(를) 주웠어요!`, icon(ITEMS[v.obj.item]?.icon ?? ''));
  }

  private async usePortal(v: View): Promise<void> {
    if (v.obj.type !== 'portal') return;
    if (!app.state.check(v.obj.open)) {
      app.ui.toast(v.obj.lockedText ?? '아직 갈 수 없어요.', icon('icon-lock'), 3200);
      return;
    }
    this.goTo(v.obj.to.map, v.obj.to.at);
  }

  private goTo(map: string, at: Point): void {
    app.state.setLocation(map, at.x, at.y);
    flushSave();
    this.walking = true;
    this.cameras.main.fadeOut(220);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ map, at }));
  }

  private async fightMob(v: View): Promise<void> {
    if (v.obj.type !== 'mob') return;
    const s = app.state;
    const mob = MOBS[v.obj.mob];
    if (s.hasFlag(objFlag.mob(this.def.id, v.obj.id))) {
      await app.ui.dialogue([{ who: 'robi', text: `${mob.name}: "${mob.purified}"` }]);
      return;
    }
    const report = await runBattle(v.obj.mob, {
      canFlee: true,
      floor: this.def.theme === 'workshop' ? 'tile-wood' : this.def.theme === 'observatory' ? 'tile-observatory' : this.def.theme === 'lab' ? 'tile-lab' : this.def.theme === 'harbor' ? 'tile-dock' : this.def.theme === 'desert' ? 'tile-sand' : this.def.theme === 'cave' ? 'tile-cave' : this.def.theme === 'dungeon' ? 'tile-stone' : 'tile-grass',
      prefill: mob.prefill,
      intro: mob.prefill ? `${mob.name}가 카드 순서를 뒤섞어 놓았어요!\n틀린 카드를 찾아 고쳐요.` : undefined,
    });
    if (report.outcome === 'win') {
      s.setFlag(objFlag.mob(this.def.id, v.obj.id));
      const drops = (mob.drops ?? []).filter((d) => Math.random() < d.chance).map((d) => ({ id: d.item, qty: 1 }));
      const reward = s.applyReward({ xp: mob.xp, coins: mob.coins, items: drops });
      this.dirty = true;
      await showResult({ title: '정화 성공!', success: true, message: `${mob.name}: "${mob.purified}"`, reward });
    } else if (report.outcome === 'flee') {
      this.graceUntil = this.time.now + 4000;
      app.ui.toast('살짝 물러났어요. 준비되면 다시 다가가요.');
    } else {
      app.ui.toast('쓰러졌어요! 로비가 입구로 데려가 치료해 줬어요.', icon('char-robi', 0), 3200);
      const cp = this.def.checkpoint ?? { map: this.def.id, at: this.def.spawn };
      this.goTo(cp.map, cp.at);
    }
  }

  /** 몹은 집 둘레를 천천히 돌아다녀요. 플레이어 바로 옆으로는 오지 않아요(싸움은 플레이어가 골라요). */
  private wanderMobs(): void {
    if (this.blocked()) return;
    const p = this.player.tile;
    for (const v of this.views) {
      if (v.obj.type !== 'mob' || !v.actor || Math.random() > 0.4) continue;
      if (app.state.hasFlag(objFlag.mob(this.def.id, v.obj.id))) continue;
      const radius = v.obj.wander ?? 1;
      const t = v.actor.tile;
      const dirs: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const nx = t.x + dx;
      const ny = t.y + dy;
      if (Math.abs(nx - v.home.x) > radius || Math.abs(ny - v.home.y) > radius) continue;
      if (Math.max(Math.abs(nx - p.x), Math.abs(ny - p.y)) <= 1) continue;
      if (!this.passable(nx, ny) || this.viewAt(nx, ny)) continue;
      void v.actor.moveTo(nx, ny, 320).then(() => {
        v.actor?.setVisible(this.revealed(nx, ny));
      });
    }
  }
}
