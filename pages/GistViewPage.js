// Owner: Naveen

const { BasePage } = require('./BasePage');

/**
 * GistViewPage — Page Object for an individual gist detail page.
 *
 * A gist detail page (https://gist.github.com/<user>/<id>) exposes:
 *   • The gist title / filename header
 *   • The description paragraph (if set)
 *   • The raw file content rendered inside a table-based view
 *   • A "Raw" download link (always visible, even unauthenticated)
 *   • A "Fork" button  (authenticated users only)
 *   • A "Star" / "Unstar" button (authenticated users only)
 *   • The owner avatar / username link
 */
class GistViewPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // The <strong> filename shown in the file-box header
    this.filenameHeader = page.locator('.file-info .gist-blob-name').first();

    // Description shown below the page heading (not always present)
    this.descriptionHeading = page.locator('.gist-header-description, .f3.text-normal').first();

    // Each line of source rendered inside the table view
    this.codeLines = page.locator('.blob-code-inner');

    // The "Raw" link for the first file block (always present)
    this.rawLink = page.locator('a[href*="/raw/"]').first();

    // Star / Unstar toggle button (authenticated users only)
    this.starButton = page.locator('button:has-text("Star"), button:has-text("Unstar")').first();

    // Fork button (authenticated users only)
    this.forkButton = page.locator('button:has-text("Fork")').first();

    // Owner username link in the breadcrumb
    this.ownerLink = page.locator('.author a, .gist-owner-link').first();

    // "Edit" button — only visible when the authenticated user owns the gist
    this.editButton = page.locator('a:has-text("Edit"), a[href$="/edit"]').first();

    // "Delete" button — only visible when the authenticated user owns the gist
    this.deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete gist")').first();
  }

  /**
   * Navigate directly to a gist by its full URL or <username>/<id> path.
   * @param {string} gistPath  e.g. 'octocat/6cad326836d38bd3a7ae' or the full URL
   */
  async open(gistPath) {
    const url = gistPath.startsWith('http')
      ? gistPath
      : `https://gist.github.com/${gistPath}`;
    await this.navigate(url);
    return this;
  }

  /**
   * Get the filename shown in the first file-box header.
   * @returns {Promise<string>}
   */
  async getFilename() {
    return await this.getText(this.filenameHeader);
  }

  /**
   * Get the gist description (returns empty string when not present).
   * @returns {Promise<string>}
   */
  async getDescription() {
    if (!(await this.isVisible(this.descriptionHeading))) return '';
    return await this.getText(this.descriptionHeading);
  }

  /**
   * Get all visible source lines joined as a single string.
   * @returns {Promise<string>}
   */
  async getFileContent() {
    const lines = await this.codeLines.allInnerTexts();
    return lines.join('\n');
  }

  /**
   * Return the href of the Raw link for the first file.
   * @returns {Promise<string>}
   */
  async getRawHref() {
    return (await this.rawLink.getAttribute('href')) || '';
  }

  /**
   * Star the gist (authenticated users only).
   */
  async starGist() {
    await this.click(this.starButton);
    return this;
  }

  /**
   * Fork the gist (authenticated users only).
   */
  async forkGist() {
    await this.click(this.forkButton);
    return this;
  }

  /**
   * Click the Edit button (only available for gists you own).
   */
  async clickEdit() {
    await this.click(this.editButton);
    return this;
  }

  /**
   * Whether the Edit button is present (i.e. current user owns this gist).
   * @returns {Promise<boolean>}
   */
  async isEditable() {
    return await this.isVisible(this.editButton);
  }

  /**
   * Whether the Fork button is visible (requires authentication).
   * @returns {Promise<boolean>}
   */
  async isForkable() {
    return await this.isVisible(this.forkButton);
  }

  /**
   * Whether the Star button is visible (requires authentication).
   * @returns {Promise<boolean>}
   */
  async isStarrable() {
    return await this.isVisible(this.starButton);
  }
}

module.exports = { GistViewPage };
