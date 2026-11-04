import Phaser from 'phaser';
import { ASSETS, originOf, type AssetKind } from '../assets';
import { isoToScreen } from '../iso/iso';

/**
 * 그림 검토용 화면(?gallery). 모든 그림을 종류별로 보여 주고,
 * 아래쪽에는 아이소 타일 위에 소품·캐릭터를 기준점대로 세워서 맞는지 확인해요.
 */
export class GalleryScene extends Phaser.Scene {
  constructor() {
    super('Gallery');
  }

  create(): void {
    const zoom = 3;
    this.cameras.main.setZoom(zoom).setBackgroundColor('#2a2f3d').setScroll(0, 0);
    this.cameras.main.setOrigin(0, 0);

    const order: AssetKind[] = ['tile', 'block', 'prop', 'char', 'overlay', 'mob', 'icon', 'fx'];
    let y = 4;
    const maxW = Math.floor(this.scale.width / zoom) - 8;
    for (const kind of order) {
      this.add.text(4, y, kind, { fontSize: '8px', color: '#ffffff' }).setResolution(zoom);
      y += 10;
      let x = 4;
      let rowH = 0;
      for (const spec of ASSETS.filter((a) => a.kind === kind)) {
        const total = spec.w * spec.frames;
        if (x + total > maxW) {
          x = 4;
          y += rowH + 4;
          rowH = 0;
        }
        for (let f = 0; f < spec.frames; f++) {
          this.add.image(x + f * spec.w, y, spec.key, f).setOrigin(0, 0);
        }
        x += total + 4;
        rowH = Math.max(rowH, spec.h);
      }
      y += rowH + 8;
    }

    // 기준점 확인: 5×5 풀밭 위에 나무·캐릭터·몹
    const baseX = 60;
    const baseY = y + 20;
    for (let ty = 0; ty < 5; ty++) {
      for (let tx = 0; tx < 5; tx++) {
        const p = isoToScreen(tx, ty);
        this.add.image(baseX + p.x, baseY + p.y, tx === 2 ? 'tile-path' : 'tile-grass', 0).setDepth(p.y);
      }
    }
    const stand = (key: string, tx: number, ty: number, frame = 0) => {
      const spec = ASSETS.find((a) => a.key === key)!;
      const o = originOf(spec);
      const p = isoToScreen(tx, ty);
      this.add.image(baseX + p.x, baseY + p.y, key, frame).setOrigin(o.x, o.y).setDepth(1000 + p.y);
    };
    stand('block-hedge', 0, 0);
    stand('prop-tree', 4, 0);
    stand('prop-house', 4, 4, 1);
    stand('char-player', 2, 2);
    stand('equip-hat-cap', 2, 2);
    stand('equip-tool-stick', 2, 2);
    stand('char-robi', 3, 2);
    stand('mob-vine-slime', 1, 3);
    stand('prop-chest', 3, 4);
  }
}
