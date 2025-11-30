
import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Transaction } from '../types';
import { storage } from '../services/storage';
import { Button } from '../components/UI';
import { PrintableDocument } from '../components/PrintableDocument';
import { exportToCSV } from '../utils/exporter';

export const ReportsView = ({ transactions }: { transactions: Transaction[] }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [showPrint, setShowPrint] = useState(false);
  const settings = storage.getSettings();
  
  const filtered = useMemo(() => {
     if (filterType === 'ALL') return transactions;
     return transactions.filter(t => t.type === filterType);
  }, [transactions, filterType]);

  const totalSum = filtered.reduce((sum, t) => sum + t.totalAmount, 0);

  const handleExport = () => {
    const data = filtered.map(t => ({
      Type: t.type,
      Date: t.date,
      Party: t.customerName || t.description || '-',
      Weight: t.weight || 0,
      Karat: t.karat || 0,
      Total: t.totalAmount
    }));
    exportToCSV(data, `PyramidsGold_Report_${filterType}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <>
      {showPrint && (
         <PrintableDocument 
            data={filtered}
            type="REPORT"
            settings={settings}
            onClose={() => setShowPrint(false)}
         />
      )}

      <div className={showPrint ? 'hidden' : 'space-y-6'}>
       <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-white/10 no-print">
          <div className="flex gap-2">
             {['ALL', 'BUY', 'SELL', 'ANALYSIS', 'EXPENSE'].map(type => (
               <button
                 key={type}
                 onClick={() => setFilterType(type)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterType === type ? 'bg-gold-500 text-black' : 'bg-black/40 text-zinc-400 hover:text-white'}`}
               >
                 {type === 'ALL' ? 'الكل' : type === 'BUY' ? 'شراء' : type === 'SELL' ? 'بيع' : type === 'EXPENSE' ? 'مصاريف' : 'تحليل'}
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="secondary"><FileSpreadsheet className="w-4 h-4" /> تصدير Excel</Button>
            <Button onClick={() => setShowPrint(true)} variant="primary"><Printer className="w-4 h-4" /> طباعة / حفظ PDF</Button>
          </div>
       </div>

       <div className="bg-[#1e1e1e] text-white p-8 rounded-xl shadow-2xl border border-white/10">
          <div className="text-center border-b-2 border-gold-500 pb-6 mb-6">
             <h1 className="text-3xl font-bold mb-2 text-gold-400">بيراميدز جولد - تقرير العمليات</h1>
             <p className="text-zinc-400">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <table className="w-full text-right border-collapse">
             <thead>
                <tr className="bg-black/30 border-b border-white/10 text-gold-400">
                   <th className="p-3 font-bold">نوع العملية</th>
                   <th className="p-3 font-bold">التاريخ</th>
                   <th className="p-3 font-bold">الطرف الآخر</th>
                   <th className="p-3 font-bold">الوزن</th>
                   <th className="p-3 font-bold">العيار</th>
                   <th className="p-3 font-bold">الإجمالي</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {filtered.map(t => (
                   <tr key={t.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-1 rounded text-xs ${t.type === 'BUY' ? 'bg-blue-900/50 text-blue-200' : t.type === 'SELL' ? 'bg-green-900/50 text-green-200' : 'bg-zinc-800 text-zinc-300'}`}>
                           {t.type === 'BUY' ? 'شراء' : t.type === 'SELL' ? 'بيع' : t.type === 'EXPENSE' ? 'مصروف' : 'تحليل'}
                        </span>
                      </td>
                      <td className="p-3">{t.date}</td>
                      <td className="p-3">{t.customerName || t.description || '-'}</td>
                      <td className="p-3">{t.weight ? `${t.weight}g` : '-'}</td>
                      <td className="p-3">{t.karat || '-'}</td>
                      <td className="p-3 font-bold text-gold-400">{t.totalAmount.toLocaleString()}</td>
                   </tr>
                ))}
             </tbody>
             <tfoot>
                <tr className="bg-gold-900/20 font-bold text-lg border-t-2 border-gold-500 mt-4">
                   <td colSpan={5} className="p-4 text-left text-gold-200">الإجمالي الكلي:</td>
                   <td className="p-4 text-gold-400">{totalSum.toLocaleString()} EGP</td>
                </tr>
             </tfoot>
          </table>
       </div>
    </div>
    </>
  );
}
