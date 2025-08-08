import React, { useState, useCallback } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { parsePlayerCsv } from '../services/fileService';
import { generatePlayerList } from '../services/geminiService';
import { Button } from './common/Button';
import { SERIE_A_CLUBS, Player, PlayerRole, User } from '../types';

export const AdminPanel: React.FC = () => {
    const { players, actions, status, users } = useAuctionStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialCredits, setInitialCredits] = useState(500);
    const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
    const [addSuccess, setAddSuccess] = useState<string | null>(null);
    const [logoClub, setLogoClub] = useState<string>(SERIE_A_CLUBS[0]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
    const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

    const allUsers = Array.from(users.values());
    const readyUsersCount = allUsers.filter(u => u.isReady).length;
    const allUsersReady = readyUsersCount === allUsers.length && allUsers.length > 0;

    const handleCopyLink = (userId: string) => {
        const url = `${window.location.origin}?loginAs=${userId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedUserId(userId);
            setTimeout(() => setCopiedUserId(null), 2000);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            setError(null);
            try {
                const parsedPlayers = await parsePlayerCsv(file);
                actions.setPlayers(parsedPlayers);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto durante il parsing.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleGenerateWithGemini = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const generated = await generatePlayerList(SERIE_A_CLUBS);
            actions.setPlayers(generated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto durante la generazione.');
        } finally {
            setIsLoading(false);
        }
    }, [actions]);

    const handleInitialize = () => {
        setError(null);
        if (players.length === 0) {
            setError("Per favore, carica una lista di giocatori prima di inizializzare.");
            return;
        }
        actions.initializeAuction(initialCredits);
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayer.name.trim() || newPlayer.baseValue <= 0) {
            setError("Nome giocatore e valore positivo sono obbligatori.");
            return;
        }
        setError(null);
        actions.addPlayerManually(newPlayer);
        setAddSuccess(`Giocatore '${newPlayer.name}' aggiunto con successo!`);
        setNewPlayer({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
        setTimeout(() => setAddSuccess(null), 3000);
    };

    const handleLogoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logoFile || !logoClub) {
            setError("Seleziona un club e un file PNG.");
            return;
        }
        setError(null);
        setLogoSuccess(null);
        setIsLoading(true);

        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(logoFile);
            });
            actions.setCustomLogo(logoClub, dataUrl);
            setLogoSuccess(`Logo per '${logoClub}' caricato con successo!`);
            setLogoFile(null);
            (e.target as HTMLFormElement).reset(); 
            setTimeout(() => setLogoSuccess(null), 3000);
        } catch (err) {
            setError("Impossibile leggere il file del logo.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg w-full h-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-brand-text">Pannello di Controllo Admin</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-4">{error}</div>}
            {addSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{addSuccess}</div>}
            {logoSuccess && <div className="bg-blue-900 border border-blue-700 text-blue-100 px-4 py-3 rounded-md mb-4">{logoSuccess}</div>}

            <div className="space-y-6">
                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">1. Gestione Accessi Utenti</h3>
                    <p className="text-sm text-brand-subtle mb-3">Copia e invia il link a ogni utente per l'accesso diretto.</p>
                     <div className="space-y-2">
                        {allUsers.filter(u => u.id !== 'admin').map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                                <span className="font-medium">{user.name}</span>
                                <Button onClick={() => handleCopyLink(user.id)} variant="secondary" className="text-xs px-2 py-1">
                                    {copiedUserId === user.id ? 'Copiato!' : 'Copia Link'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">2. Carica Giocatori</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                         <label className="flex-1 w-full sm:w-auto px-4 py-2 text-center rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500 cursor-pointer">
                            Carica CSV
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={isLoading || status !== 'SETUP'} />
                        </label>
                        <Button onClick={handleGenerateWithGemini} disabled={isLoading || !process.env.API_KEY || status !== 'SETUP'} className="flex-1 w-full sm:w-auto" variant="secondary">
                            {isLoading ? 'Sto generando...' : 'Genera con Gemini'}
                        </Button>
                    </div>
                    { !process.env.API_KEY && <p className="text-xs text-brand-subtle mt-2">Generazione con Gemini disabilitata. API_KEY non fornita.</p>}
                    <p className="text-sm text-brand-subtle mt-2">Formato CSV: name, role, club, value</p>
                    {players.length > 0 && (
                        <p className="text-green-400 mt-2 font-semibold">{players.length} giocatori caricati con successo.</p>
                    )}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">3. Aggiungi Giocatore Manualmente</h3>
                     {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">La modifica della lista giocatori è bloccata dopo l'inizializzazione dell'asta.</p>
                    ) : (
                        <form onSubmit={handleAddPlayer} className="space-y-3">
                            <input type="text" placeholder="Nome Giocatore" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full" required />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <select value={newPlayer.club} onChange={e => setNewPlayer({...newPlayer, club: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    {SERIE_A_CLUBS.map(club => <option key={club} value={club}>{club}</option>)}
                                </select>
                                <select value={newPlayer.role} onChange={e => setNewPlayer({...newPlayer, role: e.target.value as PlayerRole})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    <option value="P">Portiere (P)</option>
                                    <option value="D">Difensore (D)</option>
                                    <option value="C">Centrocampista (C)</option>
                                    <option value="A">Attaccante (A)</option>
                                </select>
                                <input type="number" placeholder="Valore Base" value={newPlayer.baseValue} onChange={e => setNewPlayer({...newPlayer, baseValue: Number(e.target.value)})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full" min="1" required />
                            </div>
                            <Button type="submit" className="w-full" variant="secondary">Aggiungi Giocatore</Button>
                        </form>
                    )}
                </div>
                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">4. Gestisci Loghi Personalizzati</h3>
                     {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">La gestione dei loghi è bloccata dopo l'inizializzazione dell'asta.</p>
                    ) : (
                        <form onSubmit={handleLogoUpload} className="space-y-3">
                            <p className="text-sm text-brand-subtle">Carica un file PNG per sostituire il logo di un club.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select value={logoClub} onChange={e => setLogoClub(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    {SERIE_A_CLUBS.map(club => <option key={club} value={club}>{club}</option>)}
                                </select>
                                <label className="w-full px-4 py-2 text-center rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500 cursor-pointer">
                                    {logoFile ? logoFile.name : 'Scegli un PNG'}
                                    <input type="file" accept="image/png" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            </div>
                            <Button type="submit" disabled={!logoFile || !logoClub || isLoading} className="w-full">
                                {isLoading ? 'Caricamento...' : 'Carica Logo'}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">5. Imposta Crediti Iniziali</h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={initialCredits}
                            onChange={(e) => setInitialCredits(Number(e.target.value))}
                            className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                             disabled={status !== 'SETUP'}
                        />
                         <Button onClick={handleInitialize} disabled={isLoading || players.length === 0 || status !== 'SETUP'}>
                            Inizializza Asta
                        </Button>
                    </div>
                </div>

                {status === 'READY' && (
                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-900">
                        <h3 className="font-semibold text-lg mb-3">6. Avvia Asta</h3>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-brand-subtle">{readyUsersCount} / {allUsers.length} utenti pronti.</p>
                            <Button onClick={() => actions.startAuction()} disabled={!allUsersReady} variant="primary">
                                {allUsersReady ? 'Avvia Asta' : 'In attesa...'}
                            </Button>
                        </div>
                         {!allUsersReady && <p className="text-xs text-brand-subtle mt-2">Il pulsante si attiverà quando tutti gli utenti (incluso l'admin che è già pronto) confermeranno.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};