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

## Start the local report receiver with Ngrok

First, install Ngrok and connect it to your Ngrok account:

```sh
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

Then start the receiver and public HTTPS tunnel together:

```sh
npm run tunnel
```

Ngrok prints a public HTTPS forwarding URL, for example `https://abc123.ngrok-free.app`. In the GitHub repository, open **Settings → Secrets and variables → Actions → Repository secrets → New repository secret** and add:

- Name: `REPORT_RECEIVER_URL`
- Value: the Ngrok HTTPS URL without `/report`

Keep `npm run tunnel` running during every demonstration push. The workflow sends `test-report.json` with `POST https://YOUR-NGROK-DOMAIN/report`; the receiver validates the JSON and atomically replaces the local `test-report.json`. A separate `npm run receiver` command can be used when only localhost delivery is needed.

The receiver is available at `http://localhost:8787/report`, and `http://localhost:8787/health` confirms that it is running. GitHub-hosted runners require the Ngrok URL because their `localhost` is not your computer.

## Email test report setup

For Gmail or another SMTP provider, add these GitHub repository secrets:

- `EMAIL_ADDRESS`: recipient email address
- `SMTP_HOST`: provider host, for example `smtp.gmail.com`
- `SMTP_PORT`: provider TLS port, usually `465`
- `SMTP_USERNAME`: sender SMTP username
- `SMTP_PASSWORD`: provider app password or SMTP password
- `EMAIL_FROM`: optional sender address; defaults to `SMTP_USERNAME`

After every test run, passing or failing, the workflow creates `email-summary.txt`, sends the summary, and attaches `test-report.json`. Email sending is skipped when the SMTP secrets are not configured.

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

1. Start `npm run tunnel`, copy the HTTPS forwarding URL, and configure `REPORT_RECEIVER_URL`.
2. Push a passing revision and show the green test stage and local `test-report.json`.
3. Introduce a defect (for example, change a validation test or portal rule), push, and show the red test stage plus the automatically replaced failing JSON report.
4. Revert/fix the defect and push again. Show the passing JSON report and, on `main`, the deployed static Pages frontend.

## Technology

Plain HTML, CSS, browser JavaScript, Node.js standard library, GitHub Actions, and GitHub Pages. No frontend or backend framework is used.
