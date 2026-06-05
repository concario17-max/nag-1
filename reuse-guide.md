# Desktop Layout Reuse Guide

## Goal

This guide explains how to reuse today's desktop layout work in another project without dragging over project-specific code.

The reusable behavior is:

- desktop default: `20 / 60 / 20`
- desktop with left panel closed: `0 / 60 / 40`
- desktop with right panel closed: `20 / 80 / 0`
- desktop with both side panels closed: `0 / 100 / 0`
- desktop header pinned to the main panel's inner left/right edges
- mobile drawers kept separate from desktop geometry
- no artificial desktop gap between the main panel and the right panel
- main-panel inner reading padding restored after gap fixes

## Best approach

Do not copy individual CSS tweaks file by file.

The cleanest approach is to move this pattern as three layers:

1. shared desktop frame rules
2. shell and panel layout components
3. UI state contract for desktop/mobile panel behavior

If another project has those three pieces, the rest becomes straightforward page wiring.

## Minimum reusable set

These are the minimum files worth copying as a unit:

- [src/components/ui/desktopVerseLayout.ts](C:/Users/roadsea/Desktop/yoga/src/components/ui/desktopVerseLayout.ts)
- [src/components/ui/AppShell.tsx](C:/Users/roadsea/Desktop/yoga/src/components/ui/AppShell.tsx)
- [src/components/ui/SidebarLayout.tsx](C:/Users/roadsea/Desktop/yoga/src/components/ui/SidebarLayout.tsx)
- [src/context/UIContext.tsx](C:/Users/roadsea/Desktop/yoga/src/context/UIContext.tsx)

These are the integration files that usually need adaptation rather than direct copy:

- [src/components/Header.tsx](C:/Users/roadsea/Desktop/yoga/src/components/Header.tsx)
- [src/App.tsx](C:/Users/roadsea/Desktop/yoga/src/App.tsx)

These are page-level examples of how to let the main column breathe when the frame changes:

- [src/pages/VerseView.tsx](C:/Users/roadsea/Desktop/yoga/src/pages/VerseView.tsx)
- [src/components/verse/SutraContent.tsx](C:/Users/roadsea/Desktop/yoga/src/components/verse/SutraContent.tsx)
- [src/components/verse/TranslationSection.tsx](C:/Users/roadsea/Desktop/yoga/src/components/verse/TranslationSection.tsx)
- [src/components/verse/AudioPlayer.tsx](C:/Users/roadsea/Desktop/yoga/src/components/verse/AudioPlayer.tsx)

## What each piece does

### 1. `desktopVerseLayout.ts`

This file is the single source of truth for desktop column behavior.

It currently defines:

- `20% 60% 20%`
- `0% 60% 40%`
- `20% 80% 0%`
- `0% 100% 0%`

And it exposes one function:

- `getDesktopVerseColumns(isDesktopSidebarOpen, isDesktopRightPanelOpen)`

If you reuse only one idea from this project, reuse this one.

Reason:

- it prevents width logic from being duplicated in `AppShell`, `Header`, and panels
- it makes state-to-layout mapping explicit
- it gives you one place to tune proportions later

### 2. `AppShell.tsx`

This is the outer frame.

Its role is:

- render `header`
- render `sidebar`
- render `main`
- render `rightPanel`
- switch desktop body layout to grid when `desktopGridColumns` is present

Reusable contract:

- pass `desktopGridColumns`
- put main content in the middle column with `lg:col-start-2`
- keep `main-scroll-container` as the scroll target

This is the component that makes the ratio-based layout real.

### 3. `SidebarLayout.tsx`

This is the shared left/right panel wrapper.

Its role is:

- mobile drawer transition
- desktop sticky panel behavior
- border placement
- open/closed separation for mobile and desktop

Important detail:

- mobile open/closed transform and desktop open/closed geometry must stay separate

That split is what fixed the false desktop gap between main content and commentary.

More specifically:

- mobile drawer translation can exist
- desktop open panels must resolve to `translate-x-0`
- desktop hidden panels should collapse with width/opacity rules, not residual mobile translation

### 4. `UIContext.tsx`

This file is the state contract.

It separates:

- `isSidebarOpen`: mobile left drawer
- `activeRightPanel`: mobile right drawer
- `isDesktopSidebarOpen`: desktop left panel
- `activeDesktopRightPanel`: desktop right panel

This separation is important.

Do not compress these into one generic `isOpen` state unless the target app really has identical behavior on mobile and desktop.

### 5. `Header.tsx`

This file is reusable in structure, but not as a direct drop-in.

Keep these ideas:

- mobile header is independent
- desktop header uses the same grid frame as the body
- desktop header content sits inside the main column, not over the full page width
- header groups are arranged as one row inside that middle column
- header stays pinned to the default desktop frame even if the left panel is hidden

Project-specific parts you will likely swap:

- icons
- title branding
- button labels
- theme toggle
- routing links

### 6. `App.tsx`

This is where route state becomes layout state.

The key pattern is:

- determine whether the current route should use the framed desktop layout
- determine whether the right panel should render
- compute `desktopGridColumns` from both left-panel state and right-panel state
- pass everything into `AppShell`

This is the glue file that most projects need to rewrite rather than copy.

Important detail:

- if the right panel is hidden, the main column should expand all the way to the right edge
- that means frame calculation cannot depend on left-sidebar state alone

## What not to copy blindly

Do not blindly copy these as-is into another app:

- project fonts
- color tokens
- `Yoga Sutras` strings
- route shape like `/chapter/:chapterNum/verse/:verseNum`
- commentary-specific labels
- verse-content width tuning from the page components

Those are app-specific.

The reusable part is the frame model, not the content design.

## Recommended extraction strategy

### Option A: internal shared folder

Best when you control multiple similar repos.

Create a folder like:

```text
src/shared/layout/
  desktopFrame.ts
  AppShell.tsx
  SidebarLayout.tsx
  usePanelLayoutState.ts
```

Then adapt each project's `Header` and route composition locally.

This is the best short-term option.

### Option B: small UI package

Best when you know at least two or three projects will share this pattern.

Package candidates:

- `getDesktopFrameColumns`
- `AppShell`
- `SidebarLayout`
- `useResponsivePanelState`

Keep branding and page content outside the package.

This is cleaner long-term, but only worth it if reuse is real.

## The contract you should preserve

If you port this pattern elsewhere, preserve these rules:

1. Desktop frame geometry must come from one shared function.
2. Header and body must consume the same frame rules.
3. Mobile drawer animation must be independent from desktop panel geometry.
4. Rendering a panel and allocating frame space for a panel must be driven by the same state.
5. Main-content inner width limits must be revisited after the frame is applied.

If any one of those breaks, the layout will drift again.

## Common failure cases

### 1. Header and body use different geometry

Symptom:

- title drifts when a panel closes
- right buttons no longer align with the reading column

Cause:

- header uses hard-coded padding while body uses grid ratios

Fix:

- move both to one shared frame definition

### 2. Desktop panel inherits mobile transform

Symptom:

- visible gap between main and right panel
- panel looks shifted even when open

Cause:

- mobile `translate-x-*` classes leak into desktop state

Fix:

- split mobile state classes and desktop state classes

### 3. Main panel width changes but content still looks narrow

Symptom:

- outer layout changes correctly
- content still feels centered and far from the right panel

Cause:

- inner `max-w-*` containers still clamp the reading column

Fix:

- re-audit page-level wrappers after the frame refactor

Important nuance from this project:

- removing the panel gap and reducing the reading column padding were two different changes
- the better final result was:
- keep the panel gap removed
- restore the reading column's inner padding for readability

### 4. Commentary hidden but main column does not expand

Symptom:

- empty right area remains

Cause:

- frame logic only watches left sidebar state

Fix:

- frame calculation must also watch right-panel state

## Porting checklist

- [ ] Add a shared desktop frame module
- [ ] Update the app shell to accept desktop grid columns
- [ ] Keep the main scroll container in the middle column
- [ ] Split mobile panel state from desktop panel state
- [ ] Update the header to use the same frame model
- [ ] Update left and right panel shells to use shared desktop behavior
- [ ] Make panel rendering and panel width rules use the same state
- [ ] Recheck page-level `max-w-*` wrappers after the frame lands
- [ ] Verify all desktop states:
- [ ] left open + right open
- [ ] left closed + right open
- [ ] left open + right closed
- [ ] left closed + right closed
- [ ] Verify right-panel hidden states really expand the main panel:
- [ ] `20 / 80 / 0`
- [ ] `0 / 100 / 0`
- [ ] Verify there is no computed desktop translate offset left on an open right panel
- [ ] Verify reading-column padding is still comfortable after panel-gap fixes

## Final behavior from today's implementation

The current implementation in this repo ended up with these rules:

- left open + commentary open: `20 / 60 / 20`
- left closed + commentary open: `0 / 60 / 40`
- left open + commentary closed: `20 / 80 / 0`
- left closed + commentary closed: `0 / 100 / 0`

And these extra constraints:

- desktop header is pinned to the default frame, so hiding the left panel does not move the menu/title cluster
- desktop right-panel open state must not carry any residual `translate-x-*`
- the main/commentary panel gap is removed at the panel-shell level
- the reading column padding is intentionally restored for readability

## If you want the cleanest next step here

The next clean refactor in this repo would be:

1. rename `desktopVerseLayout.ts` to something project-neutral like `desktopFrame.ts`
2. extract `UIContext` layout state into a reusable hook
3. move `AppShell`, `SidebarLayout`, and the frame helper into a shared folder
4. leave `Header` and page content local to each project

That gives you a reusable core without over-generalizing the app-specific pieces.

## Copy-paste request template

Use this when asking to apply the same pattern in another project:

```text
This project should follow the layout rules in reuse-guide.md.

Please:
1. analyze the code structure first
2. find the files that currently play the role of AppShell, Header, Sidebar, right panel, and UI state
3. map the current layout to the desktop frame rules in reuse-guide.md
4. implement the desktop behavior below:
   - left open + right open: 20 / 60 / 20
   - left closed + right open: 0 / 60 / 40
   - left open + right closed: 20 / 80 / 0
   - left closed + right closed: 0 / 100 / 0
5. keep mobile drawer behavior separate from desktop geometry
6. make header alignment follow the same frame rules
7. remove fake panel gaps caused by leftover desktop translate offsets
8. preserve readable inner content padding even after fixing panel gaps
9. verify the result in the browser before committing

Do not blindly copy styles. Adapt the project's existing structure to this layout contract.
```

## Short version

If you want an even shorter prompt, use this:

```text
Apply reuse-guide.md to this project.
Analyze the structure first, map the current shell/header/sidebar/right-panel files, then implement the same desktop frame and verify it in the browser before commit.
```
