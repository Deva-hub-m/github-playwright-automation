// Owner: Naveen

const { BasePage } = require('./BasePage');

/**
 * GistCreatePage — Page Object for https://gist.github.com
 *
 * Covers the "Create a new gist" form which has:
 *   • A description input
 *   • A filename input (CodeMirror-backed)
 *   • A CodeMirror editor for the file content
 *   • "Create secret gist" and "Create public gist" submit buttons
 */
class GistCreatePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Description field at the top of the form
    this.descriptionInput = page.locator('input[placeholder="Gist description..."]');

    // Filename input inside the first file block
    this.filenameInput = page.locator('.file-info input.js-blob-filename').first();

    // CodeMirror content editor — the actual editable div inside the first file block
    this.codeEditor = page.locator('.CodeMirror-code').first();
    this.codeEditorTextarea = page.locator('.CodeMirror textarea').first();

    // Submit buttons
    this.createSecretGistButton = page.locator('button[data-type="secret"], button:has-text("Create secret gist")');
    this.createPublicGistButton = page.locator('button[data-type="public"], button:has-text("Create public gist")');
  }

  /**
   * Navigate to the new-gist creation page.
   */
  async open() {
    await this.navigate('https://gist.github.com');
    return this;
  }

  /**
   * Fill in the gist description.
   * @param {string} description
   */
  async fillDescription(description) {
    await this.fill(this.descriptionInput, description);
    return this;
  }

  /**
   * Fill in the filename for the first file block.
   * @param {string} filename
   */
  async fillFilename(filename) {
    await this.fill(this.filenameInput, filename);
    return this;
  }

  /**
   * Type content into the CodeMirror editor.
   * Clicks the editor to focus it first, then uses keyboard input.
   * @param {string} content
   */
  async fillContent(content) {
    await this.codeEditor.click();
    // CodeMirror proxies keyboard events through a hidden textarea
    await this.codeEditorTextarea.fill(content);
    return this;
  }

  /**
   * Submit the form as a secret gist.
   */
  async createSecretGist() {
    await this.click(this.createSecretGistButton);
    return this;
  }

  /**
   * Submit the form as a public gist.
   */
  async createPublicGist() {
    await this.click(this.createPublicGistButton);
    return this;
  }

  /**
   * Convenience: fill all fields and create a secret gist in one call.
   * @param {{ description?: string, filename: string, content: string }} opts
   */
  async createGist({ description = '', filename, content }) {
    if (description) await this.fillDescription(description);
    await this.fillFilename(filename);
    await this.fillContent(content);
    await this.createSecretGist();
    return this;
  }
}

module.exports = { GistCreatePage };
