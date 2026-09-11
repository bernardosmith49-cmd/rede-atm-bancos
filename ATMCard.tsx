import React from 'react';
import { ATMItem } from '../types';
import { translations } from '../i18n';
import {
  Banknote,
  Clock,
  MapPin,
  Star,
  Users,
  Navigation,
  Accessibility,
  Volume2,
  ShieldCheck,
  Share2,
  Heart,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
} from 'lucide-react';

interface ATMCardProps {
  atm: ATMItem;
  isNearest?: boolean;
  onSelect: (atm: ATMItem) => void;
  onOpenDirections: (atm: ATMItem, e: React.MouseEvent) => void;
  onToggleFavorite: (atmId: string, e: React.MouseEvent) => void;
  onShare: (atm: ATMItem, e: React.MouseEvent) => void;
  onReportCash: (atm: ATMItem, e: React.MouseEvent) => void;
  isFavorite: boolean;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const ATMCard: React.FC<ATMCardProps> = ({
  atm,
  isNearest,
  onSelect,
  onOpenDirections,
  onToggleFavorite,
  onShare,
  onReportCash,
  isFavorite,
  lang,
}) => {
  const t = translations[lang];

  // Cash status style configuration
  const statusConfig = {
    available: {
      label: t.cashAvailable,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500 ring-emerald-300 animate-pulse',
      icon: CheckCircle2,
    },
    low_cash: {
      label: t.lowCash,
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-600 text-white',
      dot: 'bg-amber-500 ring-amber-300',
      icon: AlertTriangle,
    },
    out_of_cash: {
      label: t.outOfCash,
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-rose-600 text-white',
      dot: 'bg-rose-500 ring-rose-300',
      icon: XCircle,
    },
    maintenance: {
      label: t.inMaintenance,
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      border: 'border-slate-300 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      badge: 'bg-slate-600 text-white',
      dot: 'bg-slate-400 ring-slate-300',
      icon: Wrench,
    },
  }[atm.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      id={`atm-card-${atm.id}`}
      onClick={() => onSelect(atm)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Card Header: Bank Info & Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide"
              style={{
                backgroundColor: `${atm.bankColor}18`,
                color: atm.bankColor,
                border: `1px solid ${atm.bankColor}35`,
              }}
            >
              {atm.bankCode}
            </span>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {atm.district}
            </span>

            {isNearest && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {t.nearestBadge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => onShare(atm, e)}
              title={t.shareATM}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => onToggleFavorite(atm.id, e)}
              title={isFavorite ? t.unfavorite : t.favorite}
              className={`p-1.5 rounded-lg transition ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* ATM Name & Address */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
          {atm.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{atm.address}</span>
        </p>

        {/* Prominent Cash Status Banner */}
        <div
          className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between ${statusConfig.bg} ${statusConfig.border}`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ring-4 ${statusConfig.dot}`}></span>
            <div className="flex flex-col">
              <span className={`text-xs font-bold leading-none ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t.lastUpdate}: {atm.lastStatusUpdate}
              </span>
            </div>
          </div>

          {atm.status !== 'out_of_cash' && atm.status !== 'maintenance' ? (
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">
                {t.availableDenominations}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {atm.availableDenominations.map((d) => `${d}`).join(', ')} Kz
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {atm.status === 'out_of_cash' ? '0 Kz no dispensador' : 'Técnicos a intervir'}
            </span>
          )}
        </div>

        {/* Metrics Grid: Distance, Queue Time, Ratings */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-3 text-center border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Distância</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-0.5">
              <Navigation className="w-3 h-3 text-emerald-600" />
              {atm.distanceKm !== undefined ? `${atm.distanceKm} km` : '--'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">{t.queueWait}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3 text-blue-500" />
              {atm.queueWaitMinutes} {t.minutes}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Avaliação</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {atm.ratings.average.toFixed(1)}
              <span className="text-[10px] font-normal text-slate-400">({atm.ratings.totalCount})</span>
            </span>
          </div>
        </div>

        {/* Accessibility & Features Icons */}
        <div className="flex items-center gap-2 mb-3 text-slate-400">
          {atm.accessibility.wheelchairRamp && (
            <span title={t.filterWheelchair} className="p-1 rounded bg-slate-100 dark:bg-slate-800">
              <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          )}
          {atm.accessibility.audioGuidance && (
            <span title={t.filterAudio} className="p-1 rounded bg-slate-100 dark:bg-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          )}
          {atm.accessibility.securityGuard && (
            <span title={t.filterGuard} className="p-1 rounded bg-slate-100 dark:bg-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          )}
          {atm.operatingHours.is24h && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              24h
            </span>
          )}
          {atm.services.deposit && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              +Depósito
            </span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={(e) => onOpenDirections(atm, e)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.directions}</span>
        </button>

        <button
          onClick={(e) => onReportCash(atm, e)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
        >
          <span>{t.reportStatus}</span>
        </button>

        <div className="p-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
