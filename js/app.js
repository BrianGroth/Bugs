// app.js - Mosquito Squish Game

// Wait for DOM load before initializing PIXI
window.addEventListener('DOMContentLoaded', () => {
  const app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x1099bb });
  document.body.appendChild(app.view);

  // Define frame counts
  const FLY_FRAMES = 12;
  const SPLAT_FRAMES = 6;

  // Preload assets
  const loader = PIXI.Loader.shared;
  for (let i = 0; i < FLY_FRAMES; i++) {
    loader.add(`fly${i}`, `assets/mosquito/frame_${i}.png`);
  }
  for (let i = 0; i < SPLAT_FRAMES; i++) {
    loader.add(`splat${i}`, `assets/mosquito/splat_${i}.png`);
  }

  // After assets are loaded, run setup
  loader.load(() => setup(app));
});

// Game state variables
let level = 1;
let remaining;
let timer = 5;
let timerText;
let mosquitoContainer;

function setup(app) {
  // Display timer
  timerText = new PIXI.Text(`Time: ${timer.toFixed(2)}`, {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff
  });
  timerText.position.set(10, 10);
  app.stage.addChild(timerText);

  // Container for mosquitoes
  mosquitoContainer = new PIXI.Container();
  app.stage.addChild(mosquitoContainer);

  // Start first level
  nextLevel(app);

  // Game loop
  app.ticker.add((delta) => gameLoop(delta, app));
}

function nextLevel(app) {
  // Clear existing mosquitoes
  mosquitoContainer.removeChildren();

  // Calculate count: level+2 => level1=3 bugs
  remaining = level + 2;
  timer = 5;
  timerText.text = `Time: ${timer.toFixed(2)}`;

  // Spawn mosquitoes
  for (let i = 0; i < remaining; i++) {
    spawnMosquito(app);
  }
}

function spawnMosquito(app) {
  // Build animation frames
  const frames = [];
  for (let i = 0; i < 12; i++) {
    frames.push(PIXI.Texture.from(`fly${i}`));
  }

  const m = new PIXI.AnimatedSprite(frames);
  m.animationSpeed = 0.2 + Math.random() * 0.1;
  m.loop = true;
  m.play();
  m.anchor.set(0.5);

  // Random position
  m.x = Math.random() * app.renderer.width;
  m.y = Math.random() * app.renderer.height;

  // Enable interaction
  m.interactive = true;
  m.buttonMode = true;
  m.on('pointerdown', () => squish(m, app));

  mosquitoContainer.addChild(m);
}

function squish(mosquito, app) {
  // Hide the mosquito
  mosquito.stop();
  mosquito.visible = false;

  // Create splat animation
  const splatFrames = [];
  for (let i = 0; i < 6; i++) {
    splatFrames.push(PIXI.Texture.from(`splat${i}`));
  }

  const s = new PIXI.AnimatedSprite(splatFrames);
  s.anchor.set(0.5);
  s.x = mosquito.x;
  s.y = mosquito.y;
  s.animationSpeed = 0.3;
  s.loop = false;
  s.onComplete = () => {
    app.stage.removeChild(s);
    remaining--;
    if (remaining === 0) {
      level++;
      nextLevel(app);
    }
  };

  app.stage.addChild(s);
  s.play();
}

function gameLoop(delta, app) {
  if (remaining > 0) {
    // Update timer
    timer -= delta / 60;
    timerText.text = `Time: ${timer.toFixed(2)}`;

    // Check for timeout
    if (timer <= 0) {
      stopGame(app);
    }
  }
}

function stopGame(app) {
  // Stop the ticker
  app.ticker.stop();

  // Show Game Over
  const gameOverText = new PIXI.Text('Game Over', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xff0000
  });
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.renderer.width / 2;
  gameOverText.y = app.renderer.height / 2;
  app.stage.addChild(gameOverText);
}
