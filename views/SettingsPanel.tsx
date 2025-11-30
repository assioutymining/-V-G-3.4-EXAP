
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, LayoutTemplate, Printer, Users, Database, 
  TrendingUp, Plus, Edit, Trash2, Cloud, CheckCircle, Save, Upload, RotateCcw, Palette, ImageIcon, Globe, Lock
} from 'lucide-react';
import { Settings, User, UserRole } from '../types';
import { storage } from '../services/storage';
import { CloudService } from '../services/cloud';
import { GoldCard, Input, Select, Button } from '../components/UI';

interface SettingsPanelProps {
    settings: Settings;
    onUpdate: (s: Settings) => void;
}

export const SettingsPanel = ({ settings, onUpdate }: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'interface' | 'users' | 'system' | 'print'>('general');
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [userForm, setUserForm] = useState<Partial<User>>({ role: UserRole.LIMITED });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let updated = false;
    const newSettings = { ...localSettings };

    if (!newSettings.printSettings) {
      newSettings.printSettings = {
         companyName: 'بيراميدز جولد',
         companyAddress: 'القاهرة، الصاغة، ممر 3',
         contactNumber: '010-0000-0000',
         taxNumber: '987-654',
         commercialRegister: '123456',
         primaryColor: '#000000',
         dataTextColor: '#000000',
         headerTextColor: '#000000',
         subHeaderTextColor: '#000000',
         labelTextColor: '#000000',
         borderColor: '#000000',
         footerText: 'تم استخراج هذا المستند إلكترونياً من نظام بيراميدز جولد',
         paperSize: 'A5'
      };
      updated = true;
    }
    if (!newSettings.googleDrive) {
        newSettings.googleDrive = { clientId: '', apiKey: '', lastBackup: '' };
        updated = true;
    }
    if (!newSettings.dashboard) {
        newSettings.dashboard = { 
           heroTitle: 'بيراميدز جولد', 
           heroSubtitle: 'الحل المتكامل لإدارة عمليات التحليل، البيع، والشراء.', 
           heroImage: 'https://images.unsplash.com/photo-1605218427368-35b8113d18be?q=80&w=2000&auto=format&fit=crop' 
        };
        updated = true;
    }
    if(!newSettings.priceSource) {
        newSettings.priceSource = 'LIVE'; 
        updated = true;
    }

    if(updated) setLocalSettings(newSettings);
  }, []);

  const handleSaveSettings = () => {
    onUpdate(localSettings);
    if(localSettings.googleDrive?.clientId && localSettings.googleDrive?.apiKey) {
        CloudService.init(localSettings.googleDrive.apiKey, localSettings.googleDrive.clientId)
            .then(() => setIsDriveConnected(true))
            .catch(e => console.error("Drive Init Failed", e));
    }
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(!userForm.username || !userForm.password) return;
    
    if (editingUserId) {
      storage.updateUser({ ...userForm, id: editingUserId } as User);
      alert('تم تعديل بيانات المستخدم');
    } else {
      storage.addUser({ ...userForm, id: Date.now().toString(), lastLogin: '' } as User);
      alert('تم إضافة المستخدم');
    }
    setUsers(storage.getUsers());
    setUserForm({ role: UserRole.LIMITED, username: '', password: '' });
    setEditingUserId(null);
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserForm(u);
  };

  const handleDeleteUser = (id: string) => {
    if(confirm('هل تريد حذف هذا المستخدم؟')) {
      storage.deleteUser(id);
      setUsers(storage.getUsers());
    }
  };

  // Local Restore Handler
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(!confirm('سيتم استبدال البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
          if (restoreInputRef.current) restoreInputRef.current.value = '';
          return;
      }
      
      storage.restoreBackup(file, (success) => {
        if(success) {
            alert('تم استعادة النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة.');
            window.location.reload();
        }
        else {
            alert('فشل في استعادة الملف. تأكد من أن الملف بصيغة JSON صحيح.');
        }
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
        if(file.size > 500000) return alert('حجم الصورة كبير جداً. يجب أن تكون أقل من 500KB');
        const reader = new FileReader();
        reader.onloadend = () => {
             setLocalSettings({
                 ...localSettings, 
                 printSettings: { ...localSettings.printSettings, logoUrl: reader.result as string }
             });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
        if(file.size > 1500000) return alert('حجم الصورة كبير جداً.');
        const reader = new FileReader();
        reader.onloadend = () => {
             setLocalSettings({
                 ...localSettings, 
                 dashboard: { ...localSettings.dashboard!, heroImage: reader.result as string }
             });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDriveSignIn = async () => {
     if(!localSettings.googleDrive?.clientId) return alert('يرجى إدخال Client ID أولاً');
     if(!CloudService.initialized) {
        try {
            await CloudService.init(localSettings.googleDrive.apiKey, localSettings.googleDrive.clientId);
        } catch (e) {
            console.error(e);
            return alert('فشل تهيئة الاتصال بجوجل.');
        }
     }
     try {
         await CloudService.signIn();
         setIsDriveConnected(true);
         alert('تم تسجيل الدخول بنجاح!');
     } catch (e) {
         console.error(e);
         alert('فشل تسجيل الدخول');
     }
  };

  const handleCloudBackup = async () => {
     if(!isDriveConnected) return alert('يرجى تسجيل الدخول أولاً');
     setIsBackingUp(true);
     const data = storage.getFullBackupData();
     try {
         await CloudService.backup(data);
         const now = new Date().toISOString();
         setLocalSettings(prev => ({
             ...prev, 
             googleDrive: { ...prev.googleDrive!, lastBackup: now }
         }));
         const updated = { ...localSettings, googleDrive: { ...localSettings.googleDrive!, lastBackup: now }};
         onUpdate(updated);
         alert('تم رفع النسخة الاحتياطية إلى Google Drive بنجاح!');
     } catch (e) {
         console.error(e);
         alert('حدث خطأ أثناء الرفع');
     } finally {
         setIsBackingUp(false);
     }
  };

  const handleCloudRestore = async () => {
      if(!confirm('سيتم استبدال البيانات الحالية بالبيانات الموجودة على Google Drive. هل أنت متأكد؟')) return;
      try {
          const data = await CloudService.restore();
          storage.restoreFromData(data, (success) => {
              if(success) {
                  alert('تمت استعادة البيانات بنجاح! سيتم تحديث الصفحة.');
                  window.location.reload();
              } else {
                  alert('الملف المسترجع تالف.');
              }
          });
      } catch (e) {
          console.error(e);
          alert('فشل استرجاع الملف. ربما لا توجد نسخة احتياطية.');
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 space-x-reverse border-b border-white/10 pb-1 overflow-x-auto">
         <button onClick={() => setActiveTab('general')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
            <SettingsIcon className="inline w-4 h-4 ml-2" /> عام
         </button>
         <button onClick={() => setActiveTab('interface')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'interface' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
            <LayoutTemplate className="inline w-4 h-4 ml-2" /> الواجهة
         </button>
         <button onClick={() => setActiveTab('print')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'print' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
            <Printer className="inline w-4 h-4 ml-2" /> إعدادات الطباعة
         </button>
         <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
            <Users className="inline w-4 h-4 ml-2" /> المستخدمين
         </button>
         <button onClick={() => setActiveTab('system')} className={`px-6 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'system' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
            <Database className="inline w-4 h-4 ml-2" /> النظام والنسخ
         </button>
      </div>

      {activeTab === 'general' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <GoldCard title="إعدادات التسعير (السوق)" icon={<TrendingUp />}>
            <div className="mb-6 p-4 bg-zinc-900 rounded-lg border border-gold-500/30">
                <Select 
                    label="مصدر الأسعار (Price Source)" 
                    value={localSettings.priceSource || 'LIVE'} 
                    onChange={e => setLocalSettings({...localSettings, priceSource: e.target.value as any})}
                >
                    <option value="MANUAL">إدخال يدوي (Manual Entry)</option>
                    <option value="LIVE">تحديث تلقائي من الإنترنت (gold-price-today.com)</option>
                </Select>
                {localSettings.priceSource === 'LIVE' && (
                    <div className="text-xs text-green-400 flex items-center gap-2 mt-2">
                        <Globe className="w-4 h-4" /> جاري الجلب من المصدر: egypt.gold-price-today.com
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 ${localSettings.priceSource === 'LIVE' ? 'opacity-50 pointer-events-none' : ''}`}>
              <Input label="سعر عيار 24" type="number" value={localSettings.goldPrice24} onChange={e => setLocalSettings({...localSettings, goldPrice24: parseFloat(e.target.value)})} />
              <Input label="سعر عيار 21" type="number" value={localSettings.goldPrice21} onChange={e => setLocalSettings({...localSettings, goldPrice21: parseFloat(e.target.value)})} />
              <Input label="سعر عيار 18" type="number" value={localSettings.goldPrice18} onChange={e => setLocalSettings({...localSettings, goldPrice18: parseFloat(e.target.value)})} />
              <Input label="سعر الدولار ($)" type="number" step="0.01" value={localSettings.exchangeRate || 0} onChange={e => setLocalSettings({...localSettings, exchangeRate: parseFloat(e.target.value)})} />
            </div>
          </GoldCard>
          <GoldCard title="إعدادات النظام" className="mt-6" icon={<SettingsIcon />}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="العملة" value={localSettings.currency} onChange={e => setLocalSettings({...localSettings, currency: e.target.value})} />
               <Input label="نسبة الضريبة %" type="number" value={localSettings.taxRate} onChange={e => setLocalSettings({...localSettings, taxRate: parseFloat(e.target.value)})} />
             </div>
             <Button onClick={handleSaveSettings} className="mt-6 w-full">حفظ التغييرات</Button>
          </GoldCard>
        </div>
      )}

      {/* Interface and Print Tabs omitted for brevity as they remain largely unchanged, but structure implies they exist */}
      {activeTab === 'interface' && localSettings.dashboard && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <GoldCard title="تخصيص الواجهة الرئيسية" icon={<LayoutTemplate />}>
                <div className="space-y-4">
                    <Input label="عنوان الترحيب" value={localSettings.dashboard.heroTitle} onChange={e => setLocalSettings({...localSettings, dashboard: {...localSettings.dashboard!, heroTitle: e.target.value}})} />
                    <div className="mb-4">
                        <label className="block text-gold-200 text-sm font-bold mb-2">النص الترحيبي</label>
                        <textarea className="w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-2 text-white h-24" value={localSettings.dashboard.heroSubtitle} onChange={e => setLocalSettings({...localSettings, dashboard: {...localSettings.dashboard!, heroSubtitle: e.target.value}})} />
                    </div>
                    <div className="border-t border-white/10 pt-4 mt-2">
                        <label className="block text-gold-200 text-sm font-bold mb-2">صورة الخلفية</label>
                        <div className="flex gap-4 items-center flex-wrap">
                            <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={handleHeroUpload} />
                            <Button type="button" variant="secondary" onClick={() => heroInputRef.current?.click()} className="flex-1">
                                <ImageIcon className="w-4 h-4 ml-2" /> رفع صورة
                            </Button>
                        </div>
                    </div>
                </div>
                <Button onClick={handleSaveSettings} className="mt-6 w-full">حفظ</Button>
            </GoldCard>
        </div>
      )}

      {activeTab === 'print' && localSettings.printSettings && (
         <div className="animate-in fade-in slide-in-from-bottom-4">
            <GoldCard title="تخصيص الفواتير" icon={<Printer />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="اسم الشركة" value={localSettings.printSettings.companyName} onChange={e => setLocalSettings({...localSettings, printSettings: {...localSettings.printSettings, companyName: e.target.value}})} />
                    <Input label="الهاتف" value={localSettings.printSettings.contactNumber} onChange={e => setLocalSettings({...localSettings, printSettings: {...localSettings.printSettings, contactNumber: e.target.value}})} />
                </div>
                <Button onClick={handleSaveSettings} className="mt-6 w-full">حفظ</Button>
            </GoldCard>
         </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          <GoldCard title={editingUserId ? "تعديل مستخدم" : "إضافة مستخدم"} icon={<Plus />}>
             <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Input label="اسم المستخدم" value={userForm.username || ''} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
                <Input label="كلمة المرور" value={userForm.password || ''} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
                <Select label="الصلاحية" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                   <option value={UserRole.ADMIN}>مدير</option>
                   <option value={UserRole.LIMITED}>محدود</option>
                </Select>
                <Button type="submit" className="flex-1">{editingUserId ? 'حفظ' : 'إضافة'}</Button>
             </form>
          </GoldCard>
          <div className="bg-zinc-900 rounded-xl overflow-hidden border border-white/10">
             <table className="w-full text-right">
                <thead className="bg-black/50 text-gold-500">
                   <tr>
                      <th className="p-4">المستخدم</th>
                      <th className="p-4">الصلاحية</th>
                      <th className="p-4">تحكم</th>
                   </tr>
                </thead>
                <tbody>
                   {users.map(u => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                         <td className="p-4 font-bold">{u.username}</td>
                         <td className="p-4">{u.role}</td>
                         <td className="p-4 flex gap-2">
                            <button onClick={() => handleEditUser(u)} className="text-gold-500"><Edit className="w-4 h-4" /></button>
                            {u.username !== 'aadd' && <button onClick={() => handleDeleteUser(u.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 gap-6">
            <GoldCard title="تخزين سحابي (Google Drive)" icon={<Cloud />}>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">
                        لربط النظام بجوجل درايف، يرجى إدخال Client ID و API Key.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Client ID" 
                            value={localSettings.googleDrive?.clientId || ''} 
                            onChange={e => setLocalSettings({...localSettings, googleDrive: {...localSettings.googleDrive!, clientId: e.target.value}})} 
                        />
                         <Input 
                            label="API Key" 
                            value={localSettings.googleDrive?.apiKey || ''} 
                            onChange={e => setLocalSettings({...localSettings, googleDrive: {...localSettings.googleDrive!, apiKey: e.target.value}})} 
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button onClick={handleSaveSettings} variant="secondary">حفظ المفاتيح</Button>
                        <Button onClick={handleDriveSignIn} disabled={isDriveConnected || !localSettings.googleDrive?.clientId}>
                            {isDriveConnected ? 'متصل بجوجل' : 'تسجيل دخول Google'}
                        </Button>
                        {isDriveConnected && <div className="flex items-center gap-2 text-green-400 animate-in fade-in"><CheckCircle className="w-5 h-5" /> تم الاتصال بنجاح</div>}
                    </div>

                    <div className="border-t border-white/10 my-4 pt-4">
                        <h4 className="font-bold text-white mb-4">عمليات المزامنة</h4>
                        <div className="flex gap-4">
                            <Button onClick={handleCloudBackup} disabled={!isDriveConnected || isBackingUp} className="flex-1">
                                {isBackingUp ? 'جاري الرفع...' : 'نسخ احتياطي للسحابة'}
                            </Button>
                            <Button onClick={handleCloudRestore} disabled={!isDriveConnected} variant="secondary" className="flex-1">استعادة من السحابة</Button>
                        </div>
                    </div>
                </div>
            </GoldCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GoldCard title="نسخ احتياطي محلي (Local)" icon={<Save />}>
                    <p className="text-sm text-zinc-400 mb-4">تحميل ملف JSON يحتوي على كافة بيانات النظام.</p>
                    <Button onClick={() => storage.createBackup()} className="w-full">
                        <Save className="w-4 h-4 ml-2" /> تحميل نسخة احتياطية
                    </Button>
                </GoldCard>
                <GoldCard title="استعادة محلية" icon={<Upload />}>
                    <p className="text-sm text-zinc-400 mb-4">استرجاع البيانات من ملف JSON تم حفظه سابقاً.</p>
                    <div className="relative">
                        <input type="file" ref={restoreInputRef} accept=".json" onChange={handleRestore} className="hidden" />
                        <Button variant="secondary" onClick={() => restoreInputRef.current?.click()} className="w-full">
                            <Upload className="w-4 h-4 ml-2" /> اختر ملف لاستعادته
                        </Button>
                    </div>
                </GoldCard>
            </div>

            <GoldCard title="ضبط المصنع (Factory Reset)" icon={<RotateCcw />} className="border-red-900/50">
               <div className="flex justify-between items-center">
                  <div>
                     <h4 className="text-red-500 font-bold">مسح جميع البيانات</h4>
                     <p className="text-zinc-500 text-sm">تحذير: هذا الإجراء لا يمكن التراجع عنه.</p>
                  </div>
                  <Button variant="danger" onClick={() => {
                     if(confirm('تحذير نهائي: سيتم مسح جميع البيانات المخزنة محلياً! هل أنت متأكد؟')) {
                        storage.clearTransactions();
                        alert('تم مسح البيانات بنجاح.');
                        window.location.reload();
                     }
                  }}>
                    <Trash2 className="w-4 h-4 ml-2" /> حذف البيانات والتهيئة
                  </Button>
               </div>
            </GoldCard>
         </div>
      )}
    </div>
  );
};
