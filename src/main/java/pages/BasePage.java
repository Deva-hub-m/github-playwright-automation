package pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import driver.PlaywrightManager;

// Owner: Deva Vignan
public abstract class BasePage {

    protected final Page page;

    protected BasePage() {
        page = PlaywrightManager.getPage();
    }

    protected void navigate(String url) {
        page.navigate(url);
    }

    protected void click(String selector) {
        page.locator(selector).click();
    }

    protected void fill(String selector, String value) {
        page.locator(selector).fill(value);
    }

    protected String text(String selector) {
        return page.locator(selector).innerText();
    }

    protected boolean isVisible(String selector) {
        return page.locator(selector).isVisible();
    }

    protected Locator locator(String selector) {
        return page.locator(selector);
    }

    public String getTitle() {
        return page.title();
    }
}
