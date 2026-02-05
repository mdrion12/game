const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.w / 2;
    player.y = canvas.height / 2 - player.h / 2;
}
window.addEventListener('resize', resizeCanvas);

let life = 150;
let score = 0;
let bees = [];
let gameStarted = false;

let player = { x: 0, y: 0, w: 100, h: 100 };

let humanImg = new Image();
let faceImg = new Image();
let beeImg = new Image();
beeImg.src = "assets/bee_body.png";


let hitSound = new Audio("assets/hit.mp3");
let hurtSound = new Audio("assets/hurt.mp3");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

document.getElementById("humanInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) { humanImg.src = evt.target.result; }
        reader.readAsDataURL(file);
    }
});
document.getElementById("faceInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) { faceImg.src = evt.target.result; }
        reader.readAsDataURL(file);
    }
});


startBtn.addEventListener("click", function () {
    if (humanImg.src && faceImg.src) {
        gameStarted = true;
        document.getElementById("controls").style.display = "none";
        resizeCanvas();
        gameLoop();
    } else {
        alert("Please select both human and bee face images!");
    }
});


restartBtn.addEventListener("click", function () {
    life = 150;
    score = 0;
    bees = [];
    gameStarted = true;
    restartBtn.style.display = "none";
    gameLoop();
});


function handlePunch(x, y) {
    bees.forEach((bee, i) => {
        if (x >= bee.x && x <= bee.x + bee.w && y >= bee.y && y <= bee.y + bee.h) {
            let s = hitSound.cloneNode();
            s.play();
            bees.splice(i, 1);
            score += 10;
        }
    });
}

canvas.addEventListener("click", e => {
    if (!gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    handlePunch(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener("touchstart", e => {
    if (!gameStarted) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    handlePunch(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });


function spawnBee() {
    let side = Math.floor(Math.random() * 4);
    let x, y;
    if (side == 0) { x = 0; y = Math.random() * canvas.height; }
    else if (side == 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side == 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }

    bees.push({ x: x, y: y, w: 50, h: 50 });
}


function moveBees() {
    bees.forEach((bee, i) => {
        let speed = 0.7;
        if (bee.x < player.x) bee.x += speed;
        if (bee.x > player.x) bee.x -= speed;
        if (bee.y < player.y) bee.y += speed;
        if (bee.y > player.y) bee.y -= speed;

        if (bee.x < player.x + player.w && bee.x + bee.w > player.x &&
            bee.y < player.y + player.h && bee.y + bee.h > player.y) {
            let s = hurtSound.cloneNode();
            s.play();
            life -= 5;
            bees.splice(i, 1);
        }
    });
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.save();
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = 20;
    ctx.drawImage(humanImg, player.x, player.y, player.w, player.h);
    ctx.restore();


    bees.forEach(bee => {
        ctx.drawImage(beeImg, bee.x, bee.y, bee.w, bee.h);
        ctx.globalAlpha = 0.8;
        ctx.drawImage(faceImg, bee.x + 12, bee.y + 10, 25, 25);
        ctx.globalAlpha = 1.0;
    });

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}  Life: ${Math.floor(life)}`, 10, 30);
}


function gameLoop() {
    if (!gameStarted) return;

    if (Math.random() < 0.02) spawnBee();
    moveBees();
    draw();

    if (life > 0) {
        requestAnimationFrame(gameLoop);
    } else {
        gameStarted = false;
        restartBtn.style.display = "block";
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 20);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(`Your Score: ${score}`, canvas.width / 2 - 90, canvas.height / 2 + 30);
    }
}