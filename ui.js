export const createInputHandler = (target = window) => {
  const pressed = new Set();
  let kickQueued = false;

  const onKeyDown = (event) => {
    pressed.add(event.code);
    if (event.code === "Space") {
      kickQueued = true;
    }
  };

  const onKeyUp = (event) => {
    pressed.delete(event.code);
  };

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);

  return {
    getInput: () => {
      const input = {
        left: pressed.has("ArrowLeft") || pressed.has("KeyA"),
        right: pressed.has("ArrowRight") || pressed.has("KeyD"),
        up: pressed.has("ArrowUp") || pressed.has("KeyW"),
        down: pressed.has("ArrowDown") || pressed.has("KeyS"),
        kick: kickQueued,
      };
      kickQueued = false;
      return input;
    },
    detach: () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
    },
  };
};
