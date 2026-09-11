import React, { useState } from 'react';
import { ATMItem } from '../types';
import { translations } from '../i18n';
import {
  Share2,
  X,
  Copy,
  CheckCircle2,
  MessageCircle,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ShareModalProps {
  atm: ATMItem | null;
  onClose: () => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const ShareModal: React.FC<ShareModalProps> = ({ atm, onClose, lang }) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!atm) return null;

  const statusText =
    atm.status === 'available'
      ? 'COM DINHEIRO DISPONÍVEL 🟢'
      : atm.status === 'low_cash'
      ? 'SALDO BAIXO 🟡'
      : atm.status === 'out_of_cash'
      ? 'SEM DINHEIRO 🔴'
      : 'EM MANUTENÇÃO ⚙️';

  const notesText =
    atm.availableDenominations.length > 0
      ? `Notas: ${atm.availableDenominations.join(', ')} Kz`
      : 'Sem notas disponíveis';

  const shareText = `🏧 Status em Tempo Real: ${atm.name} (${atm.bankName}) está ${statusText}.\n${notesText} • Fila: ${atm.queueWaitMinutes} min.\nEndereço: ${atm.address}`;

  const currentUrl = window.location.href;
  const fullShareMessage = `${shareText}\n\nConfira no mapa: ${currentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.shareATM}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
            {shareText}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.shareWhatsApp}</span>
            </button>

            <button
              onClick={handleTelegram}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{t.shareTelegram}</span>
            </button>

            <button
              onClick={handleTwitter}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.shareTwitter}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copiedToClipboard : 'Copiar Texto e Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
