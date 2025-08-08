import React, { useState, useEffect } from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { Player, Bid, User, PlayerRole } from '../types';
import { RoleIcon } from './icons/RoleIcon';
import { ClubLogo } from './icons/ClubLogo';
import { Button } from './common/Button';
import { useTranslation } from '../lib/i18n';

const PlayerCard: React.FC<{ player: Player; bid: Bid | null }> = ({ player, bid }) => {
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
      if (seconds <= 3) color = 'text-red-500 animate-pulse';
      else if (seconds <= 5) color = 'text-yellow-400';
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
    const { loggedInUserId, users, currentBid, actions } = useAuctionStore();
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

    if (!currentUser) return null;

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
                <Button type="submit" variant="primary" disabled={isButtonDisabled}>
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
    const { lastWinner } = useAuctionStore();
    const { t } = useTranslation();
    if (!lastWinner) return <p className="text-brand-subtle text-center">{t('playerUnsold')}</p>;

    const { player, user, amount } = lastWinner;
    return (
        <div className="bg-brand-surface p-4 rounded-lg text-center animate-fade-in">
            <h3 className="text-xl font-bold">{t('sold')}</h3>
            <div className="flex items-center justify-center gap-4 mt-2">
                <RoleIcon role={player.role} />
                <p className="text-lg text-brand-text">{player.name}</p>
                <ClubLogo clubName={player.club} size={24} />
            </div>
            <p className="mt-2">
                {t('soldToFor', {user: user.name, amount})}
            </p>
            <p className="text-sm text-brand-subtle mt-4">{t('nextAuctionSoon')}</p>
        </div>
    )
}

export const AuctionRoom: React.FC = () => {
    const { status, players, auctionQueue, currentPlayerIndex, currentBid, countdown, users } = useAuctionStore();
    const { t } = useTranslation();
    
    if (status === 'READY' || status === 'SETUP') {
        const allUsers = Array.from(users.values());
        const readyUsers = allUsers.filter((u: User) => u.isReady).length;
        const totalUsers = allUsers.length;
        
        return (
            <div className="text-center p-8">
                <h2 className="text-3xl font-bold mb-4">{t('auctionReadyTitle')}</h2>
                <p className="text-brand-subtle mb-6">{t('auctionReadyInstruction')}</p>
                <p className="text-xl font-semibold">{t('adminUsersReady', {count: readyUsers, total: totalUsers})}</p>
            </div>
        );
    }
    
    if (status === 'ENDED') {
        return (
            <div className="text-center p-8">
                <h2 className="text-3xl font-bold mb-4">{t('auctionEndedTitle')}</h2>
                <p className="text-brand-subtle">{t('auctionEndedInstruction')}</p>
            </div>
        );
    }
    
    if (status === 'PAUSED') {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
                <h2 className="text-4xl font-bold mt-4">{t('auctionPausedTitle')}</h2>
                <p className="text-brand-subtle mt-2">{t('auctionPausedInstruction')}</p>
            </div>
        );
    }

    const player = players[auctionQueue[currentPlayerIndex]];
    const bidder = currentBid ? users.get(currentBid.userId) : null;
    
    return (
        <div className="flex flex-col items-center p-4 md:p-8 w-full">
            {status === 'SOLD' && 
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <LastWinnerInfo />
                </div>
            }
            {player && (
                 <>
                    <PlayerCard player={player} bid={currentBid} />
                    
                    <div className="my-8 flex items-center justify-around w-full max-w-2xl">
                        <div className="text-center">
                            <p className="text-sm uppercase text-brand-subtle">{t('currentBid')}</p>
                            <p className="text-4xl font-bold text-brand-text">{currentBid?.amount || '-'}</p>
                            <p className="text-brand-primary h-6">{bidder?.name || t('noBid')}</p>
                        </div>
                        <CountdownTimer seconds={countdown} />
                    </div>

                    <BiddingInterface player={player} />
                </>
            )}
        </div>
    );
};
