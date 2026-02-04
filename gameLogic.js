function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function applyComboDecay(combo, comboTimer, decayAmount = 1) {
  if (comboTimer > 0 || combo <= 0) {
    return { combo, comboTimer };
  }

  const nextCombo = Math.max(combo - decayAmount, 0);
  return { combo: nextCombo, comboTimer: 0 };
}

function updatePowerUpSpawnTimer(spawnTimerMs, deltaMs, spawnIntervalMs) {
  const remaining = spawnTimerMs - deltaMs;

  if (remaining > 0) {
    return { shouldSpawn: false, nextTimerMs: remaining };
  }

  return {
    shouldSpawn: true,
    nextTimerMs: spawnIntervalMs + remaining,
  };
}

module.exports = {
  clamp,
  applyComboDecay,
  updatePowerUpSpawnTimer,
};
