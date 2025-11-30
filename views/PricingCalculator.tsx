
import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { Settings } from '../types';
import { GoldCard, Input } from '../components/UI';

export const PricingCalculator = ({ settings }: { settings: Settings }) => {
  // Existing Purity Calculator State
  const [weight, setWeight] = useState(0);
  const [karat, setKarat] = useState(0);
  
  // New Manual Calculator State
  const [manualWeight, setManualWeight] = useState(0);
  const [manualPrice, setManualPrice] = useState(0);

  // Purity Logic
  const pureWeight = (weight * karat) / 1000;
  const calculatedPrice = (weight * (karat / 1000)) * (settings.goldPrice24);

  // Manual Logic
  const manualTotal = manualWeight * manualPrice;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
       
       {/* 1. Existing Purity Calculator */}
       <GoldCard title="حاسبة التحيف (بناءً على العيار والسعر العالمي)" icon={<Calculator />}>
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="وزن السبيكة (جرام)"
                  type="number"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value))}
                />
                <Input 
                  label="العيار (من 1000)"
                  placeholder="مثال: 875"
                  type="number"
                  value={karat}
                  onChange={e => setKarat(parseFloat(e.target.value))}
                />
             </div>
             <div className="p-6 bg-zinc-800 rounded-xl border-2 border-gold-500/50 text-center space-y-4">
                <div>
                  <div className="text-zinc-400 text-sm mb-1">الوزن الصافي (ذهب خالص عيار 24)</div>
                  <div className="text-2xl font-bold text-white">{pureWeight.toFixed(3)} جم</div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-zinc-400 text-sm mb-1">السعر التقديري (حسب السعر العالمي)</div>
                  <div className="text-4xl font-black text-gold-400">{Math.round(calculatedPrice).toLocaleString()} EGP</div>
                </div>
             </div>
          </div>
       </GoldCard>

       {/* 2. New Manual Calculator */}
       <GoldCard title="حاسبة يدوية (وزن × سعر)" icon={<X className="rotate-45" />}>
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                   label="الوزن (جرام)"
                   type="number"
                   value={manualWeight}
                   onChange={e => setManualWeight(parseFloat(e.target.value))}
                   className="bg-zinc-900 border-zinc-700"
                />
                <Input 
                   label="سعر الجرام الواحد"
                   type="number"
                   value={manualPrice}
                   onChange={e => setManualPrice(parseFloat(e.target.value))}
                   className="bg-zinc-900 border-zinc-700"
                />
             </div>
             
             <div className="mt-4 p-6 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xl border border-white/10 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="text-zinc-400 text-sm mb-2 font-bold uppercase tracking-wider">الإجمالي النهائي</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tight drop-shadow-lg">
                       {manualTotal.toLocaleString()} <span className="text-xl text-gold-500 font-sans">EGP</span>
                    </div>
                </div>
             </div>
          </div>
       </GoldCard>
    </div>
  )
}
