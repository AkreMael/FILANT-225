import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase fournie par l'utilisateur
const firebaseConfig = {
  apiKey: "AIzaSyBYoX0tIbEeM2PlP44ToE_kDcpj6RheIIo",
  authDomain: "filant225-base.firebaseapp.com",
  projectId: "filant225-base",
  storageBucket: "filant225-base.firebasestorage.app",
  messagingSenderId: "620102449526",
  appId: "1:620102449526:web:998bf392f3dbab62682257",
  measurementId: "G-88XZE34VHC"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services pour utilisation dans l'application
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
