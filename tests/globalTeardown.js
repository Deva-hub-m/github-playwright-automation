// Owner: Sulthan
'use strict';

/**
 * globalTeardown.js
 *
 * Runs ONCE after ALL Playwright workers have finished.
 * Mirrors `ReportManager.flushReports()` in the Java project — collects
 * per-worker JSON result files and writes the final HTML artifact.
 *
 * Registered in playwright.config.js via:
 *   globalTeardown: './tests/globalTeardown.js'
 *
 * How results are collected:
 *   Each worker writes its results to
 *   `test-results/reports/.worker-<pid>.json` via the custom reporter
 *   (reporters/HtmlArtifactReporter.js).  This teardown reads all those
 *   files, merges them, writes the final HTML, and deletes the temp files.
 */

const fs   = require('fs');
const path = require('path');
const { ReportManager } = require('../utils/ReportManager');

const REPORT_DIR  = path.join('test-results', 'reports');
const WORKER_GLOB = /^\.worker-.*\.json$/;

module.exports = async function globalTeardown() {
  // ── 1. Collect all per-worker result shards ──────────────────────────────
  const allResults = [];

  if (fs.existsSync(REPORT_DIR)) {
    const entries = fs.readdirSync(REPORT_DIR);
    for (const entry of entries) {
      if (!WORKER_GLOB.test(entry)) continue;
      const fullPath = path.join(REPORT_DIR, entry);
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (Array.isArray(data)) allResults.push(...data);
      } catch {
        // malformed shard — skip silently
      }
      fs.unlinkSync(fullPath);
    }
  }

  // ── 2. Write the consolidated HTML artifact ───────────────────────────────
  if (allResults.length === 0) {
    console.log('\n  ℹ️  No worker results found — skipping HTML artifact.\n');
    return;
  }

  ReportManager.writeHtmlArtifact(allResults, {
    projectName: 'GitHub Playwright Automation',
    team:        'Group 5 — IBM QE Training',
    environment: process.env.BASE_URL || 'github.com (production)',
  });
};
