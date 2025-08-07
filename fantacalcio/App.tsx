
import React, { useState, useCallback, useEffect } from 'react';
import type { User, Player } from './types';
import { Role, ItemStatus } from './types';
import { INITIAL_USERS, INITIAL_PLAYERS } from './constants';
import LoginScreen from './components/LoginScreen';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import CurrentAuction from './components/CurrentAuction';
import ItemQueue from './components/ItemQueue';
import PurchasedPlayersModal from './components/PurchasedItemsModal';
import { CheckCircleIcon } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(() => {
    // Start with the first ON_AUCTION player, if any. Otherwise, wait for admin.
    const firstOnAuction = INITIAL_PLAYERS.find(p => p.status === ItemStatus.OnAuction);
    return firstOnAuction ? firstOnAuction.id : null;
  });
  const [showPurchases, setShowPurchases] = useState(false);
  const [soldAndWaiting, setSoldAndWaiting] = useState<number | null>(null);

  // Effect to handle the transition after a player is sold
  useEffect(() => {
    const currentPlayer = players.find(player => player.id === currentPlayerId);
    if (currentPlayer && currentPlayer.status === ItemStatus.Sold && soldAndWaiting !== currentPlayer.id) {
        setSoldAndWaiting(currentPlayer.id);
        const timer = setTimeout(() => {
            const nextPlayer = players.find(p => p.status === ItemStatus.OnAuction && p.id !== currentPlayer.id);
            setCurrentPlayerId(nextPlayer ? nextPlayer.id : null);
            setSoldAndWaiting(null);
        }, 3000);
        
        return () => clearTimeout(timer);
    }
  }, [players, currentPlayerId, soldAndWaiting]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handlePlayerSold = useCallback((soldPlayerId: number) => {
    setPlayers(prevPlayers => {
        const playerToSell = prevPlayers.find(p => p.id === soldPlayerId);
        if (!playerToSell || playerToSell.status === ItemStatus.Sold) {
            return prevPlayers;
        }

        if(playerToSell.highestBidderId) {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === playerToSell.highestBidderId) {
                    return { ...user, credits: user.credits - playerToSell.currentValue };
                }
                return user;
            }));
        }

        return prevPlayers.map(player => {
            if (player.id === soldPlayerId) {
                return { ...player, status: ItemStatus.Sold, soldToId: player.highestBidderId, soldFor: player.currentValue, bidEndTime: null };
            }
            return player;
        });
    });
  }, []);


  const handleBid = (playerId: number, bidAmount: number) => {
    if (!currentUser) return;

    setPlayers(prevPlayers =>
      prevPlayers.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            currentValue: bidAmount,
            highestBidderId: currentUser.id,
            bidEndTime: Date.now() + 5 * 1000,
          };
        }
        return player;
      })
    );
  };

  const handleAddPlayer = (newPlayerData: Omit<Player, 'id'>) => {
    setPlayers(prevPlayers => {
        return [...prevPlayers, { id: Date.now() + Math.random(), ...newPlayerData }];
    });
  };

  const handleAddCredit = (userId: number, amount: number) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, credits: user.credits + amount } : user
      )
    );
  };
  
  const handleSetAuctionOrder = (orderedPendingPlayers: Player[]) => {
    setPlayers(prevPlayers => {
        const playerMap = new Map(prevPlayers.map(p => [p.id, p]));
        orderedPendingPlayers.forEach(p => {
            const existingPlayer = playerMap.get(p.id);
            if(existingPlayer && existingPlayer.status === ItemStatus.Pending) {
                playerMap.set(p.id, { ...existingPlayer, status: ItemStatus.OnAuction });
            }
        });
        return Array.from(playerMap.values());
    });

    if (currentPlayerId === null && orderedPendingPlayers.length > 0) {
        setCurrentPlayerId(orderedPendingPlayers[0].id);
    }
  };

  const findUserNameById = (id: number | null): string | null => {
    if (id === null) return null;
    return users.find(u => u.id === id)?.name || 'Utente Sconosciuto';
  }

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }
  
  const purchasedPlayersForCurrentUser = players.filter(player => player.status === ItemStatus.Sold && player.soldToId === currentUser.id);
  
  const currentPlayer = players.find(player => player.id === currentPlayerId);
  const upcomingPlayers = players.filter(player => player.status === ItemStatus.OnAuction && player.id !== currentPlayerId);
  const soldPlayers = players.filter(player => player.status === ItemStatus.Sold).sort((a,b) => b.id - a.id);

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-rose-600 text-transparent bg-clip-text">Asta Fantacalcio</h1>
            <p className="text-slate-400 mt-1">Il brivido dell'asta dal vivo. Un giocatore alla volta.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="lg:col-span-2 xl:col-span-3">
            {currentPlayer ? (
              <CurrentAuction
                key={currentPlayer.id}
                player={currentPlayer}
                currentUser={currentUser}
                highestBidderName={findUserNameById(currentPlayer.highestBidderId)}
                onBid={handleBid}
                onPlayerSold={handlePlayerSold}
              />
            ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-slate-800/50 rounded-lg border border-slate-700">
                    <CheckCircleIcon className="h-16 w-16 text-red-500 mb-4"/>
                    <h2 className="text-2xl font-bold text-white">Asta in attesa</h2>
                    <p className="text-slate-400 mt-2">L'admin deve definire l'ordine dei giocatori per iniziare.</p>
                </div>
            )}
            <ItemQueue 
                upcoming={upcomingPlayers} 
                sold={soldPlayers} 
                findUserNameById={findUserNameById} 
            />
          </div>

          <aside className="lg:col-span-1 xl:col-span-1">
            <UserPanel 
                user={users.find(u => u.id === currentUser.id)!} 
                onLogout={handleLogout}
                onShowPurchases={() => setShowPurchases(true)}
            />
            {currentUser.role === Role.Admin && (
              <AdminPanel
                users={users}
                players={players}
                onAddPlayer={handleAddPlayer}
                onAddCredit={handleAddCredit}
                onSetAuctionOrder={handleSetAuctionOrder}
              />
            )}
          </aside>
        </main>
      </div>

      {showPurchases && (
        <PurchasedPlayersModal
            purchasedPlayers={purchasedPlayersForCurrentUser}
            users={users}
            onClose={() => setShowPurchases(false)}
        />
      )}
    </>
  );
};

export default App;