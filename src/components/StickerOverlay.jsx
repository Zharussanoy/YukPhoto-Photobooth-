import React, { useState, useRef } from 'react';
import { RotateCw, Trash2, Plus, Minus } from 'lucide-react';
import { playPopSound } from '../utils/audio';

export default function StickerOverlay({
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  onRemoveSticker,
  containerRef,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, startY: 0, startPercentX: 0, startPercentY: 0 });

  const handlePointerDown = (e, sticker) => {
    e.stopPropagation();
    playPopSound();
    onSelectSticker(sticker.id);
    setIsDragging(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragInfo.current = {
      startX: clientX,
      startY: clientY,
      startPercentX: sticker.xPercent,
      startPercentY: sticker.yPercent,
    };

    const handlePointerMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - dragInfo.current.startX;
      const deltaY = currentY - dragInfo.current.startY;

      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      let newX = Math.max(5, Math.min(95, dragInfo.current.startPercentX + deltaPercentX));
      let newY = Math.max(5, Math.min(95, dragInfo.current.startPercentY + deltaPercentY));

      onUpdateSticker(sticker.id, {
        xPercent: newX,
        yPercent: newY,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleRotate = (e, sticker) => {
    e.stopPropagation();
    playPopSound();
    const newRot = ((sticker.rotation || 0) + 15) % 360;
    onUpdateSticker(sticker.id, { rotation: newRot });
  };

  const handleResize = (e, sticker, delta) => {
    e.stopPropagation();
    playPopSound();
    const newSize = Math.max(24, Math.min(100, (sticker.size || 48) + delta));
    onUpdateSticker(sticker.id, { size: newSize });
  };

  const handleDelete = (e, stickerId) => {
    e.stopPropagation();
    playPopSound();
    onRemoveSticker(stickerId);
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {stickers.map((sticker) => {
        const isSelected = selectedStickerId === sticker.id;
        const size = sticker.size || 48;
        const rotation = sticker.rotation || 0;

        return (
          <div
            key={sticker.id}
            style={{
              left: `${sticker.xPercent}%`,
              top: `${sticker.yPercent}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
            className="absolute pointer-events-auto select-none touch-none cursor-grab active:cursor-grabbing group"
            onMouseDown={(e) => handlePointerDown(e, sticker)}
            onTouchStart={(e) => handlePointerDown(e, sticker)}
          >
            {/* The Emoji Sticker */}
            <div
              style={{ fontSize: `${size}px`, lineHeight: 1 }}
              className={`p-1.5 transition-transform duration-150 drop-shadow-md select-none ${isSelected
                  ? 'ring-2 ring-blue-400 bg-blue-500/25 rounded-2xl backdrop-blur-[2px] scale-105'
                  : 'hover:scale-110'
                }`}
            >
              {sticker.emoji}
            </div>

            {/* Controls popup when selected */}
            {isSelected && (
              <div
                className={`absolute left-1/2 flex items-center gap-1 p-1 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 shadow-2xl z-30 ${
                  sticker.yPercent < 15 ? 'top-full mt-2' : '-top-11'
                }`}
                style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }} // keep controls upright
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {/* Rotate button */}
                <button
                  type="button"
                  onClick={(e) => handleRotate(e, sticker)}
                  title="Putar Stiker"
                  className="p-1 rounded-lg hover:bg-slate-800 text-blue-400 active:scale-95 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Smaller */}
                <button
                  type="button"
                  onClick={(e) => handleResize(e, sticker, -6)}
                  title="Perkecil"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-200 active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Larger */}
                <button
                  type="button"
                  onClick={(e) => handleResize(e, sticker, 6)}
                  title="Perbesar"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-200 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, sticker.id)}
                  title="Hapus Stiker"
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 active:scale-95 transition-all ml-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
