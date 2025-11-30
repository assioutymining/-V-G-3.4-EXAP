import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, LogOut, Settings as SettingsIcon, Users, Beaker, ShoppingCart, 
  Banknote, Calculator, BadgePercent, Truck, FileText, PieChart, Monitor, Wifi, 
  WifiOff, Globe, Activity, UserCircle, Printer, Tv, Lock, RefreshCw, Menu, X
} from 'lucide-react';
import { User, UserRole, Transaction, Settings as SettingsType, MarketData } from './types';
import { storage } from './services/storage';
import { MarketService } from './services/market';

// Components
import { LoginScreen } from './components/LoginScreen';
import { AnimatedLogo } from './components/AnimatedLogo';
import { PrintableDocument } from './components/PrintableDocument';

// Views
import { Dashboard } from './views/Dashboard';
import { UserDashboard } from './views/UserDashboard';
import { OperationForm } from './views/OperationForm';
import { PricingCalculator } from './views/PricingCalculator';
import { ExpensesView } from './views/ExpensesView';
import { EmployeesView } from './views/EmployeesView';
import { PartnersView } from './views/PartnersView';
import { PermissionsView } from './views/PermissionsView';
import { ReportsView } from './views/ReportsView';
import { CCTVView } from './views/CCTVView';
import { SettingsPanel } from './views/SettingsPanel';
import { ProfitDetailsView } from './views/ProfitDetailsView';
import { FollowUpView } from './views/FollowUpView';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
  const [reprintTransaction, setReprintTransaction] = useState<Transaction | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Mobile Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Live Data State
  const [liveData, setLiveData] = useState<MarketData | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  // Derived Settings (Merge Manual with Live if Enabled)
  const activeSettings = useMemo(() => {
     if (settings.priceSource === 'LIVE' && liveData) {
        return {
           ...settings,
           goldPrice24: liveData.gold24,
           goldPrice21: liveData.gold21,
           goldPrice18: liveData.gold18,
           exchangeRate: liveData.usd,
           ouncePriceUSD: liveData.ouncePriceUSD
        };
     }
     return settings;
  }, [settings, liveData]);

  const fetchPrices = async () => {
    if(!navigator.onLine || settings.priceSource !== 'LIVE') return;
    
    setIsLoadingPrices(true);
    try {
        const data = await MarketService.getLivePrices();
        if (data) {
            setLiveData(data);
        }
    } catch (error) {
        console.error("Failed to fetch live prices", error);
    } finally {
        setIsLoadingPrices(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setTransactions(storage.getTransactions());
    
    fetchPrices(); // Initial Fetch
    const interval = setInterval(fetchPrices, 60000); // Update every 1 min

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [settings.priceSource]);

  const handleLogout = () => setUser(null);

  const handleSaveTransaction = (t: Transaction) => {
    storage.addTransaction(t);
    setTransactions(storage.getTransactions());
  };

  const handleUpdateSettings = (s: SettingsType) => {
    storage.saveSettings(s);
    setSettings(s);
    if (s.priceSource === 'MANUAL') setLiveData(null);
    else fetchPrices(); // Fetch immediately if switched to LIVE
  };
  
  const handleNavigate = (viewId: string) => {
    setView(viewId);
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  const marketAdvice = useMemo(() => {
     const diff = activeSettings.goldPrice24 - settings.goldPrice24;
     if (settings.priceSource === 'LIVE') {
        if (diff > 50) return { type: 'sell', text: 'ارتفاع (بيع)', color: 'text-green-400' };
        if (diff < -50) return { type: 'buy', text: 'انخفاض (شراء)', color: 'text-blue-400' };
     }
     return { type: 'stable', text: 'مستقر', color: 'text-zinc-400' };
  }, [activeSettings.goldPrice24, settings.goldPrice24, settings.priceSource]);

  // Ticker Items
  const tickerItems = useMemo(() => [
      { id: 't1', label: '24K', val: activeSettings.goldPrice24.toLocaleString(), up: true },
      { id: 't2', label: '21K', val: activeSettings.goldPrice21.toLocaleString(), up: true },
      { id: 't3', label: 'USD', val: activeSettings.exchangeRate?.toFixed(2) || '0.00', up: false },
  ], [activeSettings]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Strict Menu Permissions
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, role: 'all' },
    { id: 'analysis', label: 'التحليل والفحص', icon: Beaker, role: 'all' },
    { id: 'buy', label: 'شراء ذهب', icon: ShoppingCart, role: 'all' },
    { id: 'sell', label: 'بيع ذهب', icon: BadgePercent, role: 'all' },
    { id: 'cctv', label: 'كاميرات المراقبة', icon: Monitor, role: UserRole.ADMIN },
    { id: 'followup', label: 'شاشة البورصة', icon: Tv, role: UserRole.ADMIN },
    { id: 'pricing', label: 'حاسبة التحيف', icon: Calculator, role: UserRole.ADMIN },
    { id: 'profit-details', label: 'تفاصيل الأرباح', icon: PieChart, role: UserRole.ADMIN },
    { id: 'expenses', label: 'المصاريف', icon: Banknote, role: UserRole.ADMIN },
    { id: 'employees', label: 'الموظفين', icon: Users, role: UserRole.ADMIN },
    { id: 'partners', label: 'الشركاء', icon: UserCircle, role: UserRole.ADMIN },
    { id: 'permissions', label: 'التصاريح', icon: Truck, role: UserRole.ADMIN },
    { id: 'reports', label: 'التقارير', icon: FileText, role: UserRole.ADMIN },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon, role: UserRole.ADMIN },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dark-bg text-white font-sans selection:bg-gold-500 selection:text-black">
      
      {/* Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0"></div>

      {/* Header Mobile & Desktop */}
      <header className="h-16 bg-zinc-900/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 shadow-md z-30 no-print flex-shrink-0">
            <div className="flex items-center gap-3">
               {/* Mobile Menu Button */}
               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                 className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
               >
                 <Menu className="w-6 h-6" />
               </button>

               <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${isOnline ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
               </div>
            </div>
            
            <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 gap-2 mx-2">
               <Activity className={`w-4 h-4 ${marketAdvice.color}`} />
               <span className={`text-xs font-bold whitespace-nowrap ${marketAdvice.color}`}>{marketAdvice.text}</span>
            </div>

            <div className="flex items-center gap-3">
               {/* Live Price Source Indicator */}
               <div className="text-right flex items-center gap-2">
                    {settings.priceSource === 'LIVE' && (
                      <button 
                        onClick={fetchPrices}
                        disabled={isLoadingPrices}
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 hover:text-gold-500 transition-colors hidden sm:flex"
                      >
                         <RefreshCw className={`w-4 h-4 ${isLoadingPrices ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                    <div>
                        <div className="text-[8px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 justify-end">
                            {settings.priceSource === 'LIVE' ? <Globe className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-yellow-500" />}
                            <span className="hidden sm:inline">{settings.priceSource === 'LIVE' ? 'LIVE FEED' : 'MANUAL'}</span>
                        </div>
                        <div className={`text-base md:text-lg font-black font-mono leading-none ${settings.priceSource === 'LIVE' ? 'text-white' : 'text-gold-400'}`}>
                        {activeSettings.goldPrice24.toLocaleString()} <span className="text-[10px] text-zinc-500">EGP</span>
                        </div>
                    </div>
               </div>
            </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Mobile Sidebar Overlay (Z-40 to cover content, Sidebar is Z-50) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
            fixed lg:static inset-y-0 right-0 z-50 w-72 lg:w-64 
            bg-zinc-900/95 backdrop-blur-xl border-l border-white/5 
            flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            no-print
        `}>
          <div className="p-6 flex items-center justify-between lg:justify-center border-b border-white/10 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50">
             <div className="flex items-center">
                <div className="mr-3">
                    <AnimatedLogo size="small" />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-wider text-gold-100">PYRAMIDS</h1>
                  <span className="text-xs text-gold-500 tracking-[0.2em]">GOLD SYSTEM</span>
                </div>
             </div>
             {/* Close Button Mobile */}
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
             </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
            {menuItems.filter(item => item.role === 'all' || item.role === user.role).map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center px-6 py-3 transition-all duration-200 border-r-2 group ${
                  view === item.id 
                    ? 'bg-gold-500/10 border-gold-500 text-gold-400' 
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ml-3 transition-colors ${view === item.id ? 'text-gold-500' : 'group-hover:text-gold-300'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center ml-2 border border-zinc-600">
                <UserCircle className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.username}</div>
                <div className="text-[10px] text-gold-500/80 uppercase tracking-wider">{user.role === UserRole.ADMIN ? 'Admin' : 'Staff'}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors border border-red-900/30 text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="w-3 h-3 ml-2" />
              خروج
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] w-full">
          
          <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth relative print:bg-white print:text-black print:p-0 custom-scrollbar">
            
            {reprintTransaction && (
               <PrintableDocument 
                  data={reprintTransaction}
                  type={reprintTransaction.type}
                  settings={activeSettings}
                  onClose={() => setReprintTransaction(null)}
               />
            )}
            
            <div className="relative z-10 w-full max-w-7xl mx-auto print:max-w-full pb-10">
              
              {/* Conditional Dashboard Logic with ACTIVE SETTINGS */}
              {view === 'dashboard' && user.role === UserRole.ADMIN && <Dashboard transactions={transactions} settings={activeSettings} onNavigate={handleNavigate} />}
              {view === 'dashboard' && user.role === UserRole.LIMITED && <UserDashboard settings={activeSettings} onNavigate={handleNavigate} />}
              
              {/* Core Operations use ACTIVE SETTINGS (Live if enabled) */}
              {view === 'analysis' && <OperationForm type="ANALYSIS" settings={activeSettings} onSave={handleSaveTransaction} />}
              {view === 'buy' && <OperationForm type="BUY" settings={activeSettings} onSave={handleSaveTransaction} />}
              {view === 'sell' && <OperationForm type="SELL" settings={activeSettings} onSave={handleSaveTransaction} />}
              
              {/* Admin Restricted Views */}
              {user.role === UserRole.ADMIN && (
                <>
                  {view === 'cctv' && <CCTVView />}
                  {view === 'followup' && <FollowUpView />}
                  {view === 'pricing' && <PricingCalculator settings={activeSettings} />}
                  {view === 'profit-details' && <ProfitDetailsView transactions={transactions} settings={activeSettings} />}
                  {view === 'expenses' && <ExpensesView settings={activeSettings} onSave={handleSaveTransaction} />}
                  {view === 'employees' && <EmployeesView />}
                  {view === 'partners' && <PartnersView transactions={transactions} />}
                  {view === 'permissions' && <PermissionsView />}
                  {view === 'reports' && <ReportsView transactions={transactions} />}
                  {view === 'settings' && <SettingsPanel settings={settings} onUpdate={handleUpdateSettings} />}
                </>
              )}

              {/* Quick Actions List (Common) */}
              {(view === 'buy' || view === 'sell' || view === 'analysis') && (
                <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500 no-print">
                  <h3 className="text-lg font-bold text-white mb-4 border-r-4 border-gold-500 pr-3 uppercase tracking-wider">آخر العمليات</h3>
                  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
                    <table className="w-full text-right min-w-[600px]">
                      <thead className="bg-black/40 text-zinc-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">العميل</th>
                          <th className="px-6 py-3">النوع</th>
                          <th className="px-6 py-3">المبلغ</th>
                          <th className="px-6 py-3">التاريخ</th>
                          <th className="px-6 py-3">اجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions.filter(t => t.type.toUpperCase() === view.toUpperCase()).slice(0, 5).map(t => (
                          <tr key={t.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-zinc-500 text-xs">#{t.id.slice(-4)}</td>
                            <td className="px-6 py-4 font-bold text-sm truncate max-w-[150px]">{t.customerName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${t.type === 'BUY' ? 'bg-blue-900/30 text-blue-300 border border-blue-900/50' : t.type === 'SELL' ? 'bg-green-900/30 text-green-300 border border-green-900/50' : 'bg-purple-900/30 text-purple-300 border border-purple-900/50'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-gold-400 font-bold">{t.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-zinc-500 text-xs">{t.date}</td>
                            <td className="px-6 py-4">
                               <button 
                                  onClick={() => setReprintTransaction(t)}
                                  className="text-zinc-400 hover:text-gold-500 p-2 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
                                  title="طباعة"
                               >
                                  <Printer className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Global Footer Ticker */}
      <footer className="h-8 bg-black border-t border-gold-600/50 flex items-center overflow-hidden relative z-30 no-print flex-shrink-0">
          <div className="px-3 h-full flex items-center bg-gold-600 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest z-10 relative shadow-xl clip-path-slant whitespace-nowrap">
              System Status
          </div>
          
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
               <div className="flex animate-marquee items-center whitespace-nowrap">
                  {/* Duplicating items for seamless marquee */}
                  {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                      <div key={`${item.id}-${i}`} className="flex items-center gap-2 px-4 md:px-6 border-r border-white/10">
                          <span className="text-zinc-500 text-[9px] sm:text-[10px] font-bold tracking-wider">{item.label}</span>
                          <span className="text-white font-mono font-bold text-xs">{item.val}</span>
                          <span className={`text-[9px] ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                               {item.up ? '▲' : '▼'}
                          </span>
                      </div>
                  ))}
               </div>
          </div>
      </footer>

    </div>
  );
};
export default App;