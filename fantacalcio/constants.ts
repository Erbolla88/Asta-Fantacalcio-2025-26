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
    'Atalanta': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Atalanta_BC_logo.svg/120px-Atalanta_BC_logo.svg.png',
    'Bologna': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Bologna_F.C._1909_logo.svg/120px-Bologna_F.C._1909_logo.svg.png',
    'Cagliari': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Cagliari_Calcio_logo.svg/120px-Cagliari_Calcio_logo.svg.png',
    'Como': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Como_1907_logo.svg/120px-Como_1907_logo.svg.png',
    'Cremonese': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/US_Cremonese_logo.svg/120px-US_Cremonese_logo.svg.png',
    'Fiorentina': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/ACF_Fiorentina_2_logo.svg/120px-ACF_Fiorentina_2_logo.svg.png',
    'Genoa': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Genoa_C.F.C._logo.svg/120px-Genoa_C.F.C._logo.svg.png',
    'Hellas Verona': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Hellas_Verona_FC_logo_%282020%29.svg/120px-Hellas_Verona_FC_logo_%282020%29.svg.png',
    'Inter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/120px-FC_Internazionale_Milano_2021.svg.png',
    'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon.svg/120px-Juventus_FC_2017_icon.svg.png',
    'Lazio': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/S.S._Lazio_logo.svg/120px-S.S._Lazio_logo.svg.png',
    'Lecce': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/U.S._Lecce_logo.svg/120px-U.S._Lecce_logo.svg.png',
    'Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/120px-Logo_of_AC_Milan.svg.png',
    'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/S.S.C._Napoli_logo_2022.svg/120px-S.S.C._Napoli_logo_2022.svg.png',
    'Parma': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Parma_Calcio_1913_logo.svg/120px-Parma_Calcio_1913_logo.svg.png',
    'Pisa': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Pisa_SC_crest.svg/120px-Pisa_SC_crest.svg.png',
    'Roma': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/120px-AS_Roma_logo_%282017%29.svg.png',
    'Sassuolo': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/US_Sassuolo_Calcio_logo.svg/120px-US_Sassuolo_Calcio_logo.svg.png',
    'Torino': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Torino_FC_Logo.svg/120px-Torino_FC_Logo.svg.png',
    'Udinese': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Udinese_Calcio_logo.svg/120px-Udinese_Calcio_logo.svg.png',
    'fallback': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Soccerball_fill.svg/120px-Soccerball_fill.svg.png'
};
