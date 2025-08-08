import { create } from 'zustand';
import { Player, User, Bid, AuctionStatus, AuctionWinner, PlayerRole } from '../types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';


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
  customLogos: Map<string, string>; // clubName (lowercase) -> logoDataUrl
  actions: {
    login: (userId: string) => void;
    logout: () => void;
    setPlayers: (players: Player[]) => void;
    addPlayerManually: (playerData: Omit<Player, 'id'>) => void;
    setCustomLogo: (clubName: string, logoDataUrl: string) => void;
    setTeamName: (userId: string, teamName: string) => void;
    setProfilePicture: (userId: string, dataUrl: string) => void;
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
  };
}

const initialUsers = [
    { id: 'admin', name: 'Ceffo & Bolla Admin'},
    { id: uuidv4(), name: 'Zuppetta'},
    { id: uuidv4(), name: 'Mattia'},
    { id: uuidv4(), name: 'Gnani'},
    { id: uuidv4(), name: 'Roccia'},
    { id: uuidv4(), name: 'Treky & Seghetta'},
    { id: uuidv4(), name: 'Principe'},
    { id: uuidv4(), name: 'Gino'},
    { id: uuidv4(), name: 'Daniel'},
    { id: uuidv4(), name: 'Riccardo'},
];

const createInitialUserMap = (): Map<string, User> => {
    const userMap = new Map<string, User>();
    initialUsers.forEach(user => {
        userMap.set(user.id, {
            ...user,
            credits: 500,
            squad: [],
            isReady: false,
            teamName: `${user.name}'s Team`,
            profilePicture: undefined,
        });
    });
    return userMap;
};

const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };


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
  loggedInUserId: null,
  customLogos: new Map<string, string>(),
  actions: {
    login: (userId) => {
        if (get().users.has(userId)) {
            set({ loggedInUserId: userId });
        } else {
            console.warn(`Tentativo di login con ID utente non valido: ${userId}`);
        }
    },
    logout: () => set({ loggedInUserId: null }), // FIX: Do not reset auction status on logout
    setPlayers: (players) => {
        const queue = players.map((_, index) => index);
        set({ players, auctionQueue: queue, status: 'SETUP' });
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
      const { status, players, auctionQueue, currentPlayerIndex, currentBid, users, actions } = get();
      const currentUser = users.get(userId);
      const player = players[auctionQueue[currentPlayerIndex]];

      if (status !== 'BIDDING' || !currentUser || !player) return false;
      
      // Check role limits before placing a bid
      const squadCountByRole = currentUser.squad.filter(p => p.role === player.role).length;
      if (squadCountByRole >= ROLE_LIMITS[player.role]) {
          console.warn(`User ${userId} cannot bid on ${player.name}. Role limit for ${player.role} reached.`);
          return false;
      }

      if (amount <= (currentBid?.amount || player.baseValue - 1)) return false;
      if (currentUser.credits < amount) return false;

      set({ currentBid: { userId, amount } });
      actions._startCountdown(5); // Reset countdown to 5 seconds
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
        const { actions, currentBid, players, auctionQueue, currentPlayerIndex, users } = get();
        actions._clearTimer();

        if (currentBid) {
            const winner = users.get(currentBid.userId);
            const player = players[auctionQueue[currentPlayerIndex]];
            if (winner) {
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
            // Player unsold, goes to next
             set({ status: 'SOLD', lastWinner: null });
        }
        
        // Pause before next player
        setTimeout(() => {
            actions._nextPlayer();
        }, 5000);
    },
    _nextPlayer: () => {
      const { auctionQueue, currentPlayerIndex, actions } = get();
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex < auctionQueue.length) {
        set({
          currentPlayerIndex: nextIndex,
          currentBid: null,
          status: 'BIDDING',
        });
        actions._startCountdown(10); // Start with 10 seconds for a new player
      } else {
        actions._clearTimer();
        set({ status: 'ENDED', currentPlayerIndex: -1 });
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
            customLogos: new Map<string, string>(),
        });
    },
  },
}));

export default useAuctionStore;