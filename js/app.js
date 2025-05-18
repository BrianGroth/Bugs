// Create PIXI application
const app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Asset lists
const FLY_FRAMES = 12;
const SPLAT_FRAMES = 6;

// Load sprites
const loader = PIXI.Loader.shared;
for(let i=0;i<FLY_FRAMES;i++){
  loader.add(`fly${i}`, `assets/mosquito/frame_${i}.png`);
}
for(let i=0;i<SPLAT_FRAMES;i++){
  loader.add(`splat${i}`, `assets/mosquito/splat_${i}.png`);
}
loader.load(setup);

let level=1, remaining, timerText, timer=5, mosquitoContainer;

function setup() {
  // Timer display
  timerText = new PIXI.Text('Time: 5.00', {fontFamily:'Arial',fontSize:24,fill:0xffffff});
  timerText.position.set(10,10);
  app.stage.addChild(timerText);

  // Container for mosquitoes
  mosquitoContainer = new PIXI.Container();
  app.stage.addChild(mosquitoContainer);

  nextLevel();
  app.ticker.add(gameLoop);
}

function nextLevel() {
  mosquitoContainer.removeChildren();
  remaining = level + 2;  // level 1 = 3 mosquitos
  timer = 5;
  for(let i=0;i<remaining;i++){
    spawnMosquito();
  }
}

function spawnMosquito() {
  // Create animated sprite
  const frames = [];
  for(let i=0;i<FLY_FRAMES;i++){
    frames.push(PIXI.Texture.from(`fly${i}`));
  }
  const m = new PIXI.AnimatedSprite(frames);
  m.animationSpeed = 0.2 + Math.random()*0.1; // slight variation
  m.loop = true;
  m.play();
  m.anchor.set(0.5);
  m.x = Math.random()*app.renderer.width;
  m.y = Math.random()*app.renderer.height;
  m.interactive = true;
  m.buttonMode = true;
  m.on('pointerdown', () => { squish(m); });
  app.stage.addChild(m);
}

function squish(mosquito) {
  // Hide flight sprite
  mosquito.stop();
  mosquito.visible = false;
  // Show splat animation
  const splatFrames = [];
  for(let i=0;i<SPLAT_FRAMES;i++){
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
    // Decrement count, check for level completion
    remaining--;
    if(remaining===0) {
      level++;
      nextLevel();
    }
  };
  app.stage.addChild(s);
  s.play();
}

function gameLoop(delta) {
  if(remaining>0) {
    timer -= delta * (1/60);
    timerText.text = 'Time: ' + timer.toFixed(2);
    if(timer <= 0) {
      // Game Over
      app.ticker.stop();
      const gameOverText = new PIXI.Text('Game Over', {fontSize:48,fill:0xff0000});
      gameOverText.anchor.set(0.5);
      gameOverText.x = app.renderer.width/2;
      gameOverText.y = app.renderer.height/2;
      app.stage.addChild(gameOverText);
    }
  }
}
