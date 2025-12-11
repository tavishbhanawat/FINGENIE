// --- Privacy & Security JavaScript ---

const voiceBtn = document.getElementById('voice-btn');
const aiResponse = document.getElementById('ai-response');
let recognition;

// Simulated AI responses for privacy queries
const privacyResponses = {
  encryption: "Your data is encrypted both in transit and at rest using industry-standard protocols.",
  biometric: "Biometric login ensures secure and convenient authentication using your unique biological traits.",
  access: "You have full control over who can access your financial data, with options to revoke permissions anytime.",
  sharing: "Shareable financial snapshots allow you to share limited information for a limited time securely.",
  autologout: "Auto-logout and remote data wipe features protect your account from unauthorized access.",
  default: "Fingenie prioritizes your privacy and security with robust measures and transparent policies."
};

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
    voiceBtn.textContent = '🎤 Speak Privacy Query';
    const transcript = event.results[0][0].transcript.toLowerCase();

    // Simple keyword matching for AI response
    let response = privacyResponses.default;
    if (transcript.includes('encrypt')) {
      response = privacyResponses.encryption;
    } else if (transcript.includes('biometric')) {
      response = privacyResponses.biometric;
    } else if (transcript.includes('access')) {
      response = privacyResponses.access;
    } else if (transcript.includes('share')) {
      response = privacyResponses.sharing;
    } else if (transcript.includes('auto logout') || transcript.includes('remote wipe')) {
      response = privacyResponses.autologout;
    }

    aiResponse.textContent = response;
  };

  recognition.onerror = function() {
    voiceBtn.textContent = '🎤 Speak Privacy Query';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
}
