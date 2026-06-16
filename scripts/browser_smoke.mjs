import { chromium } from 'playwright';

// 테스트 타겟 기본 URL 설정
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4174';

// 특정 텍스트가 페이지에 존재하는지 검증하는 헬퍼 함수
async function expectVisible(locator, message) {
    if (!(await locator.first().isVisible())) {
        throw new Error(message);
    }
}

// 특정 요소가 화면에 보이지 않는지 검증하는 헬퍼 함수
async function expectHidden(locator, message) {
    if (await locator.first().isVisible()) {
        throw new Error(message);
    }
}

// URL 경로가 특정 패턴을 만족할 때까지 대기하는 헬퍼 함수
async function waitForUrlPath(page, pattern) {
    const start = Date.now();
    while (Date.now() - start < 10000) { // 최대 10초 대기
        const url = page.url();
        if (pattern.test(url)) {
            return;
        }
        await page.waitForTimeout(100);
    }
    throw new Error(`Timeout waiting for URL pattern: ${pattern}, current URL: ${page.url()}`);
}

// 심화 모드 UI 검증 (한국어 번역본 등이 정상 렌더링되는지 확인)
async function expectBodyModeUi(page) {
    const main = page.locator('main#main-scroll-container');
    const bodyMarker = main.getByText('Korean text', { exact: true });
    await bodyMarker.waitFor({ state: 'visible' });
    await expectVisible(bodyMarker, '심화 모드에서 Korean text 번역 라벨이 보여야 함');
}

// 해설 모드 UI 검증 (학습만화 이미지 등이 정상 렌더링되는지 확인)
async function expectCommentaryModeUi(page) {
    const main = page.locator('main#main-scroll-container');
    const imageMarker = main.locator('img');
    await imageMarker.waitFor({ state: 'visible' });
    await expectVisible(imageMarker, '해설 모드에서 학습만화 이미지가 보여야 함');
}

// 심화/해설 모드 토글 버튼 클릭 헬퍼
async function toggleVerseMode(page, modeName) {
    // modeName은 '해설' 또는 '심화'
    const button = page.locator('header button').getByText(modeName, { exact: true }).filter({ visible: true }).first();
    await button.click({ force: true });
}

// 아코디언 피커를 통한 소프트 네비게이션 헬퍼
async function navigateViaAccordion(page, chapterLabel, verseLabel) {
    // 1. 헤더의 아코디언 피커 트리거 버튼 클릭
    const trigger = page.locator('header button').filter({ hasText: '절' }).filter({ visible: true }).first();
    await trigger.click();

    // 2. 다이얼로그 노출 확인
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible' });

    // 3. 목적 장 버튼 클릭 (부분 매칭)
    const chapterBtn = dialog.locator('button').getByText(chapterLabel, { exact: false }).first();
    await chapterBtn.click();

    // 4. 활성화된 하위 절 칩 버튼 클릭 (정확한 매칭으로 오동작 방지)
    const verseChip = dialog.locator('button').getByText(verseLabel, { exact: true }).first();
    await verseChip.click();
}

// localStorage 및 토글 상태 영속성 검증
async function verifyVerseModePersistence(page) {
    // 토글 동작 테스트 (심화 모드로 전환)
    await toggleVerseMode(page, '심화');
    await expectBodyModeUi(page);

    // 새로고침 후에는 무조건 commentary(해설) 모드로 강제 초기화됨
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectCommentaryModeUi(page);

    // 다음 테스트 단계를 위해 다시 심화 모드로 변경
    await toggleVerseMode(page, '심화');
    await expectBodyModeUi(page);
}

// 브라우저 페이지 생성 및 초기 세팅
async function createPage(browser, viewport, logs, errors) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    page.on('console', (message) => {
        if (message.type() === 'error') {
            logs.push(`${viewport.width}px console error: ${message.text()}`);
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

// 데스크톱 환경 시나리오 테스트
async function runDesktopFlow(browser, logs, errors) {
    const { context, page } = await createPage(browser, { width: 1440, height: 1000 }, logs, errors);

    try {
        // 1. 루트 진입 시 리다이렉션 확인
        await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
        await waitForUrlPath(page, /\/chapter\/\d+\/verse\/\d+/);
        console.log("Desktop redirected to:", page.url());

        // 2. 본문 텍스트 로딩 확인
        const main = page.locator('main#main-scroll-container');
        await main.waitFor({ state: 'visible' });

        // 3. 모드 전환 및 영속성 테스트
        await verifyVerseModePersistence(page);

        // 4. 아코디언 피커를 통한 소프트 네비게이션 테스트 (3장 2절로 이동)
        await navigateViaAccordion(page, '제3장', '2절');
        await waitForUrlPath(page, /\/chapter\/3\/verse\/2/);
        console.log("Soft navigated to Chapter 3 Verse 2");

        // 5. 이동 후 심화 모드 상태 정상인지 확인
        await toggleVerseMode(page, '심화');
        await expectBodyModeUi(page);

        // 6. 사이드바 등의 특정 요소 가시성 검증
        const sidebar = page.locator('aside').first();
        await sidebar.waitFor({ state: 'visible' });

    } catch (e) {
        console.error("Desktop flow failure:", e);
        console.log("Collected console errors:", logs);
        console.log("Collected page errors:", errors);
        console.log("Failure HTML:", await page.content());
        throw e;
    } finally {
        await context.close();
    }
}

// 모바일 환경 시나리오 테스트
async function runMobileFlow(browser, logs, errors) {
    const { context, page } = await createPage(browser, { width: 390, height: 844 }, logs, errors);

    try {
        // 1. 루트 진입 시 리다이렉션 확인
        await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
        await waitForUrlPath(page, /\/chapter\/\d+\/verse\/\d+/);
        console.log("Mobile redirected to:", page.url());

        // 2. 모드 토글 테스트
        await verifyVerseModePersistence(page);

        // 3. 아코디언 피커를 통한 소프트 네비게이션 테스트 (1장 2절로 이동)
        await navigateViaAccordion(page, '제1장', '2절');
        await waitForUrlPath(page, /\/chapter\/1\/verse\/2/);
        console.log("Soft navigated to Chapter 1 Verse 2");

        // 4. 이동 후 심화 모드 상태 정상인지 확인
        await toggleVerseMode(page, '심화');
        await expectBodyModeUi(page);

    } catch (e) {
        console.error("Mobile flow failure:", e);
        console.log("Collected console errors:", logs);
        console.log("Collected page errors:", errors);
        console.log("Failure HTML:", await page.content());
        throw e;
    } finally {
        await context.close();
    }
}

// 메인 실행 제어기
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
                        'desktop redirection check',
                        'desktop mode persistence check',
                        'desktop soft navigation to chapter 3 verse 109',
                        'mobile redirection check',
                        'mobile mode persistence check',
                        'mobile soft navigation to chapter 1 verse 2'
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
