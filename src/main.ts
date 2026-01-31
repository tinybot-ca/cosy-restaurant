import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RestaurantScene } from './scenes/RestaurantScene';
import { KitchenScene } from './scenes/KitchenScene';

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
  scene: [BootScene, RestaurantScene, KitchenScene],
};

new Phaser.Game(config);
