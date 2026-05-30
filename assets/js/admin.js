import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔧 INCOLLA QUI IL TUO CONFIG FIREBASE
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
const auth = getAuth(app);

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("LOGGATO:", userCredential.user);
      window.location.href = "admin-dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};