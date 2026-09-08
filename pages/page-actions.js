import { addValidationResult } from '../utils/validation-results.js';

function selectorForId(id) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('An element id is required.');
  }

  return `#${id}`;
}

export class PageActions {
  constructor(page) {
    this.page = page;
  }

  async loginPage(username, password) {
    await this.type('user-name', username);
    await this.type('password', password);
    await this.click('login-button');
  }

  async perform(id, action, text = '') {
    const selector = selectorForId(id);

    await this.page.waitForSelector(selector);

    switch (action) {
      case 'type':
        if (typeof text !== 'string') {
          throw new Error('Text is required for the type action.');
        }
        await this.page.type(selector, text);
        break;
      case 'click':
        await this.page.click(selector);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  async type(id, text) {
    return this.perform(id, 'type', text);
  }

  async click(id) {
    return this.perform(id, 'click');
  }

  async validateAction(scenario, clickId, checks, timeoutMs = 30000) {
    if (!Array.isArray(checks) || checks.length === 0) {
      throw new Error('At least one validation check is required.');
    }

    let passed = false;
    const startedAt = Date.now();
    try {
      if (clickId) {
        await this.click(clickId);
      }

      for (const check of checks) {
        if (!check || typeof check.element !== 'string' || check.element.trim() === '') {
          throw new Error('Each validation check requires an element selector.');
        }
        if (check.clickId) {
          await this.click(check.clickId);
        }

        await this.page.waitForSelector(check.element);
        if (check.value !== undefined) {
          const actualValue = await this.page.$eval(
            check.element,
            (element) => element.textContent.trim()
          );
          if (actualValue !== check.value) {
            throw new Error(
              `Expected "${check.value}" for ${check.element}, but found "${actualValue}".`
            );
          }
        }
      }

      passed = true;
      return true;
    } finally {
      await this.writeValidationResult(scenario, passed, startedAt, timeoutMs);
    }
  }

  async writeValidationResult(scenario, passed, startedAt, timeoutMs = 30000) {
    const elapsedMs = Date.now() - startedAt;
    let result;

    if (elapsedMs >= timeoutMs) {
      result = 'TIMEOUT';
    } else if (passed) {
      result = 'PASS';
    } else {
      result = 'FAIL';
    }

    await addValidationResult(result, scenario, elapsedMs);
  }
}
