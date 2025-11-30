
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Button } from './UI';
import { AnimatedLogo } from './AnimatedLogo';

export const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin({ ...user, lastLogin: new Date().toISOString() });
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] overflow-hidden relative font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[128px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full"></div>
            <AnimatedLogo size="large" />
          </div>
        </div>
        
        <GoldCard className="text-center border-gold-500/30 backdrop-blur-sm bg-black/60">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-500 to-gold-200 mb-2 tracking-tight">
            بيراميدز جولد
          </h1>
          <p className="text-zinc-400 mb-8 text-sm tracking-wide uppercase">نظام إدارة معامل الذهب المتكامل</p>
          
          <form onSubmit={handleLogin} className="text-right space-y-4">
            <Input 
              label="اسم المستخدم" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="bg-black/50 border-zinc-800 focus:border-gold-500"
            />
            <Input 
              label="كلمة المرور" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="bg-black/50 border-zinc-800 focus:border-gold-500"
            />
            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-900/10 py-2 rounded border border-red-900/30 animate-pulse">{error}</p>}
            <Button type="submit" className="w-full mt-6 py-3 text-lg group overflow-hidden relative">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                تسجيل الدخول
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-white/50 to-gold-400 opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
            </Button>
          </form>
        </GoldCard>
        <p className="text-center text-zinc-600 text-xs mt-8 tracking-widest uppercase">
          &copy; 2025 Pyramids Gold Systems v2.0
        </p>
      </div>
    </div>
  );
};
