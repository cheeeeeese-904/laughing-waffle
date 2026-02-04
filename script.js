const STORAGE_KEY = "laughingWaffleLifetimeStats";

const matchStats = {
  goals: 0,
  shots: 0,
  topSpeed: 0,
};

const lifetimeStats = {
  goals: 0,
  shots: 0,
  topSpeed: 0,
};

const elements = {
  matchGoals: document.getElementById("match-goals"),
  matchShots: document.getElementById("match-shots"),
  matchSpeed: document.getElementById("match-speed"),
  lifetimeGoals: document.getElementById("lifetime-goals"),
  lifetimeShots: document.getElementById("lifetime-shots"),
  lifetimeSpeed: document.getElementById("lifetime-speed"),
  goalBtn: document.getElementById("goal-btn"),
  shotBtn: document.getElementById("shot-btn"),
  speedInput: document.getElementById("speed-input"),
  endMatchBtn: document.getElementById("end-match-btn"),
};

function loadLifetimeStats() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    lifetimeStats.goals = Number(parsed.goals) || 0;
    lifetimeStats.shots = Number(parsed.shots) || 0;
    lifetimeStats.topSpeed = Number(parsed.topSpeed) || 0;
  } catch (error) {
    console.warn("Unable to load lifetime stats", error);
  }
}

function saveLifetimeStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lifetimeStats));
}

function updateMatchDisplay() {
  elements.matchGoals.textContent = matchStats.goals;
  elements.matchShots.textContent = matchStats.shots;
  elements.matchSpeed.textContent = matchStats.topSpeed.toFixed(1);
}

function updateLifetimeDisplay() {
  elements.lifetimeGoals.textContent = lifetimeStats.goals;
  elements.lifetimeShots.textContent = lifetimeStats.shots;
  elements.lifetimeSpeed.textContent = lifetimeStats.topSpeed.toFixed(1);
}

function addGoal() {
  matchStats.goals += 1;
  updateMatchDisplay();
}

function addShot() {
  matchStats.shots += 1;
  updateMatchDisplay();
}

function updateTopSpeed(value) {
  if (Number.isNaN(value)) {
    return;
  }

  if (value > matchStats.topSpeed) {
    matchStats.topSpeed = value;
    updateMatchDisplay();
  }
}

function endMatch() {
  lifetimeStats.goals += matchStats.goals;
  lifetimeStats.shots += matchStats.shots;
  lifetimeStats.topSpeed = Math.max(lifetimeStats.topSpeed, matchStats.topSpeed);
  saveLifetimeStats();
  updateLifetimeDisplay();

  matchStats.goals = 0;
  matchStats.shots = 0;
  matchStats.topSpeed = 0;
  elements.speedInput.value = "";
  updateMatchDisplay();
}

function init() {
  loadLifetimeStats();
  updateLifetimeDisplay();
  updateMatchDisplay();

  elements.goalBtn.addEventListener("click", addGoal);
  elements.shotBtn.addEventListener("click", addShot);
  elements.speedInput.addEventListener("change", (event) => {
    const value = Number(event.target.value);
    updateTopSpeed(value);
  });
  elements.endMatchBtn.addEventListener("click", endMatch);
}

init();
