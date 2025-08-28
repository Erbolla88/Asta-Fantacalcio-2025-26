import { create } from 'zustand';
import { ref, set as setFirebaseData, onValue, Unsubscribe, runTransaction, update, remove } from 'firebase/database';
import { db, AUCTION_ID } from '../lib/firebaseConfig';
import { Player, User, Bid, AuctionStatus, AuctionWinner, PlayerRole } from '../types';

export interface AuctionData {
    status: AuctionStatus;
    players: Player[];
    auctionQueue: number[];
    currentPlayerIndex: number;
    currentBid: Bid | null;
    countdownEnd: number | null;
    lastWinner: AuctionWinner | null;
    users: Record<string, User>; // Keyed by UID
    config: {
        isTestMode: boolean;
        winnerImageDataUrl: string | null;
        specialUserClipUrl: string | null;
        initialCredits?: number;
    };
    customLogos: Record<string, string>;
}

const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };
const auctionRef = ref(db, `auctions/${AUCTION_ID}`);

interface AuctionState {
  auction: AuctionData | null;
  isConnecting: boolean;
  serverTimeOffset: number;
  actions: {
    connect: () => Unsubscribe;
    createUserProfile: (uid: string, name: string, teamName: string, email: string) => Promise<void>;
    deleteUserProfile: (uid: string) => Promise<void>;
    setPlayers: (players: Player[]) => Promise<void>;
    addPlayerManually: (playerData: Omit<Player, 'id'>) => Promise<void>;
    setCustomLogo: (clubName: string, logoDataUrl: string) => Promise<void>;
    setWinnerImageDataUrl: (dataUrl: string) => Promise<void>;
    setSpecialUserClipUrl: (dataUrl: string) => Promise<void>;
    setTeamName: (userId: string, teamName: string) => Promise<void>;
    setProfilePicture: (userId: string, dataUrl: string) => Promise<void>;
    setUserReady: (userId: string) => Promise<void>;
    initializeAuction: (initialCredits: number) => Promise<void>;
    startAuction: () => Promise<void>;
    pauseAuction: () => Promise<void>;
    resumeAuction: () => Promise<void>;
    stopAuction: () => Promise<void>;
    placeBid: (userId: string, amount: number) => Promise<boolean>;
    sellPlayer: () => Promise<void>;
    prepareNextPlayer: () => Promise<void>;
    nextPlayer: () => Promise<void>;
    resetAuction: () => Promise<void>;
    startTestAuction: () => Promise<void>;
    stopTestAuction: () => Promise<void>;
  };
}

const useAuctionStore = create<AuctionState>((set, get) => ({
  auction: null,
  isConnecting: true,
  serverTimeOffset: 0,
  actions: {
    connect: () => {
        const offsetRef = ref(db, '.info/serverTimeOffset');
        onValue(offsetRef, (snap) => {
            const offset = snap.val() || 0;
            set({ serverTimeOffset: offset });
        });

        const listener = onValue(auctionRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataFromDb = snapshot.val();
                
                const normalizedAuctionData: AuctionData = {
                    ...dataFromDb,
                    players: dataFromDb.players || [],
                    auctionQueue: dataFromDb.auctionQueue || [],
                    users: dataFromDb.users || {},
                    customLogos: dataFromDb.customLogos || {},
                    config: dataFromDb.config || { isTestMode: false, winnerImageDataUrl: null, specialUserClipUrl: null, initialCredits: 500 },
                };

                if (normalizedAuctionData.users) {
                    Object.keys(normalizedAuctionData.users).forEach(uid => {
                        const user = normalizedAuctionData.users[uid];
                        if (user) {
                            user.squad = user.squad || [];
                        }
                    });
                }
                
                set({ auction: normalizedAuctionData, isConnecting: false });

            } else {
                const initialData: AuctionData = {
                    status: 'SETUP',
                    users: {},
                    players: [],
                    auctionQueue: [],
                    currentPlayerIndex: -1,
                    currentBid: null,
                    countdownEnd: null,
                    lastWinner: null,
                    config: { isTestMode: false, winnerImageDataUrl: null, specialUserClipUrl: null, initialCredits: 500 },
                    customLogos: {},
                };
                setFirebaseData(auctionRef, initialData).then(() => {
                    set({ auction: initialData, isConnecting: false });
                });
            }
        });
        return listener;
    },
    createUserProfile: async (uid, name, teamName, email) => {
        const usersRef = ref(db, `auctions/${AUCTION_ID}/users`);
        await runTransaction(usersRef, (currentUsers) => {
            if (currentUsers === null) {
                currentUsers = {};
            }
            if (currentUsers[uid]) {
                return; 
            }

            const isAdmin = email.toLowerCase() === 'marocchini.andrea@gmail.com';

            currentUsers[uid] = {
                uid,
                name,
                teamName,
                email,
                isAdmin,
                credits: 500,
                squad: [],
                isReady: isAdmin,
                profilePicture: null,
            };

            return currentUsers;
        });
    },
    deleteUserProfile: (uid) => remove(ref(db, `auctions/${AUCTION_ID}/users/${uid}`)),
    setPlayers: async (players) => {
      const updates = {
        [`auctions/${AUCTION_ID}/players`]: players,
        [`auctions/${AUCTION_ID}/auctionQueue`]: players.map((_, i) => i),
      };
      await update(ref(db), updates);
    },
    addPlayerManually: async (playerData) => {
        const { auction } = get();
        if (!auction) return;
        const newPlayer: Player = {
            ...playerData,
            id: `${playerData.name.replace(/\s/g, '-')}-${Date.now()}`
        };
        const newPlayers = [...(auction.players || []), newPlayer];
        const newQueue = newPlayers.map((_, index) => index);
        const updates = {
            [`auctions/${AUCTION_ID}/players`]: newPlayers,
            [`auctions/${AUCTION_ID}/auctionQueue`]: newQueue
        };
        await update(ref(db), updates);
    },
    setCustomLogo: (clubName, logoDataUrl) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/customLogos/${clubName.toLowerCase()}`), logoDataUrl),
    setWinnerImageDataUrl: (dataUrl) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/config/winnerImageDataUrl`), dataUrl),
    setSpecialUserClipUrl: (dataUrl) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/config/specialUserClipUrl`), dataUrl),
    setTeamName: (userId, teamName) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/users/${userId}/teamName`), teamName),
    setProfilePicture: (userId, dataUrl) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/users/${userId}/profilePicture`), dataUrl),
    setUserReady: (userId) => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/users/${userId}/isReady`), true),
    
    initializeAuction: async (initialCredits) => {
      const { auction } = get();
      if (!auction || !auction.users) return;
      
      const updatedUsers: Record<string, User> = {};
      Object.keys(auction.users).forEach(uid => {
          const user = auction.users[uid];
          updatedUsers[uid] = {
              ...user,
              credits: initialCredits,
              squad: [], 
              isReady: user.isAdmin || false, 
          };
      });
       await update(ref(db, `auctions/${AUCTION_ID}`), {
          users: updatedUsers,
          status: 'READY',
          currentPlayerIndex: -1,
          currentBid: null,
          lastWinner: null,
          'config/initialCredits': initialCredits,
      });
    },
    startAuction: () => get().actions.nextPlayer(),
    pauseAuction: () => setFirebaseData(ref(db, `auctions/${AUCTION_ID}/status`), 'PAUSED'),
    resumeAuction: async () => {
      const { auction, serverTimeOffset } = get();
      if (!auction || auction.status !== 'PAUSED') return;
      const updates = {
          status: 'BIDDING',
          countdownEnd: Date.now() + serverTimeOffset + 8000,
      };
      await update(ref(db, `auctions/${AUCTION_ID}`), updates);
    },
    stopAuction: () => {
        return get().actions.resetAuction();
    },
    placeBid: async (userId, amount) => {
      const { auction, serverTimeOffset } = get();
      if (!auction || auction.status !== 'BIDDING' || !auction.players || !auction.auctionQueue || auction.currentPlayerIndex === null) return false;
      
      const currentUser = auction.users[userId];
      const player = auction.players[auction.auctionQueue[auction.currentPlayerIndex]];

      if (!currentUser || !player) return false;
      
      const squadCountByRole = (currentUser.squad || []).filter(p => p.role === player.role).length;
      if (squadCountByRole >= ROLE_LIMITS[player.role]) return false;
      if (amount <= (auction.currentBid?.amount || player.baseValue - 1)) return false;
      if (currentUser.credits < amount) return false;

      const countdownDuration = auction.config.isTestMode ? 2000 : 8000;
      
      await update(ref(db, `auctions/${AUCTION_ID}`), {
          currentBid: { userId, amount },
          countdownEnd: Date.now() + serverTimeOffset + countdownDuration,
      });
      return true;
    },
    sellPlayer: async () => {
        const { auction } = get();
        if (!auction || !auction.players || !auction.auctionQueue) {
             console.error("Sell action cancelled: auction data missing.");
             return;
        }

        if (!auction.currentBid) {
            await update(ref(db, `auctions/${AUCTION_ID}`), {
                status: 'SOLD',
                lastWinner: null,
                countdownEnd: null,
                currentBid: null
            });
            return;
        }

        const { currentBid } = auction;
        const winner = auction.users[currentBid.userId];
        const player = auction.players[auction.auctionQueue[auction.currentPlayerIndex]];

        if (winner && player) {
            const pricePaid = currentBid.amount;
            const updatedWinner = {
                ...winner,
                credits: winner.credits - pricePaid,
                squad: [...(winner.squad || []), { ...player, baseValue: pricePaid }],
            };

            const updates: any = {};
            updates[`users/${winner.uid}`] = updatedWinner;
            updates['lastWinner'] = { player, user: winner, amount: pricePaid };
            updates['status'] = 'SOLD';
            updates['currentBid'] = null;
            updates['countdownEnd'] = null;

            await update(ref(db, `auctions/${AUCTION_ID}`), updates);
        }
    },
    prepareNextPlayer: async () => {
        const { auction, serverTimeOffset } = get();
        if (!auction || !auction.auctionQueue) return;
        const nextIndex = auction.currentPlayerIndex + 1;

        if (nextIndex < auction.auctionQueue.length) {
            await update(ref(db, `auctions/${AUCTION_ID}`), {
                status: 'NEXT_PLAYER_PREVIEW',
                countdownEnd: Date.now() + serverTimeOffset + 5000,
            });
        } else {
             await update(ref(db, `auctions/${AUCTION_ID}`), {
                status: 'ENDED',
                currentPlayerIndex: -1,
                'config/isTestMode': false,
            });
        }
    },
    nextPlayer: async () => {
      const { auction, serverTimeOffset } = get();
      // Add null checks for players and users to ensure data is available for test bids.
      if (!auction || !auction.auctionQueue || !auction.players || !auction.users) return;
      const nextIndex = auction.currentPlayerIndex + 1;

      if (nextIndex < auction.auctionQueue.length) {
        const countdownDuration = auction.config.isTestMode ? 3000 : 10000;
        
        let testBid: Bid | null = null;
        // If in test mode, automatically create a bid for the next player to simulate a purchase.
        if (auction.config.isTestMode) {
            const player = auction.players[auction.auctionQueue[nextIndex]];
            const userUIDs = Object.keys(auction.users);
            // Prefer non-admin users for more realistic test bidding.
            const nonAdminUsers = userUIDs.filter(uid => auction.users[uid] && !auction.users[uid].isAdmin);
            
            const bidderPool = nonAdminUsers.length > 0 ? nonAdminUsers : userUIDs;

            // Ensure there is at least one user to place a bid.
            if (bidderPool.length > 0 && player) {
                const randomBidderId = bidderPool[Math.floor(Math.random() * bidderPool.length)];
                testBid = { userId: randomBidderId, amount: player.baseValue };
            }
        }

        await update(ref(db, `auctions/${AUCTION_ID}`), {
            currentPlayerIndex: nextIndex,
            currentBid: testBid, // This will be null in normal mode, or the test bid.
            status: 'BIDDING',
            countdownEnd: Date.now() + serverTimeOffset + countdownDuration,
        });
      } else {
        await update(ref(db, `auctions/${AUCTION_ID}`), {
            status: 'ENDED',
            currentPlayerIndex: -1,
            'config/isTestMode': false,
        });
      }
    },
    resetAuction: async () => {
        console.log("ACTION: Attempting foolproof, atomic auction reset by building a new object.");
        const { auction } = get();
        if (!auction) {
            alert("CRITICAL ERROR: Cannot reset because the current auction state is not loaded in the app. Please refresh the page and try again.");
            return;
        }
    
        // Preserve data that carries over, but handle potential null/undefined values safely.
        const oldUsers = auction.users || {};
        const oldConfig = auction.config;
        const oldCustomLogos = auction.customLogos || {};
        const initialCredits = oldConfig?.initialCredits || 500;
    
        // Build a pristine new 'users' object. This loop is critical for sanitization.
        const newUsersState: Record<string, User> = {};
        for (const uid in oldUsers) {
            const oldUser = oldUsers[uid];
            newUsersState[uid] = {
                // Keep user-specific info
                uid: oldUser.uid,
                name: oldUser.name || "Unnamed User",
                teamName: oldUser.teamName || "Unnamed Team",
                isAdmin: oldUser.isAdmin || false,
                email: oldUser.email || '',
                profilePicture: oldUser.profilePicture || null,
                
                // Reset auction-specific fields
                credits: initialCredits,
                squad: [], // Use an empty array for a fresh start. Firebase handles this correctly with `set`.
                isReady: oldUser.isAdmin || false,
            };
        }
    
        // Construct the entire new auction state object, ensuring no `undefined` values can exist.
        // This was the root cause of the silent failures.
        const newAuctionData: AuctionData = {
            status: 'SETUP',
            players: [],
            auctionQueue: [],
            currentPlayerIndex: -1,
            currentBid: null,
            countdownEnd: null,
            lastWinner: null,
            users: newUsersState,
            config: {
                isTestMode: false,
                winnerImageDataUrl: oldConfig?.winnerImageDataUrl || null,
                specialUserClipUrl: oldConfig?.specialUserClipUrl || null,
                initialCredits: initialCredits,
            },
            customLogos: oldCustomLogos,
        };
    
        try {
            // Use `set` to completely and atomically replace the data at the auctionRef.
            // This is the most reliable way to reset and avoids all silent failure modes.
            await setFirebaseData(auctionRef, newAuctionData);
            console.log("SUCCESS: Firebase auction data has been completely replaced with a fresh state.");
        } catch (error) {
            console.error("CRITICAL: The Firebase `set` operation failed during reset!", error);
            alert(`A critical error occurred while writing to the database. The auction could not be reset. Please check the console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
     startTestAuction: async () => {
        const { auction } = get();
        if (!auction || !auction.users) return;
        const updatedUsers: Record<string, User> = {};
        Object.keys(auction.users).forEach(uid => {
            updatedUsers[uid] = { ...auction.users[uid], credits: 500, squad: [], isReady: true };
        });

        await update(ref(db, `auctions/${AUCTION_ID}`), {
            users: updatedUsers,
            'config/isTestMode': true,
            currentPlayerIndex: -1,
            currentBid: null,
            lastWinner: null,
        });
        await get().actions.nextPlayer();
    },
    stopTestAuction: async () => {
       await update(ref(db, `auctions/${AUCTION_ID}`), {
            'config/isTestMode': false,
            status: 'PAUSED',
            countdownEnd: null,
       });
    },
  },
}));

export default useAuctionStore;