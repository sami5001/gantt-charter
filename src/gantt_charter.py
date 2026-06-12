"""
Gantt Charter - Professional Gantt chart generation with Oxford Plotly Theme
Author: H Sami Adnan
License: MIT
"""

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Union
import numpy as np
import yaml
import os
from pathlib import Path

# Import Oxford theme from utils
try:
    from utils.oxford_plotly_theme import (
        apply_oxford_theme,
        create_oxford_figure,
        get_color_palette,
        get_oxford_template,
        save_oxford_figure,
        add_oxford_branding
    )
    OXFORD_THEME_AVAILABLE = True
except ImportError:
    # Fallback to installed package if available
    try:
        from oxford_plotly_theme import (
            apply_oxford_theme,
            create_oxford_figure,
            get_color_palette,
            get_oxford_template,
            save_oxford_figure,
            add_oxford_branding
        )
        OXFORD_THEME_AVAILABLE = True
    except ImportError:
        print("Warning: Oxford Plotly Theme not available. Using default Plotly styling.")
        OXFORD_THEME_AVAILABLE = False


class GanttCharter:
    """
    Professional Gantt chart generator with Oxford theming.

    This class provides methods to create publication-quality Gantt charts
    with automatic Oxford University branding and styling. Charts can be
    exported in various formats including interactive HTML and high-resolution
    images (PNG, PDF, SVG).

    Features:
    - Oxford color palettes and styling
    - Dynamic margin adjustment for task labels
    - Milestone markers with PHC accent colors
    - Resource-based color coding
    - High-quality export options
    """

    def __init__(self, apply_theme: bool = True):
        """
        Initialize GanttCharter with optional Oxford theme application.

        Args:
            apply_theme (bool): Whether to apply Oxford theme globally to all Plotly figures.
                               Default is True for consistent styling across all charts.
        """
        self.theme_applied = False
        if apply_theme and OXFORD_THEME_AVAILABLE:
            apply_oxford_theme()
            self.theme_applied = True

    def create_gantt_chart(
        self,
        data: Union[pd.DataFrame, List[Dict]],
        title: str = "Project Timeline",
        palette: str = "professional",
        show_dependencies: bool = False,
        add_branding: bool = False,
        **kwargs
    ) -> go.Figure:
        """
        Create a professional Gantt chart with Oxford theming.

        This method generates a timeline visualization with automatic task arrangement,
        milestone markers, and resource-based color coding. The chart features dynamic
        margin adjustment to accommodate long task names and uses PHC accent colors
        for milestone markers.

        Args:
            data (Union[pd.DataFrame, List[Dict]]): Project data containing tasks.
                Required columns: 'Task', 'Start', 'Finish'
                Optional columns: 'Resource', 'Phase', 'Description', 'Dependencies'
            title (str): Chart title. Default: "Project Timeline"
            palette (str): Oxford color palette name. Options:
                - 'professional': Business and academic presentations (default)
                - 'traditional': Formal, heritage-focused projects
                - 'corporate': Professional reports (blues and greys)
                - 'contemporary': Modern research timelines
                - 'vibrant': Eye-catching visualizations
            show_dependencies (bool): Whether to show task dependencies. Default: False
            add_branding (bool): Whether to add Oxford University watermark. Default: False
            **kwargs: Additional arguments:
                - height (int): Chart height in pixels
                - width (int): Chart width in pixels
                - milestones (List[Dict]): Milestone data with 'name', 'date', 'description'

        Returns:
            go.Figure: Configured Plotly figure ready for display or export.

        Example:
            >>> charter = GanttCharter()
            >>> fig = charter.create_gantt_chart(
            ...     data=df,
            ...     title="Research Project Timeline",
            ...     palette="corporate",
            ...     height=1200,
            ...     milestones=[{'name': 'Submission', 'date': '2024-12-01'}]
            ... )
            >>> fig.show()
        """
        # Convert data to DataFrame if needed
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data.copy()

        # Validate required columns
        required_cols = ['Task', 'Start', 'Finish']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"Data must contain columns: {required_cols}")

        # Convert dates to datetime
        df['Start'] = pd.to_datetime(df['Start'])
        df['Finish'] = pd.to_datetime(df['Finish'])

        # Calculate duration for hover info
        df['Duration'] = (df['Finish'] - df['Start']).dt.days
        df['Duration_Text'] = df['Duration'].apply(lambda d: f"{d} days" if d != 1 else "1 day")

        # Prepare color mapping
        color_col = 'Resource' if 'Resource' in df.columns else None

        # Get color sequence from Oxford theme. When there are more groups
        # than palette colors, extend with other Oxford palettes so no two
        # resources silently share a color.
        if OXFORD_THEME_AVAILABLE:
            color_sequence = list(get_color_palette(palette))
            if color_col:
                n_groups = df[color_col].nunique()
                for extra in ('vibrant', 'primary', 'contemporary', 'traditional'):
                    if len(color_sequence) >= n_groups:
                        break
                    if extra == palette:
                        continue
                    for color in get_color_palette(extra):
                        if color not in color_sequence:
                            color_sequence.append(color)
        else:
            color_sequence = None

        # Repeated task names share a single row: every occurrence draws
        # its own bar there, so recurring work reads as several ranges on
        # one line. This is the row order, first occurrence first.
        task_order = list(dict.fromkeys(df['Task']))

        # Extract milestones if passed in kwargs
        milestones = kwargs.pop('milestones', None)
        height = kwargs.pop('height', None)
        if not height:
            # Scale with the task list so rows stay readable; capped so a
            # huge project still fits on screen.
            height = int(min(1600, max(500, 180 + 26 * len(task_order))))

        # Create timeline figure with hover data
        fig = px.timeline(
            df,
            x_start="Start",
            x_end="Finish",
            y="Task",
            color=color_col,
            hover_data={'Start': '|%b %d, %Y', 'Finish': '|%b %d, %Y', 'Duration_Text': True},
            title=title,
            color_discrete_sequence=color_sequence if OXFORD_THEME_AVAILABLE else None,
            **kwargs
        )

        # Zero-duration tasks (Start == Finish) would draw invisible bars;
        # show them as diamond markers in their resource color instead.
        zero_duration = df[df['Duration'] <= 0]
        if len(zero_duration) > 0:
            resource_order = list(dict.fromkeys(df[color_col])) if color_col else []
            for _, row in zero_duration.iterrows():
                if color_col and color_sequence:
                    idx = resource_order.index(row[color_col])
                    color = color_sequence[idx % len(color_sequence)]
                else:
                    color = '#002147'
                fig.add_trace(go.Scatter(
                    x=[row['Start']],
                    y=[row['Task']],
                    mode='markers',
                    marker=dict(symbol='diamond', size=10, color=color),
                    showlegend=False,
                    hovertext=f"{row['Task']}<br>{row['Start'].strftime('%b %d, %Y')}",
                    hoverinfo='text'
                ))

        # Apply Oxford theme if available
        if OXFORD_THEME_AVAILABLE:
            # Apply Oxford template to the existing figure
            oxford_template = get_oxford_template()
            fig.update_layout(template=oxford_template)
            fig.update_layout(
                title=title,
                xaxis_title="Date",
                yaxis_title="Tasks",
                height=height
            )
        else:
            fig.update_layout(height=height)

        # Customize layout for better readability. The explicit category
        # array keeps rows in data order even when a task name appears
        # multiple times or colors split tasks across traces.
        fig.update_yaxes(
            autorange="reversed",  # Tasks from top to bottom
            categoryorder="array",
            categoryarray=task_order,
            tickfont=dict(size=11),  # Larger font for task names
            title_font=dict(size=12),
            title_standoff=25  # Add more space between title and tick labels
        )
        # Pick a tick interval that keeps the date axis readable: monthly
        # ticks crowd anything longer than ~18 months.
        span_start = df['Start'].min()
        span_end = df['Finish'].max()
        if milestones:
            milestone_dates = pd.to_datetime([m.get('date') for m in milestones])
            span_start = min(span_start, milestone_dates.min())
            span_end = max(span_end, milestone_dates.max())
        span_days = (span_end - span_start).days
        if span_days > 1825:
            dtick = "M6"
        elif span_days > 1095:
            dtick = "M3"
        elif span_days > 540:
            dtick = "M2"
        else:
            dtick = "M1"
        # Pin the range to the data: otherwise autorange expands the axis to
        # fit the milestone labels' text boxes, leaving dead plot space.
        range_pad = pd.Timedelta(days=max(7, span_days * 0.015))
        fig.update_xaxes(
            tickformat="%b %Y",  # Simplified date format
            dtick=dtick,
            ticklabelmode="period",
            tickfont=dict(size=10),
            title_font=dict(size=12),
            range=[span_start - range_pad, span_end + range_pad]
        )

        # Calculate dynamic left margin based on longest task name
        if df is not None and 'Task' in df.columns:
            max_task_length = df['Task'].str.len().max()
            # Estimate pixels needed (approximately 7 pixels per character at size 11 font)
            left_margin = max(200, min(350, max_task_length * 7))
        else:
            left_margin = 200

        # Reserve top and right margins for the angled milestone labels:
        # they rise out of the plot at 45 degrees, so the space needed
        # grows with the longest milestone name, and labels near the end
        # of the timeline extend past the plot's right edge.
        right_margin = 50
        if milestones:
            max_ms_len = max(len(m.get('name', '')) for m in milestones)
            top_margin = 110 + min(220, int(max_ms_len * 5 * 0.72))
            span_total = (span_end - span_start).total_seconds() or 1.0
            plot_w = max(400, 1200 - left_margin - 60)
            for m in milestones:
                date = pd.to_datetime(m.get('date'))
                frac = (date - span_start).total_seconds() / span_total
                est_w = len(m.get('name', '')) * 5 * 0.72
                overhang = est_w - (1.0 - frac) * plot_w
                right_margin = max(right_margin, int(overhang) + 20)
        else:
            top_margin = 80

        # Update overall layout for better spacing. The title is pinned to
        # the very top of the figure so milestone labels rising out of the
        # plot never run through it.
        fig.update_layout(
            margin=dict(l=left_margin, r=right_margin, t=top_margin, b=80),  # Dynamic margins
            font=dict(size=11),  # Base font size
            title=dict(font=dict(size=16), y=0.99, yanchor='top'),
            hoverlabel=dict(font_size=11)
        )

        # Add milestones if they exist in the data
        self._add_milestones(fig, milestones, span_start, span_end)

        # Fixed-range secondary Y-axis that pins milestone markers to the
        # top edge of the plot regardless of how many tasks there are.
        fig.update_layout(
            yaxis2=dict(
                overlaying='y',
                side='right',
                range=[0, 1],
                fixedrange=True,
                showticklabels=False,
                showgrid=False,
                zeroline=False
            )
        )

        # Add dependencies if requested
        if show_dependencies and 'Dependencies' in df.columns:
            self._add_dependencies(fig, df)

        # Add branding if requested
        if add_branding and OXFORD_THEME_AVAILABLE:
            fig = add_oxford_branding(
                fig,
                add_watermark=True,
                watermark_text="Oxford University",
                position="bottom_right"
            )

        # Don't use a hover template - let Plotly handle it automatically
        # This will show the correct dates from the timeline data

        return fig

    def _add_milestones(
        self,
        fig: go.Figure,
        milestones: List[Dict] = None,
        span_start=None,
        span_end=None,
    ) -> None:
        """
        Add milestone markers to the Gantt chart.

        Each milestone gets a vertical dotted line across the whole plot, a
        diamond marker pinned to the top edge (on a fixed-range secondary
        Y-axis), and an angled label in the top margin so labels never
        overlap the task bars or run off the page.

        Args:
            fig (go.Figure): The figure to add milestones to
            milestones (List[Dict], optional): List of milestone dictionaries containing:
                - 'name' (str): Milestone label
                - 'date' (str): Date in YYYY-MM-DD format
                - 'description' (str, optional): Hover text description
            span_start: Earliest date on the chart (for label anchoring)
            span_end: Latest date on the chart (for label anchoring)
        """
        if not milestones:
            return

        items = sorted(
            (
                pd.to_datetime(m.get('date')),
                m.get('name', 'Milestone'),
                m.get('description', ''),
            )
            for m in milestones
        )
        dates = [item[0] for item in items]

        if span_start is None:
            span_start = min(dates)
        if span_end is None:
            span_end = max(dates)
        span = (span_end - span_start).total_seconds() or 1.0

        # Vertical dotted lines spanning the full plot height
        for date in dates:
            fig.add_shape(
                type="line",
                x0=date, x1=date,
                yref="paper", y0=0, y1=1,
                line=dict(color="#8A1751", width=1, dash="dot"),  # PHC accent color
                opacity=0.5
            )

        # Diamond markers pinned just below the top edge of the plot
        fig.add_trace(go.Scatter(
            x=dates,
            y=[0.98] * len(dates),
            mode='markers',
            name='Milestones',
            marker=dict(
                size=10,
                color='#8A1751',  # PHC accent color
                symbol='diamond',
                line=dict(width=1, color='#5A0F35')  # Darker PHC color for border
            ),
            hovertext=[
                f"{name}<br>{desc}<br>{date.strftime('%b %d, %Y')}"
                for date, name, desc in items
            ],
            hoverinfo='text',
            showlegend=True,
            yaxis='y2'
        ))

        # Angled labels rising out of the plot at 45 degrees. All labels are
        # left-anchored (Plotly rotates text about its box centre, so mixing
        # anchors makes neighbouring labels cross); the chart's right margin
        # is widened instead so trailing labels stay on the page.
        for date, name, _ in items:
            fig.add_annotation(
                x=date,
                yref="paper", y=1.01,
                yanchor="bottom",
                xanchor="left",
                text=name,
                showarrow=False,
                textangle=-45,
                font=dict(size=9, color='#8A1751')
            )

    def _add_dependencies(self, fig: go.Figure, df: pd.DataFrame) -> None:
        """Add dependency arrows between tasks"""
        # This is a placeholder for dependency visualization
        # Would require more complex implementation with arrows
        pass

    def create_resource_timeline(
        self,
        data: Union[pd.DataFrame, List[Dict]],
        title: str = "Resource Timeline",
        palette: str = "vibrant"
    ) -> go.Figure:
        """
        Create a resource-focused timeline showing workload distribution

        Args:
            data: DataFrame with Task, Start, Finish, Resource columns
            title: Chart title
            palette: Oxford palette name

        Returns:
            Plotly Figure object
        """
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data.copy()

        # Ensure Resource column exists
        if 'Resource' not in df.columns:
            raise ValueError("Resource column is required for resource timeline")

        # Convert dates
        df['Start'] = pd.to_datetime(df['Start'])
        df['Finish'] = pd.to_datetime(df['Finish'])

        # Create figure grouped by resource
        if OXFORD_THEME_AVAILABLE:
            fig = create_oxford_figure(
                title=title,
                xaxis_title="Date",
                yaxis_title="Resources",
                palette=palette
            )

            timeline_fig = px.timeline(
                df,
                x_start="Start",
                x_end="Finish",
                y="Resource",
                color="Task",
                color_discrete_sequence=get_color_palette(palette)
            )

            for trace in timeline_fig.data:
                fig.add_trace(trace)
        else:
            fig = px.timeline(
                df,
                x_start="Start",
                x_end="Finish",
                y="Resource",
                color="Task",
                title=title
            )

        fig.update_yaxes(autorange="reversed")
        fig.update_xaxes(tickformat="%b %Y")

        return fig

    def save_chart(
        self,
        fig: go.Figure,
        filename: str,
        format: str = "png",
        width: int = 1200,
        height: int = 800,
        scale: int = 3
    ) -> None:
        """
        Save Gantt chart in high quality

        Args:
            fig: Plotly figure to save
            filename: Output filename (without extension)
            format: Output format (png, pdf, svg, html)
            width: Image width in pixels
            height: Image height in pixels
            scale: Quality scale factor (higher = better quality)
        """
        if OXFORD_THEME_AVAILABLE:
            save_oxford_figure(
                fig,
                filename,
                format=format,
                width=width,
                height=height,
                scale=scale
            )
            print(f"Chart saved as {filename}.{format}")
        else:
            # Fallback to standard Plotly save
            if format == 'html':
                fig.write_html(f"{filename}.html")
            else:
                fig.write_image(
                    f"{filename}.{format}",
                    width=width,
                    height=height,
                    scale=scale
                )
            print(f"Chart saved as {filename}.{format}")


def load_data_from_yaml(filepath: str = None) -> Dict:
    """
    Load Gantt chart data from YAML file.

    If no filepath is provided, searches for YAML files in the following order:
    1. data/gantt_data.yaml (private/personal data, gitignored)
    2. data/gantt_template.yaml (example template)

    Args:
        filepath (str, optional): Explicit path to YAML file.

    Returns:
        Dict: Parsed YAML data containing:
            - 'project': Project metadata (title, description, dates)
            - 'config': Chart configuration (palette, dimensions, etc.)
            - 'tasks': List of task dictionaries
            - 'resources': List of resources (optional)
            - 'milestones': List of milestone dictionaries (optional)

    Raises:
        FileNotFoundError: If no YAML file is found at any location.

    Example:
        >>> data = load_data_from_yaml('my_project.yaml')
        >>> df = yaml_to_dataframe(data)
    """
    if filepath is None:
        # Try to find a YAML file to load
        base_dir = Path(__file__).parent.parent
        possible_files = [
            base_dir / "data" / "gantt_data.yaml",     # Private data
            base_dir / "data" / "gantt_template.yaml",  # Template
        ]

        for file_path in possible_files:
            if file_path.exists():
                filepath = str(file_path)
                print(f"Loading data from: {filepath}")
                break
        else:
            raise FileNotFoundError(
                "No YAML file found. Please create 'data/gantt_data.yaml' from the template."
            )

    with open(filepath, 'r') as file:
        data = yaml.safe_load(file)

    return data


def yaml_to_dataframe(yaml_data: Dict) -> pd.DataFrame:
    """
    Convert YAML data to pandas DataFrame for Gantt chart

    Args:
        yaml_data: Dictionary loaded from YAML file

    Returns:
        DataFrame with columns: Task, Start, Finish, Resource, Phase, etc.
    """
    tasks = yaml_data.get('tasks', [])

    # Convert to DataFrame format
    df_data = []
    for task in tasks:
        df_data.append({
            'Task': task.get('name'),
            'Start': task.get('start'),
            'Finish': task.get('finish'),
            'Resource': task.get('resource', 'Unassigned'),
            'Phase': task.get('phase', ''),
            'Description': task.get('description', ''),
            'Dependencies': task.get('dependencies', [])
        })

    return pd.DataFrame(df_data)


def create_gantt_from_yaml(
    yaml_file: str = None,
    save_output: bool = True,
    output_dir: str = "output",
    **kwargs
) -> go.Figure:
    """
    Create a Gantt chart directly from a YAML file

    Args:
        yaml_file: Path to YAML file (optional)
        save_output: Whether to save the chart
        output_dir: Directory to save output files
        **kwargs: Additional arguments passed to create_gantt_chart

    Returns:
        Plotly Figure object
    """
    # Load YAML data
    yaml_data = load_data_from_yaml(yaml_file)

    # Extract configuration
    project = yaml_data.get('project', {})
    config = yaml_data.get('config', {})

    # Convert tasks to DataFrame
    df = yaml_to_dataframe(yaml_data)

    # Initialize charter
    charter = GanttCharter(apply_theme=True)

    # Get milestones if they exist
    milestones = yaml_data.get('milestones', [])

    # Create chart with config from YAML
    fig = charter.create_gantt_chart(
        df,
        title=project.get('title', 'Project Timeline'),
        palette=config.get('palette', 'professional'),
        add_branding=config.get('add_branding', False),
        show_dependencies=config.get('show_dependencies', False),
        height=config.get('height', 600),
        milestones=milestones,
        **kwargs
    )

    # Save if requested
    if save_output:
        os.makedirs(output_dir, exist_ok=True)
        filename = project.get('title', 'gantt_chart').lower().replace(' ', '_')
        charter.save_chart(
            fig,
            f"{output_dir}/{filename}",
            format="html",
            width=config.get('width', 1200),
            height=config.get('height', 600)
        )
        charter.save_chart(
            fig,
            f"{output_dir}/{filename}",
            format="png",
            width=config.get('width', 1200),
            height=config.get('height', 600)
        )

    return fig


# Column-name aliases accepted in CSV files (case-insensitive). Matches the
# template used by the web app, so files move freely between the two tools.
CSV_COLUMN_ALIASES = {
    'task': 'Task', 'name': 'Task', 'title': 'Task',
    'start': 'Start', 'start date': 'Start', 'begin': 'Start',
    'finish': 'Finish', 'end': 'Finish', 'end date': 'Finish', 'finish date': 'Finish',
    'resource': 'Resource', 'assignee': 'Resource', 'who': 'Resource', 'owner': 'Resource',
    'phase': 'Phase', 'group': 'Phase', 'category': 'Phase',
    'description': 'Description', 'notes': 'Description',
    'dependencies': 'Dependencies', 'depends on': 'Dependencies', 'predecessors': 'Dependencies',
    'type': 'Type', 'date': 'Date',
}


def load_data_from_csv(filepath: str):
    """
    Load Gantt chart data from a CSV file.

    Accepts the same template as the web app: columns Task, Start, Finish,
    Resource, Phase, Description, plus an optional Type column where rows
    marked "milestone" become milestones (their date taken from the Date
    or Start column). Header names are matched case-insensitively and
    common aliases (Name, End, Assignee, Group, ...) are accepted.

    Args:
        filepath: Path to the CSV file.

    Returns:
        Tuple of (DataFrame of tasks, list of milestone dicts).

    Raises:
        ValueError: If required columns are missing.
    """
    raw = pd.read_csv(filepath, dtype=str).fillna('')
    rename = {}
    for col in raw.columns:
        key = str(col).strip().lower()
        if key in CSV_COLUMN_ALIASES:
            rename[col] = CSV_COLUMN_ALIASES[key]
    df = raw.rename(columns=rename)

    if 'Task' not in df.columns or 'Start' not in df.columns:
        raise ValueError(
            "CSV must contain at least 'Task' and 'Start' columns "
            "(aliases such as Name/Begin are accepted). "
            f"Found columns: {list(raw.columns)}"
        )

    if 'Type' in df.columns:
        is_milestone = df['Type'].str.strip().str.lower() == 'milestone'
    else:
        is_milestone = pd.Series(False, index=df.index)

    milestones = []
    for _, row in df[is_milestone].iterrows():
        date = (row.get('Date', '') or row.get('Start', '')).strip()
        name = row['Task'].strip()
        if name and date:
            milestones.append({
                'name': name,
                'date': date,
                'description': row.get('Description', '').strip(),
            })

    tasks = df[~is_milestone].copy()
    tasks = tasks[tasks['Task'].str.strip() != '']
    if 'Finish' not in tasks.columns:
        tasks['Finish'] = tasks['Start']
    tasks['Finish'] = tasks['Finish'].where(tasks['Finish'].str.strip() != '', tasks['Start'])
    for optional in ('Resource', 'Phase', 'Description', 'Dependencies'):
        if optional not in tasks.columns:
            tasks[optional] = ''

    columns = ['Task', 'Start', 'Finish', 'Resource', 'Phase', 'Description', 'Dependencies']
    return tasks[columns].reset_index(drop=True), milestones


def load_data_from_excel(filepath: str, sheet_name: str = None) -> pd.DataFrame:
    """
    Load Gantt chart data from Excel file

    Args:
        filepath: Path to Excel file
        sheet_name: Specific sheet to load (default: first sheet)

    Returns:
        DataFrame with project data
    """
    df = pd.read_excel(filepath, sheet_name=sheet_name)
    return df


def create_sample_data() -> pd.DataFrame:
    """
    Load sample project data from YAML template

    Returns:
        DataFrame with sample project tasks
    """
    # Load from template YAML
    yaml_data = load_data_from_yaml()
    return yaml_to_dataframe(yaml_data)


if __name__ == "__main__":
    # Quick test using YAML data
    fig = create_gantt_from_yaml()
    fig.show()