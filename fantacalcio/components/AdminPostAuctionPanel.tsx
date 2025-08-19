import React from 'react';
import useAuctionStore from '../store/useAuctionStore';
import { exportAllSquadsToExcel } from '../services/fileService';
import { Button } from './common/Button';
import { useTranslation } from '../lib/i18n';

export const AdminPostAuctionPanel: React.FC = () => {
    const users = useAuctionStore(state => state.users);
    const actions = useAuctionStore(state => state.actions);
    const { t } = useTranslation();

    const handleDownload = () => {
        exportAllSquadsToExcel(users, t);
    };

    const handleReset = () => {
        actions.resetAuction();
    };

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6 text-brand-text">{t('postAuctionTitle')}</h2>
            <p className="text-brand-subtle mb-8">{t('postAuctionInstruction')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleDownload} variant="secondary" className="flex-1">
                    {t('postAuctionDownloadAll')}
                </Button>
                <Button onClick={handleReset} variant="danger" className="flex-1">
                    {t('postAuctionPrepareNew')}
                </Button>
            </div>
        </div>
    );
};