const { test, expect } = require('@playwright/test');
const { PullRequestPage } = require('../pages/PullRequestPage');

/**
 * Pull Request Tests
 * Owner: Nitheesh
 */
test.describe('GitHub Pull Request Tests', () => {
  let pullRequestPage;

  test.beforeEach(async ({ page }) => {
    pullRequestPage = new PullRequestPage(page);
  });

  test('should navigate to pull requests list for a public repository', async ({ page }) => {
    await pullRequestPage.goto('microsoft', 'playwright');

    await expect(page).toHaveURL(/microsoft\/playwright\/pulls/);
    await expect(pullRequestPage.prList).toBeVisible();
    await expect(pullRequestPage.searchPRInput).toBeVisible();
  });

  test('should verify new pull request button is accessible on pulls page', async ({ page }) => {
    await pullRequestPage.goto('microsoft', 'playwright');

    await expect(pullRequestPage.newPRButton).toBeVisible();
  });

  test('should search existing pull requests by keyword', async ({ page }) => {
    await pullRequestPage.goto('microsoft', 'playwright');
    await pullRequestPage.searchPullRequests('fix');

    await expect(page).toHaveURL(/q=is%3Apr\+fix/);
    await expect(pullRequestPage.prList).toBeVisible();
  });
});
