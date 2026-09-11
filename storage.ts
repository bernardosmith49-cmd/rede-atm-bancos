import { ATMItem, ATMReview, MaintenanceRecord, UserProfile, PushNotification, CloudBackupState } from '../types';
import { INITIAL_ATMS } from '../data/mockAtms';
import { jsPDF } from 'jspdf';

const STORAGE_KEYS = {
  ATMS: 'rede_atm_data_v2',
  USER: 'rede_atm_user_session',
  NOTIFICATIONS: 'rede_atm_notifications',
  BACKUP: 'rede_atm_cloud_backup',
  THEME: 'rede_atm_theme',
  LANG: 'rede_atm_lang',
  OFFLINE_CACHE_TIME: 'rede_atm_offline_cache_time',
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr-default',
  name: 'Bernardo Martins',
  email: 'bsmartelolabel@gmail.com',
  role: 'admin', // defaulted to admin so all monitoring and reporting capabilities are immediately accessible!
  biometricEnabled: true,
  favoriteAtmIds: ['atm-004'],
  notificationSettings: {
    outOfCashAlerts: true,
    restockAlerts: true,
    maintenanceAlerts: true,
    soundEnabled: true,
    distanceThresholdKm: 5,
  },
};

export function getStoredATMs(): ATMItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATMS, JSON.stringify(INITIAL_ATMS));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_CACHE_TIME, new Date().toISOString());
      return INITIAL_ATMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load ATMs from localStorage', err);
    return INITIAL_ATMS;
  }
}

export function saveStoredATMs(atms: ATMItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATMS, JSON.stringify(atms));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_CACHE_TIME, new Date().toISOString());
  } catch (err) {
    console.error('Failed to save ATMs to localStorage', err);
  }
}

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user', err);
  }
}

export function getStoredNotifications(): PushNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const initialNotes: PushNotification[] = [
        {
          id: 'notif-1',
          atmId: 'atm-005',
          atmName: 'Banco Sol Alvalade',
          type: 'out_of_cash',
          title: 'Alerta: ATM Esgotado!',
          message: 'O caixa eletrônico Banco Sol Alvalade acabou de ficar sem cédulas disponíveis.',
          timestamp: 'Há 12 min',
          read: false,
          urgent: true,
        },
        {
          id: 'notif-2',
          atmId: 'atm-001',
          atmName: 'Banco Nacional - Sede Mutamba',
          type: 'restocked',
          title: 'Reabastecimento Concluído',
          message: 'Banco Nacional Mutamba foi reabastecido com 14.500.000 Kz (notas de 5.000 e 2.000 Kz).',
          timestamp: 'Há 25 min',
          read: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredNotifications(notifications: PushNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

export function getStoredCloudBackup(): CloudBackupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP);
    if (!raw) {
      return {
        lastBackupTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'success',
        totalSyncedAtms: INITIAL_ATMS.length,
        totalReviews: INITIAL_ATMS.reduce((acc, curr) => acc + curr.reviews.length, 0),
        version: 'v2.4.0',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      lastBackupTime: new Date().toISOString(),
      status: 'success',
      totalSyncedAtms: INITIAL_ATMS.length,
      totalReviews: 8,
      version: 'v2.4.0',
    };
  }
}

export function saveStoredCloudBackup(backup: CloudBackupState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
  } catch (err) {
    console.error('Failed to save cloud backup state', err);
  }
}

export function getOfflineCacheTime(): string {
  return localStorage.getItem(STORAGE_KEYS.OFFLINE_CACHE_TIME) || new Date().toISOString();
}

/**
 * Generates an automated PDF Report for Monthly ATM usage & Cash availability
 */
export function generateMonthlyUsagePDF(atms: ATMItem[]): void {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Header banner
  doc.setFillColor(4, 120, 87); // Emerald dark
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('REDE NACIONAL DE ATMS & BANCOS', 14, 16);
  doc.setFontSize(10);
  doc.text('RELATÓRIO MENSAL DE DISPONIBILIDADE DE DINHEIRO & MONITORAMENTO', 14, 24);

  // Metadata
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Data de Emissão: ${dateStr}`, 14, 40);
  doc.text(`Responsável Técnico: Auditoria de Sistemas de Pagamento`, 14, 46);
  doc.text(`Estado da Rede: Sincronizada em Tempo Real`, 14, 52);

  // Summary Metrics Box
  const total = atms.length;
  const withCash = atms.filter(a => a.status === 'available').length;
  const lowCash = atms.filter(a => a.status === 'low_cash').length;
  const outOfCash = atms.filter(a => a.status === 'out_of_cash').length;
  const inMaint = atms.filter(a => a.status === 'maintenance').length;
  const totalBalance = atms.reduce((sum, a) => sum + a.estimatedBalanceKz, 0);

  doc.setFillColor(243, 244, 246);
  doc.rect(14, 58, 182, 30, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(14, 58, 182, 30, 'S');

  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(`Total de Caixas Monitorados: ${total}`, 20, 68);
  doc.text(`Disponíveis c/ Dinheiro: ${withCash} (${Math.round((withCash / total) * 100)}%)`, 20, 75);
  doc.text(`Saldo Crítico / Baixo: ${lowCash}`, 20, 82);

  doc.text(`Sem Dinheiro: ${outOfCash}`, 110, 68);
  doc.text(`Em Manutenção Técnica: ${inMaint}`, 110, 75);
  doc.text(`Total em Cofres: ${totalBalance.toLocaleString('pt-AO')} Kz`, 110, 82);

  // Table header
  let y = 100;
  doc.setFillColor(4, 120, 87);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('CÓDIGO', 16, y + 5.5);
  doc.text('NOME / BANCO', 42, y + 5.5);
  doc.text('ESTADO', 98, y + 5.5);
  doc.text('SALDO ESTIMADO', 128, y + 5.5);
  doc.text('FILA', 168, y + 5.5);
  doc.text('AVAL.', 184, y + 5.5);

  y += 9;
  doc.setFontSize(8);

  atms.forEach((atm, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, y - 4, 182, 7.5, 'F');
    }

    doc.setTextColor(31, 41, 55);
    doc.text(atm.code, 16, y + 1.5);

    const nameTruncated = atm.name.length > 28 ? atm.name.substring(0, 26) + '...' : atm.name;
    doc.text(nameTruncated, 42, y + 1.5);

    const statusText =
      atm.status === 'available'
        ? 'DISPONÍVEL'
        : atm.status === 'low_cash'
        ? 'SALDO BAIXO'
        : atm.status === 'out_of_cash'
        ? 'SEM DINHEIRO'
        : 'MANUTENÇÃO';
    
    // Status color
    if (atm.status === 'available') doc.setTextColor(4, 120, 87);
    else if (atm.status === 'low_cash') doc.setTextColor(217, 119, 6);
    else if (atm.status === 'out_of_cash') doc.setTextColor(220, 38, 38);
    else doc.setTextColor(107, 114, 128);

    doc.text(statusText, 98, y + 1.5);

    doc.setTextColor(31, 41, 55);
    doc.text(`${(atm.estimatedBalanceKz / 1000000).toFixed(1)}M Kz`, 128, y + 1.5);
    doc.text(`${atm.queueWaitMinutes} min (${atm.queueLength}p)`, 168, y + 1.5);
    doc.text(`${atm.ratings.average.toFixed(1)}★`, 184, y + 1.5);

    y += 8;
  });

  // Footer notes & signature
  y += 10;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Este documento foi emitido e assinado digitalmente pelo Sistema Central de Monitoramento Bancário.', 14, y);
  doc.text('Relatório gerado em conformidade com as diretrizes de transparência de meios de pagamento.', 14, y + 5);

  doc.save(`Relatorio_ATM_Disponibilidade_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Creates and triggers a calendar event (Apple, Google, Outlook .ICS download or Google Calendar Web URL)
 */
export function addToCalendarEvent(atm: ATMItem, reminderType: 'withdrawal' | 'maintenance'): void {
  const title = reminderType === 'maintenance' 
    ? `Manutenção Técnica - ${atm.code} ${atm.name}` 
    : `Verificar Dinheiro & Saque no ATM - ${atm.name}`;

  const description = `Caixa: ${atm.name} (${atm.bankName})\nEndereço: ${atm.address}\nStatus Atual: ${atm.status}\nNotas Disponíveis: ${atm.availableDenominations.join(', ')} Kz\nFila estimada: ${atm.queueWaitMinutes} minutos.`;

  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min event

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  // Build .ics calendar file
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rede ATM Angola//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${atm.address}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ATM_Lembrete_${atm.code}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
