import { useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";
import useAuctionStore from '../store/useAuctionStore';
import { SharedAuctionState, User } from '../types';

const DB_PATH = 'shared_auction_state';

/**
 * This custom hook manages the real-time synchronization of the auction state
 * by listening for live updates from the Firebase Realtime Database.
 */
export const useSharedStateSync = () => {
  const actions = useAuctionStore(state => state.actions);

  useEffect(() => {
    const dbRef = ref(database, DB_PATH);

    // onValue() sets up a listener that fires immediately with the current data
    // and then again every time the data changes in the database.
    const unsubscribe = onValue(dbRef, (snapshot) => {
      // Widen the type for `users` to handle Firebase's array-to-object conversion and null cases.
      const newState = snapshot.val() as (Omit<SharedAuctionState, 'users'> & { users: [string, User][] | Record<string, [string, User]> | null }) | null;

      if (newState) {
        try {
          // The data from Firebase can be an array, an object, or null; convert it back into a Map.
          const userEntries = newState.users ? (Array.isArray(newState.users) ? newState.users : Object.values(newState.users)) : [];
          const usersMap = new Map<string, User>(userEntries);
          actions.overwriteSharedState({ ...newState, users: usersMap });
        } catch (e) {
          console.error("Error processing real-time update from Firebase:", e);
        }
      }
    });

    // The returned function cleans up the listener when the component is no longer on screen.
    return () => {
      unsubscribe();
    };
  }, [actions]);
};
