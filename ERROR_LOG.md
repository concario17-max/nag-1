# Error Log

- time: 2026-05-14 00:00:00 +09:00
  location: `npm run build`
  summary: PowerShell script execution policy blocked `npm.ps1`.
  details: The first build check failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran with `npm.cmd run build`, which succeeded.
  status: resolved

- time: 2026-04-23 15:53:48 +09:00
  location: `npm run typecheck`
  summary: PowerShell script execution policy blocked `npm.ps1`.
  details: `npm run typecheck` failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`.
  status: resolved

- time: 2026-04-23 15:42:26 +09:00
  location: `npm run typecheck`
  summary: PowerShell script execution policy blocked `npm.ps1`.
  details: `npm run typecheck` failed before running project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`.
  status: resolved

- time: 2026-04-23 15:42:26 +09:00
  location: `npm.cmd run typecheck`
  summary: Verified the same check through the `.cmd` shim after the PowerShell policy block.
  details: Re-ran typecheck with `npm.cmd` and it completed successfully.
  status: resolved

- time: 2026-04-23 15:43:00 +09:00
  location: `npm run build`
  summary: PowerShell script execution policy blocked `npm.ps1`.
  details: The first build attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran with `npm.cmd run build`, which succeeded.
  status: resolved

- time: 2026-04-23 16:01:28 +09:00
  location: `npm run typecheck`
  summary: PowerShell script execution policy blocked `npm.ps1`.
  details: `npm run typecheck` failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`.
  status: open

- time: 2026-04-23 16:01:28 +09:00
  location: `npm.cmd run typecheck`
  summary: Verified the same check through the `.cmd` shim after the PowerShell policy block.
  details: Re-ran typecheck with `npm.cmd` and it completed successfully.
  status: resolved

- time: 2026-04-23 16:01:28 +09:00
  location: `npm run typecheck`
  summary: Resolved the PowerShell policy block by rerunning through the `.cmd` shim.
  details: The initial `npm run typecheck` attempt was blocked by `npm.ps1`; the follow-up `npm.cmd run typecheck` succeeded.
  status: resolved

- time: 2026-04-23 16:01:28 +09:00
  location: `npm.cmd run build`
  summary: Verified the production build through the `.cmd` shim after the PowerShell policy block.
  details: Re-ran the build with `npm.cmd` and it completed successfully.
  status: resolved

- time: 2026-04-23 16:12:00 +09:00
  location: `npm run build`
  summary: PowerShell execution policy blocked `npm.ps1` again during verification.
  details: The first build attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. The build was rerun with `cmd /c npm run build` and completed successfully.
  status: resolved
## 2026-04-23
- time: 2026-04-23T16:56+09:00
- location: `C:\Users\roadsea\Desktop\yoga`
- summary: `npm run build` failed under PowerShell execution policy
- details: `npm.ps1` could not be loaded because script execution is disabled; reran verification with `cmd /c npm run build`, which passed.
- status: resolved
- time: 2026-04-23 16:59:50 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran with `cmd /c npm run typecheck`, which succeeded.
  status: resolved
- time: 2026-04-23 16:59:50 +09:00
  location: `cmd /c npm run qa:browser`
  summary: Browser smoke timed out after the verse mode persistence check left the page in commentary mode.
  details: The smoke test initially failed because the new persistence check kept the verse page in commentary mode before the translation label assertions. Updated the script to use visible verse-mode buttons and restore body mode before the remaining checks, then reran successfully.
  status: resolved
- time: 2026-04-23 17:03:49 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran with `npm.cmd run typecheck`, which succeeded.
  status: resolved
time: 2026-04-24T00:00:00+09:00
location: git commit step
summary: PowerShell command separator error while staging and committing
details: Used '&&' in PowerShell, which is not supported in this environment. No repository files were changed by the failed command. Retrying with separate commands.
status: resolved
time: 2026-04-24T00:00:00+09:00
location: subagent spawn
summary: Subagent thread limit blocked initial Route B delegation
details: Attempted to spawn worker and reviewer agents in parallel, but the workspace hit the maximum thread limit. Closed stale agents and retried successfully.
status: resolved
- time: 2026-04-24 17:27:05 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The initial typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the same check with `npm.cmd run typecheck`.
  status: resolved
- time: 2026-04-24 17:45:00 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first verification attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the check with `npm.cmd run typecheck`, which succeeded.
  status: resolved
- time: 2026-04-24 17:31:16 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the same check with `npm.cmd run typecheck`, which passed.
  status: resolved
- time: 2026-05-14 00:00:00 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran through `npm.cmd run typecheck`, which passed.
  status: resolved
- time: 2026-05-14 15:28:00 +09:00
  location: `npm run build`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first build attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the build with `npm.cmd run build`, which succeeded.
  status: resolved
- time: 2026-05-14 15:31:22 +09:00
  location: `npm run build`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first build attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the build with `cmd /c npm run build`, which succeeded.
  status: resolved
- time: 2026-05-14
  location: git commit step
  summary: PowerShell rejected chained command separator
  details: The combined `git add ... && git commit ...` command failed because this shell does not accept `&&` as a statement separator.
  status: resolved
- time: 2026-05-14 15:33:00 +09:00
  location: `npm run build`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first build attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the build with `npm.cmd run build`, which succeeded.
  status: resolved
- time: 2026-05-14 16:46:38 +09:00
  location: `npm run typecheck`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first typecheck attempt failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran with `cmd /c npm run typecheck`, which passed.
  status: resolved
- time: 2026-05-15 00:00:00 +09:00
  location: `src/components/ui/SidebarLayout.tsx`
  summary: duplicate `desktopBorderClass` declaration from sidebar gray refactor
  details: The shared-surface patch introduced a second `desktopBorderClass` declaration, which breaks both typecheck and build with TS2451. The file needs a small cleanup before verification can pass.
  status: open
- time: 2026-05-15 00:00:00 +09:00
  location: `src/components/ui/SidebarLayout.tsx`
  summary: duplicate `desktopBorderClass` declaration resolved
  details: Removed the extra `desktopBorderClass` declaration and kept the left-sidebar border behavior aligned with the warm-gray surface treatment. `typecheck` and `build` are green again.
  status: resolved
- time: 2026-05-18 15:47:38 +09:00
  location: `npm run typecheck` / `npm run build`
  summary: PowerShell execution policy blocked `npm.ps1` during verification.
  details: The first verification attempts failed before project checks because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran both checks with `npm.cmd`, which passed.
  status: resolved
[2026-05-19 00:00 +09:00] location: npm run build
summary: PowerShell execution policy blocked npm.ps1
details: Build verification could not start because PowerShell refused to load C:\Program Files\nodejs\npm.ps1. Retrying with npm.cmd is required.
status: open

[2026-05-19 00:00 +09:00] location: npm run build
summary: Build verification completed via npm.cmd
details: The same build finished successfully when invoked as `cmd /c npm.cmd run build`.
status: resolved
[2026-05-19 12:45 +09:00] location: npm.cmd run typecheck && npm.cmd run build
summary: PowerShell rejected `&&` in verification command
details: The combined verification command failed before execution because PowerShell treated `&&` as invalid syntax. Re-ran the checks as separate PowerShell statements with `npm.cmd`, and both passed.
status: resolved

- time: 2026-05-20 00:00:00 +09:00
  location: `npm.cmd run typecheck` / `npm.cmd run build`
  summary: Typecheck and build failed due to an unused `currentChapter` binding after refactoring the context picker
  details: The new draft-selection flow in `src/App.tsx` left `currentChapter` unused in `MainLayout`, which caused TS6133 and blocked both verification commands. Removing the unused binding should restore green checks.
  status: open

- time: 2026-05-20 00:00:00 +09:00
  location: `npm.cmd run typecheck` / `npm.cmd run build`
  summary: Verification failed again because `allChapters` became unused after simplifying the context picker flow
  details: After removing `currentChapter`, `MainLayout` still destructured `allChapters` from `useYogaData()` even though the new picker flow only needs `chapters` and `loading`. Removing the unused binding should unblock the build.
  status: open

- time: 2026-05-20 00:00:00 +09:00
  location: `npm.cmd run typecheck` / `npm.cmd run build`
  summary: `currentChapter` unused binding resolved
  details: Removed the unused `currentChapter` binding from `MainLayout` after switching the context picker to draft chapter selection. Typecheck and build passed again.
  status: resolved

- time: 2026-05-20 00:00:00 +09:00
  location: `npm.cmd run typecheck` / `npm.cmd run build`
  summary: `allChapters` unused binding resolved
  details: Removed the unused `allChapters` binding from `MainLayout` after the picker flow no longer needed it. Typecheck and build passed again.
  status: resolved

- time: 2026-05-27 15:43:09 +09:00
  location: `npm run typecheck` / `npm run build`
  summary: PowerShell blocked `npm.ps1` during verification
  details: Initial verification failed because PowerShell could not load `C:\Program Files\nodejs\npm.ps1`. Re-ran the checks with `npm.cmd` instead.
  status: resolved

- time: 2026-05-27 15:58:10 +09:00
  location: `src/components/commentary/CommentaryMarkdown.tsx`, `src/pages/VerseView.tsx`
  summary: Typecheck failed on dynamic heading rendering and nullable chapter access
  details: `CommentaryMarkdown` used a JSX namespace path TS could not resolve, and `VerseView` narrowed `currentChapter` too loosely for strict null checks. Both issues were fixed before rerunning verification.
  status: resolved
