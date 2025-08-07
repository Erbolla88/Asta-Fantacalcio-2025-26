import React, { useState, useEffect, useRef } from 'react';
import type { User, Player } from '../types';
import { ItemStatus, PlayerRole } from '../types';
import { PlusIcon, UploadIcon, DragHandleIcon, PlayerRoleIcon } from './icons';
import { TEAM_LOGOS } from '../constants';

interface AdminPanelProps {
  users: User[];
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id'>) => void;
  onAddCredit: (userId: number, amount: number) => void;
  onSetAuctionOrder: (players: Player[]) => void;
}

type AdminTab = 'addPlayer' | 'addCredit' | 'importCsv' | 'order';

const AdminPanel: React.FC<AdminPanelProps> = ({ users, players, onAddPlayer, onAddCredit, onSetAuctionOrder }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('order');
  
  // Add Player State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>(PlayerRole.Attaccante);
  const [newPlayerTeam, setNewPlayerTeam] = useState('');
  const [newPlayerValue, setNewPlayerValue] = useState('');
  
  // Add Credit State
  const [selectedUserId, setSelectedUserId] = useState<number>(users.find(u => u.role !== 'ADMIN')?.id || 0);
  const [creditAmount, setCreditAmount] = useState('');
  
  // Import CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Order state
  const [orderedPlayers, setOrderedPlayers] = useState<Player[]>([]);
  const dragPlayer = useRef<number | null>(null);
  const dragOverPlayer = useRef<number | null>(null);

  useEffect(() => {
    if (activeTab === 'order') {
        const pendingPlayers = players.filter(p => p.status === ItemStatus.Pending);
        setOrderedPlayers(pendingPlayers);
    }
  }, [activeTab, players]);

  const handleDragSort = () => {
    if (dragPlayer.current === null || dragOverPlayer.current === null) return;
    
    const playersCopy = [...orderedPlayers];
    const draggedPlayerContent = playersCopy.splice(dragPlayer.current, 1)[0];
    playersCopy.splice(dragOverPlayer.current, 0, draggedPlayerContent);

    dragPlayer.current = null;
    dragOverPlayer.current = null;
    setOrderedPlayers(playersCopy);
  };

  const handleConfirmOrder = () => {
    onSetAuctionOrder(orderedPlayers);
    setActiveTab('addPlayer');
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(newPlayerValue, 10);
    if (newPlayerName && newPlayerTeam && !isNaN(value) && value > 0) {
      onAddPlayer({
        playerName: newPlayerName,
        role: newPlayerRole,
        team: newPlayerTeam,
        startingValue: value,
        currentValue: value,
        highestBidderId: null,
        status: ItemStatus.Pending,
      });
      setNewPlayerName('');
      setNewPlayerRole(PlayerRole.Attaccante);
      setNewPlayerTeam('');
      setNewPlayerValue('');
    }
  };
  
  const handleAddCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(creditAmount, 10);
    if (selectedUserId && !isNaN(amount) && amount > 0) {
      onAddCredit(selectedUserId, amount);
      setCreditAmount('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCsvFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleImportCsv = () => {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const header = rows.shift()?.trim().split(',').map(h => h.trim());
      
      const expectedHeaders = ['playerName', 'role', 'team', 'startingValue'];
      if (!header || header.length < 4 || !expectedHeaders.every(h => header.includes(h))) {
        setImportStatus({message: `Formato CSV non valido. L'intestazione deve contenere: ${expectedHeaders.join(',')}.`, type: 'error'});
        return;
      }
      
      let playersAdded = 0;
      let errors: string[] = [];

      rows.forEach((row, index) => {
        const columns = row.split(',');
        const playerData: {[key: string]: string} = {};
        header.forEach((h, i) => playerData[h] = columns[i]?.trim());
        
        const { playerName, role, team, startingValue } = playerData;
        const value = parseInt(startingValue, 10);
        const playerRole = role as PlayerRole;

        if (playerName && team && playerRole && Object.values(PlayerRole).includes(playerRole) && !isNaN(value) && value > 0) {
            onAddPlayer({
                playerName,
                role: playerRole,
                team,
                startingValue: value,
                currentValue: value,
                highestBidderId: null,
                status: ItemStatus.Pending,
            });
            playersAdded++;
        } else {
            errors.push(`Riga ${index + 2}: Dati non validi (controlla nome, ruolo, squadra o valore).`);
        }
      });
      
      if(playersAdded > 0) {
          setImportStatus({message: `${playersAdded} giocatori importati. Errori: ${errors.length > 0 ? errors.join(' ') : 'nessuno'}.`, type: 'success'});
      } else {
          setImportStatus({message: `Importazione fallita. Errori: ${errors.join(' ')}`, type: 'error'});
      }
      setCsvFile(null);
    };

    reader.readAsText(csvFile);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = TEAM_LOGOS.fallback;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg p-6 sticky top-4">
      <h2 className="text-2xl font-bold text-white mb-4">Pannello Admin</h2>
      <div className="flex border-b border-slate-700 mb-6 text-sm sm:text-base overflow-x-auto">
        <button onClick={() => setActiveTab('order')} className={`flex-shrink-0 px-3 py-2 font-semibold transition ${activeTab === 'order' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'}`}>Ordine Asta</button>
        <button onClick={() => setActiveTab('addPlayer')} className={`flex-shrink-0 px-3 py-2 font-semibold transition ${activeTab === 'addPlayer' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'}`}>Aggiungi Giocatore</button>
        <button onClick={() => setActiveTab('addCredit')} className={`flex-shrink-0 px-3 py-2 font-semibold transition ${activeTab === 'addCredit' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'}`}>Aggiungi Crediti</button>
        <button onClick={() => setActiveTab('importCsv')} className={`flex-shrink-0 px-3 py-2 font-semibold transition ${activeTab === 'importCsv' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'}`}>Importa CSV</button>
      </div>

      {activeTab === 'order' && (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-white">Ordinare i Giocatori</h3>
                <p className="text-sm text-slate-400 mb-4">Trascina i giocatori per definire l'ordine di uscita nell'asta.</p>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {orderedPlayers.length > 0 ? orderedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        draggable
                        onDragStart={() => (dragPlayer.current = index)}
                        onDragEnter={() => (dragOverPlayer.current = index)}
                        onDragEnd={handleDragSort}
                        onDragOver={(e) => e.preventDefault()}
                        className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg cursor-grab active:cursor-grabbing border-2 border-transparent"
                    >
                        <DragHandleIcon className="h-5 w-5 text-slate-500" />
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-900/50 rounded-full text-red-300 text-lg">
                           <PlayerRoleIcon role={player.role} />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-white">{player.playerName}</p>
                            <div className="flex items-center gap-2">
                                <img 
                                    src={TEAM_LOGOS[player.team] || TEAM_LOGOS.fallback} 
                                    alt={player.team} 
                                    className="w-6 h-6 object-contain"
                                    onError={handleImageError}
                                />
                                <p className="text-xs text-slate-400">{player.team}</p>
                            </div>
                        </div>
                        <span className="text-sm font-mono text-slate-400">{player.startingValue}</span>
                    </div>
                )) : (
                    <p className="text-center text-slate-500 p-8">Nessun giocatore in attesa. Aggiungine o importane di nuovi.</p>
                )}
            </div>
            <button 
                onClick={handleConfirmOrder} 
                disabled={orderedPlayers.length === 0}
                className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed">
                Conferma Ordine e Aggiungi alla Coda
            </button>
        </div>
      )}
      
      {activeTab === 'addPlayer' && (
        <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome Giocatore</label>
            <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Ruolo</label>
              <select value={newPlayerRole} onChange={e => setNewPlayerRole(e.target.value as PlayerRole)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                {Object.values(PlayerRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Squadra</label>
                <input type="text" value={newPlayerTeam} onChange={e => setNewPlayerTeam(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Valore di Partenza</label>
            <input type="number" value={newPlayerValue} onChange={e => setNewPlayerValue(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" min="1" required />
          </div>
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition">
            <PlusIcon className="h-5 w-5"/>
            Aggiungi Giocatore all'Asta
          </button>
        </form>
      )}

      {activeTab === 'addCredit' && (
        <form onSubmit={handleAddCreditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Seleziona Utente</label>
            <select value={selectedUserId} onChange={e => setSelectedUserId(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
              {users.filter(u => u.role === 'USER').map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Crediti da Aggiungere</label>
            <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" min="1" required />
          </div>
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition">
            <PlusIcon className="h-5 w-5"/>
            Assegna Crediti
          </button>
        </form>
      )}

      {activeTab === 'importCsv' && (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Seleziona un file CSV</label>
                <p className="text-xs text-slate-400 mb-2">L'intestazione deve essere: `playerName,role,team,startingValue`</p>
                <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" 
                />
            </div>
            {importStatus && (
                <div className={`p-3 rounded-md text-sm ${importStatus.type === 'success' ? 'bg-slate-600 text-slate-100' : 'bg-red-500/20 text-red-300'}`}>
                    {importStatus.message}
                </div>
            )}
            <div className="p-3 rounded-md text-sm bg-slate-700/50 border border-slate-600 text-slate-300 mt-2">
                <strong>Nota:</strong> I nomi delle squadre nel CSV devono corrispondere esattamente a quelli usati nel sistema (es. "Hellas Verona", "Milan", ecc.) per visualizzare il logo corretto.
            </div>
            <button 
                onClick={handleImportCsv} 
                disabled={!csvFile}
                className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition disabled:bg-slate-600 disabled:cursor-not-allowed">
                <UploadIcon className="h-5 w-5" />
                Importa Giocatori
            </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;