const STORAGE_KEY = "laughingWaffleLifetimeStats.v1";

const createEmptyMatchStats = () => ({
  goals: 0,
  shots: 0,
  topSpeed: 0,
});

const createEmptyLifetimeStats = () => ({
  goals: 0,
  shots: 0,
  topSpeed: 0,
  matches: 0,
  updatedAt: null,
});

const matchStats = createEmptyMatchStats();
const lifetimeStats = createEmptyLifetimeStats();

const elements = {
  matchGoals: document.getElementById("match-goals"),
  matchShots: document.getElementById("match-shots"),
  matchSpeed: document.getElementById("match-speed"),
  lifetimeGoals: document.getElementById("lifetime-goals"),
  lifetimeShots: document.getElementById("lifetime-shots"),
  lifetimeSpeed: document.getElementById("lifetime-speed"),
  lifetimeMatches: document.getElementById("lifetime-matches"),
  lifetimeUpdated: document.getElementById("lifetime-updated"),
  status: document.getElementById("match-status"),
  goalBtn: document.getElementById("goal-btn"),
  shotBtn: document.getElementById("shot-btn"),
  speedInput: document.getElementById("speed-input"),
  endMatchBtn: document.getElementById("end-match-btn"),
  resetLifetimeBtn: document.getElementById("reset-lifetime-btn"),
};

function getStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("localStorage unavailable", error);
    return null;
  }
}

function sanitizeNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function formatSpeed(value) {
  return sanitizeNumber(value).toFixed(1);
}

function formatTimestamp(value) {
  if (!value) {
    return "never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "never";
  }

  return date.toLocaleString();
}

function loadLifetimeStats() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const stored = storage.getItem(STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    lifetimeStats.goals = sanitizeNumber(parsed.goals);
    lifetimeStats.shots = sanitizeNumber(parsed.shots);
    lifetimeStats.topSpeed = sanitizeNumber(parsed.topSpeed);
    lifetimeStats.matches = sanitizeNumber(parsed.matches);
    lifetimeStats.updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : null;
  } catch (error) {
    console.warn("Unable to parse lifetime stats; resetting.", error);
    Object.assign(lifetimeStats, createEmptyLifetimeStats());
  }
}

function saveLifetimeStats() {
  const storage = getStorage();
  if (!storage) {
    setStatus("Could not save lifetime stats in this browser environment.");
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(lifetimeStats));
}

function updateMatchDisplay() {
  elements.matchGoals.textContent = String(matchStats.goals);
  elements.matchShots.textContent = String(matchStats.shots);
  elements.matchSpeed.textContent = formatSpeed(matchStats.topSpeed);
}

function updateLifetimeDisplay() {
  elements.lifetimeGoals.textContent = String(lifetimeStats.goals);
  elements.lifetimeShots.textContent = String(lifetimeStats.shots);
  elements.lifetimeSpeed.textContent = formatSpeed(lifetimeStats.topSpeed);
  elements.lifetimeMatches.textContent = String(lifetimeStats.matches);
  elements.lifetimeUpdated.textContent = `Last updated: ${formatTimestamp(lifetimeStats.updatedAt)}`;
}

function setStatus(message) {
  elements.status.textContent = message;
}

function addGoal() {
  matchStats.goals += 1;
  updateMatchDisplay();
  setStatus("Goal added.");
}

function addShot() {
  matchStats.shots += 1;
  updateMatchDisplay();
  setStatus("Shot added.");
}

function updateTopSpeed(value) {
  const speedValue = sanitizeNumber(value);

  if (speedValue > matchStats.topSpeed) {
    matchStats.topSpeed = speedValue;
    updateMatchDisplay();
    setStatus("Top speed updated.");
    return;
  }

  setStatus("Top speed unchanged (only higher values are saved).");
}

function resetMatchStats() {
  Object.assign(matchStats, createEmptyMatchStats());
  elements.speedInput.value = "";
  updateMatchDisplay();
}

function hasMatchData() {
  return matchStats.goals > 0 || matchStats.shots > 0 || matchStats.topSpeed > 0;
}

function endMatch() {
  if (!hasMatchData()) {
    setStatus("No match data to save yet. Add stats first.");
    return;
  }

  lifetimeStats.goals += matchStats.goals;
  lifetimeStats.shots += matchStats.shots;
  lifetimeStats.topSpeed = Math.max(lifetimeStats.topSpeed, matchStats.topSpeed);
  lifetimeStats.matches += 1;
  lifetimeStats.updatedAt = new Date().toISOString();

  saveLifetimeStats();
  updateLifetimeDisplay();
  setStatus("Match ended and lifetime stats were updated.");
  resetMatchStats();
}

function resetLifetimeStats() {
  const userConfirmed = window.confirm("Reset all saved lifetime stats?");
  if (!userConfirmed) {
    return;
  }

  Object.assign(lifetimeStats, createEmptyLifetimeStats());
  saveLifetimeStats();
  updateLifetimeDisplay();
  setStatus("Lifetime stats reset.");
}

function init() {
  loadLifetimeStats();
  updateLifetimeDisplay();
  updateMatchDisplay();
  setStatus("Ready to track your match.");

  elements.goalBtn.addEventListener("click", addGoal);
  elements.shotBtn.addEventListener("click", addShot);
  elements.speedInput.addEventListener("change", (event) => {
    updateTopSpeed(event.target.value);
  });
  elements.endMatchBtn.addEventListener("click", endMatch);
  elements.resetLifetimeBtn.addEventListener("click", resetLifetimeStats);
}

init();
