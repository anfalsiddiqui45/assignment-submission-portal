const http = require("http");
const fs = require("fs");
const path = require("path");
const { validateSubmission } = require("./submissions");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "submissions.json");

function readSubmissions() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch (_) { return []; }
}

function writeSubmissions(submissions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(value));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/submissions") {
    return sendJson(response, 200, readSubmissions());
  }

  if (request.method === "POST" && url.pathname === "/api/submissions") {
    let body = "";
    request.on("data", (chunk) => body += chunk);
    request.on("end", () => {
      let submission;
      try { submission = JSON.parse(body); }
      catch (_) { return sendJson(response, 400, { errors: { submissionUrl: "Invalid request." } }); }

      const validation = validateSubmission(submission);
      if (!validation.valid) return sendJson(response, 400, validation);

      const submissions = readSubmissions();
      submissions.push({ ...submission, submittedAt: new Date().toISOString() });
      writeSubmissions(submissions);
      sendJson(response, 201, { success: true });
    });
    return;
  }

  const publicPath = path.join(__dirname, "public", url.pathname === "/" ? "index.html" : url.pathname.slice(1));
  fs.readFile(publicPath, (error, content) => {
    if (error) return sendJson(response, 404, { error: "Not found" });
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
    response.writeHead(200, { "Content-Type": types[path.extname(publicPath)] || "application/octet-stream" });
    response.end(content);
  });
});

server.listen(PORT, () => console.log(`Portal running at http://localhost:${PORT}`));
