function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

const form = document.getElementById("symptomForm");
const resultCard = document.getElementById("resultCard");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const symptoms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map((input) => input.value);

  const ageRange = document.getElementById("ageRange").value;
  const duration = document.getElementById("duration").value;
  const location = document.getElementById("location").value.trim();

  if (symptoms.length === 0) {
    resultCard.innerHTML = `
      <div class="result-content">
        <span class="result-badge moderate">Input Needed</span>
        <h3>No symptoms selected</h3>
        <p>Please select at least one symptom to continue the analysis.</p>
      </div>
    `;
    return;
  }

  resultCard.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <h3>AI analyzing symptoms...</h3>
      <p>Please wait while MalaSense AI processes your symptom pattern.</p>
    </div>
  `;

  setTimeout(() => {
    const result = analyzeSymptoms(symptoms, ageRange, duration, location);
    showResult(result, symptoms, location);
  }, 1800);
});

function analyzeSymptoms(symptoms, ageRange, duration, location) {
  let score = 0;

  if (symptoms.includes("fever")) score += 3;
  if (symptoms.includes("chills")) score += 3;
  if (symptoms.includes("headache")) score += 2;
  if (symptoms.includes("body_pain")) score += 2;
  if (symptoms.includes("vomiting")) score += 2;
  if (symptoms.includes("weakness")) score += 2;
  if (symptoms.includes("nausea")) score += 1;
  if (symptoms.includes("sweating")) score += 1;

  if (duration === "3") score += 1;
  if (duration === "5") score += 2;

  if (ageRange === "child" || ageRange === "older") {
    score += 1;
  }

  if (score >= 9) {
    return {
      level: "High Risk",
      className: "high",
      confidence: "86%",
      advice: "Your symptom pattern may be consistent with malaria. Visit a clinic or hospital as soon as possible for proper testing and treatment.",
      urgency: "Immediate medical testing recommended"
    };
  } else if (score >= 5) {
    return {
      level: "Moderate Risk",
      className: "moderate",
      confidence: "64%",
      advice: "Some of your symptoms may suggest malaria. Monitor closely and seek testing if symptoms persist or worsen.",
      urgency: "Testing advised within 24 hours"
    };
  } else {
    return {
      level: "Low Risk",
      className: "low",
      confidence: "31%",
      advice: "Your current symptom pattern suggests a lower malaria risk, but continue observing your health and seek care if symptoms increase.",
      urgency: "Monitor symptoms carefully"
    };
  }
}

function showResult(result, symptoms, location) {
  const symptomList = symptoms
    .map((symptom) => symptom.replace("_", " "))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(", ");

  resultCard.innerHTML = `
    <div class="result-content">
      <span class="result-badge ${result.className}">${result.level}</span>
      <h3>${result.level}</h3>
      <p>${result.advice}</p>

      <div class="result-details">
        <div class="detail-box">
          <span>Confidence</span>
          <strong>${result.confidence}</strong>
        </div>
        <div class="detail-box">
          <span>Urgency</span>
          <strong>${result.urgency}</strong>
        </div>
        <div class="detail-box">
          <span>Symptoms Selected</span>
          <strong>${symptomList}</strong>
        </div>
        <div class="detail-box">
          <span>Location</span>
          <strong>${location || "Not provided"}</strong>
        </div>
      </div>

      <div class="disclaimer">
        This tool is for awareness and screening support only. It does not replace professional diagnosis or laboratory malaria testing.
      </div>
    </div>
  `;
}