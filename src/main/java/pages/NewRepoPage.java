package pages;

import com.microsoft.playwright.Page;

public class NewRepoPage {
    private final Page page;

    private final String repoNameInput = "input[name='repository[name]']";
    private final String createRepoButton = "button[type='submit']:has-text('Create repository')";

    public NewRepoPage(Page page) {
        this.page = page;
    }

    public void enterRepoName(String repoName) {
        page.fill(repoNameInput, repoName);
    }

    public void clickCreateRepository() {
        page.click(createRepoButton);
    }
}