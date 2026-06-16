# 인위삼신행상명등론 프로젝트 저장소 분석 보고서

본 보고서는 요가수트라(Yoga Sutras) 애플리케이션 뼈대를 기반으로 이식된 "인위삼신행상명등론(因位三身行相明燈論)" 독서 및 학습 애플리케이션 저장소의 전체 아키텍처, 데이터 파이프라인, UI 컴포넌트, 스크립트 도구 및 상태 관리 구조를 정밀 분석하여 기술함

---

## 1. 개요 및 저장소 정체성
본 프로젝트는 기존 요가수트라 앱의 고급스러운 UI 레이아웃(Parchment 질감, Gold 테두리, 다크 모드)과 컴포넌트 아키텍처를 재사용하되, 데이터 소스를 **인위삼신행상명등론**의 텍스트와 학습만화, 해설 데이터로 완전히 대체한 React 19 + Vite 기반의 싱글 페이지 애플리케이션(SPA)임

---

## 2. 디렉토리 구조 및 실제 파일 인벤토리

### 2.1 루트 디렉토리 소스 파일
*   **텍스트 소스**: `1. 삼신 티벳-한글.txt`, `2. 삼신 영어.txt`, `3. 삼신 목차.txt` (티벳어 원문, 다국어 번역 및 목차 범위 정보 제공)
*   **주석 소스**: `1.odt`, `2.odt`, `3.odt`, `4.odt` (장별 상세 해설 및 구조화된 테이블 데이터를 담은 OpenDocument 텍스트 파일)
*   **설정 파일**: `vite.config.ts` (React 및 Tailwind 설정), `tsconfig.json` (타입스크립트 컴파일 사양), `vitest.config.ts` (테스트 러너 사양)

### 2.2 `src/` 디렉토리 아키텍처
*   `src/App.tsx`: 애플리케이션 진입점 및 라우팅 설정, `ContextAccordionPicker` 및 전체 `MainLayout` 정의
*   `src/index.css`: Tailwind 4 기반 테마 및 변수(폰트, 컬러 팰릿, 모션 곡선 등) 정의 및 글로벌 스타일 시트
*   `src/types.ts`: `YogaSutra`, `YogaChapter`, `CommentaryBlock` 등 핵심 데이터 모델의 TypeScript 인터페이스 정의
*   `src/context/`:
    *   `YogaDataContext.tsx`: 원격에서 가져온 구절 데이터를 주입하고 검색 유틸을 제공하는 전역 컨텍스트 프로바이더
    *   `UIContext.tsx`: 사이드바 토글 및 심화/해설 뷰 모드 상태 관리 (최초 진입 시 무조건 학습만화가 보이도록 `'commentary'` 초기값으로 고정됨)
    *   `ThemeContext.tsx`: 라이트/다크 테마 모드 제어 및 로컬 스토리지 동기화
*   `src/hooks/`:
    *   `useYogaData.ts`: `YogaDataContext` 편의용 훅
    *   `useSutraNavigation.ts`: 이전/다음 구절 이동을 계산하는 유틸리티 훅
*   `src/components/`:
    *   `Header.tsx` / `Sidebar.tsx`: 앱 레이아웃 상하단/좌측 영역 구성원
    *   `verse/`: 본문 카드 내 `SutraContent` (티벳어 텍스트), `WordMeanings` (단어 사전), `TranslationSection` (다양한 한국어/영어 번역) 렌더링 담당
    *   `commentary/`: `CommentaryMarkdown.tsx`를 통해 해설 텍스트 내 Markdown 요소(제목, 목록, 테이블 등)를 파싱하여 출력
*   `src/pages/`:
    *   `VerseView.tsx`: 개별 구절의 텍스트, 번역 및 해설/학습만화 패널을 유기적으로 엮어주는 메인 뷰 페이지
    *   `ChapterList.tsx`: 전체 챕터 목록 및 모달 브라우징을 제공하는 페이지 (현재 라우터 미연결 상태)

### 2.3 `scripts/` 디렉토리 빌드 및 검증 도구
*   `export-reading-snapshot.mjs`: 루트의 삼신 텍스트 파일(1, 2, 3번)들을 파싱하여 `public/reading-snapshot.json`으로 추출하는 파이프라인
*   `export-commentary-from-odt.py`: Python 라이브러리를 사용해 `1.odt`~`4.odt` XML에서 마크다운 형태의 주석 구조를 추출, `src/data/chapterXCommentary.ts` 모듈 파일들을 생성
*   `browser_smoke.mjs`: Playwright 기반 E2E 테스트 스크립트

---

## 3. 데이터 흐름 및 빌드 파이프라인

### 3.1 빌드 타임 데이터 정규화 및 파이프라인
프로젝트의 데이터는 아래와 같은 빌드타임 도구 체인을 거쳐 가공됨

```mermaid
graph TD
    TXT["1, 2, 3. 삼신 텍스트 파일들"] -->|export-reading-snapshot.mjs| JSON["public/reading-snapshot.json"]
    ODT["1, 2, 3, 4.odt 파일들"] -->|export-commentary-from-odt.py| TS_COMM["src/data/chapterXCommentary.ts"]
```

1.  **본문 텍스트 생성**: `scripts/export-reading-snapshot.mjs`가 `src/lib/parseThreeBodiesCore.js`를 모듈로 불러와 귀의의 찬시(문단 1)를 제1장에 병합하고 전체 문단을 4개 장 구조로 재배치한 뒤 `public/reading-snapshot.json`으로 빌드함
2.  **해설 텍스트 생성**: `scripts/export-commentary-from-odt.py`가 ODT 압축 패키지 내 `content.xml`을 파싱하여 본문 문장, 목록(`list`), 테이블(`table`) 요소를 정밀 추출해 TypeScript 모듈로 직접 소스 빌드함

### 3.2 런타임 데이터 흐름 및 매핑
애플리케이션 구동 및 구절 로딩은 아래와 같이 유기적으로 진행됨

```mermaid
sequenceDiagram
    participant Browser as 브라우저 Client
    participant Fetcher as dataFetcher.ts
    participant Snap as /reading-snapshot.json
    participant Comm as chapterXCommentary.ts (모듈)
 
    Browser->>Fetcher: fetchYogaData() 호출
    Fetcher->>Snap: fetch('/reading-snapshot.json')
    Snap-->>Fetcher: 본문 데이터 반환
    Fetcher->>Comm: 장별 주석 매핑 (serializeCommentaryBlocks)
    Fetcher-->>Browser: 최종 정규화된 Record<number, YogaChapter> 전달
```

1.  **데이터 초기 로딩**: `YogaDataProvider` 마운트 시 `fetchYogaData()`가 실행되어 `/reading-snapshot.json`을 단 한 번만 fetch하여 로컬 캐시에 저장함 (BOM이 존재할 가능성에 대비해 `stripBom` 전처리 수행)
2.  **주석 결합**: 각 문단을 파싱할 때 `dataFetcher.ts` 내 `getCommentaryBlocks`가 해당 문단 ID 또는 인덱스를 키로 삼아 `chapterXCommentary` 모듈에 내장된 원시 데이터를 찾음. 이후 `serializeCommentaryBlocks`를 호출하여 원시 목록/테이블/문단 배열을 마크다운 문자열(`commentary_en`)로 직렬화하여 본문 데이터와 병합함
3.  **UI 바인딩**: 최종 구성된 `YogaChapter` 및 `YogaSutra` 컬렉션은 `YogaDataContext`를 통해 하위 컴포넌트(본문 카드, 해설 탭)로 분배됨

---

## 4. UI 아키텍처 및 라우팅 분석

### 4.1 라우팅 사양
`src/App.tsx`에서 `BrowserRouter`를 통해 클라이언트 사이드 라우팅을 수행함
*   **`/`**: 진입 시 `DefaultVerseRedirect` 컴포넌트가 활성화되어 `chapters[0]`의 첫 번째 구절 정보를 읽어 `/chapter/1/verse/1`로 자동 리다이렉트(replace) 처리함
*   **`/chapter/:chapterNum/verse/:verseNum`**: 지정된 장/절 파라미터를 읽어 `VerseView` 페이지를 동적 렌더링함

### 4.2 메인 레이아웃 및 쉘 구조
`MainLayout` 컴포넌트가 전체의 토대가 되며, 화면 크기와 뷰 모드에 따라 격자구조를 다이내믹하게 변경함
*   **AppShell**: 사이드바 개폐 및 테마 상태를 통합 관리하는 최상단 프레임워크임
*   **Header**: 제목(`인위삼신행상명등론`) 및 구절 선택 아코디언 컴포넌트(`ContextAccordionPicker`)가 마운트됨
*   **Sidebar**: 현재 절의 요약 번역 텍스트와 기하학적 메타 데이터 휠(Axis) 애니메이션을 표시함

### 4.3 장/절 선택 컴포넌트 (`ContextAccordionPicker` & `OutlineTree`)
헤더에서 아코디언 형태로 펼쳐지는 메뉴로, 계층적인 책의 장/절을 이동할 수 있음
*   **아웃라인 소스**: `public/reading-data.json`에서 삼신 4개 장 계층 트리 구조를 파싱하여 활용함
*   **그룹 탭 숨김 로직**: 본 프로젝트는 책이 단 1권(`인위삼신행상명등론`)이므로 아웃라인 내 그룹 개수가 1개 이하일 경우 불필요한 대분류 탭 버튼이 표시되지 않도록 렌더링을 차단함
*   **중복 제거 필터**: 트리 노드 및 절 선택 영역 하단 카드에서 반복 표시되던 중복 칩과 중복 장 제목 라벨 등을 걷어내어 직관성을 확보함

### 4.4 구절 본문 및 해설 뷰 (`VerseView`)
*   **VERSE 뷰 (본문)**: 티벳어 원문(`sanskrit`), 단어 사전식 나열(`WordMeanings`) 및 다양한 번역본(Ham/Gil/Jimong/Suk 등)의 번역 비교 패널을 카드 레이아웃으로 출력함
*   **COMMENTARY 뷰 (해설/만화)**: `UIContext`에서 모드가 `commentary`로 변경되면 우측에 마운트되며, 학습 만화 이미지(`learningComicImages` glob 매핑) 또는 ODT에서 빌드된 마크다운 주석 텍스트를 토글하여 감상할 수 있음

---

## 5. 전역 상태 관리 및 컨텍스트

1.  **`ThemeContext`**: 다크 모드 활성화 여부를 HTML 클래스(`dark`) 조작을 통해 전체 컴포넌트에 전파하며, 테마 변경 이력을 로컬 스토리지에 영구 저장함
2.  **`UIContext`**: 데스크톱/모바일 사이드바 활성화 제어와 본문(`body`) 및 해설(`commentary`) 토글 상태를 공유함 (첫 진입 시 무조건 학습만화가 보이도록 `'commentary'` 초기값을 고정하여 사용자 경험의 일관성을 확보함)
3.  **`YogaDataContext`**: 데이터 fetch 과정의 오류 핸들링 및 전역 로딩 스피너 제어, 임의 구절 이동 범위 계산 등을 도맡아 수행함

---

## 6. 발견된 문제점 및 아키텍처 개선 제안

1.  **미사용 리소스 및 데드 코드 누적 (`ChapterList.tsx`)**
    *   `src/pages/ChapterList.tsx` 페이지가 구현되어 있으나 `src/App.tsx` 라우터에 미등록되어 접근 불가능함. 이에 따라 하위 모달 컴포넌트인 `CompendiumModal.tsx`와 `LexiconModal.tsx`도 사용 불가능한 상태로 방치되어 있음. 챕터 목록 페이지 진입 경로를 헤더 등에 신설하거나 라우팅을 매핑하여 활용도를 제고할 필요가 있음
2.  **레거시 문서 정보의 왜곡 (존재하지 않는 파일 언급)**
    *   기존 보고서 파일에 `useAudio.ts` 훅과 `AudioPlayer` 컴포넌트가 기술되어 있으나 실제 프로젝트 구조에서는 오디오 재생 기능이 제거되어 해당 파일들이 존재하지 않음. 이로 인해 문서와 실제 구현 상태 간의 인지적 불일치가 발생하고 있음
3.  **변수명과 실제 데이터 명세의 불일치 (`commentary_en`)**
    *   `types.ts` 및 `dataFetcher.ts` 등에서 해설 데이터를 저장하는 핵심 필드명이 `commentary_en`으로 설정되어 있으나, 실제 ODT 및 빌드 스크립트(`export-commentary-from-odt.py`)를 통해 가공되어 제공되는 해설의 원본 텍스트는 전부 **한국어 번역**임. 명확한 식별을 위해 `commentary_ko` 등의 필드명으로 변경하는 점진적 리팩토링이 권장됨
4.  **Windows 환경에서의 PowerShell 스크립트 실행 제약**
    *   윈도우 시스템 정책에 따라 `npm.ps1` 실행이 차단되는 현상이 빈번하게 발생하여 로컬 빌드 및 개발 서브타스크 동작에 방해를 유발함. 윈도우 환경에서 실행 정책을 Bypassing하는 가이드(`powershell -ExecutionPolicy Bypass`) 혹은 `npm.cmd` 및 `npm.exe` 직접 지정을 환경 변수 차원에서 정리하는 방침이 권장됨
