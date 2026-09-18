// Owner: Jothi Sri

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ProfilePage } = require('../pages/ProfilePage');

test.describe.configure({ mode: 'serial' });

test.describe('GitHub Logout Tests', () => {

    test('Logout ends the GitHub session', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const profilePage = new ProfilePage(page);
        await loginPage.open();
        await loginPage.loginFromConfigAndWaitForLogin();
        const loggedInBeforeLogout = await loginPage.isLoggedIn();
        expect(loggedInBeforeLogout).toBeTruthy();
        console.log('User is logged in successfully.');
        await profilePage.signOut();
        console.log('Sign-out action completed.');
        await expect.poll(async () => await loginPage.isLoggedIn(), {
            timeout: 15000, message: 'User should no longer be logged in after logout'}).toBeFalsy();
        console.log('User is successfully logged out.');
    });

});