# Repository Research
Updated: 2026-06-01
Workspace: `C:\Users\roadsea\Desktop\3sin-1`

## 1. 한 줄 요약

이 저장소는 React 19 + Vite 기반의 단일 페이지 읽기 앱이다. 화면은 `src/` 안의 React 코드가 전부 책임지고, 데이터는 현재 런타임용 JSON과 별도의 새 “삼신” 텍스트 스냅샷 파이프라인으로 나뉘어 있다.

지금 상태에서 가장 중요한 사실은 두 가지다.

1. 기존 앱 코드는 아직 `/gita.json`을 읽도록 되어 있다.
2. 새로 들어온 `1. 삼신 티벳-한글.txt`, `2. 삼신 영어.txt`, `3. 삼신 목차.txt`는 `scripts/export-reading-snapshot.mjs`와 `src/lib/parseThreeBodiesCore.js`를 통해 `reading-snapshot.json`을 만드는 별도 경로다.

즉, 새 데이터는 이미 들어왔지만, 아직 앱 런타임과 완전히 연결된 상태는 아니다.

## 2. 디렉터리 역할

- `src/`: 활성 React 앱
- `public/`: 런타임 정적 자산, 현재는 `data.json`, `reading-snapshot.json`, `lexicon.json`, `mp3/` 참조가 핵심
- `scripts/`: 데이터 생성, 검증, 브라우저 QA 스크립트
- `data-source/`: 기존 데이터 소스와 아카이브, 토큰 매핑 JSON
- `legacy/legacy_web/`: 옛 정적 구현 보관용
- `docs/`: 과거 계획/리서치 문서
- 루트의 `1. ...txt`, `2. ...txt`, `3. ...txt`: 새로 복사된 삼신 원본 텍스트

현재 새 원본 텍스트는 `data-source/`가 아니라 루트에 놓여 있다. 이 점이 중요하다. `scripts/export-reading-snapshot.mjs`도 그 전제를 그대로 따른다.

## 3. 새 데이터 원본

### `1. 삼신 티벳-한글.txt`

- 번호가 붙은 문단 블록 형식이다.
- 각 항목은 티벳어 원문과 한국어 번역을 한 덩어리로 담고 있다.
- 파서 관점에서는 `1.` 같은 번호와 `[티벳어 원문]`, `[한국어 번역]` 표식을 기준으로 쪼갠다.

### `2. 삼신 영어.txt`

- `1문단: ...`, `2문단: ...` 형태의 영어 문단 모음이다.
- 각 문단은 스냅샷의 paragraph 번호와 직접 매칭된다.

### `3. 삼신 목차.txt`

- 장 제목과 문단 범위를 담은 목차다.
- 예: `제1장 죽음(死有)의 은멸차제 (문단 2~ 문단 69)` 같은 형식이다.
- 파서는 이 범위를 기준으로 chapter 단위를 만든다.

### 데이터 파이프라인의 핵심

- `src/lib/parseThreeBodiesCore.js`
- `scripts/export-reading-snapshot.mjs`

이 둘이 새 원본 텍스트를 읽어서 구조화된 JSON으로 바꾼다.

## 4. 앱 부팅 구조

### 엔트리

`src/main.tsx`는 앱을 다음 순서로 감싼다.

1. `ThemeProvider`
2. `UIProvider`
3. `YogaDataProvider`
4. `App`

즉, 테마, UI 상태, 데이터가 먼저 올라가고 그 위에 라우터가 붙는다.

### 테마

`src/context/ThemeContext.tsx`

- `light` / `dark` 두 상태만 쓴다.
- 기본값은 `light`
- `localStorage.theme`를 읽고 저장한다.
- `document.documentElement.classList`에 `light` 또는 `dark`를 붙인다.

### UI 상태

`src/context/UIContext.tsx`

- `isSidebarOpen`: 모바일 좌측 drawer
- `isDesktopSidebarOpen`: 데스크톱 좌측 rail
- `activeRightPanel`: 모바일 우측 drawer 상태
- `activeDesktopRightPanel`: 데스크톱 우측 패널 상태
- `activeVerseContentMode`: `body` / `commentary`

여기서 중요한 건 verse content mode가 전역 상태라는 점이다. body와 commentary는 페이지 내부 상태가 아니라 앱 전역 선택값으로 취급된다.

### 데이터 컨텍스트

`src/context/YogaDataContext.tsx`

- `fetchYogaData()`를 한 번만 호출한다.
- 성공 시 `allChapters`와 `chapters`를 제공한다.
- 실패 시 `error`를 노출한다.
- `getVerseInRange()`와 `getVerseRangeLabel()`도 컨텍스트로 내려준다.

### 데이터 훅

`src/hooks/useYogaData.ts`

- 단순히 `useYogaDataContext()`를 감싼 얇은 래퍼다.
- 실제 데이터 경로는 컨텍스트가 전담한다.

## 5. 라우팅과 화면 뼈대

### 라우트

`src/App.tsx`

- `/`에서 첫 chapter 첫 verse로 리다이렉트한다.
- `/chapter/:chapterNum/verse/:verseNum`만 실제 본문 라우트다.

### 공통 레이아웃

`MainLayout`은 아래를 합친다.

- `Header`
- `Sidebar`
- `AppShell`
- verse 전용 선택 컨트롤(`ContextPillPicker`)

`AppShell`은 전체 앱 프레임이다.

- 100dvh 기반의 전체 높이
- 가운데 최대 폭 `1406px`
- 배경 레이어와 본문 패널 분리
- 데스크톱에서 verse 화면은 그리드 컬럼 기반으로 배치

### 선택 팝오버

`ContextPillPicker`

- chapter / verse를 바꾸는 작은 다이얼로그다.
- `createPortal(..., document.body)`로 렌더된다.
- 바깥 클릭, Escape 키로 닫힌다.
- route 이동은 `navigate('/chapter/.../verse/...')`로 처리한다.

### 사이드바/패널 프레임

`src/components/ui/SidebarLayout.tsx`

- 모바일에서는 drawer처럼 열리고 닫힌다.
- 데스크톱에서는 sticky rail처럼 붙는다.
- left / right 위치에 따라 border와 surface가 달라진다.

### verse 카드 shell

`src/components/verse/VersePanelCard.tsx`

- verse / commentary 콘텐츠를 감싸는 공통 카드다.
- 상단에 라벨과 네비게이션, 우측 액션을 배치한다.
- 내부 `contentClassName`으로 본문 패딩을 조절한다.

## 6. 홈 화면

`src/pages/ChapterList.tsx`

- 앱의 랜딩 페이지다.
- chapter 카드들을 렌더하고, chapter / verse 선택 드롭다운도 제공한다.
- `CompendiumModal`과 `LexiconModal`을 lazy load한다.
- chapter 카드 클릭 시 `/chapter/{chapter}/verse/1`로 이동한다.

홈 화면은 현재 데이터에 맞는 chapter 수만큼만 렌더한다. 즉, 실제 JSON에 있는 chapter만 보인다.

## 7. 본문 화면 구조

`src/pages/VerseView.tsx`가 가장 복잡하다. 이 파일이 실제 읽기 경험의 중심이다.

### verse canonicalization

- route의 `chapterNum` / `verseNum`을 받아서 실제 owner verse를 찾는다.
- `getVerseInRange()`를 써서 범위형 verse를 canonical verse로 맞춘다.
- route가 중간 번호를 가리키면, 실제 소유 verse로 `replace` 이동한다.

### scroll / reset

- chapter 또는 verse가 바뀌면 `main-scroll-container`를 맨 위로 보낸다.
- 오디오 상태도 `reset()`한다.
- commentary 모드 전환 시에도 스크롤을 위로 맞춘다.

### 본문 모드

- `activeVerseContentMode !== 'commentary'`일 때 표시된다.
- `VersePanelCard` 안에 다음 순서로 쌓인다.
  - `SutraContent`
  - `WordMeanings`
  - `AudioPlayer`
  - `TranslationSection`

### commentary / comic 모드

- `activeVerseContentMode === 'commentary'`일 때 `CommentaryContent`를 보여준다.
- 같은 카드 shell을 쓰지만 내부 내용은 전혀 다르다.
- 기본값은 comic 쪽이다.

### 학습만화 매핑

`import.meta.glob('../../학습만화/*/*.png', { eager: true })`

- chapter별 png 이미지를 전부 미리 읽는다.
- 파일명에서 verse 범위를 추출한다.
- 현재 route의 chapter/verse가 어느 이미지 범위에 속하는지 찾는다.

즉, 학습만화는 단순 이미지 목록이 아니라 chapter/verse 범위 인덱스다.

### commentary 제목 로딩

`CommentaryContent`는 commentary 텍스트에서 `# 제목`을 먼저 읽는다.

- 현재 전달받은 commentary 본문에 제목이 있으면 바로 사용한다.
- 없으면 `/gita.json`을 다시 fetch해서 해당 verse의 `commentary_en`에서 제목을 찾는다.

### commentary 마크다운 파서

`src/components/commentary/CommentaryMarkdown.tsx`

- 제목(`#`)을 heading으로 렌더한다.
- 두 줄 이상 블록은 paragraph로 나눈다.
- `1. 2. 3.` 같은 줄은 ordered list로 처리한다.
- `| a | b |` 형식은 table로 렌더한다.

이 컴포넌트는 본문을 “가벼운 마크다운” 수준으로 해석한다.

## 8. 본문 구성요소

### `SutraContent`

- 산스크리트 원문
- 발음
- 한국어 발음

세 줄을 가운데 정렬로 보여준다.

### `WordMeanings`

- 단어 뜻이 있으면 토글 가능한 접이식 섹션으로 표시한다.
- `meaning` 문자열에서 ` < ` 뒤의 어원 설명은 화면에서 잘라낸다.

### `AudioPlayer`

- 재생/일시정지
- 진행 바
- 현재 시간 / 총 길이

오디오 클릭 seek도 지원한다.

### `TranslationSection`

- 영어 번역
- 한국어 번역군(`ham`, `gil`, `jimong`, `suk`)

`VerseView`에서는 현재 verse 데이터의 필드가 이 섹션에 그대로 연결된다.

### `SutraNavigation`

- prev / next verse 버튼
- chapter 범위를 벗어나면 disable

이건 `useSutraNavigation` 훅과 함께 작동한다.

## 9. 데이터 로더와 현재 runtime contract

`src/utils/dataFetcher.ts`

### 현재 fetch 경로

- 실제 fetch 대상은 `/gita.json`이다.

### raw 스키마

`RawGitaVerse`에는 대략 이런 필드가 들어온다.

- `id`
- `chapter`
- `verse`
- `sanskrit`
- `iast`
- `audio`
- `words`
- `translation_en`
- `commentary_en`
- `korean_pronunciation`
- `translation_ham`
- `translation_gil`
- `translation_jimong`
- `translation_suk`

### normalize 단계

`normalizeVerse()`는 raw 데이터를 앱 타입 `YogaSutra`로 바꾼다.

- `pronunciation` = `iast`
- `pronunciation_kr` = `korean_pronunciation`
- `word_meanings` = `words`를 `{ word, meaning }` 배열로 변환
- `2.english`, `3.korean-1`, `5.bae_jik`, `6.bae_uu`, `8. ox`, `9. ox-en` 같은 호환 필드도 채운다

### 캐시

- `cachedData`와 `pendingRequest`로 메모리 캐시를 둔다.
- 이미 로드된 후에는 같은 데이터를 다시 fetch하지 않는다.

### 현재 문제점

- 코드가 `/gita.json`을 요구하지만 `public/`에는 그 파일이 없다.
- `public/data.json`은 존재하지만 코드의 fetch 경로와 다르다.
- `README.md`와 `scripts/README.md`는 여전히 `data.json` 중심으로 설명한다.

이건 지금 리포지토리에서 가장 큰 런타임 불일치다.

## 10. 삼신 스냅샷 파이프라인

이 저장소에는 새로 들어온 문서형 데이터 파이프라인이 있다.

### 입력

- `1. 삼신 티벳-한글.txt`
- `2. 삼신 영어.txt`
- `3. 삼신 목차.txt`

### 공통 파서

`src/lib/parseThreeBodiesCore.js`

- `parseKoreanEntries(source)`
  - 번호 + `[티벳어 원문]` + `[한국어 번역]` 패턴을 파싱한다.
- `parseEnglishEntries(source)`
  - `1문단:` 같은 영어 문단을 번호별로 맵핑한다.
- `parseToc(source)`
  - 제목과 `(문단 start~end)` 범위를 뽑는다.
- `normalizeReadingToc(chapters)`
  - 첫 entry가 서문/헌사성 항목일 때, 그 시작 번호를 다음 장에 합쳐서 실제 chapter 범위를 맞춘다.
- `createReadingData(koreanEntries, englishEntries, toc)`
  - chapter 배열과 paragraph 배열을 조립한다.
- `flattenParagraphs(chapters)`
  - chapter 배열을 평탄화하는 헬퍼다.

### 생성 스크립트

`scripts/export-reading-snapshot.mjs`

- 프로젝트 루트에서 `1.` / `2.` / `3.`으로 시작하는 `.txt` 파일을 찾는다.
- 세 파일을 동시에 읽는다.
- 파서로 chapter 구조를 만든다.
- 결과를 JSON으로 저장한다.

현재 스크립트의 출력 경로는 `data/reading-snapshot.json`이다.

### 현재 파일 상태

- `public/reading-snapshot.json`은 이미 존재한다.
- 그런데 `data/` 디렉터리는 현재 없다.

즉, 스크립트 출력 경로와 체크인된 산출물이 서로 안 맞는다.

### `public/reading-snapshot.json` 실제 모양

이 파일은 chapter 배열이다. 내가 확인한 구조는 다음과 같다.

- 총 chapter 수: 4
- 총 paragraph 수: 168
- chapter 1: `제1장 죽음`, 69 paragraphs
- chapter 2: `제2장 바르도`, 37 paragraphs
- chapter 3: `제3장 생유`, 50 paragraphs
- chapter 4: `제4장 기본의 삼신`, 12 paragraphs

각 chapter 객체는 아래 필드를 가진다.

- `id`
- `chapterName`
- `title`
- `paragraphs`

각 paragraph 객체는 아래 필드를 가진다.

- `id`
- `title`
- `paragraphNumber`
- `chapterTitle`
- `text.tibetan`
- `text.pronunciation`
- `text.english`
- `text.korean`

중요한 점은 `pronunciation`이 비어 있다는 것이다. 즉, 이 스냅샷은 네 가지 텍스트 축을 모두 담는 대신 발음 필드는 아직 비워둔 상태다.

### BOM 이슈

`public/reading-snapshot.json`은 그대로 `JSON.parse()` 하면 BOM 때문에 깨진다. 즉, 파일 맨 앞에 BOM이 들어가 있다.

이건 스냅샷 소비자 쪽에서 반드시 주의해야 한다.

## 11. 기존 runtime 데이터

`public/data.json`

- 배열형 JSON이다.
- 총 195개 항목이 들어 있다.
- chapter 분포는 `1: 51`, `2: 55`, `3: 55`, `4: 34`였다.

이 데이터는 산스크리트, 발음, 영어, 한국어, 오디오, 단어 뜻, commentary를 모두 가진 verse 레코드 형태다.

활성 앱은 아직 이 계열의 Gita형 verse 데이터를 전제로 움직인다.

## 12. chapter metadata와 실제 데이터의 관계

`src/constants.ts`

- chapter metadata는 1~18장까지 정의되어 있다.
- 그런데 현재 로드되는 JSON은 chapter 1~4까지만 존재한다.

즉, metadata 테이블은 더 큰 책을 전제로 남아 있고, 실제 데이터는 그보다 작은 범위다.

이건 단순한 “unused data” 수준이 아니라, 데이터 소스가 바뀌면 바로 드러날 수 있는 불일치다.

## 13. 스타일과 UI 성격

`src/index.css`

- 배경은 종이/골드 계열이다.
- dark mode도 같이 지원한다.
- 폰트는 `SUIT` + `Cormorant Garamond` 계열을 쓴다.
- custom scrollbar, reveal animation, glass panel 스타일이 있다.

전체적인 인상은 “종이책 + 고급 카드형 읽기 도구” 쪽이다.

## 14. 설정과 툴링

### 패키지

`package.json`

- 개발: `vite`
- 타입체크: `tsc --noEmit`
- 테스트: `vitest`
- 빌드: `tsc -b && vite build`
- 브라우저 QA: `node scripts/browser_smoke.mjs`

### Vite

`vite.config.ts` / `vite.config.js`

- React 플러그인 사용
- Tailwind v4 플러그인 사용
- `@` alias는 `src/`를 가리킨다

### 브라우저 QA

`scripts/browser_smoke.mjs`

- 이 저장소에는 브라우저 기반 smoke test도 있다.
- 다만 이번 리서치 범위에서는 실행하지 않았다.

## 15. 레거시와 문서

- `legacy/legacy_web/`는 옛 HTML/JS 구현이다.
- `docs/plan.md`는 과거 remediation pass의 체크리스트다.
- `docs/리서치.md`는 별도 역사 문서다.

이 문서들은 참고자료이지, 현재 런타임의 진실은 아니다.

## 16. 현재 핵심 불일치

이 프로젝트에서 당장 눈에 띄는 불일치는 아래다.

1. 코드 fetch 경로는 `/gita.json`인데, `public/`에 그 파일이 없다.
2. 문서와 스크립트는 `public/data.json` 중심인데, 런타임 코드는 `gita.json`을 본다.
3. 새 삼신 스냅샷 생성 스크립트는 `data/reading-snapshot.json`에 쓰도록 되어 있는데, 실제 체크인 산출물은 `public/reading-snapshot.json`이다.
4. `public/reading-snapshot.json`은 BOM이 있어 일반 JSON 소비자에게 바로 먹히지 않는다.
5. `constants.ts`의 chapter metadata는 18장 구조인데, 현재 JSON은 4장 구조다.

이 다섯 개가 이번 저장소를 이해할 때 제일 먼저 잡아야 할 지점이다.

## 17. 결론

현재 코드는 “기존 읽기 앱”과 “새 삼신 텍스트 스냅샷 파이프라인”이 같은 저장소 안에 공존하는 상태다.

- UI/라우팅/오디오/사이드바는 이미 꽤 정교하다.
- 새 텍스트 파이프라인은 독립적으로 잘 정의돼 있다.
- 하지만 런타임 데이터 경로와 새 스냅샷 경로는 아직 하나로 합쳐지지 않았다.

그래서 이 저장소를 다음 단계로 가져가려면, 먼저 **어떤 JSON이 런타임의 단일 진실 소스인지**부터 결정해야 한다. 그 다음에야 UI, 문서, 생성 스크립트, 검증 스크립트를 한 방향으로 정렬할 수 있다.
