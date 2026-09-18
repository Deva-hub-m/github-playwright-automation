# Arsath — Config & Test Data Utilities

**Module owner:** Arsath  
**Project:** GitHub Playwright Automation — Group 5, IBM QE Training  
**Framework:** Playwright JavaScript (Node.js) · Page Object Model  

---

## Overview

Arsath owns the **Config & Test Data** layer of the automation framework. This layer is the shared foundation that every other module depends on — it provides typed environment-variable access, deterministic test-data generation, Excel-based data-driven testing, and reliable explicit-wait helpers.

```
utils/
├── ConfigReader.js       ← typed env-variable accessor
├── FakerDataFactory.js   ← random test-data generators (seeded)
├── ExcelUtils.js         ← Excel workbook read / write helpers
├── WaitUtils.js          ← explicit Playwright wait helpers
.env.example              ← environment variable template
```

---

## Files Implemented

### 1. `utils/ConfigReader.js`

Centralised, typed access to all environment variables. Loads `.env` automatically via `dotenv` so no other file needs to call `dotenv.config()`.

| Method | Return type | Description |
|---|---|---|
| `get(key, default?)` | `string` | Raw env value with optional fallback |
| `getRequired(key)` | `string` | Throws a clear error if the variable is missing |
| `getBool(key, default?)` | `boolean` | `'true'` / `'1'` / `'yes'` → `true` |
| `getInt(key, default?)` | `number` | Parses integer, throws if not a valid number |
| `getBaseUrl()` | `string` | `BASE_URL` (default: `https://github.com`) |
| `isHeadless()` | `boolean` | `HEADLESS` env var (default: `true`) |
| `getTimeout()` | `number` | `TIMEOUT` in ms (default: `30000`) |
| `getBrowser()` | `string` | `BROWSER` (default: `chromium`) |
| `getCredentials()` | `{ username, password }` | `GITHUB_USERNAME` + `GITHUB_PASSWORD` |

**Usage example:**
```js
const { ConfigReader } = require('../utils/ConfigReader');

const baseUrl  = ConfigReader.getBaseUrl();      // 'https://github.com'
const timeout  = ConfigReader.getTimeout();      // 30000
const { username, password } = ConfigReader.getCredentials();
```

---

### 2. `utils/FakerDataFactory.js`

Wraps `@faker-js/faker` to provide a single, consistent source of random (but seed-controllable) test data for every test module in the project.

| Method | Returns | Intended consumer |
|---|---|---|
| `setSeed(n)` | `void` | `globalSetup.js` — deterministic CI runs |
| `repoData()` | `{ name, description, visibility, language, topics }` | Sujin — repository tests |
| `issueData()` | `{ title, body, label }` | Nitheesh — issue tests |
| `pullRequestData()` | `{ title, body, branch }` | Nitheesh — PR tests |
| `gistData()` | `{ filename, content, description, isPublic }` | Naveen — gist tests |
| `searchQuery()` | `string` | Yazeen — search tests |
| `userData()` | `{ name, bio, company, location, website }` | Jothi Sri — profile tests |
| `commentData()` | `string` | Any spec needing a comment body |

**Key design decisions:**
- `setSeed(n)` makes every subsequent call deterministic — call it once in `globalSetup.js` so CI produces reproducible data.
- Generated `repoData().name` values are always URL-safe (lowercase, hyphen-separated).
- `pullRequestData().branch` always starts with `feature/` to match the team branching convention.
- `userData().website` always starts with `https://` (no plain HTTP).

**Usage example:**
```js
const { FakerDataFactory } = require('../utils/FakerDataFactory');

FakerDataFactory.setSeed(42);            // optional — for reproducibility

const repo = FakerDataFactory.repoData();
// { name: 'clever-river-471', description: '...', visibility: 'public', ... }

const issue = FakerDataFactory.issueData();
// { title: '[BUG] Some title...', body: '## Description\n...', label: 'bug' }
```

---

### 3. `utils/ExcelUtils.js`

Wraps the `xlsx` (SheetJS) package to provide a clean data-driven testing API. Test data files live under `test-data/` by convention.

| Method | Description |
|---|---|
| `readSheet(filePath, sheetName)` | Returns all data rows as an array of objects (first row = headers) |
| `readRow(filePath, sheetName, rowIndex)` | Returns a single row by 0-based index |
| `writeSheet(filePath, sheetName, data)` | Creates or overwrites a sheet with an array of objects |
| `appendRow(filePath, sheetName, rowObject)` | Appends one row; creates file/sheet if absent |
| `getSheetNames(filePath)` | Lists all sheet tab names in the workbook |
| `cellValue(filePath, sheetName, cellAddress)` | Returns the raw value of a cell (e.g. `'B2'`) |

**Convention:** Place Excel files under `test-data/` (e.g. `test-data/login.xlsx`). The first row of every sheet must be the header row — its values become the property names on each returned object.

**Usage example:**
```js
const { ExcelUtils } = require('../utils/ExcelUtils');

// Data-driven login test
const users = ExcelUtils.readSheet('test-data/login.xlsx', 'ValidUsers');
for (const user of users) {
  await loginPage.login(user.username, user.password);
}

// Write results back
ExcelUtils.appendRow('test-data/results.xlsx', 'Run1', {
  test: 'Login', status: 'PASSED', timestamp: new Date().toISOString()
});
```

---

### 4. `utils/WaitUtils.js`

Nine explicit-wait helpers built on top of Playwright's native API. All timeouts default to the `TIMEOUT` environment variable (via `ConfigReader`) so one config knob controls both `playwright.config.js` and these helpers.

| Method | Description |
|---|---|
| `forSelector(page, selector, opts?)` | Element attached to the DOM |
| `forVisible(locator, opts?)` | Locator becomes visible in viewport |
| `forHidden(locator, opts?)` | Locator is hidden or detached |
| `forURL(page, urlOrRegex, opts?)` | Page URL matches string or RegExp |
| `forNavigation(page, action, opts?)` | Wraps an action that triggers a full navigation |
| `forNetworkIdle(page, opts?)` | No in-flight network requests for 500 ms |
| `forText(page, selector, text, opts?)` | Element contains the expected text |
| `forEnabled(locator, opts?)` | Element is not disabled (polls every 200 ms) |
| `pause(ms)` | Fixed sleep — use sparingly, prefer the above |

**Usage example:**
```js
const { WaitUtils } = require('../utils/WaitUtils');

// Wait for a flash banner to appear, then disappear
await WaitUtils.forVisible(page.locator('.flash-notice'));
await WaitUtils.forHidden(page.locator('.flash-notice'));

// Wrap a click that navigates to a new page
await WaitUtils.forNavigation(page, () => page.click('a#submit'));

// Wait for a heading to contain the repo name
await WaitUtils.forText(page, 'h1', 'my-new-repo');
```

---

### 5. `.env.example`

Template for the `.env` file that every developer must create locally before running tests. Documents all supported environment variables with descriptions.

```
BASE_URL           Application base URL (default: https://github.com)
GITHUB_USERNAME    GitHub account username — required for authenticated tests
GITHUB_PASSWORD    GitHub account password — required for authenticated tests
HEADLESS           Run browsers without UI: true | false (default: true)
BROWSER            Target browser: chromium | firefox | webkit (default: chromium)
TIMEOUT            Global test timeout in ms (default: 30000)
GITHUB_TOKEN       Personal Access Token for REST API calls (optional)
TEST_DATA_FILE     Path to Excel test-data file (default: test-data/testdata.xlsx)
```

> **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## How These Utilities Connect to the Rest of the Framework

```
playwright.config.js
    └── reads BASE_URL, HEADLESS, TIMEOUT from env (ConfigReader pattern)

tests/*.spec.js
    ├── ConfigReader  → credentials, timeout, base URL
    ├── FakerDataFactory → generate unique repo/issue/gist/user data per test run
    ├── ExcelUtils    → data-driven test loops from .xlsx files
    └── WaitUtils     → reliable waits replacing hard-coded page.waitForTimeout()

utils/index.js
    └── re-exports all four utilities for clean single-import usage
```

Single-import pattern (any test file):
```js
const { ConfigReader, FakerDataFactory, ExcelUtils, WaitUtils } = require('../utils');
```

---

## Validation

All utilities were verified with a 40-assertion Node.js test covering:

- `ConfigReader` — default values, type coercion, missing-key error
- `WaitUtils` — all nine methods present and callable
- `FakerDataFactory` — shape contracts for all seven generators; seeding reproducibility
- `ExcelUtils` — full round-trip: write → read → append → readRow → cellValue → getSheetNames; missing-file error message

```
node -e "require('./utils/index')"   ✅  no errors
40 / 40 assertions passed            ✅
```

---

## Dependencies Used

| Package | Version | Purpose |
|---|---|---|
| `dotenv` | `^16.4.7` | Load `.env` into `process.env` |
| `@faker-js/faker` | `^10.6.0` | Fake data generation |
| `xlsx` | `^0.18.5` | Excel file read/write (SheetJS) |

All packages were already declared in `package.json` by the framework lead (Deva Vignan).

---

*Author: Arsath · GitHub Playwright Automation · Group 5 · IBM QE Training*
