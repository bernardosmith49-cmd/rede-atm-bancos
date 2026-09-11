import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ATMItem,
  FilterOptions,
  LanguageCode,
  ThemeMode,
  UserProfile,
  PushNotification,
  CloudBackupState,
  ATMReview,
} from './types';
import { translations } from './i18n';
import {
  getStoredATMs,
  saveStoredATMs,
  getStoredUser,
  saveStoredUser,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredCloudBackup,
  saveStoredCloudBackup,
  getOfflineCacheTime,
} from './services/storage';
import { calculateDistanceKm } from './data/mockAtms';
import {
  isSupabaseConfigured,
  fetchATMReports,
  createATMReport,
  subscribeToATMReports,
  CloudATMReport,
} from './services/supabase';
import { Header } from './components/Header';
import { ATMMap } from './components/ATMMap';
import { ATMFilters } from './components/ATMFilters';
import { ATMCard } from './components/ATMCard';
import { ATMDetailModal } from './components/ATMDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ShareModal } from './components/ShareModal';
import { OfflineBanner } from './components/OfflineBanner';
import {
  MapPin,
  Clock,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Navigation,
  Layers,
  Sparkles,
  Map as MapIcon,
  List as ListIcon,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Localization & Theme
  const [lang, setLang] = useState<LanguageCode>('pt');
  const [theme, setTheme] = useState<ThemeMode>('emerald');

  // Network & Persistence State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineCacheTime, setOfflineCacheTime] = useState<string>(getOfflineCacheTime());
  const [atms, setAtms] = useState<ATMItem[]>(() => getStoredATMs());
  const [user, setUser] = useState<UserProfile>(() => getStoredUser());
  const [notifications, setNotifications] = useState<PushNotification[]>(() =>
    getStoredNotifications()
  );
  const [cloudBackup, setCloudBackup] = useState<CloudBackupState>(() =>
    getStoredCloudBackup()
  );

  const cloudReportIds = useRef(new Set<string>());

  const applyCloudReport = (currentAtms: ATMItem[], report: CloudATMReport): ATMItem[] => {
    if (cloudReportIds.current.has(report.id)) return currentAtms;
    cloudReportIds.current.add(report.id);

    const target = currentAtms.find((atm) => atm.id === report.atm_id);
    if (!target) return currentAtms;

    const cloudReview: ATMReview = {
      id: report.id,
      userName: report.user_name || 'Cidadão Verificado',
      rating: report.rating ?? 5,
      date: new Date(report.created_at).toLocaleString('pt-AO'),
      cashStatusReport: report.status,
      tags: Array.isArray(report.tags) ? report.tags : [],
      comment: report.comment || 'Situação reportada pela comunidade.',
      thumbsUp: 1,
      verifiedUser: false,
    };

    if (target.reviews.some((review) => review.id === cloudReview.id)) return currentAtms;

    const reviews = [...target.reviews, cloudReview];
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    let status = target.status;
    let estimatedBalanceKz = target.estimatedBalanceKz;
    if (report.status === 'no_cash') {
      status = 'out_of_cash';
      estimatedBalanceKz = 0;
    } else if (report.status === 'low_cash') {
      status = 'low_cash';
      estimatedBalanceKz = Math.min(estimatedBalanceKz || 8000000, 3000000);
    } else if (report.status === 'has_cash') {
      status = 'available';
      if (estimatedBalanceKz === 0) estimatedBalanceKz = 8000000;
    } else if (report.status === 'jammed') {
      status = 'maintenance';
    }

    return currentAtms.map((atm) =>
      atm.id === target.id
        ? {
            ...atm,
            reviews,
            status,
            estimatedBalanceKz,
            lastStatusUpdate: 'Confirmado pela comunidade agora',
            ratings: {
              ...atm.ratings,
              average: Math.round(average * 10) / 10,
              totalCount: Math.max(atm.ratings.totalCount, reviews.length),
            },
          }
        : atm
    );
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    const syncReports = async () => {
      const reports = await fetchATMReports();
      if (cancelled || reports.length === 0) return;

      setAtms((current) => {
        const next = reports.reduce((acc, report) => applyCloudReport(acc, report), current);
        saveStoredATMs(next);
        return next;
      });
    };

    void syncReports();
    const unsubscribe = subscribeToATMReports((report) => {
      setAtms((current) => {
        const next = applyCloudReport(current, report);
        saveStoredATMs(next);
        return next;
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: -8.825,
    lng: 13.235,
  });
  const [hasGeoPermission, setHasGeoPermission] = useState<boolean>(false);

  // Layout View Modes
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');

  // Modals & Panels
  const [selectedAtm, setSelectedAtm] = useState<ATMItem | null>(null);
  const [sharingAtm, setSharingAtm] = useState<ATMItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    cashStatus: 'all',
    bank: 'all',
    is24hOnly: false,
    openNowOnly: false,
    wheelchairOnly: false,
    audioGuidanceOnly: false,
    brailleOnly: false,
    depositOnly: false,
    hasSecurityGuard: false,
    maxDistanceKm: 25,
    minRating: 0,
    sortBy: 'distance',
  });

  const t = translations[lang];

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-indigo', 'theme-contrast');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'indigo') {
      root.classList.add('theme-indigo');
    } else if (theme === 'high_contrast') {
      root.classList.add('theme-contrast');
    }
  }, [theme]);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Browser Geolocation Retrieval
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setHasGeoPermission(true);
        },
        (err) => {
          console.warn('Geolocation fallback to default city coordinates', err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Recalculate distances relative to user coords
  const atmsWithDistance = useMemo(() => {
    return atms.map((atm) => {
      const distanceKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        atm.lat,
        atm.lng
      );
      return {
        ...atm,
        distanceKm,
        isFavorite: user.favoriteAtmIds.includes(atm.id),
      };
    });
  }, [atms, userCoords, user.favoriteAtmIds]);

  // Banks list for filter
  const banksList = useMemo(() => {
    const set = new Set<string>();
    atms.forEach((a) => set.add(a.bankName));
    return Array.from(set);
  }, [atms]);

  // Filter & Sort Pipeline
  const filteredAtms = useMemo(() => {
    return atmsWithDistance
      .filter((atm) => {
        // Search query filter
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = atm.name.toLowerCase().includes(q);
          const matchBank = atm.bankName.toLowerCase().includes(q);
          const matchAddress = atm.address.toLowerCase().includes(q);
          const matchDistrict = atm.district.toLowerCase().includes(q);
          const matchCode = atm.code.toLowerCase().includes(q);
          if (!matchName && !matchBank && !matchAddress && !matchDistrict && !matchCode) {
            return false;
          }
        }

        // Cash status filter
        if (filters.cashStatus === 'available' && atm.status !== 'available') return false;
        if (filters.cashStatus === 'low_or_available' && atm.status !== 'available' && atm.status !== 'low_cash')
          return false;
        if (filters.cashStatus === 'out_of_cash' && atm.status !== 'out_of_cash') return false;

        // Bank filter
        if (filters.bank !== 'all' && atm.bankName !== filters.bank) return false;

        // Hours filters
        if (filters.is24hOnly && !atm.operatingHours.is24h) return false;

        // Accessibility filters
        if (filters.wheelchairOnly && !atm.accessibility.wheelchairRamp) return false;
        if (filters.audioGuidanceOnly && !atm.accessibility.audioGuidance) return false;
        if (filters.brailleOnly && !atm.accessibility.brailleKeyboard) return false;
        if (filters.hasSecurityGuard && !atm.accessibility.securityGuard) return false;

        // Services filters
        if (filters.depositOnly && !atm.services.deposit) return false;

        // Max distance
        if (atm.distanceKm !== undefined && atm.distanceKm > filters.maxDistanceKm) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance') {
          return (a.distanceKm || 0) - (b.distanceKm || 0);
        }
        if (filters.sortBy === 'cash_status') {
          const score = (status: ATMItem['status']) =>
            status === 'available' ? 3 : status === 'low_cash' ? 2 : status === 'out_of_cash' ? 1 : 0;
          return score(b.status) - score(a.status);
        }
        if (filters.sortBy === 'queue') {
          return a.queueWaitMinutes - b.queueWaitMinutes;
        }
        if (filters.sortBy === 'rating') {
          return b.ratings.average - a.ratings.average;
        }
        return 0;
      });
  }, [atmsWithDistance, filters]);

  // Nearest ATM
  const nearestAtmId = useMemo(() => {
    if (atmsWithDistance.length === 0) return null;
    const sorted = [...atmsWithDistance].sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    return sorted[0]?.id;
  }, [atmsWithDistance]);

  // ATM Actions
  const handleUpdateATM = (updated: ATMItem) => {
    const nextAtms = atms.map((a) => (a.id === updated.id ? updated : a));
    setAtms(nextAtms);
    saveStoredATMs(nextAtms);

    // If status transitioned to out_of_cash and notification enabled, create push notification
    if (updated.status === 'out_of_cash') {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        atmId: updated.id,
        atmName: updated.name,
        type: 'out_of_cash',
        title: `Alerta: ${updated.bankCode} Sem Dinheiro!`,
        message: `O caixa ${updated.name} acabou de relatar saldo esgotado.`,
        timestamp: 'Agora mesmo',
        read: false,
        urgent: true,
      };
      const updatedNotes = [newNotif, ...notifications];
      setNotifications(updatedNotes);
      saveStoredNotifications(updatedNotes);
    } else if (updated.status === 'available') {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        atmId: updated.id,
        atmName: updated.name,
        type: 'restocked',
        title: `Cédulas Disponíveis: ${updated.bankCode}`,
        message: `${updated.name} foi reabastecido com ${updated.estimatedBalanceKz.toLocaleString(
          'pt-AO'
        )} Kz.`,
        timestamp: 'Agora mesmo',
        read: false,
      };
      const updatedNotes = [newNotif, ...notifications];
      setNotifications(updatedNotes);
      saveStoredNotifications(updatedNotes);
    }

    if (selectedAtm && selectedAtm.id === updated.id) {
      setSelectedAtm(updated);
    }
  };

  const handleToggleFavorite = (atmId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = user.favoriteAtmIds.includes(atmId);
    const newFavorites = isFav
      ? user.favoriteAtmIds.filter((id) => id !== atmId)
      : [...user.favoriteAtmIds, atmId];

    const updatedUser = { ...user, favoriteAtmIds: newFavorites };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
  };

  const handleOpenDirections = (atm: ATMItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${atm.lat},${atm.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = (atm: ATMItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSharingAtm(atm);
  };

  const handleReportCash = (atm: ATMItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAtm(atm);
  };

  const handleAddReview = async (
    atmId: string,
    reviewData: Omit<ATMReview, 'id' | 'thumbsUp' | 'verifiedUser'>
  ) => {
    const target = atms.find((a) => a.id === atmId);
    if (!target) return;

    try {
      if (isSupabaseConfigured) {
        const cloudReport = await createATMReport({
          atm_id: atmId,
          status: reviewData.cashStatusReport,
          rating: reviewData.rating,
          comment: reviewData.comment,
          tags: reviewData.tags,
          user_name: reviewData.userName,
        });

        const nextAtms = applyCloudReport(atms, cloudReport);
        setAtms(nextAtms);
        saveStoredATMs(nextAtms);
        return;
      }
    } catch (error) {
      console.error('Supabase: failed to publish ATM report; saving locally instead', error);
    }

    // Offline/local fallback when Supabase is unavailable.
    const newReview: ATMReview = {
      ...reviewData,
      id: `local-rev-${Date.now()}`,
      thumbsUp: 1,
      verifiedUser: true,
    };
    const newReviews = [newReview, ...target.reviews];
    const newAverage = newReviews.reduce((acc, curr) => acc + curr.rating, 0) / newReviews.length;
    let updatedStatus = target.status;
    let balance = target.estimatedBalanceKz;
    if (reviewData.cashStatusReport === 'no_cash') {
      updatedStatus = 'out_of_cash';
      balance = 0;
    } else if (reviewData.cashStatusReport === 'low_cash') {
      updatedStatus = 'low_cash';
      balance = Math.min(balance || 8000000, 3000000);
    } else if (reviewData.cashStatusReport === 'has_cash' && target.status === 'out_of_cash') {
      updatedStatus = 'available';
      balance = 8000000;
    } else if (reviewData.cashStatusReport === 'jammed') {
      updatedStatus = 'maintenance';
    }

    handleUpdateATM({
      ...target,
      reviews: newReviews,
      status: updatedStatus,
      estimatedBalanceKz: balance,
      lastStatusUpdate: 'Confirmado pela comunidade agora',
      ratings: {
        ...target.ratings,
        average: Math.round(newAverage * 10) / 10,
        totalCount: target.ratings.totalCount + 1,
      },
    });
  };

  const handleToggleAlert = (
    atmId: string,
    alertType: 'empty' | 'restock',
    enabled: boolean
  ) => {
    const target = atms.find((a) => a.id === atmId);
    if (!target) return;

    const updatedAtm: ATMItem = {
      ...target,
      notifyOutOfCash: alertType === 'empty' ? enabled : target.notifyOutOfCash,
      notifyReplenished: alertType === 'restock' ? enabled : target.notifyReplenished,
    };

    handleUpdateATM(updatedAtm);
  };

  const handleSyncCloud = () => {
    const newBackup: CloudBackupState = {
      lastBackupTime: new Date().toISOString(),
      status: 'success',
      totalSyncedAtms: atms.length,
      totalReviews: atms.reduce((sum, a) => sum + a.reviews.length, 0),
      version: 'v2.4.2-live',
    };
    setCloudBackup(newBackup);
    saveStoredCloudBackup(newBackup);
    setOfflineCacheTime(new Date().toISOString());
  };

  const handleCenterUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn(err)
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        offlineCacheTime={offlineCacheTime}
        onSync={handleSyncCloud}
        lang={lang}
      />

      {/* Primary Header */}
      <Header
        lang={lang}
        onChangeLang={setLang}
        theme={theme}
        onChangeTheme={setTheme}
        isOnline={isOnline}
        onToggleOfflineMode={() => setIsOnline(!isOnline)}
        cloudBackup={cloudBackup}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        currentUser={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Quick Summary Hero Ticker */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Rede Nacional de Caixas Automáticos (Multicaixa / BNA)
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Monitoramento em Tempo Real de Cédulas
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {atms.filter((a) => a.status === 'available').length} com dinheiro
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {atms.filter((a) => a.status === 'low_cash').length} saldo baixo
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              {atms.filter((a) => a.status === 'out_of_cash').length} sem saldo
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <ATMFilters
          filters={filters}
          onChangeFilters={setFilters}
          banksList={banksList}
          lang={lang}
        />

        {/* Content Layout based on viewMode: Split, Map or List */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
            {/* Left Column: ATM Cards List (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>
                  {filteredAtms.length} {filteredAtms.length === 1 ? 'caixa encontrado' : 'caixas encontrados'}
                </span>
                <span>Ordenado por: {filters.sortBy === 'distance' ? 'Mais próximo' : filters.sortBy}</span>
              </div>

              {filteredAtms.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <Banknote className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Nenhum caixa corresponde aos filtros selecionados
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tente aumentar a distância máxima ou desmarcar filtros específicos de acessibilidade.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        cashStatus: 'all',
                        bank: 'all',
                        wheelchairOnly: false,
                        audioGuidanceOnly: false,
                        brailleOnly: false,
                        searchQuery: '',
                        maxDistanceKm: 30,
                      })
                    }
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Redefinir Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[820px] pr-1">
                  {filteredAtms.map((atm) => (
                    <ATMCard
                      key={atm.id}
                      atm={atm}
                      isNearest={atm.id === nearestAtmId}
                      onSelect={(item) => setSelectedAtm(item)}
                      onOpenDirections={handleOpenDirections}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={handleShare}
                      onReportCash={handleReportCash}
                      isFavorite={user.favoriteAtmIds.includes(atm.id)}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Interactive Map (5 cols) */}
            <div className="lg:col-span-5 h-[450px] lg:h-auto sticky top-20">
              <ATMMap
                atms={filteredAtms}
                selectedAtm={selectedAtm}
                onSelectAtm={(atm) => setSelectedAtm(atm)}
                userLocation={userCoords}
                onCenterUser={handleCenterUser}
                lang={lang}
                theme={theme}
              />
            </div>
          </div>
        ) : viewMode === 'map' ? (
          /* Full Map View */
          <div className="w-full h-[750px] flex-1">
            <ATMMap
              atms={filteredAtms}
              selectedAtm={selectedAtm}
              onSelectAtm={(atm) => setSelectedAtm(atm)}
              userLocation={userCoords}
              onCenterUser={handleCenterUser}
              lang={lang}
              theme={theme}
            />
          </div>
        ) : (
          /* Full List View */
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>{filteredAtms.length} caixas encontrados</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAtms.map((atm) => (
                <ATMCard
                  key={atm.id}
                  atm={atm}
                  isNearest={atm.id === nearestAtmId}
                  onSelect={(item) => setSelectedAtm(item)}
                  onOpenDirections={handleOpenDirections}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={handleShare}
                  onReportCash={handleReportCash}
                  isFavorite={user.favoriteAtmIds.includes(atm.id)}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ATM Detail & Community Review Modal */}
      <ATMDetailModal
        atm={selectedAtm}
        onClose={() => setSelectedAtm(null)}
        onAddReview={handleAddReview}
        onToggleAlert={handleToggleAlert}
        onShare={(atm) => handleShare(atm)}
        lang={lang}
      />

      {/* Admin Monitoring & PDF Reporting Panel */}
      <AdminPanel
        atms={atms}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onUpdateATM={handleUpdateATM}
        cloudBackup={cloudBackup}
        onSyncCloud={handleSyncCloud}
        lang={lang}
      />

      {/* User Authentication & Biometrics Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          saveStoredUser(updated);
        }}
        lang={lang}
      />

      {/* Push Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          const marked = notifications.map((n) => ({ ...n, read: true }));
          setNotifications(marked);
          saveStoredNotifications(marked);
        }}
        onClearAll={() => {
          setNotifications([]);
          saveStoredNotifications([]);
        }}
        onSelectNotification={(atmId) => {
          const target = atms.find((a) => a.id === atmId);
          if (target) setSelectedAtm(target);
        }}
        user={user}
        onUpdateUserSettings={(newSettings) => {
          const updatedUser = { ...user, notificationSettings: newSettings };
          setUser(updatedUser);
          saveStoredUser(updatedUser);
        }}
        lang={lang}
      />

      {/* Social Media Sharing Modal */}
      <ShareModal
        atm={sharingAtm}
        onClose={() => setSharingAtm(null)}
        lang={lang}
      />
    </div>
  );
}
