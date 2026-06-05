// --- UI 렌더링 로직 ---

import { initAudioPlayer } from './audio.js';

export function renderSidebar(chapterId, sutrasData, loadSutraFn) {
    const chapterList = document.getElementById('chapter-list');
    const sutraList = document.getElementById('sidebar-sutra-list');

    if (chapterList) chapterList.innerHTML = '';
    if (sutraList) sutraList.innerHTML = '';

    renderChapterButtons(chapterId, chapterList);

    if (sutraList) {
        const chapterSutras = sutrasData.filter(s => s.id.startsWith(`${chapterId}.`));
        chapterSutras.forEach(sutra => createSutraLink(sutra, sutraList, loadSutraFn));
    }
}

function renderChapterButtons(activeChapterId, container) {
    if (!container) return;
    const chapters = [
        { id: '1', name: '1. 합일의 문제', count: 51, icon: 'spa' },
        { id: '2', name: '2. 합일의 단계', count: 55, icon: 'self_improvement' },
        { id: '3', name: '3. 합일의 성취와 그 결과', count: 55, icon: 'wb_twilight' },
        { id: '4', name: '4. 깨달음', count: 34, icon: 'all_inclusive' }
    ];

    chapters.forEach(chap => {
        const isActive = chap.id === activeChapterId;
        const btn = document.createElement('button');
        btn.className = getChapterBtnClass(isActive);
        btn.onclick = () => window.location.href = `chapter.html?id=${chap.id}`;
        btn.innerHTML = getChapterBtnInner(chap, isActive);
        container.appendChild(btn);
    });
}

function getChapterBtnClass(isActive) {
    const base = 'w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-sans font-medium tracking-[0.02em] transition-all mb-1.5 border border-transparent shadow-sm ';
    return base + (isActive ? 'bg-primary/10 text-primary-dark border-primary/20 shadow-gold-glow' : 'text-text-muted dark:text-gray-400 hover:bg-white/50 dark:hover:bg-ink/50 hover:border-primary/15');
}

function getChapterBtnInner(chap, isActive) {
    const iconClass = isActive ? '' : 'text-slate-400';
    const badgeClass = isActive ? 'bg-primary/20 text-primary font-bold' : 'text-slate-400';
    return `
        <span class="flex items-center gap-2">
            ${chap.name}
        </span>
        <span class="text-xs ${badgeClass} px-1.5 py-0.5 rounded">${chap.count}</span>
    `;
}

function createSutraLink(sutra, container, loadSutraFn) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'block px-4 py-2 text-[13.5px] tracking-wide font-sans text-text-main dark:text-gray-300 hover:bg-white/40 dark:hover:bg-ink/40 rounded-lg truncate transition-all mb-1 hover:pl-5 hover:text-primary-dark border border-transparent hover:border-primary/10';
    link.dataset.id = sutra.id;

    link.onclick = (e) => {
        e.preventDefault();
        loadSutraFn(sutra.id);
    };

    const previewTxt = sutra.pronunciation ? sutra.pronunciation.split(' ').slice(0, 4).join(' ') + '...' : '';
    link.textContent = `${sutra.id} ${previewTxt}`;
    container.appendChild(link);
}

export function updateActiveSidebarItem(id) {
    document.querySelectorAll('#sidebar-sutra-list a').forEach(a => {
        if (a.dataset.id === id) {
            a.className = 'block px-4 py-2 text-sm font-serif font-bold text-primary-dark bg-primary/10 rounded-lg border-l-2 border-primary-dark truncate transition-all mb-1 pl-5 shadow-[inset_0_1px_4px_rgba(212,175,55,0.1)]';
            a.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            a.className = 'block px-4 py-2 text-sm font-serif text-text-main dark:text-gray-300 hover:bg-white/40 dark:hover:bg-ink/40 rounded-lg truncate transition-all mb-1 hover:pl-5 hover:text-primary-dark border border-transparent hover:border-primary/10';
        }
    });
}

export function setupSutraDOM(sutra, currentChapterId) {
    const mainContent = document.getElementById('sutra-detail-view');
    const indicator = document.getElementById('current-sutra-indicator');
    const noteIndicator = document.getElementById('note-sutra-id');

    if (indicator) indicator.textContent = sutra.id;
    if (noteIndicator) noteIndicator.textContent = sutra.id;

    if (mainContent) {
        mainContent.innerHTML = getSutraHtml(sutra, currentChapterId);
        mainContent.scrollTop = 0;
    }

    initAudioPlayer(sutra.id);
}

function getSutraHtml(sutra, chapterId) {
    return `
    <div class="max-w-4xl mx-auto pb-24 animate-fade-in pt-4">
        ${getSutraHeaderNav(sutra.id, chapterId)}
        <section class="text-center mb-16 relative">
            <div class="inline-flex items-center justify-center p-3 rounded-full bg-primary/5 text-primary mb-8 border border-primary/20 shadow-gold-glow">
                <span class="material-symbols-outlined">self_improvement</span>
            </div>
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-ink dark:text-gray-100 mb-8 leading-tight tracking-tight font-kr-serif break-keep break-words drop-shadow-sm">
                ${sutra.sanskrit || ''}
            </h1>
            <h2 class="text-xl md:text-2xl font-light text-text-muted dark:text-gray-400 italic mb-8 font-serif break-keep break-words tracking-wide">
                ${sutra.pronunciation || ''}
            </h2>
            <div class="text-lg text-text-muted/80 dark:text-gray-500 mb-10 font-kr-serif break-keep break-words leading-relaxed">
                ${formatPronunciationKr(sutra.pronunciation_kr || '')}
            </div>
            ${getAudioPlayerHtml(sutra.id)}
            <div class="flex flex-wrap justify-center gap-3 text-sm font-display leading-relaxed max-w-2xl mx-auto">
                ${renderWordBreakdown(sutra)}
            </div>
        </section>
        <div class="w-full h-px bg-primary/10 mb-12"></div>
        <div class="space-y-6 max-w-3xl mx-auto">
            ${renderTranslations(sutra)}
        </div>
    </div>
    `;
}

function getSutraHeaderNav(sutraId, chapterId) {
    return `
        <nav class="flex items-center justify-center gap-3 text-sm text-primary/60 mb-12 font-display tracking-[0.2em] uppercase">
            <span class="hover:text-primary-dark cursor-pointer transition-colors">Chapter ${chapterId}</span>
            <span class="material-symbols-outlined text-[12px] opacity-50">diamond</span>
            <span class="font-medium text-primary-dark font-display tracking-widest">Sutra ${sutraId}</span>
        </nav>
        `;
}

function getAudioPlayerHtml(sutraId) {
    return `
        <div class="flex flex-col items-center mb-10 w-full max-w-md mx-auto">
            <div id="audio-player-${sutraId}" class="w-full glass-panel rounded-full px-5 py-3 flex items-center gap-4 animate-fade-in transition-all hover:shadow-gold-glow">
                <button id="play-pause-btn-${sutraId}" class="shrink-0 size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary-dark hover:bg-primary/20 hover:scale-105 transition-all">
                    <span class="material-symbols-outlined text-[26px]">play_arrow</span>
                </button>
                <span id="current-time-${sutraId}" class="text-xs font-mono text-text-muted dark:text-gray-400 w-10 text-right">0:00</span>
                <div class="relative flex-1 h-1 bg-primary/20 rounded-full cursor-pointer group">
                    <div id="progress-bar-${sutraId}" class="absolute top-0 left-0 h-full bg-primary rounded-full w-0 transition-all duration-100 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                    <input type="range" id="seek-slider-${sutraId}" min="0" max="100" value="0" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10">
                </div>
                <span id="duration-${sutraId}" class="text-xs font-mono text-text-muted dark:text-gray-400 w-10">0:00</span>
                <audio id="audio-${sutraId}" src="mp3/${sutraId.replace('.', '-')}.mp3"></audio>
            </div>
        </div>
        `;
}

function formatPronunciationKr(text) {
    if (!text) return '';
    return text.split('｜').map(chunk => {
        const trimmed = chunk.trim();
        if (!trimmed) return '';
        return `<span class="inline-block whitespace-nowrap">${trimmed}</span>`;
    }).join('<span class="mx-1 opacity-50">｜</span>');
}

function renderWordBreakdown(sutra) {
    if (sutra.tokens && sutra.tokens.length > 0) {
        return sutra.tokens.map(token => getWordHtmlFromToken(token)).join('');
    }
    if (!sutra.word_meanings) return '';

    const entries = Object.entries(sutra.word_meanings);
    return entries.map(([word, meaning]) => getWordHtmlFallback(word, meaning)).join('');
}

function getWordHtmlFromToken(token) {
    const word = token.surface || token.lemma;
    let meaning = (token.meaning_ko || '').trim();
    let shortMeaning = (token.meaning_ko_short || '').trim();
    const etymology = token.etymology_ko || '';

    let htmlContent = '';
    const goldClass = 'text-[#b08d45] dark:text-[#c5a059]';
    const cleanMeaning = meaning.replace(/[^가-힣a-zA-Z0-9]/g, '');
    const cleanShort = shortMeaning.replace(/[^가-힣a-zA-Z0-9]/g, '');
    const isDuplicate = cleanShort && (cleanMeaning === cleanShort || cleanMeaning.startsWith(cleanShort));

    if (shortMeaning && meaning && !isDuplicate) {
        htmlContent += `<span class="font-bold ${goldClass} mr-1">${shortMeaning}</span>`;
        htmlContent += `<span class="opacity-90 text-slate-600 dark:text-slate-400">${meaning}</span>`;
    } else {
        const displayMeaning = (shortMeaning && meaning && isDuplicate) ? meaning : (shortMeaning || meaning);
        htmlContent += `<span class="font-bold ${goldClass}">${displayMeaning}</span>`;
    }

    if (etymology) htmlContent += `<br><span class="text-[10px] uppercase tracking-widest opacity-50 mt-1.5 block font-display">root: ${etymology}</span>`;

    return `
        <span class="inline-flex flex-col items-start gap-1 px-4 py-3 bg-white/40 dark:bg-ink/40 backdrop-blur-sm rounded-xl border border-primary/15 hover:border-primary/40 hover:shadow-gold-glow transition-all text-left">
            <span class="font-serif font-bold text-ink dark:text-gray-100 text-lg leading-none mb-1">${word}</span>
            <span class="text-sm leading-snug font-kr-serif tracking-wide block w-full text-text-main dark:text-gray-300 opacity-90">${htmlContent}</span>
        </span>
        `;
}

function getWordHtmlFallback(word, meaning) {
    const formattedMeaning = meaning.replace(/</g, '<br><span class="opacity-60 text-[10px] tracking-widest">&lt;</span>');
    return `
        <span class="inline-flex flex-col items-start gap-1.5 px-4 py-3 bg-white/40 dark:bg-ink/40 backdrop-blur-sm rounded-xl border border-primary/15 hover:border-primary/40 hover:shadow-gold-glow transition-all text-left">
            <strong class="font-serif text-ink dark:text-gray-100 font-bold text-lg leading-none">${word}</strong>
            <span class="text-text-main dark:text-gray-300 text-sm leading-snug font-kr-serif tracking-wide opacity-90">${formattedMeaning}</span>
        </span>
        `;
}

function renderTranslations(sutra) {
    const fixedKeys = ['id', 'sanskrit', 'pronunciation', 'pronunciation_kr', 'word_meanings', 'pada', 'tokens'];
    const translationKeys = Object.keys(sutra).filter(key => !fixedKeys.includes(key)).sort();
    let html = '';

    const configs = [
        { keys: ['2.english', '3.korean-1'], author: 'Alice A. Bailey / 심상학회', title: 'The Light of the Soul', icon: 'auto_stories', cls: 'bg-purple-50 text-purple-600' },
        { prefix: 'bae', author: '배철현', title: '배철현의 요가수트라 강독', icon: 'person_search', cls: 'bg-orange-50 text-orange-600' },
        { prefix: 'ox', author: 'Nicholas Sutton', title: 'Oxford Centre for Hindu Studies', icon: 'school', cls: 'bg-blue-50 text-blue-600' }
    ];

    configs.forEach(cfg => {
        let keys = cfg.prefix ? translationKeys.filter(k => k.includes(cfg.prefix)) : (cfg.keys ? cfg.keys.filter(k => translationKeys.includes(k)) : []);
        if (cfg.prefix === 'ox' && keys.length) {
            keys.sort((a, b) => (a.includes('ox-en') ? -1 : (b.includes('ox-en') ? 1 : a.localeCompare(b))));
        } else if (cfg.prefix === 'bae') {
            keys.sort();
        }

        if (keys.length > 0) html += renderTranslationCard(sutra, keys, cfg.author, cfg.title, cfg.icon, cfg.cls);
    });

    if (translationKeys.includes('7.dan')) {
        html += renderTranslationCard(sutra, ['7.dan'], '단요가', '요가수트라 해설', 'edit', 'bg-slate-50 text-slate-600');
    }

    return html;
}

function renderTranslationCard(sutra, keys, authorName, subTitle, icon, iconClass) {
    const contents = keys.map(key => {
        const isEnglish = key.includes('english') || key.includes('ox-en');
        const langClass = isEnglish ? 'lang-en' : 'lang-ko';
        const label = formatLabel(key);
        const textStr = (sutra[key] || '').trim();
        return `
            <div class="mb-6 md:mb-8 last:mb-0 relative">
                <div class="section-label pl-2">${label}</div>
                <div class="content-block">
                    <blockquote class="${langClass} text-[1.1rem] text-ink dark:text-gray-200 whitespace-pre-wrap leading-loose">${textStr}</blockquote>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="max-w-[720px] mx-auto glass-panel rounded-2xl p-5 md:p-8 shadow-sm hover:shadow-gold-glow transition-all group text-left">
            <div class="flex items-center justify-between mb-6 md:mb-8 pb-3 md:pb-4 border-b border-primary/10">
                <div class="flex items-center gap-3">
                    <div class="size-12 rounded-full ${iconClass} flex items-center justify-center shadow-inner border border-white/20">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-ink dark:text-white font-serif tracking-wide">${authorName}</h3>
                        <p class="text-xs text-text-muted tracking-widest uppercase mt-0.5">${subTitle}</p>
                    </div>
                </div>
            </div>
            ${contents}
        </div>
        `;
}

function formatLabel(key) {
    if (key.includes('bae_jik')) return '직역 (Literal)';
    if (key.includes('bae_uu')) return '의역 (Meaning)';
    if (key.includes('bae_han')) return '한글 발음';
    if (key.includes('ox-en')) return 'English';
    if (key === '8. ox') return 'Korean';
    if (key === '2.english') return 'English';
    if (key === '3.korean-1') return 'Korean';
    if (key === '7.dan') return 'Korean';
    return key;
}

export function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const { colors, icon, iconColor } = getToastStyle(type);

    toast.className = `flex items-center gap-3 px-6 py-3 rounded-full shadow-xl border ${colors} transform transition-all duration-300 translate-y-8 opacity-0 pointer-events-auto min-w-[300px] max-w-sm backdrop-blur-sm bg-white/95 dark:bg-slate-800/95`;
    toast.innerHTML = `<span class="material-symbols-outlined ${iconColor}">${icon}</span><span class="text-sm font-medium font-serif">${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.remove('translate-y-8', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastStyle(type) {
    if (type === 'error') return { colors: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-red-500/40", icon: "error", iconColor: "text-red-500" };
    if (type === 'warning') return { colors: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-orange-500/40", icon: "warning", iconColor: "text-orange-500" };
    return { colors: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-primary/40", icon: "check_circle", iconColor: "text-primary" };
}
