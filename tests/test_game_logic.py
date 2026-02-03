import json
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]


def _run_node(function_name, *args):
    node_path = shutil.which("node")
    if not node_path:
        pytest.skip("node is not available in this environment")

    script = """
const logic = require('./gameLogic.js');
const fnName = process.argv[1];
const args = JSON.parse(process.argv[2]);
const result = logic[fnName](...args);
console.log(JSON.stringify(result));
"""
    completed = subprocess.run(
        [node_path, "-e", script, function_name, json.dumps(args)],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout.strip())


def test_clamp_bounds():
    assert _run_node("clamp", 5, 0, 3) == 3
    assert _run_node("clamp", -2, 0, 3) == 0
    assert _run_node("clamp", 2, 0, 3) == 2


def test_combo_decay_when_timer_zero():
    result = _run_node("applyComboDecay", 4, 0)
    assert result == {"combo": 3, "comboTimer": 0}

    result = _run_node("applyComboDecay", 0, 0)
    assert result == {"combo": 0, "comboTimer": 0}


def test_power_up_spawn_timing():
    result = _run_node("updatePowerUpSpawnTimer", 500, 200, 1000)
    assert result == {"shouldSpawn": False, "nextTimerMs": 300}

    result = _run_node("updatePowerUpSpawnTimer", 100, 150, 1000)
    assert result == {"shouldSpawn": True, "nextTimerMs": 950}
