const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const musicBtn = document.getElementById("musicBtn");
const pairSelect = document.getElementById("pairSelect");
const levelSelect = document.getElementById("levelSelect");
const currentLevelText = document.getElementById("currentLevel");
const timeText = document.getElementById("time");
const statusText = document.getElementById("status");
const message = document.getElementById("message");
const music = document.getElementById("bgMusic");

let gameRunning = false;
let musicEnabled = true;
let timerInterval;
let seconds = 0;

const pairs = {
  "casa-cama": ["🏠CASA", "🛏️CAMA"],
  "sol-sal": ["☀️SOL", "🧂SAL"],
  "gato-pato": ["🐈GATO", "🦆PATO"],
  "luna-tuna": ["🌙LUNA", "🐟TUNA"]
  
};

const levels = {
  1: [0,0,0,0,1,1,1,1],
  2: [0,0,1,1,0,0,1,1],
  3: [0,1,0,1,0,1,0,1],
  4: [0,1,1,0,1,0,0,1],
  5: [1,0,1,0,0,1,0,1]
};

const speeds = {
  1: 1000,
  2: 800,
  3: 650,
  4: 500,
  5: 350
};

function createGrid(words, level) {
  grid.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = words[levels[level][i]];
    grid.appendChild(card);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playLevel(level) {
  const words = pairs[pairSelect.value];
  createGrid(words, level);

  currentLevelText.textContent = level;
  statusText.textContent = "Jugando";
  message.textContent = "Prepárate...";

  await sleep(1000);

  const cards = document.querySelectorAll(".card");

  for (let i = 0; i < cards.length; i++) {
    if (!gameRunning) return;

    cards.forEach(card => card.classList.remove("active"));
    cards[i].classList.add("active");

    message.textContent = cards[i].textContent;

    await sleep(speeds[level]);
  }

  cards.forEach(card => card.classList.remove("active"));
}

async function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  seconds = 0;
  timeText.textContent = seconds;
  statusText.textContent = "Iniciado";

  pairSelect.disabled = true;
  levelSelect.disabled = true;

  if (musicEnabled) {
    music.play();
  }

  timerInterval = setInterval(() => {
    seconds++;
    timeText.textContent = seconds;
  }, 1000);

  const startLevel = parseInt(levelSelect.value);

  for (let level = startLevel; level <= 5; level++) {
    if (!gameRunning) return;
    await playLevel(level);
    await sleep(700);
  }

  stopGame();
  message.textContent = "¡Partida terminada!";
}

function stopGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  music.pause();
  music.currentTime = 0;

  pairSelect.disabled = false;
  levelSelect.disabled = false;

  statusText.textContent = "Detenido";
}

function toggleMusic() {
  musicEnabled = !musicEnabled;

  if (!musicEnabled) {
    music.pause();
  } else if (gameRunning) {
    music.play();
  }
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
musicBtn.addEventListener("click", toggleMusic);