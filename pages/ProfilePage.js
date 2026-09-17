// Owner: Jothi Sri

const { BasePage } = require('./BasePage');
const { ConfigReader } = require('../utils/ConfigReader');

class ProfilePage extends BasePage {
    constructor(page) {
        super(page);
        this.accountMenuButton = page.locator('button[data-login], img[data-testid="github-avatar"]').first();
        this.yourProfileLink = page.locator(`a[href="/${ConfigReader.get('GITHUB_USERNAME')}"], ` + 'a:has-text("Your profile")').first();
        this.profileNameHeading = page.locator('[itemprop="name"]').first();
        this.profileUsername = page.locator('.p-nickname.vcard-username').first();
        this.profileBio = page.locator('.p-note.user-profile-bio div').first();
        this.editProfileButton = page.getByRole('button', { name: 'Edit profile', exact: true }).first();
        this.signOutButton = page.getByRole('button', { name: 'Sign out', exact: true }).first();
        this.signOutLink = page.getByRole('link', { name: 'Sign out', exact: true }).first();
    }
    /**
     * Open the logged-in user's profile through
     * the GitHub account menu.
     */
    async openViaMenu() {
        await this.accountMenuButton.waitFor({state: 'visible', timeout: 15000});
        await this.accountMenuButton.click();
        await this.yourProfileLink.waitFor({state: 'visible', timeout: 10000});
        await this.yourProfileLink.click();
        await this.page.waitForLoadState('domcontentloaded');
        return this;
    }
    /**
     * Open a GitHub profile directly using the username.
     */
    async openDirect(username) {
        await this.navigate(`https://github.com/${username}`);
        await this.page.waitForLoadState('domcontentloaded');
        return this;
    }
    /**
     * Get the display name from the profile page.
     */
    async getDisplayName() {
        await this.profileNameHeading.waitFor({state: 'visible', timeout: 10000});
        return await this.getText(this.profileNameHeading);
    }
    /**
     * Get the username displayed on the profile page.
     */
    async getUsername() {
        await this.profileUsername.waitFor({state: 'visible', timeout: 10000});
        const username = await this.getText(this.profileUsername);
        return username.replace('@', '').trim();
    }
    /**
     * Get the username of the currently logged-in account
     * from GitHub's account menu button.
     */
    async getLoggedInUsernameFromHeader() {
        await this.accountMenuButton.waitFor({state: 'visible', timeout: 15000});
        const username = await this.accountMenuButton.getAttribute('data-login');
        if (!username) {
            throw new Error('Could not read the logged-in username from the GitHub account menu.');
        }
        return username;
    }
    /**
     * Check whether the profile bio is displayed.
     */
    async isBioDisplayed() {
        try {
            return await this.profileBio.isVisible();
        } catch (error) {
            return false;
        }
    }
    /**
     * Check whether the Edit profile button is visible.
     */
    async isEditProfileVisible() {
        try {
            return await this.editProfileButton.isVisible();
        } catch (error) {
            return false;
        }
    }
    /**
     * Sign out of the current GitHub session.
     *
     * GitHub currently uses a two-step logout flow:
     *
     * 1. Open the account menu and click "Sign out"
     * 2. GitHub opens /logout and asks to confirm the account
     * 3. Click the second "Sign out" button
     * 4. Wait until the authenticated account menu disappears
     */
    async signOut() {
        await this.accountMenuButton.waitFor({state: 'visible', timeout: 15000});
        await this.accountMenuButton.click();
        try {
            await this.signOutButton.waitFor({state: 'visible', timeout: 5000});
            await this.signOutButton.click();
        } catch (error) {
            await this.signOutLink.waitFor({state: 'visible', timeout: 10000});
            await this.signOutLink.click();
        }
        await this.page.waitForURL(/github\.com\/logout/, {timeout: 15000});
        console.log('GitHub logout confirmation page opened.');
        const logoutConfirmation = this.page.locator('button:has-text("Sign out"), ' + 'a:has-text("Sign out"), ' + 'input[type="submit"][value="Sign out"]').filter({visible: true}).last();
        await logoutConfirmation.waitFor({state: 'visible', timeout: 15000});
        console.log('Logout confirmation control found.');
        await logoutConfirmation.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.accountMenuButton.waitFor({state: 'hidden', timeout: 15000});
        console.log('GitHub session has been logged out.');
        return this;
    }
}
module.exports = { ProfilePage };