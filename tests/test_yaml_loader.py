"""Tests for YAML loading and conversion."""
from pathlib import Path

import pytest

from src.gantt_charter import load_data_from_yaml, yaml_to_dataframe

REPO_ROOT = Path(__file__).resolve().parent.parent


def test_template_loads():
    data = load_data_from_yaml(str(REPO_ROOT / "data" / "gantt_template.yaml"))
    assert 'tasks' in data
    assert len(data['tasks']) > 0


def test_yaml_to_dataframe_columns():
    data = {
        'tasks': [
            {'name': 'A', 'start': '2026-01-01', 'finish': '2026-01-10', 'resource': 'R1'},
            {'name': 'B', 'start': '2026-01-11', 'finish': '2026-01-20'},
        ]
    }
    df = yaml_to_dataframe(data)
    assert list(df.columns) == [
        'Task', 'Start', 'Finish', 'Resource', 'Phase', 'Description', 'Dependencies'
    ]
    assert df.loc[1, 'Resource'] == 'Unassigned'


def test_missing_file_raises():
    with pytest.raises(FileNotFoundError):
        load_data_from_yaml('/nonexistent/path.yaml')
