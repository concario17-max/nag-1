import { chapter1Commentary, type CommentaryBlock } from '../data/chapter1Commentary';
import { chapter2Commentary } from '../data/chapter2Commentary';
import { chapter3Commentary } from '../data/chapter3Commentary';
import { chapter4Commentary } from '../data/chapter4Commentary';
import { ReadingSnapshot, YogaChapter, YogaSutra } from '../types';

let cachedData: Record<number, YogaChapter> | null = null;
let pendingRequest: Promise<Record<number, YogaChapter>> | null = null;

const stripBom = (value: string) => (value.charCodeAt(0) === 0xfeff ? value.slice(1) : value);

const formatCommentaryTable = (table: CommentaryBlock['table']) => {
    if (!table || table.headers.length === 0) {
        return '';
    }

    const header = `| ${table.headers.map((cell) => cell.trim()).join(' | ')} |`;
    const separator = `| ${table.headers.map(() => '---').join(' | ')} |`;
    const rows = table.rows.map((row) => `| ${table.headers.map((_, index) => row[index]?.trim() ?? '').join(' | ')} |`);

    return [header, separator, ...rows].join('\n');
};

const serializeCommentaryBlocks = (blocks?: CommentaryBlock[]) => {
    if (!blocks?.length) {
        return '';
    }

    return blocks
        .map((block, index) => {
            const sections: string[] = [];
            const headingLevel = index === 0 ? '#' : '##';

            if (block.title?.trim()) {
                sections.push(`${headingLevel} ${block.title.trim()}`);
            }

            if (block.paragraphs?.length) {
                sections.push(...block.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean));
            }

            if (block.bullets?.length) {
                sections.push(block.bullets.map((bullet) => `- ${bullet.trim()}`).join('\n'));
            }

            if (block.table) {
                sections.push(formatCommentaryTable(block.table));
            }

            return sections.join('\n\n');
        })
        .filter(Boolean)
        .join('\n\n');
};

const commentaryByChapter: Record<number, Record<string, CommentaryBlock[]>> = {
    1: chapter1Commentary,
    2: chapter2Commentary,
    3: chapter3Commentary,
    4: chapter4Commentary,
};

const getCommentaryBlocks = (chapterNum: number, paragraphId: string, paragraphNumber: number) => {
    const chapterCommentary = commentaryByChapter[chapterNum];
    if (!chapterCommentary) {
        return undefined;
    }

    const fallbackKeys = [paragraphId, String(paragraphNumber), `${chapterNum}.${paragraphNumber}`];
    for (const key of fallbackKeys) {
        const blocks = chapterCommentary[key];
        if (blocks?.length) {
            return blocks;
        }
    }

    return undefined;
};

const toNumber = (value: string | number | undefined, fallback = 0) => {
    const numeric = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeParagraph = (chapterNum: number, paragraph: ReadingSnapshot[number]['paragraphs'][number]): YogaSutra => {
    const sourceText = paragraph.text ?? { tibetan: '', pronunciation: '', english: '', korean: '' };
    const chapterCommentary = getCommentaryBlocks(chapterNum, paragraph.id, paragraph.paragraphNumber);

    return {
        id: paragraph.id,
        chapter: chapterNum,
        verse: paragraph.paragraphNumber,
        sanskrit: sourceText.tibetan ?? '',
        iast: sourceText.pronunciation ?? '',
        pronunciation: sourceText.pronunciation ?? '',
        pronunciation_kr: '',
        translation_en: sourceText.english || undefined,
        translation_ham: sourceText.korean || undefined,
        commentary_en: serializeCommentaryBlocks(chapterCommentary) || undefined,
        '2.english': sourceText.english || undefined,
        '3.korean-1': sourceText.korean || undefined,
    };
};

const normalizeChapter = (chapter: ReadingSnapshot[number]): YogaChapter => {
    const chapterNum = toNumber(chapter.id);
    const sutras = chapter.paragraphs.map((paragraph) => normalizeParagraph(chapterNum, paragraph));

    return {
        chapter: chapterNum,
        meta: {
            chapter: chapterNum,
            name_korean: chapter.chapterName || `Chapter ${chapterNum}`,
            name_english: chapter.title || chapter.chapterName || `Chapter ${chapterNum}`,
            description: chapter.title || chapter.chapterName || '',
            sutraCount: sutras.length,
        },
        sutras,
    };
};

export const resetCache = () => {
    cachedData = null;
    pendingRequest = null;
};

export const fetchYogaData = async (): Promise<Record<number, YogaChapter>> => {
    if (cachedData) {
        return cachedData;
    }

    if (pendingRequest) {
        return pendingRequest;
    }

    pendingRequest = (async () => {
        try {
            const response = await fetch('/reading-snapshot.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch reading snapshot: ${response.status}`);
            }

            const snapshot = JSON.parse(stripBom(await response.text())) as ReadingSnapshot;
            const structuredData = snapshot.reduce<Record<number, YogaChapter>>((acc, chapter) => {
                acc[toNumber(chapter.id)] = normalizeChapter(chapter);
                return acc;
            }, {});

            cachedData = structuredData;
            return structuredData;
        } catch (error) {
            console.error('Error fetching reading snapshot:', error);
            throw error instanceof Error ? error : new Error('Unknown reading snapshot fetch failure');
        } finally {
            pendingRequest = null;
        }
    })();

    return pendingRequest;
};
