const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");
const spinMeter = document.getElementById("spin-meter");

const keys = new Set();
const player = {
  x: canvas.width / 2 - 120,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  speed: 180,
  radius: 18,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  spin: 0,
  radius: 14,
};

const physics = {
  friction: 0.98,
  spinDecay: 0.985,
  spinSpeedThreshold: 80,
  spinForce: 0.0035,
  kickStrength: 260,
  spinKickMultiplier: 0.45,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalize(x, y) {
  const length = Math.hypot(x, y);
  if (length === 0) {
    return { x: 0, y: 0, length: 0 };
  }
  return { x: x / length, y: y / length, length };
}

function updatePlayer(dt) {
  let inputX = 0;
  let inputY = 0;
  if (keys.has("ArrowUp")) inputY -= 1;
  if (keys.has("ArrowDown")) inputY += 1;
  if (keys.has("ArrowLeft")) inputX -= 1;
  if (keys.has("ArrowRight")) inputX += 1;

  const move = normalize(inputX, inputY);
  player.vx = move.x * player.speed;
  player.vy = move.y * player.speed;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = clamp(player.x, player.radius, canvas.width - player.radius);
  player.y = clamp(player.y, player.radius, canvas.height - player.radius);
}

function applySpinForce(dt) {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed < physics.spinSpeedThreshold || ball.spin === 0) {
    return;
  }

  const perpendicular = { x: -ball.vy / speed, y: ball.vx / speed };
  const lateralMagnitude = ball.spin * physics.spinForce * speed;
  ball.vx += perpendicular.x * lateralMagnitude * dt;
  ball.vy += perpendicular.y * lateralMagnitude * dt;
}

function updateBall(dt) {
  applySpinForce(dt);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  ball.vx *= physics.friction;
  ball.vy *= physics.friction;
  ball.spin *= physics.spinDecay;

  if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
  if (Math.abs(ball.vy) < 0.05) ball.vy = 0;
  if (Math.abs(ball.spin) < 0.01) ball.spin = 0;

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.vx *= -1;
    ball.x = clamp(ball.x, ball.radius, canvas.width - ball.radius);
  }
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  spinMeter.textContent = ball.spin.toFixed(2);
}

function kickBall() {
  const distance = Math.hypot(ball.x - player.x, ball.y - player.y);
  if (distance > player.radius + ball.radius + 8) {
    return;
  }

  const kickDirection = normalize(ball.x - player.x, ball.y - player.y);
  ball.vx = kickDirection.x * physics.kickStrength;
  ball.vy = kickDirection.y * physics.kickStrength;

  const movementDirection = normalize(player.vx, player.vy);
  if (movementDirection.length > 0) {
    const cross = kickDirection.x * movementDirection.y - kickDirection.y * movementDirection.x;
    const spinImpulse = cross * movementDirection.length * physics.spinKickMultiplier;
    ball.spin += spinImpulse;
  }
}

function drawPitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f1f1f1";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffbf47";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
}

let lastTime = performance.now();
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  updatePlayer(dt);
  updateBall(dt);
  drawPitch();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key === " ") {
    kickBall();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

requestAnimationFrame(gameLoop);
