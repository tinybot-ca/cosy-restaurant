import Phaser from 'phaser';

interface QuizQuestion {
  a: number;
  b: number;
  answer: number;
}

export class QuizOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private questions: QuizQuestion[] = [];
  private currentQuestionIndex: number = 0;
  private correctAnswers: number = 0;
  private wrongAttempts: number = 0;
  private startTime: number = 0;
  private totalTime: number = 0;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent!: Phaser.Time.TimerEvent;
  private inputElement!: Phaser.GameObjects.DOMElement;
  private questionText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private progressBarFill!: Phaser.GameObjects.Rectangle;
  private feedbackText!: Phaser.GameObjects.Text;
  private onComplete: (stars: number) => void;

  private readonly TOTAL_QUESTIONS = 3;
  private readonly MAX_WRONG_ATTEMPTS = 3;
  private readonly BASE_DEPTH = 2000;

  constructor(scene: Phaser.Scene, onComplete: (stars: number) => void) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(this.BASE_DEPTH);

    this.generateQuestions();
    this.createUI();
    this.startQuiz();
  }

  private generateQuestions(): void {
    this.questions = [];
    for (let i = 0; i < this.TOTAL_QUESTIONS; i++) {
      const a = Phaser.Math.Between(1, 12);
      const b = Phaser.Math.Between(1, 12);
      this.questions.push({
        a,
        b,
        answer: a * b,
      });
    }
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Soft overlay background
    const overlay = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x2a1a3a,
      0.75
    );
    this.container.add(overlay);

    const panelWidth = 580;
    const panelHeight = 580;
    const centerX = width / 2;
    const panelTop = height / 2 - panelHeight / 2;

    // Outer glow effect (soft pink shadow)
    const glowOuter = this.scene.add.rectangle(
      centerX,
      height / 2 + 6,
      panelWidth + 20,
      panelHeight + 20,
      0xffb6c1,
      0.3
    );
    this.container.add(glowOuter);

    // Panel background - soft lavender pink
    const panel = this.scene.add.rectangle(
      centerX,
      height / 2,
      panelWidth,
      panelHeight,
      0xfff0f5,
      0.98
    );
    panel.setStrokeStyle(6, 0xffb6c1);
    this.container.add(panel);

    // Inner decorative border
    const innerBorder = this.scene.add.rectangle(
      centerX,
      height / 2,
      panelWidth - 24,
      panelHeight - 24,
      0xfff0f5,
      0
    );
    innerBorder.setStrokeStyle(2, 0xffd1dc);
    this.container.add(innerBorder);

    // Add decorative corner stars
    this.addDecorativeStars(centerX, height / 2, panelWidth, panelHeight);

    // Title with sparkles
    const titleText = this.scene.add.text(
      centerX,
      panelTop + 45,
      '\u2729 Math Time \u2729',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#d85a8a',
        fontStyle: 'bold',
      }
    );
    titleText.setOrigin(0.5);
    this.container.add(titleText);

    // Progress text
    this.progressText = this.scene.add.text(
      centerX,
      panelTop + 95,
      `Question 1 of ${this.TOTAL_QUESTIONS}`,
      {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#b06080',
      }
    );
    this.progressText.setOrigin(0.5);
    this.container.add(this.progressText);

    // Progress bar background - rounded pill shape
    const barWidth = 340;
    const barHeight = 24;
    const barY = panelTop + 135;
    const progressBarBg = this.scene.add.rectangle(
      centerX,
      barY,
      barWidth,
      barHeight,
      0xffe4ec,
      1
    );
    progressBarBg.setStrokeStyle(2, 0xffb6c1);
    this.container.add(progressBarBg);

    // Progress bar fill - mint green
    this.progressBarFill = this.scene.add.rectangle(
      centerX - barWidth / 2 + 3,
      barY,
      0,
      barHeight - 6,
      0x98d4bb
    );
    this.progressBarFill.setOrigin(0, 0.5);
    this.container.add(this.progressBarFill);

    // Question text with playful styling
    this.questionText = this.scene.add.text(centerX, height / 2 - 55, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      color: '#6a4060',
      fontStyle: 'bold',
    });
    this.questionText.setOrigin(0.5);
    this.container.add(this.questionText);

    // Create DOM input element (CSS handles horizontal centering via position:fixed)
    this.inputElement = this.scene.add.dom(0, height / 2 + 20, 'input');
    this.inputElement.setDepth(this.BASE_DEPTH + 1);

    const inputEl = this.inputElement.node as HTMLInputElement;
    inputEl.type = 'number';
    inputEl.className = 'quiz-input';
    inputEl.maxLength = 3;

    // Handle Enter key submission
    inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.submitAnswer();
      }
    });

    // Submit button - kawaii style
    const submitButton = this.createKawaiiButton(centerX, height / 2 + 155, '\u2665 Submit \u2665');
    this.container.add(submitButton);

    // Feedback text (hidden initially)
    this.feedbackText = this.scene.add.text(centerX, height / 2 + 220, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#e57399',
    });
    this.feedbackText.setOrigin(0.5);
    this.feedbackText.setVisible(false);
    this.container.add(this.feedbackText);

    // Timer text with star
    this.timerText = this.scene.add.text(
      centerX,
      panelTop + panelHeight - 50,
      '\u23f0 Time: 0.0s',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#b08090',
      }
    );
    this.timerText.setOrigin(0.5);
    this.container.add(this.timerText);
  }

  private addDecorativeStars(cx: number, cy: number, pw: number, ph: number): void {
    const starPositions = [
      { x: cx - pw / 2 + 25, y: cy - ph / 2 + 25 },
      { x: cx + pw / 2 - 25, y: cy - ph / 2 + 25 },
      { x: cx - pw / 2 + 25, y: cy + ph / 2 - 25 },
      { x: cx + pw / 2 - 25, y: cy + ph / 2 - 25 },
    ];

    const starColors = [0xffb6c1, 0x98d4bb, 0xffd700, 0xdda0dd];

    starPositions.forEach((pos, i) => {
      const star = this.scene.add.text(pos.x, pos.y, '\u2605', {
        fontSize: '24px',
        color: '#' + starColors[i].toString(16).padStart(6, '0'),
      });
      star.setOrigin(0.5);
      this.container.add(star);

      // Add gentle floating animation
      this.scene.tweens.add({
        targets: star,
        y: pos.y - 5,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private createKawaiiButton(x: number, y: number, text: string): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);

    // Button shadow
    const shadow = this.scene.add.rectangle(0, 5, 200, 60, 0xd88aaa, 0.5);
    button.add(shadow);

    // Button background - gradient effect with two rectangles
    const bg = this.scene.add.rectangle(0, 0, 200, 60, 0xffb6c1);
    bg.setStrokeStyle(3, 0xff91a4);
    button.add(bg);

    // Button highlight
    const highlight = this.scene.add.rectangle(0, -10, 175, 18, 0xffd1dc, 0.4);
    button.add(highlight);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5);
    label.setShadow(1, 1, '#d85a8a', 0);
    button.add(label);

    button.setSize(200, 60);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.setFillStyle(0xffc8d7);
      this.scene.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    button.on('pointerout', () => {
      bg.setFillStyle(0xffb6c1);
      this.scene.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    button.on('pointerdown', () => {
      this.submitAnswer();
    });

    return button;
  }

  private startQuiz(): void {
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.wrongAttempts = 0;
    this.totalTime = 0;
    this.startTime = Date.now();

    this.showQuestion();
    this.startTimer();
  }

  private startTimer(): void {
    this.timerEvent = this.scene.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  private updateTimer(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.timerText.setText(`\u23f0 Time: ${elapsed.toFixed(1)}s`);
  }

  private showQuestion(): void {
    const question = this.questions[this.currentQuestionIndex];
    this.questionText.setText(`${question.a}  x  ${question.b}  =  ?`);
    this.progressText.setText(
      `Question ${this.currentQuestionIndex + 1} of ${this.TOTAL_QUESTIONS}`
    );

    // Update progress bar
    const barWidth = 340;
    const progress = this.currentQuestionIndex / this.TOTAL_QUESTIONS;
    this.progressBarFill.width = barWidth * progress;

    // Clear and focus input
    const inputEl = this.inputElement.node as HTMLInputElement;
    inputEl.value = '';
    inputEl.focus();

    // Reset wrong attempts for this question
    this.wrongAttempts = 0;

    // Hide feedback
    this.feedbackText.setVisible(false);
  }

  private submitAnswer(): void {
    const inputEl = this.inputElement.node as HTMLInputElement;
    const userAnswer = inputEl.value.trim();

    // Don't accept empty input
    if (userAnswer === '') {
      return;
    }

    const answer = parseInt(userAnswer, 10);
    const question = this.questions[this.currentQuestionIndex];

    if (answer === question.answer) {
      // Correct answer
      this.correctAnswers++;
      this.advanceToNextQuestion();
    } else {
      // Wrong answer
      this.wrongAttempts++;

      if (this.wrongAttempts >= this.MAX_WRONG_ATTEMPTS) {
        // Show correct answer and move on
        this.showCorrectAnswer();
      } else {
        // Show cute "Try again!" feedback
        this.feedbackText.setText('\u2661 Almost! Try again~ \u2661');
        this.feedbackText.setColor('#e57399');
        this.feedbackText.setVisible(true);
        inputEl.value = '';
        inputEl.focus();
      }
    }
  }

  private showCorrectAnswer(): void {
    const question = this.questions[this.currentQuestionIndex];
    this.feedbackText.setText(`\u2605 The answer is ${question.answer}! \u2605`);
    this.feedbackText.setColor('#b08090');
    this.feedbackText.setVisible(true);

    // Disable input temporarily
    const inputEl = this.inputElement.node as HTMLInputElement;
    inputEl.disabled = true;

    // Move to next question after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      inputEl.disabled = false;
      this.advanceToNextQuestion();
    });
  }

  private advanceToNextQuestion(): void {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.TOTAL_QUESTIONS) {
      // Quiz complete
      this.finishQuiz();
    } else {
      this.showQuestion();
    }
  }

  private finishQuiz(): void {
    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    this.totalTime = (Date.now() - this.startTime) / 1000;
    const stars = this.calculateStars();

    // Clean up
    this.destroy();

    // Callback with result
    this.onComplete(stars);
  }

  private calculateStars(): number {
    const avgTime = this.totalTime / this.TOTAL_QUESTIONS;

    if (this.correctAnswers === this.TOTAL_QUESTIONS) {
      // All correct - star rating based on speed
      if (avgTime < 3) {
        return 5;
      } else if (avgTime <= 5) {
        return 4;
      } else {
        return 3;
      }
    } else if (this.correctAnswers === 2) {
      return 2;
    } else {
      return 1;
    }
  }

  public destroy(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    if (this.inputElement) {
      this.inputElement.destroy();
    }
    if (this.container) {
      this.container.destroy(true);
    }
  }
}
