package base;

import driver.PlaywrightManager;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

// Owner: Deva Vignan
public abstract class BaseTest {

    @BeforeMethod
    public void setUp() {
        PlaywrightManager.initializeBrowser();
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        PlaywrightManager.closeBrowser();
    }
}
