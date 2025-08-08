import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { User } from '../types';

// Helper component for the default profile icon
const DefaultProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

// Card component for each user
const UserCard: React.FC<{ user: User, onSelect: (userId: string) => void }> = ({ user, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(user.id)}
            className="bg-brand-surface p-4 rounded-xl shadow-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-slate-700"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(user.id)}
            aria-label={`Accedi come ${user.name}`}
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
    const { users, actions } = useAuctionStore();
    const availableUsers = Array.from(users.values());

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-slate-900 p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-text mb-2 tracking-tight">Asta Fantacalcio</h1>
                    <h2 className="text-2xl font-semibold text-brand-primary mb-4">Monticelli 2025/26</h2>
                    <p className="text-brand-subtle max-w-2xl mx-auto">
                        <span className="font-semibold text-brand-text">Admin:</span> Clicca sulla tua card o su quella di un altro utente per entrare. <br/>
                        <span className="font-semibold text-brand-text">Utenti:</span> Per accedere, utilizzate il link diretto fornito dall'amministratore.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {availableUsers.map((user) => (
                        <UserCard key={user.id} user={user} onSelect={actions.login} />
                    ))}
                </div>
            </div>
        </div>
    );
};
