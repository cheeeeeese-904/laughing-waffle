const minimapCanvas = document.createElement('canvas');
minimapCanvas.id = 'minimap';
minimapCanvas.width = 180;
minimapCanvas.height = 180;
document.body.appendChild(minimapCanvas);

const minimapContext = minimapCanvas.getContext('2d');

const heatmapCanvas = document.createElement('canvas');
heatmapCanvas.width = minimapCanvas.width;
heatmapCanvas.height = minimapCanvas.height;
const heatmapContext = heatmapCanvas.getContext('2d');

const trailPoints = [];
const maxTrailLength = 260;
const fadeFactor = 0.94;

const fallbackWorld = {
  width: 2000,
  height: 2000,
};

function getWorldBounds() {
  if (window.gameWorld?.width && window.gameWorld?.height) {
    return window.gameWorld;
  }

  if (window.worldBounds?.width && window.worldBounds?.height) {
    return window.worldBounds;
  }

  return fallbackWorld;
}

function getPlayerPosition(timeMs) {
  if (window.player?.x != null && window.player?.y != null) {
    return { x: window.player.x, y: window.player.y };
  }

  if (window.game?.player?.position) {
    return {
      x: window.game.player.position.x,
      y: window.game.player.position.y,
    };
  }

  const radius = Math.min(fallbackWorld.width, fallbackWorld.height) * 0.35;
  const angle = timeMs * 0.0004;
  return {
    x: fallbackWorld.width / 2 + Math.cos(angle) * radius,
    y: fallbackWorld.height / 2 + Math.sin(angle) * radius,
  };
}

function toMinimap(position, bounds) {
  const scaleX = minimapCanvas.width / bounds.width;
  const scaleY = minimapCanvas.height / bounds.height;
  return {
    x: position.x * scaleX,
    y: position.y * scaleY,
  };
}

function updateTrail(position) {
  trailPoints.push({
    x: position.x,
    y: position.y,
    alpha: 1,
  });

  if (trailPoints.length > maxTrailLength) {
    trailPoints.shift();
  }

  trailPoints.forEach((point) => {
    point.alpha *= fadeFactor;
  });

  while (trailPoints.length && trailPoints[0].alpha < 0.04) {
    trailPoints.shift();
  }
}

function renderMinimap() {
  minimapContext.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimapContext.fillStyle = 'rgba(8, 12, 20, 0.78)';
  minimapContext.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  minimapContext.drawImage(heatmapCanvas, 0, 0);
}

function renderHeatmap(points, bounds) {
  heatmapContext.fillStyle = 'rgba(0, 0, 0, 0.08)';
  heatmapContext.fillRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);

  heatmapContext.save();
  heatmapContext.globalCompositeOperation = 'lighter';

  points.forEach((point, index) => {
    const mapped = toMinimap(point, bounds);
    const radius = 6 + index / points.length * 4;
    heatmapContext.fillStyle = `rgba(0, 200, 255, ${point.alpha})`;
    heatmapContext.beginPath();
    heatmapContext.arc(mapped.x, mapped.y, radius, 0, Math.PI * 2);
    heatmapContext.fill();
  });

  heatmapContext.restore();
}

function tick(timeMs) {
  const bounds = getWorldBounds();
  const playerPosition = getPlayerPosition(timeMs);
  updateTrail(playerPosition);
  renderHeatmap(trailPoints, bounds);
  renderMinimap();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
