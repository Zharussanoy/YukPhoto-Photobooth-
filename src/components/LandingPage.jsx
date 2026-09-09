import React, { useState, useRef } from 'react';
import { Camera, ChevronRight, Check, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FRAME_LAYOUTS, PHOTO_FILTERS } from '../utils/filters';
import { playPopSound } from '../utils/audio';

export default function LandingPage({ selectedLayout, onSelectLayout, onStart }) {
  // Hero live interactive filter switcher
  const [heroFilterId, setHeroFilterId] = useState('normal');
  const activeHeroFilter = PHOTO_FILTERS.find((f) => f.id === heroFilterId) || PHOTO_FILTERS[0];

  // 3D Parallax Tilt state
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(-2deg)',
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Tilt up/down
    const rotateY = ((x - centerX) / centerX) * 10;  // Tilt left/right

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(-1.5deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(-2deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  };

  const handleSelect = (layout) => {
    playPopSound();
    onSelectLayout(layout);
  };

  const handleStart = () => {
    playPopSound();
    onStart();
  };

  const handleFilterClick = (filterId) => {
    playPopSound();
    setHeroFilterId(filterId);
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between overflow-hidden font-sans">

      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[350px] bg-blue-600/[0.08] blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-sky-600/[0.06] blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Container - 2 Column Clean Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full my-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT COLUMN: Branding, Headline, One-line description, Layouts & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Logo & Nama yukphoto */}
            <div className="flex items-center gap-2.5 mb-5 select-none">
              <img
                src="/logo.png"
                alt="yukphoto logo"
                onError={(e) => {
                  e.currentTarget.src = "/logo_yukphoto.png";
                }}
                className="w-8 h-8 object-contain rounded-lg shadow-sm"
              />
              <span className="font-sans font-bold text-xl tracking-tight text-white">
                yukphoto
              </span>
            </div>

            {/* Judul Utama (Clean, Zero Unicode Emoji) */}
            <h1 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-[3.25rem] text-white tracking-tight leading-[1.15] mb-4">
              Pose, Jepret, & Bikin <br className="hidden sm:inline" />
              <span className="text-[#93C5FD]">Strip Foto Estetik!</span>
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
                      data-cursor-hover="true"
                      className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${isSelected
                          ? 'bg-blue-950/50 border-blue-500 shadow-sm ring-1 ring-blue-500/60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                    >
                      {/* Active indicator check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                          <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                        </div>
                      )}

                      <div>
                        <span className={`block font-sans font-bold text-xs sm:text-sm mb-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-200'
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
                data-cursor-hover="true"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-sans font-semibold text-base shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" strokeWidth={1.75} />
                <span>Mulai Foto</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Aesthetic 3-Strip Photo Mockup with 3D Parallax Tilt & Live Filter Switcher */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-4 select-none">

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={tiltStyle}
              className="relative group cursor-pointer will-change-transform"
            >

              {/* Ambient backlight glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/20 to-sky-400/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500" />

              {/* The 3-Strip Photobooth Mock-up Card */}
              <div className="relative w-[260px] sm:w-[290px] rounded-2xl bg-[#0B1120] border border-slate-800 p-3.5 sm:p-4 photostrip-shadow">
                
                {/* Thin inner decorative frame line */}
                <div className="absolute inset-1.5 border border-white/10 rounded-xl pointer-events-none" />

                {/* Photo 1 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-2.5 shadow-sm border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 1"
                    style={{ filter: activeHeroFilter.cssFilter }}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Clean SVG Vector Stamp (No Unicode Emoji) */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-[9px] font-mono font-bold text-blue-300 tracking-wider">
                    STUDIO 01
                  </div>
                </div>

                {/* Photo 2 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-2.5 shadow-sm border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 2"
                    style={{ filter: activeHeroFilter.cssFilter }}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Clean SVG Vector Stamp (No Unicode Emoji) */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-[9px] font-mono font-bold text-sky-300 tracking-wider">
                    ARCHIVE
                  </div>
                </div>

                {/* Photo 3 */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-800 mb-3 shadow-sm border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80"
                    alt="Pose 3"
                    style={{ filter: activeHeroFilter.cssFilter }}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Clean SVG Vector Stamp (No Unicode Emoji) */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-[9px] font-mono font-bold text-blue-300 tracking-wider">
                    35MM FILM
                  </div>
                </div>

                {/* Photostrip Stamp & Footer */}
                <div className="text-center pt-2 pb-1 border-t border-slate-800">
                  <p className="font-sans font-bold text-xs tracking-wider uppercase text-white mb-0.5">
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
                        className="bg-slate-400"
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

            {/* Live Filter Switcher under Hero Mockup */}
            <div className="mt-5 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
              <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <SlidersHorizontal className="w-3 h-3 text-blue-400" strokeWidth={1.75} />
                <span className="hidden sm:inline">Filter:</span>
              </div>
              {PHOTO_FILTERS.map((f) => {
                const isSelected = heroFilterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleFilterClick(f.id)}
                    data-cursor-hover="true"
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {f.name}
                  </button>
                );
              })}
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
