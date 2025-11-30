import React, { useState, useEffect, useMemo } from 'react';
import { Scale, Save, Printer, TrendingUp, DollarSign } from 'lucide-react';
import { Transaction, TransactionType, Settings } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Select, Button } from '../components/UI';
import { PrintableDocument } from '../components/PrintableDocument';

interface OperationFormProps {
  type: TransactionType;
  settings: Settings;
  onSave: (t: Transaction) => void;
}

export const OperationForm = ({ type, settings, onSave }: OperationFormProps) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    karat: 875,
    pricePerGram: 0,
    customerName: '',
    discount: 0,
    isPaid: true,
    details: { goldType: 'scrap' } // Default to Scrap
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [savedData, setSavedData] = useState<any>(null);

  useEffect(() => {
    if (type === 'SELL' || type === 'BUY') {
      let price = 0;
      if (settings.goldPrice24) {
        price = (settings.goldPrice24 / 1000) * (formData.karat || 0);
      }

      if (type === 'SELL') price += 50; 
      if (type === 'BUY') price -= 50;

      setFormData(prev => ({ ...prev, pricePerGram: Math.round(price) }));
    }
  }, [formData.karat, type, settings]);

  const total = useMemo(() => {
    const raw = (formData.weight || 0) * (formData.pricePerGram || 0);
    const discountAmount = (raw * (formData.discount || 0)) / 100;
    return raw - discountAmount;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    
    // Auto Generate ID based on Type
    const generatedId = storage.generateId(type);

    const newData = {
      id: generatedId,
      type,
      totalAmount: total,
      isPaid: true,
      ...formData
    } as Transaction;

    onSave(newData);
    
    if (shouldPrint) {
        setSavedData(newData);
        setShowInvoice(true);
        setFormData({ ...formData, weight: 0, customerName: '', discount: 0, details: { goldType: 'scrap' } });
    } else {
        alert('تم حفظ العملية بنجاح! رقم: ' + generatedId);
        setFormData({ ...formData, weight: 0, customerName: '', discount: 0, details: { goldType: 'scrap' } });
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'BUY': return 'تسجيل شراء ذهب';
      case 'SELL': return 'تسجيل بيع ذهب';
      case 'ANALYSIS': return 'تسجيل فحص جديد';
      default: return '';
    }
  };

  return (
    <>
      {showInvoice && savedData && (
          <PrintableDocument 
             data={savedData} 
             type={type} 
             settings={settings} 
             onClose={() => setShowInvoice(false)} 
          />
      )}
      
      <div className={showInvoice ? 'hidden' : 'space-y-6'}>
        
        {/* Market Price Ticker for Buy/Sell */}
        {(type === 'BUY' || type === 'SELL') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 animate-in fade-in slide-in-from-top-4">
                <div className="bg-zinc-900 border border-gold-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 mb-1">عيار 24</span>
                    <span className="text-lg font-black text-gold-400 font-mono">{settings.goldPrice24.toLocaleString()}</span>
                </div>
                <div className="bg-zinc-900 border border-gold-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 mb-1">عيار 21</span>
                    <span className="text-lg font-black text-gold-400 font-mono">{settings.goldPrice21.toLocaleString()}</span>
                </div>
                <div className="bg-zinc-900 border border-gold-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 mb-1">عيار 18</span>
                    <span className="text-lg font-black text-gold-400 font-mono">{settings.goldPrice18.toLocaleString()}</span>
                </div>
                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xs text-green-400 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> صرف الدولار</span>
                    <span className="text-lg font-black text-white font-mono">{settings.exchangeRate?.toFixed(2) || '0.00'}</span>
                </div>
            </div>
        )}

        <GoldCard title={getTitle()} icon={<Scale />}>
          <form onSubmit={(e) => handleSubmit(e, false)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label={type === 'ANALYSIS' ? "اسم العميل / المصدر" : "اسم العميل"} 
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              required
            />
            <Input 
              label="التاريخ" 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
            />
            
            <div className="col-span-2 border-t border-white/10 my-2"></div>

            <Input 
              label="الوزن (جرام)" 
              type="number" step="0.01"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
              required
            />

            {type !== 'ANALYSIS' && (
              <Input 
                label="العيار (سهم / 1000)"
                type="number"
                placeholder="مثال: 875"
                value={formData.karat}
                onChange={e => setFormData({...formData, karat: parseFloat(e.target.value)})}
                required
              />
            )}

            {/* Gold Type Selection for BUY/SELL */}
            {(type === 'BUY' || type === 'SELL') && (
               <Select 
                label="نوع الذهب (الصنف)"
                value={formData.details?.goldType || 'scrap'}
                onChange={e => setFormData({...formData, details: {...formData.details, goldType: e.target.value}})}
              >
                <option value="scrap">ذهب كسر (Scrap)</option>
                <option value="raw">ذهب خام (Raw)</option>
              </Select>
            )}

            {type === 'ANALYSIS' && (
              <Select 
                label="نوع السبيكة"
                value={formData.details?.type || 'cast'}
                onChange={e => setFormData({...formData, details: {...formData.details, type: e.target.value}})}
              >
                <option value="cast">سبك (Cast)</option>
                <option value="raw">غير مسبوك (Raw)</option>
              </Select>
            )}

            {type !== 'ANALYSIS' && (
              <>
                <Input 
                  label="سعر الجرام (محسوب)" 
                  type="number" 
                  value={formData.pricePerGram}
                  onChange={e => setFormData({...formData, pricePerGram: parseFloat(e.target.value)})}
                />
                <Input 
                  label="نسبة الخصم (%)" 
                  type="number"
                  max="100"
                  value={formData.discount}
                  onChange={e => setFormData({...formData, discount: parseFloat(e.target.value)})}
                />
              </>
            )}

            {type === 'ANALYSIS' && (
              <Input 
                label="تكلفة الفحص" 
                type="number" 
                value={formData.pricePerGram}
                onChange={e => setFormData({...formData, pricePerGram: parseFloat(e.target.value)})}
              />
            )}

            <div className="col-span-2 bg-zinc-900 p-4 rounded-lg border border-gold-500/30 flex justify-between items-center">
              <span className="text-xl font-bold text-zinc-400">الإجمالي النهائي:</span>
              <span className="text-3xl font-black text-gold-400">{type === 'ANALYSIS' ? formData.pricePerGram : total.toLocaleString()} {settings.currency}</span>
            </div>

            <div className="col-span-2 flex gap-4 mt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-5 h-5" />
                حفظ فقط
              </Button>
              
              <Button type="button" onClick={(e) => handleSubmit(e as any, true)} variant="secondary" className="flex-1 bg-gradient-to-r from-gold-600 to-gold-700 text-black border-none hover:brightness-110">
                <Printer className="w-5 h-5" />
                حفظ وطباعة الفاتورة
              </Button>
            </div>
          </form>
        </GoldCard>
      </div>
    </>
  );
};