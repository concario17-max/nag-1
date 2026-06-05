import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchYogaData, resetCache } from './dataFetcher';

describe('fetchYogaData', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        resetCache();
    });

    it('loads and maps the reading snapshot', async () => {
        const snapshot = [
            {
                id: '1',
                chapterName: '1장 죽음',
                title: '제1장 죽음',
                paragraphs: [
                    {
                        id: '1.1',
                        title: 'Paragraph 1',
                        paragraphNumber: 1,
                        chapterTitle: '제1장 죽음',
                        text: {
                            tibetan: 'Tibetan text',
                            pronunciation: '',
                            english: 'English text',
                            korean: 'Korean text',
                        },
                    },
                ],
            },
        ];

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => `\ufeff${JSON.stringify(snapshot)}`,
        });

        const data = await fetchYogaData();

        expect(global.fetch).toHaveBeenCalledWith('/reading-snapshot.json');
        expect(data[1]).toBeDefined();
        expect(data[1].meta.name_korean).toBe('1장 죽음');
        expect(data[1].sutras[0].sanskrit).toBe('Tibetan text');
        expect(data[1].sutras[0].translation_en).toBe('English text');
        expect(data[1].sutras[0].translation_ham).toBe('Korean text');
        expect(data[1].sutras[0].commentary_en).toMatch(/\S/);
    });

    it('throws on fetch failure', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
        });

        await expect(fetchYogaData()).rejects.toThrow('Failed to fetch reading snapshot: 404');
    });
});
