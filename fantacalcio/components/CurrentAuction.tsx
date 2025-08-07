import React, { useState, useEffect, useRef } from 'react';
import type { Player, User } from '../types';
import { ItemStatus, Role } from '../types';
import { BID_COUNTDOWN_SECONDS, TEAM_LOGOS } from '../constants';
import { GavelIcon, UserIcon, PlayerRoleIcon } from './icons';

interface CurrentAuctionProps {
  player: Player;
  currentUser: User;
  highestBidderName: string | null;
  onBid: (playerId: number, bidAmount: number) => void;
  onPlayerSold: (playerId: number) => void;
}

const CurrentAuction: React.FC<CurrentAuctionProps> = ({ player, currentUser, highestBidderName, onBid, onPlayerSold }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isNewBid, setIsNewBid] = useState(false);
  const prevBidRef = useRef(player.currentValue);

  const nextValue = player.currentValue + 1;
  const isSold = player.status === ItemStatus.Sold;
  const isOnAuction = player.status === ItemStatus.OnAuction;

  const canBid = isOnAuction &&
                 currentUser.role === Role.User &&
                 currentUser.credits >= nextValue &&
                 currentUser.id !== player.highestBidderId;

  const handleBid = () => {
    if (canBid) {
      onBid(player.id, nextValue);
    }
  };

  useEffect(() => {
    if (prevBidRef.current < player.currentValue) {
      setIsNewBid(true);
      const timer = setTimeout(() => setIsNewBid(false), 600);
      return () => clearTimeout(timer);
    }
  }, [player.currentValue]);
  
  useEffect(() => {
    prevBidRef.current = player.currentValue;
  }, [player.currentValue]);

  useEffect(() => {
    if (!player.bidEndTime || isSold) {
        setCountdown(null);
        return;
    }
    
    const interval = setInterval(() => {
        const remaining = Math.round((player.bidEndTime! - Date.now()) / 1000);
        if (remaining > 0) {
            setCountdown(remaining);
        } else {
            setCountdown(0);
            clearInterval(interval);
            if(player.highestBidderId) {
                onPlayerSold(player.id);
            } else { // If no bids, move on without selling
                onPlayerSold(player.id); 
            }
        }
    }, 250);

    return () => clearInterval(interval);
  }, [player.bidEndTime, player.id, isSold, player.highestBidderId, onPlayerSold]);
  
  const countdownProgress = player.bidEndTime && countdown !== null ? (countdown / BID_COUNTDOWN_SECONDS) * 100 : 0;
  const isTimeLow = countdown !== null && countdown <= 2;

  const bidButtonText = () => {
    if (currentUser.id === player.highestBidderId) {
      return "Sei il maggior offerente";
    }
    if (countdown !== null && countdown > 0) {
      return `Offri ${nextValue.toLocaleString()} (${countdown}s)`;
    }
    return `Offri ${nextValue.toLocaleString()}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = TEAM_LOGOS.fallback;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 transition-all duration-500 hover:shadow-red-500/20 hover:border-slate-600 relative overflow-hidden">
      {isSold && (
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20 backdrop-blur-sm">
            <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 transform -rotate-12 animate-pulse">AGGIUDICATO!</h2>
            {player.soldToId && <p className="text-white text-lg mt-4">a <strong>{highestBidderName}</strong> per <strong>{player.soldFor?.toLocaleString()}</strong> crediti</p>}
            {!player.soldToId && <p className="text-white text-lg mt-4">Nessuna offerta ricevuta</p>}
        </div>
      )}

      <div className={`flex flex-col md:flex-row transition-all duration-500 ${isSold ? 'filter grayscale' : ''}`}>
        {/* Player Role Icon Section */}
        <div className="md:w-1/3 xl:w-1/4 bg-slate-900/40 flex flex-col items-center justify-center p-6">
            <div className="w-28 h-28 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center text-red-400 text-6xl">
                <PlayerRoleIcon role={player.role} />
            </div>
        </div>

        {/* Details Section */}
        <div className="md:w-2/3 xl:w-3/4 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">{player.playerName}</h2>
            <div className="flex items-center gap-3 mt-2">
                <img 
                    src={TEAM_LOGOS[player.team] || TEAM_LOGOS.fallback}
                    alt={`${player.team} logo`}
                    className="h-10 w-10 object-contain"
                    onError={handleImageError}
                />
                <p className="text-lg text-slate-300">{player.team}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-6">
            {/* Bid Info */}
            <div>
              <div className="text-sm font-medium text-slate-400">VALORE ATTUALE</div>
              <p className={`text-5xl font-bold transition-all duration-300 ${isNewBid ? 'scale-110 text-yellow-300' : 'text-red-500'}`}>{player.currentValue.toLocaleString()}</p>
              <div className="text-sm text-slate-500 h-5 mt-1 flex items-center gap-2">
                {highestBidderName ? (
                    <>
                        <UserIcon className="h-4 w-4" />
                        <span>di <strong className={`transition-colors duration-300 ${isNewBid ? 'text-yellow-300' : 'text-white'}`}>{highestBidderName}</strong></span>
                    </>
                ) : 'Base d\'asta'}
              </div>
            </div>

            {/* Countdown Bar */}
            {countdown !== null && (
                 <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-200 ${isTimeLow ? 'bg-rose-700' : 'bg-red-600'}`} 
                        style={{ width: `${countdownProgress}%`}}>
                    </div>
                </div>
            )}
            
            {/* Bid Button */}
            <button
              onClick={handleBid}
              disabled={!canBid}
              className="w-full flex items-center justify-center gap-3 bg-red-600 text-white font-bold py-4 px-4 rounded-lg transition duration-200 text-lg enabled:hover:bg-red-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform enabled:hover:scale-105"
            >
              <GavelIcon className="h-6 w-6"/>
              <span>{bidButtonText()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentAuction;