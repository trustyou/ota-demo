# Meta-Review OTA Demo
This project exemplifies how to implement a Hotel OTA website using TrustYou Meta-Review data.

# Repo structure
* All required components are persisted in a single repo:
  * frontend
  * bankend
  * ETL
* The `frontend` folder is in fact a [subtree](https://www.atlassian.com/git/tutorials/git-subtree)
  * That means that a different repo (well, really a branch) is mapped into this folder.
  * This way we can decouple the frontend from the rest of the project and host it at https://trustyou.github.io/ota-demo
  * You can find additional info about this structure and how to properly deploy a change in the `README` file in the `frontend` file.