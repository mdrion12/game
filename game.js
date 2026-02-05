const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas full window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial resize

let life = 150;
let score = 0;

// Player (Human)
let player = {
    x: canvas.width / 2 - 50,  // Bigger
    y: canvas.height / 2 - 50,
    w: 100,   // Width
    h: 100    // Height
};

// Bee array
let bees = [];

// Images
let humanImg = new Image();
humanImg.src = "assets/human.png";

let beeImg = new Image();
beeImg.src = "assets/bee_body.png";

let faceImg = new Image();
faceImg.src = "assets/face.png";

// Sounds
let hitSound = new Audio("assets/hit.mp3");
let hurtSound = new Audio("assets/hurt.mp3");

// Mouse click to punch bee
canvas.addEventListener("click", function (e) {
    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    bees.forEach((bee, i) => {
        if (mx >= bee.x && mx <= bee.x + bee.w && my >= bee.y && my <= bee.y + bee.h) {
            // clone for instant sound
            let s = hitSound.cloneNode();
            s.play();
            bees.splice(i, 1);
            score += 10;
        }
    });
});

// Spawn bees randomly
function spawnBee() {
    let side = Math.floor(Math.random() * 4); // 0:left,1:right,2:top,3:bottom
    let x, y;
    if (side == 0) { x = 0; y = Math.random() * canvas.height; }
    else if (side == 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side == 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }

    bees.push({ x: x, y: y, w: 50, h: 50 });
}

// Move bees
function moveBees() {
    bees.forEach((bee, i) => {
        let speed = 0.7; // slow & smooth movement
        if (bee.x < player.x) bee.x += speed;
        if (bee.x > player.x) bee.x -= speed;
        if (bee.y < player.y) bee.y += speed;
        if (bee.y > player.y) bee.y -= speed;

        // Collision with player
        if (bee.x < player.x + player.w && bee.x + bee.w > player.x &&
            bee.y < player.y + player.h && bee.y + bee.h > player.y) {

            // instant hurt sound
            let s = hurtSound.cloneNode();
            s.play();

            life -= 5;
            bees.splice(i, 1);
        }
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw human with glow/shadow
    ctx.save();
    ctx.shadowColor = "yellow";  // glow color
    ctx.shadowBlur = 20;         // glow blur
    ctx.drawImage(humanImg, player.x, player.y, player.w, player.h);
    ctx.restore();

    // Draw bees
    bees.forEach(bee => {
        ctx.drawImage(beeImg, bee.x, bee.y, bee.w, bee.h);

        // semi-transparent face
        ctx.globalAlpha = 0.8;
        ctx.drawImage(faceImg, bee.x + 12, bee.y + 10, 25, 25);
        ctx.globalAlpha = 1.0;
    });

    // Score/Life
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}  Life: ${Math.floor(life)}`, 10, 30);
}

// Game loop
function gameLoop() {
    if (Math.random() < 0.02) { spawnBee(); } // spawn slower for smooth gameplay

    moveBees();
    draw();

    if (life > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 20);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(`Your Score: ${score}`, canvas.width / 2 - 90, canvas.height / 2 + 30);
    }
}

// Start the game
gameLoop();