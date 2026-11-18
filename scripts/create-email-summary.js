const fs = require("fs");

const report = JSON.parse(fs.readFileSync("test-report.json", "utf8"));
const testLines = report.tests.map((test) => {
  const failure = test.failureMessage ? ` — ${test.failureMessage}` : "";
  return `- ${test.name}: ${test.result}${failure}`;
});

const summary = [
  `Test Report: ${report.overallStatus.toUpperCase()}`,
  `Repository: ${report.repositoryName}`,
  `Branch: ${report.branch}`,
  `Commit: ${report.commitSha}`,
  `Pipeline run: ${report.pipelineRunIdentifier}`,
  `Timestamp: ${report.executionTimestamp}`,
  `Total: ${report.total}`,
  `Passed: ${report.passed}`,
  `Failed: ${report.failed}`,
  "",
  "Test results:",
  ...testLines
].join("\n");

fs.writeFileSync("email-summary.txt", summary);
console.log(summary);
