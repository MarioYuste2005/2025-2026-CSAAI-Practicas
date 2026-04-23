const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stateEl = document.getElementById("state");
//const relocateBtn = document.getElementById("relocateBtn");
//const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let bola = null;
let jugador = null;
let bots = [];
let animationId = null;

function setState(text) {
  stateEl.textContent = text;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);

  const minDist = a.radius + b.radius;

  if (dist < minDist && dist > 0) {
    const overlap = minDist - dist;
    const nx = dx / dist;
    const ny = dy / dist;

    a.x -= nx * overlap / 2;
    a.y -= ny * overlap / 2;

    b.x += nx * overlap / 2;
    b.y += ny * overlap / 2;
  }
}

function drawBackground() {
  // Césped
  ctx.fillStyle = "#2e8b57";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Franjas del césped
  for (let i = 0; i < WIDTH; i += 80) {
    ctx.fillStyle = i % 160 === 0 ? "#2f9b5f" : "#2b7f50";
    ctx.fillRect(i, 0, 80, HEIGHT);
  }

  // Líneas del campo
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;

  // Borde exterior
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  // Línea central
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 40);
  ctx.lineTo(WIDTH / 2, HEIGHT - 40);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Área izquierda
  ctx.strokeRect(40, HEIGHT / 2 - 120, 120, 240);
  ctx.strokeRect(40, HEIGHT / 2 - 60, 50, 120);

  // Área derecha
  ctx.strokeRect(WIDTH - 160, HEIGHT / 2 - 120, 120, 240);
  ctx.strokeRect(WIDTH - 90, HEIGHT / 2 - 60, 50, 120);

  // Porterías
  ctx.strokeRect(20, HEIGHT / 2 - 40, 20, 80);
  ctx.strokeRect(WIDTH - 40, HEIGHT / 2 - 40, 20, 80);
}

function crearBola() {
  bola = {
    x: (canvas.width)/2,
    y: (canvas.height)/2,
    radius: 18
  };
}

function drawBola() {
  ctx.save();
  ctx.translate(bola.x, bola.y);

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();


  ctx.restore();
}

class Character {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
  }

  moveTowards(targetX, targetY, factor = 1) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.001) {
      this.x += (dx / dist) * this.speed * factor;
      this.y += (dy / dist) * this.speed * factor;
    }

    this.x = clamp(this.x, this.radius, WIDTH - this.radius);
    this.y = clamp(this.y, this.radius, HEIGHT - this.radius);
  }
}

class Jugador extends Character {
  constructor(x, y) {
    super(x, y, 24, 1.2);
    this.name = "Jugador";
  }

  update() {
    this.moveTowards(bola.x, bola.y);
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = "#0011ff";
    ctx.strokeStyle = "#000000"
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    ctx.restore();
  }
}


class Bot extends Character {
  constructor(x, y, color) {
    super(x, y, 24, 1.2);
    this.color = color;
    this.name = "Bot";
  }

  update() {
    this.moveTowards(bola.x, bola.y);
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.color == "azul") {
      ctx.fillStyle = "#0011ff";
    }
    if (this.color == "rojo") {
      ctx.fillStyle = "#fd0000";
    }
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();


    ctx.restore();
  }
}

function setupScene() {
  crearBola();

  jugador = new Jugador(120, (canvas.height / 2)),

  bots =[
    new Bot(120, (canvas.height / 2) - (canvas.height / 4), "azul"),
    new Bot(120, (canvas.height / 2) + (canvas.height / 4), "azul"),
    new Bot(780, (canvas.height / 2) - (canvas.height / 4), "rojo"),
    new Bot(780, (canvas.height / 2), "rojo"),
    new Bot(780, (canvas.height / 2) + (canvas.height / 4), "rojo")
  ] 
}

function update() {

  jugador.update();
  bots.forEach((bot) => bot.update());

  for (let i = 0; i < bots.length; i++) {
    resolveCollision(bots[i], bola);
    resolveCollision(bots[i], jugador);

    for (let j = i + 1; j < bots.length; j++) {
      resolveCollision(bots[i], bots[j]);
      
    }
  }
  resolveCollision(jugador, bola)
}

function draw() {
  drawBackground();
  drawBola();
  jugador.draw();
  bots.forEach((bot) => bot.draw());

}

function loop() {
  update();
  draw();
  animationId = requestAnimationFrame(loop);
}

setupScene();
loop();