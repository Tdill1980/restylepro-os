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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['dynamic-hero-renders'],
    queryFn: async () => {
      // Fetch featured renders first (priority placement)
      const { data: featuredData, error: featuredError } = await supabase
        .from('color_visualizations')
        .select('*')
        .eq('is_featured_hero', true)
        .order('created_at', { ascending: false });

      if (featuredError) {
        console.error('DynamicRenderSlider featured query error:', featuredError);
      }

      // Get IDs of featured renders to exclude from recent query
      const featuredIds = (featuredData || []).map(r => r.id);
      
      // Fetch recent renders (excluding featured ones to avoid duplicates)
      let recentData: typeof featuredData = [];
      if (featuredIds.length > 0) {
        const { data, error } = await supabase
          .from('color_visualizations')
          .select('*')
          .not('id', 'in', `(${featuredIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) {
          console.error('DynamicRenderSlider recent query error:', error);
        }
        recentData = data || [];
      } else {
        const { data, error } = await supabase
          .from('color_visualizations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) {
          console.error('DynamicRenderSlider recent query error:', error);
        }
        recentData = data || [];
      }

      // Combine: featured first, then recent
      const data = [...(featuredData || []), ...recentData];

      if (data.length === 0) return [];

      const transformedSlides: DynamicSlide[] = [];
      const usedVehicles = new Set<string>();
      
      // Filter for renders with meaningful color names first
      const sortedData = [...data].sort((a, b) => {
        const aHasGoodName = a.color_name && !['Custom', 'Custom Design', '(1)', ''].includes(a.color_name);
        const bHasGoodName = b.color_name && !['Custom', 'Custom Design', '(1)', ''].includes(b.color_name);
        if (aHasGoodName && !bHasGoodName) return -1;
        if (!aHasGoodName && bHasGoodName) return 1;
        return 0;
      });

      sortedData.forEach((render, index) => {
        const renderUrls = render.render_urls as Record<string, string> | null;
        if (!renderUrls || Object.keys(renderUrls).length === 0) return;

        // Create unique key for this vehicle + color combination (allow same vehicle with different colors)
        const vehicleKey = `${render.vehicle_make}-${render.vehicle_model}-${render.color_name}`.toLowerCase();
        
        // Skip if we've already shown this exact vehicle + color combo
        if (usedVehicles.has(vehicleKey)) return;
        usedVehicles.add(vehicleKey);

        // Get view based on rotation to ensure variety (NEVER show top/roof views on homepage)
        const viewKey = VIEW_ROTATION[transformedSlides.length % VIEW_ROTATION.length];
        const availableViews = Object.keys(renderUrls).filter((k) => k !== 'top' && k !== 'roof');

        // If the only thing we have is a top/roof view, skip this render entirely
        if (availableViews.length === 0) return;

        // Use rotation view if available, otherwise pick first available non-top view
        const selectedView = availableViews.includes(viewKey) ? viewKey : availableViews[0];

        const imageUrl = renderUrls[selectedView];
        if (!imageUrl) return;
        
        // Build display name - prioritize showing manufacturer/color info
        let displayColorName = render.color_name || 'Custom Design';
        if (['Custom', 'Custom Design', '(1)', ''].includes(displayColorName)) {
          // For patterns/designs, use mode type as context
          const modeType = render.mode_type?.toLowerCase() || 'colorpro';
          if (modeType === 'designpanelpro') {
            displayColorName = 'Custom Panel Design';
          } else if (modeType === 'wbty') {
            displayColorName = 'Custom Pattern';
          } else if (modeType === 'approvemode') {
            displayColorName = 'Client Approval Proof';
          } else if (modeType === 'fadewraps') {
            displayColorName = 'FadeWrap Gradient';
          } else {
            displayColorName = 'Custom Color';
          }
        }

        // Build vehicle name - filter out nulls/undefined
        const vehicleParts = [render.vehicle_year, render.vehicle_make, render.vehicle_model].filter(Boolean);
        const vehicleDisplay = vehicleParts.length > 0 ? vehicleParts.join(' ') : '';

        // Extract manufacturer from infusion_color_id (stored there as workaround for missing column)
        const manufacturer = render.infusion_color_id || '';

        transformedSlides.push({
          imageUrl,
          viewType: VIEW_LABELS[selectedView] || '',
          vehicleName: vehicleDisplay,
          colorName: displayColorName,
          manufacturer,
          toolBadge: TOOL_BADGES[render.mode_type?.toLowerCase() || 'colorpro'] || 'ColorPro™',
        });
      });

      console.log('DynamicRenderSlider loaded slides:', transformedSlides.length);
      return transformedSlides;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 300);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, intervalMs);
    return () => clearInterval(interval);
  }, [slides.length, intervalMs, nextSlide]);

  // Preload next image
  useEffect(() => {
    if (slides.length <= 1) return;
    const nextIndex = (currentIndex + 1) % slides.length;
    const img = new Image();
    img.src = slides[nextIndex]?.imageUrl || '';
  }, [currentIndex, slides]);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-card/50 rounded-2xl animate-pulse" />
    );
  }

  if (error) {
    console.error('DynamicRenderSlider error:', error);
  }

  if (slides.length === 0) {
    // Fallback to static hero image
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

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
      {/* Main Image */}
      <img
        src={currentSlide.imageUrl}
        alt={`${currentSlide.vehicleName} - ${currentSlide.colorName}`}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Tool Badge - Top Left */}
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
        <span className="font-sans text-xs font-semibold text-cyan-400 tracking-wide">
          {currentSlide.toolBadge}
        </span>
      </div>

      {/* Bottom Info Overlay - Shows Manufacturer + Color/Design Name + Vehicle */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <p className="font-sans text-white font-bold text-base sm:text-lg truncate tracking-tight">
          {currentSlide.manufacturer && currentSlide.manufacturer !== 'InkFusion'
            ? `${currentSlide.manufacturer} ${currentSlide.colorName}`
            : currentSlide.colorName && currentSlide.colorName !== 'Custom' && currentSlide.colorName !== 'Custom Design' && currentSlide.colorName !== '(1)'
              ? currentSlide.colorName 
              : currentSlide.toolBadge + ' Design'}
        </p>
        {currentSlide.vehicleName && (
          <p className="font-sans text-white/70 text-xs sm:text-sm font-medium truncate">
            {currentSlide.vehicleName}
          </p>
        )}
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.slice(0, 10).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              idx === currentIndex % 10
                ? "bg-cyan-400 w-4"
                : "bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
