#!/usr/bin/env python3
"""
Gantt Charter CLI - Command-line interface for generating Gantt charts
Author: Sami Adnan
Affiliation: University of Oxford
"""

import argparse
import sys
import os
from pathlib import Path
from src.gantt_charter import (
    create_gantt_from_yaml,
    GanttCharter,
    load_data_from_yaml,
    yaml_to_dataframe
)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Generate professional Gantt charts from YAML data with Oxford Plotly Theme",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  gantt-charter                           # Generate chart using default data file
  gantt-charter -i project.yaml           # Use specific YAML file
  gantt-charter -f png                    # Export as PNG
  gantt-charter -f pdf -o report          # Export as PDF with custom name
  gantt-charter --palette corporate       # Use corporate color palette
  gantt-charter --no-branding             # Disable Oxford branding
  gantt-charter --show                    # Display interactive chart
        """
    )

    # Input/Output arguments
    parser.add_argument(
        "-i", "--input",
        type=str,
        default=None,
        help="Path to YAML data file (default: data/gantt_data.yaml or data/gantt_template.yaml)"
    )

    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output filename without extension (default: based on project title)"
    )

    parser.add_argument(
        "-d", "--output-dir",
        type=str,
        default="output",
        help="Output directory for saved charts (default: output)"
    )

    # Format arguments
    parser.add_argument(
        "-f", "--format",
        type=str,
        choices=["png", "svg", "pdf", "html"],
        default="html",
        help="Export format (default: html)"
    )

    parser.add_argument(
        "--width",
        type=int,
        default=1200,
        help="Chart width in pixels (default: 1200)"
    )

    parser.add_argument(
        "--height",
        type=int,
        default=600,
        help="Chart height in pixels (default: 600)"
    )

    parser.add_argument(
        "--scale",
        type=int,
        default=3,
        help="Export quality scale factor for raster formats (default: 3)"
    )

    # Style arguments
    parser.add_argument(
        "-p", "--palette",
        type=str,
        choices=[
            "professional", "traditional", "corporate", "contemporary",
            "vibrant", "primary", "pastel", "health", "diverging",
            "sequential_blue", "celebratory", "innovative"
        ],
        default=None,
        help="Oxford color palette to use"
    )

    parser.add_argument(
        "--title",
        type=str,
        default=None,
        help="Override chart title from YAML"
    )

    parser.add_argument(
        "--branding",
        action="store_true",
        default=None,
        help="Add Oxford branding/watermark"
    )

    parser.add_argument(
        "--no-branding",
        action="store_true",
        default=False,
        help="Disable Oxford branding even if specified in YAML"
    )

    # Display options
    parser.add_argument(
        "-s", "--show",
        action="store_true",
        default=False,
        help="Display interactive chart in browser"
    )

    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        default=False,
        help="Enable verbose output"
    )

    args = parser.parse_args()

    try:
        # Load YAML data
        if args.verbose:
            print(f"Loading data from: {args.input or 'default location'}")

        yaml_data = load_data_from_yaml(args.input)

        # Extract configuration
        project = yaml_data.get('project', {})
        config = yaml_data.get('config', {})

        # Convert to DataFrame
        df = yaml_to_dataframe(yaml_data)

        if args.verbose:
            print(f"Loaded {len(df)} tasks from YAML")

        # Override configuration with CLI arguments
        title = args.title or project.get('title', 'Project Timeline')
        palette = args.palette or config.get('palette', 'professional')

        # Handle branding flags
        if args.no_branding:
            add_branding = False
        elif args.branding is not None:
            add_branding = args.branding
        else:
            add_branding = config.get('add_branding', False)

        # Use dimensions from CLI or YAML config
        width = args.width or config.get('width', 1200)
        height = args.height or config.get('height', 600)

        # Initialize charter
        charter = GanttCharter(apply_theme=True)

        # Create chart
        if args.verbose:
            print(f"Creating Gantt chart with palette: {palette}")

        fig = charter.create_gantt_chart(
            df,
            title=title,
            palette=palette,
            add_branding=add_branding,
            show_dependencies=config.get('show_dependencies', False),
            height=height
        )

        # Determine output filename
        if args.output:
            filename = args.output
        else:
            # Use project title or default
            filename = project.get('title', 'gantt_chart').lower().replace(' ', '_')

        # Create output directory if needed
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        output_path = output_dir / filename

        # Save chart
        if args.verbose:
            print(f"Saving chart as {args.format} to: {output_path}.{args.format}")

        charter.save_chart(
            fig,
            str(output_path),
            format=args.format,
            width=width,
            height=height,
            scale=args.scale
        )

        print(f"Chart saved successfully: {output_path}.{args.format}")

        # Show interactive chart if requested
        if args.show:
            if args.verbose:
                print("Opening chart in browser...")
            fig.show()

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        print("\nPlease ensure you have created a data file:", file=sys.stderr)
        print("  cp data/gantt_template.yaml data/gantt_data.yaml", file=sys.stderr)
        print("  # Then edit data/gantt_data.yaml with your project data", file=sys.stderr)
        return 1

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())