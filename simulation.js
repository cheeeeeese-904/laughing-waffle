const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const FIXED_TIME_STEP = 1 / 60;

export const createSimulation = () => {
  const field = { width: 720, height: 420 };
  return {
    time: 0,
    field,
    player: {
      x: field.width * 0.3,
      y: field.height * 0.5,
      vx: 0,
      vy: 0,
      radius: 16,
      speed: 240,
    },
    ball: {
      x: field.width * 0.55,
      y: field.height * 0.5,
      vx: 0,
      vy: 0,
      radius: 10,
    },
  };
};

export const cloneState = (state) => ({
  time: state.time,
  field: { ...state.field },
  player: { ...state.player },
  ball: { ...state.ball },
});

const applyFriction = (velocity, friction) => velocity * friction;

const resolveBoundary = (entity, field) => {
  entity.x = clamp(entity.x, entity.radius, field.width - entity.radius);
  entity.y = clamp(entity.y, entity.radius, field.height - entity.radius);
};

const resolveCollision = (player, ball) => {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = player.radius + ball.radius;
  if (distance >= minDistance || distance === 0) {
    return;
  }

  const overlap = minDistance - distance;
  const nx = dx / distance;
  const ny = dy / distance;

  ball.x += nx * overlap;
  ball.y += ny * overlap;

  const relativeVx = ball.vx - player.vx;
  const relativeVy = ball.vy - player.vy;
  const impactSpeed = relativeVx * nx + relativeVy * ny;

  if (impactSpeed > 0) {
    return;
  }

  const impulse = -1.2 * impactSpeed;
  ball.vx += impulse * nx;
  ball.vy += impulse * ny;
};

export const stepSimulation = (state, input, dt) => {
  const { player, ball, field } = state;
  const inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const inputY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const magnitude = Math.hypot(inputX, inputY) || 1;

  player.vx = (inputX / magnitude) * player.speed;
  player.vy = (inputY / magnitude) * player.speed;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  ball.vx = applyFriction(ball.vx, 0.985);
  ball.vy = applyFriction(ball.vy, 0.985);

  resolveBoundary(player, field);
  resolveBoundary(ball, field);
  resolveCollision(player, ball);

  if (input.kick) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < player.radius + ball.radius + 6) {
      const nx = dx / (distance || 1);
      const ny = dy / (distance || 1);
      ball.vx += nx * 320;
      ball.vy += ny * 320;
    }
  }

  state.time += dt;
};
