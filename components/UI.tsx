import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const GoldCard: React.FC<CardProps> = ({ children, className = '', title, icon }) => (
  <div className={`bg-gradient-to-br from-dark-card to-zinc-900 border-t border-l border-white/10 rounded-xl shadow-3d p-6 relative overflow-hidden ${className}`}>
    {/* Shiny Overlay Effect */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    
    {(title || icon) && (
      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-2 z-10 relative">
        {icon && <div className="text-gold-500 drop-shadow-lg">{icon}</div>}
        {title && <h3 className="text-xl font-bold text-gold-100 tracking-wide">{title}</h3>}
      </div>
    )}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyle = "px-6 py-2 rounded-lg font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-b from-gold-400 to-gold-600 text-black border border-gold-300 hover:brightness-110 shadow-gold-glow",
    secondary: "bg-zinc-700 text-white border border-zinc-600 hover:bg-zinc-600",
    danger: "bg-red-800 text-white border border-red-600 hover:bg-red-700"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-gold-200 text-sm font-bold mb-2">{label}</label>
    <input 
      className={`w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-gold-200 text-sm font-bold mb-2">{label}</label>
    <select 
      className={`w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);