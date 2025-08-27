import React, { useState, useEffect, useRef } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { Player, Bid, User, PlayerRole } from '../types';
import { RoleIcon } from './icons/RoleIcon';
import { ClubLogo } from './icons/ClubLogo';
import { Button } from './common/Button';
import { useTranslation } from '../lib/i18n';
import { FALLBACK_WINNER_IMAGE_DATA_URL, NEW_PLAYER_SOUND_DATA_URL } from '../lib/constants';

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

const CountdownTimer: React.FC<{ endTime: number | null, title?: string }> = ({ endTime, title }) => {
    const { t } = useTranslation();
    const isTestMode = useAuctionStore(state => state.auction?.config.isTestMode);
    const serverTimeOffset = useAuctionStore(state => state.serverTimeOffset);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (endTime === null) {
            setSeconds(0);
            return;
        }

        const updateSeconds = () => {
            const remaining = Math.max(0, Math.ceil((endTime - (Date.now() + serverTimeOffset)) / 1000));
            setSeconds(remaining);
        };
        
        updateSeconds();
        const interval = setInterval(updateSeconds, 500);
        return () => clearInterval(interval);

    }, [endTime, serverTimeOffset]);

    let color = 'text-brand-subtle';
    if (endTime) {
      const redThreshold = isTestMode ? 1 : 2;
      const yellowThreshold = isTestMode ? 2 : 5;
      if (seconds <= redThreshold) color = 'text-red-500 animate-pulse';
      else if (seconds <= yellowThreshold) color = 'text-yellow-400';
      else color = 'text-green-400';
    }

    return (
        <div className="text-center">
            <p className="text-sm uppercase text-brand-subtle">{title || t('countdown')}</p>
            <p className={`text-7xl font-mono font-bold transition-colors duration-300 ${color}`}>{seconds}</p>
        </div>
    );
};

const BiddingInterface: React.FC<{ player: Player, currentUser: User | undefined }> = ({ player, currentUser }) => {
    const auction = useAuctionStore(state => state.auction);
    const actions = useAuctionStore(state => state.actions);
    const { t } = useTranslation();

    if (!auction) return null;
    const { currentBid } = auction;
    
    const [bidAmount, setBidAmount] = useState(player.baseValue);

    useEffect(() => {
        const nextBid = currentBid ? currentBid.amount + 1 : player.baseValue;
        setBidAmount(nextBid);
    }, [currentBid, player]);

    const handleBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            actions.placeBid(currentUser.uid, bidAmount).catch(err => {
                console.error("Failed to place bid:", err);
                // In a real app, you might want to show a user-facing error here.
            });
        }
    };
    
    if (!currentUser || (currentUser.isAdmin && auction.config.isTestMode)) {
        return auction.config.isTestMode ? (
             <div className="mt-6 text-center text-brand-subtle">
                <p>{t('adminTestAuctionRunning')}</p>
            </div>
        ) : null;
    }

    const ROLE_LIMITS: Record<PlayerRole, number> = { P: 3, D: 8, C: 8, A: 6 };
    
    const playersInRole = (currentUser.squad || []).filter(p => p.role === player.role).length;
    const isRoleLimitReached = playersInRole >= ROLE_LIMITS[player.role];
    const canAfford = currentUser.credits >= bidAmount;
    const isHighestBidder = currentBid?.userId === currentUser.uid;
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

const LastWinnerInfo: React.FC = () => {
    const auction = useAuctionStore(state => state.auction);
    const { t } = useTranslation();

    if (!auction) return null;
    const { lastWinner, config } = auction;

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
                       src={config.winnerImageDataUrl || FALLBACK_WINNER_IMAGE_DATA_URL}
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

const CurrentBidInfo: React.FC<{ bid: Bid | null, users: Record<string, User> }> = ({ bid, users }) => {
    const { t } = useTranslation();

    if (!bid) {
        return (
             <div className="text-center mt-4">
                <p className="text-sm uppercase text-brand-subtle">{t('currentBid')}</p>
                <p className="text-3xl font-bold text-brand-text">{t('noBid')}</p>
            </div>
        );
    }
    
    const user = users[bid.userId];
    
    return (
        <div className="text-center mt-4">
            <p className="text-sm uppercase text-brand-subtle">{t('currentBid')}</p>
            <p className="text-3xl font-bold text-brand-primary">{bid.amount} CR</p>
            {user && <p className="text-sm text-brand-subtle">{user.teamName}</p>}
        </div>
    );
};

export const AuctionRoom: React.FC<{ currentUser: User | undefined }> = ({ currentUser }) => {
    const auction = useAuctionStore(state => state.auction);
    const { t } = useTranslation();
    const prevPlayerIndexRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (auction?.currentPlayerIndex !== undefined && auction.currentPlayerIndex > -1) {
            // Play sound only when the index genuinely changes to a new player
            if (prevPlayerIndexRef.current !== auction.currentPlayerIndex) {
                 const audio = new Audio(NEW_PLAYER_SOUND_DATA_URL);
                 audio.play().catch(e => console.error("Error playing sound:", e));
            }
        }
        // Store the current index for the next check
        prevPlayerIndexRef.current = auction?.currentPlayerIndex;
    }, [auction?.currentPlayerIndex]);


    if (!auction) return <div className="text-center">{t('loading')}</div>;

    const { status, players, auctionQueue, currentPlayerIndex, countdownEnd, currentBid, users } = auction;

    const renderContent = () => {
        switch(status) {
            case 'BIDDING':
                const player = players[auctionQueue[currentPlayerIndex]];
                if (!player) return null;
                return (
                    <>
                        <PlayerCard player={player} />
                        <div className="mt-8 flex flex-col items-center">
                           <CountdownTimer endTime={countdownEnd} />
                           <CurrentBidInfo bid={currentBid} users={users} />
                           <BiddingInterface player={player} currentUser={currentUser} />
                        </div>
                    </>
                );
            case 'PAUSED':
                 return (
                    <div className="bg-brand-surface p-8 rounded-lg text-center flex flex-col justify-center items-center h-full">
                        <h2 className="text-3xl font-bold text-yellow-400">{t('auctionPausedTitle')}</h2>
                        <p className="text-brand-subtle mt-4">{t('auctionPausedInstruction')}</p>
                         <svg xmlns="http://www.w.org/2000/svg" className="h-12 w-12 text-yellow-400 mt-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'SOLD':
                return <LastWinnerInfo />;
            case 'NEXT_PLAYER_PREVIEW':
                const nextPlayerIndex = currentPlayerIndex + 1;
                if (nextPlayerIndex >= auctionQueue.length) {
                    return null;
                }
                const nextPlayer = players[auctionQueue[nextPlayerIndex]];
                if (!nextPlayer) return null;

                return (
                    <div className="bg-brand-surface p-8 rounded-lg text-center flex flex-col justify-center items-center h-full">
                        <p className="text-lg text-brand-subtle">{t('nextPlayerUp')}</p>
                        <div className="my-4 p-4 border border-slate-700 rounded-lg bg-slate-900">
                            <div className="flex items-center justify-center gap-4">
                                <ClubLogo clubName={nextPlayer.club} size={40} />
                                <div>
                                    <h2 className="text-3xl font-bold text-brand-primary">{nextPlayer.name}</h2>
                                    <p className="text-md text-brand-subtle -mt-1">{nextPlayer.club}</p>
                                </div>
                                <RoleIcon role={nextPlayer.role} size="md" />
                            </div>
                        </div>
                        <div className="mt-4">
                             <CountdownTimer endTime={countdownEnd} title={t('auctionStartingIn')} />
                        </div>
                    </div>
                );
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