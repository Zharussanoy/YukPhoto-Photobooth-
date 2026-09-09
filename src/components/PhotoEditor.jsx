import React, { useState, useRef } from 'react';
import {
  Wand2,
  Palette,
  Sparkles,
  Type,
  ArrowRight,
  RotateCcw,
  Calendar,
  Check,
  Pipette,
  Layers,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyCenter
} from 'lucide-react';
import { PHOTO_FILTERS, FRAME_COLORS, FRAME_PATTERNS } from '../utils/filters';
import { playPopSound } from '../utils/audio';

function getLuminance(hex) {
  if (!hex) return 0;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function PhotoEditor({
  photos,
  layout,
  onProceedToResult,
  onRetake,
  initialFilter = 'normal',
  initialColorId = 'navy',
  initialCustomColor = '#2563EB',
  initialPatternId = 'none',
  initialShowTape = true,
  initialWatermarkPosition = 'bottom',
  initialCaption = 'STUDIO MEMORIES',
  initialDate = '',
}) {
  const stripRef = useRef(null);
  const colorInputRef = useRef(null);

  // Editor States
  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'filters' | 'accents' | 'text'
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [selectedColorId, setSelectedColorId] = useState(initialColorId);
  const [customColor, setCustomColor] = useState(initialCustomColor);
  const [selectedPatternId, setSelectedPatternId] = useState(initialPatternId);
  const [showTape, setShowTape] = useState(initialShowTape);
  const [watermarkPosition, setWatermarkPosition] = useState(initialWatermarkPosition); // 'bottom' | 'top' | 'side'
  const [caption, setCaption] = useState(initialCaption);
  const [dateString, setDateString] = useState(
    initialDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  );

  // Compute resolved color object (Preset vs Custom)
  const isCustomColor = selectedColorId === 'custom';
  let currentColorObj;

  if (isCustomColor) {
    const isLight = getLuminance(customColor) > 0.55;
    currentColorObj = {
      id: 'custom',
      name: `Kustom (${customColor.toUpperCase()})`,
      hex: customColor,
      isLight,
      text: isLight ? '#0F172A' : '#FFFFFF',
      subtext: isLight ? '#475569' : '#94A3B8',
      border: isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.18)',
    };
  } else {
    currentColorObj = FRAME_COLORS.find((c) => c.id === selectedColorId) || FRAME_COLORS[4]; // default navy
  }

  const currentPatternObj = FRAME_PATTERNS.find((p) => p.id === selectedPatternId) || FRAME_PATTERNS[0];
  const currentFilterObj = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  const handleCustomColorChange = (e) => {
    const newHex = e.target.value;
    setCustomColor(newHex);
    setSelectedColorId('custom');
  };

  const handleFinish = () => {
    playPopSound();
    onProceedToResult({
      photos,
      layout,
      filterId: selectedFilter,
      frameColorId: selectedColorId,
      customColor: isCustomColor ? customColor : null,
      framePatternId: selectedPatternId,
      showTape,
      watermarkPosition,
      caption,
      dateString,
    });
  };

  return (
    <div className="min-h-[calc(100vh-70px)] py-6 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col justify-between font-sans text-slate-100">

      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <span>Kustomisasi Strip Fotomu</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
              Live Preview
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sesuaikan warna dasar bingkai, pola motif overlay, filter kamera, aksen selotip, dan watermark.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Ambil foto ulang? Foto saat ini akan diganti.')) {
                onRetake();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-button text-xs font-medium text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.75} />
            <span>Foto Ulang</span>
          </button>

          <button
            onClick={handleFinish}
            id="btn-proceed-result"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span>Selesai & Unduh</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Live Strip, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">

        {/* LEFT: Live Photostrip Canvas Mockup */}
        <div className="lg:col-span-5 flex justify-center sticky top-20 select-none">
          <div className="relative max-w-[340px] sm:max-w-[370px] w-full p-2 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl backdrop-blur-sm flex justify-center">

            {/* The Actual Styled Photostrip (Base Color + Pattern Overlay) */}
            <div
              ref={stripRef}
              style={{
                backgroundColor: currentColorObj.hex,
                color: currentColorObj.text,
              }}
              className="relative w-full rounded-2xl p-4 sm:p-5 transition-all duration-300 photostrip-shadow overflow-hidden flex flex-col justify-between"
            >
              {/* Pattern Overlay 1: Checkered */}
              {selectedPatternId === 'checkered' && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentColorObj.isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)'} 1px, transparent 1px), linear-gradient(to bottom, ${currentColorObj.isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)'} 1px, transparent 1px)`,
                    backgroundSize: '16px 16px'
                  }}
                />
              )}

              {/* Pattern Overlay 2: Subtle Grain */}
              {selectedPatternId === 'grain' && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-25"
                  style={{
                    backgroundImage: `radial-gradient(${currentColorObj.isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'} 1px, transparent 1px)`,
                    backgroundSize: '4px 4px'
                  }}
                />
              )}

              {/* Pattern Overlay 3: Minimalist Double Border */}
              {selectedPatternId === 'border' && (
                <div
                  className="absolute inset-1.5 border border-dashed rounded-xl pointer-events-none"
                  style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(147, 197, 253, 0.4)' }}
                />
              )}

              {/* Pattern Overlay 4: Modern Gradient Overlay */}
              {selectedPatternId === 'gradient' && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: currentColorObj.isLight
                      ? 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(37, 99, 235, 0.15) 100%)'
                      : 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(37, 99, 235, 0.3) 100%)'
                  }}
                />
              )}

              {/* Hairline frame border */}
              {selectedPatternId !== 'border' && (
                <div
                  className="absolute inset-1.5 border rounded-xl pointer-events-none"
                  style={{ borderColor: currentColorObj.border }}
                />
              )}

              {/* WATERMARK ATAS (Jika dipilih watermarkPosition === 'top') */}
              {watermarkPosition === 'top' && (
                <div
                  className="relative z-10 text-center pb-2.5 mb-2 border-b"
                  style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.15)' }}
                >
                  {caption && caption.trim().length > 0 && (
                    <p className="font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase mb-0.5">
                      {caption}
                    </p>
                  )}
                  <p className="font-sans font-extrabold text-xs tracking-[0.25em] uppercase opacity-90 mb-0.5">
                    YUKPHOTO
                  </p>
                  <p
                    style={{ color: currentColorObj.subtext }}
                    className="text-[10px] font-mono tracking-widest uppercase opacity-85"
                  >
                    {dateString} • DIGITAL ARCHIVE
                  </p>
                </div>
              )}

              {/* Photos Container */}
              {layout.id === 'grid-2x2' ? (
                <div className="grid grid-cols-2 gap-2.5 my-auto relative z-10">
                  {photos.slice(0, 4).map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-lg overflow-hidden bg-black/30 shadow-sm relative border"
                      style={{ borderColor: currentColorObj.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)' }}
                    >
                      {/* Aksen Selotip (Washi Tape) */}
                      {showTape && (
                        <>
                          <div className="absolute -top-2 left-2.5 w-7 h-3.5 bg-white/45 backdrop-blur-[2px] border-y border-white/30 rounded-[1px] shadow-sm transform -rotate-6 z-20 pointer-events-none" />
                          <div className="absolute -top-2 right-2.5 w-7 h-3.5 bg-white/45 backdrop-blur-[2px] border-y border-white/30 rounded-[1px] shadow-sm transform rotate-6 z-20 pointer-events-none" />
                        </>
                      )}

                      <img
                        src={photo}
                        alt={`Slot ${i + 1}`}
                        style={{ filter: currentFilterObj.cssFilter }}
                        className="w-full h-full object-cover transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 my-auto relative z-10">
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden bg-black/30 shadow-sm relative border"
                      style={{ borderColor: currentColorObj.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)' }}
                    >
                      {/* Aksen Selotip (Washi Tape) */}
                      {showTape && (
                        <>
                          <div className="absolute -top-2 left-3 w-8 sm:w-10 h-3.5 sm:h-4 bg-white/45 backdrop-blur-[2px] border-y border-white/30 rounded-[1px] shadow-sm transform -rotate-6 z-20 pointer-events-none" />
                          <div className="absolute -top-2 right-3 w-8 sm:w-10 h-3.5 sm:h-4 bg-white/45 backdrop-blur-[2px] border-y border-white/30 rounded-[1px] shadow-sm transform rotate-6 z-20 pointer-events-none" />
                        </>
                      )}

                      <img
                        src={photo}
                        alt={`Slot ${i + 1}`}
                        style={{ filter: currentFilterObj.cssFilter }}
                        className="w-full h-full object-cover transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* WATERMARK BAWAH (Jika watermarkPosition === 'bottom') */}
              {watermarkPosition === 'bottom' && (
                <div
                  className="relative z-10 text-center pt-2.5 mt-2 border-t"
                  style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.15)' }}
                >
                  {caption && caption.trim().length > 0 && (
                    <p className="font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase mb-1">
                      {caption}
                    </p>
                  )}

                  <p className="font-sans font-extrabold text-xs tracking-[0.25em] uppercase opacity-90 mb-0.5">
                    YUKPHOTO
                  </p>

                  <p
                    style={{ color: currentColorObj.subtext }}
                    className="text-[10px] font-mono tracking-widest uppercase opacity-85"
                  >
                    {dateString} • DIGITAL ARCHIVE
                  </p>

                  {/* Hairline Barcode (Single Style Prop) */}
                  <div className="flex justify-center items-center gap-[2px] mt-2 opacity-50 h-2 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, b) => (
                      <div
                        key={b}
                        className="transition-colors"
                        style={{
                          backgroundColor: currentColorObj.subtext,
                          width: (b % 3 === 0) ? '2px' : '1px',
                          height: (b % 4 === 0) ? '8px' : '5px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* WATERMARK SAMPING (Jika watermarkPosition === 'side') */}
              {watermarkPosition === 'side' && (
                <div
                  className="relative z-10 text-center pt-2 mt-2 border-t"
                  style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.15)' }}
                >
                  <p className="text-[10px] font-mono tracking-widest uppercase opacity-90">
                    {caption ? `${caption.toUpperCase()} • ` : ''}YUKPHOTO • {dateString}
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* RIGHT: Customization Control Tabs (Dark Navy Theme) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">

          <div>
            {/* Tab Navigation (Dark Navy) */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6 overflow-x-auto">
              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('frames');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'frames'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Desain Frame</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('filters');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'filters'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Filter Foto</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('accents');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'accents'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Aksen & Detail</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('text');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'text'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Teks & Date</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Frames (2 SEKSI INDEPENDEN) */}
            {activeTab === 'frames' && (
              <div className="space-y-6">

                {/* SEKSI 1: Warna Dasar Frame (Color Palette Selector + Custom Pipet Picker) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 1: Warna Dasar Frame</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pilih warna preset atau tentukan warna bebas dengan pipet
                      </p>
                    </div>
                    <span className="text-xs text-blue-400 font-medium">
                      {currentColorObj.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {/* 6 Preset Colors */}
                    {FRAME_COLORS.map((col) => {
                      const isSelected = selectedColorId === col.id;

                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setSelectedColorId(col.id);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          {/* Color Swatch Circle */}
                          <div
                            className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{
                              backgroundColor: col.hex,
                              borderColor: col.isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)'
                            }}
                          >
                            {isSelected && (
                              <Check
                                className="w-3.5 h-3.5"
                                style={{ color: col.isLight ? '#0F172A' : '#FFFFFF' }}
                                strokeWidth={2.5}
                              />
                            )}
                          </div>

                          <div className="overflow-hidden">
                            <span className="text-xs font-semibold block truncate">
                              {col.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* SLOT KUSTOM: Custom Color Picker / Pipet */}
                    <div
                      onClick={() => {
                        playPopSound();
                        setSelectedColorId('custom');
                        colorInputRef.current?.click();
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 relative group ${
                        isCustomColor
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      {/* Hidden native color input */}
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-none"
                      />

                      {/* Custom color swatch / pipette icon */}
                      <div
                        className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 shadow-sm relative overflow-hidden"
                        style={{
                          backgroundColor: customColor,
                          borderColor: 'rgba(255,255,255,0.25)'
                        }}
                      >
                        <Pipette
                          className="w-3.5 h-3.5"
                          style={{
                            color: getLuminance(customColor) > 0.55 ? '#0F172A' : '#FFFFFF'
                          }}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold block truncate">
                          {isCustomColor ? customColor.toUpperCase() : 'Pilih Pipet'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Warna Bebas
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SEKSI 2: Tekstur & Pola Motif (Pattern Overlay di atas warna dasar) */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 2: Tekstur & Pola Motif</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pola overlay yang diterapkan di atas warna dasar frame
                      </p>
                    </div>
                    <span className="text-xs text-blue-400 font-medium">
                      {currentPatternObj.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FRAME_PATTERNS.map((pattern) => {
                      const isSelected = selectedPatternId === pattern.id;

                      return (
                        <button
                          key={pattern.id}
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setSelectedPatternId(pattern.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          {/* Mini Pattern Visual Icon */}
                          <div
                            className="w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-slate-900"
                            style={{
                              backgroundColor: currentColorObj.hex,
                              borderColor: 'rgba(255,255,255,0.15)'
                            }}
                          >
                            {pattern.id === 'checkered' && (
                              <div
                                className="absolute inset-0 opacity-40"
                                style={{
                                  backgroundImage: `linear-gradient(to right, ${currentColorObj.isLight ? '#000' : '#fff'} 1px, transparent 1px), linear-gradient(to bottom, ${currentColorObj.isLight ? '#000' : '#fff'} 1px, transparent 1px)`,
                                  backgroundSize: '6px 6px'
                                }}
                              />
                            )}
                            {pattern.id === 'border' && (
                              <div
                                className="absolute inset-1 border border-dashed rounded"
                                style={{ borderColor: currentColorObj.isLight ? '#000' : '#38BDF8' }}
                              />
                            )}
                            {pattern.id === 'grain' && (
                              <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                  backgroundImage: `radial-gradient(${currentColorObj.isLight ? '#000' : '#fff'} 1px, transparent 1px)`,
                                  backgroundSize: '3px 3px'
                                }}
                              />
                            )}
                            {pattern.id === 'gradient' && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(to bottom, transparent 0%, rgba(37,99,235,0.4) 100%)'
                                }}
                              />
                            )}

                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center z-10 shadow">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold block truncate">
                              {pattern.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">
                              {pattern.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. Filters */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-semibold text-sm text-white">
                    Pilih Filter Estetik
                  </h3>
                  <span className="text-xs text-blue-400 font-medium">
                    Aktif: {currentFilterObj.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PHOTO_FILTERS.map((f) => {
                    const isSelected = selectedFilter === f.id;
                    const sampleImg = photos[0] || '';

                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          playPopSound();
                          setSelectedFilter(f.id);
                        }}
                        className={`group relative p-2.5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-black relative border border-white/10">
                          <img
                            src={sampleImg}
                            alt={f.name}
                            style={{ filter: f.cssFilter }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-blue-600 text-white shadow">
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>

                        <span className="font-semibold text-xs text-white block">
                          {f.name}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {f.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Aksen & Detail (Selotip + Posisi Watermark) */}
            {activeTab === 'accents' && (
              <div className="space-y-6">

                {/* Seksi A: Aksen Selotip (Aesthetic Tape) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Aksen Selotip (Aesthetic Tape)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Tambahkan pita selotip transparan estetik di sudut foto
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Layers className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-white block">
                          Tampilkan Selotip di Sudut Foto
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Efek washi tape analog vintage di setiap jepretan foto
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setShowTape((prev) => !prev);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showTape ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          showTape ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Seksi B: Posisi Watermark */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Posisi Watermark Teks</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Tentukan penempatan logo YUKPHOTO dan tanggal strip
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Opsi 1: Bawah (Default) */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setWatermarkPosition('bottom');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        watermarkPosition === 'bottom'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <AlignVerticalJustifyEnd className="w-5 h-5 text-blue-400" strokeWidth={1.75} />
                        {watermarkPosition === 'bottom' && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Di Bawah (Footer)</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Format strip studio klasik
                        </span>
                      </div>
                    </button>

                    {/* Opsi 2: Atas (Header) */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setWatermarkPosition('top');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        watermarkPosition === 'top'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <AlignVerticalJustifyStart className="w-5 h-5 text-blue-400" strokeWidth={1.75} />
                        {watermarkPosition === 'top' && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Di Atas (Header)</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Format modern photocard
                        </span>
                      </div>
                    </button>

                    {/* Opsi 3: Samping */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setWatermarkPosition('side');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        watermarkPosition === 'side'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <AlignHorizontalJustifyCenter className="w-5 h-5 text-blue-400" strokeWidth={1.75} />
                        {watermarkPosition === 'side' && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Samping Ringkas</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Format minimalis lateral
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 4. Text & Date */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-sm text-white">
                  Kustomisasi Teks & Tanggal
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Judul / Caption Foto:
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Contoh: STUDIO MEMORIES"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Tampil di watermark frame</span>
                    <span>{caption.length}/28</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.75} />
                    <span>Format Tanggal:</span>
                  </label>
                  <input
                    type="text"
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    placeholder="2026.09.09"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleFinish}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Lanjut ke Hasil Akhir & Unduh</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
