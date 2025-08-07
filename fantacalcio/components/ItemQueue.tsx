import React from 'react';
import type { Player } from '../types';
import { ItemStatus } from '../types';
import { ClockIcon, CheckCircleIcon, UserIcon, PlayerRoleIcon } from './icons';
import { TEAM_LOGOS } from '../constants';

interface ItemQueueProps {
  upcoming: Player[];
  sold: Player[];
  findUserNameById: (id: number | null) => string | null;
}

interface MiniPlayerCardProps {
  player: Player;
  winnerName?: string | null;
}

const MiniPlayerCard: React.FC<MiniPlayerCardProps> = ({ player, winnerName }) => {
  const isSold = player.status === ItemStatus.Sold;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = TEAM_LOGOS.fallback;
  };
  
  return (
    <div className="flex-shrink-0 w-64 bg-slate-800 rounded-lg overflow-hidden border border-slate-700/80 flex p-3 gap-3">
       <div className={`w-12 h-12 flex-shrink-0 rounded-md flex items-center justify-center text-white text-2xl ${isSold ? 'bg-slate-600' : 'bg-red-500/20'}`}>
            <PlayerRoleIcon role={player.role} />
       </div>
      <div className="flex-grow overflow-hidden">
        <h4 className="text-sm font-semibold text-white truncate">{player.playerName}</h4>
        <div className="flex items-center gap-2">
            <img 
                src={TEAM_LOGOS[player.team] || TEAM_LOGOS.fallback} 
                alt={player.team} 
                className="w-6 h-6 object-contain"
                onError={handleImageError}
            />
            <p className="text-xs text-slate-400 truncate">{player.team}</p>
        </div>
        {isSold ? (
            <div className="mt-1 text-xs">
                <div className="flex items-center gap-1.5 text-red-400">
                    <CheckCircleIcon className="h-4 w-4" />
                    <strong>Acquistato per {player.soldFor?.toLocaleString()}</strong>
                </div>
                {winnerName && <div className="flex items-center gap-1.5 mt-1 truncate text-slate-400">
                    <UserIcon className="h-4 w-4" />
                    <span>{winnerName}</span>
                </div>}
            </div>
        ) : (
            <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                <span>Base {player.startingValue.toLocaleString()}</span>
            </div>
        )}
      </div>
    </div>
  );
};


const ItemQueue: React.FC<ItemQueueProps> = ({ upcoming, sold, findUserNameById }) => {
  if(upcoming.length === 0 && sold.length === 0) return null;

  return (
    <div className="mt-8 space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-300 mb-3 ml-2">PROSSIMI GIOCATORI</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {upcoming.map(player => (
              <MiniPlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      )}
      {sold.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-300 mb-3 ml-2">ACQUISTATI DI RECENTE</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {sold.map(player => (
              <MiniPlayerCard key={player.id} player={player} winnerName={findUserNameById(player.soldToId ?? null)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemQueue;