// Gemini AI Prototype Integration for Voice Command and API

// Simulated function to send voice command text to Gemini API
async function sendVoiceCommandToGemini(commandText) {
  console.log('Sending command to Gemini:', commandText);

  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulated Gemini response based on commandText
      let response = "Sorry, I didn't understand that.";
      if (commandText.toLowerCase().includes('net worth')) {
        response = "Your net worth is ₹10,00,000 with assets growing steadily.";
      } else if (commandText.toLowerCase().includes('sip')) {
        response = "Your SIP in equity funds has grown by 12% this year.";
      } else if (commandText.toLowerCase().includes('loan')) {
        response = "Your loan EMI is ₹15,000 per month with 7% interest rate.";
      } else if (commandText.toLowerCase().includes('financial goal')) {
        response = "You need to save ₹20,000 monthly to meet your retirement goal by 2040.";
      } else if (commandText.toLowerCase().includes('anomaly')) {
        response = "No anomalies detected in your recent transactions.";
      } else if (commandText.toLowerCase().includes('privacy')) {
        response = "Your data is encrypted and fully under your control.";
      }
      resolve(response);
    }, 1000);
  });
}

// Example function to handle voice input and get Gemini response
function setupVoiceCommandIntegration(buttonId, responseElementId) {
  const voiceBtn = document.getElementById(buttonId);
  const responseElem = document.getElementById(responseElementId);

  if (!voiceBtn || !responseElem) {
    console.error('Voice button or response element not found');
    return;
  }

  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.onclick = () => {
      voiceBtn.textContent = '🎤 Listening...';
      recognition.start();
    };

    recognition.onresult = async (event) => {
      voiceBtn.textContent = '🎤 Speak';
      const transcript = event.results[0][0].transcript;
      responseElem.textContent = 'Processing...';
      const geminiResponse = await sendVoiceCommandToGemini(transcript);
      responseElem.textContent = geminiResponse;
    };

    recognition.onerror = (event) => {
      voiceBtn.textContent = '🎤 Speak';
      responseElem.textContent = 'Error recognizing speech. Please try again.';
      console.error('Speech recognition error:', event.error);
    };
  } else {
    voiceBtn.onclick = () => {
      alert('Voice input not supported in this browser.');
    };
  }
}

// Export functions for usage in other modules or pages
export { sendVoiceCommandToGemini, setupVoiceCommandIntegration };
