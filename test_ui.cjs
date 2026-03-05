const { chromium } = require('playwright');
const axios = require('axios');

async function runTest() {
    console.log("Starting Key Ceremony Frontend Test...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    try {
        console.log("Fetching key shares from backend API...");
        const res = await axios.get('http://localhost:5000/api/admin/election/key-shares');
        const shares = res.data.shares;

        console.log("Navigating to Tally Page on Admin Panel (Frontend port 5173)...");
        await page.goto('http://localhost:5173/tally'); // Adjust route if needed

        console.log("Waiting for the Decryption Ceremony panel to load...");
        await page.waitForSelector('h3:has-text("Decryption Ceremony")');

        console.log("Filling out Official shares...");
        const inputA = await page.$('input[name="share1"]');
        const inputB = await page.$('input[name="share2"]');
        const inputC = await page.$('input[name="share3"]');

        if (!inputA || !inputB || !inputC) {
            throw new Error("Could not find all 3 share input fields.");
        }

        await inputA.fill(shares['Official A']);
        await inputB.fill(shares['Official B']);
        await inputC.fill(shares['Official C']);

        console.log("Clicking Authenticate & Reconstruct Key button...");
        await page.click('button:has-text("Authenticate & Reconstruct Key")');

        console.log("Waiting for reconstruction success message...");
        await page.waitForSelector('text=Success: Private Key Reconstructed Validate ✓', { timeout: 5000 });
        console.log("✅ Key reconstructed successfully!");

        console.log("Verifying Tallying Control Panel is now visible...");
        await page.waitForSelector('h3:has-text("Tallying Control Panel")');
        console.log("✅ Tallying Control Panel is visible.");

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
}

runTest();
