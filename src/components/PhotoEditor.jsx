import React, { useState, useRef } from 'react';
import {
  Wand2,
  Palette,
  Type,
  ArrowRight,
  RotateCcw,
  Calendar,
  Check,
  Pipette,
  Film,
  Minimize2,
  Maximize2,
  Square,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyCenter,
  Smile,
  Sparkles,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { PHOTO_FILTERS, FRAME_COLORS, FRAME_PATTERNS, STICKER_CATEGORIES } from '../utils/filters';
import { playPopSound } from '../utils/audio';
import StickerOverlay from './StickerOverlay';

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
  initialStickers = [],
  initialColorId = 'navy',
  initialCustomColor = '#2563EB',
  initialPatternId = 'none',
  initialFramePadding = 'standard',
  initialEnableFilmGrain = false,
  initialWatermarkPosition = 'bottom',
  initialCaption = 'STUDIO MEMORIES',
  initialDate = '',
}) {
  const stripRef = useRef(null);
  const colorInputRef = useRef(null);

  // Editor States
  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'filters' | 'stickers' | 'text'
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [selectedColorId, setSelectedColorId] = useState(initialColorId);
  const [customColor, setCustomColor] = useState(initialCustomColor);
  const [selectedPatternId, setSelectedPatternId] = useState(initialPatternId);
  const [framePadding, setFramePadding] = useState(initialFramePadding); // 'minimal' | 'standard' | 'korean'
  const [enableFilmGrain, setEnableFilmGrain] = useState(initialEnableFilmGrain);
  const [watermarkPosition, setWatermarkPosition] = useState(initialWatermarkPosition); // 'bottom' | 'top' | 'side'
  const [caption, setCaption] = useState(initialCaption);
  const [dateString, setDateString] = useState(
    initialDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  );

  // Stickers State
  const [stickers, setStickers] = useState(initialStickers);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [activeStickerCategory, setActiveStickerCategory] = useState('cute');

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
  const currentFilterObj =
    PHOTO_FILTERS.find((f) => f.id === selectedFilter) ||
    (selectedFilter === 'bw' ? PHOTO_FILTERS.find((f) => f.id === 'grayscale') : null) ||
    (selectedFilter === 'vintage' ? PHOTO_FILTERS.find((f) => f.id === 'sepia') : null) ||
    (selectedFilter === 'cyberblue' ? PHOTO_FILTERS.find((f) => f.id === 'cold-cyber') : null) ||
    PHOTO_FILTERS[0];

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  const handleCustomColorChange = (e) => {
    const newHex = e.target.value;
    setCustomColor(newHex);
    setSelectedColorId('custom');
  };

  // Sticker Handlers
  const handleAddSticker = (emoji) => {
    playPopSound();
    const newId = 'stk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const count = stickers.length;
    const offsetX = ((count % 4) - 1.5) * 8;
    const offsetY = (Math.floor(count / 4) % 3 - 1) * 8;

    const newSticker = {
      id: newId,
      emoji,
      xPercent: Math.min(80, Math.max(20, 50 + offsetX)),
      yPercent: Math.min(80, Math.max(20, 48 + offsetY)),
      size: 48,
      rotation: 0,
    };

    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newId);
  };

  const handleUpdateSticker = (id, updates) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleRemoveSticker = (id) => {
    playPopSound();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const handleClearAllStickers = () => {
    playPopSound();
    if (stickers.length === 0) return;
    if (window.confirm('Hapus semua stiker dari strip fotomu?')) {
      setStickers([]);
      setSelectedStickerId(null);
    }
  };

  const handleFinish = () => {
    playPopSound();
    onProceedToResult({
      photos,
      layout,
      filterId: selectedFilter,
      stickers,
      frameColorId: selectedColorId,
      customColor: isCustomColor ? customColor : null,
      framePatternId: selectedPatternId,
      framePadding,
      enableFilmGrain,
      watermarkPosition,
      caption,
      dateString,
    });
  };

  // Preview padding class calculation
  let paddingClasses = 'p-4 sm:p-5';
  if (framePadding === 'minimal') {
    paddingClasses = 'p-2.5 sm:p-3';
  } else if (framePadding === 'korean') {
    paddingClasses = 'p-6 sm:p-7';
  }

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
            Sesuaikan warna dasar bingkai, ketebalan frame, efek film grain analog, dan teks watermark.
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

            {/* The Actual Styled Photostrip (Base Color + Pattern Overlay + Frame Padding) */}
            <div
              ref={stripRef}
              onClick={() => setSelectedStickerId(null)}
              style={{
                backgroundColor: currentColorObj.hex,
                color: currentColorObj.text,
              }}
              className={`relative w-full rounded-2xl ${paddingClasses} transition-all duration-300 photostrip-shadow overflow-hidden flex flex-col justify-between cursor-default`}
            >
              {/* Pattern Overlay: Checkered */}
              {selectedPatternId === 'checkered' && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentColorObj.isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)'} 1px, transparent 1px), linear-gradient(to bottom, ${currentColorObj.isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)'} 1px, transparent 1px)`,
                    backgroundSize: '16px 16px'
                  }}
                />
              )}

              {/* Pattern Overlay: Minimalist Double Border */}
              {selectedPatternId === 'border' && (
                <div
                  className="absolute inset-1.5 border border-dashed rounded-xl pointer-events-none"
                  style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(147, 197, 253, 0.4)' }}
                />
              )}

              {/* Pattern Overlay: Modern Gradient Overlay */}
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

              {/* Efek Film Grain Overlay (Analog Vintage Film 35mm) */}
              {enableFilmGrain && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-30 z-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(${currentColorObj.isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'} 1px, transparent 1px)`,
                    backgroundSize: '3px 3px'
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
                <div className="grid grid-cols-2 gap-2 my-auto relative z-10">
                  {photos.slice(0, 4).map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-lg overflow-hidden bg-black/30 shadow-sm relative border"
                      style={{ borderColor: currentColorObj.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)' }}
                    >
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

                  {/* Hairline Barcode */}
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

              {/* Dynamic Draggable / Resizable Stickers Overlay */}
              <StickerOverlay
                stickers={stickers}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onUpdateSticker={handleUpdateSticker}
                onRemoveSticker={handleRemoveSticker}
                containerRef={stripRef}
              />

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
                  setActiveTab('stickers');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'stickers'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Smile className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Stiker Imut</span>
                {stickers.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold leading-none">
                    {stickers.length}
                  </span>
                )}
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
                <span>Teks & Layout</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Frames (Warna Dasar + Ketebalan + Pola + Film Grain) */}
            {activeTab === 'frames' && (
              <div className="space-y-6">

                {/* SEKSI 1: Warna Dasar Frame (Preset + Pipet Kustom) */}
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

                {/* SEKSI 2: Ketebalan Bingkai (Frame Padding) */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 2: Ketebalan Bingkai (Frame Padding)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Atur luas batas bingkai foto photobooth kamu
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Minimalis */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setFramePadding('minimal');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        framePadding === 'minimal'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <Minimize2 className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={1.75} />
                      <div>
                        <span className="text-xs font-bold block">Minimalis</span>
                        <span className="text-[11px] text-slate-400 block">Padding tipis</span>
                      </div>
                    </button>

                    {/* Standard Studio */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setFramePadding('standard');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        framePadding === 'standard'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <Square className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={1.75} />
                      <div>
                        <span className="text-xs font-bold block">Standard Studio</span>
                        <span className="text-[11px] text-slate-400 block">Padding sedang</span>
                      </div>
                    </button>

                    {/* Korean Style */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setFramePadding('korean');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        framePadding === 'korean'
                          ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 text-white'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <Maximize2 className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={1.75} />
                      <div>
                        <span className="text-xs font-bold block">Korean Style</span>
                        <span className="text-[11px] text-slate-400 block">Padding tebal</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SEKSI 3: Tekstur & Pola Motif */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 3: Tekstur & Pola Motif</span>
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
                    {FRAME_PATTERNS.filter(p => p.id !== 'grain').map((pattern) => {
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

                {/* SEKSI 4: Toggle Efek Film Grain (Vintage Analog) */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Film className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-white block">
                          Efek Film Grain (Vintage Analog)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Memberi tekstur bintik-bintik halus ala film 35mm retro di atas foto
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setEnableFilmGrain((prev) => !prev);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        enableFilmGrain ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          enableFilmGrain ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. Filters */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-white">
                      Pilih Filter Real-Time
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ubah suasana strip fotomu secara seketika dengan sentuhan warna estetik
                    </p>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Aktif: {currentFilterObj.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PHOTO_FILTERS.map((f) => {
                    const isSelected =
                      selectedFilter === f.id ||
                      (selectedFilter === 'bw' && f.id === 'grayscale') ||
                      (selectedFilter === 'vintage' && f.id === 'sepia') ||
                      (selectedFilter === 'cyberblue' && f.id === 'cold-cyber');
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
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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

            {/* TAB CONTENT: 3. Stiker Imut */}
            {activeTab === 'stickers' && (
              <div className="space-y-5">
                {/* Header & Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Galeri Stiker Imut Lengkap</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pilih stiker di bawah ini untuk ditempelkan ke foto. Geser, ubah ukuran, putar, atau hapus sesukamu!
                      </p>
                    </div>
                    {stickers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllStickers}
                        className="text-xs px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Semua ({stickers.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-thin">
                    {STICKER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setActiveStickerCategory(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          activeStickerCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-sm font-semibold ring-2 ring-blue-500/40'
                            : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stickers Grid */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2">
                      {(STICKER_CATEGORIES.find((c) => c.id === activeStickerCategory)?.stickers || []).map(
                        (emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddSticker(emoji)}
                            title={`Tambah stiker ${emoji}`}
                            className="aspect-square flex items-center justify-center text-2xl sm:text-3xl rounded-xl bg-slate-900/60 hover:bg-blue-500/20 hover:scale-125 border border-transparent hover:border-blue-500/40 active:scale-95 transition-all select-none"
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Sticker Controls Panel (if any sticker is selected) */}
                {selectedSticker && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl select-none">{selectedSticker.emoji}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Stiker Terpilih
                          </span>
                          <span className="text-[11px] text-blue-300 block">
                            Atur ukuran & rotasi stiker aktif
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSticker(selectedSticker.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Stiker</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Size slider & buttons */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Ukuran:</span>
                          <span className="font-mono text-blue-400 font-semibold">{selectedSticker.size || 48}px</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedSticker.id, {
                                size: Math.max(24, (selectedSticker.size || 48) - 6),
                              })
                            }
                            className="p-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="24"
                            max="110"
                            value={selectedSticker.size || 48}
                            onChange={(e) =>
                              handleUpdateSticker(selectedSticker.id, { size: Number(e.target.value) })
                            }
                            className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedSticker.id, {
                                size: Math.min(110, (selectedSticker.size || 48) + 6),
                              })
                            }
                            className="p-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Rotation slider */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Rotasi:</span>
                          <span className="font-mono text-blue-400 font-semibold">{selectedSticker.rotation || 0}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="5"
                            value={selectedSticker.rotation || 0}
                            onChange={(e) =>
                              handleUpdateSticker(selectedSticker.id, { rotation: Number(e.target.value) })
                            }
                            className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSticker(selectedSticker.id, {
                                rotation: ((selectedSticker.rotation || 0) + 45) % 360,
                              })
                            }
                            title="Putar 45°"
                            className="px-2 py-0.5 rounded-lg bg-slate-900 text-blue-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono"
                          >
                            +45°
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Tips Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
                  <span className="text-xl">✨</span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">
                      Cara Mengatur Stiker:
                    </p>
                    <p className="leading-relaxed">
                      1. Klik salah satu emotikon di atas untuk menambahkannya ke photostrip.<br />
                      2. Tarik / geser (drag & drop) stiker langsung ke posisi yang kamu sukai.<br />
                      3. Klik stiker untuk menampilkan toolbar mini: putar, perkecil, perbesar, atau hapus.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Teks & Layout */}
            {activeTab === 'text' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans font-semibold text-sm text-white mb-3">
                    Kustomisasi Teks & Tanggal
                  </h3>

                  <div className="space-y-3">
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
                </div>

                {/* Posisi Watermark */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-sans font-semibold text-sm text-white">
                        Posisi Watermark Teks
                      </h4>
                      <p className="text-xs text-slate-400">
                        Tentukan letak teks YUKPHOTO dan tanggal strip
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          Format klasik studio
                        </span>
                      </div>
                    </button>

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
                          Format lateral estetik
                        </span>
                      </div>
                    </button>
                  </div>
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
