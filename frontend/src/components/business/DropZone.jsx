// Şık drag&drop görsel yükleme alanı (beyaz tema) — vitrin editörü ve
// admin İşletme Detay → Kutu & Vitrin aynı bileşeni kullanır.
import React, { useRef, useState } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function DropZone({ label, hint, preview, onFile, aspect = 'aspect-[3/1]' }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const accept = (file) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      onFile(null, 'Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.');
      return;
    }
    onFile(file, null);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); accept(e.dataTransfer.files?.[0]); }}
      className={`group relative w-full overflow-hidden ${aspect} rounded-2xl border-2 border-dashed text-left
        transition-all duration-300 ease-in-out active:scale-[0.99] ${
        over
          ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/15'
          : preview
            ? 'border-transparent shadow-md hover:shadow-lg'
            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all duration-300 group-hover:bg-gray-900/40 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-800 shadow-lg">
              <ImagePlus className="h-3.5 w-3.5" /> Değiştir
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <div className={`rounded-xl p-2.5 transition-colors duration-300 ${over ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
      )}
    </button>
  );
}
