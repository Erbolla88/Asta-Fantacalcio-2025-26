// Fix: Use a namespace import for firebase/app to address module resolution errors.
import * as firebaseApp from "firebase/app";
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


// Initialize Firebase, checking if it's already initialized to prevent errors.
// Fix: Use the namespaced 'firebaseApp' object to call initialization functions.
const app = firebaseApp.getApps().length === 0 ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApps()[0];

// Get a reference to the services and export them
export const db = getDatabase(app);
export const auth = getAuth(app);

// For simplicity, we'll hardcode one auction ID.
// In a multi-auction app, this would be dynamic.
export const AUCTION_ID = 'main_auction_2025_26';