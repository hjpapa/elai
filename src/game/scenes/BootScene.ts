import Phaser from 'phaser';
import { ASSET_BY_KEY, type Manifest } from '../assets';
import { initIcons } from '../../ui/icons';
import { makePlaceholders } from '../textures/placeholders';

/** 매니페스트의 그림을 읽고, 없는 그림은 임시 그림으로 채운 뒤 다음 장면으로 가요. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    void this.loadManifest().then((manifest) => {
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
