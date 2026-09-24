import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB0LUxAWKVUIhXYRb2T2JOT3ypiX9q_5Ck",
    authDomain: "nievo-fcc94.firebaseapp.com",
    databaseURL: "https://nievo-fcc94-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nievo-fcc94",
    storageBucket: "nievo-fcc94.firebasestorage.app",
    messagingSenderId: "497831212426",
    appId: "1:497831212426:web:357e8c37b249042c53c473",
    measurementId: "G-ZERXCC9LH8"
};

const app = initializeApp(firebaseConfig);

// Firebase App Check: attesta che le richieste arrivino dal sito reale
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6LcRi8wtAAAAAEtHZHqZr_AFPd4NCVO9jWPwQ2MM'),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);

// Lockout progressivo lato client: rallenta i tentativi ripetuti di login.
// Non è una protezione definitiva (aggirabile pulendo sessionStorage), ma
// alza il costo di un attacco manuale e riduce il traffico verso Firebase Auth.
// La protezione reale resta il rate-limiting nativo di Firebase Auth +
// App Check, già attivi.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 60s iniziali, raddoppia ad ogni round oltre la soglia
const LOGIN_STATE_KEY = 'nievo_login_state';

function getLoginState() {
  try {
    return JSON.parse(sessionStorage.getItem(LOGIN_STATE_KEY)) || { attempts: 0, lockUntil: 0 };
  } catch (e) {
    return { attempts: 0, lockUntil: 0 };
  }
}

function setLoginState(state) {
  try { sessionStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(state)); } catch (e) {}
}

// Messaggi generici: non distinguiamo "utente inesistente" da "password errata"
// per non facilitare tentativi di enumerazione delle email registrate.
function getGenericLoginError(error) {
  const rateLimited = ['auth/too-many-requests'];
  const invalidFormat = ['auth/invalid-email'];
  if (rateLimited.includes(error.code)) {
    return 'Troppi tentativi di accesso. Riprova più tardi.';
  }
  if (invalidFormat.includes(error.code)) {
    return 'Formato email non valido.';
  }
  // auth/user-not-found, auth/wrong-password, auth/invalid-credential, ecc.
  return 'Credenziali non valide. Controlla email e password.';
}

window.login = function () {
  const state = getLoginState();
  const now = Date.now();

  if (now < state.lockUntil) {
    const secs = Math.ceil((state.lockUntil - now) / 1000);
    alert(`Troppi tentativi. Riprova tra ${secs} secondi.`);
    return;
  }

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      setLoginState({ attempts: 0, lockUntil: 0 });
      console.log("LOGGATO:", userCredential.user);
      window.location.href = "admin-dashboard.html";
    })
    .catch((error) => {
      const attempts = state.attempts + 1;
      const lockUntil = attempts >= MAX_ATTEMPTS
        ? now + LOCKOUT_MS * Math.pow(2, attempts - MAX_ATTEMPTS)
        : 0;
      setLoginState({ attempts, lockUntil });
      alert(getGenericLoginError(error));
    });
};