function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

const form = document.getElementById("symptomForm");
const resultCard = document.getElementById("resultCard");
const micBtn = document.getElementById("micBtn");
const userInput = document.getElementById("userInput");

function extractSymptomsFromText(text) {
  const symptomKeywords = {
    fever: ["fever", "feverish", "hot body", "high temperature", "temperature"],
    headache: ["headache", "head pain", "my head hurts"],
    chills: ["chills", "shivering", "cold", "coldness"],
    body_pain: ["body pain", "joint pain", "muscle pain", "body ache", "aches"],
    vomiting: ["vomit", "vomiting", "throwing up", "threw up"],
    weakness: ["weak", "weakness", "tired", "fatigue", "no strength", "exhausted"],
    nausea: ["nausea", "nauseous", "feeling like throwing up"],
    sweating: ["sweat", "sweating", "sweaty"]
  };

  const detected = [];
  const lowerText = text.toLowerCase();

  for (const symptom in symptomKeywords) {
    const keywords = symptomKeywords[symptom];
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detected.push(symptom);
        break;
      }
    }
  }

  return detected;
}

function formatSymptomName(symptom) {
  const names = {
    fever: "Fever",
    headache: "Headache",
    chills: "Chills",
    body_pain: "Body Pain",
    vomiting: "Vomiting",
    weakness: "Weakness",
    nausea: "Nausea",
    sweating: "Sweating"
  };

  return names[symptom] || symptom;
}

function analyzeSymptoms(symptoms, ageRange, duration) {
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

  if (ageRange === "child" || ageRange === "older") score += 1;

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

function showResult(result, symptoms, location, textInput) {
  const detectedSymptomsHtml = symptoms.length
    ? symptoms
        .map(symptom => `<span class="detected-item">${formatSymptomName(symptom)}</span>`)
        .join("")
    : `<span class="detected-item">No detected symptoms</span>`;

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
          <span>Location</span>
          <strong>${location || "Not provided"}</strong>
        </div>
        <div class="detail-box">
          <span>Input Method</span>
          <strong>${textInput ? "Text / Voice + Selection" : "Selection Only"}</strong>
        </div>
      </div>

      <div class="detected-box">
        <h4>AI Detected Symptoms</h4>
        <div class="detected-list">
          ${detectedSymptomsHtml}
        </div>
      </div>

      <div class="disclaimer">
        This tool is for awareness and screening support only. It does not replace
        professional diagnosis or laboratory malaria testing.
      </div>
    </div>
  `;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const selectedSymptoms = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map(input => input.value);

  const textInput = userInput.value.trim();
  const textSymptoms = extractSymptomsFromText(textInput);
  const symptoms = [...new Set([...selectedSymptoms, ...textSymptoms])];

  const ageRange = document.getElementById("ageRange").value;
  const duration = document.getElementById("duration").value;
  const location = document.getElementById("location").value.trim();

  if (symptoms.length === 0 && !textInput) {
    resultCard.innerHTML = `
      <div class="result-content">
        <span class="result-badge moderate">Input Needed</span>
        <h3>No symptoms provided</h3>
        <p>Please type, speak, or select at least one symptom to continue the analysis.</p>
      </div>
    `;
    return;
  }

  resultCard.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <h3>AI analyzing symptoms...</h3>
      <p>Please wait while AeroShield AI processes your symptom pattern.</p>
    </div>
  `;

  setTimeout(() => {
    const result = analyzeSymptoms(symptoms, ageRange, duration);
    showResult(result, symptoms, location, textInput);
  }, 1800);
});

let recognition = null;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.classList.add("listening");
    micBtn.textContent = "🔴";
    userInput.placeholder = "Listening...";
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
  };

  recognition.onend = function () {
    micBtn.classList.remove("listening");
    micBtn.textContent = "🎤";
    userInput.placeholder = "Example: I have fever, headache, chills and my body feels weak...";
  };

  recognition.onerror = function () {
    micBtn.classList.remove("listening");
    micBtn.textContent = "🎤";
    userInput.placeholder = "Example: I have fever, headache, chills and my body feels weak...";
  };
} else {
  micBtn.style.display = "none";
}