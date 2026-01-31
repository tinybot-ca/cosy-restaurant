import Phaser from 'phaser';
import { Character } from '../entities/Character';

interface Recipe {
  name: string;
  ingredients: string[];
}

const recipes: Record<string, Recipe> = {
  'galbi-dinner': {
    name: 'Galbi Dinner',
    ingredients: ['galbi', 'green-onion', 'rice']
  }
};

export class RestaurantScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private darkOverlay!: Phaser.GameObjects.Rectangle;
  private logo!: Phaser.GameObjects.Image;
  private startButton!: Phaser.GameObjects.Container;
  private orderDisplay!: Phaser.GameObjects.Container;
  private goToKitchenButton!: Phaser.GameObjects.Container;
  private characters: Character[] = [];
  private walkableArea!: Phaser.Geom.Rectangle;
  private isCharactersEntering: boolean = false;
  private isStarted: boolean = false;
  private currentOrder: string = 'galbi-dinner';

  constructor() {
    super({ key: 'RestaurantScene' });
  }

  create(): void {
    // Reset all state properties on scene (re)start
    this.isStarted = false;
    this.isCharactersEntering = false;
    this.characters = [];
    this.orderDisplay = undefined!;
    this.goToKitchenButton = undefined!;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add background image, centered and scaled to cover
    this.background = this.add.image(width / 2, height / 2, 'restaurant-bg');

    // Scale to cover the canvas while maintaining aspect ratio
    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Define walkable area (the floor area of the cafe)
    this.walkableArea = new Phaser.Geom.Rectangle(
      200,  // x start
      400,  // y start (lower part of scene - the floor)
      880,  // width
      250   // height
    );

    // Add dark overlay on top of characters
    this.darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

    // Add logo above the start button
    this.logo = this.add.image(width / 2, height / 2 - 120, 'keko-cafe-logo');
    this.logo.setDepth(1001);
    // Scale logo if needed (adjust scale factor as desired)
    const maxLogoWidth = 300;
    if (this.logo.width > maxLogoWidth) {
      this.logo.setScale(maxLogoWidth / this.logo.width);
    }

    // Create start button (on top of overlay)
    this.createStartButton(width / 2, height / 2 + 80);

    // Use displayList ordering to ensure proper layering
    this.children.bringToTop(this.darkOverlay);
    this.children.bringToTop(this.logo);
    this.children.bringToTop(this.startButton);
  }

  private createStartButton(x: number, y: number): void {
    this.startButton = this.add.container(x, y);
    this.startButton.setDepth(1001);

    // Button background - pink theme to match the cafe
    const buttonBg = this.add.rectangle(0, 0, 220, 80, 0xd4a5a5);
    buttonBg.setStrokeStyle(3, 0xc48b8b);

    // Button text
    const buttonText = this.add.text(0, 0, 'Start', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    this.startButton.add([buttonBg, buttonText]);
    this.startButton.setSize(220, 80);
    this.startButton.setInteractive({ useHandCursor: true });

    // Hover effects
    this.startButton.on('pointerover', () => {
      buttonBg.setFillStyle(0xe8bcbc);
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    this.startButton.on('pointerout', () => {
      buttonBg.setFillStyle(0xd4a5a5);
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    // Click handler
    this.startButton.on('pointerdown', () => {
      this.onStartClick();
    });
  }

  private onStartClick(): void {
    if (this.isStarted) return;
    this.isStarted = true;

    this.createOrderDisplay();
    this.createGoToKitchenButton();
    this.createCharacters();

    // Fade out the dark overlay
    this.tweens.add({
      targets: this.darkOverlay,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
    });

    // Fade out and destroy the logo
    this.tweens.add({
      targets: this.logo,
      alpha: 0,
      scaleY: 0.8,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.logo.destroy();
      },
    });

    // Fade out and destroy the start button
    this.tweens.add({
      targets: this.startButton,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.startButton.destroy();
      },
    });
  }

  private createOrderDisplay(): void {
    const width = this.cameras.main.width;
    const recipe = recipes[this.currentOrder];

    this.orderDisplay = this.add.container(width / 2, 60);
    this.orderDisplay.setDepth(900);

    // Background panel
    const bg = this.add.rectangle(0, 0, 300, 80, 0xf6e7e7, 0.95);
    bg.setStrokeStyle(3, 0xd4a5a5);

    // Order text
    const orderText = this.add.text(0, -15, 'Order:', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#7b4a4a',
    });
    orderText.setOrigin(0.5);

    // Meal name
    const mealText = this.add.text(0, 15, recipe.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#5a3a3a',
      fontStyle: 'bold',
    });
    mealText.setOrigin(0.5);

    this.orderDisplay.add([bg, orderText, mealText]);
  }

  private createGoToKitchenButton(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.goToKitchenButton = this.add.container(width / 2, height - 50);
    this.goToKitchenButton.setDepth(900);

    const buttonBg = this.add.rectangle(0, 0, 220, 50, 0xd4a5a5);
    buttonBg.setStrokeStyle(3, 0xc48b8b);

    const buttonText = this.add.text(0, 0, 'Go to Kitchen', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    this.goToKitchenButton.add([buttonBg, buttonText]);
    this.goToKitchenButton.setSize(220, 50);
    this.goToKitchenButton.setInteractive({ useHandCursor: true });

    // Hover effects
    this.goToKitchenButton.on('pointerover', () => {
      buttonBg.setFillStyle(0xe8bcbc);
    });

    this.goToKitchenButton.on('pointerout', () => {
      buttonBg.setFillStyle(0xd4a5a5);
    });

    this.goToKitchenButton.on('pointerdown', () => {
      this.scene.start('KitchenScene');
    });
  }

  private createCharacters(): void {
    if (this.characters.length > 0) return;

    const doorPosition = this.getDoorPosition();
    const bearStart = { x: 900, y: 480 };
    const bunnyStart = { x: 400, y: 500 };

    const bearGirl = new Character(this, doorPosition.x + 24, doorPosition.y, 'bear', this.walkableArea);
    const bunnyGirl = new Character(this, doorPosition.x - 24, doorPosition.y, 'bunny', this.walkableArea);
    this.characters.push(bearGirl, bunnyGirl);

    this.isCharactersEntering = true;
    this.tweens.add({
      targets: [bearGirl, bunnyGirl],
      x: (target: Character) => (target.getCharacterType() === 'bear' ? bearStart.x : bunnyStart.x),
      y: (target: Character) => (target.getCharacterType() === 'bear' ? bearStart.y : bunnyStart.y),
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.isCharactersEntering = false;
      },
    });
  }

  private getDoorPosition(): Phaser.Math.Vector2 {
    const bgLeft = this.background.x - this.background.displayWidth / 2;
    const bgTop = this.background.y - this.background.displayHeight / 2;
    const doorX = bgLeft + this.background.displayWidth * 0.5;
    const doorY = bgTop + this.background.displayHeight * 0.33;
    return new Phaser.Math.Vector2(doorX, doorY);
  }

  update(_time: number, delta: number): void {
    // Only update characters after game has started
    if (!this.isStarted || this.isCharactersEntering) return;

    // Update characters
    for (const character of this.characters) {
      character.update(delta);
    }
  }
}
