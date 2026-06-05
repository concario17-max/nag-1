// --- 인증 게이트 ---
export const MASTER_PASSWORD = '0228';

export function checkPassword(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('app-password');
    const gate = document.getElementById('password-gate');
    const content = document.getElementById('app-wrapper') || document.getElementById('main-content') || document.getElementById('landing-page');
    const error = document.getElementById('password-error');

    if (input.value === MASTER_PASSWORD) {
        // 성공: 코드가 변경되어 비밀번호가 바뀌면 구형 세션 무효화를 위해 실제 값을 저장함
        localStorage.setItem('yoga_gate_auth', MASTER_PASSWORD);
        // 10년간 유지되는 영구 쿠키를 설정함
        document.cookie = `yoga_gate_auth=${MASTER_PASSWORD}; path=/; max-age=315360000; samesite=strict`;

        gate.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            gate.classList.add('hidden');
            gate.style.display = 'none'; // 안전장치
            if (content) {
                content.classList.remove('invisible');
                content.classList.add('opacity-100');
                document.body.classList.remove('overflow-hidden');
            }
        }, 700);
    } else {
        // 실패: 에러를 표시하고 애니메이션을 트리거함
        handleAuthFailure(input, error);
    }
}

function handleAuthFailure(input, error) {
    error.classList.remove('hidden');
    input.value = '';
    input.focus();
    // 흔들림 애니메이션 적용
    input.parentElement.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
    ], { duration: 300 });
}

// 로드 시 세션을 확인함
export function initAuthGate() {
    const localAuth = localStorage.getItem('yoga_gate_auth');
    const cookieAuthStr = document.cookie.split('; ').find(row => row.startsWith('yoga_gate_auth='));
    const cookieAuth = cookieAuthStr ? cookieAuthStr.split('=')[1] : null;

    // 현재 마스터 비밀번호와 일치하는 경우에만 인증됨
    const isLocalValid = localAuth === MASTER_PASSWORD;
    const isCookieValid = cookieAuth === MASTER_PASSWORD;
    const isAuth = isLocalValid || isCookieValid;

    // 상태 동기화: 한 쪽만 인증되었을 경우 누락된 것을 복구함
    if (isAuth) {
        if (!isLocalValid) localStorage.setItem('yoga_gate_auth', MASTER_PASSWORD);
        if (!isCookieValid) document.cookie = `yoga_gate_auth=${MASTER_PASSWORD}; path=/; max-age=315360000; samesite=strict`;
    }

    applyAuthState(isAuth);
}

function applyAuthState(isAuth) {
    const gate = document.getElementById('password-gate');
    const content = document.getElementById('app-wrapper') || document.getElementById('main-content') || document.getElementById('landing-page');
    const isLandingPage = !!gate;

    if (!isLandingPage || isAuth) {
        if (gate) {
            gate.classList.add('hidden', 'pointer-events-none');
            gate.style.display = 'none';
        }
        if (content) {
            content.classList.remove('invisible');
            content.classList.add('opacity-100');
            document.body.classList.remove('overflow-hidden');
        }
    } else {
        // 랜딩 페이지에서만 게이트를 강제함
        if (gate) {
            gate.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
        if (content) content.classList.add('invisible');
    }
}
