import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { GalleryScene } from './game/scenes/GalleryScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  pixelArt: true,
  backgroundColor: '#1b1f2a',
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  scene: [BootScene, GalleryScene],
});
