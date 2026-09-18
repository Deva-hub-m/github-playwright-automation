// Owner: Jothi Sri

const { BasePage } = require('./BasePage');
const { ConfigReader } = require('../utils/ConfigReader');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameField = page.locator('#login_field');
        this.passwordField = page.locator('#password');
        this.signInButton = page.locator('input[type="submit"][value="Sign in"]');
        this.errorFlash = page.locator(
            '#js-flash-container .flash-error, ' +
            '#js-flash-container [role="alert"], ' +
            '[role="alert"]'
        ).first();
        this.accountMenuButton = page.locator('button[data-login], img[data-testid="github-avatar"]').first();
    }
    /**
     * Opens the GitHub login page.
     */
    async open() {
        await this.navigate('/login');
        return this;
    }
    /**
     * Enters GitHub username.
     */
    async enterUsername(username) {
        await this.fill(this.usernameField, username);
        return this;
    }
    /**
     * Enters GitHub password.
     */
    async enterPassword(password) {
        await this.fill(this.passwordField, password);
        return this;
    }
    /**
     * Clicks the GitHub Sign in button.
     */
    async clickSignIn() {
        await this.click(this.signInButton);
        return this;
    }
    /**
     * Performs login using supplied username
     * and password.
     */
    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickSignIn();
        return this;
    }
    /**
     * Performs login using credentials
     * from the .env file.
     */
    async loginFromConfig() {
        const username = ConfigReader.get('GITHUB_USERNAME');
        const password = ConfigReader.get('GITHUB_PASSWORD');
        if (!username || !password) {
            throw new Error('GitHub username or password is missing from .env');
        }
        await this.login(username, password);
        return this;
    }
    /**
     * Checks whether a GitHub login error
     * is displayed.
     */
    async isLoginErrorDisplayed() {
        return await this.isVisible(this.errorFlash);
    }
    /**
     * Returns the GitHub login error message.
     */
    async getErrorMessage() {
        if (await this.isLoginErrorDisplayed()) {return await this.getText(this.errorFlash);}
        return '';
    }
    /**
     * Checks whether the user has successfully
     * authenticated with GitHub.
     *
     * The login page URL is the first check.
     * A login error means authentication failed.
     *
     * Once GitHub has left the login page without
     * displaying an authentication error, the
     * authentication flow has completed.
     */
    async isLoggedIn() {
        try {
            if (this.page.url().includes('/login')) {
                return false;
            }
            if (await this.isLoginErrorDisplayed()) {
                return false;
            }
            return await this.accountMenuButton.isVisible();

        } catch (error) {
            return false;
        }
    }
    /**
     * Returns current page URL and title.
     */
    async getCurrentPageInfo() {
        return {url: this.page.url(), title: await this.getTitle()};
    }
    /**
     * Logs in using configured credentials
     * and waits for authentication to complete.
     *
     * GitHub can have two possible authentication
     * flows:
     *
     * 1. Credentials are accepted and GitHub
     *    redirects directly to the authenticated page.
     *
     * 2. GitHub asks for additional verification,
     *    such as device verification.
     *
     * In the second case, the browser remains
     * open so the user can manually complete
     * the verification.
     *
     * The method waits up to 120 seconds.
     */
    async loginFromConfigAndWaitForLogin() {
        await this.loginFromConfig();
        console.log('Waiting for GitHub authentication to complete...');
        console.log('If GitHub asks for device verification, ' + 'complete it manually in the browser.');

        try {

            await this.page.waitForFunction(
                () => {
                    const currentPath = window.location.pathname;
                    const leftLoginPage = !currentPath.includes('/login');
                    const errorElement = document.querySelector('#js-flash-container .flash-error, ' + '#js-flash-container [role="alert"], ' + '[role="alert"]');
                    const errorVisible = errorElement && !!(errorElement.offsetWidth || errorElement.offsetHeight || errorElement.getClientRects().length);
                    return (leftLoginPage || errorVisible);}, null, {timeout: 120000});

            if (await this.isLoginErrorDisplayed()) {
                const errorMessage = await this.getErrorMessage();
                throw new Error(`GitHub login failed: ${errorMessage}`);
            }

            await this.page.waitForLoadState('domcontentloaded');

            if (await this.isLoggedIn()) {
                console.log('GitHub authentication completed successfully.');
                console.log(`Authenticated page: ${this.page.url()}`);
                return this;
            }

            throw new Error('GitHub authentication was not completed.');
        } catch (error) {

            if (error.message.startsWith('GitHub login failed:')) {
                throw error;
            }

            throw new Error(
                'GitHub authentication was not completed ' +
                'within 120 seconds. ' +
                'If device verification was requested, ' +
                'complete the verification in the browser.'
            );
        }
    }
}
module.exports = { LoginPage };

