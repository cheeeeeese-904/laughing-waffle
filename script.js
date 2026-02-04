const state = {
  lastTouchTeam: null,
  lastPassTeam: null,
  score: {
    home: 0,
    away: 0,
  },
  matchReport: [],
};

const teams = {
  home: { name: "Home" },
  away: { name: "Away" },
};

function getTeamName(teamKey) {
  if (!teamKey || !teams[teamKey]) {
    return "Unknown";
  }
  return teams[teamKey].name;
}

function setMatchReportTickerText(text) {
  const ticker = document.querySelector("#match-report-ticker");
  if (ticker) {
    ticker.textContent = text;
  }
}

function logMatchReportEvent(text) {
  state.matchReport.push(text);
  setMatchReportTickerText(text);
}

function kickBall(teamKey) {
  state.lastPassTeam = state.lastTouchTeam;
  state.lastTouchTeam = teamKey;
}

function formatGoalEntry(scorerTeam, assistTeam) {
  const scorerName = getTeamName(scorerTeam);
  if (assistTeam && assistTeam !== scorerTeam) {
    const assistName = getTeamName(assistTeam);
    return `${scorerName} Goal (${assistName} Assist)`;
  }
  return `${scorerName} Goal`;
}

function checkGoals(scoringTeam) {
  if (!scoringTeam || !teams[scoringTeam]) {
    return;
  }

  state.score[scoringTeam] += 1;

  const scorerTeam = state.lastTouchTeam || scoringTeam;
  const assistTeam = state.lastPassTeam && state.lastPassTeam !== scorerTeam
    ? state.lastPassTeam
    : null;
  const goalEntry = formatGoalEntry(scorerTeam, assistTeam);

  logMatchReportEvent(goalEntry);
}

export {
  state,
  kickBall,
  checkGoals,
  logMatchReportEvent,
  formatGoalEntry,
};
