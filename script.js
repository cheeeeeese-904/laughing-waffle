const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");
const scoreOneEl = document.getElementById("score-one");
const scoreTwoEl = document.getElementById("score-two");
const twoPlayerToggle = document.getElementById("two-player-toggle");

const FIELD = {
  width: canvas.width,
  height: canvas.height,
  goalWidth: 140,
  goalDepth: 20,
};

const keyState = new Set();

const playerOne = {
  name: "Player One",
  x: 140,
  y: FIELD.height / 2,
  radius: 20,
  color: "#ffd166",
  speed: 3.4,
  kickPower: 6,
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
  kick: "Space",
};

const playerTwo = {
  name: "Player Two",
  x: FIELD.width - 140,
  y: FIELD.height / 2,
  radius: 20,
  color: "#7bdff2",
  speed: 3.4,
  kickPower: 6,
  up: "KeyI",
  down: "KeyK",
  left: "KeyJ",
  right: "KeyL",
  kick: "ShiftRight",
};

const ball = {
  x: FIELD.width / 2,
  y: FIELD.height / 2,
  radius: 12,
  vx: 0,
  vy: 0,
  color: "#f8f8f8",
};

let scoreOne = 0;
let scoreTwo = 0;
let twoPlayerMode = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resetPositions = () => {
  playerOne.x = 140;
  playerOne.y = FIELD.height / 2;
  playerTwo.x = FIELD.width - 140;
  playerTwo.y = FIELD.height / 2;
  ball.x = FIELD.width / 2;
  ball.y = FIELD.height / 2;
  ball.vx = 0;
  ball.vy = 0;
};

const updateScore = () => {
  scoreOneEl.textContent = scoreOne;
  scoreTwoEl.textContent = scoreTwo;
};

const handleMovement = (player) => {
  let dx = 0;
  let dy = 0;
  if (keyState.has(player.up)) dy -= 1;
  if (keyState.has(player.down)) dy += 1;
  if (keyState.has(player.left)) dx -= 1;
  if (keyState.has(player.right)) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const magnitude = Math.hypot(dx, dy) || 1;
    player.x += (dx / magnitude) * player.speed;
    player.y += (dy / magnitude) * player.speed;
  }

  player.x = clamp(player.x, player.radius, FIELD.width - player.radius);
  player.y = clamp(player.y, player.radius, FIELD.height - player.radius);
};

const handleKick = (player) => {
  if (!keyState.has(player.kick)) return;

  const distance = Math.hypot(ball.x - player.x, ball.y - player.y);
  if (distance > player.radius + ball.radius + 8) return;

  const angle = Math.atan2(ball.y - player.y, ball.x - player.x);
  ball.vx += Math.cos(angle) * player.kickPower;
  ball.vy += Math.sin(angle) * player.kickPower;
};

const resolveBallCollision = (player) => {
  const distance = Math.hypot(ball.x - player.x, ball.y - player.y);
  const minDistance = ball.radius + player.radius;
  if (distance >= minDistance) return;

  const angle = Math.atan2(ball.y - player.y, ball.x - player.x);
  const overlap = minDistance - distance + 0.5;
  ball.x += Math.cos(angle) * overlap;
  ball.y += Math.sin(angle) * overlap;
  ball.vx += Math.cos(angle) * 0.6;
  ball.vy += Math.sin(angle) * 0.6;
};

const updateAI = () => {
  const targetX = ball.x > FIELD.width / 2 ? ball.x : FIELD.width - 140;
  const targetY = ball.y;
  const dx = targetX - playerTwo.x;
  const dy = targetY - playerTwo.y;
  const distance = Math.hypot(dx, dy) || 1;

  playerTwo.x += (dx / distance) * (playerTwo.speed * 0.8);
  playerTwo.y += (dy / distance) * (playerTwo.speed * 0.8);

  playerTwo.x = clamp(playerTwo.x, playerTwo.radius, FIELD.width - playerTwo.radius);
  playerTwo.y = clamp(playerTwo.y, playerTwo.radius, FIELD.height - playerTwo.radius);

  const nearBall = Math.hypot(ball.x - playerTwo.x, ball.y - playerTwo.y) <
    playerTwo.radius + ball.radius + 12;
  if (nearBall) {
    const angle = Math.atan2(ball.y - playerTwo.y, ball.x - playerTwo.x);
    ball.vx += Math.cos(angle) * (playerTwo.kickPower - 1);
    ball.vy += Math.sin(angle) * (playerTwo.kickPower - 1);
  }
};

const updateBall = () => {
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= 0.98;
  ball.vy *= 0.98;

  if (ball.y < ball.radius || ball.y > FIELD.height - ball.radius) {
    ball.vy *= -0.8;
    ball.y = clamp(ball.y, ball.radius, FIELD.height - ball.radius);
  }

  if (ball.x < ball.radius) {
    if (ball.y > (FIELD.height - FIELD.goalWidth) / 2 &&
        ball.y < (FIELD.height + FIELD.goalWidth) / 2) {
      scoreTwo += 1;
      updateScore();
      resetPositions();
      return;
    }
    ball.vx *= -0.8;
    ball.x = ball.radius;
  }

  if (ball.x > FIELD.width - ball.radius) {
    if (ball.y > (FIELD.height - FIELD.goalWidth) / 2 &&
        ball.y < (FIELD.height + FIELD.goalWidth) / 2) {
      scoreOne += 1;
      updateScore();
      resetPositions();
      return;
    }
    ball.vx *= -0.8;
    ball.x = FIELD.width - ball.radius;
  }
};

const drawPitch = () => {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);

  ctx.fillStyle = "#1c8a3a";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, FIELD.width - 24, FIELD.height - 24);

  ctx.beginPath();
  ctx.moveTo(FIELD.width / 2, 12);
  ctx.lineTo(FIELD.width / 2, FIELD.height - 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(FIELD.width / 2, FIELD.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fdf7e2";
  ctx.fillRect(0, (FIELD.height - FIELD.goalWidth) / 2, FIELD.goalDepth, FIELD.goalWidth);
  ctx.fillRect(
    FIELD.width - FIELD.goalDepth,
    (FIELD.height - FIELD.goalWidth) / 2,
    FIELD.goalDepth,
    FIELD.goalWidth
  );
};

const drawPlayer = (player) => {
  ctx.beginPath();
  ctx.fillStyle = player.color;
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.stroke();
};

const drawBall = () => {
  ctx.beginPath();
  ctx.fillStyle = ball.color;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.stroke();
};

const gameLoop = () => {
  handleMovement(playerOne);
  handleKick(playerOne);

  if (twoPlayerMode) {
    handleMovement(playerTwo);
    handleKick(playerTwo);
  } else {
    updateAI();
  }

  resolveBallCollision(playerOne);
  resolveBallCollision(playerTwo);
  updateBall();

  drawPitch();
  drawBall();
  drawPlayer(playerOne);
  drawPlayer(playerTwo);

  requestAnimationFrame(gameLoop);
};

window.addEventListener("keydown", (event) => {
  keyState.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keyState.delete(event.code);
});

twoPlayerToggle.addEventListener("change", (event) => {
  twoPlayerMode = event.target.checked;
});

resetPositions();
updateScore();
requestAnimationFrame(gameLoop);
