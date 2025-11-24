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

# Import Oxford theme
try:
    from oxford_plotly_theme import (
        apply_oxford_theme,
        create_oxford_figure,
        get_color_palette,
        save_oxford_figure,
        add_oxford_branding
    )
    OXFORD_THEME_AVAILABLE = True
except ImportError:
    print("Warning: Oxford Plotly Theme not installed. Using default Plotly styling.")
    print("Install with: pip install -e /Users/sami/PycharmProjects/Oxford-Plotly-Theme")
    OXFORD_THEME_AVAILABLE = False


class GanttCharter:
    """Professional Gantt chart generator with Oxford theming"""

    def __init__(self, apply_theme: bool = True):
        """
        Initialize GanttCharter

        Args:
            apply_theme: Whether to apply Oxford theme globally (default: True)
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
        Create a professional Gantt chart with Oxford theming

        Args:
            data: DataFrame or list of dicts with columns: Task, Start, Finish, Resource (optional)
            title: Chart title
            palette: Oxford palette name (professional, traditional, corporate, contemporary)
            show_dependencies: Whether to show task dependencies (if Dependencies column exists)
            add_branding: Whether to add Oxford branding/watermark
            **kwargs: Additional arguments passed to plotly.express.timeline()

        Returns:
            Plotly Figure object
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

        # Get color sequence from Oxford theme
        if OXFORD_THEME_AVAILABLE:
            color_sequence = get_color_palette(palette)
        else:
            color_sequence = None

        # Create base figure
        if OXFORD_THEME_AVAILABLE:
            # Create with Oxford template
            fig = create_oxford_figure(
                title=title,
                xaxis_title="Date",
                yaxis_title="Tasks",
                palette=palette
            )

            # Add timeline data
            timeline_fig = px.timeline(
                df,
                x_start="Start",
                x_end="Finish",
                y="Task",
                color=color_col,
                hover_data=['Duration_Text', 'Start', 'Finish'],
                color_discrete_sequence=color_sequence,
                **kwargs
            )

            # Merge traces
            for trace in timeline_fig.data:
                fig.add_trace(trace)

        else:
            # Fallback to standard Plotly
            fig = px.timeline(
                df,
                x_start="Start",
                x_end="Finish",
                y="Task",
                color=color_col,
                hover_data=['Duration_Text', 'Start', 'Finish'],
                title=title,
                **kwargs
            )

        # Customize layout
        fig.update_yaxes(autorange="reversed")  # Tasks from top to bottom
        fig.update_xaxes(
            tickformat="%b %d\n%Y",
            dtick="M1",  # Monthly ticks
            ticklabelmode="period"
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

        # Update hover template
        fig.update_traces(
            hovertemplate="<b>%{y}</b><br>" +
                         "Start: %{customdata[1]|%b %d, %Y}<br>" +
                         "End: %{customdata[2]|%b %d, %Y}<br>" +
                         "Duration: %{customdata[0]}<br>" +
                         "<extra></extra>"
        )

        return fig

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
    Load Gantt chart data from YAML file

    Args:
        filepath: Path to YAML file. If not provided, tries to load from:
                 1. data/gantt_data.yaml (private data)
                 2. data/gantt_template.yaml (template)

    Returns:
        Dictionary with project data
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

    # Create chart with config from YAML
    fig = charter.create_gantt_chart(
        df,
        title=project.get('title', 'Project Timeline'),
        palette=config.get('palette', 'professional'),
        add_branding=config.get('add_branding', False),
        show_dependencies=config.get('show_dependencies', False),
        height=config.get('height', 600),
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