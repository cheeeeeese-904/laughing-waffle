const state = {
  shotCharge: 0,
  maxShotCharge: 100,
  chargeRate: 60,
  isCharging: false,
  lastKickForce: 0,
};

let lastChargeTimestamp = null;

function kickBall(force) {
  state.lastKickForce = force;
  if (state.ball && state.ball.velocity) {
    state.ball.velocity.x += force * (state.ball.kickMultiplier ?? 1);
  }
}

function releaseShot() {
  if (!state.isCharging) {
    return;
  }
  state.isCharging = false;
  lastChargeTimestamp = null;
  const force = state.shotCharge / state.maxShotCharge;
  kickBall(force);
  state.shotCharge = 0;
  updateScoreboard();
}

function chargeLoop(timestamp) {
  if (!state.isCharging) {
    return;
  }
  if (lastChargeTimestamp === null) {
    lastChargeTimestamp = timestamp;
  }
  const deltaSeconds = (timestamp - lastChargeTimestamp) / 1000;
  lastChargeTimestamp = timestamp;
  state.shotCharge = Math.min(
    state.maxShotCharge,
    state.shotCharge + state.chargeRate * deltaSeconds,
  );
  updateScoreboard();
  if (state.shotCharge < state.maxShotCharge) {
    requestAnimationFrame(chargeLoop);
  }
}

function ensureChargeMeter() {
  const meters = document.querySelector(".meters");
  if (!meters) {
    return null;
  }
  let chargeBar = document.getElementById("charge-bar");
  if (!chargeBar) {
    const meter = document.createElement("div");
    meter.className = "meter";
    meter.innerHTML = `
      <span class="label">Charge</span>
      <div class="bar">
        <div id="charge-bar" class="bar-fill"></div>
      </div>
    `;
    meters.appendChild(meter);
    chargeBar = document.getElementById("charge-bar");
  }
  return chargeBar;
}

function updateScoreboard() {
  const chargeBar = ensureChargeMeter();
  if (chargeBar) {
    const percent = Math.round((state.shotCharge / state.maxShotCharge) * 100);
    chargeBar.style.width = `${percent}%`;
    chargeBar.setAttribute("aria-valuenow", `${percent}`);
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !state.isCharging) {
    event.preventDefault();
    state.isCharging = true;
    requestAnimationFrame(chargeLoop);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    releaseShot();
  }
});

updateScoreboard();
