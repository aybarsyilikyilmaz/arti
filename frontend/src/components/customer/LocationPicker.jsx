// Konum seçici — Leaflet + OpenStreetMap (ücretsiz, API key yok).
// Mobil uygulamadaki "sürpriz kutuları haritada göster + mesafe seç" akışının web hali:
// harita ortasındaki pin seçili konumdur; mesafe çemberi yarıçapı gösterir; kutular
// yeşil sayaç pinleriyle işaretlenir. "Mevcut konumumu kullan" (tarayıcı GPS) ve
// "adres/semt ara" (Nominatim geocoding) desteklenir. "Bu konumu kullan" → keşfet
// bu koordinat + yarıçapa göre yakındaki kutuları getirir.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Search, X, Loader2, MapPin } from 'lucide-react';
import * as customerService from '../../services/customerService';

const boxIcon = (txt) => L.divIcon({
  className: '',
  html: `<div style="display:flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 6px;border-radius:9999px;background:#047857;color:#fff;font-size:11px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;white-space:nowrap">${txt}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Harita hareket edince merkez koordinatını yukarı bildir (pin hep ekran ortasında)
function MoveWatcher({ onMove }) {
  const map = useMapEvents({
    moveend() { const c = map.getCenter(); onMove(c.lat, c.lng); },
  });
  return null;
}

// Programatik konum değişiminde (GPS/arama) haritayı oraya uçur
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], target.zoom || map.getZoom());
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LocationPicker({ open, onClose, initial, onConfirm }) {
  const [center, setCenter] = useState({ lat: initial?.lat ?? 40.9825, lng: initial?.lng ?? 29.0264 });
  const [radiusKm, setRadiusKm] = useState(initial?.radiusKm ?? 5);
  const [label, setLabel] = useState(initial?.label ?? 'Kadıköy, İstanbul');
  const [flyTarget, setFlyTarget] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [err, setErr] = useState('');

  // Haritada göstermek için tüm kutuların konumları (marker)
  useEffect(() => {
    if (!open) return;
    customerService.listBoxes().then((data) => setBoxes(data || [])).catch(() => {});
  }, [open]);

  const markers = useMemo(
    () => (boxes || []).filter((b) => b.location?.coordinates?.length === 2),
    [boxes]
  );

  const flyTo = (lat, lng, newLabel, zoom) => {
    setCenter({ lat, lng });
    setFlyTarget({ lat, lng, zoom, ts: Date.now() });
    if (newLabel) setLabel(newLabel);
  };

  const useMyLocation = () => {
    setErr('');
    if (!navigator.geolocation) { setErr('Tarayıcın konum servisini desteklemiyor.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { flyTo(pos.coords.latitude, pos.coords.longitude, 'Mevcut konumun', 15); setLocating(false); },
      () => { setErr('Konum alınamadı. Tarayıcı izinlerini kontrol et.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const search = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true); setErr('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'tr' } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const short = data[0].display_name.split(',').slice(0, 2).join(',').trim();
        flyTo(parseFloat(data[0].lat), parseFloat(data[0].lon), short, 15);
      } else {
        setErr('Adres bulunamadı. Farklı bir semt/adres dene.');
      }
    } catch {
      setErr('Arama yapılamadı. Bağlantını kontrol et.');
    } finally {
      setSearching(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-gray-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Sürpriz kutular için konum seç</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Harita */}
          <div className="relative h-[300px] w-full">
            <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MoveWatcher onMove={(lat, lng) => setCenter({ lat, lng })} />
              <FlyTo target={flyTarget} />
              <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000}
                pathOptions={{ color: '#047857', fillColor: '#10b981', fillOpacity: 0.12, weight: 1.5 }} />
              {markers.map((b) => (
                <Marker
                  key={b._id}
                  position={[b.location.coordinates[1], b.location.coordinates[0]]}
                  icon={boxIcon(`${b.price}₺`)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">{b.business?.name || b.businessName}</p>
                      <p className="text-emerald-700 font-semibold">{b.price} ₺</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {/* Ekran ortasındaki seçili konum pini (harita ortası = seçilen nokta) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
              <MapPin className="h-9 w-9 fill-rose-500 text-rose-600 drop-shadow-lg" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-4 p-5">
            {/* Mesafe */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Mesafe seçin</span>
                <span className="text-sm font-bold text-emerald-700">{radiusKm} km</span>
              </div>
              <input
                type="range" min="1" max="20" step="1" value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Adres/semt arama */}
            <form onSubmit={search} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Adres veya semt ara (örn. Kadıköy Meydan)"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button type="submit" disabled={searching} className="text-xs font-semibold text-emerald-700 disabled:opacity-50">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ara'}
              </button>
            </form>

            <button onClick={useMyLocation} disabled={locating}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 disabled:opacity-50">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              Mevcut konumumu kullan
            </button>

            {err && <p className="text-center text-xs text-rose-500">{err}</p>}
          </div>
        </div>

        {/* Onay */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => onConfirm({ lat: center.lat, lng: center.lng, radiusKm, label })}
            className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-[0.99]"
          >
            Bu konumu kullan
          </button>
        </div>
      </div>
    </div>
  );
}
