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
  for (let i = 1; i <= FLY_FRAMES; i++) {
    loader.add(`fly${i - 1}`, `assets/frame_${i}.png`); // Corrected path
  }
  for (let i = 1; i <= SPLAT_FRAMES; i++) {
    loader.add(`splat${i - 1}`, `assets/splat_${i}.png`); // Corrected path
  }

  // After assets are loaded, run setup
  loader.load((loadedLoader, resources) => {
    if (Object.keys(resources).some(key => resources[key].error)) {
      console.error('Error loading assets:', resources);
      // You could display an error message to the user here
      const errorText = new PIXI.Text('Error loading assets. Check console.', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xff0000,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: app.screen.width * 0.9
      });
      errorText.anchor.set(0.5);
      errorText.x = app.screen.width / 2;
      errorText.y = app.screen.height / 2;
      app.stage.addChild(errorText);
      return;
    }
    setup(app, resources);
  });
});

// Game state variables
let level = 1;
let remaining;
let timer = 5; // Game starts with a 5-second timer
let timerText;
let mosquitoContainer;

function setup(app, resources) {
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
  nextLevel(app, resources);

  // Game loop
  app.ticker.add((delta) => gameLoop(delta, app, resources));
}

function nextLevel(app, resources) {
  // Clear existing mosquitoes
  mosquitoContainer.removeChildren();

  // Calculate count: level+2 => level1=3 bugs
  remaining = level + 2; // Starts with 3 mosquitos
  timer = 5; // Reset timer to 5 seconds for each level
  timerText.text = `Time: ${timer.toFixed(2)}`;

  // Spawn mosquitoes
  for (let i = 0; i < remaining; i++) {
    spawnMosquito(app, resources);
  }
}

function spawnMosquito(app, resources) {
  // Build animation frames
  const frames = [];
  for (let i = 0; i < 12; i++) {
    frames.push(resources[`fly${i}`].texture); // Use preloaded textures
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
  m.buttonMode = true; // Deprecated, use .cursor = 'pointer'
  m.cursor = 'pointer';
  m.on('pointerdown', () => squish(m, app, resources));

  mosquitoContainer.addChild(m);
}

function squish(mosquito, app, resources) {
  // Hide the mosquito
  mosquito.stop();
  mosquito.interactive = false; // Disable further interaction
  // mosquito.visible = false; // Splat will cover it

  // Create splat animation
  const splatFrames = [];
  for (let i = 0; i < 6; i++) {
    splatFrames.push(resources[`splat${i}`].texture); // Use preloaded textures
  }

  const s = new PIXI.AnimatedSprite(splatFrames);
  s.anchor.set(0.5);
  s.x = mosquito.x;
  s.y = mosquito.y;
  s.animationSpeed = 0.3;
  s.loop = false;
  s.onComplete = () => {
    mosquitoContainer.removeChild(mosquito); // Remove original mosquito
    app.stage.removeChild(s); // Remove splat
    remaining--;
    if (remaining === 0) {
      if (timer > 0) { // Only advance level if time hasn't run out
        level++;
        nextLevel(app, resources);
      }
    }
  };

  app.stage.addChild(s);
  s.play();
}

function gameLoop(delta, app, resources) {
  if (remaining > 0) {
    // Update timer
    timer -= delta / PIXI.Ticker.targetFPMS / 1000; // More accurate timer decrement
    timerText.text = `Time: ${Math.max(0, timer).toFixed(2)}`;

    // Check for timeout
    if (timer <= 0) {
      stopGame(app, "Time's Up!");
    }
  }
}

function stopGame(app, message) {
  // Stop the ticker
  if (app.ticker.started) {
    app.ticker.stop();
  }
  
  // Disable interaction on remaining mosquitos
  mosquitoContainer.children.forEach(child => {
    if (child instanceof PIXI.AnimatedSprite) {
        child.interactive = false;
        child.cursor = 'default';
        child.stop();
    }
  });


  // Show Game Over
  const gameOverText = new PIXI.Text(message, {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xff0000,
    align: 'center',
    stroke: '#000000',
    strokeThickness: 4
  });
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.renderer.width / 2;
  gameOverText.y = app.renderer.height / 2;
  app.stage.addChild(gameOverText);

  // Optional: Add a restart button
  const restartButton = new PIXI.Text('Restart', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: 0x00ff00,
    stroke: '#000000',
    strokeThickness: 3
  });
  restartButton.anchor.set(0.5);
  restartButton.x = app.renderer.width / 2;
  restartButton.y = app.renderer.height / 2 + 60;
  restartButton.interactive = true;
  restartButton.cursor = 'pointer';
  restartButton.on('pointerdown', () => {
    // Reset game state and restart
    app.stage.removeChildren(); // Clear stage
    level = 1;
    timer = 5;
    // Re-add essential elements and start ticker
    window.dispatchEvent(new Event('DOMContentLoaded')); // Re-trigger game load
  });
  app.stage.addChild(restartButton);
}