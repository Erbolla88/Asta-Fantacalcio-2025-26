import useAuctionStore from '../store/useAuctionStore';

export type Language = 'it' | 'en';
export type TranslationKey = keyof typeof translations.it;

const translations = {
  it: {
    // General
    appTitle: 'Asta Fantacalcio Monticelli 2025/26',
    admin: 'Admin',
    users: 'Utenti',
    loginAs: 'Accedi come {name}',
    logout: 'Esci',
    pause: 'Pausa',
    resume: 'Riprendi',
    loggedInAs: 'Accesso come',
    copied: 'Copiato!',
    copyLink: 'Copia Link',
    loading: 'Caricamento...',
    generating: 'Sto generando...',
    error: 'Errore',
    success: 'Successo',
    chooseAFile: 'Scegli un file',

    // Roles
    roleP: 'Portiere (P)',
    roleD: 'Difensore (D)',
    roleC: 'Centrocampista (C)',
    roleA: 'Attaccante (A)',
    
    // Login Screen
    loginTitle: 'Asta Fantacalcio',
    loginSubtitle: 'Monticelli 2025/26',
    loginAdminInstruction: 'Admin: Accedi per configurare l\'asta e generare i link per i partecipanti.',
    loginUserInstruction: 'Utenti: Per accedere, utilizzate il link diretto fornito dall\'amministratore.',
    
    // Re-Login Page
    reloginTitle: 'Sessione Terminata',
    reloginInstruction: 'Sei stato disconnesso. Puoi rientrare nella tua sessione.',
    reloginButton: 'Rientra come {name}',

    // Lobby
    lobbyWelcome: 'Benvenuto nella Lobby',
    lobbyAdminPreparing: 'L\'amministratore sta preparando l\'asta. Attendi che la lista giocatori sia finalizzata e che l\'asta venga inizializzata.',
    lobbyReadyTitle: 'L\'Asta è Pronta!',
    lobbyReadyInstruction: 'L\'amministratore ha inizializzato l\'asta. Controlla la tua dashboard a destra e clicca su "Sono Pronto!" per confermare la tua partecipazione.',

    // Admin Panel
    adminPanelTitle: 'Pannello di Controllo Admin',
    adminSectionAddUser: '1. Aggiungi Utenti',
    adminAddUserDisabled: 'L\'aggiunta di utenti è bloccata dopo l\'inizializzazione dell\'asta.',
    adminUserName: 'Nome Utente',
    adminAddUserButton: 'Aggiungi',
    adminAddUserSuccess: 'Utente \'{name}\' aggiunto! Copia il suo link qui sotto.',
    adminSectionAccess: '2. Gestione Accessi Utenti',
    adminAccessInstruction: 'Copia e invia il link a ogni utente per l\'accesso diretto.',
    adminSectionPlayers: '3. Carica Giocatori',
    adminUploadCSV: 'Carica CSV',
    adminGenerateGemini: 'Genera con Gemini',
    adminGeminiDisabled: 'Generazione con Gemini disabilitata. API_KEY non fornita.',
    adminCsvFormat: 'Formato CSV: name, role, club, value',
    adminPlayersLoaded: '{count} giocatori caricati con successo.',
    adminSectionAddPlayer: '4. Aggiungi Giocatore Manualmente',
    adminAddPlayerDisabled: 'La modifica della lista giocatori è bloccata dopo l\'inizializzazione dell\'asta.',
    adminPlayerName: 'Nome Giocatore',
    adminBaseValue: 'Valore Base',
    adminAddPlayerButton: 'Aggiungi Giocatore',
    adminAddPlayerSuccess: 'Giocatore \'{name}\' aggiunto con successo!',
    adminSectionCustomLogos: '5. Gestisci Loghi Personalizzati',
    adminCustomLogosDisabled: 'La gestione dei loghi è bloccata dopo l\'inizializzazione dell\'asta.',
    adminCustomLogosInstruction: 'Carica un file PNG per sostituire il logo di un club.',
    adminChoosePng: 'Scegli un PNG',
    adminUploadLogo: 'Carica Logo',
    adminLogoSuccess: 'Logo per \'{club}\' caricato con successo!',
    adminSectionWinnerImage: '6. Immagine Vincitore Asta',
    adminWinnerImageInstruction: 'Carica un\'immagine (PNG/JPG) che apparirà nel popup quando un giocatore viene venduto.',
    adminChooseWinnerImage: 'Scegli Immagine',
    adminUploadWinnerImage: 'Carica e Imposta Immagine',
    adminWinnerImageSuccess: 'Immagine del vincitore aggiornata con successo!',
    adminSectionCredits: '7. Imposta Crediti Iniziali',
    adminInitializeAuction: 'Inizializza Asta',
    adminSectionStart: '8. Avvia Asta',
    adminUsersReady: '{count} / {total} utenti pronti.',
    adminWaiting: 'In attesa...',
    adminStartAuction: 'Avvia Asta',
    adminStartAuctionInstruction: 'Assicurati che tutti i partecipanti siano pronti prima di avviare. L\'amministratore ha il controllo per iniziare in qualsiasi momento.',
    adminSectionTestAuction: 'Modalità Test Asta',
    adminTestAuctionInstruction: 'Avvia un\'asta automatica simulata per testare il flusso. Gli utenti non admin faranno offerte casuali.',
    adminStartTestAuction: 'Avvia Test Asta',
    adminStopTestAuction: 'Ferma Test',
    adminTestAuctionRunning: 'Modalità Test in corso...',
    
    // User Dashboard
    teamName: 'Nome Squadra',
    creditsRemaining: 'Crediti Rimanenti',
    readyButton: 'Sono Pronto!',
    squadFormation: 'Formazione ({count}/25)',
    downloadSquad: 'Scarica Rosa (Excel)',

    // Football Pitch
    goalkeepers: 'Portieri',
    defenders: 'Difensori',
    midfielders: 'Centrocampisti',
    forwards: 'Attaccanti',
    bench: 'Panchina ({count})',

    // Auction Room
    baseValue: 'Valore Base',
    countdown: 'Conto alla Rovescia',
    currentBid: 'Offerta Attuale',
    noBid: 'Nessuna offerta',
    bidButton: 'Offri',
    roleLimit: 'Limite Ruolo',
    insufficientCredits: 'Crediti insufficienti!',
    highestBidder: 'Sei il miglior offerente.',
    roleLimitReached: 'Limite ruolo raggiunto ({count}/{limit} {role})',
    sold: 'AGGIUDICATO!',
    soldToFor: 'a {user} per {amount} CR',
    nextAuctionSoon: 'La prossima asta inizierà a breve...',
    playerUnsold: 'Il giocatore precedente non è stato venduto.',
    auctionReadyTitle: 'L\'asta è Pronta',
    auctionReadyInstruction: 'In attesa che l\'Admin avvii l\'asta.',
    auctionEndedTitle: 'L\'Asta è Terminata!',
    auctionEndedInstruction: 'Grazie per aver partecipato. Ora puoi visualizzare ed esportare la tua rosa finale.',
    auctionPausedTitle: 'ASTA IN PAUSA',
    auctionPausedInstruction: 'L\'amministratore ha messo in pausa l\'asta. Attendere...',

    // Auction Queue
    nextPlayers: 'Prossimi Giocatori in Asta',
    noMorePlayers: 'Nessun altro giocatore in coda.',

    // Post-Auction Panel
    postAuctionTitle: 'Asta Terminata',
    postAuctionInstruction: 'Usa i controlli qui sotto per finalizzare l\'evento o iniziarne uno nuovo.',
    postAuctionDownloadAll: 'Scarica Risultati Finali (Excel)',
    postAuctionPrepareNew: 'Prepara Nuova Asta',
    
    // Error messages
    errorGeneric: 'Si è verificato un errore sconosciuto.',
    errorGenericWithMessage: 'Si è verificato un errore: {message}',
    errorCsvParse: 'Errore di parsing nel CSV alla riga {row}: {message}',
    errorCsvHeaders: 'Intestazioni CSV non valide. Colonne richieste mancanti: {missing}. L\'intestazione deve contenere \'name,role,club,value\'.',
    errorCsvInvalidData: 'Dati non validi nella riga {row} del CSV. Campi obbligatori mancanti o vuoti: {fields}.',
    errorCsvInvalidDataContent: 'Contenuto della riga rilevato: {content}.',
    errorCsvInvalidDataInstruction: 'Assicurati che la riga abbia un valore per \'name\', \'role\', \'club\', e \'value\'.',
    errorCsvInvalidRole: 'Ruolo \'{role}\' non valido nella riga {row} del CSV. Deve essere P, D, C o A.',
    errorCsvInvalidValue: 'Valore \'{value}\' non valido nella riga {row} del CSV. Deve essere un numero.',
    errorFileLoad: 'Errore nel caricamento del file: {message}',
    errorNoPlayersToInit: 'Per favore, carica una lista di giocatori prima di inizializzare.',
    errorAddUserForm: 'Il nome utente non può essere vuoto.',
    errorAddPlayerForm: 'Nome giocatore e valore positivo sono obbligatori.',
    errorLogoForm: 'Seleziona un club e un file PNG.',
    errorWinnerImageForm: 'Seleziona un file immagine (PNG o JPG).',
    errorLogoRead: 'Impossibile leggere il file del logo.',
    errorGeminiApiKey: 'La chiave API di Gemini non è configurata.',
    errorGeminiGenerate: 'Impossibile generare la lista dei giocatori. Controlla la chiave API e riprova.',
    errorNoSquadsToExport: 'Nessuna rosa da esportare. Almeno un utente deve avere dei giocatori in rosa.',
    
    // Gemini Prompt (This will be selected based on language)
    geminiPrompt: 'Genera una lista di 40 giocatori per un\'asta del Fantacalcio Serie A 2025/26. Per ogni giocatore, fornisci il nome, il ruolo (\'P\', \'D\', \'C\', o \'A\'), un club e un valore base d\'asta. Il club deve essere uno dei seguenti: {clubList}. Crea una lista eterogenea con un buon mix di ruoli.',
  },
  en: {
    // General
    appTitle: 'Fantasy Football Auction Monticelli 2025/26',
    admin: 'Admin',
    users: 'Users',
    loginAs: 'Login as {name}',
    logout: 'Logout',
    pause: 'Pause',
    resume: 'Resume',
    loggedInAs: 'Logged in as',
    copied: 'Copied!',
    copyLink: 'Copy Link',
    loading: 'Loading...',
    generating: 'Generating...',
    error: 'Error',
    success: 'Success',
    chooseAFile: 'Choose a file',

    // Roles
    roleP: 'Goalkeeper (P)',
    roleD: 'Defender (D)',
    roleC: 'Midfielder (C)',
    roleA: 'Forward (A)',

    // Login Screen
    loginTitle: 'Fantasy Football Auction',
    loginSubtitle: 'Monticelli 2025/26',
    loginAdminInstruction: 'Admin: Log in to configure the auction and generate access links for participants.',
    loginUserInstruction: 'Users: To log in, please use the direct link provided by the administrator.',

    // Re-Login Page
    reloginTitle: 'Session Ended',
    reloginInstruction: 'You have been logged out. You can re-enter your session.',
    reloginButton: 'Re-enter as {name}',

    // Lobby
    lobbyWelcome: 'Welcome to the Lobby',
    lobbyAdminPreparing: 'The administrator is preparing the auction. Please wait until the player list is finalized and the auction is initialized.',
    lobbyReadyTitle: 'The Auction is Ready!',
    lobbyReadyInstruction: 'The administrator has initialized the auction. Check your dashboard on the right and click "I\'m Ready!" to confirm your participation.',

    // Admin Panel
    adminPanelTitle: 'Admin Control Panel',
    adminSectionAddUser: '1. Add Users',
    adminAddUserDisabled: 'Adding users is locked after auction initialization.',
    adminUserName: 'User Name',
    adminAddUserButton: 'Add',
    adminAddUserSuccess: 'User \'{name}\' added! Copy their link below.',
    adminSectionAccess: '2. User Access Management',
    adminAccessInstruction: 'Copy and send the link to each user for direct access.',
    adminSectionPlayers: '3. Load Players',
    adminUploadCSV: 'Upload CSV',
    adminGenerateGemini: 'Generate with Gemini',
    adminGeminiDisabled: 'Generation with Gemini is disabled. API_KEY not provided.',
    adminCsvFormat: 'CSV format: name, role, club, value',
    adminPlayersLoaded: '{count} players loaded successfully.',
    adminSectionAddPlayer: '4. Add Player Manually',
    adminAddPlayerDisabled: 'Editing the player list is locked after auction initialization.',
    adminPlayerName: 'Player Name',
    adminBaseValue: 'Base Value',
    adminAddPlayerButton: 'Add Player',
    adminAddPlayerSuccess: 'Player \'{name}\' added successfully!',
    adminSectionCustomLogos: '5. Manage Custom Logos',
    adminCustomLogosDisabled: 'Logo management is locked after auction initialization.',
    adminCustomLogosInstruction: 'Upload a PNG file to replace a club\'s logo.',
    adminChoosePng: 'Choose a PNG',
    adminUploadLogo: 'Upload Logo',
    adminLogoSuccess: 'Logo for \'{club}\' uploaded successfully!',
    adminSectionWinnerImage: '6. Auction Winner Image',
    adminWinnerImageInstruction: 'Upload an image (PNG/JPG) that will appear in the popup when a player is sold.',
    adminChooseWinnerImage: 'Choose Image',
    adminUploadWinnerImage: 'Upload and Set Image',
    adminWinnerImageSuccess: 'Winner image updated successfully!',
    adminSectionCredits: '7. Set Initial Credits',
    adminInitializeAuction: 'Initialize Auction',
    adminSectionStart: '8. Start Auction',
    adminUsersReady: '{count} / {total} users ready.',
    adminWaiting: 'Waiting...',
    adminStartAuction: 'Start Auction',
    adminStartAuctionInstruction: 'Please confirm all participants are ready before starting. The admin has control to begin at any time.',
    adminSectionTestAuction: 'Test Auction Mode',
    adminTestAuctionInstruction: 'Run a simulated, automatic auction to test the flow. Non-admin users will place random bids.',
    adminStartTestAuction: 'Start Test Auction',
    adminStopTestAuction: 'Stop Test',
    adminTestAuctionRunning: 'Test Mode Running...',
    
    // User Dashboard
    teamName: 'Team Name',
    creditsRemaining: 'Credits Remaining',
    readyButton: 'I\'m Ready!',
    squadFormation: 'Formation ({count}/25)',
    downloadSquad: 'Download Squad (Excel)',

    // Football Pitch
    goalkeepers: 'Goalkeepers',
    defenders: 'Defenders',
    midfielders: 'Midfielders',
    forwards: 'Forwards',
    bench: 'Bench ({count})',

    // Auction Room
    baseValue: 'Base Value',
    countdown: 'Countdown',
    currentBid: 'Current Bid',
    noBid: 'No bids yet',
    bidButton: 'Bid',
    roleLimit: 'Role Limit',
    insufficientCredits: 'Insufficient credits!',
    highestBidder: 'You are the highest bidder.',
    roleLimitReached: 'Role limit reached ({count}/{limit} {role})',
    sold: 'SOLD!',
    soldToFor: 'to {user} for {amount} CR',
    nextAuctionSoon: 'The next auction will begin shortly...',
    playerUnsold: 'The previous player was not sold.',
    auctionReadyTitle: 'The Auction is Ready',
    auctionReadyInstruction: 'Waiting for the Admin to start the auction.',
    auctionEndedTitle: 'The Auction has Ended!',
    auctionEndedInstruction: 'Thank you for participating. You can now view and export your final squad.',
    auctionPausedTitle: 'AUCTION PAUSED',
    auctionPausedInstruction: 'The administrator has paused the auction. Please wait...',

    // Auction Queue
    nextPlayers: 'Next Players in Auction',
    noMorePlayers: 'No more players in the queue.',

    // Post-Auction Panel
    postAuctionTitle: 'Auction Ended',
    postAuctionInstruction: 'Use the controls below to finalize the event or start a new one.',
    postAuctionDownloadAll: 'Download Final Results (Excel)',
    postAuctionPrepareNew: 'Prepare New Auction',

    // Error messages
    errorGeneric: 'An unknown error occurred.',
    errorGenericWithMessage: 'An error occurred: {message}',
    errorCsvParse: 'CSV parsing error on row {row}: {message}',
    errorCsvHeaders: 'Invalid CSV headers. Missing required columns: {missing}. Header must contain \'name,role,club,value\'.',
    errorCsvInvalidData: 'Invalid data in CSV row {row}. Required fields are missing or empty: {fields}.',
    errorCsvInvalidDataContent: 'Detected row content: {content}.',
    errorCsvInvalidDataInstruction: 'Ensure the row has a value for \'name\', \'role\', \'club\', and \'value\'.',
    errorCsvInvalidRole: 'Invalid role \'{role}\' in CSV row {row}. Must be P, D, C, or A.',
    errorCsvInvalidValue: 'Invalid value \'{value}\' in CSV row {row}. Must be a number.',
    errorFileLoad: 'Error loading file: {message}',
    errorNoPlayersToInit: 'Please load a player list before initializing.',
    errorAddUserForm: 'User name cannot be empty.',
    errorAddPlayerForm: 'Player name and a positive value are required.',
    errorLogoForm: 'Select a club and a PNG file.',
    errorWinnerImageForm: 'Please select an image file (PNG or JPG).',
    errorLogoRead: 'Could not read the logo file.',
    errorGeminiApiKey: 'Gemini API key is not configured.',
    errorGeminiGenerate: 'Could not generate the player list. Check your API key and try again.',
    errorNoSquadsToExport: 'No squads to export. At least one user must have players in their squad.',

    // Gemini Prompt (This will be selected based on language)
    geminiPrompt: 'Generate a list of 40 players for a Serie A 2025/26 fantasy football auction. For each player, provide their name, role (\'P\', \'D\', \'C\', or \'A\'), a club, and a base auction value. The club must be one of the following: {clubList}. Create a diverse list with a good mix of roles.',
  }
};

// Using a hook for components to re-render on language change
export const useTranslation = () => {
    const language = useAuctionStore(state => state.language);
    
    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        let str = translations[language]?.[key] || translations['it'][key];
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
            });
        }
        return str;
    };
    
    return { t, lang: language, setLang: useAuctionStore.getState().actions.setLanguage };
};
