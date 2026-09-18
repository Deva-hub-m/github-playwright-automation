// Owner: Arsath
// utils/WaitUtils.js

'use strict';

/**
 * WaitUtils — explicit waiting helpers for Playwright.
 *
 * Provides a consistent, readable API for every "wait" scenario encountered
 * when automating GitHub:
 *
 *   WaitUtils.forSelector(page, selector)        – element appears in DOM
 *   WaitUtils.forVisible(locator)                – locator becomes visible
 *   WaitUtils.forHidden(locator)                 – locator disappears
 *   WaitUtils.forURL(page, urlOrRegex)           – URL matches pattern
 *   WaitUtils.forNavigation(page, fn)            – wraps an action that triggers navigation
 *   WaitUtils.forNetworkIdle(page)               – no in-flight network requests
 *   WaitUtils.forText(page, selector, text)      – element contains expected text
 *   WaitUtils.forEnabled(locator)                – element is interactive
 *   WaitUtils.pause(ms)                          – fixed-duration sleep (use sparingly)
 *
 * All timeouts default to the value of the TIMEOUT env variable (or 30 000 ms)
 * so the same knob that controls playwright.config.js also controls these helpers.
 *
 * Author: Arsath
 */

const { ConfigReader } = require('./ConfigReader');

/** Default timeout (ms) read from environment; falls back to 30 000. */
function _defaultTimeout() {
  return parseInt(ConfigReader.get('TIMEOUT', '30000'), 10);
}

const WaitUtils = {

  /**
   * Wait for a CSS selector to appear in the DOM (attached, not necessarily visible).
   *
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   * @param {{ timeout?: number, state?: 'attached'|'detached'|'visible'|'hidden' }} [options]
   * @returns {Promise<import('@playwright/test').ElementHandle>}
   */
  async forSelector(page, selector, options = {}) {
    return page.waitForSelector(selector, {
      timeout: _defaultTimeout(),
      state: 'attached',
      ...options,
    });
  },

  /**
   * Wait until a Playwright Locator becomes visible in the viewport.
   *
   * @param {import('@playwright/test').Locator} locator
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forVisible(locator, options = {}) {
    await locator.waitFor({ state: 'visible', timeout: _defaultTimeout(), ...options });
  },

  /**
   * Wait until a Playwright Locator is hidden or detached from the DOM.
   *
   * @param {import('@playwright/test').Locator} locator
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forHidden(locator, options = {}) {
    await locator.waitFor({ state: 'hidden', timeout: _defaultTimeout(), ...options });
  },

  /**
   * Wait for the page URL to match a string or regular expression.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string | RegExp} urlOrRegex
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forURL(page, urlOrRegex, options = {}) {
    await page.waitForURL(urlOrRegex, { timeout: _defaultTimeout(), ...options });
  },

  /**
   * Wrap a user action that triggers a navigation so that both the action and
   * the resulting page-load complete before the test continues.
   *
   * Example:
   *   await WaitUtils.forNavigation(page, () => page.click('a#submit'));
   *
   * @param {import('@playwright/test').Page} page
   * @param {() => Promise<void>} action   async callback that triggers navigation
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forNavigation(page, action, options = {}) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: _defaultTimeout(), ...options }),
      action(),
    ]);
  },

  /**
   * Wait for the network to be idle (no in-flight requests for 500 ms).
   * Useful after form submissions or AJAX-heavy transitions on GitHub.
   *
   * @param {import('@playwright/test').Page} page
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forNetworkIdle(page, options = {}) {
    await page.waitForLoadState('networkidle', { timeout: _defaultTimeout(), ...options });
  },

  /**
   * Wait for a specific element to contain the given text.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   * @param {string | RegExp} text
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forText(page, selector, text, options = {}) {
    const locator = page.locator(selector);
    await locator.filter({ hasText: text }).first().waitFor({
      state: 'visible',
      timeout: _defaultTimeout(),
      ...options,
    });
  },

  /**
   * Wait until an element is enabled (not disabled) so it can receive input.
   *
   * @param {import('@playwright/test').Locator} locator
   * @param {{ timeout?: number }} [options]
   * @returns {Promise<void>}
   */
  async forEnabled(locator, options = {}) {
    const timeout  = options.timeout ?? _defaultTimeout();
    const interval = 200;
    const start    = Date.now();
    while (Date.now() - start < timeout) {
      if (await locator.isEnabled()) return;
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`Element was not enabled within ${timeout} ms`);
  },

  /**
   * Fixed-duration pause. Use sparingly — prefer explicit waits above.
   *
   * @param {number} ms  milliseconds to wait
   * @returns {Promise<void>}
   */
  async pause(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },
};

module.exports = { WaitUtils };
