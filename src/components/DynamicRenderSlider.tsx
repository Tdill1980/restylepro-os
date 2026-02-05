import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataClient } from '@/integrations/supabase/dataClient';
import { cn } from '@/lib/utils';

interface DynamicSlide {
  imageUrl: string;
  vehicleName: string;
  colorName: string;
  toolBadge: string;
  productType: string;
}

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

export function DynamicRenderSlider({ intervalMs = 3000 }: DynamicRenderSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch from Gallery carousel tables (same source as Gallery page)
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['hero-gallery-renders'],
    queryFn: async () => {
      const allSlides: DynamicSlide[] = [];

      // Fetch from InkFusion/ColorPro carousel
      const { data: inkfusionData } = await dataClient
        .from('inkfusion_carousel')
        .select('media_url, vehicle_name, color_name, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (inkfusionData) {
        allSlides.push(...inkfusionData.map(item => ({
          imageUrl: item.media_url,
          vehicleName: item.vehicle_name || '',
          colorName: item.color_name || item.title || '',
          toolBadge: TOOL_BADGES['colorpro'],
          productType: 'colorpro',
        })));
      }

      // Fetch from WBTY/PatternPro carousel
      const { data: wbtyData } = await dataClient
        .from('wbty_carousel')
        .select('media_url, vehicle_name, pattern_name, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (wbtyData) {
        allSlides.push(...wbtyData.map(item => ({
          imageUrl: item.media_url,
          vehicleName: item.vehicle_name || '',
          colorName: item.pattern_name || item.title || '',
          toolBadge: TOOL_BADGES['wbty'],
          productType: 'wbty',
        })));
      }

      // Fetch from ApproveMode carousel
      const { data: approvemodeData } = await dataClient
        .from('approvemode_carousel')
        .select('media_url, vehicle_name, color_name, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (approvemodeData) {
        allSlides.push(...approvemodeData.map(item => ({
          imageUrl: item.media_url,
          vehicleName: item.vehicle_name || '',
          colorName: item.color_name || item.title || '',
          toolBadge: TOOL_BADGES['approvemode'],
          productType: 'approvemode',
        })));
      }

      // Fetch from FadeWraps carousel
      const { data: fadewrapsData } = await dataClient
        .from('fadewraps_carousel')
        .select('media_url, vehicle_name, pattern_name, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(2);

      if (fadewrapsData) {
        allSlides.push(...fadewrapsData.map(item => ({
          imageUrl: item.media_url,
          vehicleName: item.vehicle_name || '',
          colorName: item.pattern_name || item.title || '',
          toolBadge: TOOL_BADGES['fadewraps'],
          productType: 'fadewraps',
        })));
      }

      // Fetch from DesignPanelPro carousel
      const { data: designpanelproData } = await dataClient
        .from('designpanelpro_carousel')
        .select('media_url, vehicle_name, pattern_name, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(2);

      if (designpanelproData) {
        allSlides.push(...designpanelproData.map(item => ({
          imageUrl: item.media_url,
          vehicleName: item.vehicle_name || '',
          colorName: item.pattern_name || item.title || '',
          toolBadge: TOOL_BADGES['designpanelpro'],
          productType: 'designpanelpro',
        })));
      }

      // Filter out any slides without valid image URLs
      const validSlides = allSlides.filter(s => s.imageUrl && s.imageUrl.length > 0);

      console.log('Hero slider loaded', validSlides.length, 'gallery renders');
      return validSlides;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-cyan-400/50 text-sm">Loading gallery...</div>
      </div>
    );
  }

  // No slides - show gradient placeholder with message
  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-white mb-2">AI-Powered Visualization</h3>
          <p className="text-cyan-300/70 text-sm max-w-xs">See your vehicle in any color, finish, or pattern before you wrap</p>
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

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
        <p className="font-sans text-white font-bold text-base sm:text-lg truncate tracking-tight">
          {currentSlide.colorName}
        </p>
        {currentSlide.vehicleName && (
          <p className="font-sans text-white/70 text-xs sm:text-sm font-medium truncate">
            {currentSlide.vehicleName}
          </p>
        )}
      </div>

      {/* Progress Dots */}
      {slides.length > 1 && (
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
      )}
    </div>
  );
}
