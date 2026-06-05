// --- 메인 앱 로직 ---

import { initAuthGate, checkPassword } from './auth.js';
import { setupQuickJump, toggleSidebar, toggleNotes, closeAllSidebars, setupMobileNavScroll, navigateSutraDirection } from './navigation.js';
import { renderSidebar, updateActiveSidebarItem, setupSutraDOM, showToast } from './ui.js';
import { openCompendium, closeCompendium, openLexicon, closeLexicon, openCommentaries, closeCommentaries, setupModalEscListener } from './modals.js';

let currentChapterId = null;
let currentSutraId = null;

// 진입점 로직
document.addEventListener('DOMContentLoaded', () => {
    // data.js에서 로드된 sutras 배열을 전역 window 객체에 바인딩함
    if (typeof sutras !== 'undefined' && !window.sutras) {
        window.sutras = sutras;
    }

    initAuthGate();

    // 글로벌에 콜백 바인딩 (인라인 이벤트 용도)
    bindGlobalEvents();

    requestAnimationFrame(() => {
        setTimeout(initializeApp, 0);
    });
});

function bindGlobalEvents() {
    window.checkPassword = checkPassword;
    window.openCompendium = openCompendium;
    window.closeCompendium = closeCompendium;
    window.openLexicon = () => openLexicon(window.sutras); // 전역 데이터 참조
    window.closeLexicon = closeLexicon;
    window.openCommentaries = () => openCommentaries(window.sutras);
    window.closeCommentaries = closeCommentaries;

    window.toggleSidebar = toggleSidebar;
    window.toggleNotes = toggleNotes;
    window.closeAllSidebars = closeAllSidebars;

    // 모바일 등에서 onClick 사용
    window.loadSutra = handleLoadSutra;

    setupModalEscListener();
    setupMobileNavScroll();
    setupThemeToggle();
}

function initializeApp() {
    setupQuickJump();

    const chapterListEl = document.getElementById('chapter-list');
    if (!chapterListEl) return;

    setupNavigationButtons();

    const urlParams = new URLSearchParams(window.location.search);
    const qChapter = urlParams.get('chapter');
    const qSutra = urlParams.get('sutra');
    const idParam = urlParams.get('id');

    currentChapterId = idParam || '1';

    if (qChapter && qSutra) {
        currentChapterId = qChapter;
        currentSutraId = `${qChapter}.${qSutra}`;
        renderSidebar(currentChapterId, window.sutras, handleLoadSutra);
        handleLoadSutra(currentSutraId);
    } else {
        renderSidebar(currentChapterId, window.sutras, handleLoadSutra);
        const firstSutra = window.sutras.find(s => s.id.startsWith(`${currentChapterId}.`));
        if (firstSutra) handleLoadSutra(firstSutra.id);
    }
}

function handleLoadSutra(id) {
    currentSutraId = id;
    const sutra = window.sutras.find(s => s.id === id);
    if (!sutra) return;

    updateActiveSidebarItem(id);
    setupSutraDOM(sutra, currentChapterId);
    loadUserNote(id);

    if (window.innerWidth < 1024) closeAllSidebars();
}

function setupNavigationButtons() {
    const prevBtn = document.getElementById('prev-sutra-btn');
    const nextBtn = document.getElementById('next-sutra-btn');

    if (prevBtn) prevBtn.onclick = () => navigateSutraDirection(-1, currentSutraId, currentChapterId, window.sutras, handleLoadSutra);
    if (nextBtn) nextBtn.onclick = () => navigateSutraDirection(1, currentSutraId, currentChapterId, window.sutras, handleLoadSutra);

    // 노트 버튼 바인딩
    window.saveNote = saveUserNote;
    window.exportAllNotes = exportAllNotes;
    window.exportCurrentNote = exportCurrentNote;
}

function loadUserNote(sutraId) {
    const noteArea = document.getElementById('user-note-area');
    const noteIdDisplay = document.getElementById('note-sutra-id');

    if (noteArea && noteIdDisplay) {
        noteIdDisplay.textContent = sutraId;
        noteArea.value = localStorage.getItem(`note-${sutraId}`) || '';
        noteArea.dataset.currentSutraId = sutraId;
    }
}

function saveUserNote() {
    const noteArea = document.getElementById('user-note-area');
    const noteIdDisplay = document.getElementById('note-sutra-id');
    const sutraId = (noteArea && noteArea.dataset.currentSutraId) || (noteIdDisplay ? noteIdDisplay.textContent : null);

    if (sutraId && noteArea) {
        localStorage.setItem(`note-${sutraId}`, noteArea.value);
        showToast("노트가 성공적으로 저장됨", "success");
    } else {
        showToast("오류: 선택된 수트라가 없음", "error");
    }
}

function exportCurrentNote() {
    const noteArea = document.getElementById('user-note-area');
    const sutraId = noteArea && noteArea.dataset.currentSutraId;
    const note = sutraId ? localStorage.getItem(`note-${sutraId}`) : null;

    if (!sutraId || !note || !note.trim()) {
        showToast("현재 구절에 작성된 성찰 노트가 없습니다.", "warning");
        return;
    }

    let content = `Yoga Sutras - 나의 성찰\n\n[Sutra ${sutraId}]\n${note}\n\n`;
    createAndDownloadFile(content, `yoga_sutra_note_${sutraId}_${new Date().toISOString().slice(0, 10)}.txt`);
}

function exportAllNotes() {
    let content = "Yoga Sutras - 전체 성찰 노트\n\n";
    let hasNotes = false;

    // 키 가져오기
    const ObjectKeys = Object.keys(localStorage).filter(k => k.startsWith('note-')).sort(); // Sort so they appear somewhat in order if possible

    // 문자열 숫자 혼합 정렬
    ObjectKeys.sort((a, b) => {
        const numA = parseFloat(a.replace('note-', ''));
        const numB = parseFloat(b.replace('note-', ''));
        return numA - numB;
    });

    for (const key of ObjectKeys) {
        const id = key.substring(5);
        const note = localStorage.getItem(key);
        if (note && note.trim()) {
            content += `[Sutra ${id}]\n${note}\n\n-------------------\n\n`;
            hasNotes = true;
        }
    }

    if (!hasNotes) {
        showToast("내보낼 성찰 노트가 없습니다.", "warning");
        return;
    }

    createAndDownloadFile(content, `yoga_sutras_all_notes_${new Date().toISOString().slice(0, 10)}.txt`);
}

function createAndDownloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("성찰 노트가 파일로 저장되었습니다.", "success");
}

function setupThemeToggle() {
    window.toggleTheme = () => document.documentElement.classList.toggle('dark');
}
