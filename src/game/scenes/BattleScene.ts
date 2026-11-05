import Phaser from 'phaser';
import type { BattleCmd, MobAction, MobDef, SaveData } from '../../data/schema';
import { ITEMS } from '../../data/rpg/items';
import { ROBI_PARTS } from '../../data/rpg/robiParts';
import { ASSET_BY_KEY, MOB_FRAMES, originOf } from '../assets';
import { isoToScreen } from '../iso/iso';

export interface BattleSceneData {
  mob: MobDef;
  save: SaveData;
  floor: 'tile-grass' | 'tile-stone' | 'tile-wood' | 'tile-cave' | 'tile-sand' | 'tile-dock' | 'tile-lab';
}

const wait = (scene: Phaser.Scene, ms: number) => new Promise<void>((r) => scene.time.delayedCall(ms, r));

/** 전투 연출만 맡아요(계산은 battle/sim.ts). 아이소 경기장 위에 플레이어·로비와 몹이 마주 서요. */
export class BattleScene extends Phaser.Scene {
  private hero: Phaser.GameObjects.Image[] = [];
  private robi: Phaser.GameObjects.Image[] = [];
  private mob!: Phaser.GameObjects.Sprite;
  private mobDef!: MobDef;
  private heroPos = { x: 0, y: 0 };
  private mobPos = { x: 0, y: 0 };

  constructor() {
    super('Battle');
  }

  create(data: BattleSceneData): void {
    this.mobDef = data.mob;
    const cam = this.cameras.main;
    cam.setBackgroundColor('#1b1f2a');
    // 위 막대(약 70px)와 아래 카드 패널(약 340px) 사이의 빈 곳에 경기장을 놓아요.
    const { width, height } = this.scale;
    const avail = Math.max(120, height - 340);
    const zoom = Phaser.Math.Clamp(Math.floor(Math.min(width / 230, avail / 110)), 2, 5);
    cam.setZoom(zoom);
    const targetY = 70 + avail / 2;
    cam.centerOn(0, 36 + (height / 2 - targetY) / zoom);

    for (let y = -1; y <= 5; y++) {
      for (let x = -1; x <= 5; x++) {
        const p = isoToScreen(x, y);
        const edge = x < 0 || y < 0 || x > 4 || y > 4;
        this.add.image(p.x, p.y, data.floor, 0).setDepth(-1000 + p.y).setAlpha(edge ? 0.35 : 1);
      }
    }
    // 플레이어는 왼쪽 아래, 몹은 오른쪽 위에 서요.
    this.heroPos = isoToScreen(1, 3);
    this.mobPos = isoToScreen(3, 1);
    const robiPos = isoToScreen(0, 3);

    const stand = (key: string, pos: { x: number; y: number }, frame = 0, flip = false) => {
      const spec = ASSET_BY_KEY.get(key);
      const o = spec ? originOf(spec) : { x: 0.5, y: 0.9 };
      return this.add.image(pos.x, pos.y, key, frame).setOrigin(o.x, o.y).setFlipX(flip).setDepth(pos.y + 10);
    };
    this.hero = [stand('char-player', this.heroPos, 0)];
    for (const slot of ['hat', 'tool'] as const) {
      const overlay = data.save.equipment[slot] ? ITEMS[data.save.equipment[slot]!]?.overlay : undefined;
      if (overlay) this.hero.push(stand(overlay, this.heroPos, 0).setDepth(this.heroPos.y + 11));
    }
    this.robi = [stand('char-robi', robiPos, 0)];
    for (const id of data.save.robiParts) {
      const overlay = ROBI_PARTS[id]?.overlay;
      if (overlay && this.textures.exists(overlay)) this.robi.push(stand(overlay, robiPos, 0).setDepth(robiPos.y + 11));
    }
    const mobSpec = ASSET_BY_KEY.get(data.mob.sprite);
    const mo = mobSpec ? originOf(mobSpec) : { x: 0.5, y: 0.9 };
    this.mob = this.add.sprite(this.mobPos.x, this.mobPos.y, data.mob.sprite, 0).setOrigin(mo.x, mo.y).setDepth(this.mobPos.y + 10);
    const animKey = `${data.mob.sprite}-idle`;
    if (!this.anims.exists(animKey)) {
      this.anims.create({ key: animKey, frames: MOB_FRAMES.idle.map((f) => ({ key: data.mob.sprite, frame: f })), frameRate: 2, repeat: -1 });
    }
    this.mob.play(animKey);
  }

  private get reducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private celebrate(x: number, y: number): void {
    for (let i = 0; i < 7; i++) {
      const angle = i * Math.PI * 2 / 7;
      const star = this.add.image(x + Math.cos(angle) * 9, y + Math.sin(angle) * 7, 'fx-sparkle', i % 4).setDepth(5001);
      this.tweens.add({ targets: star, x: this.reducedMotion ? star.x : x + Math.cos(angle) * 23,
        y: this.reducedMotion ? star.y : y + Math.sin(angle) * 18, alpha: 0, duration: 320,
        ease: 'Quad.easeOut', onComplete: () => star.destroy() });
    }
  }

  private fx(key: string, x: number, y: number, frames: number): Promise<void> {
    if (!this.textures.exists(key)) return Promise.resolve();
    const img = this.add.image(x, y, key, 0).setDepth(5000);
    if (!this.reducedMotion && key === 'fx-heal') this.tweens.add({ targets: img, y: y - 8, duration: frames * 60 });
    if (!this.reducedMotion && key === 'fx-guard') this.tweens.add({ targets: img, scale: 1.12, duration: 90, yoyo: true });
    return new Promise((resolve) => {
      let f = 0;
      const timer = this.time.addEvent({
        delay: 60,
        repeat: frames - 1,
        callback: () => {
          f++;
          if (f >= frames) {
            timer.remove();
            img.destroy();
            resolve();
          } else img.setFrame(f);
        },
      });
    });
  }

  private recoil(targets: Phaser.GameObjects.GameObject[]): Promise<void> {
    if (this.reducedMotion) return Promise.resolve();
    return new Promise(resolve => this.tweens.add({ targets, x: '+=2', duration: 40,
      yoyo: true, repeat: 1, onComplete: () => resolve() }));
  }

  private lunge(targets: Phaser.GameObjects.GameObject[], dx: number, dy: number): Promise<void> {
    if (this.reducedMotion) return Promise.resolve();
    return new Promise((resolve) =>
      this.tweens.add({ targets, x: `+=${dx}`, y: `+=${dy}`, duration: 110, yoyo: true, ease: 'Quad.easeOut', onComplete: () => resolve() }),
    );
  }

  private floatText(text: string, x: number, y: number, color: string): void {
    const t = this.add
      .text(x, y, text, { fontFamily: 'Jua, sans-serif', fontSize: '10px', color, stroke: '#000000', strokeThickness: 2 })
      .setOrigin(0.5, 1)
      .setDepth(6000)
      .setResolution(4);
    this.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  async playerAct(card: BattleCmd, dealt: number, blocked: boolean, healed: number): Promise<void> {
    const top = this.heroPos.y - 22;
    if (card === 'attack') {
      await this.lunge(this.hero, 10, 0);
      if (blocked) {
        await this.fx('fx-guard', this.mobPos.x, this.mobPos.y - 14, 3);
        this.floatText('막혔어요', this.mobPos.x, this.mobPos.y - 26, '#a8dcff');
      } else {
        this.mob.stop().setFrame(MOB_FRAMES.hit);
        await Promise.all([this.fx('fx-hit', this.mobPos.x, this.mobPos.y - 12, 3), this.recoil([this.mob])]);
        this.floatText(`-${dealt}`, this.mobPos.x, this.mobPos.y - 26, '#ff9a8f');
        this.mob.play(`${this.mobDef.sprite}-idle`);
      }
    } else if (card === 'guard') {
      await this.fx('fx-guard', this.heroPos.x, this.heroPos.y - 12, 3);
    } else if (card === 'heal') {
      await this.fx('fx-heal', this.heroPos.x, top, 4);
      this.floatText(`+${healed}`, this.heroPos.x, top - 6, '#9be79b');
    } else {
      await wait(this, 200);
    }
  }

  async mobAct(action: MobAction, taken: number, guarded: boolean, mobHealed: number): Promise<void> {
    if (action === 'attack' || action === 'smash') {
      await this.lunge([this.mob], -10, 0);
      if (guarded) {
        await this.fx('fx-guard', this.heroPos.x, this.heroPos.y - 12, 3);
        this.floatText('막았어요!', this.heroPos.x, this.heroPos.y - 26, '#a8dcff');
      } else {
        if (!this.reducedMotion) this.cameras.main.shake(action === 'smash' ? 150 : 90, action === 'smash' ? 0.004 : 0.002);
        await Promise.all([this.fx('fx-hit', this.heroPos.x, this.heroPos.y - 12, 3), this.recoil(this.hero)]);
        this.floatText(`-${taken}`, this.heroPos.x, this.heroPos.y - 26, '#ff9a8f');
      }
    } else if (action === 'charge') {
      this.mob.setTint(0xfff1a8);
      await wait(this, 320);
      this.mob.clearTint();
    } else if (action === 'heal') {
      await this.fx('fx-heal', this.mobPos.x, this.mobPos.y - 16, 4);
      if (mobHealed) this.floatText(`+${mobHealed}`, this.mobPos.x, this.mobPos.y - 28, '#9be79b');
    } else if (action === 'guard') {
      await this.fx('fx-guard', this.mobPos.x, this.mobPos.y - 14, 3);
    } else {
      await wait(this, 250);
    }
  }

  async purify(): Promise<void> {
    this.mob.stop().clearTint().setFrame(MOB_FRAMES.purified);
    this.celebrate(this.mobPos.x, this.mobPos.y - 20);
    this.floatText('친구가 됐어요!', this.mobPos.x, this.mobPos.y - 32, '#d6e69a');
    await this.fx('fx-purify', this.mobPos.x, this.mobPos.y - 14, 6);
  }

  async faint(): Promise<void> {
    this.floatText('잠깐 쉬어요', this.heroPos.x, this.heroPos.y - 24, '#c7d6dc');
    await new Promise<void>((r) => this.tweens.add({ targets: this.hero, alpha: 0.65,
      y: this.reducedMotion ? this.heroPos.y : this.heroPos.y + 3, duration: 400, onComplete: () => r() }));
  }
}
