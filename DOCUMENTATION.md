# Gantt Charter - Complete Documentation

## Overview

Gantt Charter is a professional Gantt chart generator built with Python, featuring Oxford University theming for publication-quality visualizations. It provides a simple yet powerful way to create project timelines from YAML data files.

## Key Features

### 1. Built-in Oxford Theme
- **No external dependencies**: Oxford Plotly Theme is included in the `utils` folder
- **12 color palettes**: From professional to vibrant, suitable for different contexts
- **PHC accent colors**: Milestone markers use PHC department colors (#8A1751)

### 2. Dynamic Layout
- **Automatic margin adjustment**: Left margin scales based on longest task name; top and right margins grow to fit milestone labels
- **Milestone lane**: Diamonds pinned to the top of the plot with angled labels rising into the margin and dotted guide lines through the chart
- **Adaptive date axis**: Tick interval (monthly to half-yearly) follows the project span
- **Auto height**: Chart height scales with the number of task rows unless an explicit height or paper size is given
- **Recurring tasks**: Rows with the same task name share one chart row, each drawing its own bar
- **Zero-duration tasks**: A task whose start and finish match renders as a diamond marker so it stays visible

### 3. YAML Configuration
- **Structured data format**: Easy to read and maintain
- **Privacy by default**: Personal data files are gitignored
- **Template included**: Start quickly with example data

## Architecture

```
gantt-charter/
├── src/
│   └── gantt_charter.py      # Main module with GanttCharter class
├── utils/
│   └── oxford_plotly_theme/  # Built-in Oxford theme (self-contained)
├── data/
│   ├── gantt_template.yaml   # Example template (public)
│   └── gantt_data.yaml       # Your data (gitignored)
├── output/                    # Generated charts (gitignored)
├── cli.py                     # Command-line interface
└── requirements.txt           # Python dependencies
```

## YAML Data Structure

### Complete Example

```yaml
# Project metadata
project:
  title: "My Project Timeline"
  description: "Detailed project description"
  start_date: "2024-01-01"
  end_date: "2024-12-31"

# Chart configuration
config:
  palette: "corporate"      # Oxford color palette
  add_branding: false       # Oxford watermark
  show_dependencies: false  # Task dependencies
  height: 1200             # Chart height in pixels
  width: 1600              # Chart width for export

# Tasks list
tasks:
  - name: "Task Name"
    start: "2024-01-01"
    finish: "2024-01-14"
    resource: "Team A"       # For color coding
    phase: "Planning"        # Task category
    description: "Details"   # Hover text
    dependencies: []         # Optional

# Resources (optional)
resources:
  - name: "Team A"
    role: "Development"
    allocation: 100

# Milestones
milestones:
  - name: "Launch"
    date: "2024-06-01"
    description: "Product launch date"
```

## Python API

### Basic Usage

```python
from src.gantt_charter import GanttCharter, load_data_from_yaml, yaml_to_dataframe

# Load YAML data
data = load_data_from_yaml('project.yaml')
df = yaml_to_dataframe(data)

# Create charter
charter = GanttCharter(apply_theme=True)

# Generate chart
fig = charter.create_gantt_chart(
    df,
    title="My Timeline",
    palette="corporate",
    height=1200,
    milestones=data.get('milestones', [])
)

# Display
fig.show()

# Save
charter.save_chart(fig, "output/timeline", format="png")
```

### Advanced Features

```python
# Create resource timeline
fig = charter.create_resource_timeline(
    df,
    title="Team Workload",
    palette="vibrant"
)

# Add Oxford branding
fig = charter.create_gantt_chart(
    df,
    add_branding=True,
    palette="professional"
)

# Custom dimensions for print
charter.save_chart(
    fig,
    "timeline_a4",
    format="pdf",
    width=850,    # A4 portrait width
    height=1400,  # Extended height
    scale=3       # High quality
)
```

## CLI Usage

### Basic Commands

```bash
# Generate with default settings
python cli.py

# Specify input file
python cli.py -i myproject.yaml

# Choose output format
python cli.py -f png
python cli.py -f pdf
python cli.py -f svg
python cli.py -f html

# Custom output name and directory
python cli.py -o my_timeline -d exports/
```

### Styling Options

```bash
# Select palette
python cli.py --palette corporate
python cli.py --palette vibrant

# Add Oxford branding
python cli.py --branding

# Custom dimensions
python cli.py --width 1920 --height 1080

# High quality export
python cli.py -f png --scale 5
```

### Display Options

```bash
# Show in browser
python cli.py --show

# Verbose output
python cli.py --verbose

# Override title
python cli.py --title "Q1 2024 Timeline"
```

## Color Palettes

### Available Palettes

1. **professional** (6 colors): Business and academic presentations
2. **traditional** (4 colors): Formal, heritage-focused projects
3. **corporate** (blues/greys): Professional reports
4. **contemporary** (3 colors): Modern research timelines
5. **vibrant** (7 colors): Eye-catching visualizations
6. **primary** (10 colors): Most versatile, default
7. **pastel**: Soft, accessible colors
8. **health**: Medical/PHC projects
9. **diverging**: Contrasting colors
10. **sequential_blue**: Blue gradients
11. **celebratory**: Special events
12. **innovative**: Tech/research focus

### PHC Accent Colors

Milestones automatically use PHC department colors:
- Primary: `#8A1751` (burgundy)
- Border: `#5A0F35` (dark burgundy)

## Export Formats

### HTML (Interactive)
- **No Chrome required**
- **Zoom, pan, hover capabilities**
- **Best for web/presentations**
```bash
python cli.py -f html
```

### PNG (Raster)
- **Requires Chrome**
- **High resolution support**
- **Best for documents/slides**
```bash
python cli.py -f png --scale 3
```

### PDF (Vector)
- **Requires Chrome**
- **Scalable quality**
- **Best for publications**
```bash
python cli.py -f pdf
```

### SVG (Vector)
- **Requires Chrome**
- **Editable in design tools**
- **Best for further editing**
```bash
python cli.py -f svg
```

## Tips and Best Practices

### 1. Task Naming
- Keep task names concise but descriptive
- Use consistent naming conventions
- Dynamic margins accommodate up to ~50 characters

### 2. Date Management
- Use ISO format: YYYY-MM-DD
- Tasks can overlap (shown stacked)
- Weekend work is included by default

### 3. Resource Assignment
- Assign resources for color coding
- Use consistent resource names
- Maximum 12 distinct resources (palette limit)

### 4. Milestones
- Use sparingly for key dates
- Provide descriptions for hover text
- Positioned above chart automatically

### 5. Performance
- Charts with 100+ tasks may be slow
- Use HTML for large interactive charts
- PNG/PDF export can be memory intensive

## Troubleshooting

### Common Issues

**Oxford theme not loading**
- Check utils/oxford_plotly_theme exists
- Verify import statements in gantt_charter.py

**Chrome not found for PNG/PDF**
- Install Chrome or use HTML format
- HTML works without Chrome

**Task names cut off**
- Dynamic margins should handle this
- Check for extremely long names (>50 chars)

**Milestones not showing**
- Verify milestone dates are within chart range
- Check YAML formatting

**Colors not distinct**
- Some palettes have limited colors
- Use 'primary' or 'vibrant' for more options

## Development

### Running Tests

```bash
# Test package functionality
python test_package.py

# Test CLI
python cli.py --verbose

# Test specific chart
python test_html_only.py
```

### Project Structure

- **src/gantt_charter.py**: Core functionality
- **utils/oxford_plotly_theme/**: Theme implementation
- **cli.py**: Command-line interface
- **data/*.yaml**: Configuration files
- **output/**: Generated charts (gitignored)

## License

MIT License - See LICENSE file

## Author

**Sami Adnan**
- Affiliation: University of Oxford
- Department: Population Health
- Year: 2024

## Acknowledgments

- Oxford University for brand guidelines
- Plotly for the visualization library
- The open-source community