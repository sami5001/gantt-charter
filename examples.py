"""
Example usage of Gantt Charter with Oxford Plotly Theme
Demonstrates various chart types and customization options using YAML data
"""

import pandas as pd
from datetime import datetime, timedelta
from src.gantt_charter import (
    GanttCharter,
    create_sample_data,
    create_gantt_from_yaml,
    load_data_from_yaml,
    yaml_to_dataframe
)


def example_basic_gantt():
    """Create a basic Gantt chart from YAML data"""
    print("Creating basic Gantt chart from YAML...")

    # Create chart directly from YAML
    fig = create_gantt_from_yaml(
        save_output=True,
        output_dir="output"
    )

    # Display
    fig.show()

    print("✓ Basic Gantt chart created from YAML data")


def example_research_timeline():
    """Create a research project timeline with academic styling"""
    print("Creating research timeline...")

    charter = GanttCharter()

    # Create research project data
    data = [
        {
            "Task": "Literature Review",
            "Start": "2024-01-01",
            "Finish": "2024-02-28",
            "Resource": "Researcher",
            "Phase": "Preparation"
        },
        {
            "Task": "Methodology Design",
            "Start": "2024-02-15",
            "Finish": "2024-03-31",
            "Resource": "Researcher",
            "Phase": "Preparation"
        },
        {
            "Task": "Ethics Approval",
            "Start": "2024-03-15",
            "Finish": "2024-04-30",
            "Resource": "Committee",
            "Phase": "Preparation"
        },
        {
            "Task": "Data Collection",
            "Start": "2024-05-01",
            "Finish": "2024-08-31",
            "Resource": "Research Team",
            "Phase": "Fieldwork"
        },
        {
            "Task": "Data Analysis",
            "Start": "2024-08-15",
            "Finish": "2024-10-31",
            "Resource": "Analyst",
            "Phase": "Analysis"
        },
        {
            "Task": "Paper Writing",
            "Start": "2024-10-01",
            "Finish": "2024-12-15",
            "Resource": "Researcher",
            "Phase": "Writing"
        },
        {
            "Task": "Peer Review",
            "Start": "2024-12-15",
            "Finish": "2025-01-31",
            "Resource": "Reviewers",
            "Phase": "Publication"
        },
        {
            "Task": "Revisions",
            "Start": "2025-02-01",
            "Finish": "2025-02-28",
            "Resource": "Researcher",
            "Phase": "Publication"
        },
        {
            "Task": "Final Submission",
            "Start": "2025-03-01",
            "Finish": "2025-03-15",
            "Resource": "Researcher",
            "Phase": "Publication"
        }
    ]

    df = pd.DataFrame(data)

    # Create chart with academic palette
    fig = charter.create_gantt_chart(
        df,
        title="Research Project Timeline",
        palette="traditional",  # Traditional palette for academic work
        add_branding=True  # Add Oxford branding
    )

    fig.show()
    charter.save_chart(fig, "output/research_timeline", format="pdf")


def example_resource_view():
    """Create a resource-focused timeline from YAML"""
    print("Creating resource timeline from YAML...")

    # Load YAML data
    yaml_data = load_data_from_yaml()
    df = yaml_to_dataframe(yaml_data)

    charter = GanttCharter()

    # Create resource timeline
    fig = charter.create_resource_timeline(
        df,
        title="Resource Allocation Timeline",
        palette="vibrant"
    )

    fig.show()
    charter.save_chart(fig, "output/resource_timeline", format="png")


def example_multi_project():
    """Create a multi-project Gantt chart with phases"""
    print("Creating multi-project timeline...")

    charter = GanttCharter()

    # Create data for multiple projects
    today = datetime.today()

    projects = []

    # Project A
    for i, (task, duration) in enumerate([
        ("Planning", 14),
        ("Development", 30),
        ("Testing", 21),
        ("Deployment", 7)
    ]):
        start = today + timedelta(days=i*20)
        projects.append({
            "Task": f"Project A - {task}",
            "Start": start,
            "Finish": start + timedelta(days=duration),
            "Resource": "Team A",
            "Project": "Project A"
        })

    # Project B (starts 2 weeks later)
    base_date = today + timedelta(days=14)
    for i, (task, duration) in enumerate([
        ("Requirements", 21),
        ("Design", 14),
        ("Implementation", 35),
        ("Launch", 7)
    ]):
        start = base_date + timedelta(days=i*25)
        projects.append({
            "Task": f"Project B - {task}",
            "Start": start,
            "Finish": start + timedelta(days=duration),
            "Resource": "Team B",
            "Project": "Project B"
        })

    # Project C (starts 1 month later)
    base_date = today + timedelta(days=30)
    for i, (task, duration) in enumerate([
        ("Research", 28),
        ("Prototype", 21),
        ("Validation", 14),
        ("Production", 21)
    ]):
        start = base_date + timedelta(days=i*20)
        projects.append({
            "Task": f"Project C - {task}",
            "Start": start,
            "Finish": start + timedelta(days=duration),
            "Resource": "Team C",
            "Project": "Project C"
        })

    df = pd.DataFrame(projects)

    # Create chart with corporate palette for business presentation
    fig = charter.create_gantt_chart(
        df,
        title="Multi-Project Portfolio Timeline",
        palette="corporate",
        color="Project"  # Color by project instead of resource
    )

    fig.show()
    charter.save_chart(fig, "output/multi_project", format="svg")


def example_custom_styling():
    """Demonstrate custom styling options with YAML data"""
    print("Creating custom styled chart...")

    # Load YAML data
    yaml_data = load_data_from_yaml()
    df = yaml_to_dataframe(yaml_data)

    charter = GanttCharter()

    # Create chart with contemporary palette
    fig = charter.create_gantt_chart(
        df,
        title="Modern Project Timeline",
        palette="contemporary",
        height=600,  # Custom height
        labels={"Resource": "Team", "Task": "Activity"}  # Custom labels
    )

    # Additional customization
    fig.update_layout(
        font_size=14,
        showlegend=True,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.2,
            xanchor="center",
            x=0.5
        )
    )

    fig.show()
    charter.save_chart(fig, "output/custom_styled", format="png", width=1400, height=600)


def run_all_examples():
    """Run all example functions"""
    print("=" * 60)
    print("Gantt Charter Examples with Oxford Plotly Theme")
    print("=" * 60)

    # Create output directory if it doesn't exist
    import os
    os.makedirs("output", exist_ok=True)

    examples = [
        ("Basic Gantt Chart", example_basic_gantt),
        ("Research Timeline", example_research_timeline),
        ("Resource View", example_resource_view),
        ("Multi-Project Timeline", example_multi_project),
        ("Custom Styling", example_custom_styling)
    ]

    for i, (name, func) in enumerate(examples, 1):
        print(f"\n{i}. {name}")
        print("-" * 40)
        try:
            func()
            print(f"✓ {name} completed successfully")
        except Exception as e:
            print(f"✗ Error in {name}: {e}")
        print()

    print("=" * 60)
    print("All examples completed! Check the 'output' folder for saved charts.")
    print("=" * 60)


if __name__ == "__main__":
    # Run all examples
    run_all_examples()

    # Or run individual examples:
    # example_basic_gantt()
    # example_research_timeline()
    # example_resource_view()
    # example_multi_project()
    # example_custom_styling()