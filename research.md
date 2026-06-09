# 인위삼신행상명등론 프로젝트 저장소 보고서

## 0. 한 줄 요약
이 저장소는 요가수트라 앱 껍데기를 복사해 "인위삼신행상명등론(因位三身行相明燈論)" 독서 앱으로 이식한 React 19 + TypeScript + Vite 앱임
현재 런타임 데이터는 `public/reading-snapshot.json`을 직접 fetch하여 구동하는 싱글 페이지 애플리케이션임

## 1. 아키텍처 및 런타임 데이터 흐름
- 진입점: `src/main.tsx`에서 테마, UI 컨텍스트, 데이터 프로바이더를 래핑해 시작함
- 라우팅: `src/App.tsx`에서 `BrowserRouter`로 라우팅하며, `/` 접근 시 `/chapter/1/verse/1`로 자동 리다이렉트함
- 데이터 페칭: `src/utils/dataFetcher.ts`가 `/reading-snapshot.json`을 로드한 뒤 BOM을 제거하고 파싱하여 메모리에 캐싱함
- 주석 결합: `src/data/chapter1Commentary.ts` 등에서 해당하는 장/절 주석 데이터를 읽어 `YogaSutra` 객체에 직렬화해 주입함

## 2. 데이터 제너레이션 파이프라인
- 입력 소스: 루트의 `1. 삼신 티벳-한글.txt`, `2. 삼신 영어.txt`, `3. 삼신 목차.txt`
- 제너레이터: `scripts/export-reading-snapshot.mjs`가 파서 코어 `src/lib/parseThreeBodiesCore.js`를 사용해 데이터 변환 후 `public/reading-snapshot.json`을 생성함
- 목차 정규화: `normalizeReadingToc`를 통해 귀의의 찬시(문단 1)가 제1장에 자연스럽게 병합되어 총 4개 장으로 리파이닝됨

## 3. 핵심 UI 컴포넌트 분석
- `AppShell`: 전체 레이아웃 뼈대로 사이드바와 헤더, 콘텐츠 공간을 관리함
- `VerseView`: 본문 카드(산스크리트어, 한글/영어 번역, 단어 의미, 오디오 플레이어)와 만화/해설 패널(`CommentaryContent`)을 토글하여 렌더링함
- `Sidebar`: 좌측 레일 또는 모바일 드로어로, 현재 구절의 정보를 시각적인 그래픽 메타 정보(Axis)와 함께 한국어 번역을 전달함
- `ContextPillPicker`: 헤더 내부의 드롭다운 포털로 장/절을 이동할 수 있는 도구임

## 4. 미사용 상태 및 기술 부채
- `src/constants.ts`의 `YOGA_CHAPTERS_META`는 요가수트라 18장 정보를 들고 있는 미사용 stale 코드임
- `AppShell`의 `rightPanel` 등은 과거 요가수트라 앱에서 Commentary를 사이드바 형태로 노출하려던 레이아웃 껍데기로 현재 삼신 프로젝트의 인라인 토글 방식에서는 사용되지 않음

## 5. 메타 디자인(Meta-Design) 퀄리티 개선 방향
- HSL 컬러 스키마를 정밀 튜닝하여 parchment 질감과 골드 테두리의 미학을 더욱 미려하게 극대화함
- 폰트 시스템을 Outfit과 Cormorant Garamond로 정돈해 고급 타이포그래피 완성
- Framer Motion 스태거링 효과를 리팩토링해 초고급 모션 피드백 완성
