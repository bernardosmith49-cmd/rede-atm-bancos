import React from 'react';
import { PushNotification, UserProfile } from '../types';
import { translations } from '../i18n';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Trash2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (atmId: string) => void;
  user: UserProfile;
  onUpdateUserSettings: (newSettings: UserProfile['notificationSettings']) => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification,
  user,
  onUpdateUserSettings,
  lang,
}) => {
  const t = translations[lang];
  const [showSettings, setShowSettings] = React.useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.notifications}
              </h3>
              <span className="text-[11px] text-slate-400">
                {unreadCount} não lidas • Alertas em Tempo Real
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Configurar Alertas"
              className={`p-2 rounded-xl transition ${
                showSettings
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Config Drawer */}
        {showSettings && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs space-y-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px]">
              Preferências de Notificação Push
            </span>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Alerta quando ATM esgotar cédulas</span>
                <input
                  type="checkbox"
                  checked={user.notificationSettings.outOfCashAlerts}
                  onChange={(e) =>
                    onUpdateUserSettings({
                      ...user.notificationSettings,
                      outOfCashAlerts: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Alerta de novo reabastecimento</span>
                <input
                  type="checkbox"
                  checked={user.notificationSettings.restockAlerts}
                  onChange={(e) =>
                    onUpdateUserSettings({
                      ...user.notificationSettings,
                      restockAlerts: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Som de notificação</span>
                <input
                  type="checkbox"
                  checked={user.notificationSettings.soundEnabled}
                  onChange={(e) =>
                    onUpdateUserSettings({
                      ...user.notificationSettings,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">{t.noNotifications}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onSelectNotification(n.atmId);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative group ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-xs'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-xl shrink-0 ${
                      n.type === 'out_of_cash'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        : n.type === 'restocked'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    }`}
                  >
                    {n.type === 'out_of_cash' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 pr-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.timestamp} • Ver caixa
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-xs">
          <button
            onClick={onMarkAllRead}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            {t.markAllRead}
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
