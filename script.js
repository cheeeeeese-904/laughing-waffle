const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const replayButton = document.getElementById("replayButton");
const replayOverlay = document.getElementById("replayOverlay");

const gameState = {
  players: [
    { name: "A", x: 140, y: 250, vx: 0, vy: 0, score: 0, color: "#6dd5ff" },
    { name: "B", x: 760, y: 250, vx: 0, vy: 0, score: 0, color: "#ff8fb3" },
  ],
  ball: { x: 450, y: 250, vx: 2.6, vy: 1.8, radius: 12 },
};

const field = {
  width: canvas.width,
  height: canvas.height,
  goalHeight: 160,
};

const MAX_SCORE = 5;
const BUFFER_FPS = 30;
const BUFFER_SECONDS = 12;
const BUFFER_SIZE = BUFFER_FPS * BUFFER_SECONDS;
const ringBuffer = new Array(BUFFER_SIZE);
let ringIndex = 0;
let ringFilled = false;
let bufferTimer = 0;

let isReplaying = false;
let replayFrames = [];
let replayIndex = 0;
let replayTimer = 0;
let frozenState = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetBall(direction = 1) {
  gameState.ball.x = field.width / 2;
  gameState.ball.y = field.height / 2;
  gameState.ball.vx = 2.4 * direction;
  gameState.ball.vy = (Math.random() - 0.5) * 3;
}

function snapshotState() {
  return {
    players: gameState.players.map((player) => ({
      name: player.name,
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      score: player.score,
      color: player.color,
    })),
    ball: {
      x: gameState.ball.x,
      y: gameState.ball.y,
      vx: gameState.ball.vx,
      vy: gameState.ball.vy,
      radius: gameState.ball.radius,
    },
  };
}

function storeFrame() {
  ringBuffer[ringIndex] = snapshotState();
  ringIndex = (ringIndex + 1) % BUFFER_SIZE;
  if (ringIndex === 0) {
    ringFilled = true;
  }
}

function getBufferedFrames() {
  if (!ringFilled && ringIndex === 0) {
    return [];
  }
  const frames = [];
  const start = ringFilled ? ringIndex : 0;
  const total = ringFilled ? BUFFER_SIZE : ringIndex;
  for (let i = 0; i < total; i += 1) {
    const index = (start + i) % BUFFER_SIZE;
    if (ringBuffer[index]) {
      frames.push(ringBuffer[index]);
    }
  }
  return frames;
}

function updateAI(player, targetX) {
  const speed = 1.6;
  const direction = targetX > player.x ? 1 : -1;
  player.vx = direction * speed;
  if (Math.abs(targetX - player.x) < 6) {
    player.vx = 0;
  }
  player.x = clamp(player.x + player.vx, 60, field.width - 60);

  const targetY = gameState.ball.y;
  const vertical = targetY > player.y ? 1 : -1;
  player.vy = vertical * 1.4;
  if (Math.abs(targetY - player.y) < 10) {
    player.vy = 0;
  }
  player.y = clamp(player.y + player.vy, 80, field.height - 80);
}

function handleCollisions() {
  gameState.players.forEach((player) => {
    const dx = gameState.ball.x - player.x;
    const dy = gameState.ball.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < gameState.ball.radius + 18) {
      const angle = Math.atan2(dy, dx);
      const power = 2.8;
      gameState.ball.vx = Math.cos(angle) * power + player.vx * 0.8;
      gameState.ball.vy = Math.sin(angle) * power + player.vy * 0.8;
    }
  });

  if (gameState.ball.y - gameState.ball.radius < 40 ||
      gameState.ball.y + gameState.ball.radius > field.height - 40) {
    gameState.ball.vy *= -1;
  }

  if (gameState.ball.x - gameState.ball.radius < 30) {
    if (Math.abs(gameState.ball.y - field.height / 2) < field.goalHeight / 2) {
      gameState.players[1].score += 1;
      resetBall(1);
    } else {
      gameState.ball.vx *= -1;
    }
  }

  if (gameState.ball.x + gameState.ball.radius > field.width - 30) {
    if (Math.abs(gameState.ball.y - field.height / 2) < field.goalHeight / 2) {
      gameState.players[0].score += 1;
      resetBall(-1);
    } else {
      gameState.ball.vx *= -1;
    }
  }
}

function updateGame(delta) {
  const [left, right] = gameState.players;
  updateAI(left, field.width * 0.4);
  updateAI(right, field.width * 0.6);

  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;

  handleCollisions();

  if (left.score >= MAX_SCORE || right.score >= MAX_SCORE) {
    left.score = 0;
    right.score = 0;
    resetBall(Math.random() > 0.5 ? 1 : -1);
  }

  bufferTimer += delta;
  const frameDuration = 1 / BUFFER_FPS;
  while (bufferTimer >= frameDuration) {
    storeFrame();
    bufferTimer -= frameDuration;
  }
}

function drawField() {
  ctx.clearRect(0, 0, field.width, field.height);
  ctx.fillStyle = "#2f7d3a";
  ctx.fillRect(30, 40, field.width - 60, field.height - 80);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 40, field.width - 60, field.height - 80);

  ctx.beginPath();
  ctx.arc(field.width / 2, field.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(30, field.height / 2 - field.goalHeight / 2, 14, field.goalHeight);
  ctx.fillRect(field.width - 44, field.height / 2 - field.goalHeight / 2, 14, field.goalHeight);
}

function drawScores(state) {
  ctx.fillStyle = "#eef6ff";
  ctx.font = "600 22px 'Inter', sans-serif";
  ctx.fillText(`${state.players[0].name}: ${state.players[0].score}`, 60, 30);
  ctx.fillText(`${state.players[1].name}: ${state.players[1].score}`, field.width - 160, 30);
}

function drawPlayers(state) {
  state.players.forEach((player) => {
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBall(state) {
  ctx.beginPath();
  ctx.fillStyle = "#f9f9f9";
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.stroke();
}

function render(state) {
  drawField();
  drawScores(state);
  drawPlayers(state);
  drawBall(state);
}

function startReplay() {
  const frames = getBufferedFrames();
  if (frames.length < 2) {
    return;
  }
  frozenState = snapshotState();
  replayFrames = frames;
  replayIndex = 0;
  replayTimer = 0;
  isReplaying = true;
  replayButton.disabled = true;
  replayOverlay.classList.add("active");
}

function endReplay() {
  isReplaying = false;
  replayFrames = [];
  replayButton.disabled = false;
  replayOverlay.classList.remove("active");
  if (frozenState) {
    gameState.players = frozenState.players.map((player) => ({ ...player }));
    gameState.ball = { ...frozenState.ball };
  }
  frozenState = null;
}

let lastTime = performance.now();
function tick(now) {
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  if (isReplaying) {
    replayTimer += delta;
    const frameDuration = 1 / BUFFER_FPS;
    if (replayTimer >= frameDuration) {
      replayIndex += 1;
      replayTimer -= frameDuration;
    }

    if (replayIndex >= replayFrames.length) {
      endReplay();
    } else {
      render(replayFrames[replayIndex]);
    }
  } else {
    updateGame(delta);
    render(gameState);
  }

  requestAnimationFrame(tick);
}

replayButton.addEventListener("click", () => {
  if (!isReplaying) {
    startReplay();
  }
});

resetBall(1);
requestAnimationFrame(tick);
