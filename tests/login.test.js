import puppeteer from 'puppeteer';
import { PageActions } from '../pages/page-actions.js';

describe('SauceDemo login', () => {
  let browser;
  let page;
  let pageActions;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    pageActions = new PageActions(page);
    await page.goto('https://www.saucedemo.com/', {
      waitUntil: 'networkidle2'
    });
  }, 30000);

  afterAll(async () => {
    await browser.close();
  });

  test('logs in with valid credentials', async () => {
    await pageActions.loginPage('standard_user', 'secret_sauce');

    await page.waitForSelector('[data-test="inventory-container"]');
    expect(page.url()).toContain('/inventory.html');
  }, 30000);
});
