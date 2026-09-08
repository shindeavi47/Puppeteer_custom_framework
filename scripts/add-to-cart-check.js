//#region Imports
import puppeteer from 'puppeteer';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';
//#endregion

//#region Browser and page setup
const browser = await puppeteer.launch({
  headless: false,
  args: ['--start-maximized'],
  defaultViewport: null
});

const page = await browser.newPage();
const pageActions = new PageActions(page);
await resetValidationResults();
//#endregion

//#region Dialog handling
page.on('dialog', async (dialog) => {
  if (dialog.type() === 'alert') {
    console.log(`Accepted warning: ${dialog.message()}`);
  }
  await dialog.accept();
});
//#endregion

//#region Add-to-cart validation
try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle2' });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    pageActions.loginPage('standard_user', 'secret_sauce')
  ]);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const okButtonFound = await page.$$eval(
    'button',
    (buttons) => buttons.some((button) => button.textContent.trim() === 'OK')
  );
  if (okButtonFound) {
    await page.$$eval(
      'button',
      (buttons) => buttons.find((button) => button.textContent.trim() === 'OK').click()
    );
  }

  await pageActions.validateAction('Adds Sauce Labs Backpack to the cart', 'add-to-cart-sauce-labs-backpack', [{ element: '#remove-sauce-labs-backpack' }]);

  await pageActions.validateAction('Validates cart badge count', null, [{ element: '.shopping_cart_badge', value: '1' }]);

  await pageActions.validateAction('Opens the shopping cart', 'shopping_cart_container', [{ element: '[data-test="inventory-item"]' }]);

  await pageActions.validateAction('Validates Sauce Labs Backpack in the cart', null, [{ element: '[data-test="inventory-item-name"]', value: 'Sauce Labs Backpack' }]);

  console.log('Item added to cart successfully.');
} finally {
  await browser.close();
}
//#endregion
