const state = {
  timer: 10,
  score: 0,
  shots: 0,
  touches: 0,
  topSpeed: 0,
  running: false,
  intervalId: null,
};

const timerEl = document.querySelector("#timer");
const scoreEl = document.querySelector("#score");
const shotsEl = document.querySelector("#shots");
const touchesEl = document.querySelector("#touches");
const topSpeedEl = document.querySelector("#top-speed");
const manualScoreButton = document.querySelector("#manual-score");

const modal = document.querySelector("#game-modal");
const modalScore = document.querySelector("#modal-score");
const modalShots = document.querySelector("#modal-shots");
const modalTouches = document.querySelector("#modal-touches");
const modalTopSpeed = document.querySelector("#modal-top-speed");
const restartButton = document.querySelector("#restart-game");
const closeButton = document.querySelector("#close-modal");

const updateStatsUI = () => {
  timerEl.textContent = state.timer;
  scoreEl.textContent = state.score;
  shotsEl.textContent = state.shots;
  touchesEl.textContent = state.touches;
  topSpeedEl.textContent = `${state.topSpeed} mph`;
};

const updateModalUI = () => {
  modalScore.textContent = state.score;
  modalShots.textContent = state.shots;
  modalTouches.textContent = state.touches;
  modalTopSpeed.textContent = `${state.topSpeed} mph`;
};

const showModal = () => {
  updateModalUI();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
};

const hideModal = () => {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
};

const stopTimer = () => {
  state.running = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
};

const tick = () => {
  if (state.timer <= 0) {
    stopTimer();
    showModal();
    return;
  }

  state.timer -= 1;
  updateStatsUI();

  if (state.timer === 0) {
    stopTimer();
    showModal();
  }
};

const startTimer = () => {
  if (state.running) {
    return;
  }

  state.running = true;
  state.intervalId = setInterval(tick, 1000);
};

const resetGame = () => {
  stopTimer();
  state.timer = 10;
  state.score = 0;
  state.shots = 0;
  state.touches = 0;
  state.topSpeed = 0;
  updateStatsUI();
  hideModal();
  startTimer();
};

const registerShot = () => {
  if (!state.running) {
    return;
  }

  state.shots += 1;
  state.touches += Math.floor(Math.random() * 3) + 1;
  state.score += Math.floor(Math.random() * 2);
  const newSpeed = Math.floor(Math.random() * 30) + 30;
  state.topSpeed = Math.max(state.topSpeed, newSpeed);
  updateStatsUI();
};

manualScoreButton.addEventListener("click", registerShot);
restartButton.addEventListener("click", resetGame);
closeButton.addEventListener("click", hideModal);
modal.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal__backdrop")) {
    hideModal();
  }
});

updateStatsUI();
startTimer();
