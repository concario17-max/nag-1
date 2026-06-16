# Three Bodies (因位三身行相明燈論)

Three Bodies is a React-based reading app for the "因位三身行相明燈論" (Three Bodies) text. It brings together Tibetan source text, pronunciations, multiple Korean translations, word meanings, and a commentary study panel with learning comics in one interface.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Vitest
- Playwright

## Project layout

- `src/`: active application code
- `public/`: runtime assets such as `reading-snapshot.json`, `reading-data.json`, and learning comic images (`학습만화/`)
- `scripts/`: data extraction, verification, and browser QA scripts
- `docs/`: supporting notes and historical reports

## Runtime data flow

The app reads from `/reading-snapshot.json` and `/reading-data.json`.

- Loader: `src/utils/dataFetcher.ts`
- Shared provider: `src/context/YogaDataContext.tsx`
- Source generators:
  - `scripts/export-reading-snapshot.mjs` (Extracts text to json snapshot)
  - `scripts/export-commentary-from-odt.py` (Extracts ODT XML to typescript commentary modules)

## Local development

```bash
npm install
npm run dev
```

Core checks:

```bash
npm run typecheck
npm run test -- --run
npm run build
```

Browser smoke QA:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
BASE_URL=http://127.0.0.1:4173 npm run qa:browser
```

### Windows Troubleshooting: PowerShell Execution Policy Block

If you encounter an error stating that `npm.ps1 cannot be loaded because running scripts is disabled on this system` when running `npm` commands in PowerShell, use the following workarounds:

1. **Bypass Execution Policy**:
   Run the command with execution policy bypass option:
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "npm run dev"
   ```

2. **Use Command Prompt**:
   Use standard `cmd.exe` or call the command shim directly:
   ```cmd
   npm.cmd run dev
   ```

## Current architecture notes

- The live app is the React code under `src/`.
- Verse pages use a shared shell with a header, left chapter sidebar, and an optional right commentary panel.
- Desktop verse layout uses a shared frame model:
  - left open + commentary open: `20 / 60 / 20`
  - left closed + commentary open: `0 / 60 / 40`
  - left open + commentary closed: `20 / 80 / 0`
  - left closed + commentary closed: `0 / 100 / 0`
- Desktop sidebar and right-panel preferences are stored in `localStorage`.
- Data access is centralized through `YogaDataProvider`, which reduces repeated fetch logic across pages, panels, and modals.

## Deployment

This is a static build.

- Build command: `npm run build`
- Output directory: `dist`

Before deployment:

- confirm `public/reading-snapshot.json` is current
- run `npm run typecheck`
- run `npm run test -- --run`
- run `npm run build`
- optionally run `npm run qa:browser`

## Notes

- `research.md` contains the current deep architecture report for the repository.
- `plan.md` tracks the remediation checklist and completion status for the current pass.
- `reuse-guide.md` explains how to port the desktop layout system into another project.
