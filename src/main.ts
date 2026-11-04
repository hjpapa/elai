import Phaser from 'phaser';
import './ui/styles.css';
import { app } from './game/app';
import { BattleScene } from './game/scenes/BattleScene';
import { BootScene } from './game/scenes/BootScene';
import { GalleryScene } from './game/scenes/GalleryScene';
import { TitleScene } from './game/scenes/TitleScene';
import { WorldScene } from './game/scenes/WorldScene';
import { MissionHost } from './missions/core/MissionHost';
import { CUSTOM, ENGINES } from './missions/registry';
import { portraitFor } from './ui/portraits';
import { UI } from './ui/ui';

app.ui = new UI(document.getElementById('ui')!);
app.ui.portrait = (who) => (app.state ? portraitFor(app.state.data, who) : '');
app.missions = new MissionHost(ENGINES, CUSTOM);

// 개발 서버에서만: 브라우저 콘솔에서 게임 상태를 볼 수 있게 해요.
if (import.meta.env.DEV) Object.assign(window, { __app: app });

app.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1b1f2a',
  // 창 크기가 잠깐 0이면 WebGL 프레임버퍼를 만들지 못해요(최소 크기 보장).
  scale: { mode: Phaser.Scale.RESIZE, width: Math.max(320, window.innerWidth), height: Math.max(240, window.innerHeight) },
  scene: [BootScene, TitleScene, WorldScene, BattleScene, GalleryScene],
});
