/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Sparkles, 
  Wallet, 
  ExternalLink,
  ChevronLeft,
  X,
  Palette,
  CheckCircle2,
  AlertCircle,
  Layout,
  Layers,
  ArrowUpRight,
  History,
  RotateCw,
  Plus,
  ShoppingBag,
  Search
} from 'lucide-react';
import { cn } from './lib/utils';
import { RoomType, DesignStyle, DesignSuggestion, FurnitureItem, DesignHistoryItem, ColorPalette } from './types';
import { generateDesignPlan, generateTransformedImage } from './services/geminiService';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';

const PALETTES: { name: ColorPalette; colors: string[]; colorNames: string[] }[] = [
  { name: 'Warm Neutrals', colors: ['#EAD7BB', '#BCA37F', '#FFF2D8'], colorNames: ['Almond', 'Camel', 'Parchment'] },
  { name: 'Oceanic Blues', colors: ['#005B96', '#7FB3D5', '#D4E6F1'], colorNames: ['Deep Sea', 'Sky Blue', 'Ice Blue'] },
  { name: 'Forest Greens', colors: ['#1A4D2E', '#4F6F52', '#E8DFCA'], colorNames: ['Hunter Green', 'Sage', 'Oatmeal'] },
  { name: 'Monochrome', colors: ['#000000', '#555555', '#FFFFFF'], colorNames: ['Pure Black', 'Slate Grey', 'Pure White'] },
  { name: 'Soft Pastels', colors: ['#FFD1E3', '#B1AFFF', '#D0FFC1'], colorNames: ['Blush Pink', 'Lavender', 'Mint'] },
  { name: 'Midnight Gold', colors: ['#0C134F', '#1D267D', '#FFD700'], colorNames: ['Midnight', 'Navy Royal', 'Metallic Gold'] },
  { name: 'Sunset Terracotta', colors: ['#A04747', '#D8A25E', '#EEDF7A'], colorNames: ['Burnt Sienna', 'Ochre', 'Sunny'] },
  { name: 'Industrial Steel', colors: ['#2C3333', '#395B64', '#A5C9CA'], colorNames: ['Gunmetal', 'Patina', 'Silver'] },
  { name: 'Desert Sand', colors: ['#C2B280', '#966919', '#F5F5DC'], colorNames: ['Sand', 'Bronze', 'Beige'] },
];

const Tooltip = ({ children, text, key }: { children: React.ReactNode, text: string, key?: any }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl z-50 whitespace-nowrap border border-white/10 pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={cn("relative group cursor-pointer", className)}>
    {/* Dynamic Background Glows - Base breathing + Hover intensify */}
    <motion.div 
      className="absolute -inset-6 bg-linear-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-20 transition-all duration-1000"
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute -inset-6 bg-linear-to-tr from-indigo-500/40 via-purple-500/40 to-pink-500/40 rounded-full blur-3xl group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 opacity-0 pointer-events-none" />
    
    <div className="relative flex items-center justify-center w-full h-full bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden z-10 transition-all duration-500 group-hover:border-indigo-200">
      <div className="absolute inset-0 bg-linear-to-br from-white via-white to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <svg width="65%" height="65%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-20">
        {/* Architectural Frame */}
        <motion.path 
          d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-slate-800 transition-colors duration-500 group-hover:text-indigo-600"
          animate={{ strokeWidth: [1.5, 1.8, 1.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Main AI Sparkle (Pulse + Continuous Rotate + Hover Scale) */}
        <motion.path 
          d="M12 8L12.7 11.3L16 12L12.7 12.7L12 16L11.3 12.7L8 12L11.3 11.3L12 8Z" 
          fill="url(#logo-grad-animated)" 
          animate={{ 
            rotate: 360,
            scale: [1, 1.25, 1],
            opacity: [0.9, 1, 0.9]
          }}
          whileHover={{ scale: 1.5, rotate: 720 }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ originX: "12px", originY: "12px" }}
          className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-500"
        />
        
        <defs>
          <linearGradient id="logo-grad-animated" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Decorative Mini Sparkles (Rotating + Pulsing) */}
      <div className="absolute top-2 right-2 z-30 pointer-events-none">
        <motion.div
           animate={{ rotate: 360, scale: [0.8, 1.4, 0.8] }}
           transition={{ 
             rotate: { duration: 5, repeat: Infinity, ease: "linear" },
             scale: { duration: 2.5, repeat: Infinity }
           }}
        >
          <Sparkles size={8} className="text-indigo-400 fill-indigo-400 opacity-60" />
        </motion.div>
      </div>
      <div className="absolute bottom-2 left-2 z-30 pointer-events-none">
        <motion.div
           animate={{ rotate: -360, scale: [0.7, 1.2, 0.7] }}
           transition={{ 
             rotate: { duration: 7, repeat: Infinity, ease: "linear" },
             scale: { duration: 3.5, repeat: Infinity }
           }}
        >
          <Sparkles size={6} className="text-purple-400 fill-purple-400 opacity-50" />
        </motion.div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState<'upload' | 'config' | 'loading' | 'results'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>('Living Room');
  const [style, setStyle] = useState<DesignStyle>('Modern');
  const [colorPalette, setColorPalette] = useState<ColorPalette>('Warm Neutrals');
  const [budget, setBudget] = useState<number>(100000);
  const [suggestion, setSuggestion] = useState<DesignSuggestion | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState('Analyzing space...');
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredPalette, setHoveredPalette] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setStep('config');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const handleReset = () => {
    setImage(null);
    setSuggestion(null);
    setGeneratedImage(null);
    setStep('upload');
  };

  const startRedesign = async () => {
    if (!image) {
      setError('Please upload a photo of your room first so our AI can analyze the space.');
      return;
    }
    
    if (!roomType || !style || !colorPalette) {
      setError('Wait! Please make sure you have selected a Room Type, Design Style, and Color Palette.');
      return;
    }

    setStep('loading');
    setError(null);
    try {
      setLoadingState('Analyzing room layout...');
      const result = await generateDesignPlan(image, roomType, style, budget, colorPalette);
      
      setLoadingState('Reimagining furniture & lighting...');
      const transformedResult = await generateTransformedImage(image, result.redesignDescription);
      
      const newHistoryItem: DesignHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        suggestion: result,
        image: transformedResult.url,
        isFallbackImage: transformedResult.isFallback,
        timestamp: Date.now(),
        config: { roomType, style, colorPalette, budget }
      };

      setSuggestion(result);
      setGeneratedImage(transformedResult.url);
      setIsFallbackMode(transformedResult.isFallback);
      setHistory(prev => [newHistoryItem, ...prev]);
      setStep('results');
    } catch (err: any) {
      // Provide more specific feedback based on common error patterns
      let userFriendlyError = 'Something went wrong while reimagining your space.';
      
      if (err.message?.includes('quota') || err.message?.includes('429')) {
        userFriendlyError = 'We are currently receiving a high volume of requests. Please wait a minute and try again.';
      } else if (err.message?.includes('network') || !window.navigator.onLine) {
        userFriendlyError = 'Connection lost. Please check your internet and try again.';
      } else if (err.message) {
        userFriendlyError = err.message;
      }
      
      setError(userFriendlyError);
      setStep('config');
    }
  };

  const selectHistoryItem = (item: DesignHistoryItem) => {
    setSuggestion(item.suggestion);
    setGeneratedImage(item.image);
    setIsFallbackMode(item.isFallbackImage || false);
    setRoomType(item.config.roomType);
    setStyle(item.config.style);
    setColorPalette(item.config.colorPalette);
    setBudget(item.config.budget);
    setStep('results');
    setShowHistory(false);
  };

  const selectRoomType = (type: RoomType) => {
    setRoomType(type);
    setError(null);
  };

  const selectStyle = (s: DesignStyle) => {
    setStyle(s);
    setError(null);
  };

  const selectColorPalette = (p: ColorPalette) => {
    setColorPalette(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-mesh-light text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Decorative Stickers & Doodles for Upload Screen */}
      <AnimatePresence>
        {step === 'upload' && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Room Stickers */}
            <motion.div 
              initial={{ opacity: 0, rotate: -15, x: -100 }}
              animate={{ opacity: 1, rotate: -12, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="absolute top-[15%] left-[5%] w-48 h-60 bg-white p-3 shadow-2xl rounded-sm border-8 border-white hidden lg:block"
            >
              <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400" className="w-full h-[85%] object-cover grayscale-[0.3] hover:grayscale-0 transition-all" alt="Bedroom Idea" />
              <div className="mt-2 text-[10px] font-handwriting text-slate-400 text-center">Dream Suite</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, rotate: 10, x: 100 }}
              animate={{ opacity: 1, rotate: 8, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute top-[20%] right-[8%] w-56 h-40 bg-white p-3 shadow-2xl rounded-sm border-8 border-white hidden lg:block"
            >
              <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=400" className="w-full h-[80%] object-cover grayscale-[0.3]" alt="Lounge Idea" />
              <div className="mt-1 text-[10px] font-handwriting text-slate-400 text-center">Cozy Corner</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, rotate: -5, y: 100 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-[10%] left-[12%] w-44 h-56 bg-white p-3 shadow-2xl rounded-sm border-8 border-white hidden lg:block"
            >
              <img src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400" className="w-full h-[85%] object-cover grayscale-[0.3]" alt="Workspace Idea" />
              <div className="mt-2 text-[10px] font-handwriting text-slate-400 text-center">Pure Focus</div>
            </motion.div>

            {/* Doodle Elements */}
            <svg className="absolute w-full h-full opacity-10">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1 }}
                d="M 50 100 Q 150 50 250 150 T 450 100" 
                stroke="#6366f1" strokeWidth="4" fill="none" strokeDasharray="10 10" 
              />
              <motion.circle 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                cx="80%" cy="15%" r="40" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5 5" 
              />
              <motion.rect 
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 45 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                x="10%" y="70%" width="30" height="30" fill="none" stroke="#8b5cf6" strokeWidth="2" 
              />
            </svg>

            {/* Scattered Icons as Doodles */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[40%] left-[20%] text-indigo-300 opacity-20"><Palette size={64} /></motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-[30%] right-[15%] text-pink-300 opacity-20"><Sparkles size={80} /></motion.div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-[60%] right-[25%] text-purple-300 opacity-20"><RotateCw size={48} /></motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/60 backdrop-blur-3xl border-b border-slate-100/50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={handleReset}>
          <CustomLogo className="w-11 h-11" />
          <div>
            <h1 className="font-display font-bold text-xl tracking-[-0.03em] leading-none flex items-baseline gap-1">
              <span className="text-slate-900 uppercase tracking-tighter">Reimagine</span>
              <span className="gradient-text tracking-tight">Room AI</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
              <div className="h-[1px] w-4 bg-indigo-500/30"></div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-400 leading-none">Interior Intelligence</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {history.length > 0 && (
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <History size={18} />
              History ({history.length})
            </button>
          )}
          <button 
            onClick={handleReset}
            className="h-10 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
          >
            <Plus size={16} />
            Start New
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[70] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-black tracking-tight">Design History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                {history.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => selectHistoryItem(item)}
                    className="w-full text-left group overflow-hidden rounded-2xl border border-slate-100 hover:border-indigo-500 transition-all duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.suggestion.title} />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent flex items-end p-3">
                        <div className="text-[9px] font-bold text-white uppercase tracking-widest">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white group-hover:bg-indigo-50/30 transition-colors">
                      <h3 className="font-bold text-sm text-slate-800 truncate mb-1">{item.suggestion.title}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">RS {item.suggestion?.overallPrice?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">

          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-8">
                <Sparkles size={14} className="text-indigo-600" /> Grounded in Space & Budget
              </div>
              <h1 className="font-display text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-slate-900">
                Elevate Your <br />
                <span className="gradient-text">Personal Space</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-16 leading-relaxed">
                Experience architectural preservation combined with artistic reimagining. Strictly layout-locked, budget-conscious, and beautiful.
              </p>

              <div 
                {...getRootProps()} 
                className={cn(
                  "w-full max-w-3xl h-[400px] rounded-[48px] border-2 border-dashed relative group transition-all duration-500 z-10",
                  isDragActive ? "border-indigo-500 bg-indigo-50/80" : "border-slate-200 hover:border-indigo-500/50 bg-white/40 backdrop-blur-md hover:bg-white/60 shadow-2xl shadow-indigo-500/5"
                )}
              >
                <input {...getInputProps()} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                    <Upload size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">Upload Room Photo</h3>
                  <p className="text-slate-500 font-medium">Drag and drop your space or browse files</p>
                  <p className="mt-4 text-[11px] uppercase tracking-widest font-bold text-slate-400">Layout will be preserved exactly</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'config' && image && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              <div className="space-y-12 h-fit sticky top-32">
                <div className="group relative rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 aspect-4/3 translate-z-0">
                  <img src={image} alt="Source" className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="glass-morphism h-8 px-4 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Source Capture</span>
                    </div>
                  </div>
                  <button onClick={handleReset} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl transition-all border border-white/10 text-white"><X size={20} /></button>
                </div>

                <div className="glass-morphism rounded-[32px] p-8 border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20"><Layout size={24} /></div>
                    <h4 className="font-bold text-xl">Spatial Lockdown</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    ReimagineRoom AI is currently in <span className="text-white font-bold tracking-tight italic">Structural Lock Mode</span>. Windows, doors, and walls are architectural anchors—they will not be moved. Only aesthetics and furniture will transform.
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-10">
                  <section className="space-y-8">
                    <h2 className="text-4xl font-display font-black tracking-tight flex items-center gap-4">
                      <Palette size={36} className="text-indigo-500" /> Configuration
                    </h2>
                    
                    <div className="space-y-6">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Select Space Template</label>
                      <div className="grid grid-cols-2 gap-4">
                        {(['Bedroom', 'Living Room', 'Study', 'Office'] as RoomType[]).map(type => (
                          <button
                            key={type}
                            onClick={() => selectRoomType(type)}
                            className={cn(
                              "h-20 rounded-3xl border transition-all duration-300 text-sm font-bold uppercase tracking-widest relative group overflow-hidden",
                              roomType === type 
                                ? "border-indigo-500 bg-indigo-500/10 text-white shadow-2xl shadow-indigo-500/10" 
                                : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            <span className="relative z-10">{type}</span>
                            {roomType === type && <motion.div layoutId="room-glow" className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-transparent pointer-events-none" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Aesthetic Direction</label>
                      <div className="grid grid-cols-2 gap-4">
                        {(['Modern', 'Minimal', 'Aesthetic', 'Bohemian'] as DesignStyle[]).map(s => (
                          <button
                            key={s}
                            onClick={() => selectStyle(s)}
                            className={cn(
                              "h-20 rounded-3xl border transition-all duration-300 text-sm font-bold uppercase tracking-widest relative group overflow-hidden",
                              style === s 
                                ? "border-purple-500 bg-purple-500/10 text-white shadow-2xl shadow-purple-500/10" 
                                : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            <span className="relative z-10">{s}</span>
                            {style === s && <motion.div layoutId="style-glow" className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-transparent pointer-events-none" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Signature Color Palette</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {PALETTES.map(p => (
                          <div key={p.name} className="relative group/palette">
                            <button
                              onMouseEnter={() => setHoveredPalette(p.name)}
                              onMouseLeave={() => setHoveredPalette(null)}
                              onClick={() => selectColorPalette(p.name)}
                              className={cn(
                                "w-full p-4 rounded-3xl border transition-all duration-300 relative text-left",
                                colorPalette === p.name 
                                  ? "border-indigo-500 bg-indigo-500/10 shadow-2xl shadow-indigo-500/10" 
                                  : "border-white/10 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <div className="flex flex-col gap-3 relative z-10">
                                <div className="flex -space-x-2">
                                  {p.colors.map((color, i) => (
                                    <div 
                                      key={i} 
                                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                                      style={{ backgroundColor: color }} 
                                    />
                                  ))}
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-wider transition-colors",
                                  colorPalette === p.name ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                )}>
                                  {p.name}
                                </span>
                              </div>
                              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                {colorPalette === p.name && (
                                  <motion.div 
                                    layoutId="palette-glow" 
                                    className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-transparent" 
                                  />
                                )}
                              </div>
                            </button>

                            <AnimatePresence>
                              {hoveredPalette === p.name && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50 pointer-events-none whitespace-nowrap"
                                >
                                  <div className="flex gap-2 items-center">
                                    {p.colorNames.map((name, i) => (
                                      <div key={i} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.colors[i] }} />
                                        <span className="text-[9px] font-bold text-white/90 tracking-wide uppercase">{name}</span>
                                        {i < p.colorNames.length - 1 && <div className="w-px h-2 bg-white/10 mx-0.5" />}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/90" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8 glass-morphism rounded-[40px] p-10 border-white/10 shadow-2xl relative overflow-hidden group">
                    {/* Background Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors duration-700" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Financial Plan</label>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">Set your investment ceiling for RS (PKR)</p>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 border border-white/5 group-hover:scale-105 transition-transform duration-500">
                        <Wallet size={16} className="text-green-400" />
                        <span className="text-sm font-mono font-black tracking-tight">RS {budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="relative py-10 px-2">
                        {/* Legend / Tick Marks Underlay */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none z-10">
                          {[20000, 100000, 250000, 500000, 1000000].map(val => (
                            <div key={val} className="flex flex-col items-center">
                              <motion.div 
                                animate={{ 
                                  scale: budget >= val ? 1.5 : 1,
                                  backgroundColor: budget >= val ? "#fff" : "#cbd5e1" 
                                }}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-colors", 
                                  budget >= val ? "shadow-[0_0_10px_rgba(255,255,255,0.8)]" : ""
                                )} 
                              />
                            </div>
                          ))}
                        </div>

                        {/* Visual Track */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                          <motion.div 
                            className="h-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600"
                            initial={false}
                            animate={{ width: `${(budget - 20000) / (1000000 - 20000) * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        </div>

                        {/* Floating Value Indicator */}
                        <motion.div 
                          className="absolute -top-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-mono font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-2 border border-white/10 z-20 pointer-events-none whitespace-nowrap"
                          initial={false}
                          animate={{ 
                            left: `${(budget - 20000) / (1000000 - 20000) * 100}%`,
                            translateX: "-50%" 
                          }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          RS {budget.toLocaleString()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                        </motion.div>

                        {/* Interactive Input Layer */}
                        <input 
                          type="range" 
                          min="20000" 
                          max="1000000" 
                          step="5000"
                          value={budget}
                          onChange={(e) => {
                            setBudget(Number(e.target.value));
                            setError(null);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        />
                      </div>

                      <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] px-2">
                        <span className="opacity-60">Essential (20k)</span>
                        <span className="text-indigo-500/60">Premium (250k)</span>
                        <span className="opacity-60">Elite (1M)</span>
                      </div>
                    </div>
                  </section>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-5 flex items-start gap-4 shadow-xl relative overflow-hidden group/error"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                        <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
                          <AlertCircle size={18} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <h4 className="text-red-800 font-bold text-[10px] uppercase tracking-[0.2em]">Action Required</h4>
                            <p className="text-red-600/90 text-sm font-medium leading-relaxed">{error}</p>
                          </div>
                          
                          {error.includes('Queue') || error.includes('volume') || error.includes('Quota') ? (
                            <button 
                              onClick={startRedesign}
                              className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-colors flex items-center gap-2"
                            >
                              <RotateCw size={12} />
                              Try Reconnecting Now
                            </button>
                          ) : null}
                        </div>
                        <button 
                          onClick={() => setError(null)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-100 rounded-lg absolute top-4 right-4"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={startRedesign}
                    className="w-full h-20 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[32px] font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all transform-gpu"
                  >
                    <Sparkles size={28} />
                    Begin AI Redesign
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 animate-pulse-slow">
                  <div className="w-full h-full rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                    <div className="w-[85%] h-[85%] rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                      <div className="w-[70%] h-[70%] rounded-full border-2 border-pink-500/40" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-full"
                  >
                    <Sparkles size={48} className="text-white absolute -top-4 left-1/2 -ml-6" />
                  </motion.div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Processing</span>
                  <div className="h-6 overflow-hidden">
                    <motion.p 
                      key={loadingState}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="font-display font-bold text-lg tracking-tight"
                    >
                      {loadingState}
                    </motion.p>
                  </div>
                </div>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed uppercase text-[10px] tracking-[0.2em] font-black">
                Architectural mapping and furniture grounding in progress.
              </p>
            </motion.div>
          )}

          {step === 'results' && suggestion && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-24"
            >
              {/* Results Hero Section */}
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <button 
                      onClick={() => setStep('config')}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} /> Reconfigure Preferences
                    </button>
                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none">{suggestion.title}</h1>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="glass-morphism h-10 px-6 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Layout Verified</span>
                      </div>
                      <div className="glass-morphism h-10 px-6 rounded-2xl flex items-center gap-3 border-purple-500/20">
                        <Palette size={16} className="text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{style} Aesthetic</span>
                      </div>
                      <div className="glass-morphism h-10 px-6 rounded-2xl flex items-center gap-3 border-indigo-500/20">
                        <div className="flex -space-x-1.5 transition-all">
                          {PALETTES.find(p => p.name === colorPalette)?.colors.map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{colorPalette}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-6">
                    <button 
                      onClick={startRedesign}
                      className="h-14 px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                    >
                      <RotateCw size={18} />
                      Try Another Version
                    </button>
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                      <div className="glass-morphism rounded-[32px] p-6 pr-12 border-slate-100 relative overflow-hidden group/target flex-1 min-w-[200px]">
                        <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent opacity-0 group-hover/target:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Wallet size={10} className="text-slate-400" /> Investment Goal
                          </div>
                          <div className="text-3xl font-display font-black tracking-tighter text-slate-900">RS {suggestion?.totalBudget?.toLocaleString() || '0'}</div>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 group-hover/target:opacity-20 transition-opacity">
                          <Wallet size={48} className="text-slate-900" />
                        </div>
                      </div>
                      
                      <div className={cn(
                        "glass-morphism rounded-[32px] p-6 pr-12 border-indigo-100 relative overflow-hidden group/est flex-1 min-w-[240px]",
                        suggestion.overallPrice > suggestion.totalBudget ? "bg-amber-50/30" : "bg-indigo-50/30"
                      )}>
                        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/est:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Plus size={10} className="text-indigo-400" /> Projected Total
                          </div>
                          <div className="text-3xl font-display font-black tracking-tighter text-slate-900 leading-tight">RS {suggestion?.overallPrice?.toLocaleString() || '0'}</div>
                          
                          {/* Budget Utilization Indicator */}
                          <div className="mt-4 space-y-2">
                            <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-white/20">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((suggestion.overallPrice / suggestion.totalBudget) * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-700 relative",
                                  suggestion.overallPrice > suggestion.totalBudget ? "bg-amber-500" : "bg-indigo-600"
                                )}
                              >
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                              </motion.div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black tracking-[0.1em] uppercase">
                              <span className={suggestion.overallPrice > suggestion.totalBudget ? "text-amber-600" : "text-indigo-600"}>
                                {Math.round((suggestion.overallPrice / suggestion.totalBudget) * 100)}% Utilized
                              </span>
                              {suggestion.overallPrice > suggestion.totalBudget && (
                                <div className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                  <AlertCircle size={10} />
                                  <span>Over by RS {((suggestion?.overallPrice || 0) - (suggestion?.totalBudget || 0)).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 group-hover/est:opacity-20 transition-opacity">
                          <ShoppingBag size={48} className="text-indigo-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group rounded-[48px] overflow-hidden shadow-[0_48px_96px_-16px_rgba(0,0,0,0.7)] border border-white/10 bg-slate-900 h-[600px]">
                  <div className="w-full h-full">
                    <BeforeAfterSlider 
                      before={image!} 
                      after={generatedImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1600'} 
                    />
                    {isFallbackMode && (
                      <div className="absolute top-6 left-6 z-30 px-4 py-2 bg-amber-500/90 backdrop-blur-md rounded-xl border border-amber-400/50 shadow-2xl flex items-center gap-2">
                        <AlertCircle size={14} className="text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Visualizer Busy - Showing Layout Sync</span>
                      </div>
                    )}
                  </div>

                  {!generatedImage && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                      <Sparkles size={48} className="text-indigo-400 mb-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Synthesizing Vision...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transformation Log & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-12">
                  <div className="space-y-8 glass-morphism rounded-[40px] p-10 border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <h2 className="text-3xl font-display font-black tracking-tight flex items-center gap-4 text-slate-900">
                      <Layers size={32} className="text-indigo-600" /> Transformation Log
                    </h2>
                    <div className="space-y-6">
                      {suggestion.transformations.map((t, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                            0{i + 1}
                          </div>
                          <p className="text-slate-500 group-hover:text-slate-900 transition-colors pt-1 leading-relaxed text-sm font-medium">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 glass-morphism rounded-[40px] p-10 border-slate-100 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl translate-y-1/2 -translate-x-1/2" />
                    <h2 className="text-3xl font-display font-black tracking-tight flex items-center gap-4 text-slate-900">
                      <Layout size={32} className="text-purple-600" /> Element Updates
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {suggestion.transformedElements.map((el, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:bg-white hover:border-purple-200 transition-all duration-300">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-purple-600">{el.element}</div>
                          <div className="text-slate-600 font-medium text-sm leading-relaxed">{el.change}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-10">
                   <div className="flex items-center justify-between">
                     <h2 className="text-4xl font-display font-black tracking-tight">Curated Marketplace</h2>
                     <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                        <Sparkles size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">AI Verified Grounding</span>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {suggestion.furniture.map((item, index) => (
                      <motion.div 
                        key={item.id || index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group glass-morphism rounded-[32px] p-6 border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.12] transition-all duration-500 overflow-hidden relative"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-indigo-500/10 to-transparent blur-2xl group-hover:from-indigo-500/30 transition-all duration-500" />
                         <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="flex flex-col gap-2">
                            <div className="h-7 px-3 rounded-full bg-slate-950 text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center border border-white/5 w-fit">
                              {item.category}
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black text-indigo-500 uppercase tracking-widest pl-1">
                              <CheckCircle2 size={10} /> Quality Grounded
                            </div>
                          </div>
                          <div className="text-2xl font-display font-black text-slate-900 leading-none tracking-tighter flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 tracking-widest uppercase mb-1">Price</span>
                            RS {item?.price?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors relative z-10 text-slate-800">{item.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed font-medium relative z-10 line-clamp-3">
                          {item.description}
                        </p>

                        {item.availableAt && item.availableAt.length > 0 && (
                          <div className="mb-6 relative z-10">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Available At</span>
                            <div className="flex flex-wrap gap-2">
                              {item.availableAt.map((shop, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-white text-indigo-600 text-[10px] font-bold border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors block text-center">
                                  {shop}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-auto space-y-3 relative z-20">
                          <Tooltip text={item.purchaseLink && item.purchaseLink.startsWith('http') ? 'View official product page' : `Searching Google for ${item.name}`}>
                            <a 
                              href={item.purchaseLink && item.purchaseLink.startsWith('http') ? item.purchaseLink : `https://www.google.com/search?q=${encodeURIComponent(`${item.name} furniture Pakistan price`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all transform-gpu shadow-xl shadow-slate-900/10 group/btn"
                            >
                              {item.purchaseLink && item.purchaseLink.startsWith('http') ? 'Shop Direct' : 'Compare Prices'}
                              <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </a>
                          </Tooltip>
                          
                          <Tooltip text={`Searching Daraz.pk for ${item.name}`}>
                            <a 
                              href={`https://www.daraz.pk/catalog/?q=${encodeURIComponent(item.name)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full h-12 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group/market"
                            >
                              Find on Daraz
                              <Search size={16} className="text-indigo-500" />
                            </a>
                          </Tooltip>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements - Dynamic Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 120, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 60, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[10%] w-[55%] h-[55%] bg-pink-500/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -120, 0],
            y: [0, -60, 0],
            scale: [1.1, 0.9, 1.1]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] -right-[5%] w-[45%] h-[45%] bg-amber-500/5 rounded-full blur-[120px]" 
        />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      </div>
    </div>
  );
}
