// Owner: Sulthan
'use strict';

/**
 * globalSetup.js
 *
 * Runs ONCE before the entire Playwright test suite starts.
 * Mirrors the `@BeforeAll cleanScreenshotFolder()` in Hooks.java.
 *
 * Registered in playwright.config.js via:
 *   globalSetup: './tests/globalSetup.js'
 */

const { ScreenshotUtils } = require('../utils/ScreenshotUtils');

module.exports = async function globalSetup() {
  // Wipe all .png files from the previous run so screenshots never accumulate.
  ScreenshotUtils.cleanScreenshotDir();
  console.log('\n  🧹 Cleared test-results/screenshots/ before run\n');
};
