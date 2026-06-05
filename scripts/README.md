# Scripts

This directory contains the project scripts used for data generation, validation, and browser QA.

## Inputs

- source text files: `../data-source/`
- token mapping JSON: `../data-source/han-json/`

## Outputs

- generated legacy bundle input: `../data.js`
- generated runtime data: `../public/data.json`

## Main scripts

- `generate_data.ps1`
  Builds `data.js` and `public/data.json` from the source text files.

- `merge_tokens.ps1`
  Merges token mapping results into the generated data structure.

- `update_dictionary.ps1`
- `update_dictionary.cjs`
  Updates dictionary fields from source files.

- `check_audio_mismatch.cjs`
  Checks whether data entries and MP3 files are aligned.

- `verify_data.cjs`
- `verify_phase19.ps1`
  Run targeted integrity checks on generated data.

- `browser_smoke.mjs`
  Playwright smoke test for desktop and mobile flows.

## Notes

- The live React app reads `../public/data.json`.
- `generate_data.ps1` is the canonical way to refresh runtime data.
- Archived historical output is stored in `../data-source/archive/`.
