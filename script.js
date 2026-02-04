const DEFAULT_SKILLS = {
  speed: 0,
  stamina: 0,
  powerup: 0,
};

const SKILL_MULTIPLIERS = {
  speed: [1, 1.05, 1.1, 1.2],
  stamina: [1, 1.05, 1.1, 1.2],
  powerup: [1, 1.05, 1.1, 1.2],
};

const STORAGE_KEY = "skillSelections";

const skillButtons = document.querySelectorAll(".skill-button");
const speedValue = document.querySelector("#speed-value");
const staminaValue = document.querySelector("#stamina-value");
const powerupValue = document.querySelector("#powerup-value");

const clampTier = (tier) => Math.min(Math.max(tier, 0), 3);

const formatMultiplier = (value) => `${value.toFixed(2)}x`;

const loadSkills = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...DEFAULT_SKILLS };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      speed: clampTier(parsed.speed ?? 0),
      stamina: clampTier(parsed.stamina ?? 0),
      powerup: clampTier(parsed.powerup ?? 0),
    };
  } catch (error) {
    return { ...DEFAULT_SKILLS };
  }
};

const saveSkills = (skills) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
};

const updateButtonStates = (skills) => {
  skillButtons.forEach((button) => {
    const skill = button.dataset.skill;
    const tier = Number(button.dataset.tier);
    if (skills[skill] === tier) {
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    }
  });
};

const updateStats = (skills) => {
  speedValue.textContent = formatMultiplier(
    SKILL_MULTIPLIERS.speed[skills.speed]
  );
  staminaValue.textContent = formatMultiplier(
    SKILL_MULTIPLIERS.stamina[skills.stamina]
  );
  powerupValue.textContent = formatMultiplier(
    SKILL_MULTIPLIERS.powerup[skills.powerup]
  );
};

const applySkills = (skills) => {
  updateButtonStates(skills);
  updateStats(skills);
};

const skillState = loadSkills();
applySkills(skillState);

skillButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const skill = button.dataset.skill;
    const tier = clampTier(Number(button.dataset.tier));
    skillState[skill] = tier;
    saveSkills(skillState);
    applySkills(skillState);
  });
});
