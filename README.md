# DentalFlow - Dental Practice Management

This is a comprehensive multi-user web application for dental practice management.

## Deployment to GitHub Pages

This application is configured to be easily deployed to GitHub Pages. Follow these steps:

1.  **Create a GitHub Repository:**
    *   Create a new public repository on your GitHub account. Do not initialize it with a README, .gitignore, or license.

2.  **Push Your Code:**
    *   In your local project folder, initialize a git repository and push your code to the new GitHub repository.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    git push -u origin main
    ```
    *   Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.

3.  **Configure GitHub Pages:**
    *   Go to your repository on GitHub.
    *   Click on the **Settings** tab.
    *   In the left sidebar, click on **Pages**.
    *   Under "Build and deployment", for the **Source**, select **Deploy from a branch**.
    *   Under "Branch", select `main` and `/ (root)`.
    *   Click **Save**.

4.  **Access Your Site:**
    *   GitHub will start a deployment process. It may take a minute or two.
    *   Once the deployment is complete, your live site will be available at the URL shown on the Pages settings screen (usually `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`).

Because the application uses `HashRouter`, all routing is handled on the client-side, making it perfectly compatible with GitHub Pages' static hosting.
