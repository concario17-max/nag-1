// --- 내비게이션 및 사이드바 로직 ---

const sutraCounts = {
    1: 51,
    2: 55,
    3: 56,
    4: 34
};

// 상단 헤더, 모바일 등 빠른 점프 설정
export function setupQuickJump() {
    initQuickJump('chapter-select-landing', 'sutra-select-landing');
    initQuickJump('chapter-select-header', 'sutra-select-header'); // 데스크탑
    initQuickJump('chapter-select-mobile', 'sutra-select-mobile'); // 모바일
}

function initQuickJump(chapterId, sutraId) {
    const chapterSelect = document.getElementById(chapterId);
    const sutraSelect = document.getElementById(sutraId);

    if (!chapterSelect || !sutraSelect) return;

    // 초기값 세팅
    updateSutraOptions(chapterSelect.value, sutraSelect);

    // 챕터 변경 이벤트
    chapterSelect.addEventListener('change', (e) => {
        updateSutraOptions(e.target.value, sutraSelect);
    });

    // 수트라 변경 시 이동 이벤트
    sutraSelect.addEventListener('change', (e) => {
        const ch = chapterSelect.value;
        const su = e.target.value;
        if (ch && su) {
            window.location.href = `chapter.html?chapter=${ch}&sutra=${su}`;
        }
    });
}

function updateSutraOptions(chapterVal, sutraSelectEl) {
    if (!chapterVal || !sutraCounts[chapterVal]) return;

    const count = sutraCounts[chapterVal];
    sutraSelectEl.innerHTML = '';

    // 기본 Placeholder
    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "Sutra";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.className = "bg-[#fdfbf7] dark:bg-slate-800 text-slate-700 dark:text-slate-200";
    sutraSelectEl.appendChild(placeholder);

    for (let i = 1; i <= count; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = `${i}`;
        opt.className = "bg-[#fdfbf7] dark:bg-slate-800 text-slate-700 dark:text-slate-200";
        sutraSelectEl.appendChild(opt);
    }
}

// 모바일 드로어 메뉴 토글 관련
export function toggleSidebar() {
    const sidebar = document.getElementById('left-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('opacity-100'), 10);
        } else {
            closeAllSidebars();
        }
    }
}

export function toggleNotes() {
    const notes = document.getElementById('right-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (notes && overlay) {
        if (notes.classList.contains('translate-x-full')) {
            notes.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('opacity-100'), 10);
        } else {
            closeAllSidebars();
        }
    }
}

export function closeAllSidebars() {
    const leftSidebar = document.getElementById('left-sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (leftSidebar) leftSidebar.classList.add('-translate-x-full');
    if (rightSidebar) rightSidebar.classList.add('translate-x-full');

    if (overlay) {
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// 모바일 하단 플로팅 네비게이션 스크롤 동작 설정
export function setupMobileNavScroll() {
    const scrollContainer = document.getElementById('sutra-detail-view');
    const mobileNav = document.getElementById('mobile-nav-bar');
    let lastScrollY = 0;

    if (scrollContainer && mobileNav) {
        scrollContainer.addEventListener('scroll', () => {
            const currentScrollY = scrollContainer.scrollTop;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                mobileNav.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
            } else {
                mobileNav.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
            }
            lastScrollY = currentScrollY;
        });
    }
}

// 이전/다음 수트라 탐색
export function navigateSutraDirection(direction, currentSutraId, currentChapterId, sutras, loadFn) {
    if (!currentSutraId) return;

    const index = sutras.findIndex(s => s.id === currentSutraId);
    if (index === -1) return;

    const nextIndex = index + direction;
    if (nextIndex >= 0 && nextIndex < sutras.length) {
        const nextSutra = sutras[nextIndex];
        const nextChapterId = nextSutra.id.split('.')[0];

        if (nextChapterId !== currentChapterId) {
            window.location.href = `chapter.html?chapter=${nextChapterId}&sutra=${nextSutra.id.split('.')[1]}`;
            return;
        }
        loadFn(nextSutra.id);
    }
}
