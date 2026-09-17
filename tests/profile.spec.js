// Owner: Jothi Sri

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ProfilePage } = require('../pages/ProfilePage');
const { ConfigReader } = require('../utils/ConfigReader');

test.describe.configure({ mode: 'serial' });

test.describe('GitHub Profile Tests', () => {
    let loginPage;
    let profilePage;
    /*
     * Login before each profile test.
     * Each test gets a fresh browser page/session.
     */
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        profilePage = new ProfilePage(page);
        await loginPage.open();
        await loginPage.loginFromConfigAndWaitForLogin();
        expect(await loginPage.isLoggedIn()).toBeTruthy();
    });
    /*
     * Test 1:
     * Verify that the username of the logged-in account
     * matches the username stored in .env.
     */
    test('Logged-in username matches configured username', async () => {
        const expectedUsername = ConfigReader.get('GITHUB_USERNAME');
        expect(expectedUsername).not.toBe('');
        const actualUsername = await profilePage.getLoggedInUsernameFromHeader();
        console.log(`Expected username: ${expectedUsername}`);
        console.log(`Actual username:   ${actualUsername}`);
        expect(actualUsername.toLowerCase()).toBe(expectedUsername.toLowerCase());
    });
    /*
     * Test 2:
     * Open the logged-in user's profile through the
     * GitHub account menu and verify Edit profile is visible.
     */
    test('Edit profile button is visible on own profile', async () => {
        await profilePage.openViaMenu();
        console.log(`Profile page URL: ${profilePage.page.url()}`);
        const editProfileVisible = await profilePage.isEditProfileVisible();
        console.log(`Edit profile visible: ${editProfileVisible}`);
        expect(editProfileVisible).toBeTruthy();
    });
});