// Owner: Sulthan

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * ReportManager — Playwright HTML artifact capture.
 *
 * Mirrors the Java ReportManager (ExtentReports 5) written by Sulthan for the
 * Selenium project, translated into the Playwright ecosystem.
 *
 * In Playwright there is no need for a third-party HTML reporter library:
 * the built-in `html` reporter already generates a rich, interactive report.
 * This class therefore focuses on two responsibilities:
 *
 *   1. **Test-node metadata** — start / log / finish a named test node so that
 *      rich contextual data (feature name, author, browser, status) is attached
 *      to each test result and appears in the Playwright HTML report.
 *
 *   2. **Custom HTML artifact capture** — write a lightweight self-contained
 *      HTML summary file to `test-results/reports/` after the suite ends,
 *      giving teams a single shareable file they can open in any browser
 *      without running a local server (equivalent to the ExtentSparkReporter
 *      output in the Selenium project).
 *
 * Thread / worker safety:
 *   Each Playwright worker runs in its own process, so there is NO shared state
 *   between parallel workers.  The ThreadLocal<ExtentTest> pattern from Java is
 *   not needed — every module-level variable here belongs to a single worker.
 *   The custom HTML artifact is written by a global teardown script that runs
 *   after all workers finish (see `globalSetup` / `globalTeardown` in
 *   playwright.config.js).
 *
 * ─── Lifecycle (per worker) ──────────────────────────────────────────────────
 *
 *   ReportManager.startTest(testInfo)   called in test.beforeEach fixture
 *   ReportManager.logStep(msg)          called from page-object methods or tests
 *   ReportManager.logPass(testInfo)     called in test.afterEach fixture on pass
 *   ReportManager.logFail(testInfo, e)  called in test.afterEach fixture on fail
 *
 * ─── Custom HTML artifact ────────────────────────────────────────────────────
 *
 *   ReportManager.writeHtmlArtifact(results)
 *     Called from globalTeardown.js, receives the aggregated results array and
 *     writes `test-results/reports/PlaywrightReport_<timestamp>.html`.
 *
 * Author: Sulthan
 */

// =============================================================================
//  Constants
// =============================================================================

/** Output directory for the custom HTML artifact. */
const REPORT_DIR = path.join('test-results', 'reports');

/** ISO-safe timestamp used to name the artifact file. */
function _timestamp() {
  const d    = new Date();
  const pad2 = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    `_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`
  );
}

// =============================================================================
//  Per-worker test-node state
//  (not shared across workers — each worker has its own module instance)
// =============================================================================

/** @type {{ title: string, feature: string, author: string, browser: string, steps: string[], status: string, error: string|null, startTime: number } | null} */
let _currentTest = null;

/** Accumulated test results within this worker's lifetime. */
const _results = [];

// =============================================================================
//  Feature → Author mapping  (mirrors FEATURE_AUTHOR map in Hooks.java)
// =============================================================================
const FEATURE_AUTHOR = {
  login:       'Jothi Sri',
  logout:      'Jothi Sri',
  gist:        'Naveen',
  issue:       'Deva Vignan',
  repository:  'Sujin',
  search:      'Yazeen',
  codeviewer:  'Neil Joe Augustine',
  profile:     'Jothi Sri',
};

/**
 * Resolve author from a test file path or test title.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 * @returns {string}
 */
function _resolveAuthor(testInfo) {
  const key = (testInfo.file || '').toLowerCase();
  for (const [feature, author] of Object.entries(FEATURE_AUTHOR)) {
    if (key.includes(feature)) return author;
  }
  return 'Team — Group 5';
}

/**
 * Derive a human-readable feature name from the spec file path.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 * @returns {string}
 */
function _resolveFeature(testInfo) {
  const base = path.basename(testInfo.file || '', '.spec.js').replace(/[-_]/g, ' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

// =============================================================================
//  Public API — per-test lifecycle
// =============================================================================

const ReportManager = {

  /**
   * Start a new test node for the currently running test.
   * Call once in a `test.beforeEach` fixture.
   *
   * Mirrors `ReportManager.startTest(testName, description)` in Java.
   *
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  startTest(testInfo) {
    _currentTest = {
      title:     testInfo.title,
      feature:   _resolveFeature(testInfo),
      author:    _resolveAuthor(testInfo),
      browser:   testInfo.project.name,
      steps:     [],
      status:    'running',
      error:     null,
      startTime: Date.now(),
    };

    console.log(
      `\n${'─'.repeat(64)}\n` +
      `  ▶ TEST STARTING\n` +
      `  Feature  : ${_currentTest.feature}\n` +
      `  Test     : ${_currentTest.title}\n` +
      `  Author   : ${_currentTest.author}\n` +
      `  Browser  : ${_currentTest.browser}\n` +
      `${'─'.repeat(64)}`
    );
  },

  /**
   * Log a step message for the currently running test.
   * Mirrors `ReportManager.getTest().info(msg)` in Java.
   *
   * @param {string} message
   */
  logStep(message) {
    if (_currentTest) {
      _currentTest.steps.push({ time: new Date().toISOString(), message });
    }
    console.log(`    ↳ ${message}`);
  },

  /**
   * Mark the current test as PASSED and record it.
   * Call in the `afterEach` fixture when the test succeeds.
   *
   * Mirrors `ReportManager.getTest().pass("Scenario PASSED")` in Java.
   *
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  logPass(testInfo) {
    if (!_currentTest) return;
    _currentTest.status   = 'passed';
    _currentTest.duration = Date.now() - _currentTest.startTime;

    console.log(
      `\n${'─'.repeat(64)}\n` +
      `  ✔ PASSED : ${testInfo.title}\n` +
      `${'─'.repeat(64)}`
    );

    _results.push({ ..._currentTest });
    _currentTest = null;
  },

  /**
   * Mark the current test as FAILED, record the error, and log to console.
   * Call in the `afterEach` fixture when the test fails.
   *
   * Mirrors `ReportManager.getTest().fail(...)` in Java.
   *
   * @param {import('@playwright/test').TestInfo} testInfo
   * @param {Error|string} [error]
   */
  logFail(testInfo, error) {
    if (!_currentTest) return;
    _currentTest.status   = 'failed';
    _currentTest.duration = Date.now() - _currentTest.startTime;
    _currentTest.error    = error ? String(error.message || error) : 'Unknown failure';

    console.error(
      `\n${'─'.repeat(64)}\n` +
      `  ✖ FAILED : ${testInfo.title}\n` +
      `  Error    : ${_currentTest.error}\n` +
      `${'─'.repeat(64)}`
    );

    _results.push({ ..._currentTest });
    _currentTest = null;
  },

  /**
   * Return a snapshot of all results accumulated in this worker.
   * Used by globalTeardown to collect results across workers via JSON files.
   *
   * @returns {object[]}
   */
  getResults() {
    return [..._results];
  },

  // ===========================================================================
  //  HTML Artifact writer
  //  Called from globalTeardown.js after all workers complete.
  // ===========================================================================

  /**
   * Write a self-contained HTML report artifact to
   * `test-results/reports/PlaywrightReport_<timestamp>.html`.
   *
   * Equivalent to ExtentSparkReporter flushing its dark-themed HTML file in
   * ReportManager.flushReports() / Hooks.java.
   *
   * @param {object[]} results  array of test-result objects (collected from all workers)
   * @param {object}   [meta]   optional suite-level metadata
   * @param {string}   [meta.projectName]
   * @param {string}   [meta.team]
   * @param {string}   [meta.environment]
   * @returns {string}  absolute path of the written HTML file
   */
  writeHtmlArtifact(results, meta = {}) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const ts       = _timestamp();
    const fileName = `PlaywrightReport_${ts}.html`;
    const filePath = path.resolve(path.join(REPORT_DIR, fileName));

    const passed  = results.filter((r) => r.status === 'passed').length;
    const failed  = results.filter((r) => r.status === 'failed').length;
    const total   = results.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    const projectName = meta.projectName || 'GitHub Playwright Automation';
    const team        = meta.team        || 'Group 5 — IBM QE Training';
    const environment = meta.environment || 'github.com (production)';
    const generatedAt = new Date().toLocaleString();

    // ── Row builder ──────────────────────────────────────────────────────────
    const rows = results.map((r) => {
      const statusClass = r.status === 'passed' ? 'pass' : 'fail';
      const statusLabel = r.status === 'passed' ? '✔ PASSED' : '✖ FAILED';
      const durationMs  = r.duration != null ? `${r.duration} ms` : '—';
      const errorHtml   = r.error
        ? `<div class="error-msg">${_escapeHtml(r.error)}</div>`
        : '';
      const stepsHtml = r.steps && r.steps.length
        ? `<ul class="step-list">${r.steps.map((s) =>
            `<li><span class="step-time">${s.time}</span> ${_escapeHtml(s.message)}</li>`
          ).join('')}</ul>`
        : '';

      return `
        <tr class="${statusClass}-row">
          <td>${_escapeHtml(r.feature)}</td>
          <td>${_escapeHtml(r.title)}</td>
          <td>${_escapeHtml(r.author)}</td>
          <td>${_escapeHtml(r.browser)}</td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
          <td>${durationMs}</td>
          <td>${errorHtml}${stepsHtml}</td>
        </tr>`;
    }).join('\n');

    // ── HTML template (dark theme — matches ExtentSparkReporter Theme.DARK) ──
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${_escapeHtml(projectName)} — Test Report</title>
  <style>
    /* ── Reset & base ─────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      background: #1a1a2e;
      color: #e0e0e0;
    }
    a { color: #4fc3f7; }

    /* ── Header ──────────────────────────────────────────────── */
    .header {
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      padding: 28px 36px;
      border-bottom: 2px solid #e94560;
    }
    .header h1 { font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }
    .header .sub { font-size: 13px; color: #90a4ae; margin-top: 4px; }

    /* ── Summary cards ───────────────────────────────────────── */
    .summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding: 24px 36px;
      background: #16213e;
    }
    .card {
      flex: 1;
      min-width: 130px;
      background: #0f3460;
      border-radius: 8px;
      padding: 16px 20px;
      text-align: center;
    }
    .card .val  { font-size: 28px; font-weight: 700; color: #ffffff; }
    .card .lbl  { font-size: 11px; color: #90a4ae; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .card.pass  .val { color: #66bb6a; }
    .card.fail  .val { color: #ef5350; }
    .card.rate  .val { color: #ffa726; }

    /* ── Meta info bar ───────────────────────────────────────── */
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 12px 36px;
      background: #0f3460;
      font-size: 12px;
      color: #90a4ae;
      border-bottom: 1px solid #1a1a2e;
    }
    .meta span b { color: #e0e0e0; }

    /* ── Results table ───────────────────────────────────────── */
    .table-wrap { padding: 24px 36px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th {
      background: #0f3460;
      color: #90a4ae;
      font-weight: 600;
      padding: 10px 12px;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-size: 11px;
      border-bottom: 2px solid #e94560;
    }
    tbody tr { border-bottom: 1px solid #1e2a45; }
    tbody tr:hover { background: #1e2a45; }
    tbody td { padding: 10px 12px; vertical-align: top; color: #cfd8dc; }

    /* Row tinting */
    .pass-row td:first-child { border-left: 3px solid #66bb6a; }
    .fail-row td:first-child { border-left: 3px solid #ef5350; }

    /* ── Badges ──────────────────────────────────────────────── */
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .badge.pass { background: #1b5e20; color: #a5d6a7; }
    .badge.fail { background: #b71c1c; color: #ef9a9a; }

    /* ── Steps & errors ──────────────────────────────────────── */
    .step-list { list-style: none; margin-top: 4px; }
    .step-list li { font-size: 11px; color: #78909c; padding: 1px 0; }
    .step-time { color: #455a64; margin-right: 6px; }
    .error-msg {
      font-size: 12px;
      color: #ef9a9a;
      background: #2d1b1b;
      border-left: 3px solid #ef5350;
      padding: 4px 8px;
      margin-bottom: 4px;
      border-radius: 0 4px 4px 0;
      word-break: break-word;
    }

    /* ── Footer ──────────────────────────────────────────────── */
    .footer {
      text-align: center;
      font-size: 11px;
      color: #455a64;
      padding: 20px 36px;
      border-top: 1px solid #1e2a45;
      margin-top: 16px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h1>${_escapeHtml(projectName)} — Test Execution Report</h1>
    <div class="sub">Generated: ${generatedAt}</div>
  </div>

  <!-- Summary cards -->
  <div class="summary">
    <div class="card"><div class="val">${total}</div><div class="lbl">Total Tests</div></div>
    <div class="card pass"><div class="val">${passed}</div><div class="lbl">Passed</div></div>
    <div class="card fail"><div class="val">${failed}</div><div class="lbl">Failed</div></div>
    <div class="card rate"><div class="val">${passRate}%</div><div class="lbl">Pass Rate</div></div>
  </div>

  <!-- Meta bar -->
  <div class="meta">
    <span><b>Project:</b> ${_escapeHtml(projectName)}</span>
    <span><b>Team:</b> ${_escapeHtml(team)}</span>
    <span><b>Environment:</b> ${_escapeHtml(environment)}</span>
  </div>

  <!-- Results table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Test Name</th>
          <th>Author</th>
          <th>Browser</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Steps / Error</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="7" style="text-align:center;color:#455a64;padding:24px">No test results found.</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    GitHub Playwright Automation &mdash; Group 5 &mdash; IBM QE Training
  </div>

</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`\n  📄 HTML Report written → ${filePath}\n`);
    return filePath;
  },
};

// =============================================================================
//  HTML escape helper (private)
// =============================================================================

/**
 * Escape characters that have special meaning in HTML.
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { ReportManager };
