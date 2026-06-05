// --- 모달 로직 ---
let lexiconCache = null;

// 공통 모달 노출/숨김 함수
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            animateModalContent(modal, true);
        });
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('opacity-0');
    animateModalContent(modal, false);

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 500);
}

function animateModalContent(modal, show) {
    const content = modal.querySelector('div.bg-\\[\\#fcfaf7\\]') || modal.querySelector('div.relative');
    if (!content) return;

    if (show) {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    } else {
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
    }
}

// Compendium (개요) 모달
export function openCompendium() { showModal('compendium-modal'); }
export function closeCompendium() { hideModal('compendium-modal'); }

// Lexicon (어휘 사전) 모달
export function openLexicon(sutrasData) {
    showModal('lexicon-modal');

    const contentContainer = document.getElementById('lexicon-content');
    if (!contentContainer) return;

    if (lexiconCache) {
        if (contentContainer.innerHTML === '') contentContainer.appendChild(lexiconCache);
        return;
    }

    setTimeout(() => buildLexicon(sutrasData, contentContainer), 50);
}

export function closeLexicon() { hideModal('lexicon-modal'); }

function buildLexicon(sutrasData, container) {
    if (!sutrasData || !Array.isArray(sutrasData)) {
        container.innerHTML = '<p class="text-center text-red-500">Error: 어휘 데이터를 불러올 수 없음.</p>';
        return;
    }

    const { letters, sortedWords } = extractLexiconData(sutrasData);
    const wrapper = createLexiconWrapper(letters, sortedWords);

    lexiconCache = wrapper;
    container.innerHTML = '';
    container.appendChild(wrapper);
}

function extractLexiconData(sutrasData) {
    const wordMap = new Map();
    sutrasData.forEach(sutra => {
        if (!sutra.word_meanings) return;
        Object.entries(sutra.word_meanings).forEach(([word, meaning]) => {
            const cleanWord = word.trim();
            if (!wordMap.has(cleanWord)) wordMap.set(cleanWord, meaning);
        });
    });

    const sortedWords = Array.from(wordMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0], 'en', { sensitivity: 'base' })
    );
    const letters = [...new Set(sortedWords.map(([word]) => word[0].toUpperCase()))].sort();

    return { letters, sortedWords };
}

function createLexiconWrapper(letters, sortedWords) {
    const wrapper = document.createElement('div');
    if (sortedWords.length === 0) {
        wrapper.innerHTML = '<p class="text-center text-text-muted italic">단어를 찾을 수 없음.</p>';
        return wrapper;
    }

    wrapper.appendChild(createLexiconNavBar(letters));
    wrapper.appendChild(createLexiconList(sortedWords));
    return wrapper;
}

function createLexiconNavBar(letters) {
    const navBar = document.createElement('div');
    navBar.className = 'sticky top-0 bg-[#fcfaf7] z-10 py-3 border-b border-primary/10 flex flex-wrap gap-2 mb-6';

    letters.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'size-8 flex items-center justify-center rounded bg-primary/5 text-primary-dark font-display font-bold hover:bg-primary/20 transition-colors text-sm';
        btn.textContent = letter;
        btn.onclick = () => {
            const target = document.getElementById(`lexicon-letter-${letter}`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        navBar.appendChild(btn);
    });
    return navBar;
}

function createLexiconList(sortedWords) {
    const list = document.createElement('ul');
    list.className = 'space-y-4';
    let lastLetter = '';

    sortedWords.forEach(([word, meaning]) => {
        const currentLetter = word[0].toUpperCase();
        const item = document.createElement('li');
        item.className = 'border-b border-primary/10 pb-3 last:border-0 hover:bg-primary/5 transition-colors p-2 rounded';

        if (currentLetter !== lastLetter) {
            item.id = `lexicon-letter-${currentLetter}`;
            lastLetter = currentLetter;

            const divider = document.createElement('div');
            divider.className = 'text-xs font-display text-primary/40 mb-2 mt-4 first:mt-0 font-bold';
            divider.textContent = currentLetter;
            list.appendChild(divider);
        }

        item.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span class="font-bold text-primary-dark text-xl font-display min-w-[120px]">${word}</span>
                <span class="text-text-main font-kr-serif leading-relaxed opacity-90 break-keep break-words">${meaning}</span>
            </div>
        `;
        list.appendChild(item);
    });
    return list;
}

// Commentaries (내 노트) 모달
export function openCommentaries(sutrasData) {
    showModal('commentaries-modal');

    const contentContainer = document.getElementById('commentaries-content');
    if (!contentContainer) return;

    setTimeout(() => buildCommentaries(sutrasData, contentContainer), 50);
}

export function closeCommentaries() { hideModal('commentaries-modal'); }

function buildCommentaries(sutrasData, container) {
    container.innerHTML = '';
    const notes = loadStoredNotes();

    if (notes.length === 0) {
        container.innerHTML = '<p class="text-center text-text-muted italic">노트가 없음. 수트라에 노트를 추가할 것!</p>';
        return;
    }

    const list = document.createElement('div');
    list.className = 'space-y-6';

    notes.forEach(note => {
        const sutraData = sutrasData.find(s => s.id === note.id);
        const sutraTitle = sutraData ? sutraData.sanskrit : `Sutra ${note.id}`;
        const chapterId = note.id.split('.')[0];

        const item = document.createElement('div');
        item.className = 'bg-white p-6 rounded-lg shadow-sm border border-primary/10 hover:border-primary/30 transition-colors';
        item.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <a href="chapter.html?id=${chapterId}&sutra=${note.id}" class="text-primary-dark font-display font-medium hover:underline flex items-center gap-2">
                    <span class="bg-primary/10 px-2 py-0.5 rounded text-sm">Sutra ${note.id}</span>
                    <span>${sutraTitle}</span>
                </a>
            </div>
            <p class="text-text-main font-kr-serif leading-relaxed whitespace-pre-wrap break-keep break-words">${note.content}</p>
        `;
        list.appendChild(item);
    });

    container.appendChild(list);
}

function loadStoredNotes() {
    const ObjectKeys = Object.keys(localStorage);
    const notes = ObjectKeys.reduce((acc, key) => {
        if (key.startsWith('note-')) {
            const sutraId = key.substring(5);
            const content = localStorage.getItem(key);
            if (content && content.trim() !== '' && content !== 'undefined') {
                acc.push({ id: sutraId, content });
            }
        }
        return acc;
    }, []);

    notes.sort((a, b) => {
        const partsA = a.id.split('.').map(Number);
        const partsB = b.id.split('.').map(Number);
        if (partsA[0] !== partsB[0]) return partsA[0] - partsB[0];
        return partsA[1] - partsB[1];
    });

    return notes;
}

// ESC 키 모달 닫기
export function setupModalEscListener() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCompendium();
            closeLexicon();
            closeCommentaries();
        }
    });
}
