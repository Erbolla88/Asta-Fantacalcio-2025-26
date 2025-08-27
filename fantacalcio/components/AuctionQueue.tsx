import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { RoleIcon } from './icons/RoleIcon';
import { ClubLogo } from './icons/ClubLogo';
import { useTranslation } from '../lib/i18n';

export const AuctionQueue: React.FC = () => {
    const players = useAuctionStore(state => state.auction?.players ?? []);
    const auctionQueue = useAuctionStore(state => state.auction?.auctionQueue ?? []);
    const currentPlayerIndex = useAuctionStore(state => state.auction?.currentPlayerIndex ?? -1);
    const status = useAuctionStore(state => state.auction?.status);
    const { t } = useTranslation();

    if (status === 'ENDED' || status === 'SETUP' || status === 'READY') {
        return null;
    }

    const upcomingPlayerIndices = auctionQueue.slice(currentPlayerIndex + 1);

    return (
        <div className="mt-8 bg-brand-surface p-4 rounded-lg shadow-lg w-full">
            <h3 className="text-xl font-bold mb-4">{t('nextPlayers')}</h3>
            {upcomingPlayerIndices.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {upcomingPlayerIndices.map(playerIndex => {
                        const player = players[playerIndex];
                        if (!player) return null;
                        return (
                             <div key={player.id} className="bg-slate-900 p-2 rounded-md flex items-center gap-3 hover:bg-slate-700 transition-colors">
                                <RoleIcon role={player.role} size="sm" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{player.name}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-brand-subtle">
                                        <ClubLogo clubName={player.club} size={16} />
                                        <span>{player.club}</span>
                                    </div>
                                </div>
                                <p className="font-semibold text-sm text-brand-secondary">{player.baseValue} CR</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-brand-subtle">{t('noMorePlayers')}</p>
            )}
        </div>
    );
};