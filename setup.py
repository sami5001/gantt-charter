"""
Setup script for Gantt Charter
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setup(
    name="gantt-charter",
    version="1.0.0",
    author="Sami Adnan",
    author_email="sami.adnan@oxford.ac.uk",
    description="Professional Gantt chart generator with Oxford Plotly Theme",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/sami5001/gantt-charter",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Visualization",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.7",
    install_requires=[
        "plotly>=6.1.1",
        "pandas>=1.3.0",
        "numpy>=1.21.0",
        "pyyaml>=6.0",
        "python-dateutil>=2.8.0",
        "openpyxl>=3.0.0",
        "kaleido>=0.2.0",
    ],
    entry_points={
        "console_scripts": [
            "gantt-charter=cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["data/*.yaml"],
    },
)