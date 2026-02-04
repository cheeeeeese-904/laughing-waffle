const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const payloadEl = document.getElementById("replayPayload");
const newMatchBtn = document.getElementById("newMatch");
const exportBtn = document.getElementById("exportReplay");
const importBtn = document.getElementById("importReplay");

const field = {
  width: canvas.width,
  height: canvas.height,
  goalWidth: 110,
};

const player = {
  x: 120,
  y: field.height / 2,
  radius: 16,
  speed: 3.2,
  color: "#f9d423",
};

const opponent = {
  x: field.width - 120,
  y: field.height / 2,
  radius: 16,
  speed: 2.6,
  color: "#ef4444",
};

const ball = {
  x: field.width / 2,
  y: field.height / 2,
  radius: 10,
  vx: 0,
  vy: 0,
};

let rng = null;
let seed = null;
let score = { home: 0, away: 0 };
let matchStart = 0;
let inputEvents = [];
let keyState = new Set();
let isReplay = false;
let replayTimers = [];

const KEY_BINDINGS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

function mulberry32(seedValue) {
  let t = seedValue;
  return function () {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function setStatus(message) {
  statusEl.textContent = message;
}

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

function resetPositions() {
  player.x = 120;
  player.y = field.height / 2;
  opponent.x = field.width - 120;
  opponent.y = field.height / 2;
  ball.x = field.width / 2 + (rng() - 0.5) * 60;
  ball.y = field.height / 2 + (rng() - 0.5) * 60;
  ball.vx = (rng() - 0.5) * 3.5;
  ball.vy = (rng() - 0.5) * 3.5;
}

function startMatch({ newSeed, events = [], replay = false }) {
  seed = newSeed;
  rng = mulberry32(seed);
  score = { home: 0, away: 0 };
  inputEvents = replay ? events.map((event) => ({ ...event })) : [];
  keyState = new Set();
  isReplay = replay;
  matchStart = performance.now();
  clearReplayTimers();
  resetPositions();
  if (isReplay) {
    scheduleReplay(events);
    setStatus(`Replaying match with seed ${seed}.`);
  } else {
    setStatus(`Recording match with seed ${seed}. Use arrow keys.`);
  }
}

function recordInput(action, key) {
  if (isReplay) return;
  inputEvents.push({
    t: Math.round(performance.now() - matchStart),
    action,
    key,
  });
}

function applyInputEvent(event) {
  if (event.action === "down") {
    keyState.add(event.key);
  } else if (event.action === "up") {
    keyState.delete(event.key);
  }
}

function scheduleReplay(events) {
  replayTimers = events.map((event) =>
    setTimeout(() => {
      applyInputEvent(event);
    }, event.t)
  );
}

function clearReplayTimers() {
  replayTimers.forEach((timer) => clearTimeout(timer));
  replayTimers = [];
}

function handleKeyDown(event) {
  if (!KEY_BINDINGS.has(event.key)) return;
  if (keyState.has(event.key)) return;
  keyState.add(event.key);
  recordInput("down", event.key);
}

function handleKeyUp(event) {
  if (!KEY_BINDINGS.has(event.key)) return;
  keyState.delete(event.key);
  recordInput("up", event.key);
}

function updatePlayer() {
  if (keyState.has("ArrowUp")) {
    player.y -= player.speed;
  }
  if (keyState.has("ArrowDown")) {
    player.y += player.speed;
  }
  if (keyState.has("ArrowLeft")) {
    player.x -= player.speed;
  }
  if (keyState.has("ArrowRight")) {
    player.x += player.speed;
  }
  player.x = Math.max(player.radius, Math.min(field.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(field.height - player.radius, player.y));
}

function updateOpponent() {
  const jitter = (rng() - 0.5) * 1.4;
  const chase = ball.y > opponent.y ? 1 : -1;
  opponent.y += (chase * opponent.speed + jitter) * 0.5;
  opponent.y = Math.max(opponent.radius, Math.min(field.height - opponent.radius, opponent.y));
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y <= ball.radius || ball.y >= field.height - ball.radius) {
    ball.vy *= -1;
  }

  if (ball.x <= ball.radius) {
    if (ball.y > field.height / 2 - field.goalWidth / 2 && ball.y < field.height / 2 + field.goalWidth / 2) {
      score.away += 1;
      resetPositions();
      return;
    }
    ball.vx *= -1;
  }

  if (ball.x >= field.width - ball.radius) {
    if (ball.y > field.height / 2 - field.goalWidth / 2 && ball.y < field.height / 2 + field.goalWidth / 2) {
      score.home += 1;
      resetPositions();
      return;
    }
    ball.vx *= -1;
  }
}

function handleCollision(entity) {
  const dx = ball.x - entity.x;
  const dy = ball.y - entity.y;
  const distance = Math.hypot(dx, dy);
  if (distance < ball.radius + entity.radius) {
    const angle = Math.atan2(dy, dx);
    const power = 3.6;
    ball.vx = Math.cos(angle) * power + (rng() - 0.5) * 0.6;
    ball.vy = Math.sin(angle) * power + (rng() - 0.5) * 0.6;
  }
}

function drawField() {
  ctx.clearRect(0, 0, field.width, field.height);
  ctx.fillStyle = "#0e7a3b";
  ctx.fillRect(0, 0, field.width, field.height);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(field.width / 2, 0);
  ctx.lineTo(field.width / 2, field.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(field.width / 2, field.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(0, field.height / 2 - field.goalWidth / 2, 12, field.goalWidth);
  ctx.strokeRect(field.width - 12, field.height / 2 - field.goalWidth / 2, 12, field.goalWidth);
}

function drawEntity(entity, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall() {
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";
  ctx.fillText(`Home ${score.home}`, field.width / 2 + 30, 24);
  ctx.fillText(`Away ${score.away}`, field.width / 2 - 100, 24);
}

function gameLoop() {
  updatePlayer();
  updateOpponent();
  updateBall();
  handleCollision(player);
  handleCollision(opponent);
  drawField();
  drawEntity(player, player.color);
  drawEntity(opponent, opponent.color);
  drawBall();
  drawScore();
  requestAnimationFrame(gameLoop);
}

function exportReplay() {
  const payload = {
    seed,
    events: inputEvents,
  };
  payloadEl.value = JSON.stringify(payload);
  setStatus(`Replay exported with ${inputEvents.length} events.`);
}

function importReplay() {
  try {
    const payload = JSON.parse(payloadEl.value);
    if (!payload || typeof payload.seed !== "number" || !Array.isArray(payload.events)) {
      throw new Error("Invalid payload format");
    }
    startMatch({ newSeed: payload.seed, events: payload.events, replay: true });
  } catch (error) {
    setStatus(`Replay import failed: ${error.message}`);
  }
}

newMatchBtn.addEventListener("click", () => {
  startMatch({ newSeed: randomSeed(), events: [], replay: false });
});

exportBtn.addEventListener("click", exportReplay);
importBtn.addEventListener("click", importReplay);

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

startMatch({ newSeed: randomSeed(), events: [], replay: false });
requestAnimationFrame(gameLoop);
