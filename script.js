const canvas = document.getElementById("pitch");
const context = canvas.getContext("2d");

const scoreLeft = document.getElementById("score-left");
const scoreRight = document.getElementById("score-right");
const timerDisplay = document.getElementById("timer");
const resetButton = document.getElementById("reset");
const toggleButton = document.getElementById("toggle");
const shuffleButton = document.getElementById("shuffle");
const lengthSelect = document.getElementById("length");
const staminaBar = document.getElementById("stamina-bar");
const powerBar = document.getElementById("power-bar");
const possessionBar = document.getElementById("possession-bar");
const crowdDisplay = document.getElementById("crowd");
const windDisplay = document.getElementById("wind");
const momentumDisplay = document.getElementById("momentum");
const eventLog = document.getElementById("event-log");

const pitch = {
  width: canvas.width,
  height: canvas.height,
  margin: 40,
  goalWidth: 140,
  goalDepth: 28,
};

const state = {
  leftScore: 0,
  rightScore: 0,
  timer: 60,
  matchLength: 60,
  running: true,
  lastTime: 0,
  stamina: 100,
  powerCharge: 0,
  powerActive: 0,
  possession: 50,
  lastPowerSpawn: 0,
};

const player = {
  x: pitch.width / 2 - 120,
  y: pitch.height / 2,
  radius: 18,
  speed: 2.6,
  sprint: 4.2,
  color: "#1f8ef1",
};

const opponent = {
  x: pitch.width / 2 + 160,
  y: pitch.height / 2,
  radius: 18,
  speed: 2.1,
  color: "#ff6b6b",
};

const ball = {
  x: pitch.width / 2,
  y: pitch.height / 2,
  radius: 12,
  vx: 0,
  vy: 0,
};

const powerUp = {
  active: false,
  x: pitch.width / 2,
  y: pitch.height / 2,
  radius: 10,
};

const weather = {
  label: "Breezy",
  windX: 0.04,
  windY: 0,
};

const keys = new Set();

const events = [];

const addEvent = (message) => {
  events.unshift({ message, time: new Date().toLocaleTimeString() });
  if (events.length > 6) events.pop();
  eventLog.innerHTML = events
    .map((event) => `<li><strong>${event.time}</strong> — ${event.message}</li>`)
    .join("");
};

const resetPositions = () => {
  player.x = pitch.width / 2 - 120;
  player.y = pitch.height / 2;
  opponent.x = pitch.width / 2 + 160;
  opponent.y = pitch.height / 2;
  ball.x = pitch.width / 2;
  ball.y = pitch.height / 2;
  ball.vx = 0;
  ball.vy = 0;
  powerUp.active = false;
};

const resetGame = () => {
  state.leftScore = 0;
  state.rightScore = 0;
  state.timer = state.matchLength;
  state.running = true;
  resetPositions();
  addEvent("Kickoff! The crowd is roaring.");
  updateScoreboard();
};

const updateScoreboard = () => {
  scoreLeft.textContent = state.leftScore;
  scoreRight.textContent = state.rightScore;
  timerDisplay.textContent = state.timer;
  staminaBar.style.width = `${state.stamina}%`;
  powerBar.style.width = `${state.powerActive > 0 ? (state.powerActive / 6) * 100 : state.powerCharge}%`;
  possessionBar.style.width = `${state.possession}%`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const movePlayer = () => {
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;

  const moving = dx !== 0 || dy !== 0;
  const sprinting = keys.has("Shift") && state.stamina > 0;
  const speed = sprinting ? player.sprint : player.speed;
  const length = Math.hypot(dx, dy) || 1;

  if (moving) {
    player.x += (dx / length) * speed;
    player.y += (dy / length) * speed;
  }

  if (sprinting && moving) {
    state.stamina = Math.max(0, state.stamina - 0.6);
  } else {
    state.stamina = Math.min(100, state.stamina + 0.4);
  }

  player.x = clamp(player.x, pitch.margin, pitch.width - pitch.margin);
  player.y = clamp(player.y, pitch.margin, pitch.height - pitch.margin);
};

const moveOpponent = () => {
  const dx = ball.x - opponent.x;
  const dy = ball.y - opponent.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = opponent.speed;

  opponent.x += (dx / distance) * speed;
  opponent.y += (dy / distance) * speed;
  opponent.x = clamp(opponent.x, pitch.margin, pitch.width - pitch.margin);
  opponent.y = clamp(opponent.y, pitch.margin, pitch.height - pitch.margin);
};

const kickBall = (kicker, force) => {
  const dx = ball.x - kicker.x;
  const dy = ball.y - kicker.y;
  const distance = Math.hypot(dx, dy);

  if (distance < kicker.radius + ball.radius + 12) {
    const angle = Math.atan2(dy, dx);
    const powerBoost = state.powerActive > 0 ? 1.35 : 1;
    ball.vx = Math.cos(angle) * force * powerBoost;
    ball.vy = Math.sin(angle) * force * powerBoost;
    if (kicker === player) {
      addEvent("Blue launches a laser kick!");
    }
  }
};

const handleInput = () => {
  if (keys.has(" ")) {
    kickBall(player, 7.2);
  }
};

const updateBall = () => {
  ball.x += ball.vx;
  ball.y += ball.vy;

  ball.vx += weather.windX;
  ball.vy += weather.windY;

  ball.vx *= 0.985;
  ball.vy *= 0.985;

  if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
  if (Math.abs(ball.vy) < 0.05) ball.vy = 0;

  if (ball.y - ball.radius < pitch.margin || ball.y + ball.radius > pitch.height - pitch.margin) {
    ball.vy *= -0.8;
    ball.y = clamp(ball.y, pitch.margin + ball.radius, pitch.height - pitch.margin - ball.radius);
  }

  if (ball.x - ball.radius < pitch.margin || ball.x + ball.radius > pitch.width - pitch.margin) {
    ball.vx *= -0.8;
    ball.x = clamp(ball.x, pitch.margin + ball.radius, pitch.width - pitch.margin - ball.radius);
  }
};

const updatePowerUp = (timestamp) => {
  if (!powerUp.active && timestamp - state.lastPowerSpawn > 12000) {
    powerUp.active = true;
    powerUp.x = pitch.width / 2 + (Math.random() * 240 - 120);
    powerUp.y = pitch.height / 2 + (Math.random() * 160 - 80);
    state.lastPowerSpawn = timestamp;
    addEvent("A power-up orb shimmers at midfield.");
  }

  if (powerUp.active) {
    const distance = Math.hypot(player.x - powerUp.x, player.y - powerUp.y);
    if (distance < player.radius + powerUp.radius + 6) {
      powerUp.active = false;
      state.powerActive = 6;
      state.powerCharge = 0;
      addEvent("Blue grabs a power-up! Speed boost engaged.");
    }
  }

  if (state.powerActive > 0) {
    state.powerActive = Math.max(0, state.powerActive - 0.016);
  } else {
    state.powerCharge = Math.min(100, state.powerCharge + 0.08);
  }
};

const resolveCollisions = () => {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.hypot(dx, dy) || 1;
  const overlap = player.radius + ball.radius - dist;

  if (overlap > 0) {
    const angle = Math.atan2(dy, dx);
    ball.x += Math.cos(angle) * overlap;
    ball.y += Math.sin(angle) * overlap;
  }

  const ox = ball.x - opponent.x;
  const oy = ball.y - opponent.y;
  const odist = Math.hypot(ox, oy) || 1;
  const oOverlap = opponent.radius + ball.radius - odist;

  if (oOverlap > 0) {
    const angle = Math.atan2(oy, ox);
    ball.x += Math.cos(angle) * oOverlap;
    ball.y += Math.sin(angle) * oOverlap;
    ball.vx += Math.cos(angle) * 0.6;
    ball.vy += Math.sin(angle) * 0.6;
  }
};

const checkGoals = () => {
  const goalTop = pitch.height / 2 - pitch.goalWidth / 2;
  const goalBottom = pitch.height / 2 + pitch.goalWidth / 2;

  if (ball.y > goalTop && ball.y < goalBottom) {
    if (ball.x - ball.radius <= pitch.margin - pitch.goalDepth) {
      state.rightScore += 1;
      addEvent("Coral scores on a fast break!");
      resetPositions();
    }
    if (ball.x + ball.radius >= pitch.width - pitch.margin + pitch.goalDepth) {
      state.leftScore += 1;
      addEvent("Blue finds the net! Crowd erupts!");
      resetPositions();
    }
  }
};

const drawPitch = () => {
  context.clearRect(0, 0, pitch.width, pitch.height);

  context.strokeStyle = "rgba(255, 255, 255, 0.7)";
  context.lineWidth = 3;

  context.beginPath();
  context.rect(pitch.margin, pitch.margin, pitch.width - pitch.margin * 2, pitch.height - pitch.margin * 2);
  context.stroke();

  context.beginPath();
  context.moveTo(pitch.width / 2, pitch.margin);
  context.lineTo(pitch.width / 2, pitch.height - pitch.margin);
  context.stroke();

  context.beginPath();
  context.arc(pitch.width / 2, pitch.height / 2, 70, 0, Math.PI * 2);
  context.stroke();

  const goalTop = pitch.height / 2 - pitch.goalWidth / 2;
  context.fillStyle = "rgba(255, 255, 255, 0.2)";
  context.fillRect(pitch.margin - pitch.goalDepth, goalTop, pitch.goalDepth, pitch.goalWidth);
  context.fillRect(pitch.width - pitch.margin, goalTop, pitch.goalDepth, pitch.goalWidth);
};

const drawPlayer = (actor) => {
  context.beginPath();
  context.fillStyle = actor.color;
  context.arc(actor.x, actor.y, actor.radius, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.fillStyle = "rgba(255, 255, 255, 0.75)";
  context.arc(actor.x - actor.radius / 3, actor.y - actor.radius / 3, actor.radius / 3, 0, Math.PI * 2);
  context.fill();
};

const drawBall = () => {
  context.beginPath();
  context.fillStyle = "#fef3d7";
  context.strokeStyle = "#e1b96b";
  context.lineWidth = 2;
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
};

const drawPowerUp = () => {
  if (!powerUp.active) return;
  context.beginPath();
  context.fillStyle = "rgba(244, 197, 66, 0.9)";
  context.strokeStyle = "rgba(255, 255, 255, 0.9)";
  context.lineWidth = 2;
  context.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
};

const updateMomentum = () => {
  const diff = state.leftScore - state.rightScore;
  if (diff >= 2) {
    momentumDisplay.textContent = "Blue Surge";
  } else if (diff <= -2) {
    momentumDisplay.textContent = "Coral Charge";
  } else {
    momentumDisplay.textContent = "Even";
  }
};

const updateTimer = (timestamp) => {
  if (!state.running) return;
  if (!state.lastTime) state.lastTime = timestamp;

  const delta = timestamp - state.lastTime;
  if (delta >= 1000) {
    state.timer = Math.max(0, state.timer - 1);
    state.lastTime = timestamp;
  }

  if (state.timer === 0) {
    state.running = false;
    addEvent("Full time! Tap reset for another match.");
  }
};

const loop = (timestamp) => {
  if (state.running) {
    handleInput();
    movePlayer();
    moveOpponent();
    kickBall(opponent, 5.6);
    updateBall();
    resolveCollisions();
    checkGoals();
    updatePowerUp(timestamp);
  }

  drawPitch();
  drawPlayer(player);
  drawPlayer(opponent);
  drawBall();
  drawPowerUp();
  updateTimer(timestamp);
  updateMomentum();
  updatePossession();
  updateScoreboard();

  requestAnimationFrame(loop);
};

const updatePossession = () => {
  const centerDistance = Math.hypot(player.x - pitch.width / 2, player.y - pitch.height / 2);
  const influence = clamp(100 - centerDistance / 3.2, 0, 100);
  state.possession = Math.round((state.possession * 0.96 + influence * 0.04));
};

const shuffleWeather = () => {
  const presets = [
    { label: "Breezy", windX: 0.04, windY: 0 },
    { label: "Headwind", windX: -0.05, windY: 0 },
    { label: "Crosswind", windX: 0.02, windY: 0.03 },
    { label: "Gusty", windX: 0.06, windY: -0.02 },
    { label: "Calm", windX: 0, windY: 0 },
  ];
  const pick = presets[Math.floor(Math.random() * presets.length)];
  weather.label = pick.label;
  weather.windX = pick.windX;
  weather.windY = pick.windY;
  windDisplay.textContent = weather.label;
  addEvent(`Weather shifts: ${weather.label}.`);
};

const updateCrowd = () => {
  const base = 18000 + Math.floor(Math.random() * 5000);
  crowdDisplay.textContent = base.toLocaleString();
};

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

resetButton.addEventListener("click", resetGame);
toggleButton.addEventListener("click", () => {
  state.running = !state.running;
  toggleButton.textContent = state.running ? "Pause" : "Resume";
  addEvent(state.running ? "Play resumes." : "Match paused.");
});

shuffleButton.addEventListener("click", shuffleWeather);

lengthSelect.addEventListener("change", (event) => {
  state.matchLength = Number(event.target.value);
  state.timer = state.matchLength;
  addEvent(`Match length set to ${state.matchLength} seconds.`);
  updateScoreboard();
});

resetGame();
shuffleWeather();
updateCrowd();
requestAnimationFrame(loop);
