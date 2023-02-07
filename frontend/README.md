# HTML & CSS Processors
* Markup is written in Pug, which compiles into HTML
* Styles are written in Sass, using the SCSS synthax, which compiles into CSS

# Local Development
For local development we use Prepos (https://prepros.io/) to compile and get a live preview of the HTML pages.

# Hosting
* The `frontend` folder is mapped to the `gh-pages` branch in the same repo via a [subtree](https://www.atlassian.com/git/tutorials/git-subtree).
* This enables to:
  * host the frontend part on GitHub Pages at https://trustyou.github.io/ota-demo
  * decouple the development in the frontend from the rest of the project
* The contents on the GitHub Pages is updated when a new commit is pushed to the `gh-pages` branch.
  * Anyway, we discourage updating directly this branch. Instead, follow the recommended process in next section. 

# Deployment
* Create a new branch in your local env from the latest `main` branch.
* Add your changes into the new branch (it doesn't matter if they apply to the frontend or not)
* Create a PR and get it approved. Then, merge the changes to `main` branch.
* Pull latest `main` branch into local.
* Now, in order to update the `gh-pages` branch (which is really a subtree), run the following command:
```bash
# Run this command while on the main branch
git subtree push --prefix frontend https://YOUR_GITHUB_TOKEN@github.com/trustyou/ota-demo.git gh-pages
```
  * The push requires write access to the `gh-pages` branch
  * Note only changes related to frontend files are committed to `gh-pages` branch.
* After the push, go to GitHub Pages to see the status of the deployment and to test the deployed artifacts