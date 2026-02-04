import math

from game_logic import (
    apply_spin_force,
    clamp,
    decay_spin,
    integrate_position,
    resolve_wall_collision,
)


def test_deterministic_movement():
    position = (10.0, 5.0)
    velocity = (2.5, -1.0)
    dt = 0.4

    assert integrate_position(position, velocity, dt) == (11.0, 4.6)


def test_collision_response_left_wall():
    position = (-1.0, 5.0)
    velocity = (-3.0, 0.0)
    radius = 1.0
    bounds = (10.0, 10.0)

    new_position, new_velocity, collided = resolve_wall_collision(
        position, velocity, radius, bounds, restitution=0.8
    )

    assert new_position == (1.0, 5.0)
    assert math.isclose(new_velocity[0], 2.4)
    assert math.isclose(new_velocity[1], 0.0)
    assert collided is True


def test_spin_force_and_decay():
    velocity = (3.0, 0.0)
    spin = 2.0
    spin_strength = 0.5
    dt = 0.1

    spun_velocity = apply_spin_force(velocity, spin, spin_strength, dt)
    assert math.isclose(spun_velocity[0], 3.0)
    assert math.isclose(spun_velocity[1], 0.3)

    decayed_spin = decay_spin(spin, decay_rate=1.5, dt=0.2)
    expected = spin * math.exp(-1.5 * 0.2)
    assert math.isclose(decayed_spin, expected)


def test_clamp():
    assert clamp(5.0, 0.0, 10.0) == 5.0
    assert clamp(-2.0, 0.0, 10.0) == 0.0
    assert clamp(12.0, 0.0, 10.0) == 10.0
