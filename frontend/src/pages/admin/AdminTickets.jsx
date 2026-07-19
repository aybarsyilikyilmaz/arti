import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Store, User, Search, RefreshCw, X, Send, CheckCircle2, Clock } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, GhostButton, useToasts, ToastStack, EmptyState } from '../../components/admin/AdminUI';

const TICKET_STATUS = {
  OPEN: { label: 'Açık', color: 'bg-rose-100 text-rose-700', border: 'border-rose-200' },
  ANSWERED: { label: 'Yanıtlandı', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  CLOSED: { label: 'Çözüldü', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' }
};

export default function AdminTickets() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  // Filtreler
  const [typeFilter, setTypeFilter] = useState('user'); // 'user' | 'business'
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'OPEN' | 'ANSWERED' | 'CLOSED'
  const [searchTerm, setSearchTerm] = useState(''); // Arama metni
  const [appliedSearch, setAppliedSearch] = useState('');

  // Seçili Bilet Detayı
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const messagesEndRef = useRef(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminService.listTickets({ page: p, limit: 30, type: typeFilter, status: statusFilter, search: appliedSearch });
      setTickets(res.data.tickets);
      setTotal(res.total);
      setPage(p);
    } catch (err) {
      push(apiErrorMessage(err, 'Biletler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, appliedSearch, push]);

  useEffect(() => { load(1); }, [load]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchTerm);
  };

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages]);

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setReplying(true);
    try {
      const res = await adminService.replyTicket(activeTicket._id, replyText.trim());
      setActiveTicket(res);
      setReplyText('');
      push('Yanıt gönderildi.', 'success');
      // Listeyi de sessizce güncelle (son yanıtlananı üste almak vs. için)
      load(page);
    } catch (err) {
      push(apiErrorMessage(err, 'Yanıt gönderilemedi.'), 'error');
    } finally {
      setReplying(false);
    }
  };

  const toggleStatus = async (newStatus) => {
    if (!activeTicket) return;
    setStatusUpdating(true);
    try {
      const res = await adminService.updateTicketStatus(activeTicket._id, newStatus);
      setActiveTicket(res);
      push(newStatus === 'CLOSED' ? 'Bilet kapatıldı.' : 'Bilet açıldı.', 'success');
      load(page);
    } catch (err) {
      push(apiErrorMessage(err, 'Durum güncellenemedi.'), 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <ToastStack toasts={toasts} />
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <LifeBuoy className="h-6 w-6 text-emerald-600" /> Destek Talepleri
          </h1>
          <p className="mt-1 text-sm text-gray-500">Müşteri ve İşletme biletlerini yönetin.</p>
        </div>
        <GhostButton onClick={() => load(page)} className="p-2.5" title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </GhostButton>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="İsim, mail veya bilet no ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 py-1.5 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setTypeFilter('user')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              typeFilter === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4" /> Müşteriler
          </button>
          <button
            onClick={() => setTypeFilter('business')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              typeFilter === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className="h-4 w-4" /> İşletmeler
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 py-1.5 pl-3 pr-8 text-sm font-semibold text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Tüm Durumlar</option>
          <option value="OPEN">Açık</option>
          <option value="ANSWERED">Yanıtlandı</option>
          <option value="CLOSED">Çözüldü</option>
        </select>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* Sol Tablo (Bilet Listesi) */}
        <div className={`flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm ${activeTicket ? 'hidden lg:flex lg:w-1/2' : 'w-full lg:w-1/2'}`}>
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><Spinner className="h-8 w-8" /></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={LifeBuoy} title="Bilet Bulunamadı" desc="Bu kriterlere uyan destek talebi yok." />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid gap-2">
                {tickets.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setActiveTicket(t)}
                    className={`flex items-start justify-between rounded-xl border p-4 text-left transition ${
                      activeTicket?._id === t._id 
                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                        : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">{t.ticketNumber}</span>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TICKET_STATUS[t.status].color} ${TICKET_STATUS[t.status].border}`}>
                          {TICKET_STATUS[t.status].label}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-gray-900">{t.subject}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        {typeFilter === 'user' ? (
                          <><User className="h-3 w-3" /> {t.user?.name || 'Bilinmeyen Kullanıcı'}</>
                        ) : (
                          <><Store className="h-3 w-3" /> {t.business?.name || 'Bilinmeyen İşletme'}</>
                        )}
                        <span className="mx-1">•</span>
                        {new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Detay / Sohbet Görünümü */}
        {activeTicket && (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">{activeTicket.subject}</h2>
                  <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${TICKET_STATUS[activeTicket.status].color} ${TICKET_STATUS[activeTicket.status].border}`}>
                    {TICKET_STATUS[activeTicket.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {typeFilter === 'user' ? activeTicket.user?.name : activeTicket.business?.name} ({activeTicket.ticketNumber})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeTicket.status === 'CLOSED' ? (
                  <GhostButton onClick={() => toggleStatus('OPEN')} disabled={statusUpdating} title="Bileti Tekrar Aç">
                    <RefreshCw className="h-4 w-4" />
                  </GhostButton>
                ) : (
                  <button
                    onClick={() => toggleStatus('CLOSED')}
                    disabled={statusUpdating}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Çözüldü
                  </button>
                )}
                <GhostButton onClick={() => setActiveTicket(null)} className="lg:hidden">
                  <X className="h-5 w-5" />
                </GhostButton>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {activeTicket.messages.map((msg, i) => {
                  const isAdmin = msg.senderModel === 'Admin';
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isAdmin ? 'rounded-tr-sm bg-emerald-500 text-white shadow-sm' : 'rounded-tl-sm bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                        <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${isAdmin ? 'text-emerald-100' : 'text-gray-400'}`}>
                          <Clock className="h-3 w-3" />
                          {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Yanıt Gönderme Alanı */}
            {activeTicket.status !== 'CLOSED' && (
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    rows="3"
                  />
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-40"
                  >
                    {replying ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {activeTicket.status === 'CLOSED' && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
                Bu bilet çözüldü olarak işaretlenmiş. Yanıtlamak için tekrar açın.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
