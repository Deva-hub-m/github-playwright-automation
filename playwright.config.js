const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',

  // ── Timeouts ──────────────────────────────────────────────────────────────
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // ── Execution ─────────────────────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ── Global lifecycle (mirrors @BeforeAll / flushReports in Hooks.java) ────
  globalSetup:    './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',

  // ── Reporters ─────────────────────────────────────────────────────────────
  // 1. Playwright built-in HTML reporter  → playwright-report/index.html
  //    (equivalent to ExtentSparkReporter output; open with `npm run test:report`)
  // 2. List reporter   → real-time console output (mirrors Logback console appender)
  // 3. Custom artifact → reporters/HtmlArtifactReporter.js feeds globalTeardown
  //    which writes test-results/reports/PlaywrightReport_<timestamp>.html
  reporter: [
    ['html',  { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['./reporters/HtmlArtifactReporter.js'],
  ],

  // ── Per-test browser settings ─────────────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL || 'https://github.com',

    // Screenshots — 'only-on-failure' matches the Selenium @After failure shot.
    // ScreenshotUtils.capture() / attachToReport() add extra manual captures
    // on top of this automatic baseline.
    screenshot: 'only-on-failure',

    // Trace — kept on first retry so CI failures are always debuggable.
    trace: 'on-first-retry',

    // Video — retained only when the test fails (keeps artifact size manageable).
    video: 'retain-on-failure',

    headless: process.env.HEADLESS !== 'false',
  },

  // ── Browser projects ──────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
