import React from 'react';
import { ShoppingCart, BadgePercent, Beaker, ArrowLeft, TrendingUp } from 'lucide-react';
import { Settings } from '../types';

interface UserDashboardProps {
  settings: Settings;
  onNavigate: (view: string) => void;
}

export const UserDashboard = ({ settings, onNavigate }: UserDashboardProps) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section - Controlled by Admin via Settings */}
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl border border-gold-500/30 group isolate">
        <div className="absolute inset-0 bg-zinc-900">
          <img 
            src={settings.dashboard?.heroImage || 'https://images.unsplash.com/photo-1605218427368-35b8113d18be?q=80&w=2000&auto=format&fit=crop'}
            alt="Banner" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center p-8 z-10">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gold-100 mb-2">
              {settings.dashboard?.heroTitle || 'مرحباً بك'}
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed border-r-4 border-gold-500 pr-4">
              {settings.dashboard?.heroSubtitle || 'نظام إدارة المعمل - واجهة الموظفين'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Price Ticker (Necessary for Work) */}
      <div className="flex items-center justify-between bg-zinc-900 border border-gold-500/20 p-4 rounded-xl">
          <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-500/10 rounded-full text-gold-500">
                  <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-zinc-400 font-bold">سعر الذهب (عيار 24) المعتمد للعمليات:</span>
          </div>
          <div className="text-2xl font-black text-gold-400 font-mono">
              {settings.goldPrice24.toLocaleString()} <span className="text-sm text-zinc-500">{settings.currency}</span>
          </div>
      </div>

      {/* Workstation Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sell Action */}
        <button 
            onClick={() => onNavigate('sell')}
            className="group relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-gold-500 p-8 rounded-2xl transition-all duration-300 hover:shadow-gold-glow flex flex-col items-center text-center"
        >
            <div className="w-20 h-20 rounded-full bg-gold-500/10 group-hover:bg-gold-500 text-gold-500 group-hover:text-black flex items-center justify-center mb-6 transition-colors duration-300">
                <BadgePercent className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">بيع ذهب</h3>
            <p className="text-zinc-500 text-sm">تسجيل عملية بيع للعميل وإصدار فاتورة</p>
            <div className="mt-6 flex items-center text-gold-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                بدء العملية <ArrowLeft className="w-4 h-4 mr-2" />
            </div>
        </button>

        {/* Buy Action */}
        <button 
            onClick={() => onNavigate('buy')}
            className="group relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-blue-500 p-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 flex flex-col items-center text-center"
        >
            <div className="w-20 h-20 rounded-full bg-blue-500/10 group-hover:bg-blue-600 text-blue-500 group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300">
                <ShoppingCart className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">شراء ذهب</h3>
            <p className="text-zinc-500 text-sm">شراء كسر أو سبائك من العميل</p>
            <div className="mt-6 flex items-center text-blue-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                بدء العملية <ArrowLeft className="w-4 h-4 mr-2" />
            </div>
        </button>

        {/* Analysis Action */}
        <button 
            onClick={() => onNavigate('analysis')}
            className="group relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 hover:border-purple-500 p-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 flex flex-col items-center text-center"
        >
            <div className="w-20 h-20 rounded-full bg-purple-500/10 group-hover:bg-purple-600 text-purple-500 group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300">
                <Beaker className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">فحص وتحليل</h3>
            <p className="text-zinc-500 text-sm">إجراء تحليل فني وإصدار شهادة</p>
            <div className="mt-6 flex items-center text-purple-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                بدء العملية <ArrowLeft className="w-4 h-4 mr-2" />
            </div>
        </button>

      </div>
      
      <div className="text-center mt-12">
          <p className="text-zinc-600 text-xs">
              صلاحيات المستخدم: <span className="text-gold-500 font-bold">محدودة (Limited)</span> | لا يمكنك الوصول للتقارير المالية أو الإعدادات
          </p>
      </div>
    </div>
  );
};