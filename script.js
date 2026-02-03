const ticker = document.getElementById("ticker");
const score = document.getElementById("score");
const scoreText = score.querySelector(".score-text");
const simulateButton = document.getElementById("simulate");

const updates = [
  {
    ticker: "Kickoff! The home team takes early possession.",
    score: "Home 0 - 0 Away",
  },
  {
    ticker: "Goal! Home team strikes first in the 12th minute.",
    score: "Home 1 - 0 Away",
  },
  {
    ticker: "Halftime whistle. The away side is regrouping.",
    score: "Home 1 - 0 Away",
  },
  {
    ticker: "Goal! Away team equalizes with a header.",
    score: "Home 1 - 1 Away",
  },
  {
    ticker: "Full time! The match ends in a draw.",
    score: "Home 1 - 1 Away",
  },
];

let updateIndex = 0;

const applyUpdate = () => {
  const update = updates[updateIndex];
  ticker.textContent = update.ticker;
  scoreText.textContent = update.score;
  updateIndex = (updateIndex + 1) % updates.length;
};

simulateButton.addEventListener("click", applyUpdate);
