import { codexIndex } from '../data/codexIndex';
import { codexData } from '../data/codexData';
import { YogaChapter, YogaSutra, CodexDataWork } from '../types';

let cachedData: Record<number, YogaChapter> | null = null;
let pendingRequest: Promise<Record<number, YogaChapter>> | null = null;

const buildChapters = (): Record<number, YogaChapter> => {
    const chaptersMap: Record<number, YogaChapter> = {};
    const worksList = codexData.works;
    const worksMap = new Map<string, CodexDataWork>();

    for (const w of worksList) {
        worksMap.set(w.workId, w);
    }

    let chapterCounter = 1;

    for (const group of codexIndex) {
        for (const entry of group.works) {
            const matchedWork = worksMap.get(entry.workId);
            const sutras: YogaSutra[] = [];
            const currentChapterNum = chapterCounter;

            if (matchedWork && matchedWork.sections) {
                matchedWork.sections.forEach((section, index) => {
                    sutras.push({
                        id: `${entry.workId}.${index + 1}`,
                        chapter: currentChapterNum,
                        verse: index + 1,
                        sanskrit: section.coptic,
                        pronunciation: '',
                        pronunciation_kr: '',
                        translation_ham: section.english,
                        commentary_ko: `# ${section.title || section.heading}\n\n**Range:** ${section.rangeLabel}\n\n${section.english}`,
                    });
                });
            }

            chaptersMap[currentChapterNum] = {
                chapter: currentChapterNum,
                meta: {
                    chapter: currentChapterNum,
                    indexId: entry.indexId,
                    workId: entry.workId,
                    chapterName: entry.chapterName,
                    title: entry.title,
                    sourceTitle: entry.sourceTitle,
                    description: entry.sourceTitle || entry.title,
                    name_korean: entry.chapterName,
                    name_english: entry.title,
                    sutraCount: sutras.length,
                },
                sutras,
            };

            chapterCounter += 1;
        }
    }

    return chaptersMap;
};

export const resetCache = (): void => {
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

    pendingRequest = (async (): Promise<Record<number, YogaChapter>> => {
        try {
            const structuredData = buildChapters();
            cachedData = structuredData;
            return structuredData;
        } finally {
            pendingRequest = null;
        }
    })();

    return pendingRequest;
};
