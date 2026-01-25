import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RestaurantScene } from './scenes/RestaurantScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, RestaurantScene],
};

new Phaser.Game(config);
