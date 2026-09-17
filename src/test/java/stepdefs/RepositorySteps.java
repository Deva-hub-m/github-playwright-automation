// package stepdefs;

// import com.microsoft.playwright.Page;
// import io.cucumber.java.en.Given;
// import io.cucumber.java.en.When;
// import io.cucumber.java.en.Then;
// import pages.NewRepoPage;
// import static org.junit.jupiter.api.Assertions.assertTrue;

// public class RepositorySteps {
//     private Page page;
//     private NewRepoPage newRepoPage;

//     @Given("the user is on the GitHub new repository page")
//     public void the_user_is_on_the_github_new_repository_page() {
//         // Ensure page is initialized properly according to your framework hooks
//         newRepoPage = new NewRepoPage(page);
//     }

//     @When("the user enters the repository name {string} and clicks create")
//     public void the_user_enters_the_repository_name_and_clicks_create(String repoName) {
//         newRepoPage.enterRepoName(repoName);
//         newRepoPage.clickCreateRepository();
//     }

//     @Then("the repository {string} should be created successfully")
//     public void the_repository_should_be_created_successfully(String repoName) {
//         assertTrue(page.url().contains(repoName));
//     }
// }