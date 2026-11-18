const fs = require("fs");
const path = require("path");
const { validateSubmission } = require("../submissions");

const tests = [];
function test(name, fn) {
  try { fn(); tests.push({ name, result: "passed", failureMessage: null }); }
  catch (error) { tests.push({ name, result: "failed", failureMessage: error.message }); }
}

let saved = [];
function save(submission) {
  const validation = validateSubmission(submission);
  if (validation.valid) saved.push(submission);
  return validation;
}

test("Complete details and a valid submission URL", () => {
  saved = [];
  const input = { name: "Ali Khan", registrationNumber: "FA24-001", assignmentTitle: "HTML Assignment", submissionUrl: "https://example.com/submission" };
  const result = save(input);
  if (!result.valid) throw new Error("Valid submission was rejected");
  if (saved.length !== 1) throw new Error("Submission was not saved");
  if (saved[0].assignmentTitle !== "HTML Assignment") throw new Error("Submission did not appear in the list");
});

test("Missing registration number", () => {
  saved = [];
  const result = save({ name: "Ali Khan", registrationNumber: "", assignmentTitle: "HTML Assignment", submissionUrl: "https://example.com/submission" });
  if (result.valid) throw new Error("Submission with missing registration number was accepted");
  if (!result.errors.registrationNumber) throw new Error("Registration number validation message was absent");
  if (saved.length !== 0) throw new Error("Invalid submission was saved");
});

test("Invalid submission URL", () => {
  saved = [];
  const result = save({ name: "Ali Khan", registrationNumber: "FA24-001", assignmentTitle: "HTML Assignment", submissionUrl: "not-a-url" });
  if (result.valid) throw new Error("Submission with invalid URL was accepted");
  if (!result.errors.submissionUrl) throw new Error("URL validation message was absent");
  if (saved.length !== 0) throw new Error("Invalid submission was saved");
});

const passed = tests.filter((item) => item.result === "passed").length;
const failed = tests.length - passed;
const report = {
  repositoryName: process.env.GITHUB_REPOSITORY || path.basename(path.dirname(__dirname)),
  branch: process.env.GITHUB_REF_NAME || "local",
  commitSha: process.env.GITHUB_SHA || "local",
  pipelineRunIdentifier: process.env.GITHUB_RUN_ID || "local-run",
  executionTimestamp: new Date().toISOString(),
  tests,
  total: tests.length,
  passed,
  failed,
  overallStatus: failed === 0 ? "passed" : "failed"
};

fs.writeFileSync(path.join(__dirname, "..", "test-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = failed === 0 ? 0 : 1;
