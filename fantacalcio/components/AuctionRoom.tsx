import React, { useState, useEffect } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { Player, Bid, User, PlayerRole } from '../types';
import { RoleIcon } from './icons/RoleIcon';
import { ClubLogo } from './icons/ClubLogo';
import { Button } from './common/Button';
import { useTranslation } from '../lib/i18n';

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-brand-surface rounded-xl shadow-2xl p-6 w-full max-w-md text-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center -mt-16">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-slate-700 border-4 border-brand-background flex items-center justify-center">
                        <ClubLogo clubName={player.club} size={80} />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                        <RoleIcon role={player.role} size="lg" />
                    </div>
                </div>
            </div>
            <h2 className="text-3xl font-bold mt-4 text-brand-text">{player.name}</h2>
            <p className="text-lg text-brand-subtle">{player.club}</p>
            <div className="mt-6 border-t border-slate-700 pt-4">
                <p className="text-sm text-brand-subtle">{t('baseValue')}</p>
                <p className="text-2xl font-semibold text-brand-secondary">{player.baseValue} CR</p>
            </div>
        </div>
    );
}

const CountdownTimer: React.FC<{ seconds: number }> = ({ seconds }) => {
    const { t } = useTranslation();
    const status = useAuctionStore(state => state.status);
    let color = 'text-brand-subtle';
    if (status === 'BIDDING') {
      const isTestMode = useAuctionStore.getState().isTestMode;
      const redThreshold = isTestMode ? 1 : 2;
      const yellowThreshold = isTestMode ? 2 : 5;
      if (seconds <= redThreshold) color = 'text-red-500 animate-pulse';
      else if (seconds <= yellowThreshold) color = 'text-yellow-400';
      else color = 'text-green-400';
    }

    return (
        <div className="text-center">
            <p className="text-sm uppercase text-brand-subtle">{t('countdown')}</p>
            <p className={`text-7xl font-mono font-bold transition-colors duration-300 ${color}`}>{seconds}</p>
        </div>
    );
};

const BiddingInterface: React.FC<{ player: Player }> = ({ player }) => {
    const loggedInUserId = useAuctionStore(state => state.loggedInUserId);
    const users = useAuctionStore(state => state.users);
    const currentBid = useAuctionStore(state => state.currentBid);
    const actions = useAuctionStore(state => state.actions);
    const isTestMode = useAuctionStore(state => state.isTestMode);
    
    const { t } = useTranslation();
    const [bidAmount, setBidAmount] = useState(player.baseValue);
    const currentUser = users.get(loggedInUserId || '');

    useEffect(() => {
        const nextBid = currentBid ? currentBid.amount + 1 : player.baseValue;
        setBidAmount(nextBid);
    }, [currentBid, player]);

    const handleBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (loggedInUserId) {
            actions.placeBid(loggedInUserId, bidAmount);
        }
    };

    if (!currentUser || (loggedInUserId === 'admin' && isTestMode)) {
        return isTestMode ? (
             <div className="mt-6 text-center text-brand-subtle">
                <p>{t('adminTestAuctionRunning')}</p>
            </div>
        ) : null;
    }

    const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };
    
    const playersInRole = currentUser.squad.filter(p => p.role === player.role).length;
    const isRoleLimitReached = playersInRole >= ROLE_LIMITS[player.role];
    const canAfford = currentUser.credits >= bidAmount;
    const isHighestBidder = currentBid?.userId === loggedInUserId;
    const isButtonDisabled = !canAfford || isHighestBidder || isRoleLimitReached;

    return (
        <form onSubmit={handleBid} className="w-full max-w-sm mt-6 flex flex-col items-center">
            <div className="flex gap-2 items-center w-full">
                <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={currentBid ? currentBid.amount + 1 : player.baseValue}
                    max={currentUser.credits}
                    className="flex-grow bg-slate-900 border-2 border-slate-700 rounded-lg p-3 text-center text-xl font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50"
                    disabled={isRoleLimitReached}
                />
                <Button type="submit" variant="primary" size="lg" disabled={isButtonDisabled}>
                    {isRoleLimitReached ? t('roleLimit') : t('bidButton')}
                </Button>
            </div>
            {!canAfford && <p className="text-red-500 text-sm mt-2">{t('insufficientCredits')}</p>}
            {isHighestBidder && !isRoleLimitReached && <p className="text-green-400 text-sm mt-2">{t('highestBidder')}</p>}
            {isRoleLimitReached && <p className="text-yellow-400 text-sm mt-2">{t('roleLimitReached', {count: playersInRole, limit: ROLE_LIMITS[player.role], role: player.role})}</p>}
        </form>
    );
};

const FALLBACK_WINNER_IMAGE_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const LastWinnerInfo: React.FC = () => {
    const lastWinner = useAuctionStore(state => state.lastWinner);
    const winnerImageDataUrl = useAuctionStore(state => state.winnerImageDataUrl);
    const { t } = useTranslation();

    if (!lastWinner) {
        return (
            <div className="bg-brand-surface p-6 rounded-2xl shadow-2xl text-center w-full max-w-md">
                <h3 className="text-2xl font-bold text-brand-text">{t('playerUnsold')}</h3>
                <p className="text-sm text-brand-subtle mt-4">{t('nextAuctionSoon')}</p>
            </div>
        );
    }
    
    const { player, user, amount } = lastWinner;

    return (
         <div className="bg-brand-surface rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center animate-pulse-slow">
            <h3 className="text-4xl font-bold text-green-400 mb-4">{t('sold')}</h3>
            <div className="flex items-center justify-center my-6">
                <div className="w-48 h-48 rounded-full bg-slate-800 border-4 border-brand-primary overflow-hidden shadow-lg">
                   <img 
                       src={winnerImageDataUrl || FALLBACK_WINNER_IMAGE_DATA_URL}
                       alt="Auction Winner" 
                       className="w-full h-full object-cover" 
                   />
                </div>
            </div>
            <p className="text-2xl font-semibold mt-4 text-brand-text">{t('soldToFor', { user: user.teamName, amount: amount })}</p>
            <p className="text-lg text-brand-subtle -mt-1">{user.name}</p>

            <div className="mt-6 border-t border-slate-700 pt-6 flex items-center justify-center gap-4">
                 <div className="flex-shrink-0">
                    <ClubLogo clubName={player.club} size={50} />
                </div>
                <div className="text-left">
                    <p className="text-2xl font-bold text-brand-text">{player.name}</p>
                    <p className="text-md text-brand-subtle">{player.club}</p>
                </div>
            </div>
        </div>
    );
};

const CurrentBidInfo: React.FC<{ bid: Bid | null }> = ({ bid }) => {
    const users = useAuctionStore(state => state.users);
    const { t } = useTranslation();

    if (!bid) {
        return (
             <div className="text-center mt-4">
                <p className="text-sm uppercase text-brand-subtle">{t('currentBid')}</p>
                <p className="text-3xl font-bold text-brand-text">{t('noBid')}</p>
            </div>
        );
    }
    
    const user = users.get(bid.userId);
    
    return (
        <div className="text-center mt-4">
            <p className="text-sm uppercase text-brand-subtle">{t('currentBid')}</p>
            <p className="text-3xl font-bold text-brand-primary">{bid.amount} CR</p>
            {user && <p className="text-sm text-brand-subtle">{user.teamName}</p>}
        </div>
    );
};

export const AuctionRoom: React.FC = () => {
    const status = useAuctionStore(state => state.status);
    const players = useAuctionStore(state => state.players);
    const auctionQueue = useAuctionStore(state => state.auctionQueue);
    const currentPlayerIndex = useAuctionStore(state => state.currentPlayerIndex);
    const countdown = useAuctionStore(state => state.countdown);
    const currentBid = useAuctionStore(state => state.currentBid);
    const { t } = useTranslation();

    const renderContent = () => {
        switch(status) {
            case 'BIDDING':
                const player = players[auctionQueue[currentPlayerIndex]];
                if (!player) return null;
                return (
                    <>
                        <PlayerCard player={player} />
                        <div className="mt-8 flex flex-col items-center">
                           <CountdownTimer seconds={countdown} />
                           <CurrentBidInfo bid={currentBid} />
                           <BiddingInterface player={player} />
                        </div>
                    </>
                );
            case 'PAUSED':
                 return (
                    <div className="bg-brand-surface p-8 rounded-lg text-center flex flex-col justify-center items-center h-full">
                        <h2 className="text-3xl font-bold text-yellow-400">{t('auctionPausedTitle')}</h2>
                        <p className="text-brand-subtle mt-4">{t('auctionPausedInstruction')}</p>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400 mt-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'SOLD':
                return <LastWinnerInfo />;
            case 'ENDED':
                 return (
                    <div className="bg-brand-surface p-8 rounded-lg text-center flex flex-col justify-center items-center h-full">
                        <h2 className="text-3xl font-bold text-brand-primary">{t('auctionEndedTitle')}</h2>
                        <p className="text-brand-subtle mt-4">{t('auctionEndedInstruction')}</p>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary mt-4" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M11 3a1 1 0 10-2 0v1.586l-1.293-1.293a1 1 0 00-1.414 1.414L7.586 6H6a1 1 0 000 2h1.586l-1.293 1.293a1 1 0 101.414 1.414L9 8.414V10a1 1 0 102 0V8.414l1.293 1.293a1 1 0 001.414-1.414L12.414 6H14a1 1 0 100-2h-1.586l1.293-1.293a1 1 0 10-1.414-1.414L11 4.586V3z"/>
                           <path d="M6 10a1 1 0 01-1 1H4a1 1 0 110-2h1a1 1 0 011 1zM14 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z"/>
                           <path d="M3 15a2 2 0 002 2h10a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3z"/>
                       </svg>
                    </div>
                );
             default:
                return null; // SETUP and READY states are handled in App.tsx
        }
    }
    
    return (
        <div className="flex flex-col items-center justify-center w-full">
            {renderContent()}
        </div>
    );
};