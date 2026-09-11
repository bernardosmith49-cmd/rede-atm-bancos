import React from 'react';
import { FilterOptions } from '../types';
import { translations } from '../i18n';
import {
  Search,
  Filter,
  Clock,
  Accessibility,
  Volume2,
  KeyRound,
  ShieldCheck,
  ArrowUpDown,
  SlidersHorizontal,
  Banknote,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface ATMFiltersProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  banksList: string[];
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const ATMFilters: React.FC<ATMFiltersProps> = ({
  filters,
  onChangeFilters,
  banksList,
  lang,
}) => {
  const t = translations[lang];
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleUpdate = (partial: Partial<FilterOptions>) => {
    onChangeFilters({ ...filters, ...partial });
  };

  const activeFilterCount =
    (filters.cashStatus !== 'all' ? 1 : 0) +
    (filters.bank !== 'all' ? 1 : 0) +
    (filters.openNowOnly ? 1 : 0) +
    (filters.is24hOnly ? 1 : 0) +
    (filters.wheelchairOnly ? 1 : 0) +
    (filters.audioGuidanceOnly ? 1 : 0) +
    (filters.brailleOnly ? 1 : 0) +
    (filters.depositOnly ? 1 : 0) +
    (filters.hasSecurityGuard ? 1 : 0) +
    (filters.maxDistanceKm < 25 ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors mb-4">
      {/* Search and Primary Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="atm-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleUpdate({ searchQuery: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleUpdate({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bank Dropdown */}
        <div className="w-full sm:w-48">
          <select
            id="filter-bank-select"
            value={filters.bank}
            onChange={(e) => handleUpdate({ bank: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          >
            <option value="all">{t.allBanks}</option>
            {banksList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <select
            id="filter-sort-select"
            value={filters.sortBy}
            onChange={(e) => handleUpdate({ sortBy: e.target.value as FilterOptions['sortBy'] })}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          >
            <option value="distance">{t.sortDistance}</option>
            <option value="cash_status">{t.sortCash}</option>
            <option value="queue">{t.sortQueue}</option>
            <option value="rating">{t.sortRating}</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            id="btn-toggle-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.filterTitle}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => handleUpdate({ cashStatus: 'all' })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            filters.cashStatus === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          {t.allStatuses}
        </button>

        <button
          onClick={() => handleUpdate({ cashStatus: 'available' })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            filters.cashStatus === 'available'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
          {t.cashAvailable}
        </button>

        <button
          onClick={() => handleUpdate({ cashStatus: 'low_or_available' })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            filters.cashStatus === 'low_or_available'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {t.lowCash} / {t.cashAvailable}
        </button>

        <button
          onClick={() => handleUpdate({ cashStatus: 'out_of_cash' })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            filters.cashStatus === 'out_of_cash'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          {t.outOfCash}
        </button>

        {/* Quick Toggles on primary bar */}
        <button
          onClick={() => handleUpdate({ openNowOnly: !filters.openNowOnly })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
            filters.openNowOnly
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          {t.filterOpenNow}
        </button>

        <button
          onClick={() => handleUpdate({ wheelchairOnly: !filters.wheelchairOnly })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
            filters.wheelchairOnly
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Accessibility className="w-3.5 h-3.5" />
          {t.filterWheelchair}
        </button>
      </div>

      {/* Expandable Advanced Accessibility & Hours Drawer */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Accessibility group */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.accessibilityTitle}
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.wheelchairOnly}
                  onChange={(e) => handleUpdate({ wheelchairOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.filterWheelchair}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.audioGuidanceOnly}
                  onChange={(e) => handleUpdate({ audioGuidanceOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.filterAudio}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brailleOnly}
                  onChange={(e) => handleUpdate({ brailleOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.filterBraille}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasSecurityGuard}
                  onChange={(e) => handleUpdate({ hasSecurityGuard: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.filterGuard}</span>
              </label>
            </div>
          </div>

          {/* Hours & Services group */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.servicesTitle} & Horários
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.is24hOnly}
                  onChange={(e) => handleUpdate({ is24hOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.filter24h}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.depositOnly}
                  onChange={(e) => handleUpdate({ depositOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.filterDeposit}</span>
              </label>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                {t.maxDistance}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {filters.maxDistanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={filters.maxDistanceKm}
              onChange={(e) => handleUpdate({ maxDistanceKm: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 km</span>
              <span>15 km</span>
              <span>30 km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
