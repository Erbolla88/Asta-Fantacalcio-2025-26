import React from 'react';
import type { Player, User } from '../types';
import { DownloadIcon, XIcon, PlayerRoleIcon } from './icons';
import { TEAM_LOGOS } from '../constants';

interface PurchasedPlayersModalProps {
  purchasedPlayers: Player[];
  users: User[];
  onClose: () => void;
}

const PurchasedPlayersModal: React.FC<PurchasedPlayersModalProps> = ({ purchasedPlayers, users, onClose }) => {

  const handleDownload = () => {
    const headers = "PlayerID,NomeGiocatore,Ruolo,Squadra,ValoreAcquisto\n";
    const csvContent = purchasedPlayers.map(player => 
      `${player.id},"${player.playerName}","${player.role}","${player.team}",${player.soldFor}`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "la_mia_rosa.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const totalSpent = purchasedPlayers.reduce((acc, player) => acc + (player.soldFor || 0), 0);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = TEAM_LOGOS.fallback;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700 transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">La Mia Rosa</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {purchasedPlayers.length > 0 ? (
            <ul className="space-y-4">
              {purchasedPlayers.map(player => (
                <li key={player.id} className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                   <div className="w-12 h-12 flex-shrink-0 rounded-md bg-slate-600 flex items-center justify-center mr-4 text-red-400 text-2xl">
                        <PlayerRoleIcon role={player.role} />
                    </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-white">{player.playerName}</p>
                    <div className="flex items-center gap-2">
                        <img 
                            src={TEAM_LOGOS[player.team] || TEAM_LOGOS.fallback}
                            alt={`${player.team} logo`}
                            className="h-6 w-6 object-contain"
                            onError={handleImageError}
                        />
                        <p className="text-sm text-slate-400">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                     <p className="font-bold text-lg text-red-400">{player.soldFor}</p>
                     <p className="text-xs text-slate-500">Acquistato</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-400 py-8">Non hai ancora acquistato nessun giocatore.</p>
          )}
        </div>
        <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center rounded-b-lg">
           <div className="text-white">
                <span className="text-slate-400">Crediti Spesi: </span>
                <span className="font-bold text-xl">{totalSpent.toLocaleString()}</span>
            </div>
          <button
            onClick={handleDownload}
            disabled={purchasedPlayers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="h-5 w-5" />
            Scarica CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasedPlayersModal;