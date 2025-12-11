// --- Net Worth Tracker JavaScript ---

const networthForm = document.getElementById('networth-form');
const networthSummary = document.getElementById('networth-summary');
const totalAssetsElem = document.getElementById('total-assets');
const totalLiabilitiesElem = document.getElementById('total-liabilities');
const netWorthElem = document.getElementById('net-worth');
const aiResponse = document.getElementById('ai-response');

let networthTrendChart;
let networthPieChart;

// Load Google Charts
let googleChartsLoaded = false;
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
  googleChartsLoaded = true;
});

// Render Line Chart for Net Worth Trend (dummy data for now)
function renderNetworthTrendChart(chartData) {
  const ctx = document.getElementById('networth-trend-chart').getContext('2d');
  if (networthTrendChart) networthTrendChart.destroy();
  networthTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map((_, i) => `Month ${i+1}`),
      datasets: [{
        label: 'Net Worth',
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

// Render Pie Chart for Assets vs Liabilities
function renderNetworthPieChart(totalAssetsVal, totalLiabilitiesVal) {
  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Category', 'Amount'],
      ['Assets', totalAssetsVal],
      ['Liabilities', totalLiabilitiesVal]
    ]);
    var options = {
      title: 'Assets vs Liabilities (3D)',
      is3D: true,
      backgroundColor: '#111',
      legend: { textStyle: { color: '#ffd700', fontSize: 14 } },
      slices: {
        0: { color: '#43a047' }, // Green for assets
        1: { color: '#e53935' }  // Red for liabilities
      },
      chartArea: { left: 10, top: 30, width: '90%', height: '80%' },
      fontName: 'Segoe UI',
      titleTextStyle: { color: '#ffd700', fontSize: 18 }
    };
    var chart = new google.visualization.PieChart(document.getElementById('networth-piechart'));
    chart.clearChart();
    chart.draw(data, options);
  }
  google.charts.setOnLoadCallback(drawChart);
}

// Generate AI Insight (simple heuristic)
function generateAIInsight(totalAssets, totalLiabilities, netWorth) {
  let msg = `Your total assets are ₹${totalAssets.toLocaleString()}, and your total liabilities are ₹${totalLiabilities.toLocaleString()}. Your net worth is ₹${netWorth.toLocaleString()}. `;
  if (netWorth > 0) {
    msg += 'Good job! You have a positive net worth. Keep building your assets and managing liabilities.';
  } else if (netWorth === 0) {
    msg += 'Your net worth is zero. Consider strategies to increase assets or reduce liabilities.';
  } else {
    msg += 'Your net worth is negative. It is important to reduce liabilities and increase assets to improve your financial health.';
  }
  return msg;
}

// Voice Input Integration (Web Speech API)
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
    voiceBtn.textContent = '🎤 Speak Financial Data';
    const transcript = event.results[0][0].transcript.toLowerCase();
    // Simple parsing: expects phrases like "cash 50000 property 200000 stocks 100000 credit card 5000 loans 20000 emis 10000"
    const words = transcript.split(' ');
    // Reset all inputs
    ['asset-cash', 'asset-property', 'asset-mutualfunds', 'asset-stocks', 'liability-creditcard', 'liability-personalloan', 'liability-emis'].forEach(id => {
      document.getElementById(id).value = '';
    });
    for (let i = 0; i < words.length; i++) {
      switch(words[i]) {
        case 'cash':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('asset-cash').value = parseFloat(words[i+1]);
          break;
        case 'property':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('asset-property').value = parseFloat(words[i+1]);
          break;
        case 'mutualfunds':
        case 'mutual':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('asset-mutualfunds').value = parseFloat(words[i+1]);
          break;
        case 'stocks':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('asset-stocks').value = parseFloat(words[i+1]);
          break;
        case 'credit':
          if (words[i+1] === 'card' && words[i+2] && !isNaN(words[i+2])) document.getElementById('liability-creditcard').value = parseFloat(words[i+2]);
          break;
        case 'loans':
        case 'loan':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('liability-personalloan').value = parseFloat(words[i+1]);
          break;
        case 'emis':
        case 'emi':
          if (words[i+1] && !isNaN(words[i+1])) document.getElementById('liability-emis').value = parseFloat(words[i+1]);
          break;
      }
    }
  };

  recognition.onerror = function() {
    voiceBtn.textContent = '🎤 Speak Financial Data';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
}

networthForm.onsubmit = function(e) {
  e.preventDefault();

  // Parse inputs
  const assetCash = Number(document.getElementById('asset-cash').value) || 0;
  const assetProperty = Number(document.getElementById('asset-property').value) || 0;
  const assetMutualFunds = Number(document.getElementById('asset-mutualfunds').value) || 0;
  const assetStocks = Number(document.getElementById('asset-stocks').value) || 0;

  const liabilityCreditCard = Number(document.getElementById('liability-creditcard').value) || 0;
  const liabilityPersonalLoan = Number(document.getElementById('liability-personalloan').value) || 0;
  const liabilityEMIs = Number(document.getElementById('liability-emis').value) || 0;

  const totalAssetsVal = assetCash + assetProperty + assetMutualFunds + assetStocks;
  const totalLiabilitiesVal = liabilityCreditCard + liabilityPersonalLoan + liabilityEMIs;
  const netWorthVal = totalAssetsVal - totalLiabilitiesVal;

  // For demo, create dummy monthly trend data (last 6 months)
  let trendData = [];
  for (let i = 0; i < 6; i++) {
    // Simulate net worth trend with some random variation
    trendData.push(Math.round(netWorthVal * (0.8 + 0.04 * i)));
  }

  // Update UI
  networthSummary.style.display = 'block';
  totalAssetsElem.textContent = `₹${totalAssetsVal.toLocaleString()}`;
  totalLiabilitiesElem.textContent = `₹${totalLiabilitiesVal.toLocaleString()}`;
  netWorthElem.textContent = `₹${netWorthVal.toLocaleString()}`;

  renderNetworthTrendChart(trendData);
  if (googleChartsLoaded) {
    renderNetworthPieChart(totalAssetsVal, totalLiabilitiesVal);
  } else {
    google.charts.setOnLoadCallback(() => renderNetworthPieChart(totalAssetsVal, totalLiabilitiesVal));
  }

  aiResponse.textContent = generateAIInsight(totalAssetsVal, totalLiabilitiesVal, netWorthVal);
};
