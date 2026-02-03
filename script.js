const gameCanvas = document.getElementById("game");
const gameCtx = gameCanvas.getContext("2d");
const minimapCanvas = document.getElementById("minimap");
const minimapCtx = minimapCanvas.getContext("2d");

const field = {
  width: gameCanvas.width,
  height: gameCanvas.height,
};

const state = {
  players: [
    { x: 120, y: 180, color: "#4dd0e1" },
    { x: 200, y: 290, color: "#81c784" },
  ],
  opponent: { x: 520, y: 200, color: "#ff8a65" },
  ball: { x: 360, y: 210 },
  cones: [
    { x: 260, y: 120 },
    { x: 420, y: 90 },
    { x: 500, y: 320 },
  ],
  direction: 1,
};

function drawField() {
  gameCtx.clearRect(0, 0, field.width, field.height);
  gameCtx.fillStyle = "#17324d";
  gameCtx.fillRect(0, 0, field.width, field.height);

  gameCtx.strokeStyle = "#2c4a6d";
  gameCtx.lineWidth = 2;
  gameCtx.strokeRect(20, 20, field.width - 40, field.height - 40);

  gameCtx.beginPath();
  gameCtx.arc(field.width / 2, field.height / 2, 70, 0, Math.PI * 2);
  gameCtx.stroke();
}

function drawEntities() {
  state.players.forEach((player) => {
    gameCtx.fillStyle = player.color;
    gameCtx.beginPath();
    gameCtx.arc(player.x, player.y, 18, 0, Math.PI * 2);
    gameCtx.fill();
  });

  gameCtx.fillStyle = state.opponent.color;
  gameCtx.beginPath();
  gameCtx.arc(state.opponent.x, state.opponent.y, 20, 0, Math.PI * 2);
  gameCtx.fill();

  gameCtx.fillStyle = "#fdd835";
  gameCtx.beginPath();
  gameCtx.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
  gameCtx.fill();

  gameCtx.fillStyle = "#ffcc80";
  state.cones.forEach((cone) => {
    gameCtx.beginPath();
    gameCtx.moveTo(cone.x, cone.y - 14);
    gameCtx.lineTo(cone.x - 10, cone.y + 14);
    gameCtx.lineTo(cone.x + 10, cone.y + 14);
    gameCtx.closePath();
    gameCtx.fill();
  });
}

function drawMinimap() {
  const scaleX = minimapCanvas.width / field.width;
  const scaleY = minimapCanvas.height / field.height;

  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimapCtx.fillStyle = "rgba(10, 18, 30, 0.85)";
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  minimapCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(4, 4, minimapCanvas.width - 8, minimapCanvas.height - 8);

  state.players.forEach((player) => {
    minimapCtx.fillStyle = player.color;
    minimapCtx.beginPath();
    minimapCtx.arc(player.x * scaleX, player.y * scaleY, 3.5, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  minimapCtx.fillStyle = state.opponent.color;
  minimapCtx.beginPath();
  minimapCtx.arc(
    state.opponent.x * scaleX,
    state.opponent.y * scaleY,
    4,
    0,
    Math.PI * 2
  );
  minimapCtx.fill();

  minimapCtx.fillStyle = "#fdd835";
  minimapCtx.beginPath();
  minimapCtx.arc(state.ball.x * scaleX, state.ball.y * scaleY, 2.5, 0, Math.PI * 2);
  minimapCtx.fill();

  minimapCtx.fillStyle = "#ffcc80";
  state.cones.forEach((cone) => {
    minimapCtx.beginPath();
    minimapCtx.arc(cone.x * scaleX, cone.y * scaleY, 2.5, 0, Math.PI * 2);
    minimapCtx.fill();
  });
}

function update() {
  const offset = Math.sin(Date.now() / 900) * 1.4;
  state.players[0].x += 0.6 * state.direction;
  state.players[1].y += 0.5 * state.direction;
  state.opponent.x -= 0.4 * state.direction;
  state.ball.y += offset;

  if (state.players[0].x > field.width - 90 || state.players[0].x < 90) {
    state.direction *= -1;
  }

  drawField();
  drawEntities();
  drawMinimap();
  requestAnimationFrame(update);
}

update();
