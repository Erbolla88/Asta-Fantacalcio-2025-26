import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { exportAllSquadsToExcel } from '../services/fileService';
import { Button } from './common/Button';

export const AdminPostAuctionPanel: React.FC = () => {
    const { users, actions } = useAuctionStore();

    const handleDownload = () => {
        exportAllSquadsToExcel(users);
    };

    const handleReset = () => {
        actions.resetAuction();
    };

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6 text-brand-text">Asta Terminata</h2>
            <p className="text-brand-subtle mb-8">Usa i controlli qui sotto per finalizzare l'evento o iniziarne uno nuovo.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleDownload} variant="secondary" className="flex-1">
                    Scarica Risultati Finali (Excel)
                </Button>
                <Button onClick={handleReset} variant="danger" className="flex-1">
                    Prepara Nuova Asta
                </Button>
            </div>
        </div>
    );
};
