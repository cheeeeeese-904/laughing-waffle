const lerp = (start, end, alpha) => start + (end - start) * alpha;

export const interpolateState = (previous, current, alpha) => ({
  time: lerp(previous.time, current.time, alpha),
  field: { ...current.field },
  player: {
    ...current.player,
    x: lerp(previous.player.x, current.player.x, alpha),
    y: lerp(previous.player.y, current.player.y, alpha),
  },
  ball: {
    ...current.ball,
    x: lerp(previous.ball.x, current.ball.x, alpha),
    y: lerp(previous.ball.y, current.ball.y, alpha),
  },
});

export const render = (ctx, state) => {
  const { field, player, ball } = state;
  ctx.clearRect(0, 0, field.width, field.height);

  ctx.fillStyle = "#1f8a4c";
  ctx.fillRect(0, 0, field.width, field.height);

  ctx.strokeStyle = "#e8f5e9";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, field.width - 20, field.height - 20);

  ctx.beginPath();
  ctx.arc(field.width / 2, field.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffeb3b";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#90caf9";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0b3d2e";
  ctx.font = "14px system-ui";
  ctx.fillText("Arrows/WASD move · Space to kick", 16, field.height - 16);
};
