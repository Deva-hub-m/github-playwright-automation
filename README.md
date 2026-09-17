# GitHub Playwright Automation (JavaScript)

## Project Overview

This project is an automated testing framework for testing the GitHub web application using **Playwright with JavaScript**.

The framework follows the **Page Object Model (POM)** design pattern and uses **@playwright/test** as the test runner.

The project automates major GitHub functionalities:

- User Login & Authentication
- GitHub Profile
- Repository Management
- Issues
- Pull Requests
- Search and Explore
- Gists
- Code Browsing & File Viewing
- Commit History

---

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript (Node.js) | Programming Language |
| @playwright/test | Test Runner & Browser Automation |
| Page Object Model | Framework Architecture Pattern |
| @faker-js/faker | Dynamic Test Data Generation |
| xlsx | Excel Data Management |
| dotenv | Environment Configuration |
| GitHub Actions | CI/CD Integration |

---

## Project Structure & File Ownership

Each file in the framework has a designated primary owner. The owner is responsible for creating, implementing, testing, and maintaining the assigned file.

```text
github-playwright-automation
│
├── .github
│   └── workflows
│       └── playwright-ci.yml        # Nitin K M
│
├── pages
│   ├── BasePage.js                  # Deva Vignan (Framework Lead)
│   ├── LoginPage.js                 # Jothi Sri
│   ├── ProfilePage.js               # Jothi Sri
│   ├── NewRepoPage.js               # Sujin
│   ├── RepoHomePage.js              # Sujin
│   ├── IssuePage.js                 # Nitheesh
│   ├── PullRequestPage.js           # Nitheesh
│   ├── SearchPage.js                # Yazeen
│   ├── ExplorePage.js               # Yazeen
│   ├── GistCreatePage.js            # Naveen
│   ├── GistViewPage.js              # Naveen
│   ├── CodeBrowserPage.js           # Neil Joe
│   ├── FileViewPage.js              # Neil Joe
│   ├── CommitHistoryPage.js         # Neil Joe
│   └── index.js                     # Deva Vignan
│
├── tests
│   ├── login.spec.js                # Jothi Sri
│   ├── repository.spec.js           # Sujin
│   ├── issue.spec.js                # Nitheesh
│   ├── pullrequest.spec.js          # Nitheesh
│   ├── search.spec.js               # Yazeen
│   ├── gist.spec.js                 # Naveen
│   └── codeviewer.spec.js           # Neil Joe
│
├── utils
│   ├── ConfigReader.js              # Arsath
│   ├── ExcelUtils.js                # Arsath
│   ├── FakerDataFactory.js          # Arsath
│   ├── WaitUtils.js                 # Arsath
│   ├── ScreenshotUtils.js           # Sulthan
│   └── index.js                     # Deva Vignan
│
├── playwright.config.js             # Nitin K M & Deva Vignan
├── package.json                     # Deva Vignan
├── .env.example                     # Arsath
└── README.md                        # Deva Vignan
```

---

## Team File Ownership & Task Assignments

| Member | Area / Responsibility | Assigned Files & Tasks |
|---|---|---|
| **Deva Vignan** (Lead) | Framework Foundation & Architecture | • `pages/BasePage.js`<br>• `pages/index.js`<br>• `utils/index.js`<br>• `package.json`<br>• `playwright.config.js`<br>• `README.md` |
| **Jothi Sri** | Authentication & Profile Management | • `pages/LoginPage.js`<br>• `pages/ProfilePage.js`<br>• `tests/login.spec.js` |
| **Sujin** | Repository Lifecycle Management | • `pages/NewRepoPage.js`<br>• `pages/RepoHomePage.js`<br>• `tests/repository.spec.js` |
| **Nitheesh** | Issues & Pull Requests Automation | • `pages/IssuePage.js`<br>• `pages/PullRequestPage.js`<br>• `tests/issue.spec.js`<br>• `tests/pullrequest.spec.js` |
| **Yazeen** | Search & Explore Capabilities | • `pages/SearchPage.js`<br>• `pages/ExplorePage.js`<br>• `tests/search.spec.js` |
| **Naveen** | GitHub Gists Automation | • `pages/GistCreatePage.js`<br>• `pages/GistViewPage.js`<br>• `tests/gist.spec.js` |
| **Neil Joe** | Code Browser, File View & Commits | • `pages/CodeBrowserPage.js`<br>• `pages/FileViewPage.js`<br>• `pages/CommitHistoryPage.js`<br>• `tests/codeviewer.spec.js` |
| **Arsath** | Configuration, Test Data & Utilities | • `utils/ConfigReader.js`<br>• `utils/ExcelUtils.js`<br>• `utils/FakerDataFactory.js`<br>• `utils/WaitUtils.js`<br>• `.env.example` |
| **Sulthan** | Reporting, Screenshots & Artifacts | • `utils/ScreenshotUtils.js` |
| **Nitin K M** | CI/CD Pipeline & Playwright Config | • `.github/workflows/playwright-ci.yml`<br>• Playwright runner / execution integration |

---

## Ownership Responsibilities

Each file owner is responsible for:

1. **Implementation**: Writing clean, maintainable Playwright JavaScript code in their assigned files.
2. **Local Testing**: Executing their tests locally (`npx playwright test tests/<spec-file>`) to ensure stability.
3. **Branching & PRs**: Working on a dedicated feature branch and raising pull requests for framework integration.
4. **Coordination**: Aligning with the Framework Lead (Deva Vignan) when changing shared base classes or utilities.

---

## Prerequisites

1. **Node.js**: Version 18.x or higher
2. **npm**: Version 9.x or higher

---

## Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browser binaries:
   ```bash
   npx playwright install --with-deps
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

---

## Running Tests

- **Run all tests (headless):**
  ```bash
  npm test
  ```

- **Run tests in headed mode:**
  ```bash
  npm run test:headed
  ```

- **Run tests in interactive UI mode:**
  ```bash
  npm run test:ui
  ```

- **Run a specific test spec:**
  ```bash
  npx playwright test tests/login.spec.js
  ```

- **View HTML test report:**
  ```bash
  npm run test:report
  ```
