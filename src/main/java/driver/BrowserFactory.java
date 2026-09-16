package driver;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

// Owner: Deva Vignan
public final class BrowserFactory {

    private BrowserFactory() {
    }

    public static Browser launch(Playwright playwright) {
        String browserName = setting("browser", "chromium").toLowerCase();
        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
                .setHeadless(Boolean.parseBoolean(setting("headless", "false")))
                .setSlowMo(Double.parseDouble(setting("slowMo", "0")));

        return switch (browserName) {
            case "chromium" -> playwright.chromium().launch(options);
            case "firefox" -> playwright.firefox().launch(options);
            case "webkit" -> playwright.webkit().launch(options);
            default -> throw new IllegalArgumentException(
                    "Unsupported browser '" + browserName + "'. Use chromium, firefox, or webkit.");
        };
    }

    private static String setting(String name, String defaultValue) {
        String systemValue = System.getProperty(name);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }

        String environmentValue = System.getenv(name.toUpperCase());
        if (environmentValue != null && !environmentValue.isBlank()) {
            return environmentValue.trim();
        }

        return defaultValue;
    }
}
