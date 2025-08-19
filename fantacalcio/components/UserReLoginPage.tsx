import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { useTranslation } from '../lib/i18n';
import { Button } from './common/Button';

// A trophy icon to add some flair
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1.586l-1.293-1.293a1 1 0 00-1.414 1.414L7.586 6H6a1 1 0 000 2h1.586l-1.293 1.293a1 1 0 101.414 1.414L9 8.414V10a1 1 0 102 0V8.414l1.293 1.293a1 1 0 001.414-1.414L12.414 6H14a1 1 0 100-2h-1.586l1.293-1.293a1 1 0 10-1.414-1.414L11 4.586V3z"/>
        <path d="M6 10a1 1 0 01-1 1H4a1 1 0 110-2h1a1 1 0 011 1zM14 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z"/>
        <path d="M3 15a2 2 0 002 2h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3z"/>
    </svg>
);


export const UserReLoginPage: React.FC = () => {
    const guestSessionId = useAuctionStore(state => state.guestSessionId);
    const users = useAuctionStore(state => state.users);
    const actions = useAuctionStore(state => state.actions);
    const { t } = useTranslation();
    
    const user = guestSessionId ? users.get(guestSessionId) : null;

    const handleReLogin = () => {
        if (user) {
            // Re-login is always a guest session, pass name for robustness
            actions.login(user.id, true, user.name);
        }
    };

    if (!user) {
        // Fallback in case state is weird, go to main login
        return null; // Or render a generic error and a link to the main page
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-slate-900 p-4">
            <div className="bg-brand-surface rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
                <TrophyIcon />
                <h1 className="text-3xl font-bold text-brand-text mt-4">{t('reloginTitle')}</h1>
                <p className="text-brand-subtle mt-2 mb-6">{t('reloginInstruction')}</p>
                <Button onClick={handleReLogin} variant="primary" size="lg" className="w-full">
                    {t('reloginButton', { name: user.name })}
                </Button>
            </div>
        </div>
    );
};