import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#f4d03f',
    });
    loadingText.setOrigin(0.5);

    this.load.on('complete', () => {
      loadingText.destroy();
    });

    // Load the restaurant background image
    this.load.image('restaurant-bg', '/assets/restaurant-bg.png');

    // Load kitchen background image
    this.load.image('kitchen-bg', '/assets/kitchen-bg.png');

    // Load character sprites
    this.load.image('bear-girl', '/assets/BearGirl.png');
    this.load.image('bunny-girl', '/assets/BunnyGirl.png');

    // Load logo
    this.load.image('keko-cafe-logo', '/assets/keko-cafe-logo.png');

    // Load ingredient images
    this.load.image('galbi', '/assets/galbi.png');
    this.load.image('onion', '/assets/onion.png');
    this.load.image('green-onion', '/assets/green-onion.png');
    this.load.image('rice', '/assets/rice.png');
    this.load.image('pork', '/assets/pork.png');
    this.load.image('veggies', '/assets/veggies.png');

    // Load burst animations
    this.load.video('mei-burst', '/assets/burst-animations/mei-burst.mp4');
  }

  create(): void {
    this.scene.start('RestaurantScene');
  }
}
