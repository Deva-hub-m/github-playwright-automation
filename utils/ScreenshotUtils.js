// Owner: Sulthan

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * ScreenshotUtils — captures and stores screenshots during and on test failure.
 *
 * Mirrors the Java ScreenshotUtils written by Sulthan for the Selenium project,
 * adapted for Playwright's async `page.screenshot()` API.
 *
 * Each screenshot is written to `test-results/screenshots/` with a timestamped
 * filename so that screenshots from consecutive runs never overwrite each other.
 *
 * Filename format:  <sanitized-name>_<yyyyMMdd_HHmmss_mmm>.png
 *
 * Usage (inside a Playwright test):
 *
 *   const { ScreenshotUtils } = require('../utils/ScreenshotUtils');
 *
 *   // Manual capture (always)
 *   const filePath = await ScreenshotUtils.capture(page, 'after_login');
 *
 *   // On-failure capture (only saves when test is failing)
 *   await ScreenshotUtils.captureOnFailure(page, testInfo, 'login_failed');
 *
 *   // Full-page capture (scrolling screenshot of the entire DOM)
 *   const filePath = await ScreenshotUtils.captureFullPage(page, 'full_dashboard');
 *
 *   // Element-level capture (crops to a specific locator)
 *   const filePath = await ScreenshotUtils.captureElement(locator, 'error_banner');
 *
 *   // Attach to Playwright HTML report (embeds the image inline)
 *   await ScreenshotUtils.attachToReport(page, testInfo, 'step_name');
 *
 * Author: Sulthan
 */

/** Directory where all screenshots are written. */
const SCREENSHOT_DIR = path.join('test-results', 'screenshots');

/**
 * Format a Date as `yyyyMMdd_HHmmss_mmm` — matches the Java DateTimeFormatter
 * pattern `yyyyMMdd_HHmmss_SSS` used in the Selenium project.
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
function _timestamp(date = new Date()) {
  const pad2 = (n) => String(n).padStart(2, '0');
  const pad3 = (n) => String(n).padStart(3, '0');

  const yyyy = date.getFullYear();
  const MM   = pad2(date.getMonth() + 1);
  const dd   = pad2(date.getDate());
  const HH   = pad2(date.getHours());
  const mm   = pad2(date.getMinutes());
  const ss   = pad2(date.getSeconds());
  const mmm  = pad3(date.getMilliseconds());

  return `${yyyy}${MM}${dd}_${HH}${mm}${ss}_${mmm}`;
}

/**
 * Sanitize a string so it is safe to use as a filename.
 * Replaces any character that is not alphanumeric, a dot, hyphen, or underscore
 * with an underscore — same regex as the Java implementation.
 *
 * @param {string} name
 * @returns {string}
 */
function _sanitize(name) {
  if (!name || name.trim() === '') return 'screenshot';
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Ensure the screenshot output directory exists (creates it recursively if not).
 */
function _ensureDir() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Build the full output path for a screenshot.
 *
 * @param {string} name  logical label (scenario name, step label, etc.)
 * @returns {string}     absolute file path ending in .png
 */
function _buildPath(name) {
  _ensureDir();
  const fileName = `${_sanitize(name)}_${_timestamp()}.png`;
  return path.resolve(path.join(SCREENSHOT_DIR, fileName));
}

// =============================================================================
//  Public API
// =============================================================================

const ScreenshotUtils = {

  /**
   * Capture the current browser viewport and write it to
   * `test-results/screenshots/<name>_<timestamp>.png`.
   *
   * Equivalent to `ScreenshotUtils.capture(name)` in the Java project.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string} name  logical label for the screenshot
   * @returns {Promise<string>}  the absolute path of the saved file
   */
  async capture(page, name) {
    const filePath = _buildPath(name);
    await page.screenshot({ path: filePath });
    return filePath;
  },

  /**
   * Capture a full-page (scrolling) screenshot — saves the entire DOM height,
   * not just the visible viewport.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @returns {Promise<string>}  absolute path of the saved file
   */
  async captureFullPage(page, name) {
    const filePath = _buildPath(`${name}_fullpage`);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  },

  /**
   * Capture only a specific element rather than the whole viewport.
   *
   * @param {import('@playwright/test').Locator} locator
   * @param {string} name
   * @returns {Promise<string>}  absolute path of the saved file
   */
  async captureElement(locator, name) {
    const filePath = _buildPath(`${name}_element`);
    await locator.screenshot({ path: filePath });
    return filePath;
  },

  /**
   * Capture a screenshot ONLY when the test is currently failing.
   * Mirrors the `_FAILED` suffix pattern used in `Hooks.java`.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   * @param {string} [label]  optional extra label; defaults to the test title
   * @returns {Promise<string|null>}  file path, or null if the test is not failing
   */
  async captureOnFailure(page, testInfo, label) {
    if (testInfo.status !== 'failed') return null;
    const safeName = _sanitize(label || testInfo.title) + '_FAILED';
    const filePath = _buildPath(safeName);
    await page.screenshot({ path: filePath });
    return filePath;
  },

  /**
   * Capture a screenshot AND attach it directly to the Playwright HTML report
   * so the image appears inline inside the test result.
   *
   * This is the Playwright equivalent of embedding a Base64 screenshot in
   * ExtentReports — Playwright's built-in reporter handles the HTML rendering.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   * @param {string} name  label shown in the report attachment panel
   * @returns {Promise<string>}  absolute path of the saved file
   */
  async attachToReport(page, testInfo, name) {
    const filePath = _buildPath(name);
    const buffer   = await page.screenshot({ path: filePath });
    // Attach the raw buffer so the HTML reporter embeds the image inline
    await testInfo.attach(name, { body: buffer, contentType: 'image/png' });
    return filePath;
  },

  /**
   * Capture a full-page screenshot AND attach it to the Playwright HTML report.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   * @param {string} name
   * @returns {Promise<string>}
   */
  async attachFullPageToReport(page, testInfo, name) {
    const filePath = _buildPath(`${name}_fullpage`);
    const buffer   = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(`${name} (full page)`, { body: buffer, contentType: 'image/png' });
    return filePath;
  },

  /**
   * Capture a screenshot after every step and attach it to the report.
   * Intended to be called from a custom `test.afterEach` or a fixture —
   * mirrors the `@AfterStep` behaviour in `Hooks.java`.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   * @param {number} stepNumber   sequential step counter (1-based)
   * @returns {Promise<string>}
   */
  async captureStep(page, testInfo, stepNumber) {
    const safeName = _sanitize(testInfo.title);
    const label    = `${safeName}_step${stepNumber}`;
    return this.attachToReport(page, testInfo, label);
  },

  /**
   * Clean (delete) all `.png` files in the screenshot output directory.
   * Mirrors `cleanScreenshotFolder()` in `Hooks.java` — call once in a
   * global setup file to start each run with a clean slate.
   */
  cleanScreenshotDir() {
    if (!fs.existsSync(SCREENSHOT_DIR)) return;
    const entries = fs.readdirSync(SCREENSHOT_DIR);
    for (const entry of entries) {
      const fullPath = path.join(SCREENSHOT_DIR, entry);
      if (fs.statSync(fullPath).isFile() && entry.endsWith('.png')) {
        fs.unlinkSync(fullPath);
      }
    }
  },

  /**
   * Expose the output directory path for tests or fixtures that need it.
   * @returns {string}
   */
  getScreenshotDir() {
    return SCREENSHOT_DIR;
  },
};

module.exports = { ScreenshotUtils };
