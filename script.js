const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const staminaValue = document.getElementById("stamina-value");
const staminaOrbTimer = document.getElementById("stamina-orb-timer");

const state = {
  stamina: 75,
  staminaMax: 100,
  player: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 16,
    speed: 3.2,
  },
  keys: new Set(),
  staminaOrb: {
    active: false,
    spawnTimer: 0,
    cooldownTimer: 0,
    cooldownDuration: 8000,
    spawnInterval: 5000,
    radius: 10,
    x: 0,
    y: 0,
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomSpawn(radius) {
  return {
    x: radius + Math.random() * (canvas.width - radius * 2),
    y: radius + Math.random() * (canvas.height - radius * 2),
  };
}

function updatePowerUp(powerUp, onCollect) {
  if (!powerUp.active) {
    if (powerUp.cooldownTimer > 0) {
      powerUp.cooldownTimer = Math.max(0, powerUp.cooldownTimer - 16.67);
      return;
    }

    powerUp.spawnTimer += 16.67;
    if (powerUp.spawnTimer >= powerUp.spawnInterval) {
      powerUp.spawnTimer = 0;
      powerUp.active = true;
      const spawn = randomSpawn(powerUp.radius);
      powerUp.x = spawn.x;
      powerUp.y = spawn.y;
    }
    return;
  }

  const dx = powerUp.x - state.player.x;
  const dy = powerUp.y - state.player.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= powerUp.radius + state.player.radius) {
    onCollect();
    powerUp.active = false;
    powerUp.cooldownTimer = powerUp.cooldownDuration;
  }
}

function updateStaminaOrb() {
  updatePowerUp(state.staminaOrb, () => {
    state.stamina = state.staminaMax;
  });
}

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (state.keys.has("ArrowUp")) {
    dy -= state.player.speed;
  }
  if (state.keys.has("ArrowDown")) {
    dy += state.player.speed;
  }
  if (state.keys.has("ArrowLeft")) {
    dx -= state.player.speed;
  }
  if (state.keys.has("ArrowRight")) {
    dx += state.player.speed;
  }

  state.player.x = clamp(state.player.x + dx, state.player.radius, canvas.width - state.player.radius);
  state.player.y = clamp(state.player.y + dy, state.player.radius, canvas.height - state.player.radius);

  if (dx !== 0 || dy !== 0) {
    state.stamina = clamp(state.stamina - 0.1, 0, state.staminaMax);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#f7d154";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStaminaOrb() {
  if (!state.staminaOrb.active) {
    return;
  }

  ctx.fillStyle = "#25c0ff";
  ctx.beginPath();
  ctx.arc(state.staminaOrb.x, state.staminaOrb.y, state.staminaOrb.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function renderHud() {
  staminaValue.textContent = Math.round(state.stamina);

  if (state.staminaOrb.active) {
    staminaOrbTimer.textContent = "Active";
    staminaOrbTimer.style.color = "#7dff9d";
    return;
  }

  if (state.staminaOrb.cooldownTimer > 0) {
    staminaOrbTimer.textContent = `Cooldown ${Math.ceil(state.staminaOrb.cooldownTimer / 1000)}s`;
    staminaOrbTimer.style.color = "#ffb657";
    return;
  }

  const remaining = Math.max(0, state.staminaOrb.spawnInterval - state.staminaOrb.spawnTimer);
  staminaOrbTimer.textContent = `Spawning ${Math.ceil(remaining / 1000)}s`;
  staminaOrbTimer.style.color = "#7fd4ff";
}

function loop() {
  updatePlayer();
  updateStaminaOrb();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStaminaOrb();
  drawPlayer();
  renderHud();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  state.keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  state.keys.delete(event.key);
});

loop();
