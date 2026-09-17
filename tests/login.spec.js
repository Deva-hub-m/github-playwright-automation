// Owner: Jothi Sri

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ConfigReader } = require('../utils/ConfigReader');

test.describe.configure({ mode: 'serial' });

test.describe('GitHub Login Tests', () => {

    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.open();
    });

    test('Valid login succeeds', async () => {
        await loginPage.loginFromConfigAndWaitForLogin();
        const loggedIn = await loginPage.isLoggedIn();
        expect(loggedIn).toBeTruthy();
    });

    test('Invalid password shows error', async () => {
        const username = ConfigReader.get('GITHUB_USERNAME');
        await loginPage.login(username, 'WrongPassword123!');
        const errorDisplayed = await loginPage.isLoginErrorDisplayed();
        expect(errorDisplayed).toBeTruthy();
        const loggedIn = await loginPage.isLoggedIn();
        expect(loggedIn).toBeFalsy();
    });

    test('Empty password does not log in', async () => {
        const username = ConfigReader.get('GITHUB_USERNAME');
        await loginPage.enterUsername(username);
        await loginPage.enterPassword('');
        await loginPage.clickSignIn();
        const loggedIn = await loginPage.isLoggedIn();
        expect(loggedIn).toBeFalsy();
    });

});