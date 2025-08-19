import React, { useState, useRef } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { User } from '../types';
import { Button } from './common/Button';
import { exportSquadToExcel } from '../services/fileService';
import { FootballPitch } from './FootballPitch';
import { useTranslation } from '../lib/i18n';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const DefaultProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

export const UserDashboard: React.FC<{ user: User }> = ({ user }) => {
    const status = useAuctionStore(state => state.status);
    const actions = useAuctionStore(state => state.actions);
    const { t } = useTranslation();
    
    const [currentTeamName, setCurrentTeamName] = useState(user.teamName);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTeamName(e.target.value);
    };

    const handleTeamNameBlur = () => {
        if (currentTeamName.trim() && currentTeamName !== user.teamName) {
            actions.setTeamName(user.id, currentTeamName.trim());
        }
    };

    const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                actions.setProfilePicture(user.id, dataUrl);
            } catch (error) {
                console.error("Error converting file to data URL:", error);
            }
        }
    };

    const isBeforeAuction = status === 'SETUP' || status === 'READY';
    
    return (
        <aside className="bg-brand-surface p-4 rounded-lg shadow-lg w-full h-full flex flex-col">
            <div className="text-center mb-4 flex flex-col items-center">
                
                <div className="relative group w-24 h-24">
                    <div className="w-full h-full rounded-full bg-slate-700 overflow-hidden border-2 border-brand-primary">
                        {user.profilePicture ? <img src={user.profilePicture} alt={user.teamName} className="w-full h-full object-cover" /> : <DefaultProfileIcon />}
                    </div>
                     {isBeforeAuction && (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleProfilePicChange}
                                accept="image/*"
                                className="hidden" 
                            />
                            <div 
                                className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EditIcon />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-3 w-full">
                     {isBeforeAuction ? (
                        <input
                            type="text"
                            value={currentTeamName}
                            onChange={handleTeamNameChange}
                            onBlur={handleTeamNameBlur}
                            placeholder={t('teamName')}
                            className="text-lg font-bold bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-brand-primary rounded-md px-2 py-1"
                            aria-label={t('teamName')}
                        />
                    ) : (
                        <h3 className="text-lg font-bold">{user.teamName}</h3>
                    )}
                </div>

                <p className="text-sm text-brand-subtle -mt-1">{user.name}</p>

                <div className="mt-2">
                    <p className="text-xs text-brand-subtle">{t('creditsRemaining')}</p>
                    <p className="text-2xl font-bold text-brand-secondary">{user.credits} CR</p>
                </div>
            </div>

            {status === 'READY' && !user.isReady && (
                <div className="my-4">
                    <Button onClick={() => actions.setUserReady(user.id)} variant="primary" className="w-full">
                        {t('readyButton')}
                    </Button>
                </div>
            )}
            
            <div className="flex-grow overflow-y-auto pr-2 min-h-[300px]">
                <h4 className="font-semibold mb-2 text-brand-text text-center">{t('squadFormation', {count: user.squad.length})}</h4>
                <FootballPitch squad={user.squad} />
            </div>

            {status === 'ENDED' && user.squad.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <Button onClick={() => exportSquadToExcel(user.squad, user.name, t)} className="w-full">
                        {t('downloadSquad')}
                    </Button>
                </div>
            )}
        </aside>
    );
};