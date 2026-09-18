import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// 👇 NUOVO IMPORT
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

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

// ✅ APP CHECK — PRIMA di getAuth
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6Lcmi8ItAAAAAHFg2w0o1BdFJXraGqGQ5KZVLT_d'),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);

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
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("LOGGATO:", userCredential.user);
      window.location.href = "admin-dashboard.html";
    })
    .catch((error) => {
      alert(getGenericLoginError(error));
    });
};