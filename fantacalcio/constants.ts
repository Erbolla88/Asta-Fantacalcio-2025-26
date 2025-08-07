
import { User, Player, Role, ItemStatus, PlayerRole } from './types';

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Admin', role: Role.Admin, credits: 999999 },
  { id: 2, name: 'Carlo', role: Role.User, credits: 500 },
  { id: 3, name: 'Marco', role: Role.User, credits: 500 },
  { id: 4, name: 'Paolo', role: Role.User, credits: 500 },
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 1,
    playerName: 'Lautaro Martinez',
    role: PlayerRole.Attaccante,
    team: 'Inter',
    startingValue: 100,
    currentValue: 100,
    highestBidderId: null,
    status: ItemStatus.Pending,
  },
  {
    id: 2,
    playerName: 'Theo Hernandez',
    role: PlayerRole.Difensore,
    team: 'Milan',
    startingValue: 50,
    currentValue: 50,
    highestBidderId: null,
    status: ItemStatus.Pending,
  },
  {
    id: 3,
    playerName: 'Giacomo Bonaventura',
    role: PlayerRole.Centrocampista,
    team: 'Fiorentina',
    startingValue: 40,
    currentValue: 40,
    highestBidderId: null,
    status: ItemStatus.Pending,
  },
  {
    id: 4,
    playerName: 'Paulo Dybala',
    role: PlayerRole.Attaccante,
    team: 'Roma',
    startingValue: 80,
    currentValue: 80,
    highestBidderId: null,
    status: ItemStatus.Sold,
    soldToId: 2,
    soldFor: 120,
  },
];

export const BID_COUNTDOWN_SECONDS = 5;

export const TEAM_LOGOS: { [key: string]: string } = {
    'Atalanta': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Logo_Atalanta_Bergamo.svg',
    'Bologna': 'https://upload.wikimedia.org/wikipedia/en/5/5c/Bologna_F.C._1909_logo.svg',
    'Cagliari': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Cagliari_Calcio_1920.svg',
    'Como': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Como_1907_logo.svg',
    'Cremonese': 'https://upload.wikimedia.org/wikipedia/en/a/a2/US_Cremonese_logo.svg',
    'Fiorentina': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg',
    'Genoa': 'https://upload.wikimedia.org/wikipedia/en/1/1c/Genoa_CFC_crest.svg',
    'Hellas Verona': 'https://upload.wikimedia.org/wikipedia/en/8/87/Hellas_Verona_FC_logo_%282020%29.svg',
    'Inter': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg',
    'Lazio': 'https://upload.wikimedia.org/wikipedia/en/e/e4/S.S._Lazio_badge.svg',
    'Lecce': 'https://upload.wikimedia.org/wikipedia/en/d/d4/U.S._Lecce_crest.svg',
    'Milan': 'https://www.acmilan.com/images/logo.png',
    'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
    'Parma': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg',
    'Pisa': 'https://upload.wikimedia.org/wikipedia/en/0/07/Pisa_SC_crest.svg',
    'Roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
    'Sassuolo': 'https://upload.wikimedia.org/wikipedia/en/1/18/US_Sassuolo_Calcio_logo.svg',
    'Torino': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg',
    'Udinese': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Udinese_Calcio_logo.svg',
    'fallback': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Soccerball_fill.svg/128px-Soccerball_fill.svg.png'
};