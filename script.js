const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const dribbleStatus = document.getElementById("dribble-status");

const keys = new Set();

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  speed: 2.6,
  sprintSpeed: 4.2,
  dribbleState: "idle",
};

const ball = {
  x: canvas.width / 2 + 80,
  y: canvas.height / 2,
  radius: 12,
  vx: 0,
  vy: 0,
  baseFriction: 0.92,
};

const tuning = {
  dribbleRange: 54,
  dribbleKick: 0.45,
  sprintKick: 0.85,
  dribbleFriction: 0.88,
  sprintFriction: 0.96,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const updatePlayerState = (movementX, movementY, distanceToBall) => {
  const isMoving = Math.hypot(movementX, movementY) > 0.1;
  const isSprinting = keys.has("Shift");
  const isCloseToBall = distanceToBall <= tuning.dribbleRange;

  if (isMoving && isCloseToBall && isSprinting) {
    player.dribbleState = "sprinting";
  } else if (isMoving && isCloseToBall) {
    player.dribbleState = "dribbling";
  } else {
    player.dribbleState = "idle";
  }

  dribbleStatus.textContent = player.dribbleState;
};

const applyBallFriction = () => {
  const distanceToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
  const isClose = distanceToBall <= tuning.dribbleRange;

  let friction = ball.baseFriction;

  if (isClose && player.dribbleState === "dribbling") {
    friction = tuning.dribbleFriction;
  }

  if (isClose && player.dribbleState === "sprinting") {
    friction = tuning.sprintFriction;
  }

  ball.vx *= friction;
  ball.vy *= friction;
};

const update = () => {
  let moveX = 0;
  let moveY = 0;

  if (keys.has("ArrowUp") || keys.has("w")) moveY -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) moveY += 1;
  if (keys.has("ArrowLeft") || keys.has("a")) moveX -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY);
    moveX /= length;
    moveY /= length;
  }

  const distanceToBall = Math.hypot(player.x - ball.x, player.y - ball.y);
  updatePlayerState(moveX, moveY, distanceToBall);

  const currentSpeed =
    player.dribbleState === "sprinting" ? player.sprintSpeed : player.speed;

  player.x += moveX * currentSpeed;
  player.y += moveY * currentSpeed;

  player.x = clamp(player.x, player.radius, canvas.width - player.radius);
  player.y = clamp(player.y, player.radius, canvas.height - player.radius);

  const closeToBall = distanceToBall <= tuning.dribbleRange;
  if (closeToBall && (moveX !== 0 || moveY !== 0)) {
    const kickForce =
      player.dribbleState === "sprinting"
        ? tuning.sprintKick
        : tuning.dribbleKick;
    ball.vx += moveX * kickForce;
    ball.vy += moveY * kickForce;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  applyBallFriction();

  ball.x = clamp(ball.x, ball.radius, canvas.width - ball.radius);
  ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);

  ctx.fillStyle = "#f8f2dd";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffb703";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0b5d2a";
  ctx.beginPath();
  ctx.arc(player.x + 6, player.y - 4, 4, 0, Math.PI * 2);
  ctx.fill();
};

const loop = () => {
  update();
  draw();
  requestAnimationFrame(loop);
};

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

loop();
