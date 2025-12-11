// --- Loan Calculator JavaScript ---

const loanForm = document.getElementById('loan-form');
const loanSummary = document.getElementById('loan-summary');

const loan1EmiElem = document.getElementById('loan1-emi');
const loan1InterestTotalElem = document.getElementById('loan1-interest-total');
const loan1TotalPaymentElem = document.getElementById('loan1-total-payment');

const loan2Summary = document.getElementById('loan2-summary');
const loan2EmiElem = document.getElementById('loan2-emi');
const loan2InterestTotalElem = document.getElementById('loan2-interest-total');
const loan2TotalPaymentElem = document.getElementById('loan2-total-payment');

const aiResponse = document.getElementById('ai-response');

let voiceBtn = document.getElementById('voice-btn');
let recognition;

// EMI calculation function
function calculateEMI(principal, annualInterestRate, tenureYears) {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfPayments = tenureYears * 12;
  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments;
  }
  const emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
              (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  return emi;
}

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
    voiceBtn.textContent = '🎤 Speak Loan Details';
    const transcript = event.results[0][0].transcript.toLowerCase();
    // Simple parsing: expects phrases like "loan one amount 500000 interest 7 tenure 20 loan two amount 600000 interest 8 tenure 15"
    const words = transcript.split(' ');

    // Reset inputs
    ['loan1-amount', 'loan1-interest', 'loan1-tenure', 'loan2-amount', 'loan2-interest', 'loan2-tenure'].forEach(id => {
      document.getElementById(id).value = '';
    });

    for (let i = 0; i < words.length; i++) {
      switch(words[i]) {
        case 'amount':
          if (words[i-1] === 'one' || words[i-1] === '1') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan1-amount').value = parseFloat(words[i+1]);
          } else if (words[i-1] === 'two' || words[i-1] === '2') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan2-amount').value = parseFloat(words[i+1]);
          }
          break;
        case 'interest':
          if (words[i-1] === 'one' || words[i-1] === '1') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan1-interest').value = parseFloat(words[i+1]);
          } else if (words[i-1] === 'two' || words[i-1] === '2') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan2-interest').value = parseFloat(words[i+1]);
          }
          break;
        case 'tenure':
          if (words[i-1] === 'one' || words[i-1] === '1') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan1-tenure').value = parseFloat(words[i+1]);
          } else if (words[i-1] === 'two' || words[i-1] === '2') {
            if (words[i+1] && !isNaN(words[i+1])) document.getElementById('loan2-tenure').value = parseFloat(words[i+1]);
          }
          break;
      }
    }
  };

  recognition.onerror = function() {
    voiceBtn.textContent = '🎤 Speak Loan Details';
    alert('Could not recognize speech. Please try again.');
  };
} else {
  voiceBtn.onclick = function() {
    alert('Voice input not supported in this browser.');
  };
}

loanForm.onsubmit = function(e) {
  e.preventDefault();

  // Loan 1 inputs
  const loan1Amount = Number(document.getElementById('loan1-amount').value) || 0;
  const loan1Interest = Number(document.getElementById('loan1-interest').value) || 0;
  const loan1Tenure = Number(document.getElementById('loan1-tenure').value) || 0;

  // Loan 2 inputs (optional)
  const loan2Amount = Number(document.getElementById('loan2-amount').value) || 0;
  const loan2Interest = Number(document.getElementById('loan2-interest').value) || 0;
  const loan2Tenure = Number(document.getElementById('loan2-tenure').value) || 0;

  if (loan1Amount <= 0 || loan1Interest < 0 || loan1Tenure <= 0) {
    alert('Please enter valid values for Loan 1.');
    return;
  }

  // Calculate Loan 1 EMI and totals
  const loan1Emi = calculateEMI(loan1Amount, loan1Interest, loan1Tenure);
  const loan1TotalPayment = loan1Emi * loan1Tenure * 12;
  const loan1TotalInterest = loan1TotalPayment - loan1Amount;

  loan1EmiElem.textContent = `₹${loan1Emi.toFixed(2).toLocaleString()}`;
  loan1InterestTotalElem.textContent = `₹${loan1TotalInterest.toFixed(2).toLocaleString()}`;
  loan1TotalPaymentElem.textContent = `₹${loan1TotalPayment.toFixed(2).toLocaleString()}`;

  // Calculate Loan 2 if inputs are valid
  if (loan2Amount > 0 && loan2Interest >= 0 && loan2Tenure > 0) {
    loan2Summary.style.display = 'flex';
    const loan2Emi = calculateEMI(loan2Amount, loan2Interest, loan2Tenure);
    const loan2TotalPayment = loan2Emi * loan2Tenure * 12;
    const loan2TotalInterest = loan2TotalPayment - loan2Amount;

    loan2EmiElem.textContent = `₹${loan2Emi.toFixed(2).toLocaleString()}`;
    loan2InterestTotalElem.textContent = `₹${loan2TotalInterest.toFixed(2).toLocaleString()}`;
    loan2TotalPaymentElem.textContent = `₹${loan2TotalPayment.toFixed(2).toLocaleString()}`;
  } else {
    loan2Summary.style.display = 'none';
  }

  // AI Insight generation (simple heuristic)
  let insightMsg = `Loan 1 EMI is ₹${loan1Emi.toFixed(2)}. Total interest payable is ₹${loan1TotalInterest.toFixed(2)}. Total payment will be ₹${loan1TotalPayment.toFixed(2)}.`;
  if (loan2Summary.style.display === 'flex') {
    insightMsg += ` Loan 2 EMI is ₹${loan2Emi.toFixed(2)}. Total interest payable is ₹${loan2TotalInterest.toFixed(2)}. Total payment will be ₹${loan2TotalPayment.toFixed(2)}.`;
    if (loan1TotalPayment < loan2TotalPayment) {
      insightMsg += ' Loan 1 is cheaper overall.';
    } else if (loan1TotalPayment > loan2TotalPayment) {
      insightMsg += ' Loan 2 is cheaper overall.';
    } else {
      insightMsg += ' Both loans have the same total payment.';
    }
  }
  aiResponse.textContent = insightMsg;

  loanSummary.style.display = 'block';
};
