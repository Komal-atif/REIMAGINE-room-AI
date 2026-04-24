import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  className?: string;
}

export function BeforeAfterSlider({ before, after, className }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

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
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50"
        style={{ width: `${sliderPos}%` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-cover max-w-none" alt="Before" style={{ width: '100vw' }} />
        <div className="absolute top-4 left-4 glass-morphism py-1 px-3 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest z-10">Before</div>
      </div>

      {/* After label */}
      <div className="absolute top-4 right-4 glass-morphism py-1 px-3 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest z-10 text-right">After</div>

      {/* Slider Knob */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center z-20 pointer-events-none group-hover:w-1.5 transition-all"
        style={{ left: `${sliderPos}%` }}
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center -ml-6 border-4 border-slate-900/5 backdrop-blur-sm"
        >
          <div className="flex gap-1.5">
            <motion.div 
              animate={{ height: [12, 16, 12] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 bg-indigo-500 rounded-full" 
            />
            <motion.div 
              animate={{ height: [16, 12, 16] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 bg-purple-500 rounded-full" 
            />
          </div>
        </motion.div>
        
        {/* Animated Directional Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="text-[8px] font-black uppercase text-white bg-slate-950/40 px-2 py-1 rounded-full backdrop-blur-md">Slide to Reveal</div>
        </div>
      </div>
    </div>
  );
}
