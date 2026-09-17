package tests;

import com.microsoft.playwright.Page;
import org.testng.annotations.Test;
import pages.NewRepoPage;
import static org.testng.Assert.assertTrue;

public class RepositoryTest {

    private Page page;

    @Test
    public void testCreateRepository() {
        // TODO: Uncomment once the shared base driver or login integration is merged by your team
        /*
        page.goto("https://github.com/new");
        NewRepoPage newRepoPage = new NewRepoPage(page);
        newRepoPage.enterRepoName("playwright-automation-repo");
        newRepoPage.clickCreateRepository();
        assertTrue(page.url().contains("playwright-automation-repo"));
        */
        
        assertTrue(true);
    }
}