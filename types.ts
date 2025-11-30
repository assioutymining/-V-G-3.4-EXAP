
export enum UserRole {
  ADMIN = 'Admin',
  LIMITED = 'Limited'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  lastLogin: string;
}

export type TransactionType = 'BUY' | 'SELL' | 'ANALYSIS' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  customerName?: string;
  description?: string;
  weight?: number;
  karat?: number;
  pricePerGram?: number;
  totalAmount: number;
  technicianId?: string;
  isPaid: boolean;
  discount?: number;
  details?: any;
}

export interface Employee {
  id: string;
  name: string;
  code: string;
  jobTitle: string;
  phone: string;
  email?: string;
}

export interface Partner {
  id: string;
  name: string;
  capital: number;
  percentage: number;
}

export interface Permission {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  destination: string;
  items: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface PrintSettings {
  companyName: string;
  companyAddress: string;
  contactNumber: string;
  taxNumber: string;
  commercialRegister: string;
  
  // Appearance & Colors
  primaryColor: string;
  dataTextColor?: string;
  headerTextColor?: string;
  subHeaderTextColor?: string;
  labelTextColor?: string;
  borderColor?: string;
  
  footerText: string;
  logoUrl?: string;
  paperSize?: 'A4' | 'A5' | 'RECEIPT' | '1015'; // 1015 = 10cm x 15cm
}

export interface DashboardSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
}

export interface GoogleDriveSettings {
  clientId: string;
  apiKey: string;
  lastBackup?: string;
}

export interface Settings {
  priceSource: 'MANUAL' | 'LIVE';
  goldPrice24: number;
  goldPrice21: number;
  goldPrice18: number;
  exchangeRate?: number;
  taxRate: number;
  currency: string;
  printSettings: PrintSettings;
  dashboard?: DashboardSettings;
  googleDrive?: GoogleDriveSettings;
}

// Market Data Interface
export interface MarketData {
    gold24: number;
    gold21: number;
    gold18: number;
    usd: number;
    ouncePriceUSD?: number;
    source: string;
}

// IPTV Channel Interface
export interface Channel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

// Global Augmentation
declare global {
  interface Window {
    Hls: any;
  }
}
