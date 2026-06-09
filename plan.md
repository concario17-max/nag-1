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

## 13. 상세 디렉토리 및 흐름 분석 Pass

목표: 저장소 구조, 컴포넌트, 데이터 파이프라인을 철저히 검토하고 분석 결과를 `research.md`에 작성한다.

### 13.1 디렉토리 검사
- [x] `src/`, `scripts/`, `public/`, `dist/` 내부의 모든 파일을 나열하고 분류한다.
- [x] 컴포넌트 간의 의존성을 맵핑하고 사용되지 않는 코드를 식별한다.

### 13.2 컴포넌트 및 UI 분석
- [x] 코어 쉘(`AppShell`, `MainLayout`, `Header`, `Sidebar`)의 렌더링 계층 구조를 추적한다.
- [x] `ContextAccordionPicker` 및 `OutlineTree` 상태 흐름을 검토한다.
- [x] 구절 렌더링 컴포넌트(`SutraContent`, `WordMeanings`, `TranslationSection`, `AudioPlayer`, `CommentaryContent`)를 조사한다.

### 13.3 데이터 흐름 및 파싱 파이프라인
- [x] `/reading-data.json` 데이터 페칭, 정규화, 캐싱 구조를 파악한다.
- [x] 스크립트 도구들(odt 파서, 스모크 테스트 스크립트, 데이터 동기화 도구)의 동작 방식을 분석한다.
- [x] 전역 상태 프로바이더(`UIContext`, `YogaDataContext`, `ThemeContext`)를 검토한다.

### 13.4 보고서 작성
- [x] 종합 아키텍처 검토, 데이터 흐름 설명, 개선 목표를 `research.md`에 취합하여 작성한다.
- [x] 작업 완료 후 커밋 및 푸시를 실행한다.

## 14. 기술 부채 및 아키텍처 개선 (오디오 파일 제거 및 레거시 정리)

목표: 프로젝트 내 오디오 파일이 없으므로 사용되지 않는 오디오 플레이어 관련 컴포넌트와 비즈니스 로직을 완전히 제거하고, 요가수트라 앱의 레거시 잔재 코드를 정돈한다.

### 14.1 오디오 관련 코드 제거
- [ ] `src/hooks/useAudio.ts` 파일 삭제
- [ ] `src/components/verse/AudioPlayer.tsx` 파일 삭제
- [ ] `src/pages/VerseView.tsx` 내부 오디오 상태, refs, 훅 호출 및 `<AudioPlayer>` 마크업/JSX 제거
- [ ] `src/utils/dataFetcher.ts` 내 `audio` 필드 처리 및 직렬화 코드 제거
- [ ] `src/types.ts` 내 `YogaSutra` 정의에서 `audio` 타입 제거
- [ ] 사용되지 않는 오디오 매핑 검증 스크립트(`scripts/check_audio_mismatch.cjs`) 등 제거

### 14.2 레거시 메타데이터 및 스크립트 정리
- [ ] `src/constants.ts` 내부의 미사용 `YOGA_CHAPTERS_META` 및 관련 레거시 상수 제거
- [ ] `scripts/` 폴더 내 요가수트라 전용 레거시 스크립트 파일들 정리

### 14.3 비주얼 테마 폴리싱 (메타 디자인)
- [ ] `src/index.css`를 검토하여 더 이상 사용되지 않는 레거시 유틸리티 클래스 정돈
- [ ] 테마 변수 설정을 "인위삼신행상명등론" 앱의 고유 디자인 아이덴티티에 완벽하게 부합하도록 조정

### 14.4 검증 및 스모크 테스트
- [ ] `npm run typecheck`를 실행하여 잘못된 임포트나 타입 불일치가 없는지 검증
- [ ] `npm run test -- --run`을 실행하여 모든 유닛 테스트가 정상 통과하는지 확인
- [ ] `npm run build`를 통해 빌드 안정성 확보
- [ ] Playwright 브라우저 스모크 테스트(`npm run qa:browser`)를 구동하여 최종 앱 사용성에 문제가 없는지 확인
