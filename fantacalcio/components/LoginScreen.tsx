import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { User } from '../types';
import { useTranslation } from '../lib/i18n';

const DefaultProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const UserCard: React.FC<{ user: User, onSelect: (userId: string, isGuest: boolean) => void }> = ({ user, onSelect }) => {
    const { t } = useTranslation();
    return (
        <div
            onClick={() => onSelect(user.id, false)} // Admin login is never a guest session
            className="bg-brand-surface p-4 rounded-xl shadow-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-slate-700"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(user.id, false)}
            aria-label={t('loginAs', { name: user.name })}
        >
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 overflow-hidden border-2 border-brand-primary mb-3">
                {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.teamName} className="w-full h-full object-cover" />
                ) : (
                    <DefaultProfileIcon />
                )}
            </div>
            <h3 className="font-bold text-brand-text truncate" title={user.teamName}>{user.teamName}</h3>
            <p className="text-sm text-brand-subtle">{user.name}</p>
        </div>
    );
};

export const LoginScreen: React.FC = () => {
    const users = useAuctionStore(state => state.users);
    const login = useAuctionStore(state => state.actions.login);
    const { t } = useTranslation();
    const adminUser = users.get('admin');

    if (!adminUser) return null; // Should not happen in normal flow

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-slate-900 p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-brand-text mb-2 tracking-tight">{t('loginTitle')}</h1>
                    <h2 className="text-2xl font-semibold text-brand-primary mb-4">{t('loginSubtitle')}</h2>
                    <p className="text-brand-subtle max-w-2xl mx-auto">
                        {t('loginAdminInstruction')}
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="w-48">
                        <UserCard user={adminUser} onSelect={login} />
                    </div>
                </div>
            </div>
        </div>
    );
};
