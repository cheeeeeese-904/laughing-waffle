const perfEl = document.getElementById("perf");

const frameSamples = [];
const maxSamples = 120;
let lastFrameTime = null;
let lastHudUpdate = 0;

function updateHud(timestamp) {
  if (!perfEl || frameSamples.length === 0) {
    return;
  }

  const total = frameSamples.reduce((sum, value) => sum + value, 0);
  const averageFrameTime = total / frameSamples.length;
  const fps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;

  perfEl.textContent = `FPS: ${fps.toFixed(1)}`;
  lastHudUpdate = timestamp;
}

function trackFrame(timestamp) {
  if (lastFrameTime !== null) {
    const delta = timestamp - lastFrameTime;
    frameSamples.push(delta);
    if (frameSamples.length > maxSamples) {
      frameSamples.shift();
    }
  }

  if (timestamp - lastHudUpdate >= 1000) {
    updateHud(timestamp);
  }

  lastFrameTime = timestamp;
  window.requestAnimationFrame(trackFrame);
}

window.requestAnimationFrame(trackFrame);
