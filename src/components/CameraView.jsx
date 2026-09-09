import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, FlipHorizontal, ArrowLeft, AlertCircle, Upload, CheckCircle, Sparkles } from 'lucide-react';
import { playCountdownBeep, playShutterSound, playPopSound } from '../utils/audio';

export default function CameraView({ layout, onPhotosCaptured, onCancel }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);

  // Capture State
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturingSession, setIsCapturingSession] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [poseMessage, setPoseMessage] = useState('');

  const requiredCount = layout.photoCount;

  // Initialize webcam
  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: isFrontCamera ? 'user' : 'environment',
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda bisa mencoba lagi atau mengunggah foto langsung dari perangkat Anda.'
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  // Flip camera switch
  const toggleCamera = () => {
    playPopSound();
    setIsFrontCamera((prev) => !prev);
  };

  // Flip mirror toggle
  const toggleMirror = () => {
    playPopSound();
    setIsMirrored((prev) => !prev);
  };

  // Capture single frame from video to high-res dataURL
  const grabFrame = () => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Automated burst capture loop
  const startAutoCaptureSession = () => {
    if (isCapturingSession) return;
    playPopSound();
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsCapturingSession(true);
    runShotCycle(0, []);
  };

  const runShotCycle = (shotIndex, currentPhotos) => {
    if (shotIndex >= requiredCount) {
      // Completed all shots!
      setIsCapturingSession(false);
      setCountdown(null);
      setPoseMessage('');
      onPhotosCaptured(currentPhotos);
      return;
    }

    setCurrentShotIndex(shotIndex);
    setPoseMessage(`Bersiap untuk Foto ${shotIndex + 1} dari ${requiredCount}! 📸`);

    let count = 3;
    setCountdown(count);
    playCountdownBeep(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(count);
      } else if (count === 0) {
        clearInterval(timer);
        setCountdown(null);

        // Flash and snap!
        setShowFlash(true);
        playShutterSound();

        setTimeout(() => {
          setShowFlash(false);
        }, 350);

        const photoData = grabFrame();
        const updatedPhotos = [...currentPhotos, photoData];
        setCapturedPhotos(updatedPhotos);

        // Check if next shot needed
        if (shotIndex + 1 < requiredCount) {
          setPoseMessage(`Bagus! Ganti pose untuk foto berikutnya... ✨`);
          setTimeout(() => {
            runShotCycle(shotIndex + 1, updatedPhotos);
          }, 1800); // 1.8s breath between shots
        } else {
          setPoseMessage(`Selesai! Memproses hasil fotomu... 🎉`);
          setTimeout(() => {
            setIsCapturingSession(false);
            onPhotosCaptured(updatedPhotos);
          }, 1000);
        }
      }
    }, 1000);
  };

  // Fallback: Upload images manually
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const readers = files.slice(0, requiredCount).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      // If user uploaded fewer than required, repeat or allow
      let filled = [...results];
      while (filled.length < requiredCount) {
        filled.push(results[filled.length % results.length]);
      }
      playPopSound();
      setCapturedPhotos(filled);
      onPhotosCaptured(filled);
    });
  };

  // Fallback: Use sample avatars if testing without webcam
  const handleUseSamplePhotos = () => {
    playPopSound();
    // Generate beautiful colorful aesthetic photo placeholders
    const samples = [];
    const colors = [
      ['#8b5cf6', '#ec4899', 'Pose 1 • Smile 😊'],
      ['#3b82f6', '#06b6d4', 'Pose 2 • Peace ✌️'],
      ['#f59e0b', '#ef4444', 'Pose 3 • Wink 😉'],
      ['#10b981', '#6366f1', 'Pose 4 • Heart 💖'],
    ];

    for (let i = 0; i < requiredCount; i++) {
      const c = colors[i % colors.length];
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 1080, 1440);
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1440);

      // Circle avatar illustration
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(540, 600, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c[2], 540, 1050);

      samples.push(canvas.toDataURL('image/jpeg', 0.9));
    }

    setCapturedPhotos(samples);
    onPhotosCaptured(samples);
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4 sm:p-6">

      {/* Full Screen Flash Effect */}
      {showFlash && (
        <div className="fixed inset-0 z-50 bg-white animate-flash pointer-events-none" />
      )}

      <div className="max-w-5xl w-full mx-auto">

        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              playPopSound();
              onCancel();
            }}
            disabled={isCapturingSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ganti Format</span>
          </button>

          {/* Progress / Status Badge */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel-light text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-blue-300">{layout.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              {capturedPhotos.length} / {requiredCount} Foto
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMirror}
              title="Mirror Kamera"
              disabled={isCapturingSession}
              className={`p-2 rounded-xl glass-button text-xs transition-colors ${isMirrored ? 'text-blue-400 border-blue-500/40 bg-blue-500/10' : 'text-slate-400'
                }`}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={toggleCamera}
              title="Ganti Kamera Depan/Belakang"
              disabled={isCapturingSession}
              className="p-2 rounded-xl glass-button text-slate-400 hover:text-blue-400 text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Stage Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">

          {/* Main Viewfinder (3 cols) */}
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-black aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">

            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-200 ${isMirrored ? 'scale-x-[-1]' : ''
                }`}
            />

            {/* Error Overlay if webcam blocked */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-20">
                <AlertCircle className="w-12 h-12 text-blue-500 mb-3" />
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  Akses Kamera Diperlukan
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all"
                  >
                    Coba Hubungkan Ulang
                  </button>
                  <label className="px-5 py-2.5 rounded-xl glass-button text-white font-semibold text-xs cursor-pointer flex items-center gap-2 hover:bg-white/10">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Upload {requiredCount} Foto</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleUseSamplePhotos}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Gunakan Foto Contoh</span>
                  </button>
                </div>
              </div>
            )}

            {/* Countdown Overlay (Big animated number) */}
            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[2px]">
                <div className="relative">
                  <span className="font-display font-black text-8xl sm:text-9xl text-white tracking-tighter drop-shadow-[0_0_40px_rgba(37,99,235,0.8)]">
                    {countdown}
                  </span>
                </div>
                <p className="font-display font-bold text-lg sm:text-2xl text-blue-200 mt-4 tracking-wider uppercase drop-shadow-md">
                  Pose Foto {currentShotIndex + 1}! ✨
                </p>
              </div>
            )}

            {/* Pose Instruction Floating Banner */}
            {poseMessage && countdown === null && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-blue-500/40 text-blue-200 text-xs sm:text-sm font-semibold shadow-lg">
                {poseMessage}
              </div>
            )}

            {/* Viewfinder Rule-of-Thirds Grid Markers */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white/10"></div>
              <div className="border-r border-b border-white/10"></div>
              <div className="border-b border-white/10"></div>
              <div className="border-r border-b border-white/10"></div>
              <div className="border-r border-b border-white/10"></div>
              <div className="border-b border-white/10"></div>
              <div className="border-r border-b border-white/10"></div>
              <div className="border-r border-b border-white/10"></div>
              <div></div>
            </div>

            {/* Live Camera Bottom Action Bar */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center px-4">
              {!isCapturingSession ? (
                <button
                  onClick={startAutoCaptureSession}
                  id="btn-take-photo"
                  className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-base shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white group-hover:scale-125 transition-transform" />
                  </div>
                  <span>Ambil Foto ({requiredCount} Jepretan)</span>
                </button>
              ) : (
                <div className="px-6 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs text-blue-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Sesi Foto Berlangsung... Bersiaplah!</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live Photo Strip Preview (1 col) */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300">
                  Pratinjau Strip
                </h4>
                <span className="text-[11px] text-blue-400 font-mono">
                  {capturedPhotos.length}/{requiredCount}
                </span>
              </div>

              {/* Slots preview */}
              <div className="space-y-2.5">
                {Array.from({ length: requiredCount }).map((_, idx) => {
                  const photo = capturedPhotos[idx];
                  const isCurrent = isCapturingSession && currentShotIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl overflow-hidden border aspect-[4/3] flex items-center justify-center transition-all ${photo
                          ? 'border-blue-500/50 bg-black'
                          : isCurrent
                            ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/40 animate-pulse'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                    >
                      {photo ? (
                        <>
                          <img
                            src={photo}
                            alt={`Shot ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono font-bold text-white flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                            <span>#{idx + 1}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Camera className="w-4 h-4 mb-1 opacity-50" />
                          <span className="text-[10px] font-semibold">Foto #{idx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper / Alternative Button */}
            {!isCapturingSession && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <label className="w-full py-2 rounded-xl glass-button text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload Foto Sendiri</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
