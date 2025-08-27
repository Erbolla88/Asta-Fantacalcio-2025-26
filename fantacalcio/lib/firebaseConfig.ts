import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
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


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get a reference to the database service and export it
export const db = getDatabase(app);

// Get a reference to the auth service and export it
export const auth = getAuth(app);

// For simplicity, we'll hardcode one auction ID.
// In a multi-auction app, this would be dynamic.
export const AUCTION_ID = 'main_auction_2025_26';