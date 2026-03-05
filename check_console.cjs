const { chromium } = require('playwright');

async function runTest() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    try {
        await page.goto('https://localhost:5173');
        await page.waitForTimeout(3000); // give it time to load and throw error
    } catch (error) {
        console.error("Test Failed:", error.message);
    } finally {
        await browser.close();
    }
}

runTest();
