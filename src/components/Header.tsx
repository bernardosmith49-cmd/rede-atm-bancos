import React, { useState } from 'react';
import { LanguageCode, ThemeMode, UserProfile, CloudBackupState } from '../types';
import { translations } from '../i18n';
import {
  Banknote,
  Globe,
  Palette,
  Bell,
  User,
  Shield,
  Cloud,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Eye,
  Layers,
  Map,
  List,
  Columns,
  Fingerprint,
} from 'lucide-react';

interface HeaderProps {
  lang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  isOnline: boolean;
  onToggleOfflineMode: () => void;
  cloudBackup: CloudBackupState;
  onOpenNotifications: () => void;
  unreadCount: number;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  viewMode: 'map' | 'list' | 'split';
  onChangeViewMode: (mode: 'map' | 'list' | 'split') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onChangeLang,
  theme,
  onChangeTheme,
  isOnline,
  onToggleOfflineMode,
  cloudBackup,
  onOpenNotifications,
  unreadCount,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  viewMode,
  onChangeViewMode,
}) => {
  const t = translations[lang];
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {t.appTitle}
              </h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center: View Mode Toggle (Map / Split / List) */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{t.viewModeSplit}</span>
          </button>
          <button
            onClick={() => onChangeViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.viewModeMap}</span>
          </button>
          <button
            onClick={() => onChangeViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t.viewModeList}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Online/Offline Mode indicator button */}
          <button
            id="btn-toggle-offline-simulation"
            onClick={onToggleOfflineMode}
            title={isOnline ? 'Online (Clique para simular Modo Offline)' : 'Modo Offline Ativo'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            )}
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {/* Cloud sync status indicator */}
          <div
            title={`Nuvem Sincronizada: ${cloudBackup.totalSyncedAtms} ATMs em tempo real`}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden xl:inline">{t.cloudBackupSynced}</span>
          </div>

          {/* Theme Selector Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title={t.theme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : theme === 'high_contrast' ? (
                <Eye className="w-4 h-4 text-amber-500" />
              ) : (
                <Palette className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs space-y-1">
                <button
                  onClick={() => {
                    onChangeTheme('emerald');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left font-semibold ${
                    theme === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>{t.themeEmerald}</span>
                </button>

                <button
                  onClick={() => {
                    onChangeTheme('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.themeDark}</span>
                </button>

                <button
                  onClick={() => {
                    onChangeTheme('indigo');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left font-semibold ${
                    theme === 'indigo'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                  <span>{t.themeIndigo}</span>
                </button>

                <button
                  onClick={() => {
                    onChangeTheme('high_contrast');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left font-semibold ${
                    theme === 'high_contrast'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.themeContrast}</span>
                </button>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>
          </div>

          {/* Push Notifications Bell */}
          <button
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            title={t.notifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Panel Button */}
          <button
            id="btn-header-admin-panel"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span className="hidden sm:inline">{t.adminPanel}</span>
          </button>

          {/* User Profile / Biometrics Button */}
          <button
            onClick={onOpenAuth}
            title="Perfil & Autenticação Biométrica"
            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1"
          >
            <Fingerprint className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold hidden md:inline px-1">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
