import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

import {
  getAuth,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

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


/* =========================================================
   ADMIN AUTORIZZATI
========================================================= */

const ADMIN_EMAILS = new Set([
  "riccardo.costantini.eu@gmail.com",
  "admin@gmail.com"
]);


/* =========================================================
   INIT FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);


/* Firebase App Check */

initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    "6LcRi8wtAAAAAEtHZHqZr_AFPd4NCVO9jWPwQ2MM"
  ),
  isTokenAutoRefreshEnabled: true
});


const auth = getAuth(app);


/* =========================================================
   LOGIN PROTECTION
========================================================= */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const LOGIN_STATE_KEY = "nievo_login_state";

let loginInProgress = false;

let recaptchaVerifier = null;

let pendingResolver = null;
let pendingVerificationId = null;
let pendingMode = null;


/* =========================================================
   UTILITY
========================================================= */

function isAuthorizedAdmin(user) {
  return (
    !!user?.email &&
    ADMIN_EMAILS.has(user.email.toLowerCase())
  );
}


function getLoginState() {
  try {
    return (
      JSON.parse(
        sessionStorage.getItem(LOGIN_STATE_KEY)
      ) || {
        attempts: 0,
        lockUntil: 0
      }
    );
  } catch {
    return {
      attempts: 0,
      lockUntil: 0
    };
  }
}


function setLoginState(state) {
  try {
    sessionStorage.setItem(
      LOGIN_STATE_KEY,
      JSON.stringify(state)
    );
  } catch {}
}


function registerFailedAttempt() {
  const state = getLoginState();

  const now = Date.now();

  const attempts = state.attempts + 1;

  const lockUntil =
    attempts >= MAX_ATTEMPTS
      ? now +
        LOCKOUT_MS *
          Math.pow(
            2,
            attempts - MAX_ATTEMPTS
          )
      : 0;

  setLoginState({
    attempts,
    lockUntil
  });

  return {
    attempts,
    lockUntil
  };
}


function setText(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
  }
}


function showSection(idToShow) {
  [
    "login-section",
    "mfa-setup-section",
    "mfa-login-section"
  ].forEach((id) => {
    const element =
      document.getElementById(id);

    if (element) {
      element.hidden =
        id !== idToShow;
    }
  });
}


/* =========================================================
   RECAPTCHA
========================================================= */

function clearRecaptcha() {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {}

    recaptchaVerifier = null;
  }
}


function createRecaptcha(buttonId) {
  clearRecaptcha();

  recaptchaVerifier =
    new RecaptchaVerifier(
      auth,
      buttonId,
      {
        size: "invisible"
      }
    );

  return recaptchaVerifier;
}


/* =========================================================
   RESET MFA STATE
========================================================= */

function resetMfaState() {
  pendingResolver = null;
  pendingVerificationId = null;
  pendingMode = null;

  clearRecaptcha();
}


/* =========================================================
   PRIMA CONFIGURAZIONE MFA
========================================================= */

async function sendEnrollmentCode() {

  const user = auth.currentUser;

  const phoneNumber =
    document
      .getElementById("mfa-phone")
      .value
      .trim();


  if (
    !user ||
    !isAuthorizedAdmin(user)
  ) {
    setText(
      "mfa-setup-status",
      "Sessione admin non valida. Effettua nuovamente il login."
    );

    return;
  }


  if (!user.emailVerified) {

    setText(
      "mfa-setup-status",
      "La email dell'admin deve essere verificata prima di attivare la MFA."
    );

    return;
  }


  /*
    Esempio:
    +393331234567
  */

  if (
    !/^\+[1-9]\d{7,14}$/.test(
      phoneNumber
    )
  ) {

    setText(
      "mfa-setup-status",
      "Inserisci un numero in formato internazionale, ad esempio +393331234567."
    );

    return;
  }


  try {

    setText(
      "mfa-setup-status",
      "Invio del codice SMS in corso..."
    );


    /*
      Firebase richiede una nuova
      autenticazione prima di registrare
      un secondo fattore.
    */

    const email = user.email;

    const password =
      document.getElementById(
        "password"
      ).value;


    const credential =
      EmailAuthProvider.credential(
        email,
        password
      );


    await reauthenticateWithCredential(
      user,
      credential
    );


    /*
      Otteniamo la sessione MFA.
    */

    const session =
      await multiFactor(
        user
      ).getSession();


    const phoneInfoOptions = {
      phoneNumber,
      session
    };


    /*
      reCAPTCHA invisibile
    */

    const verifier =
      createRecaptcha(
        "send-mfa-enroll-btn"
      );


    const provider =
      new PhoneAuthProvider(
        auth
      );


    pendingMode = "enroll";


    /*
      Firebase manda l'SMS.
    */

    pendingVerificationId =
      await provider.verifyPhoneNumber(
        phoneInfoOptions,
        verifier
      );


    document.getElementById(
      "mfa-enroll-code-row"
    ).hidden = false;


    document.getElementById(
      "mfa-enroll-code"
    ).focus();


    setText(
      "mfa-setup-status",
      "Codice inviato. Inserisci il codice ricevuto via SMS."
    );

  } catch (error) {

    console.error(
      "Errore enrollment MFA:",
      error
    );


    clearRecaptcha();


    setText(
      "mfa-setup-status",
      "Non è stato possibile inviare l'SMS. Controlla il numero e riprova."
    );
  }
}


/* =========================================================
   CONFERMA ENROLLMENT MFA
========================================================= */

async function completeEnrollment() {

  const user = auth.currentUser;

  const code =
    document
      .getElementById(
        "mfa-enroll-code"
      )
      .value
      .trim();


  if (
    !user ||
    !pendingVerificationId ||
    pendingMode !== "enroll"
  ) {

    setText(
      "mfa-setup-status",
      "Richiesta MFA non più valida. Invia un nuovo codice."
    );

    return;
  }


  if (
    !/^\d{6}$/.test(code)
  ) {

    setText(
      "mfa-setup-status",
      "Inserisci il codice SMS a 6 cifre."
    );

    return;
  }


  try {

    setText(
      "mfa-setup-status",
      "Attivazione MFA in corso..."
    );


    const cred =
      PhoneAuthProvider.credential(
        pendingVerificationId,
        code
      );


    const assertion =
      PhoneMultiFactorGenerator.assertion(
        cred
      );


    await multiFactor(
      user
    ).enroll(
      assertion,
      "Telefono admin"
    );


    resetMfaState();


    setLoginState({
      attempts: 0,
      lockUntil: 0
    });


    /*
      Importante:

      la sessione corrente è stata autenticata
      con email/password senza un secondo fattore.

      Facciamo quindi logout e nuovo login.

      In questo modo il nuovo token Firebase
      conterrà:

      firebase.sign_in_second_factor = "phone"
    */

    await signOut(auth);


    document.getElementById(
      "password"
    ).value = "";


    document.getElementById(
      "mfa-enroll-code"
    ).value = "";


    document.getElementById(
      "mfa-enroll-code-row"
    ).hidden = true;


    showSection(
      "login-section"
    );


    setText(
      "login-status",
      "MFA attivata. Ora effettua un nuovo login: riceverai il codice SMS."
    );

  } catch (error) {

    console.error(
      "Errore completamento MFA:",
      error
    );


    setText(
      "mfa-setup-status",
      "Codice non valido o scaduto. Richiedi un nuovo codice e riprova."
    );
  }
}


/* =========================================================
   INVIO SMS DURANTE LOGIN
========================================================= */

async function sendLoginCode() {

  if (!pendingResolver) {

    setText(
      "mfa-login-status",
      "La richiesta MFA non è più valida. Effettua nuovamente il login."
    );

    return;
  }


  /*
    Nel tuo caso c'è un solo fattore:
    telefono.
  */

  const phoneHint =
    pendingResolver.hints.find(
      (hint) =>
        hint.factorId ===
        PhoneMultiFactorGenerator.FACTOR_ID
    );


  if (!phoneHint) {

    setText(
      "mfa-login-status",
      "Nessun fattore SMS disponibile per questo account."
    );

    return;
  }


  try {

    setText(
      "mfa-login-status",
      "Invio del codice SMS in corso..."
    );


    const phoneInfoOptions = {
      multiFactorHint: phoneHint,
      session:
        pendingResolver.session
    };


    const verifier =
      createRecaptcha(
        "send-mfa-login-btn"
      );


    const provider =
      new PhoneAuthProvider(
        auth
      );


    pendingMode = "login";


    pendingVerificationId =
      await provider.verifyPhoneNumber(
        phoneInfoOptions,
        verifier
      );


    document.getElementById(
      "mfa-login-code-row"
    ).hidden = false;


    document.getElementById(
      "mfa-login-code"
    ).focus();


    setText(
      "mfa-login-status",
      "Codice SMS inviato."
    );

  } catch (error) {

    console.error(
      "Errore invio MFA login:",
      error
    );


    clearRecaptcha();


    setText(
      "mfa-login-status",
      "Non è stato possibile inviare l'SMS. Riprova."
    );
  }
}


/* =========================================================
   COMPLETAMENTO LOGIN MFA
========================================================= */

async function completeMfaLogin() {

  const code =
    document
      .getElementById(
        "mfa-login-code"
      )
      .value
      .trim();


  if (
    !pendingResolver ||
    !pendingVerificationId ||
    pendingMode !== "login"
  ) {

    setText(
      "mfa-login-status",
      "Richiesta MFA non più valida. Effettua nuovamente il login."
    );

    return;
  }


  if (
    !/^\d{6}$/.test(code)
  ) {

    setText(
      "mfa-login-status",
      "Inserisci il codice SMS a 6 cifre."
    );

    return;
  }


  try {

    setText(
      "mfa-login-status",
      "Verifica del codice in corso..."
    );


    const cred =
      PhoneAuthProvider.credential(
        pendingVerificationId,
        code
      );


    const assertion =
      PhoneMultiFactorGenerator.assertion(
        cred
      );


    /*
      Questo completa davvero
      l'autenticazione MFA.
    */

    const userCredential =
      await pendingResolver.resolveSignIn(
        assertion
      );


    /*
      Doppio controllo admin.
    */

    if (
      !isAuthorizedAdmin(
        userCredential.user
      )
    ) {

      await signOut(auth);

      throw new Error(
        "not-admin"
      );
    }


    setLoginState({
      attempts: 0,
      lockUntil: 0
    });


    resetMfaState();


    window.location.href =
      "admin-dashboard.html";

  } catch (error) {

    console.error(
      "Errore verifica MFA login:",
      error
    );


    registerFailedAttempt();


    setText(
      "mfa-login-status",
      "Codice SMS non valido o scaduto. Riprova."
    );
  }
}


/* =========================================================
   LOGIN PRINCIPALE
========================================================= */

window.login = async function () {

  if (loginInProgress) {
    return;
  }


  const state =
    getLoginState();


  const now =
    Date.now();


  if (
    now < state.lockUntil
  ) {

    const secs =
      Math.ceil(
        (state.lockUntil - now) /
          1000
      );


    setText(
      "login-status",
      `Troppi tentativi. Riprova tra ${secs} secondi.`
    );

    return;
  }


  const email =
    document
      .getElementById("email")
      .value
      .trim()
      .toLowerCase();


  const password =
    document.getElementById(
      "password"
    ).value;


  loginInProgress = true;


  const submitButton =
    document.querySelector(
      '#login-form button[type="submit"]'
    );


  if (submitButton) {
    submitButton.disabled = true;
  }


  setText(
    "login-status",
    "Accesso in corso..."
  );


  try {

    /*
      Sessione solo per questa sessione
      del browser/tab, invece della persistenza
      locale indefinita.
    */

    await setPersistence(
      auth,
      browserSessionPersistence
    );


    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    /*
      Deve essere uno degli admin autorizzati.
    */

    if (
      !isAuthorizedAdmin(user)
    ) {

      await signOut(auth);

      registerFailedAttempt();

      throw new Error(
        "not-admin"
      );
    }


    /*
      ============================================
      BLOCCO TEMPORANEO - VERIFICA EMAIL (OPZIONE A)
      ============================================

      Da rimuovere una volta verificate le email
      di tutti gli admin. Serve solo per far
      arrivare la mail di verifica di Firebase,
      dato che il login normale bloccherebbe subito
      un utente con emailVerified = false.
    */

    if (
      !user.emailVerified
    ) {

      try {

        await sendEmailVerification(user);

        setText(
          "login-status",
          "Email di verifica inviata. Controlla la posta (anche spam), clicca il link e poi rifai il login."
        );

      } catch (verifyError) {

        console.error(
          "Errore invio email di verifica:",
          verifyError
        );

        setText(
          "login-status",
          "Impossibile inviare l'email di verifica. Riprova più tardi."
        );
      }

      await signOut(auth);

      return;
    }

    /*
      ============================================
      FINE BLOCCO TEMPORANEO
      ============================================
    */


    /*
      MFA richiede email verificata.
    */

    if (
      !user.emailVerified
    ) {

      await signOut(auth);

      registerFailedAttempt();


      setText(
        "login-status",
        "La email dell'admin deve essere verificata prima di usare la MFA."
      );

      return;
    }


    /*
      Controlliamo se esiste già
      almeno un secondo fattore.
    */

    const enrolledFactors =
      multiFactor(
        user
      ).enrolledFactors;


    /*
      PRIMO ACCESSO:

      l'account non ha ancora MFA.
    */

    if (
      enrolledFactors.length === 0
    ) {

      setText(
        "mfa-setup-status",
        "Questo account non ha ancora una MFA. Configura ora il numero admin."
      );


      showSection(
        "mfa-setup-section"
      );


      return;
    }


    /*
      Se Firebase ci ha fatto arrivare
      qui senza completare MFA, NON concediamo
      accesso alla dashboard.
    */

    await signOut(auth);

    registerFailedAttempt();


    setText(
      "login-status",
      "Questo account deve effettuare l'accesso tramite MFA SMS."
    );

  } catch (error) {

    /*
      QUESTO è l'errore che Firebase genera
      quando email/password sono corrette ma
      serve il secondo fattore.
    */

    if (
      error?.code ===
      "auth/multi-factor-auth-required"
    ) {

      pendingResolver =
        getMultiFactorResolver(
          auth,
          error
        );


      pendingMode =
        "login";


      /*
        Cerchiamo il fattore SMS.
      */

      const phoneHint =
        pendingResolver.hints.find(
          (hint) =>
            hint.factorId ===
            PhoneMultiFactorGenerator.FACTOR_ID
        );


      if (!phoneHint) {

        await signOut(auth);

        registerFailedAttempt();


        setText(
          "login-status",
          "L'account non ha un secondo fattore SMS utilizzabile."
        );

        return;
      }


      document.getElementById(
        "mfa-login-phone"
      ).textContent =
        phoneHint.phoneNumber ||
        "numero configurato";


      showSection(
        "mfa-login-section"
      );


      setText(
        "mfa-login-status",
        "Password corretta. Invio del codice SMS..."
      );


      /*
        Invio automatico del codice.
      */

      await sendLoginCode();

      return;
    }


    /*
      Account non admin.
    */

    if (
      error?.message ===
      "not-admin"
    ) {

      setText(
        "login-status",
        "Credenziali non valide. Controlla email e password."
      );

      return;
    }


    registerFailedAttempt();


    if (
      error?.code ===
      "auth/too-many-requests"
    ) {

      setText(
        "login-status",
        "Troppi tentativi di accesso. Riprova più tardi."
      );

    } else if (
      error?.code ===
      "auth/invalid-email"
    ) {

      setText(
        "login-status",
        "Formato email non valido."
      );

    } else {

      setText(
        "login-status",
        "Credenziali non valide. Controlla email e password."
      );
    }
  } finally {

    loginInProgress = false;

    const button =
      document.querySelector(
        '#login-form button[type="submit"]'
      );

    if (button) {
      button.disabled = false;
    }
  }
};


/* =========================================================
   EVENT LISTENERS
========================================================= */

document
  .getElementById(
    "send-mfa-enroll-btn"
  )
  ?.addEventListener(
    "click",
    sendEnrollmentCode
  );


document
  .getElementById(
    "verify-mfa-enroll-btn"
  )
  ?.addEventListener(
    "click",
    completeEnrollment
  );


document
  .getElementById(
    "send-mfa-login-btn"
  )
  ?.addEventListener(
    "click",
    sendLoginCode
  );


document
  .getElementById(
    "verify-mfa-login-btn"
  )
  ?.addEventListener(
    "click",
    completeMfaLogin
  );


document
  .getElementById(
    "mfa-enroll-code"
  )
  ?.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {
        completeEnrollment();
      }

    }
  );


document
  .getElementById(
    "mfa-login-code"
  )
  ?.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {
        completeMfaLogin();
      }

    }
  );


/* =========================================================
   INITIAL STATE
========================================================= */

showSection(
  "login-section"
);