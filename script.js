const mappingSelects = document.querySelectorAll("select[data-action]");
const tickerText = document.getElementById("ticker-text");
const homeScore = document.getElementById("home-score");
const awayScore = document.getElementById("away-score");
const startButton = document.getElementById("start-match");
const resetButton = document.getElementById("reset-match");

const STORAGE_KEY = "laughingWaffleControls";
const AVAILABLE_KEYS = [
  { value: "ArrowUp", label: "Arrow Up" },
  { value: "ArrowDown", label: "Arrow Down" },
  { value: "ArrowLeft", label: "Arrow Left" },
  { value: "ArrowRight", label: "Arrow Right" },
  { value: "Space", label: "Space" },
  { value: "KeyW", label: "W" },
  { value: "KeyA", label: "A" },
  { value: "KeyS", label: "S" },
  { value: "KeyD", label: "D" },
];

const defaultMapping = {
  kick: "Space",
  pass: "KeyA",
  sprint: "KeyW",
  defend: "KeyD",
};

let currentMapping = loadMapping();
let matchActive = false;

function loadMapping() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { ...defaultMapping };
  }

  try {
    const parsed = JSON.parse(saved);
    return { ...defaultMapping, ...parsed };
  } catch (error) {
    return { ...defaultMapping };
  }
}

function saveMapping() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMapping));
}

function populateSelects() {
  mappingSelects.forEach((select) => {
    select.innerHTML = "";
    AVAILABLE_KEYS.forEach((keyOption) => {
      const option = document.createElement("option");
      option.value = keyOption.value;
      option.textContent = keyOption.label;
      select.append(option);
    });

    const action = select.dataset.action;
    select.value = currentMapping[action];
  });
}

function updateTicker(message) {
  tickerText.textContent = message;
}

function updateScore({ homeDelta = 0, awayDelta = 0 }) {
  homeScore.textContent = Number(homeScore.textContent) + homeDelta;
  awayScore.textContent = Number(awayScore.textContent) + awayDelta;
}

function handleAction(action) {
  if (!matchActive) {
    updateTicker("Start the match to activate controls.");
    return;
  }

  switch (action) {
    case "kick":
      updateScore({ homeDelta: 1 });
      updateTicker("Home strikes! That's a goal.");
      break;
    case "pass":
      updateTicker("Sharp pass opens space in midfield.");
      break;
    case "sprint":
      updateTicker("Sprint engaged! The winger is flying.");
      break;
    case "defend":
      updateTicker("Solid defense keeps the pressure away.");
      break;
    default:
      break;
  }
}

function handleKeydown(event) {
  const matchedAction = Object.entries(currentMapping).find(
    ([, key]) => key === event.code
  );

  if (!matchedAction) {
    return;
  }

  event.preventDefault();
  handleAction(matchedAction[0]);
}

function handleMappingChange(event) {
  const action = event.target.dataset.action;
  if (!action) {
    return;
  }

  currentMapping = {
    ...currentMapping,
    [action]: event.target.value,
  };
  saveMapping();
  updateTicker(`Mapped ${action} to ${event.target.options[event.target.selectedIndex].text}.`);
}

startButton.addEventListener("click", () => {
  matchActive = true;
  updateTicker("Match started! Use your mapped keys.");
});

resetButton.addEventListener("click", () => {
  matchActive = false;
  homeScore.textContent = "0";
  awayScore.textContent = "0";
  updateTicker("Match reset. Ready for kickoff.");
});

mappingSelects.forEach((select) => {
  select.addEventListener("change", handleMappingChange);
});

document.addEventListener("keydown", handleKeydown);

populateSelects();
updateTicker("Kick off to start the action.");
