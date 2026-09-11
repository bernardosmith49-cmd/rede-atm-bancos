import React, { useState } from 'react';
import { UserProfile } from '../types';
import { translations } from '../i18n';
import {
  Fingerprint,
  Lock,
  Mail,
  User,
  Shield,
  CheckCircle2,
  X,
  ScanFace,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  lang: 'pt' | 'en' | 'fr' | 'es';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  lang,
}) => {
  const t = translations[lang];
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [biometricEnabled, setBiometricEnabled] = useState(currentUser.biometricEnabled);

  if (!isOpen) return null;

  const triggerBiometricScan = () => {
    setIsScanningBiometric(true);
    setBiometricSuccess(false);

    // Simulate authentic WebAuthn / FaceID scanning vibration & crypto response
    setTimeout(() => {
      setIsScanningBiometric(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        setBiometricSuccess(false);
      }, 2500);
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      role,
      biometricEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Autenticação Segura & Biometria</h3>
              <p className="text-xs text-white/80">Proteção de Dados Pessoais e Alertas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            Meu Perfil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            Biometria & Acesso
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          {activeTab === 'profile' ? (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nível de Privilégio
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="admin">Administrador Central (Acesso Total à Frota)</option>
                  <option value="technician">Técnico de Valores & Manutenção</option>
                  <option value="user">Usuário / Cidadão Comum</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Biometric Interactive Scanner Widget */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={triggerBiometricScan}
                    disabled={isScanningBiometric}
                    className={`relative p-5 rounded-full transition-all duration-300 ${
                      biometricSuccess
                        ? 'bg-emerald-500 text-white ring-8 ring-emerald-100 dark:ring-emerald-950'
                        : isScanningBiometric
                        ? 'bg-amber-500 text-white animate-pulse ring-8 ring-amber-100 dark:ring-amber-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 ring-4 ring-slate-200 dark:ring-slate-700'
                    }`}
                  >
                    {biometricSuccess ? (
                      <CheckCircle2 className="w-10 h-10" />
                    ) : (
                      <Fingerprint className="w-10 h-10" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {biometricSuccess
                      ? 'Autenticação Biométrica Verificada!'
                      : isScanningBiometric
                      ? 'Lendo impressão digital / Face ID...'
                      : 'Toque para testar Biometria'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Compatível com Touch ID, Face ID e Chaves FIDO2 de hardware.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Ativar Biometria ao Abrir o App
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Exigir impressão digital para dados sensíveis e alertas.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
