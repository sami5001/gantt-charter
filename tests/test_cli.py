"""End-to-end CLI tests (HTML output only, so no Chrome is needed)."""
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

CSV = (
    "Type,Task,Start,Finish,Resource,Phase\n"
    "task,Literature review,2026-01-05,2026-02-13,Researcher,Preparation\n"
    "task,Analysis,2026-04-13,2026-05-29,Researcher,Analysis\n"
    "milestone,Ethics approval,2026-02-02,,,\n"
)


def run_cli(*args):
    return subprocess.run(
        [sys.executable, str(REPO_ROOT / 'cli.py'), *args],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )


def test_help_exits_cleanly():
    result = run_cli('--help')
    assert result.returncode == 0
    assert '--paper' in result.stdout
    assert '--orientation' in result.stdout


def test_csv_input_with_paper_preset(tmp_path):
    csv_file = tmp_path / 'project.csv'
    csv_file.write_text(CSV)
    result = run_cli(
        '-i', str(csv_file),
        '-f', 'html',
        '--paper', 'letter',
        '--orientation', 'portrait',
        '-d', str(tmp_path),
        '-o', 'out',
    )
    assert result.returncode == 0, result.stderr
    assert (tmp_path / 'out.html').exists()


def test_missing_input_fails_gracefully(tmp_path):
    result = run_cli('-i', str(tmp_path / 'nope.yaml'), '-d', str(tmp_path))
    assert result.returncode == 1
    assert 'Error' in result.stderr
