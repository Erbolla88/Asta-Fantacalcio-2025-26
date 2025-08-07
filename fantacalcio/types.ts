
export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export enum ItemStatus {
  OnAuction = 'ON_AUCTION',
  Sold = 'SOLD',
  Pending = 'PENDING',
}

export enum PlayerRole {
  Portiere = 'P',
  Difensore = 'D',
  Centrocampista = 'C',
  Attaccante = 'A',
}

export interface User {
  id: number;
  name: string;
  role: Role;
  credits: number;
}

export interface Player {
  id: number;
  playerName: string;
  role: PlayerRole;
  team: string;
  startingValue: number;
  currentValue: number;
  highestBidderId: number | null;
  status: ItemStatus;
  soldToId?: number | null;
  soldFor?: number | null;
  bidEndTime?: number | null; // Timestamp
}
