import { FIXED_TIME_STEP, cloneState, createSimulation, stepSimulation } from "./simulation.js";
import { interpolateState, render } from "./render.js";
import { createInputHandler } from "./ui.js";

const canvas = document.querySelector("#pitch");
const ctx = canvas.getContext("2d");

const simulation = createSimulation();
let previousState = cloneState(simulation);

const inputHandler = createInputHandler(window);
let accumulator = 0;
let lastTimestamp = performance.now();

const frame = (timestamp) => {
  const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;
  accumulator += deltaSeconds;

  const input = inputHandler.getInput();

  while (accumulator >= FIXED_TIME_STEP) {
    previousState = cloneState(simulation);
    stepSimulation(simulation, input, FIXED_TIME_STEP);
    accumulator -= FIXED_TIME_STEP;
  }

  const alpha = accumulator / FIXED_TIME_STEP;
  const renderState = interpolateState(previousState, simulation, alpha);
  render(ctx, renderState);

  requestAnimationFrame(frame);
};

requestAnimationFrame(frame);

window.addEventListener("beforeunload", () => inputHandler.detach());
