import React, { useState, useCallback } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { parsePlayerCsv } from '../services/fileService';
import { generatePlayerList } from '../services/geminiService';
import { Button } from './common/Button';
import { SERIE_A_CLUBS, Player, PlayerRole, User } from '../types';
import { useTranslation } from '../lib/i18n';
import { FALLBACK_WINNER_IMAGE_DATA_URL } from '../lib/constants';

export const AdminPanel: React.FC<{currentUser: User}> = ({currentUser}) => {
    const auction = useAuctionStore(state => state.auction);
    const actions = useAuctionStore(state => state.actions);

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialCredits, setInitialCredits] = useState(500);
    const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
    const [addSuccess, setAddSuccess] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [logoClub, setLogoClub] = useState<string>(SERIE_A_CLUBS[0]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
    const [winnerImageFile, setWinnerImageFile] = useState<File | null>(null);
    const [winnerImagePreview, setWinnerImagePreview] = useState<string | null>(null);
    const [winnerImageSuccess, setWinnerImageSuccess] = useState<string | null>(null);
    
    if (!auction) return null; 
    const { status, players, users, config } = auction;

    const userUIDs = users ? Object.keys(users) : [];
    const readyUsersCount = users ? Object.values(users).filter(u => u && u.isReady).length : 0;
    const allUsersReady = userUIDs.length > 0 && readyUsersCount === userUIDs.length;
    const winnerImageDataUrl = config.winnerImageDataUrl;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            setError(null);
            try {
                const parsedPlayers = await parsePlayerCsv(file, t);
                await actions.setPlayers(parsedPlayers);
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
            await actions.setPlayers(generated);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    }, [actions, t]);

    const handleInitialize = () => {
        setError(null);
        if (!players || players.length === 0) {
            setError(t('errorNoPlayersToInit'));
            return;
        }
        actions.initializeAuction(initialCredits).catch(err => {
            setError(err instanceof Error ? err.message : t('errorGeneric'));
        });
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayer.name.trim() || newPlayer.baseValue <= 0) {
            setError(t('errorAddPlayerForm'));
            return;
        }
        setError(null);
        actions.addPlayerManually(newPlayer).then(() => {
            setAddSuccess(t('adminAddPlayerSuccess', {name: newPlayer.name}));
            setNewPlayer({ name: '', club: SERIE_A_CLUBS[0], role: 'P', baseValue: 1 });
            setTimeout(() => setAddSuccess(null), 3000);
        }).catch(err => {
            setError(err instanceof Error ? err.message : t('errorGeneric'));
        });
    };
    
    const handleDeleteUser = (uid: string, name: string) => {
        if (window.confirm(t('adminDeleteUserConfirm', { name }))) {
            actions.deleteUserProfile(uid)
                .then(() => {
                    setDeleteSuccess(t('adminUserDeletedSuccess', { name }));
                    setTimeout(() => setDeleteSuccess(null), 3000);
                })
                .catch(err => {
                    setError(err instanceof Error ? err.message : t('errorGeneric'));
                });
        }
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
            await actions.setCustomLogo(logoClub, dataUrl);
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
            await actions.setWinnerImageDataUrl(dataUrl);
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
            {addSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{addSuccess}</div>}
            {deleteSuccess && <div className="bg-blue-900 border border-blue-700 text-blue-100 px-4 py-3 rounded-md mb-4">{deleteSuccess}</div>}
            {logoSuccess && <div className="bg-blue-900 border border-blue-700 text-blue-100 px-4 py-3 rounded-md mb-4">{logoSuccess}</div>}
            {winnerImageSuccess && <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-md mb-4">{winnerImageSuccess}</div>}

            <div className="space-y-6">
                 <div className="p-4 border border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{t('adminSectionAccess')}</h3>
                    <p className="text-sm text-brand-subtle mb-3">{t('adminAccessInstructionRegistered')}</p>
                     <div className="space-y-2">
                        {userUIDs.length > 0 ? userUIDs.map(uid => {
                            const user = users[uid];
                            // Robustness check: only render if user object is valid
                            if (!user || !user.uid) return null;

                            return (
                                <div key={user.uid} className="flex items-center justify-between bg-slate-800 p-2 rounded-md">
                                    <div>
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-sm text-brand-subtle"> ({user.teamName})</span>
                                    </div>
                                    {user.uid === currentUser.uid ? (
                                        <span className="text-xs font-bold text-yellow-400 px-2 py-1 bg-yellow-900 bg-opacity-50 rounded-full">{t('admin')}</span>
                                    ) : (
                                        <Button onClick={() => handleDeleteUser(user.uid, user.name)} variant="danger" size="sm" className="px-2 py-1 text-xs">
                                            {t('adminDeleteUser')}
                                        </Button>
                                    )}
                                </div>
                            )
                        }) : <p className="text-sm text-brand-subtle">{t('adminNoUsersRegistered')}</p>}
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
                    {players && players.length > 0 && (
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
                         <Button onClick={handleInitialize} disabled={isLoading || !players || players.length === 0 || status !== 'SETUP'}>
                            {t('adminInitializeAuction')}
                        </Button>
                    </div>
                </div>

                 <div className="p-4 border border-amber-600 rounded-lg bg-amber-900 bg-opacity-20">
                    <h3 className="font-semibold text-lg mb-2 text-amber-400">{t('adminSectionTestAuction')}</h3>
                    <p className="text-sm text-brand-subtle mb-3">{t('adminTestAuctionInstruction')}</p>
                    <Button 
                        onClick={() => actions.startTestAuction().catch(e => setError(e instanceof Error ? e.message : t('errorGeneric')))} 
                        disabled={!players || players.length === 0 || status !== 'SETUP' || config.isTestMode}
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
                            <p className="text-brand-subtle">{t('adminUsersReady', {count: readyUsersCount, total: userUIDs.length})}</p>
                            <Button onClick={() => actions.startAuction().catch(e => setError(e instanceof Error ? e.message : t('errorGeneric')))} disabled={!allUsersReady} variant="primary">
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