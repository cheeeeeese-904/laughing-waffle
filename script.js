const matchClock = document.querySelector("#match-clock");
const challengeClock = document.querySelector("#challenge-clock");
const challengeButtons = document.querySelectorAll(".challenge-btn");
const cones = document.querySelectorAll(".cone");
const targets = document.querySelectorAll(".target");

const standardPositions = {
  cones: [
    { left: "25%", top: "30%" },
    { left: "45%", top: "55%" },
    { left: "65%", top: "35%" },
    { left: "80%", top: "65%" }
  ],
  targets: [
    { left: "15%", top: "70%" },
    { left: "50%", top: "15%" },
    { left: "85%", top: "25%" }
  ]
};

const challengePresets = {
  "cone-slalom": {
    duration: 75,
    cones: [
      { left: "20%", top: "20%" },
      { left: "35%", top: "35%" },
      { left: "50%", top: "50%" },
      { left: "65%", top: "65%" }
    ],
    targets: [
      { left: "80%", top: "20%" },
      { left: "85%", top: "50%" },
      { left: "80%", top: "80%" }
    ]
  },
  "precision-shots": {
    duration: 60,
    cones: [
      { left: "30%", top: "25%" },
      { left: "30%", top: "75%" },
      { left: "70%", top: "25%" },
      { left: "70%", top: "75%" }
    ],
    targets: [
      { left: "50%", top: "20%" },
      { left: "50%", top: "50%" },
      { left: "50%", top: "80%" }
    ]
  }
};

let matchStartTime = Date.now();
let activeChallenge = "match";
let challengeEndTime = null;

const formatTime = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const applyPositions = (items, positions) => {
  items.forEach((item, index) => {
    const position = positions[index];
    if (!position) {
      return;
    }
    item.style.left = position.left;
    item.style.top = position.top;
  });
};

const setChallengeMode = (challengeKey) => {
  activeChallenge = challengeKey;
  challengeButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.challenge === challengeKey
    );
  });

  if (challengeKey === "match") {
    applyPositions(cones, standardPositions.cones);
    applyPositions(targets, standardPositions.targets);
    challengeEndTime = null;
    challengeClock.classList.add("hidden");
    matchClock.classList.remove("hidden");
    return;
  }

  const preset = challengePresets[challengeKey];
  if (!preset) {
    return;
  }

  applyPositions(cones, preset.cones);
  applyPositions(targets, preset.targets);
  challengeEndTime = Date.now() + preset.duration * 1000;
  challengeClock.classList.remove("hidden");
  matchClock.classList.add("hidden");
};

const updateClocks = () => {
  const elapsedSeconds = Math.floor((Date.now() - matchStartTime) / 1000);
  matchClock.textContent = formatTime(elapsedSeconds);

  if (activeChallenge !== "match" && challengeEndTime) {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((challengeEndTime - Date.now()) / 1000)
    );
    challengeClock.textContent = formatTime(remainingSeconds);
    if (remainingSeconds === 0) {
      challengeEndTime = null;
    }
  }
};

challengeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setChallengeMode(button.dataset.challenge);
  });
});

applyPositions(cones, standardPositions.cones);
applyPositions(targets, standardPositions.targets);
setChallengeMode("match");
updateClocks();
setInterval(updateClocks, 250);
