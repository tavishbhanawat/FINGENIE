// --- Anomaly Detection JavaScript ---

const anomalyForm = document.getElementById('anomaly-form');
const anomalySummary = document.getElementById('anomaly-summary');
const anomalyStatusElem = document.getElementById('anomaly-status');
const aiResponse = document.getElementById('ai-response');

const voiceBtn = document.getElementById('voice-btn');
let recognition;

// Simple anomaly detection logic
// For demo: flag transactions above a threshold or with suspicious keywords
const anomalyThreshold = 50000; // Example threshold for large spend
const suspiciousKeywords = ['duplicate', 'fraud', 'unauthorized', 'error', 'refund'];

// Voice Input Integration (Web Speech API)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.onclick = function() {
    voiceBtn.textContent = '🎤 Listening...';
    recognition.start();
  };

  recognition.onresult = function(event) {
    voiceBtn.textContent = '🎤 Speak Transaction';
    const transcript = event.results[0][0].transcript.toLowerCase();
    // Attempt to parse description and amount from transcript
    // Example: "payment 60000" or "refund 5000"
    const words = transcript.split(' ');
    let amount = null;
    let descriptionWords = [];

    words.forEach(word => {
      if (!isNaN(word)) {
        amount = parseFloat(word);
      } else {
        descriptionWords.push(word);
      }
    });

    const description = descriptionWords.join(' ');

    document.getElementById('transaction-desc').value = description;
    document.getElementById('transaction-amount').value = amount || '';

    // Automatically submit form if amount and description present
    if (description && amount !== null) {
      anomalyForm.dispatchEvent(new Event('submit'));
    }
  };

  recognition.onerror = function() {
    voiceBtn.textContent = '🎤 Speak Transaction';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
}

anomalyForm.onsubmit = function(e) {
  e.preventDefault();

  const description = document.getElementById('transaction-desc').value.toLowerCase();
  const amount = Number(document.getElementById('transaction-amount').value);

  if (!description || isNaN(amount) || amount <= 0) {
    alert('Please enter valid transaction description and amount.');
    return;
  }

  let isAnomaly = false;
  let reasons = [];

  if (amount > anomalyThreshold) {
    isAnomaly = true;
    reasons.push(`Large transaction amount: ₹${amount.toLocaleString()}`);
  }

  suspiciousKeywords.forEach(keyword => {
    if (description.includes(keyword)) {
      isAnomaly = true;
      reasons.push(`Suspicious keyword detected: "${keyword}"`);
    }
  });

  anomalySummary.style.display = 'block';

  if (isAnomaly) {
    anomalyStatusElem.textContent = 'Anomaly Detected!';
    anomalyStatusElem.style.color = '#e53935'; // red
  } else {
    anomalyStatusElem.textContent = 'No Anomaly Detected.';
    anomalyStatusElem.style.color = '#43a047'; // green
  }

  // AI Insight generation (simple)
  let insightMsg = `Transaction "${description}" of amount ₹${amount.toLocaleString()} was analyzed. `;
  if (isAnomaly) {
    insightMsg += `Potential issues found: ${reasons.join('; ')}. Please review this transaction carefully.`;
  } else {
    insightMsg += 'No suspicious activity detected. Transaction appears normal.';
  }

  aiResponse.textContent = insightMsg;
};
