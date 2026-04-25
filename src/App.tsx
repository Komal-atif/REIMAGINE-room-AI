/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Sparkles, 
  Wallet, 
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
  Minus,
  Check,
  ShoppingBag,
  Search,
  Monitor as MonitorIcon,
  Briefcase,
  Calendar,
  ArrowLeft,
  ChevronDown,
  ArrowRight,
  Home
} from 'lucide-react';
import { cn } from './lib/utils';
import { RoomType, DesignStyle, DesignSuggestion, FurnitureItem, DesignHistoryItem, ColorPalette, AITool, GardenType, GardenStyle } from './types';
import { generateDesignPlan, generateTransformedImage } from './services/geminiService';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { Sidebar } from './components/Sidebar';

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

const STYLE_THUMBNAILS: Record<string, string> = {
  'Modern': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400',
  'Scandinavian': 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=400',
  'Christmas': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
  'Industrial': 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?auto=format&fit=crop&q=80&w=400',
  'Bohemian': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
  'Luxury': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400',
  // Garden Styles
  'English': 'https://images.unsplash.com/photo-1558094857-3f93028cc983?auto=format&fit=crop&q=80&w=400',
  'Elegant': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
  'Japanese': 'https://images.unsplash.com/photo-1583064313642-a7c149480c7e?auto=format&fit=crop&q=80&w=400',
  'Mediterranean': 'https://images.unsplash.com/photo-1516108317508-6788f6a160e6?auto=format&fit=crop&q=80&w=400',
};

const FLOOR_PLAN_SAMPLES = {
  'Technical': 'https://images.unsplash.com/photo-1749041688079-e0eff754ae13?auto=format&fit=crop&q=80&w=600',
  '2.5D': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
  '3D Isometric': 'https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=600'
};

const BUDGET_TIERS = [
  { label: 'Starter', min: 10000, max: 25000, desc: 'Essential upgrades & decor' },
  { label: 'Ideal', min: 25000, max: 50000, desc: 'Full furniture & style update' },
  { label: 'Premium', min: 50000, max: 150000, desc: 'Luxury materials & custom items' },
  { label: 'Elite', min: 150000, max: 500000, desc: 'Complete high-end overhaul' },
];

const DEMO_IMAGES: Record<string, { before: string; after: string }> = {};

const TOOL_INFO: Record<AITool | string, { title: string; subtitle: string; description: string }> = {
  'AI Room Planner': {
    title: 'AI Room Planner',
    subtitle: 'PROFESSIONAL ARCHITECT',
    description: 'Upload your room photo and watch as our AI creates professional-grade interior designs tailored to your style and budget in seconds.'
  },
  'AI Room Cleaner': {
    title: 'AI Room Cleaner',
    subtitle: 'SPACE OPTIMIZER',
    description: 'Instantly remove all furniture and clutter from any room photo. Perfect for visualizing potential or preparing real estate listings.'
  },
  'Paint Color Visualizer': {
    title: 'Paint Color Visualizer',
    subtitle: 'COLOR CONSULTANT',
    description: 'Experiment with different wall colors in real-time. Our AI understands lighting and shadows to give you a hyper-realistic preview.'
  },
  'Floor Plan Generator': {
    title: 'Floor Plan Generator',
    subtitle: 'SPACE ARCHITECT',
    description: 'Generate professional 2D and 3D floor plans from requirements or sketches.'
  },
  'Garden Design Generator': {
    title: 'Garden Design Generator',
    subtitle: 'BOTANICAL DESIGNER',
    description: 'Lush landscape and garden planning. Transform your outdoor space into a sanctuary.'
  }
};

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTool, setActiveTool] = useState<AITool | string>('AI Room Planner');
  const [activeTab, setActiveTab] = useState('Smart Layout');
  const [mode, setMode] = useState<'Style' | 'Custom'>('Style');
  const [step, setStep] = useState<'upload' | 'config' | 'loading' | 'results'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>('Living Room');
  const [style, setStyle] = useState<DesignStyle | any>('Modern');
  const [gardenType, setGardenType] = useState<any>('Garden');
  const [colorPalette, setColorPalette] = useState<ColorPalette>('Warm Neutrals');
  const [budget, setBudget] = useState<number>(25000);
  const [suggestion, setSuggestion] = useState<DesignSuggestion | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState('Analyzing space...');
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');
  const [floorPlanConfig, setFloorPlanConfig] = useState({
    rooms: {
      Bedroom: 1,
      Bathroom: 1,
      Kitchen: 1,
      LivingRoom: 1,
      DiningRoom: 1
    },
    area: 120,
    unit: 'Metric' as 'Metric' | 'Imperial',
    style: '2.5D' as 'Technical' | '2.5D' | '3D Isometric'
  });

  const activeDemo = useMemo(() => {
    return null;
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setStep('config');
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const startRedesign = async () => {
    if (!image && activeTool !== 'Floor Plan Generator') {
      setError('Please upload a photo or a sketch first.');
      return;
    }
    
    setStep('loading');
    setError(null);
    try {
      setLoadingState('Analyzing requirements...');
      
      let toolSpecificPrompt = "";
      // Prefer using the already generated image for floor plan transformations if it exists
      // If we are starting fresh (no image and no generated image), we'll use a sample image as a seed to ensure the AI knows the genre
      let sourceImage = (activeTool === 'Floor Plan Generator' && generatedImage) ? generatedImage : image;
      
      if (!sourceImage && activeTool === 'Floor Plan Generator') {
        sourceImage = (FLOOR_PLAN_SAMPLES as any)[floorPlanConfig.style] + '?auto=format&fit=crop&q=80&w=1000';
      }

      switch(activeTool) {
        case 'Floor Plan Generator':
          const styleInstructions = {
            'Technical': 'GENERATE A PROFESSIONAL 2D ARCHITECTURAL BLUEPRINT. Use high-contrast black lines on a clean white background. Use official CAD symbols for doors (swinging arcs), windows (parallel lines), and stairs. Include precise room labels and dimension lines. The final image must look like a high-resolution export of professional architectural software. NO 3D rendering, NO color shading.',
            '2.5D': 'GENERATE A 2D COLORED TOP-DOWN FLOOR PLAN. Top-down real estate marketing style. Realistic floor textures (light oak wood, grey tile), modern flat furniture icons, and clear white room labels. 100% PERFECT TOP-DOWN CAMERA ANGLE (90 degrees). Use clean white walls with a defined stroke.',
            '3D Isometric': 'GENERATE A PHOTOREALISTIC 3D ISOMETRIC DOLLHOUSE VIEW. No roof, no ceiling. Extruded thick walls painted in a clean neutral beige or light grey. Consistent light oak wood flooring throughout all rooms. Include EXCEPTIONAL DETAIL in furniture: plush beds with realistic grey/beige bedding, modern sofas with throw pillows, area rugs in living areas, dining tables with chairs, and fully modeled kitchen/bathroom fixtures. Use soft, warm studio lighting with realistic shadows and subtle ambient occlusion. Angle: 45-degree isometric corner perspective. Background: Clean, minimal solid light-grey or white studio background.'
          }[floorPlanConfig.style];
          
          toolSpecificPrompt = `${styleInstructions}
            Architectural Specifications (STRICT ADHERENCE):
            - Total Area: ${floorPlanConfig.area} ${floorPlanConfig.unit}
            - REQUIRED ROOMS: 
              * Bedrooms: EXACTLY ${floorPlanConfig.rooms.Bedroom} units.
              * Bathrooms: EXACTLY ${floorPlanConfig.rooms.Bathroom} units.
              * Kitchen: ${floorPlanConfig.rooms.Kitchen} unit.
              * Living Room: ${floorPlanConfig.rooms.LivingRoom} unit.
              * Dining Room: ${floorPlanConfig.rooms.DiningRoom} unit.
            
            STRICT RULES:
            1. You MUST include EXACTLY ${floorPlanConfig.rooms.Bedroom} Bedroom(s), ${floorPlanConfig.rooms.Bathroom} Bathroom(s), ${floorPlanConfig.rooms.Kitchen} Kitchen(s), ${floorPlanConfig.rooms.LivingRoom} Living Room(s), and ${floorPlanConfig.rooms.DiningRoom} Dining Room(s).
            2. Room names MUST be labeled clearly on the plan.
            3. The layout must be functional and logically organized for a ${floorPlanConfig.area} ${floorPlanConfig.unit} space.
            4. If a base image is provided, use its wall structure as a guide but FORCE the internal layout to have the EXACT room counts specified.
            5. Output ONLY the visual plan, no extra annotations outside the floor plan area.`;
          break;
        case 'AI Room Cleaner':
          toolSpecificPrompt = "Remove all furniture, rugs, wall hangings, and clutter. Show a completely empty, clean room. CRITICAL: The architectural shell (windows, doors, walls, ceiling) must remain 100% identical to the source. The resulting image should just be the empty version of the source room.";
          break;
        case 'Paint Color Visualizer':
          toolSpecificPrompt = `Keep all furniture and layout exactly the same. Only change the color of the walls to ${selectedColor}. Ensure realistic shadows and lighting on the new wall color.`;
          break;
        case 'Garden Design Generator':
          const gardenStyleDetails = {
            'English': 'Feature lush perennials, rambling roses, lavender, and traditional winding stone paths. Use wrought iron or wooden rustic benches.',
            'Elegant': 'Focus on symmetry, manicured boxwood hedges, high-end stone paving, elegant water features, and architectural outdoor lighting.',
            'Japanese': 'Incorporate Zen elements: gravel raking, moss, maples, stone lanterns, and a small koi pond or water feature with bamboo.',
            'Mediterranean': 'Use terracotta pots, gravel or travertine paths, olive trees, lavender, and shaded pergolas with climbing vines.'
          }[style as GardenStyle] || '';
          
          toolSpecificPrompt = `Redesign this ${gardenType} in ${style} style. ${gardenStyleDetails}
            Focus on landscape architecture, plants, paths, and outdoor features. 
            CRITICAL: Maintain the perspective and basic terrain structure. Suggest real products like outdoor seating from local nurseries or premium brands. Keep the vibe sophisticated and curated.`;
          break;
        case 'AI Room Planner':
          const tabPrompt = activeTab === 'Smart Layout' 
            ? "Focus heavily on space optimization and furniture placement while keeping the structural layout locked."
            : activeTab === 'Space Conversion'
            ? "Completely transform the purpose of the room while keeping structural integrity and camera angle."
            : "Focus on style transformation and color harmony while maintaining the exact room architecture.";
          toolSpecificPrompt = `Redesign as a ${style} ${roomType} using a ${colorPalette} palette. ${tabPrompt} Maintain the exact camera perspective and room layout. Budget is PKR ${budget}.`;
          break;
        default:
          toolSpecificPrompt = `Redesign as a ${style} ${roomType} using a ${colorPalette} palette. Maintain the exact camera perspective and room layout. Budget is PKR ${budget}.`;
      }

      setLoadingState('Analyzing space, furniture, and materials...');
      
      const [result, transformedResult] = await Promise.all([
        generateDesignPlan(
          sourceImage, 
          roomType, 
          style, 
          budget, 
          colorPalette,
          activeTool === 'AI Room Cleaner' ? 'clean' : 
          activeTool === 'Paint Color Visualizer' ? 'paint' : 
          activeTool === 'Floor Plan Generator' ? 'generate' : 'redesign',
          activeTool === 'Floor Plan Generator' ? toolSpecificPrompt : undefined
        ),
        generateTransformedImage(sourceImage, toolSpecificPrompt)
      ]);
      
      const newHistoryItem: DesignHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        suggestion: result,
        image: transformedResult.url,
        isFallbackImage: transformedResult.isFallback,
        timestamp: Date.now(),
        config: { roomType, style, colorPalette, budget, gardenType: activeTool === 'Garden Design Generator' ? gardenType : undefined }
      };

      setSuggestion(result);
      setGeneratedImage(transformedResult.url);
      setIsFallbackMode(transformedResult.isFallback);
      setHistory(prev => [newHistoryItem, ...prev]);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong while reimagining your space.');
      setStep('config');
    }
  };

  const handleReset = () => {
    setImage(null);
    setSuggestion(null);
    setGeneratedImage(null);
    setGardenType('Garden');
    setStep('upload');
  };

  const selectHistoryItem = (item: DesignHistoryItem) => {
    setSuggestion(item.suggestion);
    setGeneratedImage(item.image);
    setIsFallbackMode(item.isFallbackImage || false);
    setRoomType(item.config.roomType);
    setStyle(item.config.style);
    if (item.config.gardenType) setGardenType(item.config.gardenType);
    setColorPalette(item.config.colorPalette);
    setBudget(item.config.budget);
    setStep('results');
    setShowHistory(false);
  };

  const selectRoomType = (type: RoomType | any) => {
    setRoomType(type);
    setError(null);
  };

  const selectStyle = (s: DesignStyle | GardenStyle | any) => {
    setStyle(s);
    setError(null);
  };

  if (showWelcome) {
    return (
      <div className="h-screen w-screen bg-[#f7f7f2] flex flex-col items-center justify-center relative overflow-hidden font-display">
        {/* Decorative elements (stickers/doodles) */}
        <motion.div 
          initial={{ rotate: -12, opacity: 0, x: -50 }}
          animate={{ rotate: 12, opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", opacity: { duration: 1 } }}
          className="absolute top-[10%] left-[10%] w-32 h-32 bg-white rounded-2xl shadow-xl p-3 border border-slate-100 hidden md:block"
        >
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-lg" alt="Sticker" />
          <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full shadow-lg"><Sparkles size={16} /></div>
        </motion.div>

        <motion.div 
          initial={{ rotate: 6, opacity: 0, x: 50 }}
          animate={{ rotate: -8, opacity: 1, x: 0, y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", opacity: { duration: 1 } }}
          className="absolute bottom-[15%] right-[12%] w-40 h-40 bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 hidden md:block"
        >
          <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-2xl" alt="Sticker" />
          <div className="absolute -bottom-4 -left-4 bg-pink-500 text-white p-2 rounded-full shadow-lg font-handwriting text-xl px-4 py-1">Love!</div>
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-28 h-28 bg-white rounded-[2rem] shadow-lg p-2 border border-slate-50 hidden lg:block"
        >
          <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-[1.5rem]" alt="Sticker" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-[20%] right-[15%] w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[20%] left-[18%] w-32 h-32 bg-green-400/20 rounded-full blur-3xl" 
        />

        <div className="z-10 text-center space-y-12">
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-green-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-green-200"
            >
              <Sparkles size={40} />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black tracking-tighter text-slate-900"
            >
              REIMAGINE <span className="text-green-500">Room AI</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 text-xl font-medium tracking-wide"
            >
              INTERIOR INTELLIGENCE
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWelcome(false)}
            className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-4 group mx-auto"
          >
            Get Started
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Doodles/Ornaments */}
        <div className="absolute top-[40%] right-[25%] opacity-20 pointer-events-none">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0C30 16.5685 16.5685 30 0 30C16.5685 30 30 43.4315 30 60C30 43.4315 43.4315 30 60 30C43.4315 30 30 16.5685 30 0Z" fill="#1e293b" />
          </svg>
        </div>
        <div className="absolute bottom-[30%] left-[25%] opacity-20 pointer-events-none scale-75">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0C30 16.5685 16.5685 30 0 30C16.5685 30 30 43.4315 30 60C30 43.4315 43.4315 30 60 30C43.4315 30 30 16.5685 30 0Z" fill="#22c55e" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f7f7f2] text-slate-900 font-sans selection:bg-green-100 overflow-hidden">
      <Sidebar activeTool={activeTool} onSelectTool={(tool) => {
        setActiveTool(tool);
        handleReset(); // Reset when switching tools
      }} />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f2] relative flex flex-col">
        {/* Navigation / Header */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-[#f7f7f2]/80 backdrop-blur-md z-40 border-b border-slate-200/40 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
               <Home size={18} />
             </div>
             <div>
               <h1 className="font-display font-black text-lg tracking-tight text-slate-900 flex items-center gap-1.5 uppercase leading-none">
                 REIMAGINE <span className="text-green-500">Room AI</span>
               </h1>
               <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-none mt-0.5">Interior Intelligence</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleReset()}
              className="p-2 hover:bg-slate-200/50 rounded-xl transition-all text-slate-500"
              title="Home"
            >
              <Home size={18} />
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Plus size={14} />
              START NEW
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-[1400px] mx-auto w-full space-y-12 pb-24">
          {/* Hero Section */}
          <div className="text-center space-y-6 pt-12 relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e2f0d9] rounded-full text-[#548235] text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <Sparkles size={12} />
              GROUNDED IN SPACE & BUDGET
            </motion.div>

            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              Elevate Your <br />
              <span className="gradient-text">Personal Space</span>
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Experience architectural preservation combined with artistic reimagining. Strictly layout-locked, budget-conscious, and beautiful.
            </p>

            {activeTool === 'AI Room Planner' && (
              <div className="flex items-center justify-center gap-4 pt-6">
                {['Smart Layout', 'Style Transformation', 'Space Conversion'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      activeTab === tab ? "bg-[#e2f0d9] text-[#548235] shadow-sm shadow-[#e2f0d9]/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Interface Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
            {/* Left Column: Input & Config */}
            <div className="lg:col-span-5 space-y-10">
              {activeTool !== 'Floor Plan Generator' && (
                <section className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">
                    Images
                  </h3>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "w-full aspect-[16/10] rounded-[32px] border-2 border-dashed relative group transition-all duration-500 flex flex-col items-center justify-center p-8 text-center",
                      isDragActive ? "border-slate-900/40 bg-slate-100/50" : "border-slate-200 hover:border-slate-300 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                    )}
                  >
                    <input {...getInputProps()} />
                    {image ? (
                      <div className="relative w-full h-full overflow-hidden rounded-2xl group animate-in fade-in zoom-in">
                        <img src={image} className="w-full h-full object-cover" alt="Original" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest">Replace Photo</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-all duration-500 group-hover:bg-slate-100">
                          <Upload size={32} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-lg">Drag or upload image</h4>
                          <p className="text-xs text-slate-400 font-medium">Support jpg, jpeg, png, webp, up to 16MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {activeTool === 'AI Room Planner' ? (
                <>
                  {/* Style / Custom Toggle */}
                  <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 shadow-sm">
                    <button 
                      onClick={() => setMode('Style')}
                      className={cn(
                        "py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
                        mode === 'Style' 
                          ? "bg-white text-[#548235] shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-lg border-2 flex items-center justify-center",
                        mode === 'Style' ? "border-[#548235]" : "border-slate-300"
                      )}>
                        {mode === 'Style' && <div className="w-2 h-2 rounded-sm bg-[#548235]" />}
                      </div>
                      Style
                    </button>
                    <button 
                      onClick={() => setMode('Custom')}
                      className={cn(
                        "py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
                        mode === 'Custom' 
                          ? "bg-white text-[#548235] shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <MonitorIcon size={18} className={mode === 'Custom' ? "text-[#548235]" : "text-slate-400"} />
                      Custom
                    </button>
                  </div>

                  {/* Form Controls */}
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                    {mode === 'Style' ? (
                      <>
                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Room Type</label>
                          <div className="relative group">
                            <select 
                              value={roomType}
                              onChange={(e) => selectRoomType(e.target.value as RoomType)}
                              className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-6 py-4 pr-12 text-slate-900 font-bold focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                            >
                              {['Living Room', 'Bedroom', 'Office', 'Study'].map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Room Style</label>
                          <div className="grid grid-cols-3 gap-4">
                            {(['Modern', 'Scandinavian', 'Christmas', 'Industrial', 'Bohemian', 'Luxury'] as DesignStyle[]).map(s => {
                              const isActive = style === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => selectStyle(s)}
                                  className={cn(
                                    "relative aspect-video rounded-xl overflow-hidden group transition-all transform-gpu",
                                    isActive ? "ring-2 ring-[#70ad47] scale-[0.98]" : "hover:scale-[1.02]"
                                  )}
                                >
                                  <img src={STYLE_THUMBNAILS[s]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={s} />
                                  <div className={cn("absolute inset-0 bg-slate-900/20 transition-opacity", isActive ? "opacity-0" : "opacity-0 group-hover:opacity-10")} />
                                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">{s}</span>
                                  </div>
                                  {isActive && (
                                    <div className="absolute top-1.5 right-1.5 bg-[#70ad47] rounded-full p-1 shadow-xl">
                                      <CheckCircle2 size={10} className="text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Custom Description</label>
                        <textarea 
                          placeholder="Describe your dream room requirements, special features, or items you want to keep..."
                          className="w-full bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-6 py-4 min-h-[160px] text-slate-900 font-medium focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none"
                        />
                        <div className="flex flex-wrap gap-2 pt-2">
                          {['Change Wall Color', 'Better Lighting', 'Modern Furniture', 'Clear Clutter'].map(suggestion => (
                            <button 
                              key={suggestion}
                              className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                              + {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}




                    {/* Budget Slider */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget (PKR)</label>
                        <span className="text-sm font-black text-[#70ad47] px-3 py-1 bg-[#e2f0d9] rounded-lg">PKR {budget.toLocaleString()}</span>
                      </div>
                      <div className="px-2">
                        <input 
                          type="range" 
                          min="20000" 
                          max="500000" 
                          step="5000"
                          value={budget}
                          onChange={(e) => setBudget(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#70ad47]"
                        />
                        <div className="flex justify-between mt-2 px-0.5">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-[8px]">20,000</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-[8px]">500,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Config Bar & Generate Button */}
                    <div className="space-y-4">
                      <button 
                        onClick={startRedesign}
                        disabled={step === 'loading'}
                        className={cn(
                          "w-full py-5 rounded-[20px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                          step === 'loading' 
                            ? "bg-slate-300 cursor-not-allowed shadow-none" 
                            : "bg-[#70ad47] hover:bg-[#5e9639]"
                        )}
                      >
                        {step === 'loading' ? (
                          <>
                            <RotateCw className="animate-spin" size={20} />
                            Processing...
                          </>
                        ) : (
                          <>
                            Generate
                            <Sparkles size={18} />
                            <span className="opacity-60 text-sm ml-1">4</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : activeTool === 'Garden Design Generator' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Garden Type</label>
                    <div className="relative group">
                      <select 
                        value={gardenType}
                        onChange={(e) => setGardenType(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-6 py-4 pr-12 text-slate-900 font-bold focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                      >
                        {['Garden', 'Frontyard', 'Backyard'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Garden Style</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['English', 'Elegant', 'Japanese', 'Mediterranean'].map(s => {
                        const isActive = style === s;
                        return (
                          <button
                            key={s}
                            onClick={() => selectStyle(s)}
                            className={cn(
                              "relative aspect-[4/3] rounded-2xl overflow-hidden group transition-all transform-gpu",
                              isActive ? "ring-2 ring-[#70ad47] scale-[0.98]" : "hover:scale-[1.02]"
                            )}
                          >
                            <img src={STYLE_THUMBNAILS[s]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={s} />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                              <span className="text-xs font-black text-white uppercase tracking-widest">{s}</span>
                            </div>
                            {isActive && (
                              <div className="absolute top-2 right-2 bg-[#70ad47] rounded-full p-1.5 shadow-xl">
                                <Check size={12} strokeWidth={3} className="text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remove Budget Slider for Garden Generator */}

                  <button 
                    onClick={startRedesign}
                    disabled={step === 'loading'}
                    className={cn(
                      "w-full py-5 rounded-[20px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                      step === 'loading' 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#70ad47] hover:bg-[#5e9639]"
                    )}
                  >
                    {step === 'loading' ? (
                      <>
                        <RotateCw className="animate-spin" size={20} />
                        Designing Oasis...
                      </>
                    ) : (
                      <>
                        Generate
                        <Sparkles size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : activeTool === 'Floor Plan Generator' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  {/* Rooms Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Rooms</label>
                    <div className="space-y-3">
                      {(Object.entries(floorPlanConfig.rooms) as [keyof typeof floorPlanConfig.rooms, number][]).map(([room, count]) => (
                        <div key={room} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-sm font-bold text-slate-600">{(room as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setFloorPlanConfig(prev => ({
                                ...prev,
                                rooms: { ...prev.rooms, [room]: Math.max(room === 'Bedroom' ? 1 : 0, count - 1) }
                              }))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-slate-800 w-4 text-center">{count}</span>
                            <button 
                              onClick={() => setFloorPlanConfig(prev => ({
                                ...prev,
                                rooms: { ...prev.rooms, [room]: (count as number) + 1 }
                              }))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#70ad47] hover:bg-[#70ad47]/5 hover:border-[#70ad47] transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gross Area Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Gross Area</label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-bold text-slate-600">Unit</span>
                         <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['Metric', 'Imperial'].map((u) => (
                              <button
                                key={u}
                                onClick={() => setFloorPlanConfig(prev => ({ ...prev, unit: u as any }))}
                                className={cn(
                                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                  floorPlanConfig.unit === u ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                              >
                                {u}
                              </button>
                            ))}
                         </div>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-600">Area</span>
                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setFloorPlanConfig(prev => ({ ...prev, area: Math.max(10, prev.area - 10) }))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-slate-800 w-12 text-center">{floorPlanConfig.area}</span>
                            <button 
                              onClick={() => setFloorPlanConfig(prev => ({ ...prev, area: prev.area + 10 }))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#70ad47]"
                            >
                              <Plus size={14} />
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Style Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Technical', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300' },
                        { name: '2.5D', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=300' },
                        { name: '3D Isometric', img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=300' }
                      ].map((s) => (
                        <button
                          key={s.name}
                          onClick={() => setFloorPlanConfig(prev => ({ ...prev, style: s.name as any }))}
                          className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group",
                            floorPlanConfig.style === s.name ? "border-[#70ad47]" : "border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <img src={s.img} className="w-full h-full object-cover" alt={s.name} />
                          <div className={cn(
                            "absolute inset-0 flex flex-col justify-end p-2 transition-all",
                            floorPlanConfig.style === s.name ? "bg-[#70ad47]/20" : "bg-black/20"
                          )}>
                             <span className="text-[9px] font-black text-white uppercase tracking-widest">{s.name}</span>
                          </div>
                          {floorPlanConfig.style === s.name && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#70ad47] flex items-center justify-center text-white">
                               <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={startRedesign}
                    disabled={step === 'loading'}
                    className={cn(
                      "w-full py-5 rounded-[20px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                      step === 'loading' 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#70ad47] hover:bg-[#5e9639]"
                    )}
                  >
                    {step === 'loading' ? (
                      <>
                        <RotateCw className="animate-spin" size={20} />
                        Architecting Space...
                      </>
                    ) : (
                      <>
                        Generate
                        <Layout size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : activeTool === 'AI Room Cleaner' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <button 
                    onClick={startRedesign}
                    disabled={step === 'loading'}
                    className={cn(
                      "w-full py-5 rounded-[20px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                      step === 'loading' 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#70ad47] hover:bg-[#5e9639]"
                    )}
                  >
                    {step === 'loading' ? (
                      <>
                        <RotateCw className="animate-spin" size={20} />
                        Clearing Workspace...
                      </>
                    ) : (
                      <>
                        Generate
                        <Sparkles size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : activeTool === 'Paint Color Visualizer' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Select Wall Color</label>
                    <div className="grid grid-cols-5 gap-3">
                      {['#F5F5DC', '#E6E6FA', '#FFF0F5', '#F0FFF0', '#F0F8FF', '#E0FFFF', '#FFFAF0', '#F5FFFA', '#F0FFFF', '#FAF0E6'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-full aspect-square rounded-xl transition-all border-2",
                            selectedColor === color ? "border-[#70ad47] scale-95" : "border-white shadow-sm hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                       <label className="text-xs font-bold text-slate-400 block mb-2">Custom Color</label>
                       <input 
                         type="color" 
                         value={selectedColor} 
                         onChange={(e) => setSelectedColor(e.target.value)}
                         className="w-full h-12 rounded-xl cursor-pointer bg-white border border-slate-200 p-1"
                       />
                    </div>
                  </div>

                  <button 
                    onClick={startRedesign}
                    disabled={step === 'loading'}
                    className={cn(
                      "w-full py-5 rounded-[20px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                      step === 'loading' 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#70ad47] hover:bg-[#5e9639]"
                    )}
                  >
                    {step === 'loading' ? (
                      <>
                        <RotateCw className="animate-spin" size={20} />
                        Visualizing...
                      </>
                    ) : (
                      <>
                        Generate
                        <Palette size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <button 
                    onClick={startRedesign}
                    disabled={step === 'loading'}
                    className={cn(
                      "w-full py-5 rounded-[12px] font-black text-lg text-white shadow-[0_12px_30px_-6px_rgba(112,173,71,0.4)] transition-all transform-gpu flex items-center justify-center gap-3 active:scale-95",
                      step === 'loading' 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#70ad47] hover:bg-[#5e9639]"
                    )}
                  >
                    {step === 'loading' ? (
                      <>
                        <RotateCw className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-7">
              <div className="sticky top-28 space-y-6">
                <div 
                  onClick={() => (generatedImage || !image) && setShowFullscreen(true)}
                  className={cn(
                    "relative aspect-[4/3] w-full rounded-[48px] overflow-hidden bg-white shadow-[0_40px_80px_-12px_rgba(0,0,0,0.08)] border border-slate-100 group cursor-pointer",
                  )}
                >
                  {activeTool === 'Floor Plan Generator' && generatedImage ? (
                    <div className="w-full h-full bg-white flex items-center justify-center p-8">
                      <img 
                        src={generatedImage ?? undefined} 
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
                        alt="Floor Plan" 
                      />
                    </div>
                  ) : generatedImage ? (
                    <BeforeAfterSlider 
                      before={image ?? undefined} 
                      after={generatedImage} 
                      isDemo={!image}
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      {image ? (
                        <img src={image} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                          <Sparkles size={48} className="mb-4 opacity-20" />
                          <p className="text-xs font-black uppercase tracking-[0.2em]">Ready to Re-imagine</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Floating Action Buttons */}
                  <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
                    {image && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleReset(); }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all"
                      >
                        <RotateCw size={18} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); }}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition-all"
                    >
                      <Search size={18} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {step === 'loading' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-50 px-12 text-center"
                      >
                         <div className="w-20 h-20 relative mb-8">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-4 border-indigo-50 border-t-indigo-600 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="text-indigo-600 animate-pulse" size={28} />
                            </div>
                         </div>
                         <h3 className="text-3xl font-black text-slate-900 mb-3">{loadingState}</h3>
                         <p className="text-slate-500 font-medium max-w-sm">Crafting your new space with precise lighting and texture synthesis...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </div>

          {/* Design Details Section */}
          <AnimatePresence>
            {suggestion && step === 'results' && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-16 border-t border-slate-200 mt-16 space-y-16"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-2 space-y-10">
                    <div>
                      <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Sparkles size={16} /> AI Summary
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-6 text-slate-900">{suggestion.title}</h2>
                      <p className="text-slate-600 leading-relaxed text-xl font-medium">{suggestion.summary}</p>
                    </div>
                    
                    {activeTool === 'Floor Plan Generator' && (suggestion.roomCounts || floorPlanConfig.rooms) && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Object.entries(suggestion.roomCounts || floorPlanConfig.rooms).map(([room, count]) => (
                          <div key={room} className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1">
                            <span className="text-xl font-black text-slate-900">{count}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{(room as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestion.transformations.map((t, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 leading-tight">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(activeTool === 'AI Room Planner' || activeTool === 'Garden Design Generator') && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[40px] p-8 text-slate-900 shadow-xl relative overflow-hidden flex flex-col border border-slate-100">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-500/5 rounded-full blur-3xl opacity-30" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl opacity-20" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                          <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
                             <ShoppingBag size={24} className="text-green-500" />
                             {activeTool === 'Garden Design Generator' ? 'Landscape Items' : 'Curated Furniture'}
                          </h3>
                          <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                            {suggestion.furniture.length} items
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                          {suggestion.furniture.map(item => (
                            <div key={item.id} className="group p-5 rounded-3xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300">
                              <div className="flex justify-between items-start mb-3">
                                <div className="space-y-1">
                                  <p className="font-bold text-sm text-slate-900 group-hover:text-green-600 transition-colors">{item.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">{item.category}</span>
                                    <span className="text-[9px] text-slate-500 font-bold px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                                      {item.availableAt?.[0] || 'Market'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono font-black text-slate-900 text-sm">PKR {item.price.toLocaleString()}</p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed group-hover:text-slate-600 transition-colors">{item.description}</p>
                              <a 
                                href={item.purchaseLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-white hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                View Details
                                <ArrowUpRight size={12} />
                              </a>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end relative z-10">
                           <div className="flex-1">
                              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-1">Total Estimated Cost</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">PKR {suggestion.overallPrice.toLocaleString()}</span>
                                <span className={cn(
                                  "text-[10px] font-black",
                                  suggestion.overallPrice > budget ? "text-red-500" : "text-green-600"
                                )}>
                                  / Budget PKR {budget.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="mt-4 flex items-center gap-3">
                                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (suggestion.overallPrice / budget) * 100)}%` }}
                                    className={cn(
                                      "h-full transition-all rounded-full",
                                      suggestion.overallPrice > budget ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                    )}
                                  />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black tabular-nums",
                                  suggestion.overallPrice > budget ? "text-red-500" : "text-green-600"
                                )}>
                                  {Math.round((suggestion.overallPrice / budget) * 100)}%
                                </span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showFullscreen && (generatedImage || image) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8"
          >
            <div className="absolute top-8 right-8 flex items-center gap-4 z-[120]">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreen(false);
                }} 
                className="p-5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md border border-white/20"
                title="Close fullscreen"
              >
                <X size={32} />
              </button>
            </div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-7xl w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl"
            >
              <img src={(generatedImage || image) ?? undefined} className="w-full h-full object-cover" alt="Fullscreen View" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-[70] p-8 flex flex-col border-l border-slate-100"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <History className="text-slate-400" />
                  Your Projects
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                      <History size={40} className="opacity-20" />
                    </div>
                    <p className="font-bold text-slate-400">No history found</p>
                    <p className="text-xs font-medium max-w-[180px] mx-auto mt-2">Upload and redesign your first space to populate history.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="w-full text-left group overflow-hidden rounded-[28px] border border-slate-100 hover:border-slate-900 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500 transform-gpu hover:-translate-y-1"
                    >
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.suggestion.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-5">
                          <div className="text-[9px] font-black text-white/80 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-white group-hover:bg-slate-50/50 transition-colors">
                        <h3 className="font-bold text-base text-slate-900 truncate mb-1">{item.suggestion.title}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{item.config.style} • {item.config.roomType}</span>
                          <span className="text-xs font-black text-slate-400">PKR {item.suggestion?.overallPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm"
          >
            <div className="bg-white border border-slate-200 rounded-[28px] p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-500 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 text-sm font-bold leading-snug">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-slate-300 hover:text-slate-900 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
