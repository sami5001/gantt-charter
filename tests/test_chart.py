"""Tests for chart generation."""
import pandas as pd
import pytest

from src.gantt_charter import GanttCharter


@pytest.fixture
def df():
    return pd.DataFrame([
        {'Task': 'Design', 'Start': '2026-01-05', 'Finish': '2026-02-06', 'Resource': 'Lead'},
        {'Task': 'Build', 'Start': '2026-02-09', 'Finish': '2026-04-03', 'Resource': 'Team'},
        {'Task': 'Test', 'Start': '2026-04-06', 'Finish': '2026-05-01', 'Resource': 'Team'},
    ])


def test_creates_figure_with_bars(df):
    fig = GanttCharter(apply_theme=True).create_gantt_chart(df, title='Test chart')
    assert len(fig.data) > 0
    assert fig.layout.title.text == 'Test chart'


def test_missing_columns_raise():
    bad = pd.DataFrame([{'Task': 'X', 'Start': '2026-01-01'}])
    with pytest.raises(ValueError, match='Finish'):
        GanttCharter().create_gantt_chart(bad)


def test_milestones_add_traces(df):
    charter = GanttCharter()
    base = charter.create_gantt_chart(df)
    with_ms = charter.create_gantt_chart(
        df,
        milestones=[{'name': 'Launch', 'date': '2026-05-01', 'description': 'Go live'}],
    )
    assert len(with_ms.data) > len(base.data)


def test_repeated_task_names_share_one_row(df):
    repeated = pd.concat([df, pd.DataFrame([
        {'Task': 'Design', 'Start': '2026-03-02', 'Finish': '2026-03-27', 'Resource': 'Lead'},
    ])], ignore_index=True)
    fig = GanttCharter().create_gantt_chart(repeated)
    # The row order keeps one entry per unique task name
    assert list(fig.layout.yaxis.categoryarray) == ['Design', 'Build', 'Test']
    # Both Design ranges survive as bars
    design_bars = sum(
        list(trace.y).count('Design')
        for trace in fig.data if trace.type == 'bar'
    )
    assert design_bars == 2


def test_zero_duration_task_renders_marker(df):
    with_instant = pd.concat([df, pd.DataFrame([
        {'Task': 'Review day', 'Start': '2026-03-02', 'Finish': '2026-03-02', 'Resource': 'Lead'},
    ])], ignore_index=True)
    fig = GanttCharter().create_gantt_chart(with_instant)
    markers = [
        trace for trace in fig.data
        if trace.type == 'scatter' and trace.y and 'Review day' in trace.y
    ]
    assert len(markers) == 1
    assert markers[0].marker.symbol == 'diamond'


def test_resource_timeline_requires_resource_column():
    no_resource = pd.DataFrame([{'Task': 'X', 'Start': '2026-01-01', 'Finish': '2026-01-05'}])
    with pytest.raises(ValueError, match='Resource'):
        GanttCharter().create_resource_timeline(no_resource)
