const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const OUTPUT = path.join(__dirname, "..", "test-report.json");

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  response.end(JSON.stringify(value));
}

function validReport(report) {
  const required = [
    "repositoryName", "branch", "commitSha", "pipelineRunIdentifier",
    "executionTimestamp", "tests", "total", "passed", "failed", "overallStatus"
  ];
  return required.every((field) => Object.prototype.hasOwnProperty.call(report, field));
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    return sendJson(response, 200, { status: "ready", outputFile: OUTPUT });
  }

  if (request.method !== "POST" || request.url !== "/report") {
    return sendJson(response, 404, { error: "Use GET /health or POST /report" });
  }

  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 2 * 1024 * 1024) {
      return sendJson(response, 413, { error: "Report is too large" });
    }
  });

  request.on("end", () => {
    try {
      const report = JSON.parse(body);
      if (!validReport(report)) {
        return sendJson(response, 400, { error: "Incomplete test report" });
      }

      const temporaryFile = `${OUTPUT}.tmp`;
      fs.writeFileSync(temporaryFile, JSON.stringify(report, null, 2) + "\n");
      fs.renameSync(temporaryFile, OUTPUT);

      console.log(`Saved ${report.overallStatus} report for ${report.repositoryName}@${report.commitSha} to ${OUTPUT}`);
      sendJson(response, 200, { success: true, savedTo: OUTPUT, overallStatus: report.overallStatus });
    } catch (_) {
      sendJson(response, 400, { error: "Invalid JSON" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Report receiver listening at http://localhost:${PORT}`);
  console.log(`POST reports to http://localhost:${PORT}/report`);
  console.log(`Reports will be saved to ${OUTPUT}`);
});
