import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LifeBuoy, Send, CheckCircle2, RefreshCw, X, MessageSquarePlus } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { GhostButton, Spinner, useToasts, ToastStack, EmptyState } from '../../components/admin/AdminUI'; // Using some shared UI components if possible

const TICKET_STATUS = {
  OPEN: { label: 'Açık', color: 'bg-rose-100 text-rose-700', border: 'border-rose-200' },
  ANSWERED: { label: 'Yanıtlandı', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  CLOSED: { label: 'Çözüldü', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' }
};

export default function BusinessTickets() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  
  // Detay & Yeni
  const [activeTicket, setActiveTicket] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // Mesaj gönderme / durum
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await businessService.listTickets();
      setTickets(data);
    } catch (err) {
      push(apiErrorMessage(err, 'Destek talepleri yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setActionLoading(true);
    try {
      const created = await businessService.createTicket({ subject: newSubject.trim(), message: newMessage.trim() });
      setTickets([created, ...tickets]);
      setActiveTicket(created);
      setIsCreating(false);
      setNewSubject('');
      setNewMessage('');
      push('Destek talebi oluşturuldu.', 'success');
    } catch (err) {
      push(apiErrorMessage(err, 'Talep oluşturulamadı.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setActionLoading(true);
    try {
      const updated = await businessService.addTicketMessage(activeTicket._id, replyText.trim());
      setActiveTicket(updated);
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      setReplyText('');
    } catch (err) {
      push(apiErrorMessage(err, 'Yanıt gönderilemedi.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!activeTicket) return;
    setActionLoading(true);
    try {
      const updated = await businessService.closeTicket(activeTicket._id);
      setActiveTicket(updated);
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      push('Talep çözüldü olarak işaretlendi.', 'success');
    } catch (err) {
      push(apiErrorMessage(err, 'Durum güncellenemedi.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <ToastStack toasts={toasts} />
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <LifeBuoy className="h-6 w-6 text-brand" /> Destek Merkezi
          </h1>
          <p className="mt-1 text-sm text-gray-500">Yaşadığınız sorunlar veya talepleriniz için bize ulaşın.</p>
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={load} className="p-2.5" title="Yenile">
            <RefreshCw className="h-4 w-4" />
          </GhostButton>
          <button
            onClick={() => { setIsCreating(true); setActiveTicket(null); }}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            <MessageSquarePlus className="h-4 w-4" /> Yeni Talep
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* Sol Liste */}
        <div className={`flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm ${activeTicket || isCreating ? 'hidden lg:flex lg:w-1/3' : 'w-full lg:w-1/3'}`}>
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><Spinner className="h-8 w-8" /></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={LifeBuoy} title="Destek Talebi Yok" desc="Henüz oluşturduğunuz bir talep bulunmuyor." />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid gap-2">
                {tickets.map(t => (
                  <button
                    key={t._id}
                    onClick={() => { setActiveTicket(t); setIsCreating(false); }}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
                      activeTicket?._id === t._id 
                        ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                        : 'border-gray-100 hover:border-brand/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-400">{t.ticketNumber}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TICKET_STATUS[t.status].color} ${TICKET_STATUS[t.status].border}`}>
                        {TICKET_STATUS[t.status].label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{t.subject}</h3>
                    <p className="text-[11px] text-gray-500">
                      {new Date(t.updatedAt || t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Detay / Sohbet Görünümü */}
        {isCreating ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Yeni Destek Talebi</h2>
              <GhostButton onClick={() => setIsCreating(false)}><X className="h-5 w-5" /></GhostButton>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Konu</label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Kısaca sorununuz nedir?"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Mesajınız</label>
                <textarea
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Detaylı bilgi verin..."
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:opacity-50"
                >
                  {actionLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />} Gönder
                </button>
              </div>
            </form>
          </div>
        ) : activeTicket ? (
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">{activeTicket.subject}</h2>
                  <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${TICKET_STATUS[activeTicket.status].color} ${TICKET_STATUS[activeTicket.status].border}`}>
                    {TICKET_STATUS[activeTicket.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{activeTicket.ticketNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeTicket.status !== 'CLOSED' && (
                  <button
                    onClick={handleClose}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Çözüldü
                  </button>
                )}
                <GhostButton onClick={() => setActiveTicket(null)} className="lg:hidden">
                  <X className="h-5 w-5" />
                </GhostButton>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="space-y-6">
                {activeTicket.messages.map((msg, i) => {
                  const isMe = msg.senderModel === 'Business';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMe ? 'rounded-tr-sm bg-brand text-white' : 'rounded-tl-sm bg-white border border-gray-100 text-gray-900'
                      }`}>
                        {!isMe && <div className="text-xs font-bold text-brand mb-1">Artı Destek Ekibi</div>}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                        <div className={`mt-2 text-right text-[10px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
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
              <div className="border-t border-gray-100 bg-white p-4">
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    rows="3"
                  />
                  <button
                    onClick={handleReply}
                    disabled={actionLoading || !replyText.trim()}
                    className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"
                  >
                    {actionLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {activeTicket.status === 'CLOSED' && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
                Bu bilet kapatıldı. Sorununuz devam ediyorsa lütfen yeni bir destek talebi oluşturun.
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <EmptyState icon={LifeBuoy} title="Destek Merkezi" desc="Sol taraftan bir bilet seçin veya yeni talep oluşturun." />
          </div>
        )}
      </div>
    </div>
  );
}
