import Phaser from 'phaser';

export type CharacterType = 'bear' | 'bunny';

interface WalkTarget {
  x: number;
  y: number;
}

export class Character extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Image;
  private shadow!: Phaser.GameObjects.Ellipse;
  private characterType: CharacterType;
  private idleTween!: Phaser.Tweens.Tween;

  private walkSpeed: number = 50;
  private currentTarget: WalkTarget | null = null;
  private isWalking: boolean = false;
  private walkableArea: Phaser.Geom.Rectangle;
  private idleTimer: number = 0;
  private idleDuration: number = 0;
  private walkTime: number = 0;
  private baseSpriteY: number = 0;
  private baseShadowScaleX: number = 1;
  private baseShadowScaleY: number = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterType: CharacterType,
    walkableArea: Phaser.Geom.Rectangle
  ) {
    super(scene, x, y);

    this.characterType = characterType;
    this.walkableArea = walkableArea;

    this.createShadow();
    this.createSprite();

    scene.add.existing(this);

    // Set initial depth (will be updated based on y position when walking)
    this.setDepth(this.y);

    // Start with a random idle duration before first walk
    this.idleDuration = Phaser.Math.Between(1000, 3000);
    this.idleTimer = 0;

    // Add bobbing animation
    this.addIdleAnimation();
    this.baseSpriteY = this.sprite.y;
    this.baseShadowScaleX = this.shadow.scaleX;
    this.baseShadowScaleY = this.shadow.scaleY;
  }

  private createSprite(): void {
    const textureKey = this.characterType === 'bear' ? 'bear-girl' : 'bunny-girl';

    // Create the sprite using the character texture
    this.sprite = this.scene.add.image(0, 0, textureKey);
    this.sprite.setScale(0.35);
    this.sprite.setOrigin(0.5, 1);

    this.add(this.sprite);
  }

  private createShadow(): void {
    this.shadow = this.scene.add.ellipse(0, 5, 35, 12, 0x000000, 0.15);
    this.shadow.setOrigin(0.5, 0.5);
    this.add(this.shadow);
  }

  private addIdleAnimation(): void {
    // Gentle bobbing animation when idle
    this.idleTween = this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: -4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(delta: number): void {
    if (this.isWalking && this.currentTarget) {
      if (!this.idleTween.isPaused()) {
        this.idleTween.pause();
        this.sprite.y = this.baseSpriteY;
      }
      this.walkTime += delta;
      const bob = Math.sin(this.walkTime * 0.02) * 2;
      this.sprite.y = this.baseSpriteY + bob;
      const squash = 1 - (bob * 0.03);
      this.shadow.setScale(
        this.baseShadowScaleX * (1 + (bob * 0.02)),
        this.baseShadowScaleY * squash
      );
      this.moveTowardsTarget(delta);
    } else {
      if (this.idleTween.isPaused()) {
        this.idleTween.resume();
        this.sprite.y = this.baseSpriteY;
        this.shadow.setScale(this.baseShadowScaleX, this.baseShadowScaleY);
      }
      this.walkTime = 0;
      // Idle behavior - wait then pick a new destination
      this.idleTimer += delta;
      if (this.idleTimer >= this.idleDuration) {
        this.pickNewDestination();
      }
    }

    // Update depth based on y position for proper layering
    this.setDepth(this.y);
  }

  private moveTowardsTarget(delta: number): void {
    if (!this.currentTarget) return;

    const dx = this.currentTarget.x - this.x;
    const dy = this.currentTarget.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached destination
      this.isWalking = false;
      this.currentTarget = null;
      this.idleTimer = 0;
      this.idleDuration = Phaser.Math.Between(2000, 4000);
      return;
    }

    // Move towards target
    const moveDistance = this.walkSpeed * (delta / 1000);
    const ratio = moveDistance / distance;

    this.x += dx * ratio;
    this.y += dy * ratio;

    // Flip sprite based on direction
    this.sprite.setFlipX(dx < 0);
  }

  private pickNewDestination(): void {
    // Pick a random point within the walkable area
    const padding = 60;
    const targetX = Phaser.Math.Between(
      this.walkableArea.x + padding,
      this.walkableArea.x + this.walkableArea.width - padding
    );
    const targetY = Phaser.Math.Between(
      this.walkableArea.y + padding,
      this.walkableArea.y + this.walkableArea.height - padding
    );

    this.currentTarget = { x: targetX, y: targetY };
    this.isWalking = true;
  }

  getCharacterType(): CharacterType {
    return this.characterType;
  }
}
