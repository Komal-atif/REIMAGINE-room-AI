export type RoomType = 'Bedroom' | 'Living Room' | 'Study' | 'Office';
export type DesignStyle = 'Modern' | 'Minimal' | 'Aesthetic' | 'Bohemian';
export type ColorPalette = 'Warm Neutrals' | 'Oceanic Blues' | 'Forest Greens' | 'Monochrome' | 'Soft Pastels' | 'Midnight Gold' | 'Sunset Terracotta' | 'Industrial Steel' | 'Desert Sand';

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
    style: DesignStyle;
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
  transformedElements: {
    element: string;
    change: string;
  }[];
  isFallback?: boolean; // Flag to indicate if overall generation had issues
}
