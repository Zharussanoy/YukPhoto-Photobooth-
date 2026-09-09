import React from 'react';
import { Camera, ChevronRight, Check, Sparkles } from 'lucide-react';
import { FRAME_LAYOUTS } from '../utils/filters';
import { playPopSound } from '../utils/audio';

export default function LandingPage({ selectedLayout, onSelectLayout, onStart }) {
  const handleSelect = (layout) => {
    playPopSound();
    onSelectLayout(layout);
  };

  const handleStart = () => {
    playPopSound();
    onStart();
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between overflow-hidden">

      {/* Subtle ambient lighting - Clean Navy */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[350px] bg-blue-600/[0.07] blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-sky-600/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Container - 2 Column Clean Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full my-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT COLUMN: Branding, Headline, One-line description, Layouts & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Logo & Nama yukphoto */}
            <div className="flex items-center gap-2.5 mb-5 select-none">
              <img
                src="/logo_yukphoto.png"
                alt="yukphoto logo"
                onError={(e) => {
                  e.currentTarget.src = "/logo_yukphoto.jpg";
                }}
                className="w-8 h-8 object-contain rounded-lg shadow-sm"
              />
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                yukphoto
              </span>
            </div>

            {/* Judul Utama */}
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[3.25rem] text-white tracking-tight leading-[1.15] mb-4">
              Pose, Jepret, & Bikin <br className="hidden sm:inline" />
              <span className="text-[#93C5FD]">Strip Foto Estetik!</span> 📸
            </h1>

            {/* Sub-deskripsi (1 kalimat ringkas gaya Gen-Z) */}
            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed mb-8 max-w-xl">
              Gak perlu antre di studio. Abadikan momen seru kamu langsung dari browser, gratis & instan!
            </p>

            {/* Format Selector: Clean, compact card options */}
            <div className="w-full max-w-xl mb-8">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Pilih Format Bingkai Foto:
              </label>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {FRAME_LAYOUTS.map((layout) => {
                  const isSelected = selectedLayout.id === layout.id;

                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => handleSelect(layout)}
                      className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/60'
                          : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
                        }`}
                    >
                      {/* Active indicator check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}

                      <div>
                        <span className={`block font-display font-bold text-xs sm:text-sm mb-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-200'
                          }`}>
                          {layout.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {layout.photoCount} Foto
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Button: Solid Electric Blue */}
            <div className="w-full sm:w-auto">
              <button
                onClick={handleStart}
                id="btn-start-photobooth"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-display font-bold text-base shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" />
                <span>Mulai Foto</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Aesthetic 3-Strip Photo Mockup with subtle rotated angle */}
          <div className="lg:col-span-5 flex justify-center items-center py-4 select-none">

            <div className="relative group">

              {/* Subtle back decorative glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/20 to-sky-400/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500" />

              {/* The 3-Strip Photobooth Mock-up Card */}
              <div
                className="relative w-[260px] sm:w-[290px] rounded-2xl bg-[#0B1120] border border-slate-700/80 p-3.5 sm:p-4 photostrip-shadow transform -rotate-2 group-hover:rotate-0 transition-transform duration-500 ease-out"
              >
                {/* Thin inner decorative frame line */}
                <div className="absolute inset-1.5 border border-white/10 rounded-xl pointer-events-none" />

                {/* Photo 1 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-2.5 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Cute sticker on photo 1 */}
                  <span className="absolute top-1.5 right-2 text-xl drop-shadow-md">✨</span>
                </div>

                {/* Photo 2 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-2.5 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 2"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Cute sticker on photo 2 */}
                  <span className="absolute bottom-1.5 left-2 text-xl drop-shadow-md">💖</span>
                </div>

                {/* Photo 3 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-3 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 3"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Cute sticker on photo 3 */}
                  <span className="absolute top-1.5 right-2 text-xl drop-shadow-md">✌️</span>
                </div>

                {/* Photostrip Stamp & Footer */}
                <div className="text-center pt-2 pb-1 border-t border-slate-800">
                  <p className="font-display font-extrabold text-xs tracking-wider uppercase text-white mb-0.5">
                    MEMORIES WITH YOU
                  </p>
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                    2026.09.09 • YUKPHOTO
                  </p>

                  {/* Aesthetic simulated barcode */}
                  <div className="flex justify-center items-center gap-[2px] mt-2 opacity-50 h-2 overflow-hidden">
                    {Array.from({ length: 28 }).map((_, b) => (
                      <div
                        key={b}
                        className="bg-slate-300"
                        style={{
                          width: (b % 3 === 0) ? '2px' : '1px',
                          height: (b % 4 === 0) ? '8px' : '5px',
                        }}
                      />
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Clean Minimal Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <p>© 2026 yukphoto • Bikin Strip Foto Estetik Sekali Klik</p>
      </footer>

    </div>
  );
}
