
import React from 'react';
import type { User } from '../types';
import { CreditIcon, UserIcon, LogoutIcon } from './icons';

interface UserPanelProps {
  user: User;
  onLogout: () => void;
  onShowPurchases: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, onLogout, onShowPurchases }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg p-6 mb-6 sticky top-4">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center mr-4 border-2 border-slate-600">
          <UserIcon className="h-8 w-8 text-red-500"/>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
        <div className="flex items-center text-slate-300">
          <CreditIcon className="h-6 w-6 mr-3 text-red-400"/>
          <span className="text-sm">Crediti Disponibili</span>
        </div>
        <p className="text-3xl font-bold text-white text-right mt-1">{user.credits.toLocaleString()}</p>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={onShowPurchases}
          className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-500 transition"
        >
          Vedi La Mia Rosa
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-600/20 text-rose-400 font-semibold py-2 px-4 rounded-md hover:bg-rose-600/40 hover:text-rose-300 transition"
        >
          <LogoutIcon className="h-5 w-5" />
          Esci
        </button>
      </div>
    </div>
  );
};

export default UserPanel;