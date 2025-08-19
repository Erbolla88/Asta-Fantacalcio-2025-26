import React from 'react';
import { useTranslation } from '../../lib/i18n';

const ItalianFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 3 2" className="rounded-sm">
        <rect width="1" height="2" fill="#009246"/>
        <rect width="1" height="2" x="1" fill="#FFFFFF"/>
        <rect width="1" height="2" x="2" fill="#CE2B37"/>
    </svg>
);

const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 60 30" className="rounded-sm">
        <clipPath id="a">
            <path d="M0 0v30h60V0z"/>
        </clipPath>
        <clipPath id="b">
            <path d="M30 15h30v15h-30zm0-15h30v15h-30zm-30 15h30v15h-30zm-30-15h30v15h-30z"/>
        </clipPath>
        <g clipPath="url(#a)">
            <path d="M0 0v30h60V0z" fill="#012169"/>
            <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
            <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
    </svg>
);


export const LanguageSelector: React.FC = () => {
    const { lang, setLang } = useTranslation();

    const toggleLanguage = () => {
        const newLang = lang === 'it' ? 'en' : 'it';
        setLang(newLang);
    };
    
    const { text, Flag, targetLanguageName } = lang === 'it' 
        ? { text: 'EN', Flag: UKFlag, targetLanguageName: 'English' }
        : { text: 'IT', Flag: ItalianFlag, targetLanguageName: 'Italiano' };

    return (
        <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 border-2 border-brand-subtle text-brand-subtle font-bold rounded-md hover:bg-brand-subtle hover:text-brand-surface transition-colors flex items-center gap-2"
            aria-label={`Change language to ${targetLanguageName}`}
        >
            <Flag />
            <span>{text}</span>
        </button>
    );
};
