import Phaser from 'phaser';
import { initIcons } from '../../ui/icons';
import { ASSETS, ASSET_BY_KEY, type Manifest } from '../assets';
import { makePlaceholders } from '../textures/placeholders';

const ATLAS_KEY = 'elai-atlas';

/** 매니페스트의 그림을 읽고, 없는 그림은 임시 그림으로 채운 뒤 다음 장면으로 가요. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const label = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '섬으로 가는 중… 0%', { fontFamily: 'Jua, sans-serif', fontSize: '22px', color: '#f6f2e7' })
      .setOrigin(0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => label.setText(`섬으로 가는 중… ${Math.round(p * 100)}%`));

    void this.loadManifest().then((manifest) => {
      if (manifest?.atlas) {
        // 한 장으로 묶은 그림: 키마다 가로 띠를 잘라 스프라이트 시트로 만들어요.
        this.load.atlas(ATLAS_KEY, `assets/${manifest.atlas.image}`, `assets/${manifest.atlas.data}`);
        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
          const atlas = this.textures.exists(ATLAS_KEY) ? this.textures.get(ATLAS_KEY) : null;
          for (const spec of ASSETS) {
            if (!atlas?.has(spec.key) || this.textures.exists(spec.key)) continue;
            this.textures.addSpriteSheetFromAtlas(spec.key, { atlas: ATLAS_KEY, frame: spec.key, frameWidth: spec.w, frameHeight: spec.h });
          }
          this.finish();
        });
        this.load.start();
        return;
      }
      const entries = manifest?.assets.filter((e) => ASSET_BY_KEY.has(e.key)) ?? [];
      if (entries.length === 0) {
        this.finish();
        return;
      }
      for (const e of entries) {
        const spec = ASSET_BY_KEY.get(e.key)!;
        // 프레임이 하나여도 spritesheet로 읽어서 어디서나 프레임 0을 쓸 수 있게 해요.
        this.load.spritesheet(e.key, `assets/${e.file}`, { frameWidth: spec.w, frameHeight: spec.h });
      }
      this.load.once(Phaser.Loader.Events.COMPLETE, () => this.finish());
      this.load.start();
    });
  }

  private async loadManifest(): Promise<Manifest | null> {
    try {
      const res = await fetch('assets/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return null;
      const data = (await res.json()) as Manifest;
      return Array.isArray(data.assets) ? data : null;
    } catch {
      // 아직 그림이 없으면(개발 서버가 index.html을 돌려주는 경우 포함) 임시 그림만 써요.
      return null;
    }
  }

  private finish(): void {
    makePlaceholders(this);
    initIcons(this.textures);
    const next = new URLSearchParams(location.search).has('gallery') ? 'Gallery' : 'Title';
    this.scene.start(next);
  }
}
