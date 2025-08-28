import React, { useEffect, useState } from 'react';
import useAuctionStore, { AuctionData } from './store/useAuctionStore';
import { AdminPanel } from './components/AdminPanel';
import { AuctionRoom } from './components/AuctionRoom';
import { UserDashboard } from './components/UserDashboard';
import { Button } from './components/common/Button';
import { AuctionQueue } from './components/AuctionQueue';
import { AdminPostAuctionPanel } from './components/AdminPostAuctionPanel';
import { useTranslation } from './lib/i18n';
import { LanguageSelector } from './components/common/LanguageSelector';
import { auth } from './lib/firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { User } from './types';
import { AuthScreen } from './components/AuthScreen';

const AdminAuctionManager: React.FC<{ auction: AuctionData }> = ({ auction }) => {
    const { sellPlayer, prepareNextPlayer, nextPlayer } = useAuctionStore(state => state.actions);
    const serverTimeOffset = useAuctionStore(state => state.serverTimeOffset);
    const { status, countdownEnd, lastWinner, config } = auction;

    useEffect(() => {
        if (status !== 'BIDDING' || countdownEnd === null) {
            return;
        }

        const timeRemaining = countdownEnd - (Date.now() + serverTimeOffset);
        
        const sellTimeout = setTimeout(() => {
            sellPlayer();
        }, timeRemaining > 0 ? timeRemaining : 0);

        return () => clearTimeout(sellTimeout);
    }, [status, countdownEnd, sellPlayer, serverTimeOffset]);
    
    useEffect(() => {
        if (status !== 'SOLD') {
            return;
        }
        
        const delay = config.isTestMode ? 2000 : 4000;
        const prepareTimeout = setTimeout(() => {
            prepareNextPlayer();
        }, delay);
        
        return () => clearTimeout(prepareTimeout);

    }, [status, lastWinner, prepareNextPlayer, config.isTestMode]);

    useEffect(() => {
        if (status !== 'NEXT_PLAYER_PREVIEW' || countdownEnd === null) {
            return;
        }

        const timeRemaining = countdownEnd - (Date.now() + serverTimeOffset);
        
        const startNextAuctionTimeout = setTimeout(() => {
            nextPlayer();
        }, timeRemaining > 0 ? timeRemaining : 0);

        return () => clearTimeout(startNextAuctionTimeout);
    }, [status, countdownEnd, nextPlayer, serverTimeOffset]);


    return null; 
}


const MainLayout: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const auction = useAuctionStore(state => state.auction);
    const actions = useAuctionStore(state => state.actions);
    const { t } = useTranslation();

    if (!auction) return null;
    const { status, config } = auction;

    const isAdmin = currentUser.isAdmin;
    const isAuctionRunning = status === 'BIDDING' || status === 'PAUSED' || status === 'SOLD' || status === 'NEXT_PLAYER_PREVIEW';
    
    const handleLogout = () => {
        signOut(auth);
    };

    const handleStopAuction = () => {
        if (window.confirm(t('stopAuctionConfirm'))) {
            actions.stopAuction().catch(e => console.error("Failed to stop auction", e));
        }
    };
    
    const showAdminPanel = isAdmin && (status === 'SETUP' || status === 'READY');

    return (
        <div className="min-h-screen bg-brand-background text-brand-text">
            {isAdmin && <AdminAuctionManager auction={auction} />}
            <header className="bg-brand-surface p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">{t('appTitle')}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {config.isTestMode && isAdmin && (
                        <>
                            <span className="hidden sm:inline text-amber-400 font-semibold animate-pulse">{t('adminTestAuctionRunning')}</span>
                            <Button onClick={() => actions.stopTestAuction().catch(e => console.error("Failed to stop test auction", e))} variant="danger" size="sm">
                                {t('adminStopTestAuction')}
                            </Button>
                        </>
                    )}
                    {isAdmin && (status === 'BIDDING' || status === 'PAUSED') && !config.isTestMode && (
                        <>
                            <Button onClick={() => (status === 'BIDDING' ? actions.pauseAuction() : actions.resumeAuction()).catch(e => console.error("Failed to pause/resume auction", e))} variant="secondary">
                                {status === 'BIDDING' ? t('pause') : t('resume')}
                            </Button>
                            <Button onClick={handleStopAuction} variant="danger">
                                {t('stopAuctionButton')}
                            </Button>
                        </>
                    )}
                    <span className="hidden sm:inline text-brand-subtle">{t('loggedInAs')} <span className="font-bold text-brand-text">{currentUser.name}</span></span>
                    <LanguageSelector />
                    <Button onClick={handleLogout} variant='danger' size="sm">{t('logout')}</Button>
                </div>
            </header>
            
            <main className="p-4 md:p-8">
                {showAdminPanel ? (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3"><AdminPanel currentUser={currentUser}/></div>
                        <div className="lg:col-span-2"><UserDashboard user={currentUser} /></div>
                    </div>
                ) : status === 'SETUP' || status === 'READY' ? (
                     // Must be non-admin here, because admin case is handled by showAdminPanel
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
                                     <>
                                        <h2 className="text-3xl font-bold">{t('lobbyReadyTitle')}</h2>
                                        <p className="text-brand-subtle mt-4">{t('lobbyReadyInstruction')}</p>
                                         <div className="mt-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-brand-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <UserDashboard user={currentUser} />
                        </div>
                    </div>
                ) : (
                    // Auction is running or ended
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           {status === 'ENDED' && isAdmin ? <AdminPostAuctionPanel /> : <AuctionRoom currentUser={currentUser} />}
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
  const { auction, isConnecting, actions } = useAuctionStore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const { t, lang } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // This effect runs once to set up an audio unlock mechanism for browsers
    // that have strict autoplay policies. Audio can only be started by a user gesture.
    // This listener waits for the first click/tap, "unlocks" the audio context,
    // and then removes itself.
    const unlockAudio = () => {
      // Create a dummy AudioContext. This is the standard way to "unlock" audio.
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Error resuming AudioContext:", e));
      }
      // This listener only needs to fire once.
      document.body.removeEventListener('click', unlockAudio);
      document.body.removeEventListener('touchend', unlockAudio);
    };

    document.body.addEventListener('click', unlockAudio);
    document.body.addEventListener('touchend', unlockAudio);

    return () => {
      document.body.removeEventListener('click', unlockAudio);
      document.body.removeEventListener('touchend', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        setAuthIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const unsubscribe = actions.connect();
      return () => unsubscribe();
  }, [actions]);

  // 1. Initial loading for auth state
  if (authIsLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-brand-background">
              <div className="flex flex-col items-center gap-4">
                 <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <p className="text-brand-text text-xl animate-pulse">{t('connecting')}</p>
              </div>
          </div>
      );
  }
  
  // 2. If not authenticated, show the login/register screen
  if (!firebaseUser) {
      return <AuthScreen />;
  }
  
  // 3. From here, firebaseUser is guaranteed to exist. Handle database connection state.
  if (isConnecting || !auction) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-brand-background">
               <div className="flex flex-col items-center gap-4">
                 <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <p className="text-brand-text text-xl animate-pulse">{t('loadingUserProfile')}</p>
              </div>
          </div>
      );
  }

  const currentUser = auction.users?.[firebaseUser.uid];

  // 4. If authenticated but has no DB profile, show the profile completion screen.
  if (!currentUser) {
      return <AuthScreen isCompletingProfile={true} />;
  }

  // 5. If authenticated and has a profile, show the main app.
  return <MainLayout currentUser={currentUser} />;
}

export default App;