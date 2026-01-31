import Phaser from 'phaser';

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

const availableIngredients = ['galbi', 'onion', 'green-onion', 'rice', 'pork', 'veggies'];

export class KitchenScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private ingredientBar!: Phaser.GameObjects.Container;
  private orderDisplay!: Phaser.GameObjects.Container;
  private prepareButton!: Phaser.GameObjects.Container;
  private backButton!: Phaser.GameObjects.Container;
  private selectedIngredients: Set<string> = new Set();
  private currentOrder: string = 'galbi-dinner';
  private ingredientContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'KitchenScene' });
  }

  create(): void {
    // Reset state
    this.selectedIngredients = new Set();
    this.ingredientContainers = new Map();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add kitchen background image, centered and scaled to cover
    this.background = this.add.image(width / 2, height / 2, 'kitchen-bg');

    // Scale to cover the canvas while maintaining aspect ratio
    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Create UI elements
    this.createOrderDisplay();
    this.createIngredientBar();
    this.createPrepareButton();
    this.createBackButton();
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

  private createIngredientBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const boxSize = 100;
    const gap = 16;
    const totalWidth = (boxSize * availableIngredients.length) + (gap * (availableIngredients.length - 1));
    const startX = (width - totalWidth) / 2;
    const y = height - boxSize / 2 - 80;

    this.ingredientBar = this.add.container(0, 0);
    this.ingredientBar.setDepth(900);

    availableIngredients.forEach((ingredientKey, index) => {
      const x = startX + (index * (boxSize + gap)) + (boxSize / 2);

      const container = this.add.container(x, y);

      // Box background
      const box = this.add.rectangle(0, 0, boxSize, boxSize, 0xf6e7e7, 0.95);
      box.setStrokeStyle(2, 0xd4a5a5);

      // Ingredient image
      const image = this.add.image(0, -5, ingredientKey);
      const imageScale = (boxSize - 20) / Math.max(image.width, image.height);
      image.setScale(imageScale);

      // Label
      const label = this.add.text(0, boxSize / 2 - 12, this.formatIngredientName(ingredientKey), {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#7b4a4a',
      });
      label.setOrigin(0.5);

      container.add([box, image, label]);
      container.setSize(boxSize, boxSize);
      container.setInteractive({ useHandCursor: true });

      // Click handler for selection
      container.on('pointerdown', () => {
        this.toggleIngredient(ingredientKey, box);
      });

      // Hover effect
      container.on('pointerover', () => {
        if (!this.selectedIngredients.has(ingredientKey)) {
          box.setFillStyle(0xfff0f0);
        }
      });

      container.on('pointerout', () => {
        if (!this.selectedIngredients.has(ingredientKey)) {
          box.setFillStyle(0xf6e7e7);
        }
      });

      this.ingredientContainers.set(ingredientKey, container);
      this.ingredientBar.add(container);
    });
  }

  private formatIngredientName(key: string): string {
    return key.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private toggleIngredient(ingredientKey: string, box: Phaser.GameObjects.Rectangle): void {
    if (this.selectedIngredients.has(ingredientKey)) {
      this.selectedIngredients.delete(ingredientKey);
      box.setFillStyle(0xf6e7e7);
      box.setStrokeStyle(2, 0xd4a5a5);
    } else {
      this.selectedIngredients.add(ingredientKey);
      box.setFillStyle(0xc8f7c5);
      box.setStrokeStyle(3, 0x5cb85c);
    }
  }

  private createPrepareButton(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.prepareButton = this.add.container(width / 2, height - 30);
    this.prepareButton.setDepth(900);

    const buttonBg = this.add.rectangle(0, 0, 200, 50, 0xd4a5a5);
    buttonBg.setStrokeStyle(3, 0xc48b8b);

    const buttonText = this.add.text(0, 0, 'Prepare Meal', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    this.prepareButton.add([buttonBg, buttonText]);
    this.prepareButton.setSize(200, 50);
    this.prepareButton.setInteractive({ useHandCursor: true });

    // Hover effects
    this.prepareButton.on('pointerover', () => {
      buttonBg.setFillStyle(0xe8bcbc);
    });

    this.prepareButton.on('pointerout', () => {
      buttonBg.setFillStyle(0xd4a5a5);
    });

    this.prepareButton.on('pointerdown', () => {
      this.checkRecipe();
    });
  }

  private createBackButton(): void {
    this.backButton = this.add.container(80, 40);
    this.backButton.setDepth(900);

    const buttonBg = this.add.rectangle(0, 0, 120, 40, 0xd4a5a5);
    buttonBg.setStrokeStyle(2, 0xc48b8b);

    const buttonText = this.add.text(0, 0, '< Back', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    this.backButton.add([buttonBg, buttonText]);
    this.backButton.setSize(120, 40);
    this.backButton.setInteractive({ useHandCursor: true });

    // Hover effects
    this.backButton.on('pointerover', () => {
      buttonBg.setFillStyle(0xe8bcbc);
    });

    this.backButton.on('pointerout', () => {
      buttonBg.setFillStyle(0xd4a5a5);
    });

    this.backButton.on('pointerdown', () => {
      this.scene.start('RestaurantScene', { fromKitchen: true });
    });
  }

  private checkRecipe(): void {
    const recipe = recipes[this.currentOrder];
    const selected = Array.from(this.selectedIngredients).sort();
    const required = [...recipe.ingredients].sort();

    const isCorrect = selected.length === required.length &&
      selected.every((ing, i) => ing === required[i]);

    if (isCorrect) {
      this.showResult(true);
    } else {
      this.showResult(false);
    }
  }

  private showResult(success: boolean): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (success) {
      // Play Mei burst animation first, then show success message
      this.playBurstAnimation('mei-burst', () => {
        // Show success message after burst animation
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(1000);

        const recipe = recipes[this.currentOrder];
        const message = `Success!\n${recipe.name} created!`;

        const messageText = this.add.text(width / 2, height / 2 - 30, message, {
          fontFamily: 'Georgia, serif',
          fontSize: '36px',
          color: '#5cb85c',
          align: 'center',
        });
        messageText.setOrigin(0.5);
        messageText.setDepth(1001);

        // Return to restaurant scene after showing message
        this.time.delayedCall(2000, () => {
          this.scene.start('RestaurantScene');
        });
      });
    } else {
      // Create overlay for failure message
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setDepth(1000);

      const messageText = this.add.text(width / 2, height / 2 - 30, 'Wrong ingredients!\nTry again.', {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#d9534f',
        align: 'center',
      });
      messageText.setOrigin(0.5);
      messageText.setDepth(1001);

      // Allow retry - clear selection and remove overlay
      this.time.delayedCall(1500, () => {
        overlay.destroy();
        messageText.destroy();
        this.clearSelection();
      });
    }
  }

  private clearSelection(): void {
    this.selectedIngredients.clear();
    this.ingredientContainers.forEach((container) => {
      const box = container.list[0] as Phaser.GameObjects.Rectangle;
      box.setFillStyle(0xf6e7e7);
      box.setStrokeStyle(2, 0xd4a5a5);
    });
  }

  private playBurstAnimation(videoKey: string, onComplete: () => void): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create dark overlay that fades in first
    const darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1);
    darkOverlay.setDepth(1001);
    darkOverlay.setAlpha(0);

    // Fade to 75% dark over 1 second
    this.tweens.add({
      targets: darkOverlay,
      alpha: 0.75,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Create and play video after screen is dark
        const video = this.add.video(width / 2, height / 2, videoKey);
        video.setDepth(1002);
        video.play();

        // When video ends, fade out and call the callback
        video.on('complete', () => {
          this.tweens.add({
            targets: [video, darkOverlay],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              video.destroy();
              darkOverlay.destroy();
              onComplete();
            }
          });
        });
      }
    });
  }
}
