// Clean filter presets, 2-section frame styling (Base Colors & Pattern Overlays), and layouts

export const PHOTO_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Warna natural kamera',
    cssFilter: 'none',
    canvasFilter: 'none',
  },
  {
    id: 'bw',
    name: 'B & W',
    description: 'Monokrom klasik kontras tinggi',
    cssFilter: 'grayscale(100%) contrast(120%) brightness(102%)',
    canvasFilter: 'grayscale(100%) contrast(1.2) brightness(1.02)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Tone hangat analog film 35mm',
    cssFilter: 'sepia(40%) contrast(110%) brightness(102%) saturate(115%)',
    canvasFilter: 'sepia(40%) contrast(1.1) brightness(1.02) saturate(1.15)',
  },
  {
    id: 'cyberblue',
    name: 'Cyber Blue',
    description: 'Cool tone bayangan biru elektrik',
    cssFilter: 'contrast(125%) saturate(130%) hue-rotate(185deg) brightness(105%)',
    canvasFilter: 'contrast(1.25) saturate(1.3) hue-rotate(185deg) brightness(1.05)',
  },
];

// Seksi 1: Warna Dasar Frame (Color Palette Selector)
export const FRAME_COLORS = [
  {
    id: 'white',
    name: 'Studio White',
    hex: '#FFFFFF',
    isLight: true,
    text: '#0F172A',
    subtext: '#64748B',
    border: 'rgba(15, 23, 42, 0.12)',
    badgeBg: 'bg-white text-slate-900 border-slate-300',
  },
  {
    id: 'black',
    name: 'Onyx Black',
    hex: '#111111',
    isLight: false,
    text: '#FFFFFF',
    subtext: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.12)',
    badgeBg: 'bg-[#111111] text-white border-zinc-700',
  },
  {
    id: 'cream',
    name: 'Cream Vintage',
    hex: '#F5F2EB',
    isLight: true,
    text: '#292524',
    subtext: '#78716C',
    border: 'rgba(41, 37, 36, 0.12)',
    badgeBg: 'bg-[#F5F2EB] text-stone-900 border-stone-300',
  },
  {
    id: 'blue',
    name: 'Electric Blue',
    hex: '#2563EB',
    isLight: false,
    text: '#FFFFFF',
    subtext: '#BFDBFE',
    border: 'rgba(255, 255, 255, 0.2)',
    badgeBg: 'bg-[#2563EB] text-white border-blue-400',
  },
  {
    id: 'navy',
    name: 'Slate Navy',
    hex: '#0F172A',
    isLight: false,
    text: '#FFFFFF',
    subtext: '#93C5FD',
    border: 'rgba(147, 197, 253, 0.2)',
    badgeBg: 'bg-[#0F172A] text-white border-slate-700',
  },
  {
    id: 'pink',
    name: 'Soft Pastel Pink',
    hex: '#FCE7F3',
    isLight: true,
    text: '#4C0519',
    subtext: '#9F1239',
    border: 'rgba(76, 5, 25, 0.12)',
    badgeBg: 'bg-[#FCE7F3] text-pink-950 border-pink-300',
  },
];

// Seksi 2: Tekstur & Pola Motif (Pattern Overlay di atas warna dasar)
export const FRAME_PATTERNS = [
  {
    id: 'none',
    name: 'Polos',
    subtitle: 'Solid Clean',
    description: 'Tanpa motif overlay, warna dasar bersih dan minimalis',
  },
  {
    id: 'checkered',
    name: 'Grid Checkered',
    subtitle: 'Pola Kotak Transparan',
    description: 'Pola kotak-kotak minimalis transparan bergaris halus',
  },
  {
    id: 'grain',
    name: 'Subtle Grain',
    subtitle: 'Tekstur Film Analog',
    description: 'Tekstur grainy halus ala film analog di atas warna dasar',
  },
  {
    id: 'border',
    name: 'Minimalist Border',
    subtitle: 'Garis Ganda Presisi',
    description: 'Garis tepi ganda / border putus-putus presisi',
  },
  {
    id: 'gradient',
    name: 'Modern Gradient',
    subtitle: 'Gradien Bayangan',
    description: 'Gradien transparan lembut ke aksen gelap/terang',
  },
];

export const FRAME_LAYOUTS = [
  {
    id: 'strip-3',
    name: '3-Strip Vertikal',
    subtitle: 'Classic Photostrip',
    photoCount: 3,
    description: '3 foto vertikal memanjang proporsional format photostrip autentik.',
    cols: 1,
    rows: 3,
  },
  {
    id: 'grid-2x2',
    name: 'Grid 2x2',
    subtitle: 'Photocard Grid',
    photoCount: 4,
    description: '4 foto tersusun 2 baris x 2 kolom proporsional dan seimbang.',
    cols: 2,
    rows: 2,
  },
  {
    id: 'strip-4',
    name: 'Classic 4-Foto',
    subtitle: 'Vintage Photobox',
    photoCount: 4,
    description: '4 foto vertikal bertingkat format strip retro.',
    cols: 1,
    rows: 4,
  },
];

// Clean typography badges / graphic stamps
export const GRAPHIC_STAMPS = [
  { id: 'stamp-1', label: 'YUKPHOTO', type: 'text', border: true },
  { id: 'stamp-2', label: 'ARCHIVE', type: 'badge', border: true },
  { id: 'stamp-3', label: 'STUDIO 01', type: 'text', border: false },
  { id: 'stamp-4', label: 'ORIGINAL', type: 'badge', border: true },
  { id: 'stamp-5', label: 'VERIFIED', type: 'pill', border: true },
  { id: 'stamp-6', label: '35MM FILM', type: 'text', border: true },
  { id: 'stamp-7', label: 'OFFICIAL', type: 'pill', border: false },
  { id: 'stamp-8', label: 'COLLECTION', type: 'badge', border: true },
  { id: 'stamp-9', label: 'NO. 2026', type: 'text', border: true },
  { id: 'stamp-10', label: 'PROOF', type: 'badge', border: true },
  { id: 'stamp-11', label: 'LIMITED', type: 'pill', border: true },
  { id: 'stamp-12', label: 'EXPOSURE', type: 'text', border: false },
];
