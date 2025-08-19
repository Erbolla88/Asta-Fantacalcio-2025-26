import React, { useState, useCallback } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { parsePlayerCsv } from '../services/fileService';
import { generatePlayerList } from '../services/geminiService';
import { Button } from './common/Button';
import { SERIE_A_CLUBS, Player, PlayerRole, User } from '../types';
import { useTranslation } from '../lib/i18n';

// This is a fallback image used in the preview and in the auction room if no custom image is set.
const FALLBACK_WINNER_IMAGE_DATA_URL = 'data:image/jpeg;base64,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';

export const AdminPanel: React.FC = () => {
    const players = useAuctionStore(state => state.players);
    const actions = useAuctionStore(state => state.actions);
    const status = useAuctionStore(state => state.status);
    const users = useAuctionStore(state => state.users);
    const isTestMode = useAuctionStore(state => state.isTestMode);
    const winnerImageDataUrl = useAuctionStore(state => state.winnerImageDataUrl);

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialCredits, setInitialCredits] = useState(500);
    const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
    const [newUserName, setNewUserName] = useState('');
    const [userAddedSuccess, setUserAddedSuccess] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState<string | null>(null);
    const [logoClub, setLogoClub] = useState<string>(SERIE_A_CLUBS[0]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
    const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
    const [winnerImageFile, setWinnerImageFile] = useState<File | null>(null);
    const [winnerImagePreview, setWinnerImagePreview] = useState<string | null>(null);
    const [winnerImageSuccess, setWinnerImageSuccess] = useState<string | null>(null);

    const allUsers: User[] = Array.from(users.values());
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
                const parsedPlayers = await parsePlayerCsv(file, t);
                actions.setPlayers(parsedPlayers);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('errorGeneric'));
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleGenerateWithGemini = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const generated = await generatePlayerList(SERIE_A_CLUBS, t);
            actions.setPlayers(generated);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    }, [actions, t]);

    const handleInitialize = () => {
        setError(null);
        if (players.length === 0) {
            setError(t('errorNoPlayersToInit'));
            return;
        }
        actions.initializeAuction(initialCredits);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim()) {
            setError(t('errorAddUserForm'));
            return;
        }
        setError(null);
        actions.addUser(newUserName);
        setUserAddedSuccess(t('adminAddUserSuccess', { name: newUserName }));
        setNewUserName('');
        setTimeout(() => setUserAddedSuccess(null), 3000);
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayer.name.trim() || newPlayer.baseValue <= 0) {
            setError(t('errorAddPlayerForm'));
            return;
        }
        setError(null);
        actions.addPlayerManually(newPlayer);
        setAddSuccess(t('adminAddPlayerSuccess', {name: newPlayer.name}));
        setNewPlayer({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
        setTimeout(() => setAddSuccess(null), 3000);
    };

    const handleLogoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logoFile || !logoClub) {
            setError(t('errorLogoForm'));
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
            setLogoSuccess(t('adminLogoSuccess', {club: logoClub}));
            setLogoFile(null);
            (e.target as HTMLFormElement).reset(); 
            setTimeout(() => setLogoSuccess(null), 3000);
        } catch (err) {
            setError(t('errorLogoRead'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleWinnerImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setWinnerImageFile(file);
            setWinnerImagePreview(URL.createObjectURL(file));
        }
    };

    const handleWinnerImageUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!winnerImageFile) {
            setError(t('errorWinnerImageForm'));
            return;
        }
        setError(null);
        setWinnerImageSuccess(null);
        setIsLoading(true);

        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(winnerImageFile);
            });
            actions.setWinnerImageDataUrl(dataUrl);
            setWinnerImageSuccess(t('adminWinnerImageSuccess'));
            setWinnerImageFile(null);
            setWinnerImagePreview(null);
            (e.target as HTMLFormElement).reset();
            setTimeout(() => setWinnerImageSuccess(null), 3000);
        } catch (err) {
            setError(t('errorLogoRead'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg w-full h-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-brand-text">{t('adminPanelTitle')}</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-4">{error}</div>}
            {userAddedSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{userAddedSuccess}</div>}
            {addSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{addSuccess}</div>}
            {logoSuccess && <div className="bg-blue-900 border border-blue-700 text-blue-100 px-4 py-3 rounded-md mb-4">{logoSuccess}</div>}
            {winnerImageSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{winnerImageSuccess}</div>}

            <div className="space-y-6">
                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionAddUser')}</h3>
                    {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">{t('adminAddUserDisabled')}</p>
                    ) : (
                        <form onSubmit={handleAddUser} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                placeholder={t('adminUserName')} 
                                value={newUserName} 
                                onChange={e => setNewUserName(e.target.value)} 
                                className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full" 
                                required 
                            />
                            <Button type="submit" variant="secondary">{t('adminAddUserButton')}</Button>
                        </form>
                    )}
                </div>

                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionAccess')}</h3>
                    <p className="text-sm text-brand-subtle mb-3">{t('adminAccessInstruction')}</p>
                     <div className="space-y-2">
                        {allUsers.filter(u => u.id !== 'admin').map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                                <span className="font-medium">{user.name}</span>
                                <Button onClick={() => handleCopyLink(user.id)} variant="secondary" size="sm">
                                    {copiedUserId === user.id ? t('copied') : t('copyLink')}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionPlayers')}</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                         <label className="flex-1 w-full sm:w-auto px-4 py-2 text-center rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500 cursor-pointer">
                            {t('adminUploadCSV')}
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" disabled={isLoading || status !== 'SETUP'} />
                        </label>
                        <Button onClick={handleGenerateWithGemini} disabled={isLoading || !process.env.API_KEY || status !== 'SETUP'} className="flex-1 w-full sm:w-auto" variant="secondary">
                            {isLoading ? t('generating') : t('adminGenerateGemini')}
                        </Button>
                    </div>
                    { !process.env.API_KEY && <p className="text-xs text-brand-subtle mt-2">{t('adminGeminiDisabled')}</p>}
                    <p className="text-sm text-brand-subtle mt-2">{t('adminCsvFormat')}</p>
                    {players.length > 0 && (
                        <p className="text-green-400 mt-2 font-semibold">{t('adminPlayersLoaded', {count: players.length})}</p>
                    )}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionAddPlayer')}</h3>
                     {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">{t('adminAddPlayerDisabled')}</p>
                    ) : (
                        <form onSubmit={handleAddPlayer} className="space-y-3">
                            <input type="text" placeholder={t('adminPlayerName')} value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full" required />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <select value={newPlayer.club} onChange={e => setNewPlayer({...newPlayer, club: e.target.value})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    {SERIE_A_CLUBS.map(club => <option key={club} value={club}>{club}</option>)}
                                </select>
                                <select value={newPlayer.role} onChange={e => setNewPlayer({...newPlayer, role: e.target.value as PlayerRole})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    <option value="P">{t('roleP')}</option>
                                    <option value="D">{t('roleD')}</option>
                                    <option value="C">{t('roleC')}</option>
                                    <option value="A">{t('roleA')}</option>
                                </select>
                                <input type="number" placeholder={t('adminBaseValue')} value={newPlayer.baseValue} onChange={e => setNewPlayer({...newPlayer, baseValue: Number(e.target.value)})} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full" min="1" required />
                            </div>
                            <Button type="submit" className="w-full" variant="secondary">{t('adminAddPlayerButton')}</Button>
                        </form>
                    )}
                </div>
                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionCustomLogos')}</h3>
                     {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">{t('adminCustomLogosDisabled')}</p>
                    ) : (
                        <form onSubmit={handleLogoUpload} className="space-y-3">
                            <p className="text-sm text-brand-subtle">{t('adminCustomLogosInstruction')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select value={logoClub} onChange={e => setLogoClub(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full">
                                    {SERIE_A_CLUBS.map(club => <option key={club} value={club}>{club}</option>)}
                                </select>
                                <label className="w-full px-4 py-2 text-center rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500 cursor-pointer">
                                    {logoFile ? logoFile.name : t('adminChoosePng')}
                                    <input type="file" accept="image/png" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            </div>
                            <Button type="submit" disabled={!logoFile || !logoClub || isLoading} className="w-full">
                                {isLoading ? t('loading') : t('adminUploadLogo')}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionWinnerImage')}</h3>
                     {status !== 'SETUP' ? (
                        <p className="text-brand-subtle text-sm">{t('adminCustomLogosDisabled')}</p>
                    ) : (
                        <form onSubmit={handleWinnerImageUpload} className="space-y-3">
                            <p className="text-sm text-brand-subtle">{t('adminWinnerImageInstruction')}</p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-brand-primary overflow-hidden shadow-lg flex-shrink-0">
                                    <img
                                        src={winnerImagePreview || winnerImageDataUrl || FALLBACK_WINNER_IMAGE_DATA_URL}
                                        alt="Winner Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow w-full">
                                    <label className="w-full block px-4 py-2 text-center rounded-md font-semibold bg-slate-600 text-white hover:bg-slate-500 cursor-pointer">
                                        {winnerImageFile ? winnerImageFile.name : t('adminChooseWinnerImage')}
                                        <input type="file" accept="image/png, image/jpeg" onChange={handleWinnerImageFileChange} className="hidden" />
                                    </label>
                                    <Button type="submit" disabled={!winnerImageFile || isLoading} className="w-full mt-2">
                                        {isLoading ? t('loading') : t('adminUploadWinnerImage')}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionCredits')}</h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={initialCredits}
                            onChange={(e) => setInitialCredits(Number(e.target.value))}
                            className="bg-slate-700 border border-slate-600 rounded-md p-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                             disabled={status !== 'SETUP'}
                        />
                         <Button onClick={handleInitialize} disabled={isLoading || players.length === 0 || status !== 'SETUP'}>
                            {t('adminInitializeAuction')}
                        </Button>
                    </div>
                </div>

                 <div className="p-4 border border-amber-600 rounded-lg bg-amber-900 bg-opacity-20">
                    <h3 className="font-semibold text-lg mb-2 text-amber-400">{t('adminSectionTestAuction')}</h3>
                    <p className="text-sm text-brand-subtle mb-3">{t('adminTestAuctionInstruction')}</p>
                    <Button 
                        onClick={() => actions.startTestAuction()} 
                        disabled={players.length === 0 || status !== 'SETUP' || isTestMode}
                        variant="secondary"
                        className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 w-full"
                    >
                        {t('adminStartTestAuction')}
                    </Button>
                </div>
                
                {status === 'READY' && (
                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-900">
                        <h3 className="font-semibold text-lg mb-3">{t('adminSectionStart')}</h3>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-brand-subtle">{t('adminUsersReady', {count: readyUsersCount, total: allUsers.length})}</p>
                            <Button onClick={() => actions.startAuction()} disabled={!allUsersReady} variant="primary">
                                {allUsersReady ? t('adminStartAuction') : t('adminWaiting')}
                            </Button>
                        </div>
                        {!allUsersReady && <p className="text-xs text-brand-subtle mt-2">{t('adminStartAuctionInstruction')}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
