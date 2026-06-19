# 스크립트 (Scripts)

이 디렉토리에는 브라우저 스모크 QA 및 테스트에 필요한 스크립트가 포함되어 있음

## 주요 스크립트 (Main Scripts)

- `browser_smoke.mjs`
  Playwright를 활용해 데스크톱 및 모바일 뷰어 동작의 무결성을 검증하는 스모크 테스트 스크립트

## 실행 방법 및 문제 해결 (Execution and Troubleshooting)

### 윈도우 환경 실행 권한 오류 해결
윈도우 PowerShell 환경에서 보안 정책(`ExecutionPolicy`) 제한으로 인해 `npm` 스크립트 실행이 차단되는 경우, 아래 방법 중 하나를 선택해 해결 가능:

1. **cmd 셸 사용 (권장)**
   기본 PowerShell 대신 명령 프롬프트(cmd)에서 명령어를 실행:
   ```cmd
   cmd /c "npm run qa:browser"
   ```

2. **PowerShell 실행 정책 우회 실행**
   스크립트 실행 권한을 일시적으로 우회하여 실행:
   ```powershell
   powershell -ExecutionPolicy Bypass -Command "npm run qa:browser"
   ```
