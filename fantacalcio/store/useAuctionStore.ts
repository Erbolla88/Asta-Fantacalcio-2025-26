import { create } from 'zustand';
import { Player, User, Bid, AuctionStatus, AuctionWinner, PlayerRole } from '../types';

type Language = 'it' | 'en';

interface AuctionState {
  users: Map<string, User>;
  players: Player[];
  auctionQueue: number[];
  currentPlayerIndex: number;
  currentBid: Bid | null;
  status: AuctionStatus;
  countdown: number;
  activeTimer: number | null;
  lastWinner: AuctionWinner | null;
  loggedInUserId: string | null;
  guestSessionId: string | null; // Tracks a non-admin user session
  customLogos: Map<string, string>; // clubName (lowercase) -> logoDataUrl
  language: Language;
  isTestMode: boolean;
  winnerImageDataUrl: string | null;
  actions: {
    setLanguage: (language: Language) => void;
    login: (userId: string, isGuest: boolean, userName?: string, status?: AuctionStatus, initialCredits?: number) => void;
    logout: () => void;
    setPlayers: (players: Player[]) => void;
    addUser: (name: string) => void;
    addPlayerManually: (playerData: Omit<Player, 'id'>) => void;
    setCustomLogo: (clubName: string, logoDataUrl: string) => void;
    setTeamName: (userId: string, teamName: string) => void;
    setProfilePicture: (userId: string, dataUrl: string) => void;
    setWinnerImageDataUrl: (dataUrl: string) => void;
    initializeAuction: (initialCredits: number) => void;
    startAuction: () => void;
    pauseAuction: () => void;
    resumeAuction: () => void;
    placeBid: (userId: string, amount: number) => boolean;
    _tick: () => void;
    _startCountdown: (durationInSeconds?: number) => void;
    _clearTimer: () => void;
    _sellPlayer: () => void;
    _nextPlayer: () => void;
    setUserReady: (userId: string) => void;
    resetAuction: () => void;
    startTestAuction: () => void;
    stopTestAuction: () => void;
  };
}

const createInitialUserMap = (): Map<string, User> => {
    const userMap = new Map<string, User>();
    const adminUser = { id: 'admin', name: 'Ceffo & Bolla Admin' };
    userMap.set(adminUser.id, {
        ...adminUser,
        credits: 500,
        squad: [],
        isReady: false,
        teamName: `Ceffo & Bolla`, // Simplified team name
        profilePicture: undefined,
    });
    return userMap;
};

const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };

// Helper to safely access sessionStorage and localStorage
const getSessionState = () => {
    try {
        const loggedInUserId = sessionStorage.getItem('fantacalcio_loggedInUserId') || null;
        const guestSessionId = sessionStorage.getItem('fantacalcio_guestSessionId') || null;
        // If there's a logged-in user, their session is primary. A guest session is only relevant if logged out.
        return { loggedInUserId, guestSessionId: loggedInUserId ? guestSessionId : null };
    } catch (e) {
        console.warn('Failed to access sessionStorage. Login will not persist.');
        return { loggedInUserId: null, guestSessionId: null };
    }
};

const getInitialLanguage = (): Language => {
    try {
        const storedLang = localStorage.getItem('fantacalcio_language');
        return storedLang === 'en' || storedLang === 'it' ? storedLang : 'it';
    } catch (e) {
        console.warn('Failed to access localStorage. Defaulting to Italian.');
        return 'it';
    }
}

const getInitialWinnerImage = (): string | null => {
    try {
        return localStorage.getItem('fantacalcio_winnerImage');
    } catch (e) {
        console.warn('Failed to access localStorage. Winner image will not persist.');
        return null;
    }
};

const getInitialCustomLogos = (): Map<string, string> => {
    try {
        const storedLogos = localStorage.getItem('fantacalcio_customLogos');
        if (storedLogos) {
            return new Map(JSON.parse(storedLogos));
        }
    } catch (e) {
        console.warn('Failed to access or parse custom logos from localStorage.');
    }
    return new Map<string, string>();
};

const useAuctionStore = create<AuctionState>((set, get) => ({
  users: createInitialUserMap(),
  players: [],
  auctionQueue: [],
  currentPlayerIndex: -1,
  currentBid: null,
  status: 'SETUP',
  countdown: 10,
  activeTimer: null,
  lastWinner: null,
  loggedInUserId: getSessionState().loggedInUserId,
  guestSessionId: getSessionState().guestSessionId,
  customLogos: getInitialCustomLogos(),
  language: getInitialLanguage(),
  winnerImageDataUrl: getInitialWinnerImage(),
  isTestMode: false,
  actions: {
    setLanguage: (language) => {
        try {
            localStorage.setItem('fantacalcio_language', language);
        } catch (e) {
             console.warn('Failed to access localStorage. Language preference will not be saved.');
        }
        set({ language });
    },
    login: (userId, isGuest, userName, status, initialCredits) => {
        const { users } = get();
        let mutableUsers = new Map(users);
        const userExisted = mutableUsers.has(userId);

        // Step 1: Create the user if they don't exist
        if (!userExisted && userName) {
            const newUser: User = {
                id: userId,
                name: userName,
                credits: 500,
                squad: [],
                isReady: false,
                teamName: `${userName}'s Team`,
                profilePicture: undefined,
            };
            mutableUsers.set(userId, newUser);
        }
        
        if (!mutableUsers.has(userId)) {
            console.warn(`Attempted login with invalid user ID: ${userId}`);
            return;
        }
        
        // Step 2: Handle session storage
        try {
            sessionStorage.setItem('fantacalcio_loggedInUserId', userId);
            if (isGuest) {
                sessionStorage.setItem('fantacalcio_guestSessionId', userId);
            } else {
                sessionStorage.removeItem('fantacalcio_guestSessionId');
            }
        } catch (e) {
            console.warn('Failed to access sessionStorage. Login will not persist.');
        }
        
        const stateUpdate: Partial<AuctionState> = {
            loggedInUserId: userId,
            guestSessionId: isGuest ? userId : null,
        };
        
        // Step 3: Handle state synchronization
        if (status === 'READY' && typeof initialCredits === 'number') {
            const syncedUsers = new Map<string, User>();
            mutableUsers.forEach((user, id) => {
                syncedUsers.set(id, {
                    ...user,
                    credits: initialCredits,
                    squad: [],
                    isReady: id === 'admin' ? true : false,
                });
            });
            stateUpdate.users = syncedUsers;
            stateUpdate.status = 'READY';
            stateUpdate.currentPlayerIndex = -1;
            stateUpdate.currentBid = null;
            stateUpdate.lastWinner = null;
        } else if (!userExisted) {
            // If not syncing but a user was created, update the user list
            stateUpdate.users = mutableUsers;
        }

        set(stateUpdate);
    },
    logout: () => {
        try {
          sessionStorage.removeItem('fantacalcio_loggedInUserId');
        } catch (e) {
          console.warn('Failed to access sessionStorage.');
        }
        // When logging out, we clear the loggedInUserId but PRESERVE the guestSessionId
        // so the app knows which re-login page to show.
        set({ loggedInUserId: null });
    },
    setPlayers: (players) => {
        const queue = players.map((_, index) => index);
        set({ players, auctionQueue: queue, status: 'SETUP' });
    },
    addUser: (name) => {
        const { users } = get();
        // Create a URL-friendly, unique ID for the new user
        const newId = `user-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
        const newUser: User = {
            id: newId,
            name: name,
            credits: 500, // Default credits, will be overwritten by initializeAuction
            squad: [],
            isReady: false,
            teamName: `${name}'s Team`,
            profilePicture: undefined,
        };
        const newUsers = new Map(users);
        newUsers.set(newId, newUser);
        set({ users: newUsers });
    },
    addPlayerManually: (playerData) => {
        const { players } = get();
        const newPlayer: Player = {
            ...playerData,
            id: `${playerData.name.replace(/\s/g, '-')}-${Date.now()}`
        };
        const newPlayers = [...players, newPlayer];
        const newQueue = newPlayers.map((_, index) => index);
        set({
            players: newPlayers,
            auctionQueue: newQueue
        });
    },
    setCustomLogo: (clubName, logoDataUrl) => {
        const newCustomLogos = new Map(get().customLogos);
        newCustomLogos.set(clubName.toLowerCase(), logoDataUrl);
        try {
            localStorage.setItem('fantacalcio_customLogos', JSON.stringify(Array.from(newCustomLogos.entries())));
        } catch (e) {
            console.warn('Failed to save custom logos to localStorage');
        }
        set({ customLogos: newCustomLogos });
    },
     setTeamName: (userId, teamName) => {
        const users = get().users;
        const user = users.get(userId);
        if (user) {
            const newUsers = new Map(users);
            newUsers.set(userId, { ...user, teamName });
            set({ users: newUsers });
        }
    },
    setProfilePicture: (userId, dataUrl) => {
        const users = get().users;
        const user = users.get(userId);
        if (user) {
            const newUsers = new Map(users);
            newUsers.set(userId, { ...user, profilePicture: dataUrl });
            set({ users: newUsers });
        }
    },
    setWinnerImageDataUrl: (dataUrl) => {
        try {
            localStorage.setItem('fantacalcio_winnerImage', dataUrl);
        } catch (e) {
            console.warn('Failed to save winner image to localStorage.');
        }
        set({ winnerImageDataUrl: dataUrl });
    },
    initializeAuction: (initialCredits) => {
        const oldUsers = get().users;
        const newUsers = new Map<string, User>();
        oldUsers.forEach((user, id) => {
            newUsers.set(id, {
                ...user,
                credits: initialCredits,
                squad: [],
                isReady: id === 'admin' ? true : false, // Admin is auto-ready
            });
        });
        set({ users: newUsers, status: 'READY', currentPlayerIndex: -1, currentBid: null, lastWinner: null });
    },
    startAuction: () => {
        get().actions._nextPlayer();
    },
    pauseAuction: () => {
        const { status, actions } = get();
        if (status === 'BIDDING') {
            actions._clearTimer();
            set({ status: 'PAUSED' });
        }
    },
    resumeAuction: () => {
        const { status, countdown, actions } = get();
        if (status === 'PAUSED') {
            actions._startCountdown(countdown);
        }
    },
    placeBid: (userId, amount) => {
      const { status, players, auctionQueue, currentPlayerIndex, currentBid, users, actions, isTestMode } = get();
      const currentUser = users.get(userId);
      const player = players[auctionQueue[currentPlayerIndex]];

      if (status !== 'BIDDING' || !currentUser || !player) return false;
      
      const squadCountByRole = currentUser.squad.filter(p => p.role === player.role).length;
      if (squadCountByRole >= ROLE_LIMITS[player.role]) {
          console.warn(`User ${userId} cannot bid on ${player.name}. Role limit for ${player.role} reached.`);
          return false;
      }

      if (amount <= (currentBid?.amount || player.baseValue - 1)) return false;
      if (currentUser.credits < amount) return false;

      set({ currentBid: { userId, amount } });
      actions._startCountdown(isTestMode ? 2 : 5); // Reset countdown to 2s in test mode, 5s otherwise
      return true;
    },
    _tick: () => {
      const { countdown, actions } = get();
      if (countdown > 1) {
        set((state) => ({ countdown: state.countdown - 1 }));
      } else {
        actions._sellPlayer();
      }
    },
    _startCountdown: (durationInSeconds = 5) => {
      const { actions } = get();
      actions._clearTimer();
      const timer = window.setInterval(actions._tick, 1000);
      set({ countdown: durationInSeconds, activeTimer: timer, status: 'BIDDING' });
    },
    _clearTimer: () => {
      const { activeTimer } = get();
      if (activeTimer) {
        window.clearInterval(activeTimer);
        set({ activeTimer: null });
      }
    },
    _sellPlayer: () => {
        const { actions, currentBid, players, auctionQueue, currentPlayerIndex, users, isTestMode } = get();
        actions._clearTimer();

        if (currentBid) {
            const winner = users.get(currentBid.userId);
            const player = players[auctionQueue[currentPlayerIndex]];
            if (winner && player) {
                const newUsers = new Map(users);
                const updatedWinner = {
                    ...winner,
                    credits: winner.credits - currentBid.amount,
                    squad: [...winner.squad, { ...player, baseValue: currentBid.amount }], // Store price paid
                };
                newUsers.set(winner.id, updatedWinner);
                set({ 
                    users: newUsers, 
                    lastWinner: { player, user: winner, amount: currentBid.amount },
                    status: 'SOLD'
                });
            }
        } else {
             set({ status: 'SOLD', lastWinner: null });
        }
        
        const delay = isTestMode ? 2000 : 5000;
        setTimeout(() => {
            actions._nextPlayer();
        }, delay);
    },
    _nextPlayer: () => {
      const { auctionQueue, currentPlayerIndex, actions, isTestMode } = get();
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex < auctionQueue.length) {
        set({
          currentPlayerIndex: nextIndex,
          currentBid: null,
          status: 'BIDDING',
        });
        actions._startCountdown(isTestMode ? 3 : 10);
      } else {
        actions._clearTimer();
        set({ status: 'ENDED', currentPlayerIndex: -1, isTestMode: false }); // End test mode on auction completion
      }
    },
    setUserReady: (userId) => {
        const oldUsers = get().users;
        const userToUpdate = oldUsers.get(userId);
        if (userToUpdate) {
            const newUsers = new Map<string, User>(oldUsers);
            newUsers.set(userId, { ...userToUpdate, isReady: true });
            set({ users: newUsers });
        }
    },
    resetAuction: () => {
        get().actions._clearTimer();
        try {
            sessionStorage.removeItem('fantacalcio_loggedInUserId');
            sessionStorage.removeItem('fantacalcio_guestSessionId');
        } catch (e) {
             console.warn('Failed to access storage.');
        }
        set({
            users: createInitialUserMap(),
            players: [],
            auctionQueue: [],
            currentPlayerIndex: -1,
            currentBid: null,
            status: 'SETUP',
            countdown: 10,
            activeTimer: null,
            lastWinner: null,
            loggedInUserId: null,
            guestSessionId: null,
            isTestMode: false,
        });
    },
    startTestAuction: () => {
        const { actions, users } = get();

        // Perform a test-specific initialization
        const newUsers = new Map<string, User>();
        users.forEach((user, id) => {
            newUsers.set(id, {
                ...user,
                credits: 500, // Fixed credits for test
                squad: [],
                isReady: true, // All users are ready
            });
        });

        set({
            users: newUsers,
            isTestMode: true,
            // Reset auction state for the test run
            currentPlayerIndex: -1,
            currentBid: null,
            lastWinner: null,
        });

        // Directly start the auction process
        actions._nextPlayer();
    },
    stopTestAuction: () => {
        get().actions._clearTimer();
        set({ isTestMode: false, status: 'PAUSED' });
    },
  },
}));

export default useAuctionStore;