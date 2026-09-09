import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  QrCode, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Share2, 
  Check, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { renderPhotostrip } from '../utils/canvasRenderer';
import { playPopSound } from '../utils/audio';

export default function ResultView({
  editorData,
  onEditAgain,
  onRetakeAll,
}) {
  const [renderedImageUrl, setRenderedImageUrl] = useState(null);
  const [isRendering, setIsRendering] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Generate high-resolution canvas render on mount
  useEffect(() => {
    let isMounted = true;

    async function generateImage() {
      setIsRendering(true);
      try {
        const dataUrl = await renderPhotostrip({
          photos: editorData.photos,
          layout: editorData.layout,
          filterId: editorData.filterId,
          frameColorId: editorData.frameColorId,
          framePatternId: editorData.framePatternId,
          motifId: editorData.motifId,
          caption: editorData.caption,
          dateString: editorData.dateString,
          stamps: editorData.stamps,
        });

        if (isMounted) {
          setRenderedImageUrl(dataUrl);
          setIsRendering(false);

          // Trigger celebratory confetti!
          triggerConfetti();
        }
      } catch (err) {
        console.error('Canvas render failed:', err);
        if (isMounted) setIsRendering(false);
      }
    }

    generateImage();

    return () => {
      isMounted = false;
    };
  }, [editorData]);

  // Confetti effect
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#3B82F6', '#93C5FD', '#1E293B', '#FFFFFF'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!renderedImageUrl) return;
    playPopSound();

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `yukphoto_${timestamp}_strip.png`;
    link.href = renderedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!renderedImageUrl) return;
    playPopSound();

    try {
      const response = await fetch(renderedImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Share or Open in New Tab
  const handleOpenPreview = () => {
    if (!renderedImageUrl) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<body style="margin:0;background:#09090f;display:flex;justify-content:center;align-items:center;min-height:100vh;">
          <img src="${renderedImageUrl}" style="max-height:95vh;max-width:95vw;box-shadow:0 20px 50px rgba(0,0,0,0.8);border-radius:16px;" />
        </body>`
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] py-8 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col justify-between font-sans">
      
      {/* Top Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-medium mb-3">
          <Check className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
          <span>Foto Strip Berhasil Diciptakan</span>
        </div>
        <h2 className="font-sans font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          Ini Dia Hasil Fotomu!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Strip fotomu sudah siap dalam resolusi tinggi. Unduh ke perangkatmu atau scan QR code untuk dibuka di smartphone.
        </p>
      </div>

      {/* Main Grid: Left Photostrip Preview, Right Action Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto w-full mb-10">
        
        {/* Left: Photostrip Image Preview (7 cols on md) */}
        <div className="md:col-span-7 flex justify-center">
          <div className="relative group max-w-[320px] sm:max-w-[360px] w-full">
            {isRendering ? (
              <div className="aspect-[1/2] rounded-3xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm text-slate-900 dark:text-white">Merender Kualitas Tinggi...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Menerapkan warna, pola motif & stempel ke kanvas 300 DPI</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden photostrip-shadow border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-black/40 backdrop-blur-md">
                <img
                  src={renderedImageUrl}
                  alt="Hasil Akhir Photobooth"
                  className="w-full h-auto object-contain block select-none"
                />

                {/* Floating Quick Action Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={handleOpenPreview}
                    className="p-3 rounded-full bg-white text-slate-900 hover:scale-110 shadow-lg transition-transform"
                    title="Buka Gambar Penuh"
                  >
                    <ExternalLink className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-full bg-blue-600 text-white hover:scale-110 shadow-lg transition-transform"
                    title="Unduh Langsung"
                  >
                    <Download className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Options (5 cols on md) */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Main Download Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-300 dark:border-slate-700/80 space-y-4">
            <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
              Opsi Simpan & Bagikan
            </h3>

            {/* Big Download Button */}
            <button
              onClick={handleDownload}
              disabled={isRendering}
              id="btn-download-photo"
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.98]"
            >
              <Download className="w-5 h-5" strokeWidth={1.75} />
              <span>Download Foto (PNG)</span>
            </button>

            {/* QR Code Button */}
            <button
              onClick={() => {
                playPopSound();
                setShowQrModal(true);
              }}
              disabled={isRendering}
              className="w-full py-3.5 px-5 rounded-xl glass-button text-slate-800 dark:text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
              <span>Tampilkan QR Code HP</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isRendering}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
                  <span>Salin Gambar ke Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Actions Card */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                playPopSound();
                onEditAgain();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Edit Lagi</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                if (window.confirm('Mulai sesi foto baru dari awal?')) {
                  onRetakeAll();
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-xl glass-button text-xs font-semibold text-rose-300 hover:text-white flex items-center justify-center gap-1.5 hover:bg-rose-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Foto Ulang</span>
            </button>
          </div>

        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="glass-panel max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-white/20 text-center shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Scan QR Code di HP
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Arahkan kamera smartphone kamu ke QR code ini untuk melihat & mengunduh foto strip.
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <QRCodeSVG
                value={window.location.href}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Menghubungkan ke studio yukphoto lokal kamu.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
