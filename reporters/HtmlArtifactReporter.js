// Owner: Sulthan
'use strict';

/**
 * HtmlArtifactReporter.js
 *
 * A lightweight Playwright custom reporter that collects test results in the
 * same shape as `ReportManager`'s internal result objects, then writes them to
 * a per-worker JSON shard file in `test-results/reports/`.
 *
 * `globalTeardown.js` reads all the shards after the suite finishes and passes
 * them to `ReportManager.writeHtmlArtifact()` to produce the final HTML file —
 * exactly how ExtentSparkReporter is flushed in `ReportManager.flushReports()`.
 *
 * Registered in playwright.config.js as a custom reporter entry:
 *   reporter: [
 *     ['html', { open: 'never' }],
 *     ['./reporters/HtmlArtifactReporter.js'],
 *   ]
 *
 * Author: Sulthan
 */

const fs   = require('fs');
const path = require('path');

const REPORT_DIR   = path.join('test-results', 'reports');
const FEATURE_AUTHOR = {
  login:      'Jothi Sri',
  logout:     'Jothi Sri',
  gist:       'Naveen',
  issue:      'Deva Vignan',
  repository: 'Sujin',
  search:     'Yazeen',
  codeviewer: 'Neil Joe Augustine',
  profile:    'Jothi Sri',
};

function _resolveAuthor(filePath) {
  const key = (filePath || '').toLowerCase();
  for (const [feature, author] of Object.entries(FEATURE_AUTHOR)) {
    if (key.includes(feature)) return author;
  }
  return 'Team — Group 5';
}

function _resolveFeature(filePath) {
  const base = path.basename(filePath || '', '.spec.js').replace(/[-_]/g, ' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

class HtmlArtifactReporter {
  constructor() {
    /** @type {object[]} */
    this._results = [];
  }

  // Called when a test finishes — status is 'passed' | 'failed' | 'timedOut' | 'skipped'
  onTestEnd(test, result) {
    const status = result.status === 'passed' ? 'passed' : 'failed';

    // Collect step titles from Playwright's result.steps (available in Playwright ≥ 1.31)
    const steps = (result.steps || []).map((s) => ({
      time:    new Date(s.startTime).toISOString(),
      message: s.title,
    }));

    const record = {
      title:    test.title,
      feature:  _resolveFeature(test.location.file),
      author:   _resolveAuthor(test.location.file),
      browser:  test.parent?.project?.name || 'chromium',
      status,
      duration: result.duration,
      steps,
      error:    result.error ? (result.error.message || String(result.error)) : null,
    };

    this._results.push(record);
  }

  // Called once when all tests in this worker have finished
  async onEnd() {
    if (this._results.length === 0) return;

    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const shardFile = path.join(REPORT_DIR, `.worker-${process.pid}.json`);
    fs.writeFileSync(shardFile, JSON.stringify(this._results, null, 2), 'utf8');
  }
}

module.exports = HtmlArtifactReporter;
