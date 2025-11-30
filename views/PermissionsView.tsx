
import React, { useState, useMemo } from 'react';
import { Truck, Printer, Trash2, MapPin, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Permission, Employee } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Select, Button } from '../components/UI';
import { PrintableDocument } from '../components/PrintableDocument';

export const PermissionsView = () => {
  const [permissions, setPermissions] = useState<Permission[]>(storage.getPermissions());
  const [employees] = useState<Employee[]>(storage.getEmployees());
  const [newPerm, setNewPerm] = useState<Partial<Permission>>({ status: 'PENDING', date: new Date().toISOString().split('T')[0] });
  
  const [showPrint, setShowPrint] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const stats = useMemo(() => {
    return {
        total: permissions.length,
        pending: permissions.filter(p => p.status === 'PENDING').length,
        completed: permissions.filter(p => p.status === 'COMPLETED').length
    };
  }, [permissions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === newPerm.employeeId);
    
    // Auto Generate ID
    const generatedId = storage.generateId('PERMISSION');

    const data = {
       ...newPerm, 
       id: generatedId, 
       employeeName: emp?.name || 'Unknown',
       status: 'PENDING'
    } as Permission;

    storage.addPermission(data);
    setPermissions(storage.getPermissions());
    setNewPerm({ status: 'PENDING', date: new Date().toISOString().split('T')[0], destination: '', items: '' });
  };

  const handleToggleStatus = (perm: Permission) => {
      const updated = { ...perm, status: perm.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } as Permission;
      // In a real app we would update specific item, here we delete and re-add for simplicity of local storage wrapper
      storage.deletePermission(perm.id);
      storage.addPermission(updated);
      setPermissions(storage.getPermissions());
  };

  const handlePrint = (perm: Permission) => {
    setPrintData(perm);
    setShowPrint(true);
  };

  return (
    <>
      {showPrint && printData && (
          <PrintableDocument 
             data={printData} 
             type="PERMISSION" 
             settings={storage.getSettings()} 
             onClose={() => setShowPrint(false)}
          />
      )}
      
      <div className={showPrint ? 'hidden' : 'space-y-6 animate-in fade-in'}>
        
        {/* Logistics Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-zinc-900/50 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-16 h-16 bg-gold-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div>
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">التصاريح السارية</div>
                    <div className="text-2xl font-black text-white">{stats.pending}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Clock className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-zinc-900/50 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div>
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">المهام المكتملة</div>
                    <div className="text-2xl font-black text-white">{stats.completed}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
             <div className="bg-zinc-900/50 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
                <div>
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">إجمالي السجل</div>
                    <div className="text-2xl font-black text-white">{stats.total}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Truck className="w-6 h-6" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Section */}
            <div className="lg:col-span-4">
            <GoldCard title="إصدار تصريح حركة" icon={<ShieldCheck />}>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="bg-zinc-900/50 p-3 rounded border border-white/5 mb-2">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            يستخدم هذا النموذج لإصدار تصاريح خروج الموظفين بالمعدات أو الذهب. يجب توقيع التصريح من الأمن عند الخروج.
                        </p>
                    </div>
                    
                    <Select label="المسؤول (السائق/الموظف)" value={newPerm.employeeId || ''} onChange={e => setNewPerm({...newPerm, employeeId: e.target.value})}>
                    <option value="">اختر الموظف...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.jobTitle}</option>)}
                    </Select>
                    
                    <Input label="خط السير / الوجهة" value={newPerm.destination || ''} onChange={e => setNewPerm({...newPerm, destination: e.target.value})} required placeholder="مثال: من المعمل إلى فرع الصاغة" />
                    
                    <div>
                        <label className="block text-gold-200 text-sm font-bold mb-2">بيان المنقولات (العهدة)</label>
                        <textarea 
                            className="w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 h-24 resize-none"
                            value={newPerm.items || ''}
                            onChange={e => setNewPerm({...newPerm, items: e.target.value})}
                            required
                            placeholder="تفاصيل الكميات، الأوزان، والأصناف..."
                        />
                    </div>
                    
                    <Input label="تاريخ التصريح" type="date" value={newPerm.date} onChange={e => setNewPerm({...newPerm, date: e.target.value})} required />
                    
                    <Button type="submit" className="w-full shadow-lg shadow-gold-500/20">
                        <Printer className="w-4 h-4 ml-2" /> إصدار وطباعة
                    </Button>
                </form>
            </GoldCard>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gold-500" /> سجل الحركة
                    </h3>
                </div>

                <div className="grid gap-3">
                    {permissions.map(perm => (
                        <div key={perm.id} className={`relative bg-zinc-900 border rounded-lg p-4 transition-all hover:translate-x-1 ${perm.status === 'COMPLETED' ? 'border-zinc-800 opacity-60' : 'border-l-4 border-l-gold-500 border-zinc-700'}`}>
                            
                            {/* Card Content */}
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${perm.status === 'COMPLETED' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-yellow-900/20 text-yellow-500 border-yellow-500/30'}`}>
                                            {perm.status === 'COMPLETED' ? 'مكتمل' : 'جاري التنفيذ'}
                                        </div>
                                        <span className="text-zinc-500 text-xs font-mono">#{perm.id}</span>
                                        <span className="text-zinc-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {perm.date}</span>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg leading-none mb-1">{perm.destination}</div>
                                            <div className="text-gold-500 text-sm font-medium">{perm.employeeName}</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 bg-black/30 p-2 rounded border border-white/5 text-xs text-zinc-300 flex items-start">
                                        <span className="text-zinc-500 font-bold ml-2">العهدة:</span>
                                        <span className="flex-1">{perm.items}</span>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col justify-center items-end gap-2 border-t md:border-t-0 md:border-r border-white/5 pt-3 md:pt-0 md:pr-4">
                                    <button 
                                        onClick={() => handlePrint(perm)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-800 hover:bg-gold-500 hover:text-black text-zinc-300 text-xs font-bold transition-colors w-full justify-center"
                                    >
                                        <Printer className="w-3 h-3" /> طباعة
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleToggleStatus(perm)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors w-full justify-center ${perm.status === 'COMPLETED' ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700' : 'bg-green-900/20 text-green-400 border border-green-900/50 hover:bg-green-900/40'}`}
                                    >
                                        <CheckCircle2 className="w-3 h-3" /> {perm.status === 'COMPLETED' ? 'إعادة فتح' : 'إغلاق التصريح'}
                                    </button>

                                    <button 
                                        onClick={() => {
                                            if(confirm('حذف هذا التصريح نهائياً؟')) {
                                                storage.deletePermission(perm.id);
                                                setPermissions(storage.getPermissions());
                                            }
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/20 text-xs font-bold transition-colors w-full justify-center"
                                    >
                                        <Trash2 className="w-3 h-3" /> حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {permissions.length === 0 && (
                        <div className="text-center py-10 bg-zinc-900/30 border border-dashed border-zinc-700 rounded-xl">
                            <Truck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500">لا توجد تصاريح حركة مسجلة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
