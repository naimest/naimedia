export interface Client {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
}

export interface Slot {
  id: string;
  clientId: string | null; // null if empty
  expiryDate: string | null; // ISO 8601 YYYY-MM-DD
  status: 'active' | 'expiring_soon' | 'expired' | 'empty';
}

export interface Account {
  id: string;
  serviceName: string; // Netflix, Spotify
  email: string;
  password?: string;
  expiryDate: string; // Master account billing expiry
  totalSlots: number;
  slots: Slot[];
  notes?: string;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface DashboardStats {
  totalAccounts: number;
  totalSlots: number;
  usedSlots: number;
  activeClients: number;
  expiringSlots: number;
  expiringMasters: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ACCOUNTS = 'ACCOUNTS',
  CLIENTS = 'CLIENTS',
  SMART_ADD = 'SMART_ADD',
  SETTINGS = 'SETTINGS'
}