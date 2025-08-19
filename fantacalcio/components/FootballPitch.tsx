import React from 'react';
import { Player } from '../types';
import { RoleIcon } from './icons/RoleIcon';
import { ClubLogo } from './icons/ClubLogo';
import { useTranslation } from '../lib/i18n';

interface FootballPitchProps {
  squad: Player[];
}

const PlayerChip: React.FC<{ player: Player; isBench?: boolean }> = ({ player, isBench = false }) => (
    <div className={`flex flex-col items-center text-center p-1 bg-slate-900 bg-opacity-70 rounded-md shadow-lg ${isBench ? 'w-16 h-20' : 'w-20 h-24'} transform transition-transform hover:scale-110`}>
        <div className="relative">
            <div className={`rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-500 ${isBench ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <ClubLogo clubName={player.club} size={isBench ? 22 : 28} />
            </div>
            <div className="absolute -bottom-1 -right-1">
                <RoleIcon role={player.role} size="sm" />
            </div>
        </div>
        <p className="text-xs font-semibold mt-1 truncate w-full" title={player.name}>{player.name}</p>
        <p className={`text-brand-secondary font-bold ${isBench ? 'text-[10px]' : 'text-xs'}`}>{player.baseValue}cr</p>
    </div>
);


const renderPlayerGroup = (players: Player[], roleName: string) => {
    return (
        <div className="w-full py-4 min-h-[120px]">
             <div className="flex flex-wrap items-center justify-center gap-2">
                {players.length > 0 ? (
                    players.map(p => <PlayerChip key={p.id} player={p} />)
                ) : (
                    <p className="text-xs text-green-300 opacity-50">{roleName}</p>
                )}
            </div>
        </div>
    );
};

export const FootballPitch: React.FC<FootballPitchProps> = ({ squad }) => {
    const { t } = useTranslation();
    const formationLimits = { P: 1, D: 3, C: 4, A: 3 };

    const starters = { P: [] as Player[], D: [] as Player[], C: [] as Player[], A: [] as Player[] };
    const bench: Player[] = [];

    const goalkeepers = squad.filter(p => p.role === 'P');
    const defenders = squad.filter(p => p.role === 'D');
    const midfielders = squad.filter(p => p.role === 'C');
    const forwards = squad.filter(p => p.role === 'A');

    starters.P = goalkeepers.slice(0, formationLimits.P);
    bench.push(...goalkeepers.slice(formationLimits.P));

    starters.D = defenders.slice(0, formationLimits.D);
    bench.push(...defenders.slice(formationLimits.D));

    starters.C = midfielders.slice(0, formationLimits.C);
    bench.push(...midfielders.slice(formationLimits.C));

    starters.A = forwards.slice(0, formationLimits.A);
    bench.push(...forwards.slice(formationLimits.A));

    return (
        <div className="space-y-4">
            <div className="w-full bg-green-800 bg-opacity-50 rounded-lg p-2 border-2 border-green-400 border-opacity-30 flex flex-col-reverse divide-y-2 divide-y-reverse divide-green-400 divide-opacity-30 divide-dashed">
                {renderPlayerGroup(starters.P, t('goalkeepers'))}
                {renderPlayerGroup(starters.D, t('defenders'))}
                {renderPlayerGroup(starters.C, t('midfielders'))}
                {renderPlayerGroup(starters.A, t('forwards'))}
            </div>

            {bench.length > 0 && (
                 <div className="w-full bg-brand-surface p-3 rounded-lg border border-slate-700">
                    <h5 className="font-semibold text-center mb-3 text-brand-subtle">{t('bench', {count: bench.length})}</h5>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {bench.map(p => <PlayerChip key={p.id} player={p} isBench={true} />)}
                    </div>
                </div>
            )}
        </div>
    );
};
