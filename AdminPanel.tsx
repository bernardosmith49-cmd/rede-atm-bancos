import React, { useState } from 'react';
import { ATMItem, CloudBackupState, MaintenanceRecord } from '../types';
import { translations } from '../i18n';
import { generateMonthlyUsagePDF, saveStoredCloudBackup } from '../services/storage';
import {
  FileText,
  Cloud,
  CloudUpload,
  RefreshCw,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Banknote,
  Wrench,
  BarChart3,
  Server,
  Download,
  PlusCircle,
  X,
} from 'lucide-react';

interface AdminPanelProps {
  atms: ATMItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateATM: (updated: ATMItem) => void;
  cloudBackup: CloudBackupState;
  onSyncCloud: () => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  atms,
  isOpen,
  onClose,
  onUpdateATM,
  cloudBackup,
  onSyncCloud,
  lang,
}) => {
  const t = translations[lang];
  const [selectedAtmId, setSelectedAtmId] = useState<string>(atms[0]?.id || '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState(false);
  const [maintDescription, setMaintDescription] = useState('');

  if (!isOpen) return null;

  const total = atms.length;
  const availableCount = atms.filter((a) => a.status === 'available').length;
  const lowCount = atms.filter((a) => a.status === 'low_cash').length;
  const outCount = atms.filter((a) => a.status === 'out_of_cash').length;
  const maintCount = atms.filter((a) => a.status === 'maintenance').length;
  const totalCashKz = atms.reduce((acc, curr) => acc + curr.estimatedBalanceKz, 0);
  const avgWait = Math.round(atms.reduce((acc, curr) => acc + curr.queueWaitMinutes, 0) / (total || 1));

  const selectedAtm = atms.find((a) => a.id === selectedAtmId) || atms[0];

  const handleQuickStatusChange = (status: ATMItem['status']) => {
    if (!selectedAtm) return;
    const updated: ATMItem = {
      ...selectedAtm,
      status,
      lastStatusUpdate: 'Agora mesmo (via Painel Admin)',
      estimatedBalanceKz:
        status === 'available'
          ? Math.max(selectedAtm.estimatedBalanceKz, 12000000)
          : status === 'low_cash'
          ? 1500000
          : 0,
      availableDenominations:
        status === 'available'
          ? [5000, 2000, 1000]
          : status === 'low_cash'
          ? [2000, 1000]
          : [],
    };
    onUpdateATM(updated);
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintDescription.trim() || !selectedAtm) return;

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'replenishment',
      description: maintDescription.trim(),
      technicianTeam: 'Equipe de Intervenção Rápida Central',
      status: 'completed',
    };

    const updated: ATMItem = {
      ...selectedAtm,
      maintenanceHistory: [newRecord, ...selectedAtm.maintenanceHistory],
      status: 'available',
      estimatedBalanceKz: 16000000,
      availableDenominations: [5000, 2000, 1000],
      lastReplenished: 'Agora mesmo',
      lastStatusUpdate: 'Agora mesmo',
    };

    onUpdateATM(updated);
    setMaintDescription('');
  };

  const handleExportPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      generateMonthlyUsagePDF(atms);
      setIsGeneratingPdf(false);
      setPdfSuccessMessage(true);
      setTimeout(() => setPdfSuccessMessage(false), 3500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Admin Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {t.adminPanel}
              </h2>
              <p className="text-xs text-slate-400">
                {t.adminTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-admin-pdf-export"
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Gerando...' : t.downloadPdfReport}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Download Notice */}
        {pdfSuccessMessage && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.adminReportGenerated} O download do arquivo PDF foi iniciado.</span>
          </div>
        )}

        {/* Admin Content Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Real-time Fleet Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t.totalAtms}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {total}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">100% online</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                {t.activeCashRate}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {availableCount}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  ({Math.round((availableCount / total) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                {t.criticalAtms}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
                  {outCount}
                </span>
                <span className="text-xs text-rose-500 font-semibold">Urgência de Refil</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Liquidez em Cofres
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {(totalCashKz / 1000000).toFixed(1)}M Kz
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Fleet Controller */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Gestão da Frota de ATMs em Tempo Real</span>
              </h3>
              <span className="text-xs text-slate-400">
                Selecione um ATM para alterar o status ou injetar saldo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ATM selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Terminal Selecionado:
                </label>
                <select
                  value={selectedAtmId}
                  onChange={(e) => setSelectedAtmId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {atms.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.code}] {a.name} ({a.status.toUpperCase()})
                    </option>
                  ))}
                </select>

                {selectedAtm && (
                  <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div>
                      <strong>Banco:</strong> {selectedAtm.bankName}
                    </div>
                    <div>
                      <strong>Saldo Atual:</strong>{' '}
                      <span className="text-emerald-600 font-bold">
                        {selectedAtm.estimatedBalanceKz.toLocaleString('pt-AO')} Kz
                      </span>
                    </div>
                    <div>
                      <strong>Status Operacional:</strong>{' '}
                      <span className="font-semibold">{selectedAtm.status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Ação Rápida de Operação:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickStatusChange('available')}
                    className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.quickRestock}</span>
                  </button>

                  <button
                    onClick={() => handleQuickStatusChange('out_of_cash')}
                    className="p-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex flex-col items-center justify-center gap-1"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>{t.quickMarkEmpty}</span>
                  </button>

                  <button
                    onClick={() => handleQuickStatusChange('maintenance')}
                    className="p-2 rounded-xl bg-slate-600 text-white text-xs font-bold hover:bg-slate-700 transition flex flex-col items-center justify-center gap-1"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{t.quickMaintenance}</span>
                  </button>
                </div>

                {/* Dispatch Refill Team */}
                <form onSubmit={handleAddMaintenance} className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Registrar abastecimento ou ordem de serviço..."
                      value={maintDescription}
                      onChange={(e) => setMaintDescription(e.target.value)}
                      className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Cloud Real-time Backup and Synchronization Section */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.cloudBackupSynced}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Último backup em nuvem:{' '}
                <strong>
                  {cloudBackup.lastBackupTime
                    ? new Date(cloudBackup.lastBackupTime).toLocaleTimeString('pt-AO')
                    : 'Hoje'}
                </strong>{' '}
                • {cloudBackup.totalSyncedAtms} ATMs sincronizados em tempo real.
              </p>
            </div>

            <button
              id="btn-trigger-cloud-sync"
              onClick={onSyncCloud}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              <span>{t.syncNow}</span>
            </button>
          </div>
        </div>

        {/* Admin Footer */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Módulo Administrativo BNA / EMIS v2.4 • Criptografia e Registro Seguro
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
