export type RoomType = 'Bedroom' | 'Living Room' | 'Study' | 'Office';
export type DesignStyle = 'Modern' | 'Scandinavian' | 'Christmas' | 'Industrial' | 'Bohemian' | 'Luxury';
export type GardenType = 'Garden' | 'Frontyard' | 'Backyard';
export type GardenStyle = 'English' | 'Elegant' | 'Japanese' | 'Mediterranean';
export type ColorPalette = 'Warm Neutrals' | 'Oceanic Blues' | 'Forest Greens' | 'Monochrome' | 'Soft Pastels' | 'Midnight Gold' | 'Sunset Terracotta' | 'Industrial Steel' | 'Desert Sand';

export type AITool = 
  | 'AI Room Cleaner'
  | 'AI Room Planner'
  | 'AI Office Design Generator'
  | 'AI Room Designer'
  | 'Living Room Design'
  | 'AI Room Decorator'
  | 'Floor Plan Generator'
  | 'Garden Design Generator'
  | 'AI Landscape Design'
  | 'AI Kitchen Planner'
  | 'AI Exterior Home Design'
  | 'Paint Color Visualizer';

export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  description: string;
  purchaseLink: string;
  category: string;
  availableAt: string[];
  color: string;
}

export interface DesignHistoryItem {
  id: string;
  suggestion: DesignSuggestion;
  image: string;
  timestamp: number;
  isFallbackImage?: boolean; // Flag to indicate if Image generation failed and we fell back to original
  config: {
    roomType: RoomType;
    style: DesignStyle | GardenStyle;
    gardenType?: GardenType;
    colorPalette: ColorPalette;
    budget: number;
  };
}

export interface DesignSuggestion {
  title: string;
  summary: string;
  furniture: FurnitureItem[];
  totalBudget: number;
  overallPrice: number;
  redesignDescription: string;
  transformations: string[];
  roomCounts?: {
    Bedroom: number;
    Bathroom: number;
    Kitchen: number;
    LivingRoom: number;
    DiningRoom: number;
  };
  transformedElements: {
    element: string;
    change: string;
  }[];
  isFallback?: boolean; // Flag to indicate if overall generation had issues
}
