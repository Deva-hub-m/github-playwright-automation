package driver;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

// Owner: Deva Vignan
public final class PlaywrightManager {

    private static Playwright playwright;
    private static Browser browser;
    private static BrowserContext context;
    private static Page page;

    private PlaywrightManager() {
    }

    public static void initializeBrowser() {
        closeBrowser();

        playwright = Playwright.create();
        browser = BrowserFactory.launch(playwright);
        context = browser.newContext(new Browser.NewContextOptions()
                .setViewportSize(1440, 900));
        context.setDefaultTimeout(Long.parseLong(setting("timeout", "30000")));
        page = context.newPage();
    }

    public static Page getPage() {
        if (page == null) {
            throw new IllegalStateException("Browser has not been initialized");
        }
        return page;
    }

    public static BrowserContext getContext() {
        if (context == null) {
            throw new IllegalStateException("Browser has not been initialized");
        }
        return context;
    }

    public static void closeBrowser() {
        if (context != null) {
            context.close();
            context = null;
        }
        if (browser != null) {
            browser.close();
            browser = null;
        }
        if (playwright != null) {
            playwright.close();
            playwright = null;
        }
        page = null;
    }

    private static String setting(String name, String defaultValue) {
        String value = System.getProperty(name);
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}
