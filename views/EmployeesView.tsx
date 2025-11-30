
import React, { useState } from 'react';
import { UserCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { Employee } from '../types';
import { storage } from '../services/storage';
import { GoldCard, Input, Button } from '../components/UI';

export const EmployeesView = () => {
  const [employees, setEmployees] = useState<Employee[]>(storage.getEmployees());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      storage.updateEmployee({ ...empForm, id: editingId } as Employee);
    } else {
      storage.addEmployee({ ...empForm, id: Date.now().toString() } as Employee);
    }
    setEmployees(storage.getEmployees());
    setShowForm(false);
    setEditingId(null);
    setEmpForm({});
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEmpForm(emp);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      storage.deleteEmployee(id);
      setEmployees(storage.getEmployees());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gold-100">إدارة الموظفين</h2>
         <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setEmpForm({}); }}>
           <Plus className="w-4 h-4" /> {showForm ? 'إغلاق' : 'إضافة موظف'}
         </Button>
      </div>

      {showForm && (
        <GoldCard title={editingId ? "تعديل بيانات موظف" : "بيانات الموظف الجديد"}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الاسم" value={empForm.name || ''} onChange={e => setEmpForm({...empForm, name: e.target.value})} required />
            <Input label="الكود الوظيفي" value={empForm.code || ''} onChange={e => setEmpForm({...empForm, code: e.target.value})} required />
            <Input label="المسمى الوظيفي" value={empForm.jobTitle || ''} onChange={e => setEmpForm({...empForm, jobTitle: e.target.value})} required />
            <Input label="رقم الهاتف" value={empForm.phone || ''} onChange={e => setEmpForm({...empForm, phone: e.target.value})} required />
            <Input label="البريد الإلكتروني" value={empForm.email || ''} onChange={e => setEmpForm({...empForm, email: e.target.value})} />
            <div className="col-span-2"><Button type="submit" className="w-full">{editingId ? 'حفظ التعديلات' : 'إضافة الموظف'}</Button></div>
          </form>
        </GoldCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-zinc-900 border border-white/10 rounded-xl p-6 relative group hover:border-gold-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
               <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gold-500">
                  <UserCircle className="w-8 h-8" />
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleEdit(emp)} className="text-zinc-600 hover:text-gold-500"><Edit className="w-5 h-5" /></button>
                 <button onClick={() => handleDelete(emp.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
               </div>
            </div>
            <h3 className="text-lg font-bold text-white">{emp.name}</h3>
            <p className="text-gold-400 text-sm mb-2">{emp.jobTitle}</p>
            <div className="space-y-1 text-sm text-zinc-400">
              <p>كود: {emp.code}</p>
              <p>هاتف: {emp.phone}</p>
              <p>{emp.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
