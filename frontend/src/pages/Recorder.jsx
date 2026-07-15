import React, { useRef, useState } from 'react';
import { Video, Square, Download, Monitor } from 'lucide-react';

// Sadece yerel kullanım için: tarayıcının Screen Capture API'si ile
// bu sekmeyi/ekranı kaydedip .webm olarak indirmeni sağlar.
// Hiçbir görüntü/veri dışarı gönderilmez, her şey tarayıcıda kalır.
export default function Recorder() {
  const [status, setStatus] = useState('idle'); // idle | recording | done
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const pickMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const startRecording = async () => {
    setError(null);
    setVideoUrl(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      streamRef.current = stream;

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('done');
        stream.getTracks().forEach((t) => t.stop());
      };

      // Kullanıcı tarayıcının kendi "paylaşımı durdur" butonunu kullanırsa da kaydı düzgün kapat
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };

      recorder.start();
      setStatus('recording');
    } catch (err) {
      setError('Ekran paylaşımı başlatılamadı. İzin vermen ya da tarayıcı desteği gerekiyor.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const reset = () => {
    setStatus('idle');
    setVideoUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center">
            <Monitor className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ekran Kayıt Aracı</h1>
            <p className="text-sm text-gray-500">Yalnızca bu tarayıcıda çalışır, hiçbir yere yüklenmez.</p>
          </div>
        </div>

        <div className="mt-6 aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
          {status !== 'done' ? (
            <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-contain" />
          ) : (
            <video src={videoUrl} controls className="w-full h-full object-contain" />
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {status === 'idle' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition"
            >
              <Video className="h-4 w-4" /> Kaydı Başlat
            </button>
          )}

          {status === 'recording' && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition animate-pulse"
            >
              <Square className="h-4 w-4" /> Kaydı Durdur
            </button>
          )}

          {status === 'done' && (
            <>
              <a
                href={videoUrl}
                download={`arti-frontend-kayit-${Date.now()}.webm`}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition"
              >
                <Download className="h-4 w-4" /> Videoyu İndir
              </a>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Yeni Kayıt
              </button>
            </>
          )}
        </div>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          "Kaydı Başlat"a bastığında tarayıcı sana kaydedilecek pencereyi/sekmeyi soracak.
          "Bu Sekme"yi seçip başka bir sekmede (ör. localhost:5174) gezinerek frontend'ini kaydedebilirsin,
          bittiğinde buraya dönüp durdur.
        </p>
      </div>
    </div>
  );
}
