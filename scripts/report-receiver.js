const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const OUTPUT = path.join(__dirname, "..", "test-report.json");

const server = http.createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/report") {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "Use POST /report" }));
  }

  let body = "";
  request.on("data", (chunk) => body += chunk);
  request.on("end", () => {
    try {
      const report = JSON.parse(body);
      fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2));
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, savedTo: OUTPUT }));
      console.log(`Saved report to ${OUTPUT}`);
    } catch (_) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Report receiver listening at http://localhost:${PORT}/report`);
  console.log(`Reports will be saved to ${OUTPUT}`);
});
