import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Shield, Laptop, Smartphone, Key, LogOut, Loader2, X, Monitor } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, useToasts, ToastStack, PrimaryButton, DangerButton } from '../../components/admin/AdminUI';

function parseDeviceInfo(raw) {
  if (!raw) return 'Bilinmeyen Cihaz';
  if (raw.includes('iPhone') || raw.includes('iPad')) return raw.includes('CriOS') ? 'Chrome / iOS' : 'Safari / iOS';
  if (raw.includes('Android')) return 'Android';
  if (raw.includes('Firefox')) return 'Firefox';
  if (raw.includes('Edg/')) return 'Microsoft Edge';
  if (raw.includes('Chrome')) return 'Google Chrome';
  if (raw.includes('Safari')) return 'Safari';
  return 'Tarayıcı';
}

function getDeviceIcon(info) {
  if (!info) return <Monitor className="h-5 w-5 text-gray-500" />;
  const l = info.toLowerCase();
  if (l.includes('iphone') || l.includes('android') || l.includes('mobile')) return <Smartphone className="h-5 w-5 text-gray-500" />;
  if (l.includes('ipad') || l.includes('tablet')) return <Laptop className="h-5 w-5 text-gray-500" />;
  return <Monitor className="h-5 w-5 text-gray-500" />;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('tr-TR', { 
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function BusinessSettings() {
  const navigate = useNavigate();
  const { toasts, push } = useToasts();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  // Password Modal
  const [showModal, setShowModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await businessService.getSessions();
      setSessions(data);
    } catch (e) {
      push(apiErrorMessage(e, 'Oturumlar yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRevoke = async (deviceId, isCurrent) => {
    setRevoking(deviceId);
    try {
      await businessService.revokeSession(deviceId);
      if (isCurrent) {
        localStorage.removeItem('business_token');
        navigate('/business/login');
        return;
      }
      setSessions(prev => prev.filter(s => s.deviceId !== deviceId));
      push('Oturum sonlandırıldı.', 'success');
    } catch (e) {
      push(apiErrorMessage(e, 'İşlem başarısız.'), 'error');
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await businessService.revokeAllSessions();
      push('Diğer tüm oturumlar kapatıldı.', 'success');
      load();
    } catch (e) {
      push(apiErrorMessage(e, 'İşlem başarısız.'), 'error');
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.newPasswordConfirm) {
      return push('Şifreler eşleşmiyor.', 'error');
    }
    if (pwdForm.newPassword.length < 8) {
      return push('Yeni şifre en az 8 karakter olmalıdır.', 'error');
    }

    setPwdLoading(true);
    try {
      await businessService.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      push('Şifreniz başarıyla değiştirildi. Diğer oturumlar kapatıldı.', 'success');
      setShowModal(false);
      setPwdForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
      load();
    } catch (e) {
      push(apiErrorMessage(e, 'Şifre değiştirilemedi.'), 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div></LightCard>;
  }

  return (
    <div className="max-w-4xl">
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Güvenlik ve Oturumlar</h1>
          <p className="mt-1 text-sm text-gray-500">Hesabınıza bağlı cihazları ve şifrenizi yönetin</p>
        </div>
        <PrimaryButton className="px-4 py-2 text-sm" onClick={() => setShowModal(true)}>
          <Key className="h-4 w-4" />
          Şifre Değiştir
        </PrimaryButton>
      </div>

      <LightCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Aktif Oturumlar</h2>
              <p className="text-sm text-gray-500">Hesabınıza şu anda giriş yapmış olan cihazlar.</p>
            </div>
          </div>
          {sessions.length > 1 && (
            <DangerButton 
              className="px-4 py-2"
              onClick={handleLogoutAll} 
              disabled={logoutAllLoading}
            >
              {logoutAllLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Diğer Tüm Cihazlardan Çıkış Yap
            </DangerButton>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {sessions.map((s) => (
            <div key={s.deviceId} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                  {getDeviceIcon(s.deviceInfo)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{parseDeviceInfo(s.deviceInfo)}</p>
                    {s.isCurrent && (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Bu Cihaz
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.ip} • Son aktivite: {formatDate(s.lastActiveAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(s.deviceId, s.isCurrent)}
                disabled={revoking === s.deviceId}
                className="text-sm font-medium text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title={s.isCurrent ? "Bu cihazdan çıkış yap" : "Oturumu sonlandır"}
              >
                {revoking === s.deviceId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Çıkış Yap'}
              </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">
              Kayıtlı oturum bulunamadı.
            </div>
          )}
        </div>
      </LightCard>

      {/* Şifre Değiştirme Modalı */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                <input
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  required
                  value={pwdForm.newPasswordConfirm}
                  onChange={e => setPwdForm(f => ({ ...f, newPasswordConfirm: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-70"
                >
                  {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Şifreyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
