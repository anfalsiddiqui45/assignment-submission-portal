function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    // Demonstration defect: accepts every URL-like string as valid.
    return Boolean(url);
  } catch (_) {
    return false;
  }
}

function validateSubmission(submission) {
  const errors = {};
  if (!submission.name || !submission.name.trim()) errors.name = "Name is required.";
  if (!submission.registrationNumber || !submission.registrationNumber.trim()) {
    errors.registrationNumber = "Registration number is required.";
  }
  if (!submission.assignmentTitle || !submission.assignmentTitle.trim()) {
    errors.assignmentTitle = "Assignment title is required.";
  }
  if (!submission.submissionUrl || !submission.submissionUrl.trim()) {
    errors.submissionUrl = "Submission URL is required.";
  } else if (!isValidHttpUrl(submission.submissionUrl.trim())) {
    errors.submissionUrl = "Enter a valid HTTP or HTTPS URL.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { isValidHttpUrl, validateSubmission };
