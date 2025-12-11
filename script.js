const mockApiUrl = 'https://mocki.io/v1/6e6e5e2e-2b2e-4e2e-8e2e-2e2e2e2e2e2e'; // Replace with your real endpoint

const sipForm = document.getElementById('sip-form');
const sipSummary = document.getElementById('sip-summary');
const totalInvested = document.getElementById('total-invested');
const currentValue = document.getElementById('current-value');
const returnsPercent = document.getElementById('returns-percent');
const forecastedValue = document.getElementById('forecasted-value');
const aiResponse = document.getElementById('ai-response');
let sipChart;

document.addEventListener('DOMContentLoaded', () => {
  // Toggle dropdown menu when clicking the menu icon
  const menuIcon = document.getElementById('menu-icon');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const closeDropdown = document.getElementById('close-dropdown');

  if (menuIcon && dropdownMenu) {
    menuIcon.addEventListener('click', () => {
      dropdownMenu.classList.toggle('hidden');
    });
  }

  if (closeDropdown && dropdownMenu) {
    closeDropdown.addEventListener('click', () => {
      dropdownMenu.classList.add('hidden');
    });
  }

  // Optional: Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add('hidden');
    }
  });

  // Access control for protected links
  const protectedLinks = document.querySelectorAll('.protected-link');
  const loginModal = document.getElementById('login-modal');
  const closeLogin = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  // Function to check if user is logged in
  function isUserLoggedIn() {
    return !!localStorage.getItem('fingenieUser');
  }

  // Show login modal
  function showLoginModal() {
    loginModal.classList.remove('hidden');
  }

  // Hide login modal
  function hideLoginModal() {
    loginModal.classList.add('hidden');
    loginError.textContent = '';
    loginForm.reset();
  }

  // Intercept clicks on protected links
  protectedLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isUserLoggedIn()) {
        e.preventDefault();
        showLoginModal();
      }
    });
  });

  // Close login modal on close button click
  closeLogin.addEventListener('click', () => {
    hideLoginModal();
  });

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      // Use Firebase auth to sign in
      const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js");
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('fingenieUser', JSON.stringify({ email: user.email, uid: user.uid }));
      hideLoginModal();
      alert(`Welcome ${user.email}! You are now logged in.`);
      // Optionally reload page or update UI
      window.location.reload();
    } catch (error) {
      loginError.textContent = 'Login failed: ' + error.message;
    }
  });

  // On page load, check login state and update UI accordingly
  if (isUserLoggedIn()) {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.textContent = 'Logout';
      loginButton.onclick = () => {
        localStorage.removeItem('fingenieUser');
        alert('You have been logged out.');
        window.location.reload();
      };
    }
  } else {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.textContent = 'Login';
      loginButton.onclick = () => {
        showLoginModal();
      };
    }
  }
});

// --- Form Submission ---
sipForm.onsubmit = async function(e) {
  e.preventDefault();
  // Get form values
  const amount = document.getElementById('sip-amount').value;
  const frequency = document.getElementById('sip-frequency').value;
  const fundType = document.getElementById('sip-fund-type').value;

  // Show loading state
  aiResponse.textContent = 'Analyzing your SIP...';
  sipSummary.style.display = 'block';

  // Fetch data from mock API
  try {
    const res = await fetch(mockApiUrl);
    const data = await res.json();
    // Example data structure from mock API:
    // { totalInvested: 12000, currentValue: 13200, returnsPercent: 10, forecastedValue: 25000, chartData: [12000, 12500, 13000, 13200], aiInsight: "Your SIP is performing well..." }
    totalInvested.textContent = `₹${data.totalInvested.toLocaleString()}`;
    currentValue.textContent = `₹${data.currentValue.toLocaleString()}`;
    returnsPercent.textContent = `${data.returnsPercent}%`;
    forecastedValue.textContent = `₹${data.forecastedValue.toLocaleString()}`;
    // Render chart
    renderSipChart(data.chartData);
    // Call Vertex AI/Gemini for AI chat bubble (placeholder)
    aiResponse.textContent = data.aiInsight || 'Your SIP analysis will appear here.';
  } catch (err) {
    aiResponse.textContent = 'Error fetching SIP data.';
  }
};

// --- Chart.js rendering ---
function renderSipChart(chartData) {
  const ctx = document.getElementById('sip-chart').getContext('2d');
  if (sipChart) sipChart.destroy();
  sipChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map((_, i) => `Month ${i+1}`),
      datasets: [{
        label: 'SIP Value',
        data: chartData,
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255,215,0,0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#ffd700' } } },
      scales: {
        x: { ticks: { color: '#ffd700' }, grid: { color: '#333' } },
        y: { ticks: { color: '#ffd700' }, grid: { color: '#333' } }
      }
    }
  });
}

// --- Voice Input Integration (Web Speech API) ---
const voiceBtn = document.getElementById('voice-btn');
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.onclick = async function() {
    voiceBtn.textContent = '🎤 Listening...';
    recognition.start();
  };

  recognition.onresult = async function(event) {
    voiceBtn.textContent = '🎤 Speak SIP Details';
    const transcript = event.results[0][0].transcript;
    // Simple parsing: "5000 monthly equity"
    const words = transcript.split(' ');
    if (words.length >= 3) {
      document.getElementById('sip-amount').value = words[0].replace(/\D/g, '');
      document.getElementById('sip-frequency').value = words[1].toLowerCase().includes('month') ? 'monthly' : 'quarterly';
      document.getElementById('sip-fund-type').value = ['equity','debt','hybrid'].find(type => words[2].toLowerCase().includes(type)) || 'equity';
    }
    // Use Gemini prototype to get AI response
    if (typeof sendVoiceCommandToGemini === 'function') {
      const geminiResponse = await sendVoiceCommandToGemini(transcript);
      const aiResponseElem = document.getElementById('ai-response');
      if (aiResponseElem) {
        aiResponseElem.textContent = geminiResponse;
      }
    }
  };

  recognition.onerror = function() {
    voiceBtn.textContent = '🎤 Speak SIP Details';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
};

