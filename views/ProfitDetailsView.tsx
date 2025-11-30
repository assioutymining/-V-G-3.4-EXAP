
import React, { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { Transaction, Settings } from '../types';
import { GoldCard } from '../components/UI';

export const ProfitDetailsView = ({ transactions, settings }: { transactions: Transaction[], settings: Settings }) => {
    const analysis = useMemo(() => {
      const sales = transactions.filter(t => t.type === 'SELL').reduce((sum, t) => sum + t.totalAmount, 0);
      const purchases = transactions.filter(t => t.type === 'BUY').reduce((sum, t) => sum + t.totalAmount, 0);
      const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.totalAmount, 0);
      const analysisIncome = transactions.filter(t => t.type === 'ANALYSIS').reduce((sum, t) => sum + t.totalAmount, 0);
      
      const grossProfit = sales - purchases;
      const operatingProfit = grossProfit + analysisIncome - expenses;
      
      const taxableIncome = operatingProfit > 0 ? operatingProfit : 0;
      const tax23 = taxableIncome * 0.23; 
      const vat14 = taxableIncome * 0.14; 
      
      const netProfit = operatingProfit - tax23 - vat14;
      
      return { sales, purchases, expenses, analysisIncome, grossProfit, operatingProfit, tax23, vat14, netProfit };
    }, [transactions]);
  
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gold-400">تفاصيل الأرباح والضرائب</h2>
              <p className="text-zinc-500 mt-2">تقرير مفصل يشمل عوائد التحليل والاستقطاعات الضريبية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
                 <div className="text-zinc-400 text-sm mb-1">إجمالي المبيعات</div>
                 <div className="text-2xl font-bold text-white">{analysis.sales.toLocaleString()}</div>
             </div>
             <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
                 <div className="text-zinc-400 text-sm mb-1">إجمالي المشتريات</div>
                 <div className="text-2xl font-bold text-white">{analysis.purchases.toLocaleString()}</div>
             </div>
              <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-900/30">
                 <div className="text-blue-400 text-sm mb-1">إيرادات التحليل</div>
                 <div className="text-2xl font-bold text-blue-400">+{analysis.analysisIncome.toLocaleString()}</div>
             </div>
             <div className="bg-red-900/20 p-6 rounded-xl border border-red-900/30">
                 <div className="text-red-400 text-sm mb-1">المصروفات التشغيلية</div>
                 <div className="text-2xl font-bold text-red-400">-{analysis.expenses.toLocaleString()}</div>
             </div>
          </div>

          <GoldCard title="الاستقطاعات الضريبية" icon={<Landmark />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 bg-black/40 rounded-lg">
                      <div className="text-zinc-400 mb-2">الربح التشغيلي (قبل الضرائب)</div>
                      <div className="text-2xl font-bold text-white">{analysis.operatingProfit.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl">23%</div>
                      <div className="text-zinc-400 mb-2">ضريبة الدخل</div>
                      <div className="text-2xl font-bold text-red-400">-{Math.floor(analysis.tax23).toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs px-2 py-1 rounded-bl">14%</div>
                      <div className="text-zinc-400 mb-2">ضريبة القيمة المضافة</div>
                      <div className="text-2xl font-bold text-orange-400">-{Math.floor(analysis.vat14).toLocaleString()}</div>
                  </div>
              </div>
          </GoldCard>

          <div className="bg-gradient-to-r from-gold-600 to-gold-400 p-1 rounded-2xl shadow-gold-glow">
              <div className="bg-zinc-900 rounded-xl p-8 text-center">
                  <h3 className="text-xl font-bold text-zinc-400 mb-2">صافي الربح النهائي (Net Profit)</h3>
                  <div className={`text-5xl font-black ${analysis.netProfit >= 0 ? 'text-gold-400' : 'text-red-500'}`}>
                      {Math.floor(analysis.netProfit).toLocaleString()} <span className="text-lg text-white">{settings.currency}</span>
                  </div>
                  <p className="text-zinc-500 mt-4 text-sm">المبلغ المتاح للتوزيع على الشركاء</p>
              </div>
          </div>
      </div>
    );
};
