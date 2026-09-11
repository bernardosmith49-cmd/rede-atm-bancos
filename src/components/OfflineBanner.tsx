import React from 'react';
import { translations } from '../i18n';
import { WifiOff, Database, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  offlineCacheTime: string;
  onSync: () => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  offlineCacheTime,
  onSync,
  lang,
}) => {
  const t = translations[lang];

  if (isOnline) return null;

  return (
    <div className="bg-amber-500/90 dark:bg-amber-600/90 text-white px-4 py-2.5 text-xs font-semibold backdrop-blur-md shadow-sm flex flex-wrap items-center justify-between gap-2 z-[300]">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>
          <strong>{t.offlineMode}:</strong> {t.offlineDesc} Último cache:{' '}
          {new Date(offlineCacheTime).toLocaleTimeString('pt-AO')}.
        </span>
      </div>

      <button
        onClick={onSync}
        className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] font-bold transition ml-auto"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{t.syncNow}</span>
      </button>
    </div>
  );
};
