const form = document.querySelector("#submission-form");
const submissionsBody = document.querySelector("#submissions");

function localSubmissions() {
  try { return JSON.parse(localStorage.getItem("submissions") || "[]"); }
  catch (_) { return []; }
}

function render(submissions) {
  submissionsBody.innerHTML = "";
  submissions.forEach((submission) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td></td><td></td><td></td><td><a target="_blank" rel="noopener"></a></td>`;
    row.children[0].textContent = submission.name;
    row.children[1].textContent = submission.registrationNumber;
    row.children[2].textContent = submission.assignmentTitle;
    row.children[3].querySelector("a").textContent = submission.submissionUrl;
    row.children[3].querySelector("a").href = submission.submissionUrl;
    submissionsBody.appendChild(row);
  });
}

async function loadSubmissions() {
  try {
    const response = await fetch("/api/submissions");
    if (response.ok) return render(await response.json());
  } catch (_) {}
  render(localSubmissions());
}

function validate(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = "Name is required.";
  if (!data.registrationNumber.trim()) errors.registrationNumber = "Registration number is required.";
  if (!data.assignmentTitle.trim()) errors.assignmentTitle = "Assignment title is required.";
  try {
    const url = new URL(data.submissionUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch (_) {
    errors.submissionUrl = "Enter a valid HTTP or HTTPS URL.";
  }
  return errors;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  document.querySelectorAll(".error").forEach((element) => element.textContent = "");
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok) {
      Object.entries(result.errors || {}).forEach(([field, message]) => {
        const target = document.querySelector(`[data-error="${field}"]`);
        if (target) target.textContent = message;
      });
      document.querySelector("#form-message").textContent = "Submission was not saved.";
      return;
    }
  } catch (_) {
    const errors = validate(data);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, message]) => {
        const target = document.querySelector(`[data-error="${field}"]`);
        if (target) target.textContent = message;
      });
      document.querySelector("#form-message").textContent = "Submission was not saved.";
      return;
    }
    const submissions = localSubmissions();
    submissions.push({ ...data, submittedAt: new Date().toISOString() });
    localStorage.setItem("submissions", JSON.stringify(submissions));
  }

  form.reset();
  document.querySelector("#form-message").textContent = "Submission saved successfully.";
  loadSubmissions();
});

loadSubmissions();
