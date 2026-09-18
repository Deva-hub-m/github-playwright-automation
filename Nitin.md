# Nitin K M — CI/CD & Execution

**Role:** CI/CD Pipeline & Multi-Browser Execution  
**Project:** GitHub Playwright Automation — Group 5, IBM QE Training  
**Framework:** Playwright JavaScript (Node.js) · Page Object Model  

---

## Overview

Nitin K M owns the **CI/CD & Execution** layer of the automation framework. This layer is responsible for automatically running the full Playwright test suite on every code change, scheduling nightly regression runs, enforcing contribution standards via PR templates, and surfacing test results as downloadable artefacts and an Actions summary page.

```
.github/
├── workflows/
│   ├── playwright-ci.yml          ← primary CI pipeline (push / PR / manual)
│   └── playwright-scheduled.yml   ← nightly scheduled run (00:00 UTC daily)
└── PULL_REQUEST_TEMPLATE.md       ← PR checklist for all contributors
```

---

## Files Created

### 1. `.github/workflows/playwright-ci.yml`

**Trigger:** Push or pull request to `master` / `main`, plus manual `workflow_dispatch`.

The pipeline is structured as four sequential jobs:

```
install  →  lint  →  test (chromium | firefox | webkit)  →  summary
```

#### Job Breakdown

| Job | Purpose |
|---|---|
| **install** | Installs Node dependencies via `npm ci`, reads the exact Playwright version from `node_modules`, caches `node_modules` and browser binaries so subsequent jobs skip re-downloading |
| **lint** | Fast pre-gate — verifies `playwright.config.js` parses without errors, `utils/index.js` loads cleanly, and lists all registered Playwright projects |
| **test** | Runs the full suite across a `matrix: [chromium, firefox, webkit]` with `fail-fast: false`; each browser is an independent parallel job. Writes `.env` from GitHub Secrets (values are never echoed to logs), runs `npx playwright test --project=<browser>`, and uploads HTML report + trace artefacts |
| **summary** | Downloads all three browser reports and writes a consolidated markdown table to the GitHub Actions step summary page |

#### Key Design Decisions

- **`fail-fast: false`** — a WebKit failure does not cancel Chromium or Firefox; all three results are always captured.
- **Browser binary caching** — binaries are cached under `PLAYWRIGHT_BROWSERS_PATH` keyed to the exact Playwright version. On a cache hit only OS-level deps are reinstalled (`playwright install-deps`), saving ~2 min per run.
- **Secret injection** — `.env` is built using `printf '%s\n' "$SECRET"` so secret values never appear in the Actions log even with debug logging enabled.
- **`npm ci --prefer-offline || npm install`** — falls back gracefully when no lock file is present (the team's `.gitignore` excludes `package-lock.json`).
- **All Actions pinned to v4** — `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`, `actions/upload-artifact@v4`, `actions/download-artifact@v4`.
- **Artefact retention: 14 days** — keeps report sizes manageable for regular CI runs.

#### Manual Dispatch Inputs

| Input | Options | Default | Effect |
|---|---|---|---|
| `browser` | `chromium` \| `firefox` \| `webkit` \| `all` | `all` | Run only one browser or all three |
| `headed` | `true` \| `false` | `false` | Run with visible browser window (for debugging) |

---

### 2. `.github/workflows/playwright-scheduled.yml`

**Trigger:** Cron `0 0 * * *` — every day at **00:00 UTC (05:30 IST)**, plus manual `workflow_dispatch`.

Structurally identical to the CI pipeline (same install → test → summary jobs, same 3-browser matrix) with two differences:

| Difference | CI pipeline | Nightly pipeline |
|---|---|---|
| Trigger | Push / PR / dispatch | Cron daily + dispatch |
| Artefact retention | 14 days | **30 days** |
| Artefact name prefix | `playwright-report-*` | `nightly-report-*-<run_number>` |

The longer retention ensures nightly results survive a full working week without being purged.

---

### 3. `.github/PULL_REQUEST_TEMPLATE.md`

Auto-populated checklist shown on every new pull request. Enforces the team's contribution standards:

- Requires the contributor to update their row in `HANDOFF.md` (File Status Table + Completed Work section).
- Verifies `.env` is **not** included in the PR.
- Requires `playwright.config.js` to load without errors (`node playwright.config.js`).
- Prompts for test evidence (console output or screenshot).
- Includes a **Type of Change** section (bug fix, new test, refactor, dependency update, CI/config, docs).

---

## GitHub Secrets Required

Set these under **Settings → Secrets and variables → Actions** in the repository before the first run:

| Secret name | Maps to `.env` variable | Required? |
|---|---|---|
| `GITHUB_USERNAME` | `GITHUB_USERNAME` | ✅ Yes — for all authenticated tests |
| `GITHUB_PASSWORD` | `GITHUB_PASSWORD` | ✅ Yes — for all authenticated tests |
| `GH_TOKEN` | `GITHUB_TOKEN` | ⚪ Optional — only for tests that call the GitHub REST API |

> **Security note:** Secrets are never printed to the Actions log. The `.env` file is written at runtime using `printf` with variables expanded in a separate shell argument, not inline in a heredoc.

---

## How the Pipeline Connects to the Rest of the Framework

```
playwright.config.js
  ├── projects: [chromium, firefox, webkit]    ← consumed by --project flag in CI
  ├── retries: CI ? 2 : 0                      ← CI env var set to 'true' in workflow
  ├── workers: CI ? 1 : undefined              ← single worker per browser job in CI
  ├── globalSetup  → tests/globalSetup.js      ← clears screenshots before run
  ├── globalTeardown → tests/globalTeardown.js ← writes HTML artifact after run
  └── reporter: [html, list, HtmlArtifactReporter]

.github/workflows/playwright-ci.yml
  └── npx playwright test --project=chromium   ← one job per browser
  └── npx playwright test --project=firefox
  └── npx playwright test --project=webkit
        ↓
  Artefacts uploaded:
    playwright-report-chromium/  → Playwright built-in HTML report
    test-results-chromium/       → screenshots, traces, videos, custom HTML artifact
    (same for firefox, webkit)
```

---

## Validation

All files were verified locally before commit:

```
✅  .github/workflows/playwright-ci.yml        — no tab indentation (253 lines)
✅  .github/workflows/playwright-ci.yml        — top-level on: key present
✅  .github/workflows/playwright-ci.yml        — top-level jobs: key present
✅  .github/workflows/playwright-scheduled.yml — no tab indentation (189 lines)
✅  .github/workflows/playwright-scheduled.yml — top-level on: key present
✅  .github/workflows/playwright-scheduled.yml — top-level jobs: key present

Structural checks (10/10 patterns present in each workflow):
  ✅  uses: actions/checkout@v4
  ✅  uses: actions/setup-node@v4
  ✅  uses: actions/cache@v4
  ✅  uses: actions/upload-artifact@v4
  ✅  npx playwright install
  ✅  npx playwright test
  ✅  retention-days:
  ✅  fail-fast: false
  ✅  matrix.browser
  ✅  GITHUB_STEP_SUMMARY

playwright.config.js  → node -e "require('./playwright.config.js')"  ✅  OK
utils/index.js        → node -e "require('./utils/index')"            ✅  OK
```

---

## HANDOFF.md Updates

- **Pending Work table** — Nitin K M's row updated from `⚪ Not Started` → `✅ Done`; file list expanded to include all three new files.
- **File Status Table** — three new rows added (`playwright-ci.yml`, `playwright-scheduled.yml`, `PULL_REQUEST_TEMPLATE.md`), each marked `✅ Done`.
- **Completed Work section** — new `✅ Nitin K M — CI/CD & Execution` sub-section added with full file descriptions, secrets table, and design decisions.

---

*Author: Nitin K M · GitHub Playwright Automation · Group 5 · IBM QE Training*
