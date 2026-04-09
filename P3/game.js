const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// =====================
// 🖼️ IMÁGENES
// =====================
let shipImg = new Image();
shipImg.src = "Pop1.png";

let shipShootImg = new Image();
shipShootImg.src = "Pop2.png";

let alienImg = new Image();
alienImg.src = "alien.png";

// =====================
// 🚀 PLAYER
// =====================
let playerX = 400;
let playerY = 540;
let playerWidth = 60;
let playerHeight = 60;
let playerSpeed = 5;
let lives = 3;
let shooting = false;
let shootTimer = 0;

// =====================
// 🔋 ENERGÍA
// =====================
let energy = 5;
let maxEnergy = 5;

// =====================
// 🎮 INPUT
// =====================
let left = false;
let right = false;
let space = false;

document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowLeft") left = true;
    if (e.key === "ArrowRight") right = true;
    if (e.key === " ") space = true;
});

document.addEventListener("keyup", function(e) {
    if (e.key === "ArrowLeft") left = false;
    if (e.key === "ArrowRight") right = false;
    if (e.key === " ") space = false;
});

// =====================
// 🔫 BALAS
// =====================
let bullets = [];
let enemyBullets = [];

// =====================
// 👾 ALIENS
// =====================
let aliens = [];
let rows = 3;
let cols = 8;

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        aliens.push({
            x: 60 + j * 80,
            y: 50 + i * 60,
            w: 40,
            h: 40
        });
    }
}

let direction = 1;
let speed = 1;

// =====================
// 🧮 ESTADO
// =====================
let score = 0;
let gameOver = false;

// =====================
// 🔫 DISPARO
// =====================
function shoot() {
    if (energy > 0) {
        bullets.push({
            x: playerX + playerWidth / 2,
            y: playerY
        });

        energy--;

        shooting = true;
        shootTimer = 10;
    }
}
// =====================
// 🔋 RECARGA
// =====================
setInterval(function() {
    if (energy < maxEnergy) {
        energy++;
    }
}, 500);

// =====================
// 👾 DISPARO ENEMIGO
// =====================
setInterval(function() {
    if (aliens.length > 0) {
        let r = Math.floor(Math.random() * aliens.length);
        let a = aliens[r];

        enemyBullets.push({
            x: a.x + 20,
            y: a.y
        });
    }
}, 1000);

// =====================
// 🔄 UPDATE
// =====================
function update() {

    if (gameOver) return;

    // MOVIMIENTO PLAYER
    if (left && playerX > 0) playerX -= playerSpeed;
    if (right && playerX < canvas.width - playerWidth) playerX += playerSpeed;

    if (space) shoot();

    // BALAS PLAYER
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 5;

        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // BALAS ENEMIGAS
    for (let i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].y += 4;

        if (
            enemyBullets[i].x > playerX &&
            enemyBullets[i].x < playerX + playerWidth &&
            enemyBullets[i].y > playerY &&
            enemyBullets[i].y < playerY + playerHeight
        ) {
            enemyBullets.splice(i, 1);
            lives--;
            i--;

            if (lives <= 0) {
                gameOver = true;
            }
        }
    }

    // MOVIMIENTO ALIENS
    let edge = false;

    for (let i = 0; i < aliens.length; i++) {
        aliens[i].x += direction * speed;

        if (aliens[i].x <= 0 || aliens[i].x >= canvas.width - aliens[i].w) {
            edge = true;
        }
    }

    // 🚨 SI LLEGAN AL FONDO → GAME OVER
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].y + aliens[i].h >= playerY) {
            gameOver = true;
        }
    }

    if (edge) {
        direction = direction * -1;

        for (let i = 0; i < aliens.length; i++) {
            aliens[i].y += 20;
        }
    }

    // VELOCIDAD PROGRESIVA
    speed = 1 + (3 - aliens.length / 10);

    // COLISIONES
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < aliens.length; j++) {

            if (
                bullets[i].x > aliens[j].x &&
                bullets[i].x < aliens[j].x + aliens[j].w &&
                bullets[i].y > aliens[j].y &&
                bullets[i].y < aliens[j].y + aliens[j].h
            ) {
                bullets.splice(i, 1);
                aliens.splice(j, 1);
                score += 10;

                i--;
                break;
            }
        }
    }

    if (aliens.length === 0) {
        gameOver = true;
    }

    if (shooting) {
        shootTimer--;

        if (shootTimer <= 0) {
            shooting = false;
    }
}
}

// =====================
// 🎨 DRAW
// =====================
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🚀 PLAYER (SPRITE)
    let img = shipImg;

    if (shooting) {
        img = shipShootImg;
    }

    ctx.drawImage(img, playerX, playerY, playerWidth, playerHeight);
    // 🔫 BALAS
    ctx.fillStyle = "yellow";
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillRect(bullets[i].x, bullets[i].y, 4, 10);
    }

    // 🔴 BALAS ENEMIGAS
    ctx.fillStyle = "red";
    for (let i = 0; i < enemyBullets.length; i++) {
        ctx.fillRect(enemyBullets[i].x, enemyBullets[i].y, 4, 10);
    }

    // 👾 ALIENS (SPRITE)
    for (let i = 0; i < aliens.length; i++) {
        ctx.drawImage(
            alienImg,
            aliens[i].x,
            aliens[i].y,
            aliens[i].w,
            aliens[i].h
        );
    }

    // 📊 UI
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Puntos: " + score, 10, 20);
    ctx.fillText("Vidas: " + lives, 10, 40);
    ctx.fillText("Energia: " + energy, 10, 60);

    // FINAL
    if (gameOver) {
        ctx.font = "40px Arial";

        if (aliens.length === 0) {
            ctx.fillText("VICTORIA", 300, 300);
        } else {
            ctx.fillText("GAME OVER", 280, 300);
        }
    }
}

// =====================
// 🔁 LOOP
// =====================
function loop() {
    update();
    draw();
}

// INICIAR JUEGO CUANDO CARGUE LA IMAGEN
shipImg.onload = function() {
    setInterval(loop, 1000 / 60);
};