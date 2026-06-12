import sys
from pathlib import Path

# Make the repo root importable so tests can use `from src.gantt_charter import ...`
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
