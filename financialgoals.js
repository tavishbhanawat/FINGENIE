const goalsForm = document.getElementById('goals-form');
const goalsSummary = document.getElementById('goals-summary');
const monthlySavingsElem = document.getElementById('monthly-savings');
const investmentOptionsElem = document.getElementById('investment-options');
const aiResponse = document.getElementById('ai-response');

const voiceBtn = document.getElementById('voice-btn');
let recognition;

// Suggested investment options based on priority
const investmentOptionsMap = {
  urgent: ['High-yield savings account', 'Short-term bonds', 'Liquid mutual funds'],
  important: ['Balanced mutual funds', 'Index funds', 'Blue-chip stocks'],
  optional: ['Long-term equity funds', 'Real estate', 'Retirement plans']
};

// Simulated backend API call to calculate monthly savings
function calculateMonthlySavingsAPI(goalDesc, targetYear, targetAmount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentYear = new Date().getFullYear();
      const yearsToGoal = targetYear - currentYear;
      const monthlySavings = targetAmount / (yearsToGoal * 12);
      resolve(monthlySavings);
    }, 500); // simulate network delay
  });
}

// Simulated backend API call to get investment options
function getInvestmentOptionsAPI(priority) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(investmentOptionsMap[priority]);
    }, 500); // simulate network delay
  });
}

// Simulated AI integration with Gemini and Vertex AI
function generateAIInsightAPI(goalDesc, targetYear, monthlySavings, priority, investmentOptions) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let insightMsg = `To achieve your goal "${goalDesc}" by ${targetYear}, you need to save approximately ₹${monthlySavings.toFixed(2)} per month. `;
      insightMsg += `Based on your priority level "${priority}", we suggest the following investment options: ${investmentOptions.join(', ')}.`;
      resolve(insightMsg);
    }, 700); // simulate AI processing delay
  });
}

// Voice Input Integration (Web Speech API)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.onclick = function() {
    console.log('Voice input started');
    voiceBtn.textContent = '🎤 Listening...';
    recognition.start();
  };

  recognition.onresult = function(event) {
    console.log('Voice input result received');
    voiceBtn.textContent = '🎤 Speak Goal Details';
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('Transcript:', transcript);
    // Simple parsing: expects phrases like "buy car 2026 500000 urgent"
    const words = transcript.split(' ');

    // Reset inputs
    document.getElementById('goal-desc').value = '';
    document.getElementById('target-year').value = '';
    document.getElementById('target-amount').value = '';
    document.getElementById('goal-priority').value = 'urgent';

    if (words.length >= 4) {
      document.getElementById('goal-desc').value = words.slice(0, words.length - 3).join(' ');
      document.getElementById('target-year').value = words[words.length - 3];
      document.getElementById('target-amount').value = words[words.length - 2];
      if (['urgent', 'important', 'optional'].includes(words[words.length - 1])) {
        document.getElementById('goal-priority').value = words[words.length - 1];
      }
    }
  };

  recognition.onerror = function(event) {
    console.error('Voice input error:', event.error);
    voiceBtn.textContent = '🎤 Speak Goal Details';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
}

goalsForm.onsubmit = async function(e) {
  e.preventDefault();
  console.log('Form submitted');

  const goalDesc = document.getElementById('goal-desc').value.trim();
  const targetYear = Number(document.getElementById('target-year').value);
  const targetAmount = Number(document.getElementById('target-amount').value);
  const priority = document.getElementById('goal-priority').value;

  if (!goalDesc || isNaN(targetYear) || targetYear <= new Date().getFullYear() || isNaN(targetAmount) || targetAmount <= 0) {
    alert('Please enter valid goal description, target year (future), and target amount.');
    return;
  }

  goalsSummary.style.display = 'block';
  monthlySavingsElem.textContent = 'Calculating...';
  investmentOptionsElem.innerHTML = '';
  aiResponse.textContent = 'Generating AI insights...';

  try {
    const monthlySavings = await calculateMonthlySavingsAPI(goalDesc, targetYear, targetAmount);
    const investmentOptions = await getInvestmentOptionsAPI(priority);
    const aiInsight = await generateAIInsightAPI(goalDesc, targetYear, monthlySavings, priority, investmentOptions);

    monthlySavingsElem.textContent = `₹${monthlySavings.toFixed(2).toLocaleString()}`;
    investmentOptionsElem.innerHTML = '';
    investmentOptions.forEach(option => {
      const li = document.createElement('li');
      li.textContent = option;
      investmentOptionsElem.appendChild(li);
    });
    aiResponse.textContent = aiInsight;
  } catch (error) {
    console.error('Error in form submission:', error);
    monthlySavingsElem.textContent = 'Error calculating savings.';
    aiResponse.textContent = 'Error generating AI insights.';
  }
};
