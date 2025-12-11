// auth-check.js
// Checks if user is logged in using Firebase Auth, else prompts to login and redirects

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRFqqQntcoo-T60ypA_wL0BI8C1Cw6oQ4",
  authDomain: "fingenie-36e43.firebaseapp.com",
  projectId: "fingenie-36e43",
  storageBucket: "fingenie-36e43.appspot.com",
  messagingSenderId: "527758128620",
  appId: "1:527758128620:web:84765a370dfa191df13cc9",
  measurementId: "G-XS3QVXS2VP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to access this page. Redirecting to login.");
    window.location.href = "login.html";
  }
});
