import React, { useEffect } from 'react';
import useAuctionStore from './store/useAuctionStore';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { AuctionRoom } from './components/AuctionRoom';
import { UserDashboard } from './components/UserDashboard';
import { Button } from './components/common/Button';
import { AuctionQueue } from './components/AuctionQueue';
import { AdminPostAuctionPanel } from './components/AdminPostAuctionPanel';

const MainLayout: React.FC = () => {
    const { loggedInUserId, users, status, actions } = useAuctionStore();
    const currentUser = users.get(loggedInUserId!);

    if (!currentUser) return null;

    const isAdmin = currentUser.id === 'admin';
    const isAuctionRunning = status === 'BIDDING' || status === 'PAUSED' || status === 'SOLD';
    
    return (
        <div className="min-h-screen bg-brand-background text-brand-text">
            <header className="bg-brand-surface p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">Asta Fantacalcio Monticelli 2025/26</h1>
                </div>
                <div className="flex items-center gap-4">
                    {isAdmin && (status === 'BIDDING' || status === 'PAUSED') && (
                         <Button onClick={() => status === 'BIDDING' ? actions.pauseAuction() : actions.resumeAuction()} variant="secondary">
                            {status === 'BIDDING' ? 'Pausa' : 'Riprendi'}
                         </Button>
                    )}
                    <span className="hidden sm:inline text-brand-subtle">Accesso come <span className="font-bold text-brand-text">{currentUser.name}</span></span>
                    <Button onClick={() => actions.logout()} variant='danger' className="text-sm py-1 px-3">Esci</Button>
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
                                            <h2 className="text-3xl font-bold">Benvenuto nella Lobby</h2>
                                            <p className="text-brand-subtle mt-4">L'amministratore sta preparando l'asta. Attendi che la lista giocatori sia finalizzata e che l'asta venga inizializzata.</p>
                                        </>
                                    )}
                                    {status === 'READY' && (
                                         <>
                                            <h2 className="text-3xl font-bold">L'Asta è Pronta!</h2>
                                            <p className="text-brand-subtle mt-4">L'amministratore ha inizializzato l'asta. Controlla la tua dashboard a destra e clicca su "Sono Pronto!" per confermare la tua partecipazione.</p>
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
  const { loggedInUserId, actions } = useAuctionStore();

  useEffect(() => {
    // Handle direct login via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userIdToLogin = urlParams.get('loginAs');
    if (userIdToLogin) {
      actions.login(userIdToLogin);
      // Clean the URL to avoid re-login on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [actions]);

  if (!loggedInUserId) {
    return <LoginScreen />;
  }

  return <MainLayout />;
}

export default App;