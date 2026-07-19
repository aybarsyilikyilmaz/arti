import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Key, CheckCircle2, Shield, User, Loader2, XCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import * as businessService from '../../services/businessService';
import { useToasts, ToastStack } from '../../components/admin/AdminUI';
import { useAuth } from '../../hooks/useAuth';

const PAGE_OPTIONS = [
  { value: 'genel-bakis', label: 'Genel Bakış' },
  { value: 'siparisler', label: 'Siparişler' },
  { value: 'kutu', label: 'Kutu & Teslimat' },
  { value: 'finans', label: 'Finans & Ödemeler' },
  { value: 'vitrin', label: 'Vitrin Yönetimi' },
  { value: 'profil', label: 'Profilim' },
  { value: 'ayarlar', label: 'Ayarlar' },
];

export default function TeamManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allowedPages, setAllowedPages] = useState([]);
  const [branchIds, setBranchIds] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, push } = useToasts();
  const { me } = useOutletContext();

  useEffect(() => {
    fetchEmployees();
    if (me?.branchType === 'zincir') {
      fetchBranches();
    }
  }, [me]);

  const fetchBranches = async () => {
    try {
      const data = await businessService.getBranches();
      if (data && data.accounts) {
        setBranches(data.accounts);
      }
    } catch (err) {
      console.error('Şubeler alınamadı', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await businessService.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      push('Ekip listesi alınamadı.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPassword('');
    setAllowedPages([]);
    setBranchId(me?._id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPassword(''); // Boş bırak, sadece istenirse güncellensin
    setAllowedPages(emp.allowedPages || []);
    
    // Set allowedBranches or default to single business
    let currentBranchIds = [];
    if (emp.allowedBranches && emp.allowedBranches.length > 0) {
      currentBranchIds = emp.allowedBranches.map(b => typeof b === 'object' ? b._id : b);
    } else {
      currentBranchIds = [emp.businessId || emp.business || me?._id || ''];
    }
    setBranchIds(currentBranchIds);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPassword('');
    setAllowedPages([]);
    setBranchIds([]);
    setIsModalOpen(false);
  };

  const togglePage = (pageValue) => {
    setAllowedPages(prev => 
      prev.includes(pageValue) 
        ? prev.filter(p => p !== pageValue)
        : [...prev, pageValue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        const payload = { allowedPages, branchIds };
        if (password) payload.password = password;
        await businessService.updateEmployee(editingEmployee._id, payload);
        push('Çalışan başarıyla güncellendi.', 'success');
      } else {
        await businessService.createEmployee({ name, email, password, allowedPages, branchIds });
        push('Çalışan başarıyla oluşturuldu.', 'success');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      push(err.response?.data?.message || 'Bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu çalışanı silmek istediğinize emin misiniz?')) return;
    try {
      await businessService.deleteEmployee(id);
      push('Çalışan silindi.', 'success');
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      push('Çalışan silinemedi.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ekip Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">
            İşletmenizde çalışan personele kısıtlı erişim yetkisi verebilirsiniz.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Yeni Çalışan
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {employees.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">Henüz çalışan eklenmemiş</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kasa görevlisi veya mağaza sorumlusu için yeni bir hesap oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          employees.map((emp) => (
            <motion.div
              key={emp._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                    </div>
                  </div>
                  {me?.branchType === 'zincir' && (
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      {emp.businessName || 'Ana İşletme'}
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Yetkiler</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {emp.allowedPages?.length > 0 ? (
                      emp.allowedPages.map(page => (
                        <span key={page} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                          {PAGE_OPTIONS.find(p => p.value === page)?.label || page}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Yetki verilmemiş</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => openEditModal(emp)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Düzenle
                </button>
                <button
                  onClick={() => handleDelete(emp._id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {!editingEmployee && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">İsim Soyisim</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">E-posta (Giriş için)</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Şifre {editingEmployee && '(Değiştirmek için doldurun)'}</label>
                    <input
                      type="password"
                      required={!editingEmployee}
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={editingEmployee ? "••••••••" : ""}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {me?.branchType === 'zincir' && branches.length > 0 && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Şube Seçimi (Çoklu Seçim)</label>
                      <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3 max-h-48 overflow-y-auto">
                        {branches.map(b => {
                          const branchName = `${b.name}${b.branchName ? ` - ${b.branchName}` : (!b.parentBusinessId ? ' (Merkez)' : '')}`;
                          return (
                            <label key={b._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-100">
                              <input
                                type="checkbox"
                                checked={branchIds.includes(b._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setBranchIds(prev => [...prev, b._id]);
                                  } else {
                                    setBranchIds(prev => prev.filter(id => id !== b._id));
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                              />
                              <span className="text-sm text-gray-700">{branchName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Sayfa Yetkileri</label>
                    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      {PAGE_OPTIONS.map(page => (
                        <label key={page.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={allowedPages.includes(page.value)}
                            onChange={() => togglePage(page.value)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{page.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </div>
  );
}
