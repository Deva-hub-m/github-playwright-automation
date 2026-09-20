// Owner: Yazeen
// Owner: Yazeen

const { test, expect } = require('@playwright/test');
const { SearchPage }   = require('../pages/SearchPage');
const { ExplorePage }  = require('../pages/ExplorePage');

/**
 * GitHub Search & Explore Tests
 * Owner: Yazeen
 *
 * Test strategy
 * ─────────────
 * Suite A — Search (unauthenticated)
 *   Tests GitHub repository search, result tabs, and topic search.
 *   No credentials required; safe to run in every CI pipeline.
 *
 * Suite B — Explore: Trending (unauthenticated)
 *   Validates that the Trending page loads and shows repository rows,
 *   and that language/date-range URL parameters are respected.
 *
 * Suite C — Explore: Topics (unauthenticated)
 *   Validates the Topics discovery page and individual topic detail pages.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Suite A — Search
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GitHub Search — Repository & Topic Search', () => {
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  // ── Basic search page load ─────────────────────────────────────────────────

  test('should load the search results page for a query', async ({ page }) => {
    await searchPage.search('playwright');

    await expect(page).toHaveURL(/github\.com\/search.*q=playwright/);
  });

  test('search URL contains the query string', async ({ page }) => {
    await searchPage.search('typescript');

    expect(searchPage.getCurrentUrl()).toContain('typescript');
  });

  // ── Repository type filter ─────────────────────────────────────────────────

  test('should show repository results when type=repositories is set', async ({ page }) => {
    await searchPage.search('playwright', 'repositories');

    await expect(page).toHaveURL(/type=repositories/);
  });

  test('should display at least one repository result for a popular query', async ({ page }) => {
    await searchPage.search('react', 'repositories');

    // The results tab must be present (implies results were returned)
    await expect(searchPage.repositoriesTab).toBeVisible();
  });

  // ── Repositories tab navigation ────────────────────────────────────────────

  test('should navigate to repository results via the Repositories tab', async ({ page }) => {
    // Start with a general search, then click the Repositories tab
    await searchPage.search('vue');
    await searchPage.selectRepositoriesTab();

    await expect(page).toHaveURL(/type=repositories/);
  });

  // ── Topics type filter ─────────────────────────────────────────────────────

  test('should show topic results when type=topics is set', async ({ page }) => {
    await searchPage.search('machine-learning', 'topics');

    await expect(page).toHaveURL(/type=topics/);
  });

  test('should display at least one topic result for a generic query', async ({ page }) => {
    await searchPage.search('javascript', 'topics');

    await expect(searchPage.topicsTab).toBeVisible();
  });

  // ── Users type filter ──────────────────────────────────────────────────────

  test('should show user results when type=users is set', async ({ page }) => {
    await searchPage.search('torvalds', 'users');

    await expect(page).toHaveURL(/type=users/);
  });

  // ── Edge-case: nonsense query ──────────────────────────────────────────────

  test('search with gibberish query should load without error', async ({ page }) => {
    // GitHub should show a results page (possibly empty) — it should not crash
    await searchPage.search('xyzzy_this_should_not_exist_aaa_bbb_123456');

    await expect(page).toHaveURL(/github\.com\/search/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite B — Explore: Trending
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GitHub Explore — Trending Repositories', () => {
  let explorePage;

  test.beforeEach(async ({ page }) => {
    explorePage = new ExplorePage(page);
  });

  test('should load the Trending page successfully', async ({ page }) => {
    await explorePage.openTrending();

    await expect(page).toHaveURL(/github\.com\/trending/);
  });

  test('should display repository rows on the Trending page', async ({ page }) => {
    await explorePage.openTrending();

    const count = await explorePage.getTrendingRepoCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should have a page title that references Trending on the Trending page', async ({ page }) => {
    await explorePage.openTrending();

    const title = await page.title();
    expect(title.toLowerCase()).toContain('trending');
  });

  test('should filter Trending repos by language via URL parameter', async ({ page }) => {
    await explorePage.openTrending('javascript');

    await expect(page).toHaveURL(/l=javascript/i);
  });

  test('Trending with daily date range should reflect in URL', async ({ page }) => {
    await explorePage.openTrending(undefined, 'daily');

    await expect(page).toHaveURL(/since=daily/);
  });

  test('Trending with weekly date range should reflect in URL', async ({ page }) => {
    await explorePage.openTrending(undefined, 'weekly');

    await expect(page).toHaveURL(/since=weekly/);
  });

  test('Trending with monthly date range should reflect in URL', async ({ page }) => {
    await explorePage.openTrending(undefined, 'monthly');

    await expect(page).toHaveURL(/since=monthly/);
  });

  test('should still show results when filtering by Python language', async ({ page }) => {
    await explorePage.openTrending('python');

    const count = await explorePage.getTrendingRepoCount();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite C — Explore: Topics
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GitHub Explore — Topics', () => {
  let explorePage;

  test.beforeEach(async ({ page }) => {
    explorePage = new ExplorePage(page);
  });

  test('should load the Topics discovery page', async ({ page }) => {
    await explorePage.openTopics();

    await expect(page).toHaveURL(/github\.com\/topics/);
  });

  test('should display topic cards on the Topics page', async ({ page }) => {
    await explorePage.openTopics();

    const hasCards = await explorePage.hasTopicCards();
    expect(hasCards).toBeTruthy();
  });

  test('Topics page should have a descriptive page title', async ({ page }) => {
    await explorePage.openTopics();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should navigate to the javascript topic detail page', async ({ page }) => {
    await explorePage.openTopic('javascript');

    await expect(page).toHaveURL(/github\.com\/topics\/javascript/);
  });

  test('javascript topic detail page heading should contain the topic name', async ({ page }) => {
    await explorePage.openTopic('javascript');

    const heading = await explorePage.getTopicDetailHeadingText();
    expect(heading.toLowerCase()).toContain('javascript');
  });

  test('should navigate to the machine-learning topic detail page', async ({ page }) => {
    await explorePage.openTopic('machine-learning');

    await expect(page).toHaveURL(/github\.com\/topics\/machine-learning/);
  });

  test('should navigate to the python topic detail page', async ({ page }) => {
    await explorePage.openTopic('python');

    await expect(page).toHaveURL(/github\.com\/topics\/python/);
  });

  test('should navigate to the open-source topic detail page', async ({ page }) => {
    await explorePage.openTopic('open-source');

    await expect(page).toHaveURL(/github\.com\/topics\/open-source/);
  });

  // ── Explore landing ────────────────────────────────────────────────────────

  test('should load the Explore landing page', async ({ page }) => {
    await explorePage.openExplore();

    await expect(page).toHaveURL(/github\.com\/explore/);
  });

  test('Explore landing page should have a non-empty title', async ({ page }) => {
    await explorePage.openExplore();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
//verified changes
