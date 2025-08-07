
import React from 'react';
import type { User } from '../types';
import { GavelIcon } from './icons';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
            <GavelIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Asta dal Vivo</h1>
          <p className="text-slate-400 mt-2">Seleziona un profilo per partecipare</p>
        </div>
        
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="w-full flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center mr-4">
                <span className="text-lg font-bold text-white">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-grow text-left">
                <p className="font-semibold text-white">{user.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {user.role}
                </span>
              </div>
              <span className="text-sm font-mono text-slate-400">Entra &rarr;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;