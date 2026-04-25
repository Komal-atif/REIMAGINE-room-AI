import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BeforeAfterSliderProps {
  before?: string | null;
  after?: string | null;
  className?: string;
  isDemo?: boolean;
}

export function BeforeAfterSlider({ before, after, className, isDemo }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden cursor-ew-resize select-none h-full", className)}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Image */}
      {after && <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />}
      
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50"
        style={{ width: `${sliderPos}%` }}
      >
        {before && (
          <img 
            src={before} 
            className="absolute inset-0 h-full object-cover max-w-none" 
            alt="Before" 
            style={{ width: containerWidth }} 
          />
        )}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md py-1.5 px-4 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] z-10 border border-white/10 shadow-xl">Before</div>
      </div>

      {/* After label */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md py-1.5 px-4 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] z-10 text-right border border-white/10 shadow-xl">After</div>

      {/* Slider Knob */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-white flex items-center justify-center z-20 pointer-events-none transition-all shadow-[0_0_10px_rgba(0,0,0,0.1)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div 
          className="w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center -ml-5 border border-slate-200 pointer-events-auto"
        >
          <div className="flex items-center gap-1.5 text-slate-900">
            <div className="w-1 h-1.5 border-l-2 border-t-2 border-slate-900 -rotate-45" />
            <div className="w-1 h-1.5 border-r-2 border-t-2 border-slate-900 rotate-45" />
          </div>
        </div>
        
        {/* Animated Directional Arrows */}
        {isDemo && (
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 whitespace-nowrap">
            <div className="text-[9px] font-black uppercase text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg shadow-indigo-500/30 animate-bounce">Slide to Reveal</div>
          </div>
        )}
      </div>
    </div>
  );
}
