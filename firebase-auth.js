// Firebase Authentication for Login and Registration with UI form

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

const form = document.getElementById('login-register-form');
const errorDiv = document.getElementById('form-error');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

if (!name || !phone || !email || !password) {
  errorDiv.textContent = 'Please fill in all fields.';
  errorDiv.style.color = 'red';
  return;
}

    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name, phoneNumber: phone });
      window.location.href = 'index.html';
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await updateProfile(user, { displayName: name, phoneNumber: phone });
          window.location.href = 'index.html';
        } catch (registerError) {
          errorDiv.textContent = 'Registration failed: ' + registerError.message;
        }
      } else {
        errorDiv.textContent = 'Login failed: ' + signInError.message;
      }
    }
  });
}

const loginButton = document.getElementById('login-button');

if (loginButton) {
  loginButton.addEventListener('click', async () => {
    if (loginButton.textContent === 'Login') {
      window.location.href = 'login.html';
    } else {
      await signOut(auth);
      loginButton.textContent = 'Login';
      loginButton.classList.remove('user-avatar');
      alert('You have been logged out.');
      window.location.href = 'index.html';
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (loginButton) {
      const displayName = user.displayName || '';
      const firstLetter = displayName.charAt(0).toUpperCase() || 'U';
      loginButton.textContent = firstLetter;
      loginButton.classList.add('user-avatar');
      loginButton.style.width = '36px';
      loginButton.style.height = '36px';
      loginButton.style.padding = '0';
      loginButton.style.borderRadius = '50%';
      loginButton.style.textAlign = 'center';
      loginButton.style.lineHeight = '36px';
    }
  } else {
    if (loginButton) {
      loginButton.textContent = 'Login';
      loginButton.classList.remove('user-avatar');
      loginButton.style.width = '';
      loginButton.style.height = '';
      loginButton.style.padding = '';
      loginButton.style.borderRadius = '';
      loginButton.style.textAlign = '';
      loginButton.style.lineHeight = '';
    }
  }
});
