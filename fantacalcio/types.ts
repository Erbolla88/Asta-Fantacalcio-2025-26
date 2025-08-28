

export type PlayerRole = 'P' | 'D' | 'C' | 'A';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  club: string;
  baseValue: number;
}

export interface Bid {
  userId: string; // Firebase Auth UID
  amount: number;
}

export interface User {
  uid: string; // Firebase Auth UID, this is the primary key
  name: string;
  email?: string;
  credits: number;
  squad: Player[];
  isReady: boolean;
  teamName: string;
  profilePicture?: string | null;
  isAdmin: boolean;
}

export type AuctionStatus = 'SETUP' | 'READY' | 'BIDDING' | 'PAUSED' | 'SOLD' | 'ENDED' | 'NEXT_PLAYER_PREVIEW';

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