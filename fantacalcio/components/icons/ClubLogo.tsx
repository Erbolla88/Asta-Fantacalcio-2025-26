import React from 'react';
import useAuctionStore from '../../store/useAuctionStore';

interface ClubLogoProps {
  clubName: string;
  size?: number;
}

// Logo URLs from a stable CDN (ESPN), with user-defined overrides.
const LOGO_URLS: Record<string, string> = {
    // Serie A 2025/2026 - Corrected Logos
    'Atalanta': 'https://a.espncdn.com/i/teamlogos/soccer/500/107.png',
    'Bologna': 'https://a.espncdn.com/i/teamlogos/soccer/500/100.png',
    'Cagliari': 'https://a.espncdn.com/i/teamlogos/soccer/500/372.png',
    'Como': 'https://a.espncdn.com/i/teamlogos/soccer/500/373.png',
    'Cremonese': 'https://a.espncdn.com/i/teamlogos/soccer/500/374.png',
    'Fiorentina': 'https://a.espncdn.com/i/teamlogos/soccer/500/109.png',
    'Genoa': 'https://a.espncdn.com/i/teamlogos/soccer/500/120.png',
    'Hellas Verona': 'https://a.espncdn.com/i/teamlogos/soccer/500/119.png',
    'Inter': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
    'Juventus': 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
    'Lazio': 'https://a.espncdn.com/i/teamlogos/soccer/500/113.png',
    'Lecce': 'https://a.espncdn.com/i/teamlogos/soccer/500/384.png',
    'Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
    'Napoli': 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
    'Parma': 'https://a.espncdn.com/i/teamlogos/soccer/500/115.png',
    'Pisa': 'https://a.espncdn.com/i/teamlogos/soccer/500/381.png',
    'Roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
    'Sassuolo': 'https://a.espncdn.com/i/teamlogos/soccer/500/471.png',
    'Torino': 'https://a.espncdn.com/i/teamlogos/soccer/500/118.png',
    'Udinese': 'https://a.espncdn.com/i/teamlogos/soccer/500/112.png',

    // Extra teams for backward compatibility
    'Empoli': 'https://a.espncdn.com/i/teamlogos/soccer/500/106.png',
    'Monza': 'https://a.espncdn.com/i/teamlogos/soccer/500/385.png',
    'Venezia': 'https://a.espncdn.com/i/teamlogos/soccer/500/396.png'
};
const UNKNOWN_LOGO = 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo-500.png';

// Create a lookup map with lowercase keys for robust matching.
const LOGO_LOOKUP_MAP = new Map<string, string>();
for (const [key, value] of Object.entries(LOGO_URLS)) {
    LOGO_LOOKUP_MAP.set(key.toLowerCase(), value);
}

export const ClubLogo: React.FC<ClubLogoProps> = ({ clubName, size = 32 }) => {
  const customLogos = useAuctionStore(state => state.auction?.customLogos);

  const getFinalLogoUrl = (): string => {
    if (typeof clubName !== 'string' || clubName.trim() === '') {
      return UNKNOWN_LOGO;
    }
    const cleanedName = clubName.trim().toLowerCase();
    
    // 1. Check for custom uploaded logo
    const customLogoUrl = customLogos?.[cleanedName];
    if (customLogoUrl) {
      return customLogoUrl;
    }
    
    // 2. Fallback to hardcoded map
    return LOGO_LOOKUP_MAP.get(cleanedName) || UNKNOWN_LOGO;
  };

  const url = getFinalLogoUrl();

  return (
    <img
      src={url}
      alt={`${clubName || 'Unknown Club'} logo`}
      width={size}
      height={size}
      className="object-contain"
      // Use a less restrictive referrer policy to improve compatibility with image CDNs.
      referrerPolicy="no-referrer"
    />
  );
};
