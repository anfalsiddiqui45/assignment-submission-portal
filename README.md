# Assignment Submission Portal

A simple plain HTML/CSS/JavaScript portal with a dependency-free Node.js server.

## Run the portal locally

```sh
node server.js
```

Open `http://localhost:3000`. Valid submissions are saved in `submissions.json`; invalid submissions are rejected.

## Run the tests

```sh
npm test
```

The tests execute three required cases and create `test-report.json`. A failed test exits with a non-zero status.

## Start the local report receiver

```sh
npm run receiver
```

The receiver listens at `http://localhost:8787/report` and replaces `test-report.json` whenever GitHub sends a report.

Keep the receiver running during pushes. To expose it to GitHub-hosted runners, start a tunnel such as ngrok:

```sh
ngrok http 8787
```

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

- Name: `REPORT_RECEIVER_URL`
- Value: the tunnel base URL, for example `https://abc123.ngrok-free.app`

The workflow sends `test-report.json` to `<REPORT_RECEIVER_URL>/report` after every test run, including failing runs. GitHub Actions will not deliver to `localhost` on a hosted runner, so the tunnel and receiver are required for local demonstration.

## GitHub setup

```sh
git init
git add .
git commit -m "Initial assignment portal"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

Every push runs `.github/workflows/ci.yml`. The test stage executes the tests and fails on a failed test. The report is sent to the local receiver before the test stage is failed. For GitHub Pages, enable **Settings → Pages → Source: GitHub Actions**. A push to `main` deploys only after tests pass; failed tests prevent the deployment job and leave the previous deployment unchanged.

## Demonstration sequence

1. Start `npm run receiver` and the tunnel, and configure `REPORT_RECEIVER_URL`.
2. Push a passing revision and show the green test stage and local `test-report.json`.
3. Introduce a defect (for example, change a validation test or portal rule), push, and show the red test stage plus the automatically replaced failing JSON report.
4. Revert/fix the defect and push again. Show the passing JSON report and, on `main`, the deployed static Pages frontend.

## Technology

Plain HTML, CSS, browser JavaScript, Node.js standard library, GitHub Actions, and GitHub Pages. No frontend or backend framework is used.
