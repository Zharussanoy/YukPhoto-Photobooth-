import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Real mouse coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  // Trailing ring coordinates
  const ringPos = useRef({ x: -100, y: -100 });
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    // Only show custom cursor on fine pointer devices (desktop mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target;
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.getAttribute('data-cursor-hover') === 'true'
      );
      setIsHovered(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    const animate = () => {
      // Lerp ring position towards mouse position
      const speed = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * speed;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * speed;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Center sharp micro dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        style={{ transition: 'opacity 0.2s ease' }}
      >
        <div className={`w-1.5 h-1.5 rounded-full bg-blue-400 ${isHovered ? 'scale-0' : 'scale-100'} transition-transform duration-150`} />
      </div>

      {/* Smooth Trailing Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
      >
        <div
          className={`rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
            isHovered
              ? 'w-12 h-12 border-blue-400 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              : isClicking
              ? 'w-6 h-6 border-blue-500 bg-blue-500/30'
              : 'w-7 h-7 border-blue-400/60 bg-transparent'
          }`}
        />
      </div>
    </>
  );
}
