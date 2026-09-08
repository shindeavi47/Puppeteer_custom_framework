import puppeteer from 'puppeteer';
import { PageActions } from '../pages/page-actions.js';

describe('SauceDemo cart', () => {
  let browser;
  let page;
  let pageActions;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized'],
      defaultViewport: null
    });
    page = await browser.newPage();
    pageActions = new PageActions(page);

    await page.goto('https://www.saucedemo.com/', {
      waitUntil: 'networkidle2'
    });
  }, 30000);

  afterAll(async () => {
    await browser.close();
  });

  test('adds Sauce Labs Backpack to the cart', async () => {
    const scenario = 'adds Sauce Labs Backpack to the cart';
    const startedAt = Date.now();
    let passed = false;

    try {
      await pageActions.loginPage('standard_user', 'secret_sauce');
      await page.waitForSelector('[data-test="inventory-container"]');

      await pageActions.click('add-to-cart-sauce-labs-backpack');
      await page.waitForSelector('[data-test="remove-sauce-labs-backpack"]');

      const cartBadge = await page.$eval(
        '[data-test="shopping-cart-badge"]',
        (element) => element.textContent.trim()
      );
      expect(cartBadge).toBe('1');

      await pageActions.click('shopping_cart_container');
      await page.waitForSelector('[data-test="inventory-item"]');

      const cartItem = await page.$eval(
        '[data-test="inventory-item-name"]',
        (element) => element.textContent.trim()
      );
      passed = cartItem === 'Sauce Labs Backpack';
      expect(passed).toBe(true);
    } finally {
      await pageActions.writeValidationResult(scenario, passed, startedAt);
    }
  }, 30000);
});
