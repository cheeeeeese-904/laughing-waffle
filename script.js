const possessionSeries = [52, 48, 55, 58, 53, 60, 62, 59, 63, 57, 61];
const shotsOnTargetSeries = [0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

const possessionMetric = document.querySelector("#possession-latest");
const shotsMetric = document.querySelector("#shots-latest");

const updateMetric = (element, value, suffix = "") => {
  if (!element) return;
  element.textContent = `${value}${suffix}`;
};

const buildSparkline = (svgId, data, options = {}) => {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const viewBox = svg.getAttribute("viewBox").split(" ");
  const width = Number(viewBox[2]);
  const height = Number(viewBox[3]);
  const padding = options.padding ?? 6;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = svg.querySelector(".chart-line");
  const area = svg.querySelector(".chart-area");

  if (line) {
    line.setAttribute("points", points.join(" "));
  }

  if (area) {
    const firstPoint = points[0].split(",");
    const lastPoint = points[points.length - 1].split(",");
    const areaPath = [
      `M ${firstPoint[0]} ${height - padding}`,
      `L ${points.join(" L ")}`,
      `L ${lastPoint[0]} ${height - padding}`,
      "Z",
    ].join(" ");

    area.setAttribute("d", areaPath);
  }
};

updateMetric(possessionMetric, possessionSeries[possessionSeries.length - 1], "%");
updateMetric(shotsMetric, shotsOnTargetSeries[shotsOnTargetSeries.length - 1]);

buildSparkline("possession-chart", possessionSeries);
buildSparkline("shots-chart", shotsOnTargetSeries);
