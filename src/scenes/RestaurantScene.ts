import Phaser from 'phaser';
import { Character } from '../entities/Character';

export class RestaurantScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private darkOverlay!: Phaser.GameObjects.Rectangle;
  private startButton!: Phaser.GameObjects.Container;
  private ingredientBar!: Phaser.GameObjects.Container;
  private characters: Character[] = [];
  private walkableArea!: Phaser.Geom.Rectangle;
  private isCharactersEntering: boolean = false;
  private isStarted: boolean = false;

  constructor() {
    super({ key: 'RestaurantScene' });
  }

  create(): void {
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

    // Create start button (on top of overlay)
    this.createStartButton(width / 2, height / 2);

    // Use displayList ordering to ensure proper layering
    this.children.bringToTop(this.darkOverlay);
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

    this.createIngredientBar();
    this.createCharacters();

    // Fade out the dark overlay
    this.tweens.add({
      targets: this.darkOverlay,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
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

  private createIngredientBar(): void {
    if (this.ingredientBar) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const ingredients = [
      'Rice',
      'Seaweed',
      'Cucumbers',
      'Carrots',
      'Shredded Beef',
      'Salmon Sushi',
    ];
    const boxWidth = 160;
    const boxHeight = 70;
    const gap = 12;
    const totalWidth = (boxWidth * ingredients.length) + (gap * (ingredients.length - 1));
    const startX = (width - totalWidth) / 2;
    const y = height - boxHeight / 2 - 16;

    this.ingredientBar = this.add.container(0, 0);
    this.ingredientBar.setDepth(900);

    ingredients.forEach((label, index) => {
      const x = startX + (index * (boxWidth + gap)) + (boxWidth / 2);
      const box = this.add.rectangle(x, y, boxWidth, boxHeight, 0xf6e7e7, 0.95);
      box.setStrokeStyle(2, 0xd4a5a5);

      const text = this.add.text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#7b4a4a',
        align: 'center',
        wordWrap: { width: boxWidth - 16 },
      });
      text.setOrigin(0.5);

      this.ingredientBar.add([box, text]);
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
