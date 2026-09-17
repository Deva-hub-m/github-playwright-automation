package pages;

import com.microsoft.playwright.Page;

public class RepoHomePage {
    private final Page page;

    public RepoHomePage(Page page) {
        this.page = page;
    }

    public boolean isRepoHeaderVisible(String repoName) {
        return page.isVisible("strong[itemprop='name'] a:has-text('" + repoName + "')");
    }
}