
import React, { useMemo } from 'react';
import { 
  TrendingUp, ShoppingCart, Beaker, PieChart, Scale, Shield, Wallet, Globe
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Transaction, Settings } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Button } from '../components/UI';

interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
  onNavigate: (view: string) => void;
}

export const Dashboard = ({ transactions, settings, onNavigate }: DashboardProps) => {
  const stats = useMemo(() => {
    // 1. Transaction Totals
    const totalSales = transactions.filter(t => t.type === 'SELL').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPurchases = transactions.filter(t => t.type === 'BUY').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalAnalysisRevenue = transactions.filter(t => t.type === 'ANALYSIS').reduce((sum, t) => sum + t.totalAmount, 0);
    const analysisCount = transactions.filter(t => t.type === 'ANALYSIS').length;
    
    // 2. Profit Calculations
    const grossProfit = totalSales - totalPurchases;
    const operatingProfit = grossProfit + totalAnalysisRevenue - totalExpenses;
    const tax23 = operatingProfit > 0 ? operatingProfit * 0.23 : 0;
    const vat14 = operatingProfit > 0 ? operatingProfit * 0.14 : 0;
    const netProfit = operatingProfit - tax23 - vat14;

    // 3. Stock Weight
    let currentPureWeight = 0;
    transactions.forEach(t => {
      if ((t.type === 'BUY' || t.type === 'SELL') && t.weight && t.karat) {
         const purity = t.karat / 1000;
         const pureContent = t.weight * purity;
         if (t.type === 'BUY') currentPureWeight += pureContent;
         if (t.type === 'SELL') currentPureWeight -= pureContent;
      }
    });
    
    const currentPrice24 = settings.goldPrice24 || 0;
    const stockValue = currentPureWeight * currentPrice24;

    // 4. Liquidity (Cash)
    const partners = storage.getPartners();
    const totalCapital = partners.reduce((sum, p) => sum + p.capital, 0);
    const liquidity = totalCapital + totalSales + totalAnalysisRevenue - totalPurchases - totalExpenses;

    // 5. Chart Data
    const chartData = [
      { name: 'السبت', sales: totalSales * 0.15, buy: totalPurchases * 0.2 },
      { name: 'الأحد', sales: totalSales * 0.2, buy: totalPurchases * 0.1 },
      { name: 'الاثنين', sales: totalSales * 0.1, buy: totalPurchases * 0.15 },
      { name: 'الثلاثاء', sales: totalSales * 0.25, buy: totalPurchases * 0.25 },
      { name: 'الأربعاء', sales: totalSales * 0.15, buy: totalPurchases * 0.1 },
      { name: 'الخميس', sales: totalSales * 0.1, buy: totalPurchases * 0.15 },
      { name: 'الجمعة', sales: totalSales * 0.05, buy: totalPurchases * 0.05 },
    ];

    return { 
        totalSales, totalPurchases, totalExpenses, totalAnalysisRevenue, 
        analysisCount, chartData, netProfit, currentPureWeight, stockValue,
        liquidity 
    };
  }, [transactions, settings]);

  // Calculate Ounce USD for Table (or use 0 if not available)
  const ouncePriceUSD = (settings as any).ouncePriceUSD || 
                        (settings.exchangeRate && settings.goldPrice24 
                        ? Math.round((settings.goldPrice24 * 31.1035) / settings.exchangeRate) 
                        : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative min-h-[20rem] md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-gold-500/30 group isolate flex flex-col md:block">
        <div className="absolute inset-0 bg-zinc-900">
          <img 
            src={settings.dashboard?.heroImage || "https://images.unsplash.com/photo-1605218427368-35b8113d18be?q=80&w=2000&auto=format&fit=crop"}
            alt="Gold Vault" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-gold-900/10 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative md:absolute inset-0 flex items-center p-6 md:p-10 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold mb-4 backdrop-blur-sm">
              <Shield className="w-3 h-3" /> النظام الآمن لإدارة المعامل
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-100 drop-shadow-sm mb-4 leading-tight">
              {settings.dashboard?.heroTitle || 'بيراميدز جولد'}
            </h2>
            <p className="text-white/80 text-sm md:text-lg leading-relaxed max-w-lg border-r-4 border-gold-500 pr-4">
              {settings.dashboard?.heroSubtitle || 'الحل المتكامل لإدارة عمليات التحليل، البيع، والشراء في أسواق الذهب والمعادن الثمينة بأحدث التقنيات.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
               <Button onClick={() => onNavigate('analysis')} className="shadow-gold-glow/50 justify-center">ابدأ العمل</Button>
               <Button onClick={() => onNavigate('reports')} variant="secondary" className="backdrop-blur-sm bg-white/5 hover:bg-white/10 justify-center">التقارير السريعة</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stock Balance */}
        <div className="bg-gradient-to-r from-zinc-900 to-black border border-gold-500/30 rounded-xl p-6 relative overflow-hidden shadow-gold-glow group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-all duration-700 group-hover:bg-gold-500/20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-right gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                        <Scale className="w-8 h-8 md:w-10 md:h-10 text-black" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">رصيد المخزون</h2>
                        <p className="text-gold-300/80 mt-1 text-sm md:text-base">إجمالي الذهب الخالص (عيار 24)</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full md:w-auto justify-center">
                    <div>
                        <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">الوزن الصافي</div>
                        <div className="text-4xl md:text-5xl font-black text-gold-400 font-mono drop-shadow-md">
                            {stats.currentPureWeight.toFixed(2)} <span className="text-lg text-zinc-500 font-sans font-bold">جم</span>
                        </div>
                    </div>
                    <div className="hidden md:block w-px bg-white/10 h-16 self-center"></div>
                    <div>
                        <div className="text-zinc-500 text-sm font-bold mb-1 uppercase tracking-wider">القيمة السوقية</div>
                        <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                            {Math.floor(stats.stockValue).toLocaleString()} <span className="text-sm text-gold-500 font-sans font-bold">{settings.currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Liquidity Balance */}
        <div className="bg-gradient-to-r from-zinc-900 to-green-900/20 border border-green-500/30 rounded-xl p-6 relative overflow-hidden shadow-lg group">
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 transition-all duration-700 group-hover:bg-green-500/20"></div>
             <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30 text-white">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">رصيد السيولة (الخزينة)</h2>
                        <p className="text-green-300/80 text-xs">صافي النقد المتاح (كاش)</p>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <div className={`text-4xl md:text-5xl font-black font-mono drop-shadow-md ${stats.liquidity >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {Math.floor(stats.liquidity).toLocaleString()}
                        <span className="text-lg text-zinc-500 font-sans font-bold ml-2">{settings.currency}</span>
                    </div>
                    <div className="mt-2 text-[10px] text-zinc-500 flex gap-2 justify-center md:justify-start">
                        <span>(رأس المال + المبيعات + الفحص) - (المشتريات + المصروفات)</span>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <GoldCard title="إجمالي المبيعات" icon={<TrendingUp />}>
          <div className="text-2xl font-black text-white">
            {stats.totalSales.toLocaleString()} <span className="text-xs text-gold-500 font-normal">{settings.currency}</span>
          </div>
        </GoldCard>
        <GoldCard title="إجمالي المشتريات" icon={<ShoppingCart />}>
          <div className="text-2xl font-black text-white">
            {stats.totalPurchases.toLocaleString()} <span className="text-xs text-gold-500 font-normal">{settings.currency}</span>
          </div>
        </GoldCard>
        <GoldCard title="عائد التحليل" icon={<Beaker />}>
           <div className="text-2xl font-black text-blue-400">
             {stats.totalAnalysisRevenue.toLocaleString()} <span className="text-xs text-blue-200 font-normal">{settings.currency}</span>
           </div>
           <div className="text-[10px] text-zinc-500 mt-1">{stats.analysisCount} عملية فحص</div>
        </GoldCard>
         <GoldCard title="صافي الأرباح" icon={<PieChart />}>
          <div className={`text-2xl font-black ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {Math.floor(stats.netProfit).toLocaleString()} <span className="text-xs text-zinc-400 font-normal">{settings.currency}</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">بعد خصم الضرائب</div>
        </GoldCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Market Table */}
         <div className="lg:col-span-1">
             <GoldCard title="أسعار السوق الحية" icon={<Globe />}>
                <div className="overflow-hidden rounded-lg border border-white/10">
                   <table className="w-full text-right text-sm">
                      <thead className="bg-zinc-800 text-gold-500">
                         <tr>
                            <th className="p-3">البيان</th>
                            <th className="p-3 text-left">عالمي ($)</th>
                            <th className="p-3 text-left">محلي (EGP)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-zinc-900/50">
                         <tr>
                            <td className="p-3 font-bold text-white">أوقية (Ounce)</td>
                            <td className="p-3 text-left font-mono text-green-400">{ouncePriceUSD.toLocaleString()}</td>
                            <td className="p-3 text-left font-mono text-white">{(ouncePriceUSD * (settings.exchangeRate || 50)).toLocaleString()}</td>
                         </tr>
                         <tr>
                            <td className="p-3 font-bold text-white">عيار 24</td>
                            <td className="p-3 text-left font-mono text-zinc-400">{(ouncePriceUSD / 31.1035).toFixed(2)}</td>
                            <td className="p-3 text-left font-mono font-bold text-gold-400">{settings.goldPrice24.toLocaleString()}</td>
                         </tr>
                         <tr>
                            <td className="p-3 font-bold text-white">عيار 21</td>
                            <td className="p-3 text-left font-mono text-zinc-500">-</td>
                            <td className="p-3 text-left font-mono font-bold text-gold-400">{settings.goldPrice21.toLocaleString()}</td>
                         </tr>
                         <tr>
                            <td className="p-3 font-bold text-white">عيار 18</td>
                            <td className="p-3 text-left font-mono text-zinc-500">-</td>
                            <td className="p-3 text-left font-mono font-bold text-gold-400">{settings.goldPrice18.toLocaleString()}</td>
                         </tr>
                         <tr className="bg-white/5">
                            <td className="p-3 font-bold text-blue-400">USD / EGP</td>
                            <td className="p-3 text-left font-mono text-blue-400 font-bold">1.00</td>
                            <td className="p-3 text-left font-mono font-bold text-white">{settings.exchangeRate?.toFixed(2)}</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
                <div className="mt-3 text-[10px] text-zinc-500 text-center">
                    الأسعار تحدث تلقائياً بناءً على المصدر المحدد في الإعدادات
                </div>
             </GoldCard>
         </div>

         {/* Charts */}
         <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <GoldCard title="حركة البيع والشراء" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#d4af37', color: '#fff' }}
                />
                <Bar dataKey="sales" name="مبيعات" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="buy" name="مشتريات" fill="#52525b" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </GoldCard>
         </div>
      </div>
    </div>
  );
};
