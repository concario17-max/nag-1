# State

## Current Task
Rework the lamp chapter/verse selector so higher-level headings like `제1편 삼사의 정의` and `1장. 상사의 바른방편` are visually distinct and expandable as a real hierarchy.

## Route
Route A

## Writer Slot
main: direct-write

## Contract Freeze
Frozen scope:
- Update only the chapter/verse selector UI in `lamp/src/App.tsx`.
- Add hierarchical accordion behavior and clearer visual hierarchy for title groups, chapter sections, and subheadings derived from the existing reading data.
- Preserve the current routing and verse navigation behavior.
- Do not touch unrelated app files, package files, or assets.

Reason for Route A:
- The task is a focused single-file UI refactor with no cross-file contract changes, so it fits Route A.

## Write Sets
- main: `STATE.md`, `lamp/src/App.tsx`

## Reviewer
Wegener

## Last Update
2026-06-06 10:13:00 +09:00 - Added breadcrumb chips, stronger `편/장/절` styling, and default expansion so the hierarchy reads as distinct sections instead of one flat list.

## Open Review Item
- None.
