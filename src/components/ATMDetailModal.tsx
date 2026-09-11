import React, { useState } from 'react';
import { ATMItem, ATMReview, MaintenanceRecord } from '../types';
import { translations } from '../i18n';
import { addToCalendarEvent } from '../services/storage';
import {
  X,
  MapPin,
  Clock,
  Banknote,
  Navigation,
  Accessibility,
  Volume2,
  KeyRound,
  ShieldCheck,
  Share2,
  Calendar,
  Bell,
  Star,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Send,
  ExternalLink,
  Car,
  Wifi,
  Sparkles,
} from 'lucide-react';

interface ATMDetailModalProps {
  atm: ATMItem | null;
  onClose: () => void;
  onAddReview: (atmId: string, review: Omit<ATMReview, 'id' | 'thumbsUp' | 'verifiedUser'>) => void;
  onToggleAlert: (atmId: string, alertType: 'empty' | 'restock', enabled: boolean) => void;
  onShare: (atm: ATMItem) => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const ATMDetailModal: React.FC<ATMDetailModalProps> = ({
  atm,
  onClose,
  onAddReview,
  onToggleAlert,
  onShare,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'maintenance'>('info');

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [cashStatusReport, setCashStatusReport] = useState<'has_cash' | 'low_cash' | 'no_cash' | 'jammed'>('has_cash');
  const [userName, setUserName] = useState('');
  const [userComment, setUserComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Calendar notice
  const [calendarNotice, setCalendarNotice] = useState(false);

  if (!atm) return null;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim() && selectedTags.length === 0) return;

    onAddReview(atm.id, {
      userName: userName.trim() || 'Cidadão Verificado',
      rating: userRating,
      date: 'Agora mesmo',
      cashStatusReport,
      tags: selectedTags.length > 0 ? selectedTags : ['Verificado pela Comunidade'],
      comment: userComment.trim() || 'Situação reportada com sucesso.',
    });

    setFeedbackSuccess(true);
    setUserComment('');
    setSelectedTags([]);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setActiveTab('reviews');
    }, 1500);
  };

  const handleCalendarExport = (type: 'withdrawal' | 'maintenance') => {
    addToCalendarEvent(atm, type);
    setCalendarNotice(true);
    setTimeout(() => setCalendarNotice(false), 3000);
  };

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${atm.lat},${atm.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Header with Bank Accent */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
          style={{ borderTop: `4px solid ${atm.bankColor}` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase"
              style={{
                backgroundColor: `${atm.bankColor}18`,
                color: atm.bankColor,
              }}
            >
              {atm.bankCode}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {atm.name}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {atm.district} • Código {atm.code}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.specsTab}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>{t.reviewsTab}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {atm.reviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>{t.maintenanceTab}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {atm.maintenanceHistory.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* TAB 1: Real-time Cash, Specs & Accessibility */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Cash Availability Highlights Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Disponibilidade em Tempo Real
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    {atm.lastStatusUpdate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {t.availableDenominations}
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {atm.availableDenominations.length > 0
                        ? atm.availableDenominations.map((d) => `${d} Kz`).join(', ')
                        : 'Nenhuma nota disponível'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {t.estimatedBalance}
                    </span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {atm.estimatedBalanceKz > 0
                        ? `${atm.estimatedBalanceKz.toLocaleString('pt-AO')} Kz`
                        : '0 Kz'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {t.queueWait}
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {atm.queueWaitMinutes} min
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        ({atm.queueLength} pessoas)
                      </span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ℹ️ {t.replenishedAt}: <strong>{atm.lastReplenished}</strong>. Limite diário por cartão: 100.000 Kz.
                </p>
              </div>

              {/* Operating Hours & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-xs">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Horário de Funcionamento</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {atm.operatingHours.openDays}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {atm.operatingHours.is24h
                      ? 'Acesso ininterrupto 24h por dia.'
                      : `Das ${atm.operatingHours.openTime} às ${atm.operatingHours.closeTime}`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-xs">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Localização & Referência</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {atm.address}, {atm.city}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Coordenadas: {atm.lat.toFixed(4)}, {atm.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Accessibility Features Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t.accessibilityTitle}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.wheelchairRamp
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Accessibility className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Rampa Cadeirante</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.audioGuidance
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Áudio / Fones</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.brailleKeyboard
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Teclado Braille</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.securityGuard
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Segurança no Local</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.parking
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Estacionamento</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                      atm.accessibility.airConditioned
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cabine Climatizada</span>
                  </div>
                </div>
              </div>

              {/* Push Alerts Configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Alertas Push Personalizados para Este ATM
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {t.notifyWhenEmpty}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Receba um alerta instantâneo se a máquina esgotar as notas.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={atm.notifyOutOfCash ?? true}
                      onChange={(e) => onToggleAlert(atm.id, 'empty', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {t.notifyWhenRestocked}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Seja avisado assim que o carro blindado fizer a recarga.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={atm.notifyReplenished ?? true}
                      onChange={(e) => onToggleAlert(atm.id, 'restock', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Third-Party Calendar Integration & Social Share */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleCalendarExport('withdrawal')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{t.addToCalendar}</span>
                </button>

                <button
                  onClick={() => onShare(atm)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>{t.shareATM}</span>
                </button>

                <button
                  onClick={openGoogleMapsDirections}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition ml-auto"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navegar no Mapa</span>
                </button>
              </div>

              {calendarNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.eventAdded} Arquivo .ICS pronto para Google Agenda e Apple Calendar.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Community Reviews & Cash Report System */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Overall Ratings Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {atm.ratings.average.toFixed(1)}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 justify-center mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(atm.ratings.average)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {atm.ratings.totalCount} opiniões
                    </span>
                  </div>

                  <div className="hidden sm:block h-12 w-[1px] bg-slate-200 dark:bg-slate-700" />

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Saldo Preciso:</span>
                      <span className="font-bold text-emerald-600">{atm.ratings.cashAccuracy} / 5.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Teclado & Ecrã:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {atm.ratings.machineCondition} / 5.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Segurança:</span>
                      <span className="font-bold text-blue-600">{atm.ratings.safetyScore} / 5.0</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const formEl = document.getElementById('review-form-anchor');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  + Avaliar Máquina
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {atm.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {rev.userName}
                        </span>
                        {rev.verifiedUser && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold px-1.5 py-0.5 rounded">
                            Verificado
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">• {rev.date}</span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rev.cashStatusReport === 'has_cash'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : rev.cashStatusReport === 'no_cash'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {rev.cashStatusReport === 'has_cash'
                          ? '✓ Tem Dinheiro'
                          : rev.cashStatusReport === 'no_cash'
                          ? '✕ Sem Dinheiro'
                          : '⚠ Pouco Dinheiro'}
                      </span>

                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Útil ({rev.thumbsUp})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Evaluation & Cash Report Form */}
              <div
                id="review-form-anchor"
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t.addReview} / {t.reportStatus}
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Ajude a sua comunidade com dados reais
                  </span>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-3.5">
                  {/* Rating Stars */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t.yourRating}:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUserRating(s)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= userRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Status Question */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      {t.doesItHaveCash}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCashStatusReport('has_cash')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center gap-2 ${
                          cashStatusReport === 'has_cash'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.yesHasCash}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashStatusReport('low_cash')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center gap-2 ${
                          cashStatusReport === 'low_cash'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>{t.lowCashOption}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCashStatusReport('no_cash')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center gap-2 ${
                          cashStatusReport === 'no_cash'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t.noCashOption}</span>
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tags Rápidas sobre a Máquina:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Notas de 5.000 Kz',
                        'Notas de 2.000 Kz',
                        'Sem Fila',
                        'Fila Rápida',
                        'Comprovativo com Papel',
                        'Teclado Excelente',
                        'Ecrã Nítido',
                        'Segurança Presente',
                        'Sem Papel de Recibo',
                        'Teclado Lento',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            selectedTags.includes(tag)
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment input */}
                  <div>
                    <textarea
                      rows={2}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder={t.writeComment}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Seu nome (opcional)"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 w-44"
                    />

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.publishReport}</span>
                    </button>
                  </div>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Avaliação registrada com sucesso! Muito obrigado pela contribuição.</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Maintenance History */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.maintenanceHistoryTitle}
                </h4>
                <button
                  onClick={() => handleCalendarExport('maintenance')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar no Calendário</span>
                </button>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-5">
                {atm.maintenanceHistory.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Circle on timeline */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                        item.status === 'completed'
                          ? 'bg-emerald-500'
                          : item.status === 'in_progress'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-blue-500'
                      }`}
                    />

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                          {item.type === 'replenishment'
                            ? 'Carregamento de Numerário'
                            : item.type === 'hardware'
                            ? 'Reparo de Hardware'
                            : item.type === 'software'
                            ? 'Atualização de Sistema'
                            : 'Intervenção Preventiva'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>
                          {t.technicianTeam}: <strong>{item.technicianTeam}</strong>
                        </span>
                        <span>Data: {item.date}</span>
                      </div>

                      {item.nextScheduled && (
                        <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          📅 {t.scheduledNext}: {item.nextScheduled}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Rede Interbancária Nacional • EMIS / BNA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
