// Owner: Naveen

const { test, expect } = require('@playwright/test');
const { GistCreatePage } = require('../pages/GistCreatePage');
const { GistViewPage } = require('../pages/GistViewPage');

/**
 * GitHub Gist Tests
 * Owner: Naveen
 *
 * Test strategy
 * ─────────────
 * Suite A  (unauthenticated) — exercises the public gist listing / view page.
 *          Uses the stable octocat/6cad326836d38bd3a7ae "Hello world" gist.
 *          No credentials required; safe to run in CI without a .env file.
 *          NOTE: Fork and Star buttons require authentication — those assertions
 *          are intentionally in Suite B only.
 *
 * Suite B  (authenticated)   — exercises gist creation.
 *          Requires GITHUB_USERNAME and GITHUB_PASSWORD in the .env file.
 *          Tests are automatically skipped when the env vars are absent so
 *          they never break an unauthenticated pipeline run.
 */

// Stable public gist that is maintained by the octocat account
const KNOWN_GIST = 'octocat/6cad326836d38bd3a7ae';

// ─────────────────────────────────────────────────────────────────────────────
// Suite A — unauthenticated / read-only gist tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GitHub Gist — Public View (unauthenticated)', () => {
  let gistViewPage;

  test.beforeEach(async ({ page }) => {
    gistViewPage = new GistViewPage(page);
  });

  test('should load the public gist discovery page', async ({ page }) => {
    await page.goto('https://gist.github.com/discover');

    await expect(page).toHaveURL(/gist\.github\.com\/discover/);
    await expect(page).toHaveTitle(/Discover gists/i);
  });

  test('should display the gist filename header on a known public gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    await expect(page).toHaveURL(/gist\.github\.com\/octocat/);
    const filename = await gistViewPage.getFilename();
    expect(filename.length).toBeGreaterThan(0);
  });

  test('should show the correct filename on the octocat hello-world gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    const filename = await gistViewPage.getFilename();
    expect(filename).toBe('hello_world.rb');
  });

  test('should show a Raw link on a public gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    // Raw link is always present — no auth required
    await expect(gistViewPage.rawLink).toBeVisible();
    const rawHref = await gistViewPage.getRawHref();
    expect(rawHref).toMatch(/\/raw\//);
  });

  test('should display file content on a public gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    const content = await gistViewPage.getFileContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should contain Ruby source in the hello-world gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    const content = await gistViewPage.getFileContent();
    // hello_world.rb always contains "puts"
    expect(content).toContain('puts');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite B — authenticated gist creation tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GitHub Gist — Create (authenticated)', () => {
  // Skip the entire suite when credentials are not configured
  test.skip(
    !process.env.GITHUB_USERNAME || !process.env.GITHUB_PASSWORD,
    'Skipped: GITHUB_USERNAME / GITHUB_PASSWORD not set in .env'
  );

  let gistCreatePage;
  let gistViewPage;

  test.beforeEach(async ({ page }) => {
    gistCreatePage = new GistCreatePage(page);
    gistViewPage   = new GistViewPage(page);

    // Authenticate before each test
    await page.goto('https://github.com/login');
    await page.fill('#login_field', process.env.GITHUB_USERNAME);
    await page.fill('#password',    process.env.GITHUB_PASSWORD);
    await page.click('input[type="submit"][value="Sign in"]');
    // Wait until GitHub leaves the login page (handles 2FA redirect gracefully)
    await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 60_000 });
  });

  test('should open the new-gist page after login', async ({ page }) => {
    await gistCreatePage.open();

    await expect(page).toHaveURL(/gist\.github\.com/);
    await expect(gistCreatePage.filenameInput).toBeVisible();
    await expect(gistCreatePage.createSecretGistButton).toBeVisible();
  });

  test('should show both submit buttons on the create page', async ({ page }) => {
    await gistCreatePage.open();

    await expect(gistCreatePage.createSecretGistButton).toBeVisible();
    await expect(gistCreatePage.createPublicGistButton).toBeVisible();
  });

  test('should allow typing a description', async ({ page }) => {
    await gistCreatePage.open();
    await gistCreatePage.fillDescription('Automated test gist description');

    await expect(gistCreatePage.descriptionInput).toHaveValue('Automated test gist description');
  });

  test('should allow entering a filename', async ({ page }) => {
    await gistCreatePage.open();
    await gistCreatePage.fillFilename('hello.txt');

    await expect(gistCreatePage.filenameInput).toHaveValue('hello.txt');
  });

  test('should create a secret gist and land on the view page', async ({ page }) => {
    await gistCreatePage.open();
    await gistCreatePage.createGist({
      description: 'Playwright automation test gist',
      filename:    'playwright-test.txt',
      content:     'Hello from Playwright!',
    });

    // After creation GitHub redirects to the new gist's view page
    await expect(page).toHaveURL(/gist\.github\.com\/.+\/.+/);

    // The filename we supplied should be visible in the file-box header
    const filename = await gistViewPage.getFilename();
    expect(filename).toContain('playwright-test.txt');
  });

  test('created gist should display the content that was entered', async ({ page }) => {
    await gistCreatePage.open();
    await gistCreatePage.createGist({
      description: 'Content verification gist',
      filename:    'content-check.txt',
      content:     'Playwright content check line',
    });

    await expect(page).toHaveURL(/gist\.github\.com\/.+\/.+/);

    const content = await gistViewPage.getFileContent();
    expect(content).toContain('Playwright content check line');
  });

  test('created gist should show the Edit button for the owner', async ({ page }) => {
    await gistCreatePage.open();
    await gistCreatePage.createGist({
      description: 'Edit button visibility check',
      filename:    'edit-check.js',
      content:     'console.log("edit test");',
    });

    await expect(page).toHaveURL(/gist\.github\.com\/.+\/.+/);

    const editable = await gistViewPage.isEditable();
    expect(editable).toBeTruthy();
  });

  test('authenticated user should see Star button on a public gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    const starrable = await gistViewPage.isStarrable();
    expect(starrable).toBeTruthy();
  });

  test('authenticated user should see Fork button on a public gist', async ({ page }) => {
    await gistViewPage.open(KNOWN_GIST);

    const forkable = await gistViewPage.isForkable();
    expect(forkable).toBeTruthy();
  });
});
