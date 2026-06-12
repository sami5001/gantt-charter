"""Tests for CSV loading, shared template with the web app."""
import pytest

from src.gantt_charter import load_data_from_csv


def write(tmp_path, content):
    path = tmp_path / "data.csv"
    path.write_text(content)
    return str(path)


def test_basic_load(tmp_path):
    path = write(tmp_path, (
        "Type,Task,Start,Finish,Resource,Phase,Description\n"
        "task,Literature review,2026-01-05,2026-02-13,Researcher,Preparation,Survey\n"
        "task,Analysis,2026-04-13,2026-05-29,Researcher,Analysis,\n"
    ))
    df, milestones = load_data_from_csv(path)
    assert list(df['Task']) == ['Literature review', 'Analysis']
    assert df.loc[0, 'Finish'] == '2026-02-13'
    assert milestones == []


def test_header_aliases(tmp_path):
    path = write(tmp_path, (
        "Name,Begin,End,Assignee,Group\n"
        "My task,2026-01-05,2026-01-12,Sami,Writing\n"
    ))
    df, _ = load_data_from_csv(path)
    assert df.loc[0, 'Task'] == 'My task'
    assert df.loc[0, 'Start'] == '2026-01-05'
    assert df.loc[0, 'Finish'] == '2026-01-12'
    assert df.loc[0, 'Resource'] == 'Sami'
    assert df.loc[0, 'Phase'] == 'Writing'


def test_milestone_rows_are_split_out(tmp_path):
    path = write(tmp_path, (
        "Type,Task,Start,Finish,Description\n"
        "task,Write up,2026-01-05,2026-02-13,\n"
        "milestone,Ethics approval,2026-02-02,,Approved\n"
    ))
    df, milestones = load_data_from_csv(path)
    assert len(df) == 1
    assert milestones == [
        {'name': 'Ethics approval', 'date': '2026-02-02', 'description': 'Approved'}
    ]


def test_missing_finish_defaults_to_start(tmp_path):
    path = write(tmp_path, "Task,Start\nOne-day task,2026-05-01\n")
    df, _ = load_data_from_csv(path)
    assert df.loc[0, 'Finish'] == '2026-05-01'


def test_missing_required_columns_raises(tmp_path):
    path = write(tmp_path, "Foo,Bar\n1,2\n")
    with pytest.raises(ValueError, match="Task"):
        load_data_from_csv(path)


def test_blank_task_names_are_dropped(tmp_path):
    path = write(tmp_path, (
        "Task,Start,Finish\n"
        "Real task,2026-01-05,2026-01-12\n"
        ",2026-01-05,2026-01-12\n"
    ))
    df, _ = load_data_from_csv(path)
    assert len(df) == 1
