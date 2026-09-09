import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ChevronRight, Sun, Moon } from 'lucide-react';
import { setSoundMuted, getSoundMuted, playPopSound } from '../utils/audio';

export default function Navbar({ currentStep, onReset, theme, onToggleTheme }) {
  const [muted, setMuted] = useState(getSoundMuted());

  const toggleSound = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) {
      playPopSound();
    }
  };

  const handleThemeClick = () => {
    playPopSound();
    onToggleTheme();
  };

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-xl transition-all font-sans bg-[#0F172A]/85 border-b border-slate-800 dark:bg-[#0F172A]/85 dark:border-slate-800 not-dark:bg-white/80 not-dark:border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name (Logo un-modified as requested) */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img 
            src="/logo.png" 
            alt="yukphoto logo" 
            onError={(e) => {
              e.currentTarget.src = "/logo_yukphoto.png";
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight block leading-tight text-white dark:text-white not-dark:text-slate-900">
              yukphoto
            </span>
            <p className="text-[11px] font-normal tracking-wide text-slate-400 dark:text-slate-400 not-dark:text-slate-500">
              Bikin Strip Foto Estetik Sekali Klik
            </p>
          </div>
        </div>

        {/* Step Indicator (Desktop) */}
        {currentStep !== 'landing' && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300 dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-slate-300 not-dark:bg-slate-100 not-dark:border-slate-200 not-dark:text-slate-600">
            <span className={`px-2.5 py-0.5 rounded-full ${currentStep === 'camera' ? 'bg-blue-600 text-white font-medium' : 'opacity-70'}`}>
              1. Kamera
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" strokeWidth={1.5} />
            <span className={`px-2.5 py-0.5 rounded-full ${currentStep === 'editor' ? 'bg-blue-600 text-white font-medium' : 'opacity-70'}`}>
              2. Kustomisasi
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" strokeWidth={1.5} />
            <span className={`px-2.5 py-0.5 rounded-full ${currentStep === 'result' ? 'bg-blue-600 text-white font-medium' : 'opacity-70'}`}>
              3. Unduh
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Switcher Button (Sun / Moon) */}
          <button
            onClick={handleThemeClick}
            title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
            className="p-2.5 rounded-xl glass-button text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white not-dark:text-slate-600 not-dark:hover:text-slate-900 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
            className="p-2.5 rounded-xl glass-button text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white not-dark:text-slate-600 not-dark:hover:text-slate-900 transition-colors"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 opacity-50" strokeWidth={1.75} />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
            )}
          </button>

          {/* Reset / Home Button */}
          {currentStep !== 'landing' && (
            <button
              onClick={() => {
                if (window.confirm('Kembali ke menu awal? Sesi saat ini akan direset.')) {
                  onReset();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass-button text-slate-300 hover:text-white dark:text-slate-300 not-dark:text-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.75} />
              <span className="hidden sm:inline">Mulai Ulang</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
