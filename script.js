const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; 

const SCALE = 10;
const MOVEMENT_SPEED = 10;
const ANIMATION_SPEED = 8; 

const spriteData = {
  "metadata": { "spriteWidth": 32, "spriteHeight": 32 },
  "animations": {
    "idle_down": [{ "x": 0, "y": 0 }, { "x": 32, "y": 0 }, { "x": 64, "y": 0 }, { "x": 96, "y": 0 }],
    "idle_right": [{ "x": 0, "y": 32 }, { "x": 32, "y": 32 }, { "x": 64, "y": 32 }, { "x": 96, "y": 32 }],
    "idle_up": [{ "x": 0, "y": 64 }, { "x": 32, "y": 64 }, { "x": 64, "y": 64 }, { "x": 96, "y": 64 }],
    "run_down": [{ "x": 0, "y": 96 }, { "x": 32, "y": 96 }, { "x": 64, "y": 96 }, { "x": 96, "y": 96 }],
    "run_right": [{ "x": 0, "y": 128 }, { "x": 32, "y": 128 }, { "x": 64, "y": 128 }, { "x": 96, "y": 128 }],
    "run_up": [{ "x": 0, "y": 160 }, { "x": 32, "y": 160 }, { "x": 64, "y": 160 }, { "x": 96, "y": 160 }]
  }
};

const playerImage = new Image();
playerImage.src = '/assets/spritesheet.png';
const bgImage = new Image();
bgImage.src = '/assets/background.png'; 

const keys = {};

const world = {
    width: 480 * SCALE, 
    height: 320 * SCALE
};

const player = {
    x: world.width / 2, 
    y: world.height / 2,
    w: 32 * SCALE,      
    h: 32 * SCALE,      
    direction: 'down',
    isMoving: false,
    frameIndex: 0,
    tickCount: 0
};

const camera = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height
};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function update() {
    player.isMoving = false;
    let dx = 0; 
    let dy = 0;

    if (keys['ArrowUp'] || keys['w']) { dy = -MOVEMENT_SPEED; player.direction = 'up'; }
    if (keys['ArrowDown'] || keys['s']) { dy = MOVEMENT_SPEED; player.direction = 'down'; }
    if (keys['ArrowLeft'] || keys['a']) { dx = -MOVEMENT_SPEED; player.direction = 'left'; }
    if (keys['ArrowRight'] || keys['d']) { dx = MOVEMENT_SPEED; player.direction = 'right'; }

    if (dx !== 0 || dy !== 0) {
        player.isMoving = true;
        player.x += dx;
        player.y += dy;
    }

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.w > world.width) player.x = world.width - player.w;
    if (player.y + player.h > world.height) player.y = world.height - player.h;

    camera.x = (player.x + player.w/2) - (canvas.width / 2);
    camera.y = (player.y + player.h/2) - (canvas.height / 2);

    if (camera.x < 0) camera.x = 0;
    if (camera.y < 0) camera.y = 0;
    if (camera.x + camera.w > world.width) camera.x = world.width - camera.w;
    if (camera.y + camera.h > world.height) camera.y = world.height - camera.h;

    player.tickCount++;
    if (player.tickCount > ANIMATION_SPEED) {
        console.log(player.tickCount);
        player.tickCount = 0;
        player.frameIndex = (player.frameIndex + 1) % 4;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        bgImage, 
        0, 0, 480, 320,                      
        Math.floor(-camera.x), Math.floor(-camera.y), 
        world.width, world.height             
    );

    let animType = player.isMoving ? 'run_' : 'idle_';
    let animDir = player.direction === 'left' ? 'right' : player.direction; 
    
    let frames = spriteData.animations[animType + animDir];
    if(!frames) return; 
    let frame = frames[player.frameIndex];
    let screenX = Math.floor(player.x - camera.x);
    let screenY = Math.floor(player.y - camera.y);

    if (player.direction === 'left') {
        ctx.save();
        ctx.translate(screenX + player.w, screenY);
        ctx.scale(-1, 1);
        ctx.drawImage(
            playerImage,
            frame.x, frame.y, 32, 32,
            0, 0, player.w, player.h
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            playerImage,
            frame.x, frame.y, 32, 32,
            screenX, screenY, player.w, player.h
        );
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

let imagesLoaded = 0;
const onImageLoad = () => {
    imagesLoaded++;
    if(imagesLoaded === 2) loop();
};
playerImage.onload = onImageLoad;
bgImage.onload = onImageLoad;