# HTML & CSS Processors
* Markup is written in Pug, which compiles into HTML
* Styles are written in Sass, using the SCSS synthax, which compiles into CSS

# Local Development
For local development we use Prepos (https://prepros.io/) to compile and get a live preview of the HTML pages.

# Deployment & Hosting
* The pages are hosted on GitHub Pages at https://trustyou.github.io/ota-demo
* The contents on the GitHub Pages is updated when a new commit is pushed to the "gh-pages" branch
* In order to update the "gh-pages" branch (which is a subtree of the main branch) run the following command:
```bash
# Run this command while on the main branch
git subtree push --prefix frontend https://YOUR_GITHUB_TOKEN@github.com/trustyou/ota-demo.git gh-pages
```
* The push requires write access to the "gh-pages" branch
* After the push, go to GitHub Pages to see the status of the deployment and to test the deployed artifacts