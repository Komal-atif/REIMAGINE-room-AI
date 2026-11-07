import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Layout, 
  Flower2, 
  ArrowLeft,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AITool } from '../types';

interface SidebarProps {
  activeTool: AITool;
  onSelectTool: (tool: AITool | any) => void;
}

const TOOLS: { name: AITool | any; icon: any }[] = [
  { name: 'AI Room Cleaner', icon: Sparkles },
  { name: 'AI Room Planner', icon: Calendar },
  { name: 'Floor Plan Generator', icon: Layout },
  { name: 'Garden Design Generator', icon: Flower2 },
  { name: 'Paint Color Visualizer', icon: Palette },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  return (
    <aside className="w-64 lg:w-72 bg-white border-r border-slate-200/60 flex flex-col h-screen sticky top-0 overflow-hidden shrink-0">
      <div className="p-6 pr-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200/50">
            <Sparkles size={24} />
          </div>
          <h2 className="font-display font-bold text-xl tracking-tight text-slate-900">AI Room</h2>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.name;
          
          return (
            <button
              key={tool.name}
              onClick={() => onSelectTool(tool.name)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                isActive 
                  ? "bg-slate-100 text-slate-900 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} className={cn("shrink-0", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="text-sm tracking-tight text-left leading-tight truncate">{tool.name}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Health</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Active Node: 01</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
