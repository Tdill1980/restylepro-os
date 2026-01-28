import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Sparkles } from "lucide-react";
import { SafeImage } from "./SafeImage";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Preload next image for smooth transitions
  useEffect(() => {
    if (slides.length > 1) {
      const nextIndex = (currentIndex + 1) % slides.length;
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = slides[nextIndex].image;
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [currentIndex, slides]);

  // Handle empty slides array
  if (!slides || slides.length === 0) {
    return (
      <div className="carousel-container space-y-6">
        <div className="carousel-image-wrapper bg-card/50 rounded-lg aspect-video flex flex-col items-center justify-center border border-border/50">
          <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Generate your first render!</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      <div className="carousel-container flex flex-col">
        {/* Image wrapper - no text overlay */}
        <div 
          className="carousel-image-wrapper group cursor-pointer touch-manipulation"
          onClick={() => setIsFullscreen(true)}
        >
          <SafeImage 
            key={currentSlide.id}
            src={currentSlide.image} 
            alt={currentSlide.title}
            className="carousel-image transition-opacity duration-500 ease-in-out active:scale-95 md:group-hover:scale-[1.02]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        
        {/* Text below image */}
        {(currentSlide.title || currentSlide.subtitle) && (
          <div className="mt-3 px-2 text-center">
            {currentSlide.title && (
              <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                {currentSlide.title}
              </p>
            )}
            {currentSlide.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-full w-full h-full p-0 bg-black/95 border-0">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 p-3 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors touch-manipulation"
            aria-label="Close fullscreen"
          >
            <X className="h-7 w-7 sm:h-6 sm:w-6 text-white" />
          </button>
          <div className="w-full h-full flex items-center justify-center p-4">
            <SafeImage
              src={currentSlide.image}
              alt={currentSlide.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {(currentSlide.title || currentSlide.subtitle) && (
            <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 bg-black/60 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
              <p className="text-white text-sm sm:text-base">
                {currentSlide.title && <span className="font-bold">{currentSlide.title}</span>}
                {currentSlide.subtitle && (
                  <span className="text-xs sm:text-sm opacity-90 ml-2 block sm:inline">{currentSlide.subtitle}</span>
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
