import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase utilisant les variables d'environnement pour plus de sécurité
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AlzaSyBYoXtIbeEm2PlP44ToE_kDcpj6Rhello",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "filant225-base.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "filant225-base",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "filant225-base.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "620102449526",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:620102449526:web:998bf392f3dbab62682257",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-88XZE34VHC"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services pour utilisation dans l'application
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
