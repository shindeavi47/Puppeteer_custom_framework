import puppeteer from 'puppeteer';
import { PageActions } from '../pages/page-actions.js';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--start-maximized'],
  defaultViewport: null
});

const page = await browser.newPage();
const pageActions = new PageActions(page);
await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle2' });
await new Promise((resolve) => setTimeout(resolve, 5000));

await pageActions.loginPage('standard_user', 'secret_sauce');
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle2' }),
  pageActions.click('login-button')
]);
await new Promise((resolve) => setTimeout(resolve, 5000));

const title = await page.title();
console.log(`Page title: ${title}`);

await browser.close();
