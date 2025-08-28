import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import useAuctionStore from '../store/useAuctionStore';
import { Button } from './common/Button';
import { useTranslation } from '../lib/i18n';

interface AuthScreenProps {
    isCompletingProfile?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isCompletingProfile = false }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { createUserProfile } = useAuctionStore(state => state.actions);
    const { t } = useTranslation();

    const handleAuthError = (err: any) => {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return t('authErrorInvalidCredentials');
            case 'auth/email-already-in-use':
                return t('authErrorEmailInUse');
            case 'auth/weak-password':
                return t('authErrorWeakPassword');
            default:
                return err.message;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isCompletingProfile) {
                if (!displayName.trim() || !teamName.trim()) {
                    throw new Error(t('authErrorMissingNames'));
                }
                if (auth.currentUser) {
                    // Use email from auth object since email field is not shown
                    await createUserProfile(auth.currentUser.uid, displayName, teamName, auth.currentUser.email || '');
                } else {
                    // This should not happen if App.tsx logic is correct
                    throw new Error("Authentication error. Please try logging in again.");
                }
            } else if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else { // Registering
                if (!displayName.trim() || !teamName.trim()) {
                    throw new Error(t('authErrorMissingNames'));
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                if (user) {
                    await createUserProfile(user.uid, displayName, teamName, user.email || email);
                }
            }
        } catch (err: any) {
            // Check if it's a firebase auth error
            if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
                 setError(handleAuthError(err));
            } else {
                // Otherwise, it's likely a custom error from our checks
                 setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleForm = (login: boolean) => {
        setIsLogin(login);
        setError(null);
        setEmail('');
        setPassword('');
        setDisplayName('');
        setTeamName('');
    }

    if (isCompletingProfile) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-slate-900 p-4">
                <div className="w-full max-w-md mx-auto bg-brand-surface p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-text mb-2 tracking-tight">{t('authCompleteProfileTitle')}</h1>
                        <p className="text-brand-subtle mt-2">{t('authCompleteProfileSubtitle')}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <input type="text" placeholder={t('authDisplayName')} value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />
                         <input type="text" placeholder={t('authTeamName')} value={teamName} onChange={e => setTeamName(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <Button type="submit" disabled={isLoading} className="w-full !mt-6" size="lg">
                            {isLoading ? t('loading') : t('authCompleteProfileButton')}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-slate-900 p-4">
            <div className="w-full max-w-md mx-auto bg-brand-surface p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-text mb-2 tracking-tight">{t('appTitle')}</h1>
                </div>
                
                <div className="flex mb-6 border-b border-slate-700">
                    <button onClick={() => toggleForm(true)} className={`flex-1 py-3 font-semibold transition-colors ${isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-subtle hover:text-brand-text'}`}>{t('authLogin')}</button>
                    <button onClick={() => toggleForm(false)} className={`flex-1 py-3 font-semibold transition-colors ${!isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-subtle hover:text-brand-text'}`}>{t('authRegister')}</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                             <input type="text" placeholder={t('authDisplayName')} value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />
                             <input type="text" placeholder={t('authTeamName')} value={teamName} onChange={e => setTeamName(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />
                        </>
                    )}
                    <input type="email" placeholder={t('authEmail')} value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />
                    <input type="password" placeholder={t('authPassword')} value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md p-3 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" required />
                    
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    
                    <Button type="submit" disabled={isLoading} className="w-full !mt-6" size="lg">
                        {isLoading ? t('loading') : (isLogin ? t('authLogin') : t('authRegister'))}
                    </Button>
                </form>
            </div>
        </div>
    );
};