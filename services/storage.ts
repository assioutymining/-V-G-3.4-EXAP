
import { Transaction, Employee, Partner, Settings, Permission, User, UserRole, PrintSettings, DashboardSettings } from '../types';
import { EmailService } from './email';

// Keys
const KEY_TRANSACTIONS = 'pg_transactions';
const KEY_EMPLOYEES = 'pg_employees';
const KEY_PARTNERS = 'pg_partners';
const KEY_SETTINGS = 'pg_settings';
const KEY_PERMISSIONS = 'pg_permissions';
const KEY_USERS = 'pg_users';
const KEY_COUNTERS = 'pg_counters';

// Initial Data
const initialPrintSettings: PrintSettings = {
  companyName: 'بيراميدز جولد',
  companyAddress: 'القاهرة، الصاغة، ممر 3',
  contactNumber: '010-0000-0000',
  taxNumber: '987-654',
  commercialRegister: '123456',
  primaryColor: '#000000',
  dataTextColor: '#000000',
  headerTextColor: '#000000',
  subHeaderTextColor: '#000000',
  labelTextColor: '#000000',
  borderColor: '#000000',
  footerText: 'تم استخراج هذا المستند إلكترونياً من نظام بيراميدز جولد | Pyramids Gold System v2.0',
  paperSize: 'A5',
  logoUrl: ''
};

const initialDashboardSettings: DashboardSettings = {
  heroTitle: 'بيراميدز جولد',
  heroSubtitle: 'الحل المتكامل لإدارة عمليات التحليل، البيع، والشراء في أسواق الذهب والمعادن الثمينة بأحدث التقنيات.',
  heroImage: 'https://images.unsplash.com/photo-1605218427368-35b8113d18be?q=80&w=2000&auto=format&fit=crop'
};

const initialSettings: Settings = {
  priceSource: 'LIVE', 
  goldPrice24: 3100,
  goldPrice21: 2700,
  goldPrice18: 2300,
  exchangeRate: 50.5,
  taxRate: 0,
  currency: 'EGP',
  printSettings: initialPrintSettings,
  dashboard: initialDashboardSettings,
  googleDrive: {
    clientId: '',
    apiKey: '',
    lastBackup: ''
  }
};

const initialEmployees: Employee[] = [
  { id: '1', name: 'أحمد محمد', code: 'EMP001', jobTitle: 'فني فحص', phone: '0100000001', email: 'ahmed@pg.com' },
  { id: '2', name: 'سارة علي', code: 'EMP002', jobTitle: 'محاسب', phone: '0100000002', email: 'sara@pg.com' }
];

const initialPartners: Partner[] = [
  { id: '1', name: 'محمود المصري', capital: 5000000, percentage: 40 },
  { id: '2', name: 'خالد يوسف', capital: 3000000, percentage: 25 }
];

const initialUsers: User[] = [
  { id: '1', username: 'aadd', password: '2026', role: UserRole.ADMIN, lastLogin: '' },
  { id: '2', username: 'aa20', password: '2020', role: UserRole.LIMITED, lastLogin: '' }
];

export const storage = {
  // ID Generation Logic
  generateId: (type: string): string => {
    const counters = JSON.parse(localStorage.getItem(KEY_COUNTERS) || '{}');
    const prefixMap: { [key: string]: string } = {
        'BUY': 'B', 'SELL': 'S', 'ANALYSIS': 'A', 'EXPENSE': 'E', 'PERMISSION': 'P'
    };
    const prefix = prefixMap[type] || 'G';
    const currentCount = counters[type] || 1000;
    const nextCount = currentCount + 1;
    counters[type] = nextCount;
    localStorage.setItem(KEY_COUNTERS, JSON.stringify(counters));
    return `${prefix}-${nextCount}`;
  },

  // Settings
  getSettings: (): Settings => {
    const data = localStorage.getItem(KEY_SETTINGS);
    if (!data) return initialSettings;
    try {
      const parsed = JSON.parse(data);
      return {
        ...initialSettings,
        ...parsed,
        printSettings: { ...initialSettings.printSettings, ...(parsed.printSettings || {}) },
        dashboard: { ...initialSettings.dashboard, ...(parsed.dashboard || {}) },
        googleDrive: { ...initialSettings.googleDrive, ...(parsed.googleDrive || {}) }
      };
    } catch (e) {
      return initialSettings;
    }
  },
  saveSettings: (settings: Settings) => {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  },
  
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEY_USERS);
    return data ? JSON.parse(data) : initialUsers;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  },
  addUser: (user: User) => {
    const current = storage.getUsers();
    storage.saveUsers([...current, user]);
  },
  updateUser: (updatedUser: User) => {
    const current = storage.getUsers();
    const index = current.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      current[index] = updatedUser;
      storage.saveUsers(current);
    }
  },
  deleteUser: (id: string) => {
    const current = storage.getUsers();
    storage.saveUsers(current.filter(u => u.id !== id));
  },
  
  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEY_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  addTransaction: (tx: Transaction) => {
    // 1. Save Locally
    const current = storage.getTransactions();
    localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify([tx, ...current]));
    
    // 2. Send Email Notification (Async)
    EmailService.sendTransaction(tx);
  },
  clearTransactions: () => {
    localStorage.removeItem(KEY_TRANSACTIONS);
    localStorage.removeItem(KEY_COUNTERS);
    localStorage.removeItem(KEY_PERMISSIONS);
  },

  // Employees
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(KEY_EMPLOYEES);
    return data ? JSON.parse(data) : initialEmployees;
  },
  saveEmployees: (emps: Employee[]) => {
    localStorage.setItem(KEY_EMPLOYEES, JSON.stringify(emps));
  },
  addEmployee: (emp: Employee) => {
    const current = storage.getEmployees();
    storage.saveEmployees([...current, emp]);
  },
  updateEmployee: (updatedEmp: Employee) => {
    const current = storage.getEmployees();
    const index = current.findIndex(e => e.id === updatedEmp.id);
    if (index !== -1) {
      current[index] = updatedEmp;
      storage.saveEmployees(current);
    }
  },
  deleteEmployee: (id: string) => {
    const current = storage.getEmployees();
    storage.saveEmployees(current.filter(e => e.id !== id));
  },

  // Partners
  getPartners: (): Partner[] => {
    const data = localStorage.getItem(KEY_PARTNERS);
    return data ? JSON.parse(data) : initialPartners;
  },
  savePartners: (partners: Partner[]) => {
    localStorage.setItem(KEY_PARTNERS, JSON.stringify(partners));
  },
  addPartner: (p: Partner) => {
    const current = storage.getPartners();
    storage.savePartners([...current, p]);
  },
  deletePartner: (id: string) => {
    const current = storage.getPartners();
    storage.savePartners(current.filter(p => p.id !== id));
  },

  // Permissions
  getPermissions: (): Permission[] => {
    const data = localStorage.getItem(KEY_PERMISSIONS);
    return data ? JSON.parse(data) : [];
  },
  addPermission: (p: Permission) => {
    const current = storage.getPermissions();
    localStorage.setItem(KEY_PERMISSIONS, JSON.stringify([p, ...current]));
  },
  deletePermission: (id: string) => {
    const current = storage.getPermissions();
    localStorage.setItem(KEY_PERMISSIONS, JSON.stringify(current.filter(p => p.id !== id)));
  },
  
  // Backup Logic
  getFullBackupData: () => {
    return {
      settings: storage.getSettings(),
      users: storage.getUsers(),
      transactions: storage.getTransactions(),
      employees: storage.getEmployees(),
      partners: storage.getPartners(),
      permissions: storage.getPermissions(),
      counters: JSON.parse(localStorage.getItem(KEY_COUNTERS) || '{}'),
      timestamp: new Date().toISOString()
    };
  },
  
  restoreFromData: (data: any, callback: (success: boolean) => void) => {
    try {
      if (!data) throw new Error("No data provided");
      
      // Validate critical keys
      if (data.settings) localStorage.setItem(KEY_SETTINGS, JSON.stringify(data.settings));
      if (data.users) localStorage.setItem(KEY_USERS, JSON.stringify(data.users));
      if (data.transactions) localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.employees) localStorage.setItem(KEY_EMPLOYEES, JSON.stringify(data.employees));
      if (data.partners) localStorage.setItem(KEY_PARTNERS, JSON.stringify(data.partners));
      if (data.permissions) localStorage.setItem(KEY_PERMISSIONS, JSON.stringify(data.permissions));
      if (data.counters) localStorage.setItem(KEY_COUNTERS, JSON.stringify(data.counters));
      
      callback(true);
    } catch (err) {
      console.error("Restore failed:", err);
      callback(false);
    }
  },

  createBackup: () => {
    try {
        const backup = storage.getFullBackupData();
        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PyramidsGold_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Backup failed", e);
        alert("فشل إنشاء النسخة الاحتياطية");
    }
  },
  
  restoreBackup: (file: File, callback: (success: boolean) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storage.restoreFromData(data, callback);
      } catch (err) {
        console.error("Parse error", err);
        callback(false);
      }
    };
    reader.onerror = () => callback(false);
    reader.readAsText(file);
  }
};
