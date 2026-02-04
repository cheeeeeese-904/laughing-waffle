"""Pure game-logic helpers for movement and collisions."""

from __future__ import annotations

import math
from typing import Tuple

Vector = Tuple[float, float]


def clamp(value: float, min_value: float, max_value: float) -> float:
    """Clamp value to the inclusive range [min_value, max_value]."""
    return max(min_value, min(value, max_value))


def integrate_position(position: Vector, velocity: Vector, dt: float) -> Vector:
    """Return the next position given velocity and timestep."""
    return (position[0] + velocity[0] * dt, position[1] + velocity[1] * dt)


def resolve_wall_collision(
    position: Vector,
    velocity: Vector,
    radius: float,
    bounds: Vector,
    restitution: float = 1.0,
) -> Tuple[Vector, Vector, bool]:
    """Resolve collisions against rectangular bounds.

    Args:
        position: Current center position.
        velocity: Current velocity.
        radius: Radius of the object.
        bounds: (width, height) of the play area.
        restitution: Bounce factor (1.0 = perfectly elastic).

    Returns:
        (new_position, new_velocity, collided)
    """
    min_x, max_x = radius, bounds[0] - radius
    min_y, max_y = radius, bounds[1] - radius

    new_x = clamp(position[0], min_x, max_x)
    new_y = clamp(position[1], min_y, max_y)

    collided_x = not math.isclose(new_x, position[0])
    collided_y = not math.isclose(new_y, position[1])

    new_vx = velocity[0]
    new_vy = velocity[1]

    if collided_x:
        new_vx = -velocity[0] * restitution
    if collided_y:
        new_vy = -velocity[1] * restitution

    return (new_x, new_y), (new_vx, new_vy), (collided_x or collided_y)


def apply_spin_force(
    velocity: Vector,
    spin: float,
    spin_strength: float,
    dt: float,
) -> Vector:
    """Apply a perpendicular spin force to a velocity vector.

    Spin is a scalar: positive spins rotate velocity clockwise.
    """
    vx, vy = velocity
    perp_x, perp_y = -vy, vx
    factor = spin_strength * spin * dt
    return (vx + perp_x * factor, vy + perp_y * factor)


def decay_spin(spin: float, decay_rate: float, dt: float) -> float:
    """Exponential decay of spin over time."""
    return spin * math.exp(-decay_rate * dt)
