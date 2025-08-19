import React, { useEffect } from 'react';
import useAuctionStore from './store/useAuctionStore';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { AuctionRoom } from './components/AuctionRoom';
import { UserDashboard } from './components/UserDashboard';
import { Button } from './components/common/Button';
import { AuctionQueue } from './components/AuctionQueue';
import { AdminPostAuctionPanel } from './components/AdminPostAuctionPanel';
import { useTranslation } from './lib/i18n';
import { LanguageSelector } from './components/common/LanguageSelector';
import { UserReLoginPage } from './components/UserReLoginPage';
import { useSharedStateSync } from './hooks/useSharedStateSync';

const MainLayout: React.FC = () => {
    const loggedInUserId = useAuctionStore(state => state.loggedInUserId);
    const users = useAuctionStore(state => state.users);
    const status = useAuctionStore(state => state.status);
    const actions = useAuctionStore(state => state.actions);
    const isTestMode = useAuctionStore(state => state.isTestMode);
    
    const { t } = useTranslation();
    const currentUser = users.get(loggedInUserId!);

    if (!currentUser) return null;

    const isAdmin = currentUser.id === 'admin';
    const isAuctionRunning = status === 'BIDDING' || status === 'PAUSED' || status === 'SOLD';
    
    return (
        <div className="min-h-screen bg-brand-background text-brand-text">
            <header className="bg-brand-surface p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">{t('appTitle')}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {isTestMode && isAdmin && (
                        <>
                            <span className="hidden sm:inline text-amber-400 font-semibold animate-pulse">{t('adminTestAuctionRunning')}</span>
                            <Button onClick={() => actions.stopTestAuction()} variant="danger" size="sm">
                                {t('adminStopTestAuction')}
                            </Button>
                        </>
                    )}
                    {isAdmin && (status === 'BIDDING' || status === 'PAUSED') && !isTestMode && (
                         <Button onClick={() => status === 'BIDDING' ? actions.pauseAuction() : actions.resumeAuction()} variant="secondary">
                            {status === 'BIDDING' ? t('pause') : t('resume')}
                         </Button>
                    )}
                    <span className="hidden sm:inline text-brand-subtle">{t('loggedInAs')} <span className="font-bold text-brand-text">{currentUser.name}</span></span>
                    <LanguageSelector />
                    <Button onClick={() => actions.logout()} variant='danger' size="sm">{t('logout')}</Button>
                </div>
            </header>
            
            <main className="p-4 md:p-8">
                {status === 'SETUP' || status === 'READY' ? (
                    isAdmin ? (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3"><AdminPanel /></div>
                            <div className="lg:col-span-2"><UserDashboard user={currentUser} /></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-brand-surface p-8 rounded-lg text-center flex flex-col justify-center h-full">
                                    {status === 'SETUP' && (
                                        <>
                                            <h2 className="text-3xl font-bold">{t('lobbyWelcome')}</h2>
                                            <p className="text-brand-subtle mt-4">{t('lobbyAdminPreparing')}</p>
                                        </>
                                    )}
                                    {status === 'READY' && (
                                         <div className="flex flex-col items-center justify-center">
                                            <h2 className="text-3xl font-bold">{t('lobbyReadyTitle')}</h2>
                                            <p className="text-brand-subtle mt-4">{t('lobbyReadyInstruction')}</p>
                                             <div className="mt-8 max-w-lg mx-auto w-full">
                                                <div className="space-y-3 bg-slate-900 p-4 rounded-lg">
                                                    {Array.from(users.values()).map(u => (
                                                        <div key={u.id} className="flex items-center justify-between bg-brand-surface p-3 rounded-md shadow">
                                                            <span className="font-medium text-brand-text">{u.name}</span>
                                                            {u.isReady ? (
                                                                <span className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Pronto
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2 text-yellow-400 font-semibold text-sm animate-pulse">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5a1 1 0 112 0v5.5a.5.5 0 01-1 0V5zM10 16a1 1 0 100-2 1 1 0 000 2z" />
                                                                    </svg>
                                                                    In attesa
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <UserDashboard user={currentUser} />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           {status === 'ENDED' && isAdmin ? <AdminPostAuctionPanel /> : <AuctionRoom />}
                           {isAuctionRunning && <AuctionQueue />}
                        </div>
                        <div className="lg:col-span-1">
                           <UserDashboard user={currentUser} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

function App() {
  useSharedStateSync(); // This hook manages real-time state synchronization
  const loggedInUserId = useAuctionStore(state => state.loggedInUserId);
  const guestSessionId = useAuctionStore(state => state.guestSessionId);
  const actions = useAuctionStore(state => state.actions);
  const { lang } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdToLogin = urlParams.get('loginAs');
    const userName = urlParams.get('name');
    
    if (userIdToLogin) {
      // The login action now only needs identity. The state will arrive via the sync hook.
      actions.login(userIdToLogin, true, userName || undefined);
      
      // Clean the URL to prevent re-login on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [actions]);

  if (!loggedInUserId) {
    if (guestSessionId) {
        return <UserReLoginPage />;
    }
    return <LoginScreen />;
  }

  return <MainLayout />;
}

export default App;