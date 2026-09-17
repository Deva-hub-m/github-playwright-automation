const { test, expect } = require('@playwright/test');
const { IssuePage } = require('../pages/IssuePage');

/**
 * Issue Tests
 * Owner: Nitheesh
 */
test.describe('GitHub Issue Tests', () => {
  let issuePage;

  test.beforeEach(async ({ page }) => {
    issuePage = new IssuePage(page);
  });

  test('should navigate to issues list for a public repository', async ({ page }) => {
    await issuePage.goto('microsoft', 'playwright');

    await expect(page).toHaveURL(/microsoft\/playwright\/issues/);
    await expect(issuePage.issuesList).toBeVisible();
    await expect(issuePage.searchIssuesInput).toBeVisible();
  });

  test('should verify new issue button is accessible on repository issues page', async ({ page }) => {
    await issuePage.goto('microsoft', 'playwright');

    await expect(issuePage.newIssueButton).toBeVisible();
  });

  test('should search existing issues by keyword', async ({ page }) => {
    await issuePage.goto('microsoft', 'playwright');
    await issuePage.searchIssues('locator');

    await expect(page).toHaveURL(/q=is%3Aissue\+locator/);
    await expect(issuePage.issuesList).toBeVisible();
  });
});
