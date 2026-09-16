# GitHub Playwright Automation

## Project Overview

This project is an automated testing framework for testing the GitHub web application using **Playwright with Java**.

The framework follows the **Page Object Model (POM)** design pattern and uses **Cucumber BDD** for behavior-driven test development.

The project is designed to automate major GitHub functionalities such as:

- User Login
- GitHub Profile
- Repository Management
- Issues
- Pull Requests
- Search and Explore
- Gists
- Code Browsing
- File Viewing
- Commit History

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Java | Programming Language |
| Playwright | Web UI Automation |
| Maven | Build & Dependency Management |
| Cucumber | BDD Test Automation |
| JUnit | Test Execution |
| Page Object Model | Framework Design Pattern |
| Apache POI | Excel Test Data |
| Java Faker | Dynamic Test Data |
| Extent Reports | Test Reporting |
| Allure | Test Reporting |
| GitHub Actions | CI/CD |
| Git | Version Control |

---

# Project Structure & File Ownership

Each file in the framework has a designated primary owner. The owner is responsible for creating, implementing, testing, and maintaining the assigned file.

```text
github-playwright-automation
│
├── .github
│   └── workflows
│       └── playwright-ci.yml              # Nitin K M
│
├── src
│   ├── main
│   │   ├── java
│   │   │
│   │   ├── driver
│   │   │   ├── PlaywrightManager.java     # Deva Vignan
│   │   │   └── BrowserFactory.java        # Deva Vignan
│   │   │
│   │   ├── pages
│   │   │   ├── BasePage.java              # Deva Vignan
│   │   │   ├── LoginPage.java             # Jothi Sri
│   │   │   ├── ProfilePage.java           # Jothi Sri
│   │   │   ├── NewRepoPage.java           # Sujin
│   │   │   ├── RepoHomePage.java          # Sujin
│   │   │   ├── IssuePage.java             # Nitheesh
│   │   │   ├── PullRequestPage.java       # Nitheesh
│   │   │   ├── SearchPage.java            # Yazeen
│   │   │   ├── ExplorePage.java           # Yazeen
│   │   │   ├── GistCreatePage.java        # Naveen
│   │   │   ├── GistViewPage.java          # Naveen
│   │   │   ├── CodeBrowserPage.java       # Neil Joe
│   │   │   ├── FileViewPage.java          # Neil Joe
│   │   │   └── CommitHistoryPage.java     # Neil Joe
│   │   │
│   │   ├── utils
│   │   │   ├── ConfigReader.java          # Arsath
│   │   │   ├── ExcelUtils.java            # Arsath
│   │   │   ├── FakerDataFactory.java      # Arsath
│   │   │   ├── WaitUtils.java             # Arsath
│   │   │   ├── ElementUtils.java          # Arsath
│   │   │   └── ScreenshotUtils.java       # Sulthan
│   │   │
│   │   └── reporting
│   │       └── ReportManager.java          # Sulthan
│   │
│   └── resources
│
│
├── test
│   ├── java
│   │
│   │   ├── base
│   │   │   └── BaseTest.java              # Deva Vignan
│   │   │
│   │   ├── runners
│   │   │   └── TestRunner.java             # Nitin K M
│   │   │
│   │   ├── stepdefs
│   │   │   ├── LoginSteps.java             # Jothi Sri
│   │   │   ├── RepositorySteps.java        # Sujin
│   │   │   ├── IssueSteps.java             # Nitheesh
│   │   │   ├── PullRequestSteps.java       # Nitheesh
│   │   │   ├── SearchSteps.java            # Yazeen
│   │   │   ├── GistSteps.java              # Naveen
│   │   │   └── CodeViewerSteps.java        # Neil Joe
│   │   │
│   │   └── tests
│   │       ├── LoginTest.java              # Jothi Sri
│   │       ├── RepositoryTest.java         # Sujin
│   │       ├── IssueTest.java              # Nitheesh
│   │       ├── PullRequestTest.java        # Nitheesh
│   │       ├── SearchTest.java             # Yazeen
│   │       ├── GistTest.java               # Naveen
│   │       └── CodeViewerTest.java          # Neil Joe
│   │
│   └── resources
│       ├── config.properties               # Arsath
│       ├── extent-config.xml               # Sulthan
│       ├── allure.properties               # Sulthan
│       ├── playwright.properties            # Nitin K M
│       │
│       ├── features
│       │   ├── login.feature               # Jothi Sri
│       │   ├── repository.feature          # Sujin
│       │   ├── issues.feature              # Nitheesh
│       │   ├── pullrequest.feature         # Nitheesh
│       │   ├── search.feature              # Yazeen
│       │   ├── gist.feature                # Naveen
│       │   └── codeviewer.feature          # Neil Joe
│       │
│       └── testdata
│           └── github_testdata.xlsx        # Arsath
│
├── pom.xml                                 # Deva Vignan
├── README.md                               # Deva Vignan
└── .gitignore                              # Shared / Project
```

---

## Team File Ownership

| Member | Primary Responsibility |
|---|---|
| **Deva Vignan** | Framework Foundation & Project Setup |
| **Jothi Sri** | Authentication & Profile |
| **Sujin** | Repository Management |
| **Nitheesh** | Issues & Pull Requests |
| **Yazeen** | Search & Explore |
| **Naveen** | Gists |
| **Neil Joe** | Code Browser, Files & Commits |
| **Arsath** | Configuration & Test Data |
| **Sulthan** | Reporting & Screenshots |
| **Nitin K M** | CI/CD, Test Runner & Playwright Configuration |

### Ownership Responsibilities

Each file owner is responsible for:

- Creating the assigned file.
- Implementing the assigned functionality.
- Testing the implementation locally.
- Fixing issues related to their implementation.
- Committing and pushing changes to their feature branch.
- Raising a Pull Request for review.
- Coordinating with other team members when their changes affect another module.

Shared framework changes should be discussed with the **Framework Lead, Deva Vignan**, before implementation.

---

# Framework Architecture

The framework follows the **Page Object Model** architecture.

```text
Test Cases
    │
    ▼
Cucumber Feature Files
    │
    ▼
Step Definitions
    │
    ▼
Page Objects
    │
    ▼
BasePage
    │
    ▼
Playwright Manager
    │
    ▼
Browser
    │
    ▼
GitHub
```

This separation keeps test cases, page interactions, browser management, utilities, and reporting independent from each other.

---

# Main Components

## Driver Management

### PlaywrightManager.java

Responsible for managing the Playwright instance, browser context, and page.

### BrowserFactory.java

Responsible for creating browser instances such as:

- Chromium
- Firefox
- WebKit

---

## Page Objects

The `pages` package contains Page Object classes.

Each page class contains:

- Locators
- Page-specific actions
- Reusable methods

Examples:

```text
LoginPage.java
RepositoryPage.java
IssuePage.java
PullRequestPage.java
SearchPage.java
GistCreatePage.java
```

---

## Base Page

`BasePage.java` contains common reusable browser operations used by different page objects.

Examples include:

- Click
- Fill
- Get text
- Navigation
- Element interaction

---

# Test Layer

The test layer contains the actual automated test cases.

## Feature Files

Cucumber `.feature` files contain test scenarios written using Gherkin syntax.

Example:

```gherkin
Feature: GitHub Issues

Scenario: Create a new issue
    Given the user is logged into GitHub
    When the user creates a new issue
    Then the issue should be created successfully
```

## Step Definitions

Step definition classes connect Gherkin scenarios with Java automation code.

Examples:

```text
IssueSteps.java
PullRequestSteps.java
SearchSteps.java
```

## Test Classes

Test classes are responsible for executing the corresponding test scenarios.

Examples:

```text
IssueTest.java
PullRequestTest.java
SearchTest.java
```

---

# Utilities

The framework contains reusable utilities for common automation requirements.

| Utility | Purpose | Owner |
|---|---|---|
| `ConfigReader.java` | Reads configuration properties | Arsath |
| `ExcelUtils.java` | Reads test data from Excel | Arsath |
| `FakerDataFactory.java` | Generates dynamic test data | Arsath |
| `WaitUtils.java` | Common wait operations | Arsath |
| `ElementUtils.java` | Reusable element operations | Arsath |
| `ScreenshotUtils.java` | Captures screenshots | Sulthan |

---

# Test Data

Test data is maintained separately from automation code.

```text
src/test/resources/testdata/github_testdata.xlsx
```

Apache POI is used to read data from the Excel file.

This allows test data to be changed without modifying the test implementation.

---

# Reporting

The framework supports test reporting using:

- Extent Reports
- Allure Reports

Screenshots can also be captured when required during test execution.

Reporting files are maintained by **Sulthan**.

---

# Configuration

Configuration files are maintained under:

```text
src/test/resources/
```

Important configuration files:

```text
config.properties
playwright.properties
extent-config.xml
allure.properties
```

Sensitive information such as GitHub credentials should not be committed to the repository.

Environment variables or local configuration should be used for credentials.

---

# Prerequisites

Install the following before running the project:

1. Java JDK
2. Maven
3. Git
4. IntelliJ IDEA or another Java IDE
5. Playwright browsers
6. GitHub account for testing

Verify Java:

```bash
java -version
```

Verify Maven:

```bash
mvn -version
```

---

# Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project:

```bash
cd github-playwright-automation
```

---

# Install Dependencies

Run:

```bash
mvn clean install
```

Install Playwright browsers if required by the project setup:

```bash
mvn exec:java -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install"
```

---

# Running Tests

Run the complete test suite:

```bash
mvn test
```

Run a specific test class:

```bash
mvn -Dtest=IssueTest test
```

Run a specific Cucumber tag:

```bash
mvn test -Dcucumber.filter.tags="@issues"
```

---

# CI/CD

The project uses **GitHub Actions** for continuous integration.

Workflow file:

```text
.github/workflows/playwright-ci.yml
```

The CI pipeline can be configured to:

1. Checkout the repository.
2. Set up Java.
3. Install Maven dependencies.
4. Install Playwright browsers.
5. Execute automated tests.
6. Generate test reports.
7. Store test artifacts.

The CI/CD implementation is maintained by **Nitin K M**.

---

# Git Workflow

Each team member should work on a separate branch.

Example:

```bash
git checkout -b feature/issues-automation
```

After completing the assigned work:

```bash
git add .
git commit -m "Add GitHub issues automation"
git push origin feature/issues-automation
```

Create a Pull Request to merge the changes into the main development branch.

---

# Coding Guidelines

- Follow Page Object Model principles.
- Keep locators inside Page Object classes.
- Avoid duplicating common methods.
- Reuse methods from `BasePage`.
- Keep test data separate from test logic.
- Use meaningful method and variable names.
- Do not hard-code credentials.
- Keep commits focused on a specific task.
- Pull the latest changes before starting new work.
- Coordinate before modifying another member's assigned files.

---

# Project Goals

The main goals of this project are to:

- Automate GitHub web application workflows.
- Build a reusable Playwright automation framework.
- Implement Page Object Model.
- Use BDD with Cucumber.
- Support reusable test data.
- Generate automated test reports.
- Execute tests through CI/CD.
- Maintain a scalable and maintainable automation framework.

---

# Team

| Member | Area |
|---|---|
| **Deva Vignan** | Framework Foundation & Project Setup |
| **Jothi Sri** | Authentication & Profile |
| **Sujin** | Repository Management |
| **Nitheesh** | Issues & Pull Requests |
| **Yazeen** | Search & Explore |
| **Naveen** | Gists |
| **Neil Joe** | Code Browser, Files & Commits |
| **Arsath** | Configuration & Test Data |
| **Sulthan** | Reporting & Screenshots |
| **Nitin K M** | CI/CD, Test Runner & Playwright Configuration |

---

# License

This project is intended for educational and internal automation purposes.