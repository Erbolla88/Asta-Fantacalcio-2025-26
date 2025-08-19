

export type PlayerRole = 'P' | 'D' | 'C' | 'A';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  club: string;
  baseValue: number;
}

export interface Bid {
  userId: string;
  amount: number;
}

export interface User {
  id:string;
  name: string;
  credits: number;
  squad: Player[];
  isReady: boolean;
  teamName: string;
  profilePicture?: string; // Data URL for the image
}

export type AuctionStatus = 'SETUP' | 'READY' | 'BIDDING' | 'PAUSED' | 'SOLD' | 'ENDED';

export interface AuctionWinner {
    player: Player;
    user: User;
    amount: number;
}

export const SERIE_A_CLUBS = [
    'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina', 'Genoa', 'Hellas Verona', 
    'Inter', 'Juventus', 'Lazio', 'Lecce', 'Milan', 'Napoli', 'Parma', 'Pisa', 'Roma', 
    'Sassuolo', 'Torino', 'Udinese'
] as const;

export type ClubName = typeof SERIE_A_CLUBS[number];

/**
 * Defines the portion of the application state that is shared
 * between all participants in real-time.
 */
export interface SharedAuctionState {
  status: AuctionStatus;
  users: [string, User][]; // Serializable Map<string, User>
  currentPlayerIndex: number;
  currentBid: Bid | null;
  lastWinner: AuctionWinner | null;
  countdown: number;
}