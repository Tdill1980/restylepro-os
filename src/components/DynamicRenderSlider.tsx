import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import heroNissanZ from '@/assets/hero-nissan-z.jpg';

interface DynamicSlide {
  imageUrl: string;
  viewType: string;
  vehicleName: string;
  colorName: string;
  manufacturer: string;
  toolBadge: string;
}

// Removed 'top' view - roof/top views not shown on homepage
const VIEW_ROTATION = ['hood_detail', 'side', 'rear', 'front', 'hero', 'passenger-side'];

const VIEW_LABELS: Record<string, string> = {
  hood_detail: 'Hood Detail',
  side: 'Side View',
  rear: 'Rear View',
  front: 'Front View',
  hero: 'Hero View',
  'passenger-side': 'Passenger Side',
};

const TOOL_BADGES: Record<string, string> = {
  colorpro: 'ColorPro™',
  inkfusion: 'ColorPro™',
  designpanelpro: 'DesignPanelPro™',
  wbty: 'PatternPro™',
  approvemode: 'ApprovePro™',
  fadewraps: 'FadeWraps™',
};

interface DynamicRenderSliderProps {
  intervalMs?: number;
}

export function DynamicRenderSlider({ intervalMs = 2500 }: DynamicRenderSliderProps) {
  // TEMPORARILY DISABLED: Always show static hero image until we have quality AI renders
  // The Gemini-generated renders have quality issues (vinyl on wheels, wrong studio, etc.)
  // Re-enable dynamic rendering once render quality is improved

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
      <img
        src={heroNissanZ}
        alt="RestylePro Visualizer Suite"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
        <span className="font-sans text-xs font-semibold text-cyan-400 tracking-wide">ColorPro™</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <p className="font-sans text-white font-bold text-sm tracking-tight">Nissan Z</p>
        <p className="font-sans text-white/70 text-xs font-medium">Premium Color Visualization</p>
      </div>
    </div>
  );
}
