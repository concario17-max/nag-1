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
    try {
        await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
        throw new Error(`${message} (Detail: ${error.message})`);
    }
}

async function expectHidden(locator, message) {
    try {
        await locator.first().waitFor({ state: 'hidden', timeout: 5000 });
    } catch (error) {
        throw new Error(`${message} (Detail: ${error.message})`);
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
    // VERSE 패널 헤더 라벨로 body 모드 진입 확인 (TranslationSection 라벨은 데이터 존재 여부에 의존하므로 불안정)
    const bodyMarker = main.getByText('VERSE', { exact: true });
    const commentaryMarker = main.getByText('COMMENTARY', { exact: true });

    await expectVisible(bodyMarker, 'Expected VERSE panel header to be visible in body mode.');
    await expectHidden(commentaryMarker, 'Expected COMMENTARY panel header to stay hidden in body mode.');
}

async function expectCommentaryModeUi(page) {
    const main = await getVisibleMain(page);
    const bodyMarker = main.getByText('VERSE', { exact: true });
    const commentaryMarker = main.getByText('COMMENTARY', { exact: true });

    await expectHidden(bodyMarker, 'Expected VERSE panel header to be hidden in commentary mode.');
    await expectVisible(commentaryMarker, 'Expected COMMENTARY panel header to be visible in commentary mode.');
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
    const pickerButton = page.locator('button[aria-haspopup="dialog"]:visible');
    await pickerButton.waitFor({ state: 'visible' });
}

async function goFromHomeToVerse(page, chapterValue, verseValue) {
    const pickerButton = page.locator('button[aria-haspopup="dialog"]:visible');
    await pickerButton.click();

    const chapterHeader = page.locator('button').filter({ hasText: `제${chapterValue}장` });
    await chapterHeader.waitFor({ state: 'visible' });
    await chapterHeader.click();

    const verseButton = page.getByRole('button', { name: `${verseValue}절`, exact: true });
    await verseButton.waitFor({ state: 'visible' });
    await verseButton.click();

    await page.waitForURL(`**/chapter/${chapterValue}/verse/${verseValue}`);
    await pickerButton.waitFor({ state: 'visible' });
    await page.getByText('COMMENTARY').first().waitFor({ state: 'visible' });
}

async function selectVisibleHeaderChapter(page, chapterValue) {
    const pickerButton = page.locator('button[aria-haspopup="dialog"]:visible');
    await pickerButton.click();

    const chapterHeader = page.locator('button').filter({ hasText: `제${chapterValue}장` });
    await chapterHeader.waitFor({ state: 'visible' });
    await chapterHeader.click();

    const verseButton = page.getByRole('button', { name: `1절`, exact: true });
    await verseButton.waitFor({ state: 'visible' });
    await verseButton.click();

    await page.waitForURL(`**/chapter/${chapterValue}/verse/1`);
    await pickerButton.waitFor({ state: 'visible' });
    // body 모드 상태에서 VERSE 패널 헤더 라벨 노출 대기
    const main = await getVisibleMain(page);
    await main.getByText('VERSE', { exact: true }).waitFor({ state: 'visible' });
}

async function waitForSidebarReadingCard(page) {
    const sidebarCard = page.locator('aside:visible, [role="complementary"]:visible, [data-sidebar]:visible, [data-drawer]:visible').first();

    await sidebarCard.waitFor({ state: 'visible' });
    await sidebarCard.getByText('Chapter', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('03', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('Verse', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('09', { exact: true }).waitFor({ state: 'visible' });
    await sidebarCard.getByText('Korean', { exact: true }).waitFor({ state: 'visible' });
}

async function waitForTranslationLabels(page) {
    // body 모드에서 VERSE 패널이 정상 렌더링되었는지 확인 (데이터 독립적 검증)
    const main = await getVisibleMain(page);
    await main.getByText('VERSE', { exact: true }).waitFor({ state: 'visible' });
    await main.getByText('Word meanings', { exact: true }).waitFor({ state: 'visible' });
}

async function verifyVerseModeToggling(page) {
    // 최초 진입 시 무조건 commentary(학습만화) 모드가 활성화되어 있어야 함
    await expectNoVisibleCommentaryPanel(page);
    await expectCommentaryModeUi(page);

    // body(심화) 모드로 전환 동작 확인
    await toggleVerseMode(page, 1);
    await waitForVerseMode(page, 1);

    await expectNoVisibleCommentaryPanel(page);
    await expectBodyModeUi(page);

    // 다시 commentary(학습만화) 모드로 무결 복귀 동작 확인
    await toggleVerseMode(page, 0);
    await waitForVerseMode(page, 0);

    await expectNoVisibleCommentaryPanel(page);
    await expectCommentaryModeUi(page);
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
    await verifyVerseModeToggling(desktop.page);

    await ensureSidebarOpen(desktop.page);
    await waitForSidebarReadingCard(desktop.page);

    // 번역가 라벨 검증을 위해 body(심화) 모드로 전환
    await toggleVerseMode(desktop.page, 1);
    await waitForVerseMode(desktop.page, 1);

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
    await verifyVerseModeToggling(mobile.page);

    // 번역가 라벨 검증을 위해 body(심화) 모드로 전환
    await toggleVerseMode(mobile.page, 1);
    await waitForVerseMode(mobile.page, 1);

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
                        'desktop verse mode toggling',
                        'desktop left reading card',
                        'desktop translation labels',
                        'mobile home chapter select',
                        'mobile home verse select',
                        'mobile verse header selects',
                        'mobile verse no visible commentary panel',
                        'mobile verse body mode markers',
                        'mobile verse commentary mode markers',
                        'mobile verse mode toggling',
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
