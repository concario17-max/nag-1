# 프로젝트 개선 및 교정 계획

업데이트: 2026-03-20
상태: 완료
단일 진실 공급원(Source of Truth): `research.md`

이 파일은 리서치 검토 이후 요청된 프로젝트 전체 개선 패스의 작업 진행 상황을 추적함.

## 1. 가이드라인 및 순서

- [x] 작업 범위를 `research.md`에서 발견된 코드, 문서, QA 및 콘텐츠 불일치로 제한
- [x] 이번 패스 중 무관한 신규 기능 개발 지양
- [x] 더 강력한 수정이 필요하지 않은 한 런타임 동작 안정성 유지
- [x] 아래 순서대로 작업을 실행:
  - [x] 콘텐츠 및 인코딩 정리
  - [x] 만료된 문서 복구
  - [x] 만료된 QA 및 브라우저 스모크 테스트 복구
  - [x] 해설 및 레이아웃 일관성 정리
  - [x] 최종 검증 스윕

## 2. 인코딩 및 콘텐츠 정리

- [x] 사용자에게 노출되는 문자열 중 인코딩이 깨진 부분이 활성 `src/` 트리에 남아있는지 감사
- [x] `src/constants.ts` 내의 장(chapter) 메타데이터 카피 수정
- [x] `src/components/Sidebar.tsx` 내의 사이드바 제목 수정
- [x] `src/components/ui/SidebarMenu.tsx` 내의 사이드바 빈 상태 카피 수정
- [x] `src/components/verse/TranslationSection.tsx` 내의 번역 섹션 헤더 수정
- [x] `src/components/CompendiumModal.tsx` 내의 깨진 compendium 카피 수정
- [x] `src/components/CommentarySidebar.tsx` 내의 해설 학습 프롬프트 카피 수정
- [x] 활성 테스트 픽스처 내의 깨진 라벨 정규화

## 3. 메타데이터 무결성

- [x] `YOGA_CHAPTERS_META` 재감사
- [x] 한국어 장 이름이 의도한 자구와 일치하는지 확인
- [x] 영어 장 이름이 런타임 카드 및 사이드바 라벨과 계속 일치하는지 확인
- [x] 설명이 가독성 있고 인코딩 아티팩트가 없는지 확인
- [x] 수트라(구절) 수가 `public/data.json`과 일치하는지 재확인

## 4. 데이터 로딩 및 폴백 품질

- [x] `src/utils/dataFetcher.ts` 페치 실패 동작 재검토
- [x] 자동 `{}` 폴백을 예외(load error) 발생으로 교체
- [x] 프로바이더 로드 실패를 `YogaDataContext`를 통해 노출
- [x] `src/pages/ChapterList.tsx` 랜딩 페이지에 로드 에러 UI 표시
- [x] `src/pages/VerseView.tsx` 구절 페이지에 로드 에러 UI 표시
- [x] `src/components/LexiconModal.tsx`에 명시적인 사전(lexicon) 로드 실패 UI 추가
- [x] 더 강력해진 실패 계약을 반영하도록 `src/utils/dataFetcher.test.ts` 업데이트

## 5. 해설 패널 현실성 검증

- [x] 비어있는 해설 껍데기를 불충분한 것으로 보고 반려
- [x] 해설을 위한 최소한의 실현 가능한 학습 가이드 계약 정의
- [x] `src/components/CommentarySidebar.tsx`에 장 프레임, 핵심 구절, 학습 프롬프트 및 사용법 가이드 구현
- [x] 모바일 및 데스크톱 해설 서랍 동작은 유지하면서 콘텐츠 품질 개선
- [x] 실제 해설 패널에 맞춰 문서 및 QA 기대치 조율

## 6. 문서 정확성

- [x] 라이브 앱에 맞춰 `README.md` 재작성
- [x] `README.md`에서 만료된 reflections 참조 제거
- [x] 해설 전용 우측 패널 및 현재 데스크톱 프레임 규칙 문서화
- [x] `README.md` 내의 빌드 및 QA 명령어가 `package.json`과 일치하는지 확인
- [x] `docs/` 내에서 상충되는 만료된 가이드라인 감사
- [x] `docs/리서치.md`를 역사적 기록으로 표시
- [x] `docs/plan.md`를 역사적 기록으로 표시

## 7. 브라우저 스모크 QA 복구

- [x] 라이브 UI에 맞춰 `scripts/browser_smoke.mjs` 감사
- [x] 만료된 reflections 및 `textarea` 가정 제거
- [x] 아래 항목을 중심으로 스모크 흐름 재작성:
  - [x] 랜딩 페이지 네비게이션
  - [x] 구절 라우트 로딩
  - [x] 데스크톱 해설 사용 가능 여부 및 영속성
  - [x] 모바일 사이드바 오픈 및 라우트 선택
  - [x] 모바일 해설 서랍 오픈 및 클로즈
- [x] 새로고침 기반 영속성 체크가 유효하도록 스모크 스크립트의 스토리지 리셋 버그 수정

## 8. Layout 및 공유 프레임 후속 조치

- [x] 데스크톱 프레임이 아래 구조를 계속 사용하는지 재확인:
  - [x] `20 / 60 / 20`
  - [x] `0 / 60 / 40`
  - [x] `20 / 80 / 0`
  - [x] `0 / 100 / 0`
- [x] 해설이 숨겨져 있을 때 메인 패널 확장 기능이 정상 작동하는지 확인
- [x] 해설 간격 수정사항이 온전히 유지되는지 확인
- [x] 간격 수정 이후에도 본문 열 패딩의 가독성 유지
- [x] `desktopVerseLayout.ts`에 대한 전용 테스트 추가

## 9. 검증

- [x] `npm run typecheck` 실행
- [x] `npm run test -- --run` 실행
- [x] `npm run build` 실행
- [x] `npm run qa:browser` 실행

## 10. 마감

- [x] 수정된 저장소 상태를 반영하여 `research.md` 업데이트
- [x] 완료 상태가 명확하고 최신이 되도록 `plan.md` 재작성
- [x] `docs/` 내 역사적 메모는 보존하되 활성 가이드라인에서는 제외
- [x] 최종 범위 및 검증 상태를 저장소 문서에 기록

## 11. 4장 해설 데이터 임포트

- [x] 신규 데이터 파일을 생성하기 전에 `요가수트라 해설_4. 깨달음.odt` 구조를 검사하고 구절 경계를 확인한다.
- [x] 공통 `CommentaryBlock` / `CommentaryTable` 구조를 사용하여 4장 해설 데이터를 `src/data/chapter4Commentary.ts` 신규 파일로 추출한다.
- [x] 실제 테이블 데이터는 문단으로 쪼개지 않고 `table` 블록 구조를 그대로 보존한다.
- [x] 번호 매겨진 목록 항목은 점(dot) 글머리기호로 축소되지 않도록 그대로 번역하여 사이드바에서 `1. 2. 3.` 마커가 정상 렌더링되게 한다.
- [x] ODT 임포트 결과물에서 아래와 같은 무관한 아티팩트를 제거한다:
  - [x] `Plaintext` 마커
  - [x] `Online Mode` / `Offline Mode` 관련 라인
  - [x] `참조 출처` / `Verified Sources`
  - [x] 검색 전략 및 웹 검색 메타 라벨
  - [x] 기타 실제 해설 텍스트가 아닌 하단 참조/푸터 블록
- [x] 4장 구절 키가 소스 문서와 일치하는지 확인하고, 이전 2장 4절 누락 사태와 같이 누락된 구절 번호가 없는지 검증한다.
- [x] 1/2/3장의 기존 동작은 변경하지 않고 `src/components/CommentarySidebar.tsx` 내 공통 룩업 테이블에 4장 지원을 추가한다.
- [x] 인라인 제목 규칙을 유지하여 첫 번째 타이틀이 `4.x` 구절 번호 옆에만 표시되고 블록 리스트에서 중복 표시되지 않도록 한다.
- [x] 머지하기 전에 생성된 4장 파일의 인코딩 감사를 면밀히 수행한다. (현재 3장 해설 파일의 한글 깨짐 현상이 반복되는 것을 차단)
- [x] `npm.cmd run typecheck` 실행
- [x] `npm.cmd run build` 실행
- [x] 임포트 완료 후 대표적인 4장 구절들을 스모크 체크한다:
  - [x] 테이블이 포함된 구절 1개
  - [x] 번호 매겨진 목록 항목이 포함된 구절 1개
  - [x] 하단 참조 블록이 깔끔하게 제거된 구절 1개

## 12. 데이터 동기화 패스

목표: 구현 작업을 시작하기 전에 신규 데이터 소스와 라이브 앱을 동기화한다.

### 12.1 소스 감사
- [x] 이 작업 공간에 복사된 정확한 외부 소스 세트를 식별한다.
- [x] 복사된 데이터를 `src/utils/dataFetcher.ts`에서 사용하는 활성 런타임 계약과 비교한다.
- [x] 신규 데이터 세트에 대해 권한을 가진 모든 파일 리스트를 작성한다.
- [x] 어떤 파일이 표준 입력인지, 파생 출력인지, 혹은 레거시 잔재인지 표시한다.

### 12.2 스키마 및 데이터 셰이프 검토
- [x] 신규 데이터 셰이프를 `src/types.ts`와 비교 분석한다.
- [x] 장, 절, 번역, 발음 및 해설 필드가 일치하는지 확인한다.
- [x] `word_meanings`가 여전히 현재 배열 형태로 깔끔하게 정규화되는지 확인한다.
- [x] `src/constants.ts` 내부의 장 메타데이터가 복사된 소스와 일치하는지 확인한다.

### 12.3 런타임 데이터 흐름
- [x] `public/data.json`을 런타임 소스로 유지할지, 아니면 재생성/대체할지 결정한다.
- [x] `dist/data.json`을 빌드 아티팩트로만 처리할지 결정한다.
- [x] 개발 서버, 프로덕션 빌드 및 브라우저 스모크 흐름이 모두 동일한 에셋 경로를 바라보고 있는지 확인한다.
- [x] `src/context/YogaDataContext.tsx` 및 `src/utils/dataFetcher.ts`에서 이전 데이터 세트에 의존하는 캐시 가정을 식별한다.

### 12.4 콘텐츠 일관성 정렬
- [x] 복사된 데이터를 랜딩 페이지의 장 카드 정보와 비교한다.
- [x] 복사된 데이터를 구절 라우트 표준화 및 범위 라벨과 비교한다.
- [x] 복사된 데이터를 좌측 사이드바 읽기 가이드와 비교한다.
- [x] 복사된 데이터를 해설 사이드바 콘텐츠 맵과 비교한다.
- [x] 복사된 데이터를 학습만화 에셋 매핑 정보와 비교한다.
- [x] 복사된 데이터를 `public/lexicon.json` 및 사전 관련 UI와 비교한다.

### 12.5 에셋 및 파이프라인 체크
- [x] 복사된 데이터에 맞춰 MP3 파일 경로 이름 변경이 필요한지 확인한다.
- [x] 학습만화 이미지 키가 장/절 넘버링과 잘 매핑되어 있는지 확인한다.
- [x] `scripts/generate_data.ps1`이 원본 텍스트 파일로부터 여전히 런타임 데이터를 재생성할 수 있는지 확인한다.
- [x] `data.js`와 같은 보조 생성 파일을 재생성해야 하는지 또는 제거해야 하는지 확인한다.

### 12.6 검증 계획
- [x] 데이터 계약이 확정된 후 typecheck를 구동한다.
- [x] 데이터 로딩, 구절 범위 판단, 네비게이션 및 데스크톱 레이아웃을 검증하는 유닛 테스트를 실행한다.
- [x] 데이터 동기화 작업 이후 실제 UI 셀렉터를 대상으로 타겟 스모크 패스를 실행한다.
- [x] 작업이 중단되거나 차단될 경우 새로 발견된 불일치를 `ERROR_LOG.md`에 기록한다.

### 12.7 최종 검토 관문 (Decision Gate)
- [x] 신규 표준 데이터 소스를 확정한다.
- [x] 재생성해야 할 파일과 보존해야 할 파일을 명확하게 격리하고 확정한다.
- [x] 업데이트가 필요한 UI 화면 리스트를 확정한다.
- [x] 위 검토 단계가 끝난 이후에만 별도의 패스로 구현을 시작한다.

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
- [x] `src/hooks/useAudio.ts` 파일 삭제
- [x] `src/components/verse/AudioPlayer.tsx` 파일 삭제
- [x] `src/pages/VerseView.tsx` 내부 오디오 상태, refs, 훅 호출 및 `<AudioPlayer>` 마크업/JSX 제거
- [x] `src/utils/dataFetcher.ts` 내 `audio` 필드 처리 및 직렬화 코드 제거
- [x] `src/types.ts` 내 `YogaSutra` 정의에서 `audio` 타입 제거
- [x] 사용되지 않는 오디오 매핑 검증 스크립트(`scripts/check_audio_mismatch.cjs`) 등 제거

### 14.2 레거시 메타데이터 및 스크립트 정리
- [x] `src/constants.ts` 내부의 미사용 `YOGA_CHAPTERS_META` 및 관련 레거시 상수 제거
- [x] `scripts/` 폴더 내 요가수트라 전용 레거시 스크립트 파일들 정리

### 14.3 비주얼 테마 폴리싱 (메타 디자인)
- [x] `src/index.css`를 검토하여 더 이상 사용되지 않는 레거시 유틸리티 클래스 정돈
- [x] 테마 변수 설정을 "인위삼신행상명등론" 앱의 고유 디자인 아이덴티티에 완벽하게 부합하도록 조정

### 14.4 검증 및 스모크 테스트
- [x] `npm run typecheck`를 실행하여 잘못된 임포트나 타입 불일치가 없는지 검증
- [x] `npm run test -- --run`을 실행하여 모든 유닛 테스트가 정상 통과하는지 확인
- [x] `npm run build`를 통해 빌드 안정성 확보
- [x] Playwright 브라우저 스모크 테스트(`npm run qa:browser`)를 구동하여 최종 앱 사용성에 문제가 없는지 확인

## 15. 문제점 수정 및 아키텍처 정밀화

목표: research.md에서 도출된 4가지 주요 문제점을 순차적으로 해결하여 코드 품질과 접근성을 Meta-Design 수준으로 격상함

### 15.1 ChapterList 라우팅 연결 및 데드코드 복구
- [ ] `src/App.tsx` 내 라우터 정의에 `/chapters` 라우트를 추가하고 `ChapterList` 페이지 컴포넌트를 지연 로딩으로 연결함
- [ ] 헤더(`src/components/Header.tsx`)의 `Flower2` 로고 클릭 시 이동하는 `targetUrl`을 기존 `/`에서 `/chapters`로 변경하여 사용자가 홈 화면(챕터 리스트)으로 자연스럽게 복귀할 수 있게 유도함
- [ ] `ChapterList.tsx`와 하위 모달 컴포넌트(`CompendiumModal`, `LexiconModal`)의 런타임 렌더링 무결성을 체크함

### 15.2 해설 데이터 필드명 시맨틱 개선 (`commentary_en` 리팩토링)
- [ ] `src/types.ts` 내 `YogaSutra` 인터페이스에서 `commentary_en` 필드명을 한글 콘텐츠 성격에 맞게 `commentary_ko`로 변경함
- [ ] `src/utils/dataFetcher.ts` 내 `normalizeParagraph` 매핑 시 `commentary_ko`로 매핑을 수정함
- [ ] `src/pages/VerseView.tsx` 내의 해설 렌더링 전달부(`commentaryText={verseData.commentary_ko}`)의 바인딩을 리팩토링함
- [ ] `src/context/UIContext.test.tsx` 등 관련 테스트 파일들의 목(mock) 데이터 스키마를 업데이트하여 타입 경고를 방지함

### 15.3 Windows PowerShell 실행 제약 우회 대응
- [ ] `package.json` 내의 스크립트 혹은 로컬 개발 가이드에 윈도우 환경 전용 `npm.cmd` 기반 실행 가이드 또는 자동 우회 스크립트 설정을 보강하여 빌드/테스트 파이프라인의 에러 빈도를 낮춤
- [ ] 테스트 실행 및 빌드 명령어 구동 시 윈도우 개발자의 권한 차단을 방지할 수 있는 가이드라인을 프로젝트 문서에 명기함

### 15.4 미사용 번역 필드 및 레거시 속성 정돈
- [ ] `src/components/Sidebar.tsx` 내의 번역 표시부(`verseData.translation_ham ?? verseData['5.bae_jik'] ?? ''`)에서 실제 3body에 존재하지 않는 요가수트라 잔재 속성(`5.bae_jik`) 및 불필요한 폴백을 제거함
- [ ] `src/types.ts`의 `YogaSutra` 인터페이스에 잔존하는 미사용 속성 필드들(`5.bae_jik`, `6.bae_uu`, `8. ox`, `9. ox-en`, `translation_en`, `2.english` 등)을 실 데이터인 티벳-한글 기반과 대조하여 정리함

### 15.5 검증 및 최종 빌드 패스
- [ ] `npm.cmd run typecheck` 혹은 `cmd /c npm run typecheck`를 실행하여 타입 정합성 검사
- [ ] `powershell -ExecutionPolicy Bypass -Command "npm run test -- --run"`을 실행하여 모든 유닛 테스트가 통과하는지 확인
- [ ] `npm.cmd run build` 실행하여 프로덕션 빌드 성공 확인
- [ ] Playwright 브라우저 스모크 테스트(`cmd /c npm run qa:browser`)를 구동하여 최종 앱 사용성에 문제가 없는지 확인

