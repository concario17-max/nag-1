import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4174';

async function getVisibleHeaderButtonIndex(page, title) {
    return page.locator('header button').evaluateAll((elements, targetTitle) => {
        return elements.findIndex((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            const isVisible = Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
            return isVisible && element.getAttribute('title') === targetTitle;
        });
    }, title);
}

async function clickVisibleHeaderButton(page, title) {
    const index = await getVisibleHeaderButtonIndex(page, title);

    if (index < 0) {
        throw new Error(`Missing visible header button: ${title}`);
    }

    await page.locator('header button').nth(index).click({ force: true });
}

async function getVerseModeToggleButtons(page) {
    return page.locator('header button[aria-pressed]:visible');
}

async function getVisibleMain(page) {
    return page.locator('main#main-scroll-container');
}

async function expectVisible(locator, message) {
    if (!(await locator.first().isVisible())) {
        throw new Error(message);
    }
}

async function expectHidden(locator, message) {
    if (await locator.first().isVisible()) {
        throw new Error(message);
    }
}

async function expectSingleAudio(page, label) {
    const audioCount = await page.locator('audio').count();

    if (audioCount !== 1) {
        throw new Error(`Expected a single audio element ${label}, found ${audioCount}.`);
    }
}

async function expectNoVisibleCommentaryPanel(page) {
    const visibleCommentaryPanels = page.locator('aside:visible').filter({ hasText: 'Commentary' });
    const panelCount = await visibleCommentaryPanels.count();

    if (panelCount !== 0) {
        throw new Error(`Expected no visible commentary side panel on verse routes, found ${panelCount}.`);
    }

    const visibleCommentaryHeaderButtons = page.locator('header button:visible').filter({ hasText: 'Commentary' });
    const buttonCount = await visibleCommentaryHeaderButtons.count();

    if (buttonCount !== 0) {
        throw new Error(`Expected no visible commentary header button on verse routes, found ${buttonCount}.`);
    }
}

async function expectBodyModeUi(page) {
    const main = await getVisibleMain(page);
    const bodyMarker = main.locator('section').getByText('Word-by-word', { exact: true });
    const commentaryMarker = main.locator('section').getByText('3.9', { exact: true });

    await expectVisible(bodyMarker, 'Expected Word-by-word to be visible in body mode.');

    const bodySectionHidden = await main.locator('section').first().evaluate((element) => {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        return element.classList.contains('hidden');
    });

    if (bodySectionHidden) {
        throw new Error('Expected the verse body section to stay visible in body mode.');
    }

    await expectHidden(commentaryMarker, 'Expected commentary marker 3.9 to stay hidden in body mode.');
}

async function expectCommentaryModeUi(page) {
    const main = await getVisibleMain(page);
    const bodyMarker = main.locator('section').getByText('Word-by-word', { exact: true });
    const commentaryMarker = main.locator('section').getByText('3.9', { exact: true });

    await expectHidden(bodyMarker, 'Expected Word-by-word to be hidden in commentary mode.');

    const bodySectionHidden = await main.locator('section').first().evaluate((element) => {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        return element.classList.contains('hidden');
    });

    if (!bodySectionHidden) {
        throw new Error('Expected the verse body section to be hidden in commentary mode.');
    }

    await expectVisible(commentaryMarker, 'Expected commentary marker 3.9 to be visible in commentary mode.');
}

async function toggleVerseMode(page, modeIndex) {
    const buttons = await getVerseModeToggleButtons(page);
    await buttons.nth(modeIndex).click({ force: true });
}

async function waitForVerseMode(page, modeIndex) {
    await page.waitForFunction((targetIndex) => {
        const buttons = Array.from(document.querySelectorAll('header button[aria-pressed]')).filter((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        });
        const targetButton = buttons[targetIndex];

        return targetButton instanceof HTMLElement && targetButton.getAttribute('aria-pressed') === 'true';
    }, modeIndex);
}

async function ensureSidebarOpen(page) {
    const visibleSidebar = page.locator('aside:visible, [role="complementary"]:visible, [data-sidebar]:visible, [data-drawer]:visible');

    if ((await visibleSidebar.count()) === 0) {
        await clickVisibleHeaderButton(page, 'Open chapter sidebar');
    }
}

async function waitForHomeSelects(page) {
    const comboboxes = page.getByRole('combobox');
    await comboboxes.nth(0).waitFor({ state: 'visible' });
    await comboboxes.nth(1).waitFor({ state: 'visible' });
}

async function getVisibleElementIndex(page, selector) {
    return page.locator(selector).evaluateAll((elements) => {
        return elements.findIndex((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        });
    });
}

async function goFromHomeToVerse(page, chapterValue, verseValue) {
    const comboboxes = page.getByRole('combobox');
    const chapterSelect = comboboxes.nth(0);
    const verseSelect = comboboxes.nth(1);

    await chapterSelect.selectOption(chapterValue);
    await page.waitForFunction((targetVerse) => {
        const verseSelectElement = document.querySelectorAll('select')[1];

        return Boolean(
            verseSelectElement &&
                !verseSelectElement.hasAttribute('disabled') &&
                verseSelectElement.querySelector(`option[value="${targetVerse}"]`),
        );
    }, verseValue);
    await verseSelect.selectOption(verseValue);
    await page.waitForURL(`**/chapter/${chapterValue}/verse/${verseValue}`);
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('#chapter-picker')).some((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }),
    );
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('#verse-picker')).some((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }),
    );
}

async function selectVisibleHeaderChapter(page, chapterValue) {
    const chapterPickerIndex = await getVisibleElementIndex(page, '#chapter-picker');

    if (chapterPickerIndex < 0) {
        throw new Error('Missing visible chapter picker.');
    }

    await page.locator('#chapter-picker').nth(chapterPickerIndex).selectOption(chapterValue);
    await page.waitForURL(`**/chapter/${chapterValue}/verse/1`);
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('#chapter-picker')).some((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }),
    );
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('#verse-picker')).some((element) => {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }),
    );
}

async function waitForSidebarReadingCard(page) {
    const sidebarCard = page.locator('aside:visible, [role="complementary"]:visible, [data-sidebar]:visible, [data-drawer]:visible').first();

    await sidebarCard.waitFor({ state: 'visible' });
    await sidebarCard.getByText('Chapter 3', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('Sutra 9', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('Sanskrit', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('English', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('Korean', { exact: true }).waitFor({ state: 'visible' });
}

async function waitForTranslationLabels(page) {
    await page.locator('section h2').nth(0).waitFor({ state: 'visible' });
    await page.locator('section h2').nth(1).waitFor({ state: 'visible' });
    await page.locator('section h3').nth(0).waitFor({ state: 'visible' });
    await page.locator('section h3').nth(1).waitFor({ state: 'visible' });
}

async function verifyVerseModePersistence(page) {
    await expectNoVisibleCommentaryPanel(page);
    await expectBodyModeUi(page);
    await expectSingleAudio(page, 'before switching modes');

    await toggleVerseMode(page, 1);
    await waitForVerseMode(page, 1);

    await expectNoVisibleCommentaryPanel(page);
    await expectCommentaryModeUi(page);
    await expectSingleAudio(page, 'after switching to commentary mode');

    const storedMode = await page.evaluate(() => localStorage.getItem('yoga-verse-content-mode'));
    if (storedMode !== 'commentary') {
        throw new Error(`Expected localStorage to store commentary mode, found ${storedMode ?? 'null'}.`);
    }

    await page.reload({ waitUntil: 'networkidle' });
    await waitForVerseMode(page, 1);
    await expectNoVisibleCommentaryPanel(page);
    await expectCommentaryModeUi(page);
    await expectSingleAudio(page, 'after reload in commentary mode');

    await toggleVerseMode(page, 0);
    await waitForVerseMode(page, 0);
    await expectNoVisibleCommentaryPanel(page);
    await expectBodyModeUi(page);
    await expectSingleAudio(page, 'after returning to body mode');
}

async function createPage(browser, viewport, logs, errors) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    page.on('console', (message) => {
        if (message.type() === 'error') {
            logs.push(`${viewport.width}px console: ${message.text()}`);
        }
    });

    page.on('pageerror', (error) => {
        errors.push(`${viewport.width}px pageerror: ${error.message}`);
    });

    await page.addInitScript(() => {
        if (sessionStorage.getItem('__smoke-storage-reset') === 'true') {
            return;
        }

        localStorage.removeItem('yoga-verse-content-mode');
        localStorage.removeItem('yoga-desktop-right-panel');
        localStorage.removeItem('yoga-desktop-sidebar');
        sessionStorage.setItem('__smoke-storage-reset', 'true');
    });

    return { context, page };
}

async function runDesktopFlow(browser, logs, errors) {
    const desktop = await createPage(browser, { width: 1440, height: 1000 }, logs, errors);

    await desktop.page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await waitForHomeSelects(desktop.page);
    await goFromHomeToVerse(desktop.page, '3', '9');
    await waitForHomeSelects(desktop.page);
    await verifyVerseModePersistence(desktop.page);

    await ensureSidebarOpen(desktop.page);
    await waitForSidebarReadingCard(desktop.page);

    await selectVisibleHeaderChapter(desktop.page, '1');
    await waitForTranslationLabels(desktop.page);

    await desktop.context.close();
}

async function runMobileFlow(browser, logs, errors) {
    const mobile = await createPage(browser, { width: 390, height: 844 }, logs, errors);

    await mobile.page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await waitForHomeSelects(mobile.page);
    await goFromHomeToVerse(mobile.page, '3', '9');
    await waitForHomeSelects(mobile.page);
    await verifyVerseModePersistence(mobile.page);

    await ensureSidebarOpen(mobile.page);
    await waitForSidebarReadingCard(mobile.page);

    await selectVisibleHeaderChapter(mobile.page, '1');
    await waitForTranslationLabels(mobile.page);

    await mobile.context.close();
}

async function run() {
    const logs = [];
    const errors = [];
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });

    try {
        await runDesktopFlow(browser, logs, errors);
        await runMobileFlow(browser, logs, errors);

        if (logs.length || errors.length) {
            throw new Error(JSON.stringify({ logs, errors }, null, 2));
        }

        console.log(
            JSON.stringify(
                {
                    ok: true,
                    checked: [
                        'desktop home chapter select',
                        'desktop home verse select',
                        'desktop verse header selects',
                        'desktop verse no visible commentary panel',
                        'desktop verse body mode markers',
                        'desktop verse commentary mode markers',
                        'desktop verse audio persists through toggles',
                        'desktop verse mode persistence',
                        'desktop left reading card',
                        'desktop translation labels',
                        'mobile home chapter select',
                        'mobile home verse select',
                        'mobile verse header selects',
                        'mobile verse no visible commentary panel',
                        'mobile verse body mode markers',
                        'mobile verse commentary mode markers',
                        'mobile verse audio persists through toggles',
                        'mobile verse mode persistence',
                        'mobile left reading card',
                        'mobile translation labels',
                    ],
                    baseUrl,
                },
                null,
                2,
            ),
        );
    } finally {
        await browser.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
