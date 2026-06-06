import { CSSProperties, Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ThemeToggle from './components/ThemeToggle';
import { useUI } from './context/UIContext';
import { AppShell } from './components/ui/AppShell';
import { getDesktopVerseColumns } from './components/ui/desktopVerseLayout';
import { useYogaData } from './hooks/useYogaData';

const VerseView = lazy(() => import('./pages/VerseView'));

type ContextOption = {
    value: string;
    label: string;
};

type ReadingDataText = {
    tibetan?: string;
    pronunciation?: string;
    english?: string;
    korean?: string;
};

type ReadingDataParagraph = {
    id: string;
    title?: string;
    paragraphNumber?: number;
    chapterTitle?: string;
    text?: ReadingDataText;
};

type ReadingDataSubchapter = {
    id: string;
    chapterName?: string;
    title?: string;
    tocHeadings?: string[];
    tocActionLabel?: string;
    paragraphs?: ReadingDataParagraph[];
};

type ReadingDataGroup = {
    id: string;
    chapterName?: string;
    title?: string;
    isGroup?: boolean;
    subchapters?: ReadingDataSubchapter[];
    paragraphs?: ReadingDataParagraph[];
};

type ReadingDataSnapshot = {
    chapters?: ReadingDataGroup[];
    flatParagraphs?: ReadingDataParagraph[];
};

type OutlineNode = {
    id: string;
    label: string;
    pathLabel: string;
    children: OutlineNode[];
    chapterNumber?: number;
};

type OutlineGroup = {
    key: string;
    label: string;
    nodes: OutlineNode[];
};

type OutlineLookupEntry = {
    groupKey: string;
    fullLabel: string;
    shortLabel: string;
    ancestorIds: string[];
};

type ReadingOutline = {
    groups: OutlineGroup[];
    chapterLookup: Record<number, OutlineLookupEntry>;
};

interface ContextAccordionPickerProps {
    chapterNum?: string;
    verseNum?: string;
    outline: ReadingOutline | null;
    verseOptionsByChapter: Record<string, ContextOption[]>;
    onCommitSelection: (chapter: string, verse: string) => void;
}

const normalizeLabel = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';

const splitOutlineParts = (group: ReadingDataGroup, subchapter: ReadingDataSubchapter) => {
    const title = normalizeLabel(subchapter.title);
    const chapterName = normalizeLabel(subchapter.chapterName);
    const fallback = normalizeLabel(group.title || group.chapterName || subchapter.chapterName || subchapter.title);
    const titleParts = title ? title.split(' / ').map(normalizeLabel).filter(Boolean) : [];

    if (!chapterName) {
        return titleParts.length > 0 ? titleParts : [fallback];
    }

    if (titleParts.length === 0) {
        return [chapterName];
    }

    if (titleParts.length === 1 && titleParts[0] !== chapterName) {
        return [...titleParts, chapterName];
    }

    return titleParts;
};

const insertOutlineNode = (
    nodes: OutlineNode[],
    parts: string[],
    chapterNumber: number,
    groupKey: string,
    lookup: Record<number, OutlineLookupEntry>,
    ancestorIds: string[] = [],
    ancestorLabels: string[] = [],
) => {
    const [currentPart, ...rest] = parts;
    if (!currentPart) {
        return;
    }

    const nodeId = [...ancestorIds, currentPart].join(' / ');
    let node = nodes.find((item) => item.label === currentPart);

    if (!node) {
        node = {
            id: nodeId,
            label: currentPart,
            pathLabel: [...ancestorLabels, currentPart].join(' / '),
            children: [],
        };
        nodes.push(node);
    }

    const nextAncestorIds = [...ancestorIds, node.id];
    const nextAncestorLabels = [...ancestorLabels, currentPart];

    if (rest.length === 0) {
        node.chapterNumber = chapterNumber;
        lookup[chapterNumber] = {
            groupKey,
            fullLabel: nextAncestorLabels.join(' / '),
            shortLabel: currentPart,
            ancestorIds: ancestorIds.slice(),
        };
        return;
    }

    insertOutlineNode(node.children, rest, chapterNumber, groupKey, lookup, nextAncestorIds, nextAncestorLabels);
};

const buildReadingOutline = (snapshot: ReadingDataSnapshot): ReadingOutline => {
    const chapterLookup: Record<number, OutlineLookupEntry> = {};
    let chapterNumber = 1;

    const groups = (snapshot.chapters ?? []).map((group) => {
        const nodes: OutlineNode[] = [];
        const groupKey = group.id || group.title || group.chapterName || `group-${chapterNumber}`;

        (group.subchapters ?? []).forEach((subchapter) => {
            const parts = splitOutlineParts(group, subchapter);
            insertOutlineNode(nodes, parts, chapterNumber, groupKey, chapterLookup);
            chapterNumber += 1;
        });

        return {
            key: groupKey,
            label: normalizeLabel(group.title || group.chapterName || groupKey),
            nodes,
        };
    });

    return {
        groups,
        chapterLookup,
    };
};

const DefaultVerseRedirect = () => {
    const { chapters, loading } = useYogaData();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-transparent">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-primary border-t-transparent" />
            </div>
        );
    }

    const firstChapter = chapters[0];
    const firstVerse = firstChapter?.sutras[0];
    const chapterNum = firstChapter?.chapter ?? 1;
    const verseNum = firstVerse?.verse ?? Number.parseInt(firstVerse?.id.split('.')[1] ?? '1', 10);

    return <Navigate to={`/chapter/${chapterNum}/verse/${verseNum}`} replace />;
};

const OutlineTree = ({
    nodes,
    expandedNodeIds,
    onSelectChapter,
    onToggleNode,
    activeChapterNumber,
}: {
    nodes: OutlineNode[];
    expandedNodeIds: Set<string>;
    onSelectChapter: (chapterNumber: number) => void;
    onToggleNode: (nodeId: string) => void;
    activeChapterNumber: number | null;
}) => {
    const renderNodes = (items: OutlineNode[], depth = 0) =>
        items.map((node) => {
            const isExpanded = expandedNodeIds.has(node.id);
            const isLeaf = typeof node.chapterNumber === 'number';
            const isSelected = isLeaf && node.chapterNumber === activeChapterNumber;

            return (
                <div key={node.id} className="space-y-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (isLeaf && node.chapterNumber) {
                                onSelectChapter(node.chapterNumber);
                                return;
                            }

                            onToggleNode(node.id);
                        }}
                        className={[
                            'flex w-full items-center gap-2 rounded-[1rem] border px-3 py-2.5 text-left transition-all duration-300',
                            depth === 0 ? 'bg-white/55 dark:bg-white/6' : 'bg-white/40 dark:bg-white/4',
                            isSelected
                                ? 'border-gold-primary/25 text-gold-primary shadow-[0_12px_28px_-24px_rgba(0,0,0,0.5)] dark:border-gold-light/25 dark:text-gold-light'
                                : 'border-gold-border/12 text-text-primary hover:border-gold-border/22 hover:bg-white/75 dark:border-dark-border/55 dark:text-dark-text-primary dark:hover:bg-white/8',
                        ].join(' ')}
                        style={{ paddingLeft: `${0.9 + depth * 0.9}rem` }}
                    >
                        <span className="flex-1 text-[13px] font-semibold leading-snug tracking-[0.01em]">{node.label}</span>
                        {node.children.length > 0 ? (
                            <ChevronDown
                                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        ) : (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-gold-primary/25 dark:bg-gold-light/25" />
                        )}
                    </button>

                    {isExpanded && node.children.length > 0 ? (
                        <div className="space-y-2 border-l border-gold-border/12 pl-3 dark:border-dark-border/55">{renderNodes(node.children, depth + 1)}</div>
                    ) : null}
                </div>
            );
        });

    return <div className="space-y-2">{renderNodes(nodes)}</div>;
};

const ContextAccordionPicker = ({
    chapterNum,
    verseNum,
    outline,
    verseOptionsByChapter,
    onCommitSelection,
}: ContextAccordionPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [draftChapterNum, setDraftChapterNum] = useState(chapterNum ?? '');
    const [draftVerseNum, setDraftVerseNum] = useState(verseNum ?? '');
    const [activeGroupKey, setActiveGroupKey] = useState(outline?.groups[0]?.key ?? '');
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);

    const activeChapterNumber = draftChapterNum ? Number.parseInt(draftChapterNum, 10) : null;
    const activeOutlineEntry = activeChapterNumber ? outline?.chapterLookup[activeChapterNumber] ?? null : null;
    const draftVerseOptions = draftChapterNum ? verseOptionsByChapter[draftChapterNum] ?? [] : [];
    const activeGroup = outline?.groups.find((group) => group.key === activeGroupKey) ?? outline?.groups[0] ?? null;
    const currentVerseLabel = verseNum ? `${verseNum}절` : '절 선택';
    const currentChapterLabel = activeOutlineEntry?.fullLabel ?? activeOutlineEntry?.shortLabel ?? (chapterNum ? `장 ${chapterNum}` : '장 선택');
    const triggerChapterLabel = activeOutlineEntry?.shortLabel ?? activeOutlineEntry?.fullLabel ?? (chapterNum ? `장 ${chapterNum}` : '장 선택');

    useEffect(() => {
        setIsOpen(false);
    }, [chapterNum, verseNum]);

    useEffect(() => {
        if (!isOpen) {
            setDraftChapterNum(chapterNum ?? '');
            setDraftVerseNum(verseNum ?? '');
        }
    }, [chapterNum, isOpen, verseNum]);

    useEffect(() => {
        if (!outline?.groups.length) {
            return;
        }

        if (!activeGroupKey || !outline.groups.some((group) => group.key === activeGroupKey)) {
            setActiveGroupKey(outline.groups[0].key);
        }
    }, [activeGroupKey, outline]);

    useEffect(() => {
        if (!isOpen || !outline?.groups.length || !chapterNum) {
            return;
        }

        const chapterNumber = Number.parseInt(chapterNum, 10);
        const entry = Number.isFinite(chapterNumber) ? outline.chapterLookup[chapterNumber] : undefined;

        if (!entry) {
            return;
        }

        setActiveGroupKey(entry.groupKey);
        setExpandedNodeIds(new Set(entry.ancestorIds));
    }, [chapterNum, isOpen, outline]);

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) {
            return;
        }

        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }

            const panelWidth = Math.min(420, window.innerWidth - 16);
            const left = Math.min(Math.max(rect.left, 8), window.innerWidth - panelWidth - 8);
            const top = rect.bottom + 8;

            setPanelStyle({
                position: 'fixed',
                top: `${Math.round(top)}px`,
                left: `${Math.round(left)}px`,
                width: `${Math.round(panelWidth)}px`,
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (rootRef.current && !rootRef.current.contains(target) && !panelRef.current?.contains(target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const selectChapter = (nextChapterNumber: number) => {
        const chapterKey = String(nextChapterNumber);
        const nextVerseOptions = verseOptionsByChapter[chapterKey] ?? [];
        setDraftChapterNum(chapterKey);
        setDraftVerseNum(nextVerseOptions[0]?.value ?? '');
    };

    const toggleNode = (nodeId: string) => {
        setExpandedNodeIds((current) => {
            const next = new Set(current);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const panel = isOpen ? (
        <div
            ref={panelRef}
            role="dialog"
            aria-label="Context picker"
            style={panelStyle ?? undefined}
            className="z-[60] rounded-[1.75rem] border border-gold-border/12 bg-[linear-gradient(180deg,rgba(255,251,241,0.98)_0%,rgba(252,247,237,0.96)_48%,rgba(245,238,228,0.92)_100%)] p-3.5 shadow-[0_26px_72px_-34px_rgba(0,0,0,0.58)] backdrop-blur-2xl dark:border-dark-border/70 dark:bg-[linear-gradient(180deg,rgba(24,20,15,0.98)_0%,rgba(20,17,13,0.96)_48%,rgba(15,13,10,0.92)_100%)]"
        >
            <div className="mb-3 flex items-center gap-2.5 border-b border-gold-border/12 pb-2.5 dark:border-dark-border/55">
                <span className="rounded-full border border-gold-primary/18 bg-gold-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold-primary dark:border-gold-light/18 dark:bg-gold-light/10 dark:text-gold-light">
                    Context
                </span>
                <span className="flex-1 text-[10px] font-medium tracking-[0.14em] text-text-secondary/75 dark:text-dark-text-secondary/70">
                    {currentChapterLabel} / {currentVerseLabel}
                </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
                {outline?.groups.map((group) => {
                    const isActive = group.key === activeGroupKey;

                    return (
                        <button
                            key={group.key}
                            type="button"
                            onClick={() => {
                                setActiveGroupKey(group.key);
                                setExpandedNodeIds(new Set());
                            }}
                            className={[
                                'rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] transition-all duration-300',
                                isActive
                                    ? 'border-gold-primary/35 bg-gold-primary/10 text-gold-primary shadow-[0_10px_24px_-20px_rgba(0,0,0,0.5)] dark:border-gold-light/30 dark:bg-gold-light/12 dark:text-gold-light'
                                    : 'border-gold-border/12 bg-white/55 text-text-secondary hover:border-gold-border/22 hover:bg-white/78 dark:border-dark-border/55 dark:bg-white/5 dark:text-dark-text-secondary dark:hover:bg-white/8',
                            ].join(' ')}
                        >
                            {group.label}
                        </button>
                    );
                })}
            </div>

            <div className="max-h-[min(56vh,460px)] overflow-y-auto pr-1">
                {activeGroup?.nodes.length ? (
                    <OutlineTree
                        nodes={activeGroup.nodes}
                        expandedNodeIds={expandedNodeIds}
                        onSelectChapter={selectChapter}
                        onToggleNode={toggleNode}
                        activeChapterNumber={activeChapterNumber}
                    />
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-[1.2rem] border border-dashed border-gold-border/14 bg-white/36 text-[10px] font-medium tracking-[0.22em] text-text-secondary/55 dark:border-dark-border/55 dark:bg-white/4 dark:text-dark-text-secondary/55">
                        계층 정보를 불러오는 중
                    </div>
                )}
            </div>

            {draftChapterNum ? (
                <div className="mt-3 border-t border-gold-border/12 pt-3 dark:border-dark-border/55">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-text-secondary/78 dark:text-dark-text-secondary/78">
                            Verse
                        </span>
                        <span className="truncate text-[10px] font-medium tracking-[0.12em] text-text-secondary/70 dark:text-dark-text-secondary/70">
                            {activeOutlineEntry?.fullLabel ?? `Chapter ${draftChapterNum}`}
                        </span>
                    </div>

                    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
                        {draftVerseOptions.map((option) => {
                            const isActive = option.value === draftVerseNum;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setDraftVerseNum(option.value);
                                        onCommitSelection(draftChapterNum, option.value);
                                        setIsOpen(false);
                                    }}
                                    className={[
                                        'rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] transition-all duration-300',
                                        isActive
                                            ? 'border-gold-primary/30 bg-gold-primary/10 text-gold-primary shadow-[0_10px_24px_-20px_rgba(0,0,0,0.45)] dark:border-gold-light/30 dark:bg-gold-light/12 dark:text-gold-light'
                                            : 'border-gold-border/12 bg-white/60 text-text-secondary hover:border-gold-border/22 hover:bg-white/82 dark:border-dark-border/55 dark:bg-white/5 dark:text-dark-text-secondary dark:hover:bg-white/8',
                                    ].join(' ')}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    ) : null;

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold-border/14 bg-[linear-gradient(180deg,rgba(255,251,241,0.92)_0%,rgba(248,241,228,0.82)_100%)] px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-gold-primary shadow-[0_12px_32px_-24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-primary/30 hover:bg-white/90 active:translate-y-0 dark:border-dark-border/70 dark:bg-[linear-gradient(180deg,rgba(28,23,18,0.92)_0%,rgba(20,17,13,0.82)_100%)] dark:text-gold-light dark:hover:bg-white/8"
            >
                <span className="max-w-[18rem] truncate whitespace-nowrap">{`${triggerChapterLabel} / ${currentVerseLabel}`}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen ? createPortal(panel, document.body) : null}
        </div>
    );
};

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { chapterNum, verseNum } = useParams<{ chapterNum?: string; verseNum?: string }>();
    const { chapters } = useYogaData();
    const isVerseView = location.pathname.includes('/chapter/') && location.pathname.includes('/verse/');
    const { isSidebarOpen, isDesktopSidebarOpen } = useUI();
    const [readingSnapshot, setReadingSnapshot] = useState<ReadingDataSnapshot | null>(null);

    const desktopGridColumns = isVerseView ? getDesktopVerseColumns(isDesktopSidebarOpen, false) : undefined;
    const currentChapterNumber = isVerseView && chapterNum ? Number.parseInt(chapterNum, 10) : null;

    useEffect(() => {
        let isActive = true;

        const loadReadingSnapshot = async () => {
            try {
                const response = await fetch('/reading-data.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch reading data: ${response.status}`);
                }

                const snapshot = (await response.json()) as ReadingDataSnapshot;
                if (isActive) {
                    setReadingSnapshot(snapshot);
                }
            } catch (error) {
                console.error('Error loading reading outline:', error);
                if (isActive) {
                    setReadingSnapshot(null);
                }
            }
        };

        void loadReadingSnapshot();

        return () => {
            isActive = false;
        };
    }, []);

    const verseOptionsByChapter = useMemo(
        () =>
            chapters.reduce<Record<string, ContextOption[]>>((acc, chapter) => {
                acc[String(chapter.chapter)] = chapter.sutras.map((sutra, index) => {
                    const verseNumberText = String(sutra.verse ?? Number.parseInt(sutra.id.split('.')[1], 10));
                    const verseNumber = Number.parseInt(verseNumberText, 10);
                    const nextSutra = chapter.sutras[index + 1];
                    const nextVerseNumber = nextSutra
                        ? Number.parseInt(String(nextSutra.verse ?? Number.parseInt(nextSutra.id.split('.')[1], 10)), 10)
                        : null;
                    const label = nextVerseNumber && nextVerseNumber > verseNumber + 1 ? `${verseNumberText}-${nextVerseNumber - 1}` : verseNumberText;

                    return {
                        value: verseNumberText,
                        label: `${label}절`,
                    };
                });

                return acc;
            }, {}),
        [chapters],
    );

    const readingOutline = useMemo(() => (readingSnapshot ? buildReadingOutline(readingSnapshot) : null), [readingSnapshot]);

    const selectionControls =
        isVerseView && currentChapterNumber !== null ? (
            <ContextAccordionPicker
                chapterNum={chapterNum}
                verseNum={verseNum}
                outline={readingOutline}
                verseOptionsByChapter={verseOptionsByChapter}
                onCommitSelection={(nextChapter, nextVerse) => navigate(`/chapter/${nextChapter}/verse/${nextVerse}`)}
            />
        ) : undefined;

    return (
        <AppShell
            header={isVerseView ? <Header title="보리도등론(菩提道燈論)" showSidebarToggle selectionControls={selectionControls} /> : undefined}
            sidebar={isVerseView ? <Sidebar /> : undefined}
            isMobilePanelOpen={isVerseView && isSidebarOpen}
            desktopGridColumns={desktopGridColumns}
            floatingAction={
                !isVerseView ? (
                    <ThemeToggle className="border border-gold-primary/20 bg-white/82 p-3 shadow-xl shadow-black/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold-primary/40 active:scale-90 dark:border-gold-primary/10 dark:bg-[#111]/80 dark:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.6)]" />
                ) : undefined
            }
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full"
                >
                    <Suspense
                        fallback={
                            <div className="flex h-full items-center justify-center bg-transparent">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-primary border-t-transparent" />
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </motion.div>
            </AnimatePresence>
        </AppShell>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<DefaultVerseRedirect />} />
                    <Route path="/chapter/:chapterNum/verse/:verseNum" element={<VerseView />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
