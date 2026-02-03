from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_index_includes_core_sections():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "id=\"pitch\"" in html
    assert "id=\"score-left\"" in html
    assert "id=\"score-right\"" in html
    assert "id=\"timer\"" in html
    assert "id=\"event-log\"" in html
    assert "id=\"reset\"" in html
    assert "id=\"toggle\"" in html
    assert "id=\"shuffle\"" in html
    assert "id=\"cones\"" in html
    assert "id=\"length\"" in html
    assert "id=\"combo-bar\"" in html
    assert "id=\"ticker-text\"" in html
    assert "id=\"blue-shots\"" in html


def test_assets_referenced_exist():
    for filename in ("style.css", "script.js"):
        assert (ROOT / filename).exists()
