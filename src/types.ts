export interface WordMeaningEntry {
    word: string;
    meaning: string;
}

export type WordMeaning = WordMeaningEntry[];

export interface VerseWord {
    s: string;
    m: string;
}

export interface Grammar {
    [key: string]: string;
}

export interface Token {
    id: string;
    surface: string;
    lemma: string;
    pos: string;
    grammar: Grammar;
    meaning_ko: string;
    meaning_ko_short: string;
    etymology_ko?: string;
}

export interface CompoundToken {
    id: string;
    surface: string;
    lemma: string;
    pos: string;
    grammar: Grammar;
    meaning_ko: string;
}

export interface YogaSutra {
    id: string; // e.g., "1.1" 또는 "codex-i.1-1"
    chapter?: number;
    verse?: number;
    iast?: string;
    pronunciation: string;
    pronunciation_kr: string;
    sanskrit: string;
    commentary_ko?: string;
    translation_ham?: string;
    translation_gil?: string;
    translation_jimong?: string;
    translation_suk?: string;
    words?: VerseWord[];
    word_meanings?: WordMeaning;
    tokens?: Token[];
    compound_tokens_original?: CompoundToken[];
}

export interface ChapterMeta {
    chapter: number;
    name_korean: string;
    name_english: string;
    description: string;
    sutraCount: number;
    indexId?: string;
    workId?: string;
    sourceTitle?: string | null;
    chapterName?: string;
    title?: string;
}

export interface YogaChapter {
    chapter: number;
    meta: ChapterMeta;
    sutras: YogaSutra[];
}

export interface ReadingSnapshotText {
    tibetan: string;
    pronunciation: string;
    english: string;
    korean: string;
}

export interface ReadingSnapshotParagraph {
    id: string;
    title: string;
    paragraphNumber: number;
    chapterTitle: string;
    text: ReadingSnapshotText;
}

export interface ReadingSnapshotChapter {
    id: string;
    chapterName: string;
    title: string;
    paragraphs: ReadingSnapshotParagraph[];
}

export type ReadingSnapshot = ReadingSnapshotChapter[];

// Raw Codex Data Types for loader mapping
export interface IndexWorkEntry {
    indexId: string;
    workId: string;
    chapterName: string;
    title: string;
    sourceTitle: string | null;
}

export interface IndexGroup {
    id: string;
    title: string;
    works: IndexWorkEntry[];
}

export interface CodexRangeEndpoint {
    page: number;
    line: number;
}

export interface CodexRange {
    start: CodexRangeEndpoint;
    end: CodexRangeEndpoint;
}

export interface CodexDataSection {
    title: string;
    subtitle?: string;
    heading: string;
    rangeLabel: string;
    range: CodexRange;
    english: string;
    coptic: string;
}

export interface CodexDataWork {
    workId: string;
    chapterName: string;
    title: string;
    sourceTitle: string | null;
    sections: CodexDataSection[];
}

export interface RawCodexData {
    toc: Array<{ workLabel: string; sourceTitle: string }>;
    works: CodexDataWork[];
}
