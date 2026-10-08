const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function takeScreenshots() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    
    const pages = [
        { name: 'cayenne_3d', url: 'http://localhost:3000/models/Cayenne' }
    ];

    for (let p of pages) {
        console.log(`Taking screenshot of ${p.name}...`);
        await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for the 3D model to load
        await new Promise(r => setTimeout(r, 8000)); // slightly longer wait to ensure model is fully loaded
        
        await page.screenshot({ 
            path: path.join(screenshotDir, `${p.name}.png`),
            fullPage: false 
        });
        
        if (p.name.includes('3d')) {
            await page.evaluate(() => {
                const scrollContainer = document.getElementById('scroll-container') || window;
                scrollContainer.scrollBy(0, window.innerHeight);
            });
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({ 
                path: path.join(screenshotDir, `${p.name}_scrolled.png`),
                fullPage: false 
            });
        }
    }

    console.log('Screenshots completed!');
    await browser.close();
}

takeScreenshots().catch(console.error);
