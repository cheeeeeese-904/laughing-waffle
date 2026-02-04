const themeSelect = document.querySelector("#theme-select");
const root = document.documentElement;
const storageKey = "lw-theme";

const applyTheme = (theme) => {
  root.dataset.theme = theme;
};

const loadTheme = () => {
  const savedTheme = localStorage.getItem(storageKey);
  if (savedTheme) {
    applyTheme(savedTheme);
    themeSelect.value = savedTheme;
    return;
  }
  applyTheme(themeSelect.value);
};

themeSelect.addEventListener("change", (event) => {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
  localStorage.setItem(storageKey, selectedTheme);
});

loadTheme();
