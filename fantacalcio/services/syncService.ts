import { ref, set } from "firebase/database";
import { database } from "./firebaseConfig";
import { SharedAuctionState } from '../types';

const DB_PATH = 'shared_auction_state';

/**
 * Saves the current shared state to the Firebase Realtime Database.
 * @param state The shared state to save.
 */
export const saveSharedState = (state: Omit<SharedAuctionState, 'users'> & { users: [string, any][] }) => {
  try {
    const dbRef = ref(database, DB_PATH);
    // Firebase handles the serialization of the object.
    set(dbRef, state);
  } catch (e) {
    console.error("Failed to save shared state to Firebase:", e);
  }
};

// The loadSharedState function is no longer needed,
// as our hook will now listen for real-time updates directly from Firebase.
