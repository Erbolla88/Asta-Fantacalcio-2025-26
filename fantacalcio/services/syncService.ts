import { ref, set } from "firebase/database";
import { database } from "./firebaseConfig";
import { SharedAuctionState } from '../types';

const DB_PATH = 'shared_auction_state';

/**
 * Recursively sanitizes an object by converting `undefined` values to `null`.
 * Firebase does not support `undefined` values.
 * @param obj The object to sanitize.
 * @returns A new object with `undefined` values replaced by `null`.
 */
const sanitizeForFirebase = (obj: any): any => {
    if (obj === undefined) {
        return null;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeForFirebase(item));
    }
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            newObj[key] = sanitizeForFirebase(value);
        }
    }
    return newObj;
};


/**
 * Saves the current shared state to the Firebase Realtime Database.
 * @param state The shared state to save.
 */
export const saveSharedState = (state: Omit<SharedAuctionState, 'users'> & { users: [string, any][] }) => {
  try {
    const sanitizedState = sanitizeForFirebase(state);
    const dbRef = ref(database, DB_PATH);
    set(dbRef, sanitizedState);
  } catch (e) {
    console.error("Failed to save shared state to Firebase:", e);
  }
};

// The loadSharedState function is no longer needed,
// as our hook will now listen for real-time updates directly from Firebase.