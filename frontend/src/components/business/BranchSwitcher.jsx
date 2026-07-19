import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, ArrowLeftRight, Check, MapPin, Map, Phone } from 'lucide-react';
import { getBranches, createBranch, switchBranch } from '../../services/businessService';
import { useToasts, ToastStack } from '../admin/AdminUI';

export default function BranchSwitcher({ me }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [branchesData, setBranchesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { toasts, push } = useToasts();

  const isChainOrBranch = me?.branchType === 'zincir' || me?.parentBusinessId || (me?.role === 'employee' && me?.allowedBranches?.length > 1);

  useEffect(() => {
    if (isChainOrBranch && isOpen && !branchesData) {
      loadBranches();
    }
  }, [isOpen, isChainOrBranch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await getBranches();
      setBranchesData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (targetId) => {
    if (targetId === me._id) return;
    try {
      await switchBranch(targetId);
      window.location.reload(); // Reload to fetch new context
    } catch (err) {
      push('Şubeye geçiş yapılamadı.', 'error');
    }
  };

  if (!isChainOrBranch && !me) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 active:scale-95 ${isOpen ? 'ring-2 ring-emerald-500/20 border-emerald-300' : ''}`}
        >
          <Store className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">
            {me?.name}{me?.branchName ? ` - ${me.branchName}` : ''}
          </span>
          <ArrowLeftRight className="h-3.5 w-3.5 text-gray-400" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50"
            >
              <div className="border-b border-gray-50 bg-gray-50/50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hesaplar & Şubeler</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto p-2">
                {loading ? (
                  <div className="py-4 text-center text-sm text-gray-400">Yükleniyor...</div>
                ) : (
                  branchesData?.accounts?.map(acc => {
                    const isCurrent = acc._id === me._id;
                    const isMain = acc._id === branchesData.parentId;
                    return (
                      <button
                        key={acc._id}
                        onClick={() => handleSwitch(acc._id)}
                        disabled={isCurrent}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${isCurrent ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              {acc.name}{acc.branchName ? ` - ${acc.branchName}` : ''}
                            </span>
                            {isMain && <span className="shrink-0 rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">MERKEZ</span>}
                          </div>
                          <p className="truncate text-xs text-gray-400">{acc.address}</p>
                        </div>
                        {isCurrent && <Check className="ml-2 h-4 w-4 shrink-0 text-emerald-600" />}
                      </button>
                    )
                  })
                )}
              </div>

              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Şube Ekle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAddModalOpen && (
          <AddBranchModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={() => {
              setIsAddModalOpen(false);
              loadBranches();
              push('Yeni şube eklendi.', 'success');
            }}
            push={push}
          />
        )}
      </div>
      <ToastStack toasts={toasts} />
    </>
  );
}

function AddBranchModal({ onClose, onSuccess, push }) {
  const [form, setForm] = useState({ branchName: '', mapsUrl: '', address: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBranch(form);
      onSuccess();
    } catch (err) {
      push(err?.response?.data?.message || 'Şube eklenemedi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Yeni Şube Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Şube Adı / Semt</label>
            <div className="relative">
              <Store className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full rounded-xl border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="Örn: Moda, Kadıköy, Merkez..."
                value={form.branchName}
                onChange={e => setForm({...form, branchName: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefon Numarası</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                required
                className="w-full rounded-xl border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="05XX XXX XX XX"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tam Adres</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                required
                rows={2}
                className="w-full rounded-xl border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="Açık adres giriniz..."
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Google Maps Konum Linki <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
            <div className="relative">
              <Map className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="url"
                className="w-full rounded-xl border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                placeholder="https://maps.google.com/..."
                value={form.mapsUrl}
                onChange={e => setForm({...form, mapsUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Ekleniyor...' : 'Şubeyi Ekle'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
