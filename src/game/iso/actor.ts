import Phaser from 'phaser';
import { ASSET_BY_KEY, CHAR_FRAMES, MOB_FRAMES, originOf } from '../assets';
import { fitArt } from '../density';
import { facingOf, isoToScreen } from './iso';

export type ActorKind = 'char' | 'mob' | 'static';

/**
 * 맵 위를 걷는 캐릭터(플레이어·로비·NPC·몹). 몸 그림 위에 모자·도구 같은 겹침 레이어를 같은 프레임으로 얹어요.
 * gx, gy는 칸 좌표(걷는 동안에는 소수).
 */
export class Actor {
  gx: number;
  gy: number;
  facing = { back: false, flip: false };
  private layers: Phaser.GameObjects.Image[] = [];
  private walkTimer = 0;
  private walkStep = 0;
  private walking = false;
  private idleTimer = 0;
  frameOverride: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private baseKey: string,
    x: number,
    y: number,
    private overlays: string[] = [],
    readonly kind: ActorKind = 'char',
  ) {
    this.gx = x;
    this.gy = y;
    this.build();
  }

  private build(): void {
    for (const l of this.layers) l.destroy();
    this.layers = [this.baseKey, ...this.overlays]
      .filter((k) => this.scene.textures.exists(k))
      .map((key) => {
        const spec = ASSET_BY_KEY.get(key);
        const o = spec ? originOf(spec) : { x: 0.5, y: 0.9 };
        return fitArt(this.scene.add.image(0, 0, key, 0).setOrigin(o.x, o.y));
      });
    this.sync();
  }

  get sprite(): Phaser.GameObjects.Image {
    return this.layers[0];
  }

  setOverlays(keys: string[]): void {
    if (keys.join() === this.overlays.join()) return;
    this.overlays = keys;
    this.build();
  }

  setVisible(on: boolean): void {
    for (const l of this.layers) l.setVisible(on);
  }

  setAlpha(a: number): void {
    for (const l of this.layers) l.setAlpha(a);
  }

  placeAt(x: number, y: number): void {
    this.gx = x;
    this.gy = y;
    this.sync();
  }

  get tile(): { x: number; y: number } {
    return { x: Math.round(this.gx), y: Math.round(this.gy) };
  }

  face(dx: number, dy: number): void {
    this.facing = facingOf(dx, dy, this.facing);
    this.sync();
  }

  /** 한 칸 걷기 */
  moveTo(x: number, y: number, ms: number): Promise<void> {
    this.face(x - this.gx, y - this.gy);
    this.walking = true;
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        gx: x,
        gy: y,
        duration: ms,
        onUpdate: () => this.sync(),
        onComplete: () => {
          this.sync();
          resolve();
        },
      });
    });
  }

  stopWalking(): void {
    this.walking = false;
    this.walkStep = 0;
    this.sync();
  }

  /** 걷기·대기 애니메이션 */
  update(delta: number): void {
    if (this.kind === 'char' && this.walking) {
      this.walkTimer += delta;
      if (this.walkTimer > 110) {
        this.walkTimer = 0;
        this.walkStep = (this.walkStep + 1) % 4;
        this.sync();
      }
    } else if (this.kind === 'mob' && this.frameOverride === null) {
      this.idleTimer += delta;
      if (this.idleTimer > 500) {
        this.idleTimer = 0;
        this.walkStep = (this.walkStep + 1) % 2;
        this.sync();
      }
    }
  }

  private frame(): number {
    if (this.frameOverride !== null) return this.frameOverride;
    if (this.kind === 'mob') return MOB_FRAMES.idle[this.walkStep % 2];
    if (this.kind === 'static') return 0;
    if (this.walking) return (this.facing.back ? CHAR_FRAMES.backWalk : CHAR_FRAMES.frontWalk)[this.walkStep];
    return this.facing.back ? CHAR_FRAMES.backIdle : CHAR_FRAMES.frontIdle;
  }

  sync(): void {
    const p = isoToScreen(this.gx, this.gy);
    const f = this.frame();
    const depth = (this.gx + this.gy) * 10 + 5;
    this.layers.forEach((l, i) => {
      l.setPosition(p.x, p.y);
      l.setFlipX(this.kind === 'char' && this.facing.flip);
      const total = l.texture.frameTotal - 1; // __BASE 제외
      l.setFrame(Math.min(f, Math.max(0, total - 1)));
      l.setDepth(depth + i * 0.01);
    });
  }

  destroy(): void {
    for (const l of this.layers) l.destroy();
    this.layers = [];
  }
}
