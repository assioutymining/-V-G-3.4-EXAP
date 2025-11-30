
import React, { useState } from 'react';
import { Banknote, Printer } from 'lucide-react';
import { Transaction, Settings } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Select, Button } from '../components/UI';
import { PrintableDocument } from '../components/PrintableDocument';

export const ExpensesView = ({ settings, onSave }: { settings: Settings, onSave: (t: Transaction) => void }) => {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('مصاريف أخرى');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPrint, setShowPrint] = useState(false);
  const [lastExpense, setLastExpense] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    
    // Auto Generate ID
    const generatedId = storage.generateId('EXPENSE');

    const data = {
      id: generatedId,
      type: 'EXPENSE',
      totalAmount: amount,
      description,
      details: { category },
      date,
      isPaid: true
    } as Transaction;

    onSave(data);
    
    if (shouldPrint) {
        setLastExpense(data);
        setShowPrint(true);
        resetForm();
    } else {
        alert('تم تسجيل المصروف برقم: ' + generatedId);
        resetForm();
    }
  };

  const resetForm = () => {
    setAmount(0);
    setDescription('');
  };

  return (
    <>
      {showPrint && lastExpense && (
          <PrintableDocument 
            data={lastExpense} 
            type="EXPENSE" 
            settings={settings} 
            onClose={() => setShowPrint(false)}
          />
      )}
      
      <div className={showPrint ? 'hidden' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoldCard title="تسجيل مصروف جديد" icon={<Banknote />}>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <Select label="نوع المصروف" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="رواتب">رواتب موظفين</option>
                  <option value="إيجار">إيجار</option>
                  <option value="كهرباء">كهرباء ومياه</option>
                  <option value="ضيافة">ضيافة ونثريات</option>
                  <option value="مصاريف أخرى">مصاريف أخرى</option>
                </Select>
                <Input label="المبلغ" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} required />
                <Input label="الوصف / ملاحظات" value={description} onChange={e => setDescription(e.target.value)} />
                <Input label="التاريخ" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="flex gap-2 mt-4">
                    <Button type="submit" variant="danger" className="flex-1">تسجيل</Button>
                    <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e as any, true)} className="flex-1">
                        <Printer className="w-4 h-4" /> حفظ وطباعة
                    </Button>
                </div>
              </form>
            </GoldCard>
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">إدارة المصروفات</h3>
                  <p className="text-zinc-500 mt-2">يتم خصم جميع المصروفات من الأرباح الصافية في التقارير</p>
              </div>
            </div>
          </div>
      </div>
    </>
  );
};
