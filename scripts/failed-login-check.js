import puppeteer from 'puppeteer';
import { performElementAction } from '../pages/page-actions.js';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--start-maximized'],
  defaultViewport: null
});

const page = await browser.newPage();
await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle2' });
await new Promise((resolve) => setTimeout(resolve, 5000));

await performElementAction(page, 'user-name', 'type', 'locked_out_user');
await performElementAction(page, 'password', 'type', 'secret_sauce');
await performElementAction(page, 'login-button', 'click');

await page.waitForSelector('[data-test="error"]');
const errorMessage = await page.$eval(
  '[data-test="error"]',
  (element) => element.textContent.trim()
);

if (page.url().includes('/inventory.html') || !errorMessage) {
  throw new Error('Login unexpectedly succeeded.');
}

console.log(`Login failed as expected: ${errorMessage}`);

await browser.close();
