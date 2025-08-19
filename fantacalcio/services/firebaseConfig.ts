import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjKzqcG7QzZytBcpXehROI0PqxL9I0kbU",
  authDomain: "asta-fantacalcio-2025-26.firebaseapp.com",
  databaseURL: "https://asta-fantacalcio-2025-26-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "asta-fantacalcio-2025-26",
  storageBucket: "asta-fantacalcio-2025-26.appspot.com",
  messagingSenderId: "324267218963",
  appId: "1:324267218963:web:d94a98a74ab7f99b2547e6"
};

// Initialize Firebase safely to prevent re-initialization errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);