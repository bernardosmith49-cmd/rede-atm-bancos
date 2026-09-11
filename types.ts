export type CashStatus = 'available' | 'low_cash' | 'out_of_cash' | 'maintenance';

export interface OperatingHours {
  is24h: boolean;
  openTime: string;
  closeTime: string;
  openDays: string;
}

export interface AccessibilityFeatures {
  wheelchairRamp: boolean;
  audioGuidance: boolean;
  brailleKeyboard: boolean;
  securityGuard: boolean;
  driveThru: boolean;
  parking: boolean;
  airConditioned: boolean;
}

export interface ServicesOffered {
  withdraw: boolean;
  deposit: boolean;
  transfers: boolean;
  billPayments: boolean;
  exchange: boolean;
  statementPrint: boolean;
}

export interface ATMReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  cashStatusReport: 'has_cash' | 'no_cash' | 'low_cash' | 'jammed';
  tags: string[];
  comment: string;
  thumbsUp: number;
  verifiedUser: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'emergency' | 'scheduled' | 'replenishment' | 'hardware' | 'software';
  description: string;
  technicianTeam: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  nextScheduled?: string;
  notes?: string;
}

export interface ATMItem {
  id: string;
  code: string;
  name: string;
  bankName: string;
  bankCode: string;
  bankColor: string;
  type: 'atm' | 'branch_atm' | 'express_kiosk';
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  status: CashStatus;
  availableDenominations: number[]; // e.g. [5000, 2000, 1000]
  estimatedBalanceKz: number;
  maxWithdrawalLimitKz: number;
  queueLength: number; // people
  queueWaitMinutes: number;
  lastReplenished: string;
  lastStatusUpdate: string;
  operatingHours: OperatingHours;
  accessibility: AccessibilityFeatures;
  services: ServicesOffered;
  ratings: {
    average: number;
    totalCount: number;
    cashAccuracy: number;
    machineCondition: number;
    safetyScore: number;
  };
  reviews: ATMReview[];
  maintenanceHistory: MaintenanceRecord[];
  isFavorite?: boolean;
  notifyOutOfCash?: boolean;
  notifyReplenished?: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  cashStatus: 'all' | 'available' | 'low_or_available' | 'out_of_cash';
  bank: string;
  is24hOnly: boolean;
  openNowOnly: boolean;
  wheelchairOnly: boolean;
  audioGuidanceOnly: boolean;
  brailleOnly: boolean;
  depositOnly: boolean;
  hasSecurityGuard: boolean;
  maxDistanceKm: number;
  minRating: number;
  sortBy: 'distance' | 'cash_status' | 'queue' | 'rating';
}

export type LanguageCode = 'pt' | 'en' | 'fr' | 'es';

export type ThemeMode = 'emerald' | 'dark' | 'indigo' | 'high_contrast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'technician';
  biometricEnabled: boolean;
  favoriteAtmIds: string[];
  notificationSettings: {
    outOfCashAlerts: boolean;
    restockAlerts: boolean;
    maintenanceAlerts: boolean;
    soundEnabled: boolean;
    distanceThresholdKm: number;
  };
}

export interface PushNotification {
  id: string;
  atmId: string;
  atmName: string;
  type: 'out_of_cash' | 'restocked' | 'maintenance' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

export interface CloudBackupState {
  lastBackupTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  totalSyncedAtms: number;
  totalReviews: number;
  version: string;
}
