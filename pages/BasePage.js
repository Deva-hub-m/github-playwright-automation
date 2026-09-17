/**
 * BasePage class providing common reusable page interactions.
 * Owner: Deva Vignan
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL or relative path
   * @param {string} url
   */
  async navigate(url = '/') {
    await this.page.goto(url);
  }

  /**
   * Click an element
   * @param {string | import('@playwright/test').Locator} selectorOrLocator
   */
  async click(selectorOrLocator) {
    const target = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await target.click();
  }

  /**
   * Fill an input element
   * @param {string | import('@playwright/test').Locator} selectorOrLocator
   * @param {string} value
   */
  async fill(selectorOrLocator, value) {
    const target = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    await target.fill(value);
  }

  /**
   * Get text content of an element
   * @param {string | import('@playwright/test').Locator} selectorOrLocator
   * @returns {Promise<string>}
   */
  async getText(selectorOrLocator) {
    const target = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    return (await target.innerText()).trim();
  }

  /**
   * Check if element is visible
   * @param {string | import('@playwright/test').Locator} selectorOrLocator
   * @returns {Promise<boolean>}
   */
  async isVisible(selectorOrLocator) {
    const target = typeof selectorOrLocator === 'string' ? this.page.locator(selectorOrLocator) : selectorOrLocator;
    return await target.isVisible();
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Wait for URL to match
   * @param {string | RegExp} urlOrRegex
   */
  async waitForURL(urlOrRegex) {
    await this.page.waitForURL(urlOrRegex);
  }
}

module.exports = { BasePage };
