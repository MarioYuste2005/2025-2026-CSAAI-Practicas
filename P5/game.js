const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let bola = null;
let jugador = null;
let bots = [];
let owner = null;
let cooldown = 0;
let stealCooldown = 0;

let golesAzul = 0;
let golesRojo = 0;

let gamePaused = false;
let mensajeGol = "";

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key in keys) keys[key] = true;

  if (e.code === "Space" && owner === jugador) {
    shootBall(jugador);
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = false;
});

window.addEventListener("keydown", (e) => {

  if (gamePaused && e.key.toLowerCase() === "c") {
    resetPositions();
    gamePaused = false;
  }

});

function resetPositions() {

  // jugador
  jugador.x = 120;
  jugador.y = HEIGHT / 2;

  // bots azules
  bots[0].x = 120;
  bots[0].y = HEIGHT / 4;

  bots[1].x = 120;
  bots[1].y = HEIGHT * 3 / 4;

  // bots rojos
  bots[2].x = 780;
  bots[2].y = HEIGHT / 4;

  bots[3].x = 780;
  bots[3].y = HEIGHT / 2;

  bots[4].x = 780;
  bots[4].y = HEIGHT * 3 / 4;

  // reset direcciones
  jugador.dirX = 1;
  jugador.dirY = 0;

  for (const bot of bots) {
    bot.dirX = -1;
    bot.dirY = 0;
  }

  // balón centro
  owner = null;

  bola.x = WIDTH / 2;
  bola.y = HEIGHT / 2;

  bola.vx = 0;
  bola.vy = 0;

  cooldown = 30;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isTouching(a, b) {
  return distance(a.x, a.y, b.x, b.y) < a.radius + b.radius;
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
  ctx.fillStyle = "#2e8b57";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < WIDTH; i += 80) {
    ctx.fillStyle = i % 160 === 0 ? "#2f9b5f" : "#2b7f50";
    ctx.fillRect(i, 0, 80, HEIGHT);
  }

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;

  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 40);
  ctx.lineTo(WIDTH / 2, HEIGHT - 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 70, 0, Math.PI * 2);
  ctx.stroke();

  // MARCADOR EN EL CAMPO
  ctx.save();

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // marcador azul
  ctx.fillText(
    golesAzul,
    WIDTH / 2 - 100,
    HEIGHT / 2
  );

  // separador
  ctx.fillText(
    "-",
    WIDTH / 2,
    HEIGHT / 2
  );

  // marcador rojo
  ctx.fillText(
    golesRojo,
    WIDTH / 2 + 100,
    HEIGHT / 2
  );

  ctx.restore();
}

function crearBola() {
  bola = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 16,
    vx: 0,
    vy: 0
  };
}

function drawBola() {
  ctx.save();
  ctx.translate(bola.x, bola.y);

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, bola.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function crearPortD() {
  portd = {
    x: WIDTH - 20,
    y: HEIGHT / 2,
    width: 20,
    height: 120
  };
}

function drawPortD() {
  ctx.save();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;

  ctx.strokeRect(
    portd.x,
    portd.y - portd.height / 2,
    portd.width,
    portd.height
  );

  ctx.restore();
}

function crearPortI() {
  porti = {
    x: 0,
    y: HEIGHT / 2,
    width: 20,
    height: 120
  };
}

function drawPortI() {
  ctx.save();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;

  ctx.strokeRect(
    porti.x,
    porti.y - porti.height / 2,
    porti.width,
    porti.height
  );

  ctx.restore();
}

function shootBall(tirador) {
  const power = 10;

  bola.vx = tirador.dirX * power;
  bola.vy = tirador.dirY * power;

  owner = null;
  cooldown = 5;
}

function objectInRay(bot, obj) {
  const x1 = bot.rayStartX;
  const y1 = bot.rayStartY;
  const x2 = bot.rayEndX;
  const y2 = bot.rayEndY;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const fx = obj.x - x1;
  const fy = obj.y - y1;

  const t = (fx * dx + fy * dy) / (dx * dx + dy * dy);

  if (t < 0 || t > 1) return false;

  const closestX = x1 + dx * t;
  const closestY = y1 + dy * t;

  const dist = Math.hypot(obj.x - closestX, obj.y - closestY);

  return dist <= obj.radius;
}

function intentarRobo() {
  if (!owner) return;

  // cooldown global de robo
  if (stealCooldown > 0) return;

  const todos = [jugador, ...bots];

    for (const p of todos) {

      // no puede robarse a sí mismo
      if (p === owner) continue;

      // solo rivales
      if (p.color === owner.color) continue;

      // si está tocando al poseedor
      if (isTouching(p, owner)) {

        let probabilidad = 0.2;

        if (p.pos === "defensa") {
          probabilidad = 0.6;
        }

        if (Math.random() < probabilidad) {

          owner = p;

          // pegar balón al nuevo dueño
          bola.vx = 0;
          bola.vy = 0;

          // cooldowns
          stealCooldown = 200;
          cooldown = 10;

        }
      break;
    }
  }
}

function resetAfterGoal() {
  owner = null;

  bola.x = WIDTH / 2;
  bola.y = HEIGHT / 2;

  bola.vx = 0;
  bola.vy = 0;
}


class Character {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.dirX = 1;
    this.dirY = 0;
  }

  moveTowards(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.001) {
      this.dirX = dx / dist;
      this.dirY = dy / dist;

      this.x += this.dirX * this.speed;
      this.y += this.dirY * this.speed;
    }

    this.x = clamp(this.x, this.radius, WIDTH - this.radius);
    this.y = clamp(this.y, this.radius, HEIGHT - this.radius);
  }
}

class Jugador extends Character {
  constructor(x, y) {
    super(x, y, 24, 3);
    this.color = "azul"

    this.rayLength = 200;
    this.rayStartX = x;
    this.rayStartY = y;
    this.rayEndX = x;
    this.rayEndY = y;
  }

  updateRay() {
    this.rayStartX = this.x;
    this.rayStartY = this.y;

    this.rayEndX = this.x + this.dirX * this.rayLength;
    this.rayEndY = this.y + this.dirY * this.rayLength;
  }

  update() {

    this.updateRay()
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.dirX = dx / dist;
      this.dirY = dy / dist;

      this.x += this.dirX * this.speed;
      this.y += this.dirY * this.speed;
    }

    this.x = clamp(this.x, this.radius, WIDTH - this.radius);
    this.y = clamp(this.y, this.radius, HEIGHT - this.radius);

    this.updateRay()
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = "#0011ff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

class Bot extends Character {
  constructor(x, y, color, pos) {
    super(x, y, 24, 2);

    this.color = color;
    this.pos = pos;

    this.rayLength = 200;
    this.rayStartX = x;
    this.rayStartY = y;
    this.rayEndX = x;
    this.rayEndY = y;
  }

  updateRay() {
    this.rayStartX = this.x;
    this.rayStartY = this.y;

    this.rayEndX = this.x + this.dirX * this.rayLength;
    this.rayEndY = this.y + this.dirY * this.rayLength;
  }

  passTo(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      from.dirX = dx / dist;
      from.dirY = dy / dist;
    }

    shootBall(from);
  }

  lateral() {
    if (owner == this && this.color === "azul") {
      this.moveTowards(portd.x, 400);

      if (this.x >= 700) {
        this.moveTowards(jugador.x, jugador.y);

        if (objectInRay(this, jugador)) {
          shootBall(this);
        }
      }
    }

    if (owner == this && this.color === "rojo") {
      this.moveTowards(porti.x, 100);

      if (this.x <= 100) {
        const delantero = bots.find(bot =>
          bot !== this &&
          bot.color === this.color &&
          bot.pos === "delantero"
        );

        if (delantero) {
          this.moveTowards(delantero.x, delantero.y);

          if (objectInRay(this, delantero)) {
            shootBall(this);
          }
        }
      }
    }

    if (owner !== this) {
      if (owner !== null) {
        if (this.color == "azul"){
          this.moveTowards(owner.x + 30, 400);
        }
        if (this.color == "rojo"){
          this.moveTowards(owner.x - 30, 100);
        }
      }
      if (owner == null) {
        this.moveTowards(bola.x, bola.y);
      }
    }
  }

  defensa() {
    // 1. SIN BALÓN → comportamiento normal
    if (owner == null) {
      if (this.color == "azul") {
        this.moveTowards(bola.x - 200, bola.y);
      }

      if (this.color == "rojo") {
        this.moveTowards(bola.x + 200, bola.y);
      }
      return;
    }

    // 2. SI NO ES EL DUEÑO DE LA PELOTA → apoyo simple
    if (owner !== this) {
      if (owner.color == this.color) {
        if (this.color == "azul") {
          this.moveTowards(owner.x - 100, owner.y);
        } else {
          this.moveTowards(owner.x + 100, owner.y);
        }
      } else {
        if (this.color == "azul") {
          this.moveTowards(bola.x - 200, bola.y);
        } else {
          this.moveTowards(bola.x + 200, bola.y);
        }
      }
      return;
    }

    if (owner == this && this.color === "azul") {
      this.moveTowards(WIDTH/2, HEIGHT/2);

      if (this.x >= 420) {
        this.moveTowards(jugador.x, jugador.y);

        if (objectInRay(this, jugador)) {
          shootBall(this);
        }
      }
    }

    if (owner == this && this.color === "rojo") {
      this.moveTowards(WIDTH/2, HEIGHT/2);

      if (this.x <= 480) {
        const delantero = bots.find(bot =>
          bot !== this &&
          bot.color === this.color &&
          bot.pos === "delantero"
        );

        if (delantero) {
          this.moveTowards(delantero.x, delantero.y);

          if (objectInRay(this, delantero)) {
            shootBall(this);
          }
        }
      }
    }
  }

  delantero() {
    if (owner == null) {
      this.moveTowards(bola.x, bola.y);
    }

    if (owner !== null) {
      if (owner == this) {
        this.moveTowards(porti.x, porti.y);

        if (this.x <= 180) {
          let tiroLibre = true;

          for (const bot of bots) {
            if (bot.color !== this.color) {
              if (objectInRay(this, bot)) {
                tiroLibre = false;
                break;
              }
            }
          }

          if (this.color === "rojo" && objectInRay(this, jugador)) {
            tiroLibre = false;
          }

          if (tiroLibre) {
            shootBall(this);
          } else {
            const lateral = bots.find(bot =>
              bot !== this &&
              bot.color == this.color &&
              bot.pos == "lateral"
            );

            if (lateral) {
              this.passTo(this, lateral);
            }
          }
        }
      }
      if (owner !== null) {
        if (owner !== this && owner.color == this.color) {
          this.moveTowards(porti.x + 100, porti.y);
        }

        if (owner !== this && owner.color !== this.color) {
          this.moveTowards(bola.x + 15, bola.y);
        }
      }
    }
  }
  update() {
    this.updateRay();

    if (this.pos == "lateral") {
      this.lateral();
    }
    if (this.pos == "defensa") {
      this.defensa();
    }
    if (this.pos == "delantero") {
      this.delantero();
    }

    this.updateRay();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = this.color === "azul" ? "#0011ff" : "#ff0000";

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    //ctx.beginPath();
    //ctx.moveTo(this.rayStartX, this.rayStartY);
    //ctx.lineTo(this.rayEndX, this.rayEndY);
    //ctx.strokeStyle = "yellow";
    //ctx.lineWidth = 2;
    //ctx.stroke();
  }
}

function setupScene() {
  crearBola();
  crearPortD();
  crearPortI();

  jugador = new Jugador(120, HEIGHT / 2);

  bots = [
    new Bot(120, HEIGHT / 4, "azul", "lateral"),
    new Bot(120, HEIGHT * 3 / 4, "azul", "defensa"),

    new Bot(780, HEIGHT / 4, "rojo", "lateral"),
    new Bot(780, HEIGHT / 2, "rojo", "delantero"),
    new Bot(780, HEIGHT * 3 / 4, "rojo", "defensa")
  ];
}

function update() {
  if (gamePaused) return;
  if (cooldown > 0) cooldown--;
  if (stealCooldown > 0) stealCooldown--;

  jugador.update();
  bots.forEach(bot => bot.update());


  if (!owner && cooldown <= 0) {
    if (isTouching(jugador, bola)) {
      owner = jugador;
    }

    for (const bot of bots) {
      if (isTouching(bot, bola)) {
        owner = bot;
        break;
      }
    }
  }
  


  if (owner) {
    const offset = owner.radius + bola.radius - 6;

    bola.x = owner.x + owner.dirX * offset;
    bola.y = owner.y + owner.dirY * offset;

    bola.vx = 0;
    bola.vy = 0;
  } else {
    bola.x += bola.vx;
    bola.y += bola.vy;

    bola.vx *= 0.98;
    bola.vy *= 0.98;

    bola.x = clamp(bola.x, bola.radius, WIDTH - bola.radius);
    bola.y = clamp(bola.y, bola.radius, HEIGHT - bola.radius);
  }

  for (let i = 0; i < bots.length; i++) {
    resolveCollision(bots[i], jugador);

    for (let j = i + 1; j < bots.length; j++) {
      resolveCollision(bots[i], bots[j]);
    }
  }

  intentarRobo();

  // GOL IZQUIERDA -> marca azul
  if (
    bola.x - bola.radius <= porti.x + porti.width &&
    bola.y >= porti.y - porti.height / 2 &&
    bola.y <= porti.y + porti.height / 2
  ) {

    golesRojo++;
    mensajeGol = "¡¡¡ GOL DEL EQUIPO ROJO !!!";
    gamePaused = true;
  }

  // GOL DERECHA -> marca rojo
  if (
    bola.x + bola.radius >= portd.x &&
    bola.y >= portd.y - portd.height / 2 &&
    bola.y <= portd.y + portd.height / 2
  ) {

    golesAzul++;
    mensajeGol = "¡¡¡ GOL DEL EQUIPO AZUL !!!";
    gamePaused = true;
  }
}

function draw() {
  drawBackground();
  drawPortD();
  drawPortI();
  drawBola();
  jugador.draw();
  bots.forEach(bot => bot.draw());

  if (gamePaused) {

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "white";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      mensajeGol,
      WIDTH / 2,
      HEIGHT / 2 - 30
    );

    ctx.font = "28px Arial";

    ctx.fillText(
      "Pulsa cualquier C para continuar",
      WIDTH / 2,
      HEIGHT / 2 + 40
    );

    ctx.restore();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

setupScene();
loop();