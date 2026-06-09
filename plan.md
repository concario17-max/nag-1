# Yoga Remediation Plan

Updated: 2026-03-20
Status: completed
Source of truth: `research.md`

This file tracks the full-project remediation pass requested after the latest repository-wide research review.

## 1. Guardrails and sequencing

- [x] Freeze scope to code, documentation, QA, and content mismatches found in `research.md`.
- [x] Avoid unrelated feature work during this pass.
- [x] Keep runtime behavior stable unless a stronger fix is required.
- [x] Execute work in this order:
- [x] content and encoding cleanup
- [x] stale documentation repair
- [x] stale QA and browser smoke repair
- [x] commentary and layout consistency cleanup
- [x] final verification sweep

## 2. Encoding and content cleanup

- [x] Audit the active `src/` tree for remaining encoding-corrupted user-facing strings.
- [x] Fix chapter metadata copy in `src/constants.ts`.
- [x] Fix the sidebar title in `src/components/Sidebar.tsx`.
- [x] Fix the sidebar empty state in `src/components/ui/SidebarMenu.tsx`.
- [x] Fix translation section headings in `src/components/verse/TranslationSection.tsx`.
- [x] Fix malformed and corrupted compendium copy in `src/components/CompendiumModal.tsx`.
- [x] Fix commentary study prompt copy in `src/components/CommentarySidebar.tsx`.
- [x] Normalize corrupted labels in active test fixtures.

## 3. Metadata integrity

- [x] Re-audit `YOGA_CHAPTERS_META`.
- [x] Confirm Korean chapter names match the intended wording.
- [x] Confirm English chapter names still match the runtime cards and sidebar labels.
- [x] Confirm descriptions are readable and free from encoding artifacts.
- [x] Reconfirm sutra counts match `public/data.json`.

## 4. Data loading and fallback quality

- [x] Re-review `src/utils/dataFetcher.ts` fetch-failure behavior.
- [x] Replace silent `{}` fallback with a thrown load error.
- [x] Surface provider load failures through `YogaDataContext`.
- [x] Show load error UI on the landing page in `src/pages/ChapterList.tsx`.
- [x] Show load error UI on the verse page in `src/pages/VerseView.tsx`.
- [x] Add explicit lexicon load failure UI in `src/components/LexiconModal.tsx`.
- [x] Update `src/utils/dataFetcher.test.ts` to reflect the stronger failure contract.

## 5. Commentary panel reality check

- [x] Reject the empty commentary shell as insufficient.
- [x] Define a minimum viable study-guide contract for commentary.
- [x] Implement chapter frame, key line, study prompts, and usage guidance in `src/components/CommentarySidebar.tsx`.
- [x] Keep mobile and desktop commentary drawer behavior unchanged while improving content.
- [x] Align documentation and QA expectations with the real commentary panel.

## 6. Documentation accuracy

- [x] Rewrite `README.md` to match the live app.
- [x] Remove stale reflections references from `README.md`.
- [x] Document the commentary-only right panel and current desktop frame rules.
- [x] Confirm build and QA commands in `README.md` match `package.json`.
- [x] Audit `docs/` for stale conflicting guidance.
- [x] Mark `docs/리서치.md` as historical.
- [x] Mark `docs/plan.md` as historical.

## 7. Browser smoke QA repair

- [x] Audit `scripts/browser_smoke.mjs` against the live UI.
- [x] Remove stale reflections and `textarea` assumptions.
- [x] Rewrite the smoke flow around:
- [x] landing page navigation
- [x] verse route loading
- [x] desktop commentary availability and persistence
- [x] mobile sidebar open and route selection
- [x] mobile commentary drawer open and close
- [x] Fix the storage-reset bug in the smoke script so reload-based persistence checks stay valid.

## 8. Layout and shared-frame follow-up

- [x] Reconfirm the desktop frame still uses:
- [x] `20 / 60 / 20`
- [x] `0 / 60 / 40`
- [x] `20 / 80 / 0`
- [x] `0 / 100 / 0`
- [x] Verify main-panel expansion still works when commentary is hidden.
- [x] Verify commentary gap fixes remain intact.
- [x] Keep reading-column padding readable after the earlier gap repair.
- [x] Add a targeted test for `desktopVerseLayout.ts`.

## 9. Verification

- [x] Run `npm run typecheck`.
- [x] Run `npm run test -- --run`.
- [x] Run `npm run build`.
- [x] Run `npm run qa:browser`.

## 10. Closeout

- [x] Update `research.md` to reflect the remediated repository state.
- [x] Rewrite `plan.md` so completion status is readable and current.
- [x] Keep historical notes in `docs/` but remove them as active guidance.
- [x] Record final scope and verification status in repository docs.

## 11. Chapter 4 Commentary Import

- [ ] Inspect `요가수트라 해설_4. 깨달음.odt` structure and confirm verse boundaries before generating any new data file.
- [ ] Extract chapter 4 commentary into a new `src/data/chapter4Commentary.ts` file using the shared `CommentaryBlock` / `CommentaryTable` structure.
- [ ] Preserve real tables as `table` blocks instead of flattening them into paragraphs.
- [ ] Preserve numbered list items so the shared sidebar can render `1. 2. 3.` markers rather than collapsing them into dot bullets.
- [ ] Remove non-content artifacts from the ODT import:
- [ ] `Plaintext` markers
- [ ] `Online Mode` / `Offline Mode` lines
- [ ] `참조 출처` / `Verified Sources`
- [ ] search-strategy and web-search meta labels
- [ ] other trailing reference/footer blocks that are not real commentary
- [ ] Verify chapter 4 verse keys align with the source document and that no verse numbers are skipped like the earlier missing chapter 2 verse 4 issue.
- [ ] Add chapter 4 support to the shared lookup in `src/components/CommentarySidebar.tsx` while keeping chapter 1/2/3 behavior unchanged.
- [ ] Keep the existing inline heading rule so the first title shows next to the `4.x` verse number and is not duplicated in the block list.
- [ ] Run a focused encoding audit on the generated chapter 4 file before merging, because the current `src/data/chapter3Commentary.ts` shows mojibake and the same generation path could repeat that corruption.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run build`.
- [ ] Smoke-check a few representative chapter 4 verses after import:
- [ ] one verse with a table
- [ ] one verse with numbered list items
- [ ] one verse with a trailing reference block removed

## 12. Data Synchronization Pass

Goal: synchronize the live app with the newly copied data source before any implementation work starts.

### 12.1 Source Audit

- [ ] Identify the exact external source set that was copied into this workspace.
- [ ] Compare the copied data against the active runtime contract used by `src/utils/dataFetcher.ts`.
- [ ] List every file that is authoritative for the new data set.
- [ ] Mark which files are canonical inputs, derived outputs, or legacy leftovers.

### 12.2 Schema and Shape Review

- [ ] Diff the new data shape against `src/types.ts`.
- [ ] Check whether chapter, verse, translation, pronunciation, and commentary fields still line up.
- [ ] Confirm whether `word_meanings` still normalizes cleanly into the current array shape.
- [ ] Verify whether chapter metadata in `src/constants.ts` still matches the copied source.

### 12.3 Runtime Data Flow

- [ ] Decide whether `public/data.json` remains the runtime source or needs to be regenerated/replaced.
- [ ] Check whether `dist/data.json` should be treated as a build artifact only.
- [ ] Confirm whether the dev server, production build, and browser smoke flow all resolve the same asset path.
- [ ] Identify any cached assumptions in `src/context/YogaDataContext.tsx` and `src/utils/dataFetcher.ts` that depend on the old data set.

### 12.4 Content Alignment

- [ ] Compare the copied data against the landing page chapter cards.
- [ ] Compare the copied data against verse route canonicalization and range labels.
- [ ] Compare the copied data against the left sidebar reading guide.
- [ ] Compare the copied data against the commentary sidebar content map.
- [ ] Compare the copied data against the learning comic asset mapping.
- [ ] Compare the copied data against `public/lexicon.json` and any lexicon-related UI.

### 12.5 Asset and Pipeline Check

- [ ] Verify whether any MP3 paths need renaming to match the copied data.
- [ ] Verify whether the learning comic image keys still align with chapter/verse numbering.
- [ ] Verify whether `scripts/generate_data.ps1` can still reproduce the runtime data from source files.
- [ ] Verify whether any auxiliary generated files such as `data.js` need regeneration or removal.

### 12.6 Validation Plan

- [ ] Run typecheck after the data contract is finalized.
- [ ] Run unit tests that cover data loading, verse range resolution, navigation, and desktop layout.
- [ ] Run a targeted smoke pass against the actual UI selectors after any data sync work.
- [ ] Record any newly discovered mismatches in `ERROR_LOG.md` if the work is interrupted or blocked.

### 12.7 Decision Gate

- [ ] Freeze the new canonical data source.
- [ ] Freeze the exact files that must be regenerated versus preserved.
- [ ] Freeze the list of UI surfaces that will need to be updated.
- [ ] Only then start implementation in a separate pass.

## 13. Deep Directory and Flow Analysis Pass

Goal: Thoroughly audit the repository structure, components, and data pipelines, compiling findings in `research.md`.

### 13.1 Directory Audit
- [x] List and classify all files under `src/`, `scripts/`, `public/`, and `dist/`.
- [x] Map out component dependencies and identify dead or unused codebase remnants.

### 13.2 Component and UI Analysis
- [x] Trace rendering hierarchies of the core shell (`AppShell`, `MainLayout`, `Header`, `Sidebar`).
- [x] Review `ContextAccordionPicker` and `OutlineTree` state flow.
- [x] Inspect verse-rendering components (`SutraContent`, `WordMeanings`, `TranslationSection`, `AudioPlayer`, `CommentaryContent`).

### 13.3 Data Flow and Parsing Pipelines
- [x] Trace data fetching, normalization, and caching of `/reading-data.json`.
- [x] Analyze script interactions (odt parser, smoke testing script, database synchronizers).
- [x] Review state providers (`UIContext`, `YogaDataContext`, `ThemeContext`).

### 13.4 Documentation Assembly
- [x] Compile comprehensive architectural review, data flow descriptions, and optimization targets into `research.md`.
- [x] Commit and push changes upon completion.

## 14. Technical Debt and Architectural Improvement (Audio Removal & Legacy Cleanup)

Goal: Clean up legacy components and logic, specifically removing the unused audio player stack since there are no audio files, and pruning unused Yoga metadata.

### 14.1 Audio Code Removal
- [ ] Delete `src/hooks/useAudio.ts`.
- [ ] Delete `src/components/verse/AudioPlayer.tsx`.
- [ ] Remove audio state, refs, effect hooks, and `<AudioPlayer>` rendering from `src/pages/VerseView.tsx`.
- [ ] Remove `audio` field processing and serialization from `src/utils/dataFetcher.ts`.
- [ ] Remove `audio` types from `src/types.ts` (`YogaSutra` definition).
- [ ] Clean up any unused audio assets or script files (like `scripts/check_audio_mismatch.cjs`).

### 14.2 Legacy Metadata & Script Pruning
- [ ] Prune unused `YOGA_CHAPTERS_META` and associated constants from `src/constants.ts`.
- [ ] Prune unused legacy script files from `scripts/` directory that are specific to the old Yoga Sutras app.

### 14.3 Visual Theme Polish (Meta-Design)
- [ ] Audit `src/index.css` to clean up any obsolete utility classes.
- [ ] Adjust the primary theme variables to align completely with the "인위삼신행상명등론" design aesthetic.

### 14.4 Verification and Smoke Tests
- [ ] Run `npm run typecheck` to verify no broken imports or type mismatches exist.
- [ ] Run `npm run test -- --run` to ensure all tests pass.
- [ ] Run `npm run build` to confirm production build stability.
- [ ] Run Playwright browser smoke test `npm run qa:browser` to verify core app usability.
