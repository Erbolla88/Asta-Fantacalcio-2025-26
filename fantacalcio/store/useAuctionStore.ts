import { create } from 'zustand';
import { Player, User, Bid, AuctionStatus, AuctionWinner, PlayerRole, SharedAuctionState } from '../types';
import { saveSharedState } from '../services/syncService';

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
    login: (userId: string, isGuest: boolean, userName?: string) => void;
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
    setUserReady: (userId: string) => void;
    resetAuction: () => void;
    startTestAuction: () => void;
    stopTestAuction: () => void;
    // Internal & Sync Actions
    _tick: () => void;
    _startCountdown: (durationInSeconds?: number) => void;
    _clearTimer: () => void;
    _sellPlayer: () => void;
    _nextPlayer: () => void;
    _broadcastState: () => void;
    overwriteSharedState: (newState: { users: Map<string, User> } & Omit<SharedAuctionState, 'users'>) => void;
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
        teamName: `Ceffo & Bolla`,
        profilePicture: undefined,
    });
    return userMap;
};

const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };

const getSessionState = () => {
    try {
        const loggedInUserId = sessionStorage.getItem('fantacalcio_loggedInUserId') || null;
        const guestSessionId = sessionStorage.getItem('fantacalcio_guestSessionId') || null;
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
    login: (userId, isGuest, userName) => {
        const { users, actions } = get();
        const userExisted = users.has(userId);
        let finalUsers = new Map(users);

        if (!userExisted && userName) {
            const newUser: User = {
                id: userId,
                name: userName,
                credits: 500, // This is a default; it will be overwritten by the synced state.
                squad: [],
                isReady: false, // User must explicitly click "I'm ready"
                teamName: `${userName}'s Team`,
                profilePicture: undefined,
            };
            finalUsers.set(userId, newUser);
        }
        
        if (!finalUsers.has(userId)) return;
        
        try {
            sessionStorage.setItem('fantacalcio_loggedInUserId', userId);
            if (isGuest) sessionStorage.setItem('fantacalcio_guestSessionId', userId);
            else sessionStorage.removeItem('fantacalcio_guestSessionId');
        } catch (e) { console.warn('Failed to access sessionStorage.'); }
        
        set({
            loggedInUserId: userId,
            guestSessionId: isGuest ? userId : null,
            users: finalUsers,
        });

        // Announce presence if new
        if(!userExisted) {
          actions._broadcastState();
        }
    },
    logout: () => {
        try {
          sessionStorage.removeItem('fantacalcio_loggedInUserId');
        } catch (e) { console.warn('Failed to access sessionStorage.'); }
        set({ loggedInUserId: null });
    },
    setPlayers: (players) => {
        const queue = players.map((_, index) => index);
        set({ players, auctionQueue: queue, status: 'SETUP' });
    },
    addUser: (name) => {
        const { users, actions } = get();
        const newId = `user-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
        const newUser: User = {
            id: newId,
            name: name,
            credits: 500,
            squad: [],
            isReady: false,
            teamName: `${name}'s Team`,
            profilePicture: undefined,
        };
        const newUsers = new Map(users);
        newUsers.set(newId, newUser);
        set({ users: newUsers });
        actions._broadcastState();
    },
    addPlayerManually: (playerData) => {
        set(state => {
            const newPlayer: Player = {
                ...playerData,
                id: `${playerData.name.replace(/\s/g, '-')}-${Date.now()}`
            };
            const newPlayers = [...state.players, newPlayer];
            return {
                players: newPlayers,
                auctionQueue: newPlayers.map((_, index) => index)
            };
        });
    },
    setCustomLogo: (clubName, logoDataUrl) => {
        const newCustomLogos = new Map(get().customLogos);
        newCustomLogos.set(clubName.toLowerCase(), logoDataUrl);
        try {
            localStorage.setItem('fantacalcio_customLogos', JSON.stringify(Array.from(newCustomLogos.entries())));
        } catch (e) { console.warn('Failed to save custom logos to localStorage'); }
        set({ customLogos: newCustomLogos });
    },
     setTeamName: (userId, teamName) => {
        const { users, actions } = get();
        const user = users.get(userId);
        if (user) {
            const newUsers = new Map(users);
            newUsers.set(userId, { ...user, teamName });
            set({ users: newUsers });
            actions._broadcastState();
        }
    },
    setProfilePicture: (userId, dataUrl) => {
        const { users, actions } = get();
        const user = users.get(userId);
        if (user) {
            const newUsers = new Map(users);
            newUsers.set(userId, { ...user, profilePicture: dataUrl });
            set({ users: newUsers });
            actions._broadcastState();
        }
    },
    setWinnerImageDataUrl: (dataUrl) => {
        try { localStorage.setItem('fantacalcio_winnerImage', dataUrl); } 
        catch (e) { console.warn('Failed to save winner image to localStorage.'); }
        set({ winnerImageDataUrl: dataUrl });
    },
    initializeAuction: (initialCredits) => {
        const { users, actions } = get();
        const newUsers = new Map<string, User>();
        users.forEach((user, id) => {
            newUsers.set(id, {
                ...user,
                credits: initialCredits,
                squad: [],
                isReady: id === 'admin' ? true : false,
            });
        });
        set({ users: newUsers, status: 'READY', currentPlayerIndex: -1, currentBid: null, lastWinner: null });
        actions._broadcastState();
    },
    startAuction: () => {
        get().actions._nextPlayer();
    },
    pauseAuction: () => {
        const { status, actions } = get();
        if (status === 'BIDDING') {
            actions._clearTimer();
            set({ status: 'PAUSED' });
            actions._broadcastState();
        }
    },
    resumeAuction: () => {
        const { status, countdown, actions } = get();
        if (status === 'PAUSED') {
            actions._startCountdown(countdown);
            // The _startCountdown action will set status to 'BIDDING' and broadcast
        }
    },
    placeBid: (userId, amount) => {
      const { status, players, auctionQueue, currentPlayerIndex, currentBid, users, actions } = get();
      const currentUser = users.get(userId);
      const player = players[auctionQueue[currentPlayerIndex]];

      if (status !== 'BIDDING' || !currentUser || !player) return false;
      
      const squadCountByRole = currentUser.squad.filter(p => p.role === player.role).length;
      if (squadCountByRole >= ROLE_LIMITS[player.role]) return false;

      if (amount <= (currentBid?.amount || player.baseValue - 1)) return false;
      if (currentUser.credits < amount) return false;

      set({ currentBid: { userId, amount }, countdown: get().isTestMode ? 2 : 5 });
      actions._broadcastState(); // Broadcast the new bid immediately
      actions._startCountdown(get().isTestMode ? 2 : 5);
      return true;
    },
    _tick: () => {
      const { countdown, actions, status, loggedInUserId } = get();
      if (status !== 'BIDDING') {
          actions._clearTimer();
          return;
      }
      if (countdown > 1) {
        set((state) => ({ countdown: state.countdown - 1 }));
      } else {
        // ONLY the admin's timer can trigger a sale to prevent race conditions.
        if (loggedInUserId === 'admin') {
            actions._sellPlayer();
        }
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
                    squad: [...winner.squad, { ...player, baseValue: currentBid.amount }],
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
        
        actions._broadcastState();

        const delay = isTestMode ? 2000 : 5000;
        setTimeout(() => actions._nextPlayer(), delay);
    },
    _nextPlayer: () => {
      const { auctionQueue, currentPlayerIndex, actions, isTestMode } = get();
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex < auctionQueue.length) {
        set({
          currentPlayerIndex: nextIndex,
          currentBid: null,
          status: 'BIDDING',
          countdown: isTestMode ? 3 : 10,
        });
        actions._startCountdown(isTestMode ? 3 : 10);
      } else {
        actions._clearTimer();
        set({ status: 'ENDED', currentPlayerIndex: -1, isTestMode: false });
      }
      actions._broadcastState();
    },
    setUserReady: (userId) => {
        const { users, actions } = get();
        const userToUpdate = users.get(userId);
        if (userToUpdate) {
            const newUsers = new Map<string, User>(users);
            newUsers.set(userId, { ...userToUpdate, isReady: true });
            set({ users: newUsers });
            actions._broadcastState();
        }
    },
    resetAuction: () => {
        get().actions._clearTimer();
        try {
            sessionStorage.removeItem('fantacalcio_loggedInUserId');
            sessionStorage.removeItem('fantacalcio_guestSessionId');
            // Also clear the shared state for a clean start
            localStorage.removeItem('fantacalcio_shared_state');
        } catch (e) { console.warn('Failed to access storage.'); }
        
        const initialUsers = createInitialUserMap();
        set({
            users: initialUsers,
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
        // Broadcast the reset state to all clients
        get().actions._broadcastState();
    },
    startTestAuction: () => {
        // This is a local-only admin action, but we can broadcast the resulting state
        const { actions, users } = get();
        const newUsers = new Map<string, User>();
        users.forEach((user, id) => {
            newUsers.set(id, { ...user, credits: 500, squad: [], isReady: true });
        });

        set({
            users: newUsers,
            isTestMode: true,
            currentPlayerIndex: -1,
            currentBid: null,
            lastWinner: null,
        });
        actions._nextPlayer();
    },
    stopTestAuction: () => {
        get().actions._clearTimer();
        set({ isTestMode: false, status: 'PAUSED' });
        get().actions._broadcastState();
    },
    _broadcastState: () => {
        const { status, users, currentPlayerIndex, currentBid, lastWinner, countdown } = get();
        saveSharedState({
            status,
            users: Array.from(users.entries()),
            currentPlayerIndex,
            currentBid,
            lastWinner,
            countdown,
        });
    },
    overwriteSharedState: (newState) => {
        const { actions, users: localUsers } = get();
        actions._clearTimer();
        
        // Intelligently merge user lists. The new state is the authority, but we add
        // any users from our local state that are missing from the new state.
        // This prevents a newly joining user from being erased by the first sync event.
        const mergedUsers = new Map(newState.users);
        localUsers.forEach((user, id) => {
            if (!mergedUsers.has(id)) {
                mergedUsers.set(id, user);
            }
        });

        set({
            status: newState.status,
            users: mergedUsers,
            currentPlayerIndex: newState.currentPlayerIndex,
            currentBid: newState.currentBid,
            lastWinner: newState.lastWinner,
            countdown: newState.countdown,
        });
        
        if (newState.status === 'BIDDING') {
            get().actions._startCountdown(newState.countdown);
        } else if (newState.status === 'PAUSED' || newState.status === 'ENDED') {
            get().actions._clearTimer();
        }
    },
  },
}));

export default useAuctionStore;