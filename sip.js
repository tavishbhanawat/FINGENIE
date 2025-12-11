// --- Dynamic SIP Calculation in Browser ---
const sipForm = document.getElementById('sip-form');
const sipSummary = document.getElementById('sip-summary');
const totalInvested = document.getElementById('total-invested');
const currentValue = document.getElementById('current-value');
const returnsPercent = document.getElementById('returns-percent');
const forecastedValue = document.getElementById('forecasted-value');
const aiResponse = document.getElementById('ai-response');
let sipChart;
let sipPieChart;

// --- Chart.js Line Chart (SIP Growth) ---
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
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#ffd700' } } },
      scales: {
        x: { ticks: { color: '#ffd700' }, grid: { color: '#333' } },
        y: { ticks: { color: '#ffd700' }, grid: { color: '#333' } }
      }
    }
  });
}

// --- Google Charts 3D Pie Chart (Invested vs. Returns vs. Forecasted Gain vs. Current Value) ---
let googleChartsLoaded = false;

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
  googleChartsLoaded = true;
});

function renderGooglePieChart(totalInvestedVal, returnsVal, forecastedVal, currentVal) {
  if (!googleChartsLoaded) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(() => renderGooglePieChart(totalInvestedVal, returnsVal, forecastedVal, currentVal));
    return;
  }
  // Defensive: Ensure values are numbers and non-negative
  totalInvestedVal = Math.max(Number(totalInvestedVal) || 0, 0);
  returnsVal = Math.max(Number(returnsVal) || 0, 0);
  forecastedVal = Math.max(Number(forecastedVal) || 0, 0);
  currentVal = Math.max(Number(currentVal) || 0, 0);

  var data = google.visualization.arrayToDataTable([
    ['Category', 'Amount'],
    ['Invested', totalInvestedVal],
    ['Returns', returnsVal],
    ['Forecasted Gain', forecastedVal],
    ['Current Value', currentVal]
  ]);
  var options = {
    title: 'SIP Distribution (3D)',
    is3D: true,
    backgroundColor: '#111',
    legend: { textStyle: { color: '#ffd700', fontSize: 14 } },
    slices: {
      0: { color: '#ffd700' }, // Gold
      1: { color: '#43a047' }, // Deep Green
      2: { color: '#1976d2' }, // Blue
      3: { color: '#ff9800' }  // Orange
    },
    chartArea: { left: 10, top: 30, width: '90%', height: '80%' },
    fontName: 'Segoe UI',
    titleTextStyle: { color: '#ffd700', fontSize: 18 }
  };
  if (sipPieChart) sipPieChart.clearChart();
  sipPieChart = new google.visualization.PieChart(document.getElementById('google-piechart'));
  sipPieChart.draw(data, options);
}

// --- AI Insight Generation (Enhanced) ---
function generateAIInsight(returnsPercent, fundType, currentValue, forecastedValue, monthlyInvestments) {
  let msg = `Your SIP in ${fundType} funds has grown by ${returnsPercent}% and is currently worth ₹${currentValue.toLocaleString()}. `;

  // Analyze trend in monthly investments (simple example)
  let trend = 'stable';
  if (monthlyInvestments.length >= 3) {
    let diffs = [];
    for (let i = 1; i < monthlyInvestments.length; i++) {
      diffs.push(monthlyInvestments[i] - monthlyInvestments[i - 1]);
    }
    let avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avgDiff > 0) trend = 'increasing';
    else if (avgDiff < 0) trend = 'decreasing';
  }

  if (returnsPercent > 15) msg += 'Excellent performance! Your investment is yielding great returns. ';
  else if (returnsPercent > 10) msg += 'Good job, your investment is on track. ';
  else if (returnsPercent > 5) msg += 'Moderate growth observed. Consider reviewing your fund allocation. ';
  else if (returnsPercent > 0) msg += 'Low growth. You might want to explore other investment options. ';
  else msg += 'Your SIP is not growing. Please review your plan carefully. ';

  msg += `Your monthly investment trend is ${trend}. `;

  msg += `Projected value next period: ₹${forecastedValue.toLocaleString()}. `;

  msg += 'Remember to review your financial goals regularly and adjust your SIP accordingly.';

  return msg;
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

  voiceBtn.onclick = function() {
    voiceBtn.textContent = '🎤 Listening...';
    recognition.start();
  };

  recognition.onresult = function(event) {
    voiceBtn.textContent = '🎤 Speak SIP Details';
    const transcript = event.results[0][0].transcript;
    // Simple parsing: "5000 monthly equity"
    const words = transcript.split(' ');
    if (words.length >= 3) {
      document.getElementById('sip-amount').value = words[0].replace(/\D/g, '');
      document.getElementById('sip-frequency').value = words[1].toLowerCase().includes('month') ? 'monthly' : 'quarterly';
      document.getElementById('sip-fund-type').value = ['equity','debt','hybrid'].find(type => words[2].toLowerCase().includes(type)) || 'equity';
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
}


sipForm.onsubmit = function(e) {
  e.preventDefault();
  const amountInput = document.getElementById('sip-amount');
  const amount = Number(amountInput.value);
  const frequency = document.getElementById('sip-frequency').value;
  const fundType = document.getElementById('sip-fund-type').value;

  // If amount is not a valid number, show feedback and do not clear the field
  if (!amount || isNaN(amount) || amount <= 0) {
    aiResponse.textContent = 'Please enter a valid SIP amount.';
    amountInput.focus();
    return;
  }

  // Example: Assume 12 months for monthly, 4 for quarterly
  const months = frequency === 'monthly' ? 12 : 4;
  // Example rates: equity 12%, debt 7%, hybrid 9%
  const rate = fundType === 'equity' ? 0.12 : fundType === 'debt' ? 0.07 : 0.09;

  let totalInvestedVal = amount * months;
  let currentValueVal = 0;
  let chartData = [];
  let monthlyInvestments = [];
  for (let i = 1; i <= months; i++) {
    let r = rate / (frequency === 'monthly' ? 12 : 4);
    let n = i;
    let fv = amount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    chartData.push(Math.round(fv));
    monthlyInvestments.push(amount);
    if (i === months) currentValueVal = Math.round(fv);
  }
  let returnsPercentVal = (((currentValueVal - totalInvestedVal) / totalInvestedVal) * 100).toFixed(2);
  let forecastedValueVal = Math.round(currentValueVal * 1.1); // Example: 10% more in future
  let returnsVal = Math.max(currentValueVal - totalInvestedVal, 0);
  let forecastedVal = Math.round(currentValueVal * 0.1);
  let currentVal = currentValueVal;

  // Update UI
  sipSummary.style.display = 'block';
  totalInvested.textContent = `₹${totalInvestedVal.toLocaleString()}`;
  currentValue.textContent = `₹${currentValueVal.toLocaleString()}`;
  returnsPercent.textContent = `${returnsPercentVal}%`;
  forecastedValue.textContent = `₹${forecastedValueVal.toLocaleString()}`;
  renderSipChart(chartData);
  renderGooglePieChart(totalInvestedVal, returnsVal, forecastedVal, currentVal);
  aiResponse.textContent = generateAIInsight(returnsPercentVal, fundType, currentValueVal, forecastedValueVal, monthlyInvestments);
};
// --- End of sip.js --- 