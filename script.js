const field = document.getElementById("field");
const ball = document.getElementById("ball");
const styleSelect = document.getElementById("ai-style");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");
const timeRemainingEl = document.getElementById("time-remaining");

const FIELD_BOUNDS = { minX: 0.05, maxX: 0.95, minY: 0.05, maxY: 0.95 };
const opponents = [];

const formations = {
  "4-3-3": [
    { role: "GK", x: 0.08, y: 0.5 },
    { role: "LB", x: 0.22, y: 0.18 },
    { role: "LCB", x: 0.22, y: 0.38 },
    { role: "RCB", x: 0.22, y: 0.62 },
    { role: "RB", x: 0.22, y: 0.82 },
    { role: "LM", x: 0.42, y: 0.25 },
    { role: "CM", x: 0.42, y: 0.5 },
    { role: "RM", x: 0.42, y: 0.75 },
    { role: "LW", x: 0.62, y: 0.2 },
    { role: "ST", x: 0.66, y: 0.5 },
    { role: "RW", x: 0.62, y: 0.8 }
  ],
  "3-5-2": [
    { role: "GK", x: 0.08, y: 0.5 },
    { role: "LCB", x: 0.22, y: 0.28 },
    { role: "CB", x: 0.22, y: 0.5 },
    { role: "RCB", x: 0.22, y: 0.72 },
    { role: "LWB", x: 0.36, y: 0.16 },
    { role: "LCM", x: 0.42, y: 0.35 },
    { role: "CM", x: 0.42, y: 0.5 },
    { role: "RCM", x: 0.42, y: 0.65 },
    { role: "RWB", x: 0.36, y: 0.84 },
    { role: "LS", x: 0.64, y: 0.42 },
    { role: "RS", x: 0.64, y: 0.58 }
  ]
};

const aiCoach = {
  currentFormation: "4-3-3",
  currentStyle: "auto",
  styleConfigs: {
    pressing: { aggression: 0.55, yShift: 0.3, lineAdvance: 0.08 },
    counter: { aggression: 0.2, yShift: 0.15, lineAdvance: -0.04 },
    possession: { aggression: 0.35, yShift: 0.2, lineAdvance: 0.02 }
  },
  setStyle(style) {
    this.currentStyle = style;
  },
  chooseFormation(gameState) {
    if (gameState.awayScore < gameState.homeScore && gameState.timeRemaining < 20 * 60) {
      return "4-3-3";
    }
    if (gameState.awayScore > gameState.homeScore && gameState.timeRemaining < 25 * 60) {
      return "3-5-2";
    }
    return "4-3-3";
  },
  chooseStyle(gameState, ballPos) {
    if (this.currentStyle !== "auto") {
      return this.currentStyle;
    }

    const scoreDiff = gameState.awayScore - gameState.homeScore;
    if (scoreDiff < 0 && gameState.timeRemaining < 15 * 60) {
      return "pressing";
    }
    if (scoreDiff > 0 && gameState.timeRemaining < 18 * 60) {
      return "counter";
    }
    if (ballPos.x < 0.4) {
      return "counter";
    }
    return "possession";
  },
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  getTargets(gameState, ballPos) {
    const formation = this.chooseFormation(gameState);
    const styleName = this.chooseStyle(gameState, ballPos);
    const style = this.styleConfigs[styleName];
    const scoreDiff = gameState.awayScore - gameState.homeScore;

    const urgencyBoost = scoreDiff < 0 && gameState.timeRemaining < 10 * 60 ? 0.12 : 0;
    const comfortDrop = scoreDiff > 0 && gameState.timeRemaining < 10 * 60 ? -0.08 : 0;

    this.currentFormation = formation;

    return formations[formation].map((zone) => {
      const xInfluence = style.aggression + urgencyBoost + comfortDrop;
      const yInfluence = style.yShift;

      const targetX = this.clamp(
        zone.x + (ballPos.x - zone.x) * xInfluence + style.lineAdvance,
        FIELD_BOUNDS.minX,
        FIELD_BOUNDS.maxX
      );
      const targetY = this.clamp(
        zone.y + (ballPos.y - zone.y) * yInfluence,
        FIELD_BOUNDS.minY,
        FIELD_BOUNDS.maxY
      );

      return { role: zone.role, x: targetX, y: targetY };
    });
  }
};

const gameState = {
  homeScore: 0,
  awayScore: 0,
  timeRemaining: 90 * 60
};

const ballState = {
  x: 0.5,
  y: 0.5
};

function updateScoreboard() {
  homeScoreEl.textContent = gameState.homeScore;
  awayScoreEl.textContent = gameState.awayScore;
  const minutes = Math.floor(gameState.timeRemaining / 60);
  const seconds = gameState.timeRemaining % 60;
  timeRemainingEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function spawnOpponents() {
  const formation = formations[aiCoach.currentFormation];
  formation.forEach((zone) => {
    const player = document.createElement("div");
    player.className = "player opponent";
    player.dataset.role = zone.role;
    field.appendChild(player);
    opponents.push({
      element: player,
      x: zone.x,
      y: zone.y
    });
  });
}

function lerp(current, target, speed) {
  return current + (target - current) * speed;
}

function updateOpponents() {
  const targets = aiCoach.getTargets(gameState, ballState);
  opponents.forEach((player, index) => {
    const target = targets[index];
    player.x = lerp(player.x, target.x, 0.08);
    player.y = lerp(player.y, target.y, 0.08);
    const pixelPos = normalizedToPixels(player.x, player.y);
    player.element.style.left = `${pixelPos.x}px`;
    player.element.style.top = `${pixelPos.y}px`;
  });
}

function normalizedToPixels(nx, ny) {
  const rect = field.getBoundingClientRect();
  return {
    x: rect.width * nx,
    y: rect.height * ny
  };
}

function updateBall() {
  const pixelPos = normalizedToPixels(ballState.x, ballState.y);
  ball.style.left = `${pixelPos.x}px`;
  ball.style.top = `${pixelPos.y}px`;
}

function gameLoop() {
  updateOpponents();
  updateBall();
  requestAnimationFrame(gameLoop);
}

styleSelect.addEventListener("change", (event) => {
  aiCoach.setStyle(event.target.value);
});

field.addEventListener("mousemove", (event) => {
  const rect = field.getBoundingClientRect();
  const nx = (event.clientX - rect.left) / rect.width;
  const ny = (event.clientY - rect.top) / rect.height;
  ballState.x = aiCoach.clamp(nx, FIELD_BOUNDS.minX, FIELD_BOUNDS.maxX);
  ballState.y = aiCoach.clamp(ny, FIELD_BOUNDS.minY, FIELD_BOUNDS.maxY);
});

setInterval(() => {
  if (gameState.timeRemaining > 0) {
    gameState.timeRemaining -= 1;
    updateScoreboard();
  }
}, 1000);

spawnOpponents();
updateScoreboard();
requestAnimationFrame(gameLoop);
