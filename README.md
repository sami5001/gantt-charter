# Gantt Charter

[![Python Version](https://img.shields.io/badge/python-3.7%2B-blue)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Oxford Theme](https://img.shields.io/badge/Theme-Oxford-002147)](https://github.com/sami5001/oxford-plotly-theme)
[![Plotly](https://img.shields.io/badge/Powered%20by-Plotly-3F4F75)](https://plotly.com/)

Professional Gantt chart generator with Oxford Plotly Theme integration for creating beautiful, publication-quality project timelines.

**Author**: Sami Adnan
**Affiliation**: University of Oxford

## Features

- **YAML-Based Configuration**: Define your project timeline in simple YAML files
- **Professional Styling**: Integrated with Oxford Plotly Theme for branded, consistent visualizations
- **Multiple Chart Types**: Standard Gantt charts, resource timelines, and multi-project views
- **High-Quality Export**: Export to PNG, PDF, SVG, or interactive HTML
- **Customizable Palettes**: Choose from 12 Oxford color palettes for different contexts
- **Privacy-Focused**: Keep your project data private with gitignored YAML files
- **Easy to Use**: Simple Python API with sensible defaults

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/sami5001/gantt-charter.git
cd gantt-charter
```

### 2. Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Install Oxford Plotly Theme
```bash
pip install -e /Users/sami/PycharmProjects/Oxford-Plotly-Theme
```

## Quick Start

### 1. Set up your project data

Copy the template to create your private data file:
```bash
cp data/gantt_template.yaml data/gantt_data.yaml
```

Edit `data/gantt_data.yaml` with your project tasks. This file is gitignored for privacy.

### 2. Create Gantt chart from YAML

```python
from src.gantt_charter import create_gantt_from_yaml

# Create chart from your YAML data
fig = create_gantt_from_yaml()

# Display interactive chart
fig.show()
```

### 3. Or use the Python API

```python
from src.gantt_charter import GanttCharter, load_data_from_yaml, yaml_to_dataframe

# Load data from YAML
yaml_data = load_data_from_yaml("data/gantt_data.yaml")
df = yaml_to_dataframe(yaml_data)

# Create customized chart
charter = GanttCharter(apply_theme=True)
fig = charter.create_gantt_chart(
    df,
    title="My Project Timeline",
    palette="professional"  # Choose from 12 Oxford palettes
)

# Save in high quality
charter.save_chart(fig, "timeline", format="png")
```

## YAML Data Format

Edit `data/gantt_data.yaml` to define your project timeline. The YAML structure includes:

### Project metadata
```yaml
project:
  title: "My Project"
  description: "Project description"
```

### Configuration
```yaml
config:
  palette: "professional"  # Oxford color palette
  add_branding: true       # Add Oxford watermark
  height: 600             # Chart height
  width: 1200            # Chart width for export
```

### Tasks
```yaml
tasks:
  - name: "Task Name"
    start: "2024-01-01"
    finish: "2024-01-14"
    resource: "Team/Person"
    phase: "Project Phase"
    description: "Optional description"
    dependencies: ["Previous Task"]  # Optional
```

See `data/gantt_template.yaml` for a complete example with all available options.

## Command Line Interface

Gantt Charter includes a powerful CLI for generating charts directly from the terminal.

### Basic Usage

```bash
# Generate chart using default data file
python cli.py

# Use specific YAML file
python cli.py -i project.yaml

# Export as PNG with custom dimensions
python cli.py -f png --width 1400 --height 800

# Export as PDF with custom output name
python cli.py -f pdf -o my_timeline

# Use different color palette
python cli.py --palette corporate

# Add Oxford branding
python cli.py --branding

# Display interactive chart in browser
python cli.py --show
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input` | Path to YAML data file | `data/gantt_data.yaml` |
| `-o, --output` | Output filename (without extension) | Project title from YAML |
| `-d, --output-dir` | Output directory | `output` |
| `-f, --format` | Export format: png, svg, pdf, html | `html` |
| `--width` | Chart width in pixels | `1200` |
| `--height` | Chart height in pixels | `600` |
| `--scale` | Quality scale for raster formats | `3` |
| `-p, --palette` | Oxford color palette | `professional` |
| `--title` | Override chart title | From YAML |
| `--branding` | Add Oxford watermark | `False` |
| `--no-branding` | Force disable branding | N/A |
| `-s, --show` | Display in browser | `False` |
| `-v, --verbose` | Enable verbose output | `False` |

### Export Formats

- **HTML**: Interactive chart with zoom, pan, and hover capabilities (no additional requirements)
- **PNG**: High-quality raster image (best for presentations) - requires Chrome
- **PDF**: Vector format for publications - requires Chrome
- **SVG**: Scalable vector graphics for web and editing - requires Chrome

**Note**: For PNG, PDF, and SVG exports, Google Chrome must be installed. If Chrome is not available, install it or use HTML format which works without additional requirements.

### Examples

```bash
# Quick export for presentation
python cli.py -f png --palette vibrant --width 1920 --height 1080

# Generate PDF for publication
python cli.py -f pdf --palette professional --branding

# Create interactive HTML for web
python cli.py -f html --show

# Batch processing with different palettes
for palette in professional corporate traditional; do
    python cli.py -f png --palette $palette -o timeline_$palette
done
```

## Available Oxford Palettes

- **professional**: Business and academic presentations (6 colors)
- **traditional**: Formal, heritage-focused projects (4 colors)
- **corporate**: Professional reports (blues and greys)
- **contemporary**: Modern research timelines (3 colors)
- **vibrant**: Eye-catching visualizations (7 colors)
- **primary**: Default, most versatile (10 colors)

## Examples

Run all examples:
```bash
python examples.py
```

This will create:
1. Basic Gantt chart
2. Research timeline with Oxford branding
3. Resource allocation view
4. Multi-project portfolio timeline
5. Custom styled chart

All outputs are saved to the `output/` directory.

## Advanced Usage

### Resource Timeline
```python
fig = charter.create_resource_timeline(
    data,
    title="Team Workload",
    palette="vibrant"
)
```

### Add Oxford Branding
```python
fig = charter.create_gantt_chart(
    data,
    title="Official Project Timeline",
    add_branding=True  # Adds Oxford watermark
)
```

### Custom Export Settings
```python
charter.save_chart(
    fig,
    filename="high_quality_timeline",
    format="pdf",  # or png, svg, html
    width=1400,
    height=800,
    scale=3  # Higher = better quality
)
```

## Contributing

We welcome contributions to Gantt Charter! Please follow these guidelines to ensure smooth collaboration.

### How to Contribute

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Branch**: Make a descriptive branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**: Implement your feature or bug fix
4. **Test**: Ensure all tests pass and add new tests if needed
5. **Commit**: Write clear, concise commit messages
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push**: Push your changes to your fork
7. **Pull Request**: Open a PR with a detailed description

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Testing**: Describe how you tested your changes
- **Documentation**: Update README if you add new features
- **Code Style**: Follow PEP 8 Python style guidelines
- **YAML Files**: Ensure YAML files are valid and well-formatted
- **No Breaking Changes**: Maintain backward compatibility

### Code Style Requirements

- Use 4 spaces for indentation (no tabs)
- Maximum line length of 100 characters
- Add docstrings to all functions and classes
- Use type hints where appropriate

### Testing

Before submitting a PR:
```bash
# Test the basic functionality
python test_setup.py

# Test CLI
python cli.py --help

# Test with your YAML data
python cli.py -f png --verbose
```

### Reporting Issues

When reporting issues, please include:
- Python version
- Operating system
- Complete error messages
- Minimal YAML file that reproduces the issue
- Steps to reproduce

### Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Explain the use case
- Provide examples if possible
- Consider implementing it yourself

## License

MIT License - See LICENSE file for details

## Author

**Sami Adnan**
- Affiliation: University of Oxford
- GitHub: [@sami5001](https://github.com/sami5001)
- Year: 2025

## Acknowledgments

- [Oxford Plotly Theme](https://github.com/sami5001/oxford-plotly-theme) for professional visualization styling
- [Plotly](https://plotly.com/) for the powerful charting library
- University of Oxford for brand guidelines and color palettes