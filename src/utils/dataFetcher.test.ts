import { beforeEach, describe, expect, it } from 'vitest';
import { fetchYogaData, resetCache } from './dataFetcher';

describe('fetchYogaData', () => {
    beforeEach(() => {
        resetCache();
    });

    it('loads and maps the Coptic reading snapshot correctly from local data', async () => {
        const data = await fetchYogaData();

        expect(Object.keys(data).length).toBe(68);

        const firstChapter = data[1];
        expect(firstChapter).toBeDefined();
        expect(firstChapter.chapter).toBe(1);
        expect(firstChapter.meta.chapterName).toBe('Prayer of Apostle Paul');
        expect(firstChapter.meta.title).toBe('Codex I - Prayer of Apostle Paul');
        expect(firstChapter.sutras.length).toBe(1);

        const firstSutra = firstChapter.sutras[0];
        expect(firstSutra.verse).toBe(1);
        expect(firstSutra.sanskrit).toContain('[ⲡⲉⲕⲟⲩ]ⲁⲉⲓⲛ');
        expect(firstSutra.translation_ham).toContain('Grant me your [mercy]');
        expect(firstSutra.commentary_ko).toContain('1, 3-2, 10');
    });
});
