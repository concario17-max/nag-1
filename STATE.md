# State

## Current Task
Fix the commentary lookup so chapters 2 through 4 render the right-panel ODT commentary body correctly.

## Route
Route A

## Writer Slot
main: direct implementation

## Contract Freeze
Frozen scope:
- Make commentary lookup work for the chapter 2/3 verse-key format that is already stored in the generated data.
- Keep the generated commentary files and generator script unchanged unless a small runtime fix requires it.
- Do not alter the right-panel layout or verse routing.

Reason for Route A:
- This is a single runtime lookup fix in one file.

## Write Sets
- main: `STATE.md`, `MULTI_AGENT_LOG.md`
- main: `src/utils/dataFetcher.ts`

## Reviewer
Wegener

## Last Update
2026-06-05 22:32:58 +09:00 - Restored ODT-derived right-panel commentary, recovered the missing ODT sources, and verified `generate:commentary`, typecheck, and tests.

## Open Review Item
- None.
