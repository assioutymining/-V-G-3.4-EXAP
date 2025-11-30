
import React, { useState, useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { Partner, Transaction } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Button } from '../components/UI';

export const PartnersView = ({ transactions }: { transactions: Transaction[] }) => {
  const [partners, setPartners] = useState<Partner[]>(storage.getPartners());
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addPartner({ ...newPartner, percentage: 0, id: Date.now().toString() } as Partner);
    setPartners(storage.getPartners());
    setNewPartner({});
  };

  const totalCapital = useMemo(() => partners.reduce((sum, p) => sum + p.capital, 0), [partners]);
  
  const { netProfit } = useMemo(() => {
    const totalSales = transactions.filter(t => t.type === 'SELL').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPurchases = transactions.filter(t => t.type === 'BUY').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalAnalysis = transactions.filter(t => t.type === 'ANALYSIS').reduce((sum, t) => sum + t.totalAmount, 0);
    
    const gross = totalSales - totalPurchases;
    const operating = gross + totalAnalysis - totalExpenses;
    const tax23 = operating > 0 ? operating * 0.23 : 0;
    const vat14 = operating > 0 ? operating * 0.14 : 0;
    
    return { netProfit: operating - tax23 - vat14 };
  }, [transactions]);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 p-4 rounded-xl border border-gold-500/20">
            <div className="text-zinc-500 text-sm">إجمالي رأس المال</div>
            <div className="text-2xl font-bold text-gold-400">{totalCapital.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-gold-500/20">
             <div className="text-zinc-500 text-sm">صافي الأرباح (بعد الضرائب)</div>
             <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
               {Math.floor(netProfit).toLocaleString()}
             </div>
          </div>
           <div className="bg-zinc-900 p-4 rounded-xl border border-gold-500/20">
             <div className="text-zinc-500 text-sm">عدد الشركاء</div>
             <div className="text-2xl font-bold text-white">{partners.length}</div>
          </div>
       </div>

       <GoldCard title="إضافة شريك جديد" icon={<Briefcase />}>
         <form onSubmit={handleAdd} className="flex gap-4 items-end">
            <div className="flex-1"><Input label="اسم الشريك" value={newPartner.name || ''} onChange={e => setNewPartner({...newPartner, name: e.target.value})} required /></div>
            <div className="flex-1"><Input label="رأس المال المساهم" type="number" value={newPartner.capital || ''} onChange={e => setNewPartner({...newPartner, capital: parseFloat(e.target.value)})} required /></div>
            <div className="mb-4"><Button type="submit">إضافة</Button></div>
         </form>
       </GoldCard>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {partners.map(p => {
           const sharePercentage = totalCapital > 0 ? (p.capital / totalCapital) * 100 : 0;
           const shareProfit = (netProfit * sharePercentage) / 100;
           
           return (
             <div key={p.id} className="bg-gradient-to-b from-zinc-800 to-zinc-900 p-6 rounded-xl border-t-4 border-gold-500 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                   <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm font-bold">
                     {sharePercentage.toFixed(2)}% حصة
                   </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="bg-black/30 p-3 rounded">
                      <div className="text-xs text-zinc-500">رأس المال</div>
                      <div className="text-lg font-bold text-white">{p.capital.toLocaleString()}</div>
                   </div>
                   <div className="bg-black/30 p-3 rounded">
                      <div className="text-xs text-zinc-500">نصيب الربح (الصافي)</div>
                      <div className={`text-lg font-bold ${shareProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.floor(shareProfit).toLocaleString()}
                      </div>
                   </div>
                </div>
                <Button variant="secondary" className="w-full text-sm h-8" onClick={() => {
                    storage.deletePartner(p.id); 
                    setPartners(storage.getPartners());
                }}>حذف الشريك</Button>
             </div>
           );
         })}
       </div>
    </div>
  );
};
