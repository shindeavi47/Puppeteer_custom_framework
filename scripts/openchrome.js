import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--start-maximized'],
  defaultViewport: null
});

const page = await browser.newPage();
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });

const title = await page.title();
console.log(`Page title: ${title}`);

await browser.close();