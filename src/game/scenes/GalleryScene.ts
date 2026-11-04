import Phaser from 'phaser';
import { ASSETS, originOf, type AssetKind } from '../assets';
import { isoToScreen } from '../iso/iso';

/**
 * 그림 검토용 화면(?gallery). 위쪽은 아이소 타일 위에 소품·캐릭터를 기준점대로 세워서
 * 이음새와 발 위치를 확인하고, 아래쪽은 모든 그림을 종류별로 보여 줘요. 마우스 휠로 스크롤해요.
 */
export class GalleryScene extends Phaser.Scene {
  constructor() {
    super('Gallery');
  }

  create(): void {
    const zoom = 3;
    const cam = this.cameras.main;
    cam.setZoom(zoom).setBackgroundColor('#2a2f3d').setOrigin(0, 0).setScroll(0, 0);

    // ── 기준점 확인: 6×6 바닥 위에 블록·나무·캐릭터·몹 ──
    const baseX = 110;
    const baseY = 30;
    for (let ty = 0; ty < 6; ty++) {
      for (let tx = 0; tx < 6; tx++) {
        const p = isoToScreen(tx, ty);
        const key = tx === 2 ? 'tile-path' : ty === 5 ? 'tile-water' : tx === 4 ? 'tile-flower' : 'tile-grass';
        this.add.image(baseX + p.x, baseY + p.y, key, 0).setDepth(-1000 + p.y);
      }
    }
    const stand = (key: string, tx: number, ty: number, frame = 0, flip = false) => {
      const spec = ASSETS.find((a) => a.key === key)!;
      const o = originOf(spec);
      const p = isoToScreen(tx, ty);
      this.add
        .image(baseX + p.x, baseY + p.y, key, frame)
        .setOrigin(o.x, o.y)
        .setFlipX(flip)
        .setDepth((tx + ty) * 10 + (spec.kind === 'overlay' ? 6 : 5));
    };
    stand('block-hedge', 0, 0);
    stand('block-hedge', 1, 0);
    stand('block-wall', 0, 1);
    stand('prop-tree', 5, 0);
    stand('prop-pine', 5, 1);
    stand('prop-house', 4, 3, 1);
    // 앞 대기 + 모자 + 지팡이, 뒤 걷기 + 같은 겹침, 왼쪽(반전)
    for (const [tx, ty, frame, flip] of [
      [2, 1, 0, false],
      [2, 2, 7, false],
      [2, 3, 2, true],
    ] as const) {
      stand('char-player', tx, ty, frame, flip);
      stand('equip-hat-cap', tx, ty, frame, flip);
      stand('equip-tool-stick', tx, ty, frame, flip);
    }
    stand('char-robi', 3, 1);
    stand('robi-part-wheel', 3, 1);
    stand('mob-vine-slime', 1, 3);
    stand('prop-chest', 3, 4);
    stand('boss-forest-guardian', 1, 5);

    // ── 모든 그림 ──
    const order: AssetKind[] = ['tile', 'block', 'prop', 'char', 'overlay', 'mob', 'icon', 'fx'];
    let y = 150;
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
        for (let f = 0; f < spec.frames; f++) this.add.image(x + f * spec.w, y, spec.key, f).setOrigin(0, 0);
        x += total + 4;
        rowH = Math.max(rowH, spec.h);
      }
      y += rowH + 8;
    }

    const maxScroll = Math.max(0, y - this.scale.height / zoom);
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      cam.scrollY = Phaser.Math.Clamp(cam.scrollY + dy / zoom, 0, maxScroll);
    });
  }
}
