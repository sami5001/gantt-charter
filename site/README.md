# Gantt Charter web app

Browser app for building print-quality Gantt charts: CSV import or manual entry,
twelve Oxford palettes, A4/Letter in portrait or landscape, and vector PDF, SVG
and PNG export with embedded IBM Plex fonts. Fully client-side; nothing is uploaded.

Built with Astro, React and Tailwind CSS 4. The chart itself is produced by a
dependency-free SVG renderer (`src/lib/renderer.ts`); the same SVG drives the
on-screen preview and every export format, so what you see is exactly what prints.

## Development

```bash
npm install
npm run dev        # http://localhost:4321/gantt-charter/
npm run build      # static build in dist/
```

## Deployment

Pushed changes under `site/` deploy to GitHub Pages automatically via
`.github/workflows/deploy.yml`. One-time repository setting: Settings → Pages →
Source → "GitHub Actions".

## Data formats

- **CSV**: columns `Type, Task, Start, Finish, Resource, Phase, Description`
  (header aliases accepted; `Type=milestone` rows become milestones).
- **YAML**: the same `project / config / tasks / milestones` schema the Python
  CLI reads, so files round-trip between the web app and the CLI.
