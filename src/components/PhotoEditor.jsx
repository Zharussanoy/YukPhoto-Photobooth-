import React, { useState, useRef } from 'react';
import {
  Wand2,
  Palette,
  Tag,
  Type,
  ArrowRight,
  RotateCcw,
  Trash2,
  Calendar,
  Check,
  Sparkles
} from 'lucide-react';
import { PHOTO_FILTERS, FRAME_COLORS, FRAME_PATTERNS, GRAPHIC_STAMPS } from '../utils/filters';
import { playPopSound } from '../utils/audio';
import StickerOverlay from './StickerOverlay';

export default function PhotoEditor({
  photos,
  layout,
  onProceedToResult,
  onRetake,
  initialFilter = 'normal',
  initialColorId = 'navy',
  initialPatternId = 'none',
  initialCaption = 'STUDIO MEMORIES',
  initialDate = '',
}) {
  const stripRef = useRef(null);

  // Editor States
  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'filters' | 'stamps' | 'text'
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [selectedColorId, setSelectedColorId] = useState(initialColorId);
  const [selectedPatternId, setSelectedPatternId] = useState(initialPatternId);
  const [caption, setCaption] = useState(initialCaption);
  const [dateString, setDateString] = useState(
    initialDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  );

  // Graphic Stamps: array of { id, label, xPercent, yPercent, size, rotation }
  const [stamps, setStamps] = useState([
    { id: '1', label: 'ARCHIVE', xPercent: 25, yPercent: 12, size: 30, rotation: -6 },
    { id: '2', label: 'YUKPHOTO', xPercent: 78, yPercent: 38, size: 32, rotation: 8 },
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);

  const currentColorObj = FRAME_COLORS.find((c) => c.id === selectedColorId) || FRAME_COLORS[4]; // navy default
  const currentPatternObj = FRAME_PATTERNS.find((p) => p.id === selectedPatternId) || FRAME_PATTERNS[0]; // polos
  const currentFilterObj = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  const handleAddStamp = (stampPreset) => {
    playPopSound();
    const newStamp = {
      id: Date.now().toString(),
      label: stampPreset.label,
      xPercent: 45 + Math.random() * 10,
      yPercent: 40 + Math.random() * 20,
      size: 32,
      rotation: Math.floor(Math.random() * 20) - 10,
    };
    setStamps((prev) => [...prev, newStamp]);
    setSelectedStickerId(newStamp.id);
  };

  const handleUpdateStamp = (id, updates) => {
    setStamps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleRemoveStamp = (id) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleClearAllStamps = () => {
    playPopSound();
    if (window.confirm('Hapus semua stempel dari foto?')) {
      setStamps([]);
      setSelectedStickerId(null);
    }
  };

  const handleFinish = () => {
    playPopSound();
    onProceedToResult({
      photos,
      layout,
      filterId: selectedFilter,
      frameColorId: selectedColorId,
      framePatternId: selectedPatternId,
      caption,
      dateString,
      stamps,
    });
  };

  return (
    <div
      className="min-h-[calc(100vh-70px)] py-6 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col justify-between font-sans"
      onClick={() => setSelectedStickerId(null)}
    >

      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <span>Kustomisasi Strip Fotomu</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 font-medium">
              Live Preview
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sesuaikan warna dasar bingkai, pola motif overlay, filter kamera, dan teks watermark.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Ambil foto ulang? Foto saat ini akan diganti.')) {
                onRetake();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-button text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.75} />
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
          <div className="relative max-w-[340px] sm:max-w-[370px] w-full p-2 rounded-3xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300/80 dark:border-slate-800 shadow-2xl backdrop-blur-sm flex justify-center">

            {/* The Actual Styled Photostrip (Base Color + Pattern Overlay) */}
            <div
              ref={stripRef}
              style={{
                backgroundColor: currentColorObj.hex,
                color: currentColorObj.text,
              }}
              className="relative w-full rounded-2xl p-4 sm:p-5 transition-all duration-300 photostrip-shadow overflow-hidden"
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

              {/* Hairline frame border (always present unless double border) */}
              {selectedPatternId !== 'border' && (
                <div
                  className="absolute inset-1.5 border rounded-xl pointer-events-none"
                  style={{ borderColor: currentColorObj.border }}
                />
              )}

              {/* Photos Container */}
              {layout.id === 'grid-2x2' ? (
                <div className="grid grid-cols-2 gap-2.5 mb-5 relative z-10">
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
                <div className="flex flex-col gap-2.5 mb-5 relative z-10">
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

              {/* Clean Sans-serif Watermark Frame & Footer */}
              <div
                className="relative z-10 text-center pt-2 pb-1 border-t"
                style={{ borderColor: currentColorObj.isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.15)' }}
              >
                {caption && caption.trim().length > 0 && (
                  <p className="font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase mb-1">
                    {caption}
                  </p>
                )}

                <p className="font-sans font-bold text-xs tracking-[0.25em] uppercase opacity-90 mb-0.5">
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
                      style={{ backgroundColor: currentColorObj.subtext }}
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

              {/* Graphic Stamps Overlay */}
              <StickerOverlay
                stickers={stamps}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onUpdateSticker={handleUpdateStamp}
                onRemoveSticker={handleRemoveStamp}
                containerRef={stripRef}
              />
            </div>

          </div>
        </div>

        {/* RIGHT: Customization Control Tabs */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-7 border border-slate-300 dark:border-slate-700/80 flex flex-col justify-between">

          <div>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 mb-6 overflow-x-auto">
              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('frames');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'frames'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'filters'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Wand2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Filter Foto</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('stamps');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'stamps'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Tag className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Stempel ({stamps.length})</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setActiveTab('text');
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'text'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Type className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Teks & Date</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Frames (2 SEKSI INDEPENDEN) */}
            {activeTab === 'frames' && (
              <div className="space-y-6">

                {/* SEKSI 1: Warna Dasar Frame (Color Palette Selector) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 1: Warna Dasar Frame</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih warna latar belakang frame fotomu
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {currentColorObj.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/40'
                              : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                        >
                          {/* Color Swatch Circle */}
                          <div
                            className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{
                              backgroundColor: col.hex,
                              borderColor: col.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'
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
                            <span className="text-xs font-semibold block truncate text-slate-800 dark:text-slate-100">
                              {col.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SEKSI 2: Tekstur & Pola Motif (Pattern Overlay) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Seksi 2: Tekstur & Pola Motif</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pola overlay yang diterapkan di atas warna dasar frame
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
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
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/40'
                              : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                        >
                          {/* Mini Pattern Visual Icon */}
                          <div
                            className="w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-slate-900"
                            style={{ backgroundColor: currentColorObj.hex }}
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
                            <span className="text-xs font-semibold block text-slate-800 dark:text-slate-100 truncate">
                              {pattern.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
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
                  <h3 className="font-sans font-semibold text-sm text-slate-900 dark:text-white">
                    Pilih Filter Estetik
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
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
                        className={`group relative p-2.5 rounded-2xl cursor-pointer border transition-all ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/40'
                            : 'bg-white/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600'
                          }`}
                      >
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-black relative">
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

                        <span className="font-semibold text-xs text-slate-800 dark:text-white block">
                          {f.name}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {f.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Clean Stamps */}
            {activeTab === 'stamps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-slate-900 dark:text-white">
                      Stempel Tipografi & Grafis
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Klik stempel minimalis untuk menempelkan ke strip, lalu geser & atur ukurannya.
                    </p>
                  </div>

                  {stamps.length > 0 && (
                    <button
                      onClick={handleClearAllStamps}
                      className="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                      <span>Hapus Semua</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 max-h-56 overflow-y-auto">
                  {GRAPHIC_STAMPS.map((stamp) => (
                    <button
                      key={stamp.id}
                      onClick={() => handleAddStamp(stamp)}
                      className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-500 border border-slate-200 dark:border-slate-700/60 text-xs font-mono font-bold tracking-wider text-blue-600 dark:text-blue-200 transition-all flex items-center justify-center select-none shadow-sm"
                    >
                      <span>{stamp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. Text & Date */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-sm text-slate-900 dark:text-white">
                  Kustomisasi Teks & Tanggal
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul / Caption Foto:
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Contoh: STUDIO MEMORIES"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Tampil di watermark bawah frame</span>
                    <span>{caption.length}/28</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.75} />
                    <span>Format Tanggal:</span>
                  </label>
                  <input
                    type="text"
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    placeholder="2026.09.09"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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
