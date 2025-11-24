#!/usr/bin/env python3
"""
Simple test script to verify the Gantt Charter setup
"""

import sys
print(f"Python: {sys.version}")

# Test imports
try:
    import plotly
    print(f"✓ Plotly {plotly.__version__} imported successfully")
except ImportError as e:
    print(f"✗ Failed to import plotly: {e}")

try:
    import pandas as pd
    print(f"✓ Pandas {pd.__version__} imported successfully")
except ImportError as e:
    print(f"✗ Failed to import pandas: {e}")

try:
    import numpy as np
    print(f"✓ NumPy {np.__version__} imported successfully")
except ImportError as e:
    print(f"✗ Failed to import numpy: {e}")

try:
    from oxford_plotly_theme import apply_oxford_theme, get_color_palette
    print("✓ Oxford Plotly Theme imported successfully")

    # Test getting a palette
    colors = get_color_palette('professional', 3)
    print(f"  Professional palette (3 colors): {colors}")
except ImportError as e:
    print(f"✗ Failed to import Oxford theme: {e}")

try:
    from src.gantt_charter import (
        GanttCharter,
        create_gantt_from_yaml,
        yaml_to_dataframe,
        load_data_from_yaml
    )
    print("✓ Gantt Charter module imported successfully")

    # Create a simple chart from YAML
    print("\nCreating a test Gantt chart from YAML...")

    # Load YAML data
    yaml_data = load_data_from_yaml()
    df = yaml_to_dataframe(yaml_data)

    # Get first 3 tasks for quick test
    df = df.head(3)

    charter = GanttCharter(apply_theme=True)
    fig = charter.create_gantt_chart(
        df,
        title="Test Gantt Chart from YAML",
        palette="professional"
    )

    print("✓ Test chart created successfully!")
    print(f"  Chart has {len(fig.data)} traces")
    print(f"  Title: {fig.layout.title.text}")

    # Create output directory
    import os
    os.makedirs("output", exist_ok=True)

    # Save as HTML for verification
    charter.save_chart(fig, "output/test_chart", format="html")
    print("✓ Chart saved to output/test_chart.html")

except Exception as e:
    print(f"✗ Failed to create test chart: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50)
print("Setup test complete!")
print("If all checks passed, your Gantt Charter is ready to use.")
print("Run 'python examples.py' to see more examples.")
print("="*50)