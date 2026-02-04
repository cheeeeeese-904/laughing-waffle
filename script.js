const commentaryPhrases = {
  goal: [
    "Top shelf! The net barely knew what hit it.",
    "A thunderbolt of a finish shakes the stadium.",
    "Cool as you like, tucked into the corner.",
    "The crowd erupts after that clinical strike!",
  ],
  coneRicochet: [
    "Off the cone and straight back into play!",
    "That ricochet adds some chaos to the midfield.",
    "The cone says no, and the ball obeys.",
    "Pinball wizardry off the training cone.",
  ],
  powerUpPickup: [
    "Power-up secured—expect fireworks!",
    "Speed boost online, defenders beware.",
    "They snag the power-up at the perfect moment.",
    "Energy surge collected, momentum swings.",
  ],
};

const eventFeed = document.querySelector("#event-feed");
const commentaryToggle = document.querySelector("#commentary-toggle");

const eventLabels = {
  goal: "Goal scored",
  coneRicochet: "Cone ricochet",
  powerUpPickup: "Power-up collected",
};

const eventIcons = {
  goal: "⚽",
  coneRicochet: "🎯",
  powerUpPickup: "⚡",
};

const getRandomCommentary = (eventType) => {
  const phrases = commentaryPhrases[eventType];
  if (!phrases || phrases.length === 0) {
    return "";
  }
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const shouldUseCommentary = () => commentaryToggle?.checked;

const addEvent = (eventType, options = {}) => {
  const { useCommentary = false } = options;
  const label = eventLabels[eventType] ?? "Match event";
  const icon = eventIcons[eventType] ?? "📣";
  let message = `${icon} ${label}`;

  if (useCommentary && shouldUseCommentary()) {
    const commentary = getRandomCommentary(eventType);
    if (commentary) {
      message = `${message} — ${commentary}`;
    }
  }

  const item = document.createElement("li");
  item.textContent = message;
  eventFeed?.prepend(item);
};

const actionButtons = document.querySelectorAll(".action");

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const eventType = button.dataset.event;
    if (!eventType) {
      return;
    }
    addEvent(eventType, { useCommentary: true });
  });
});

addEvent("goal", { useCommentary: true });
