import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface MobileZoomImageModalProps {
  imageUrl: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  showNavigation?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function MobileZoomImageModal({ 
  imageUrl, 
  title, 
  isOpen, 
  onClose,
  showNavigation = false,
  onPrev,
  onNext,
  currentIndex = 0,
  totalCount = 1
}: MobileZoomImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const [touchDistance, setTouchDistance] = useState(0);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const SWIPE_THRESHOLD = 50; // Minimum px to trigger swipe

  // Reset on open/close or image change
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen || !showNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showNavigation, onPrev, onNext]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers with swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
      setIsDragging(false);
      setSwipeStart(null);
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Pan mode when zoomed
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        });
      } else if (showNavigation && totalCount > 1) {
        // Track swipe start when not zoomed
        setSwipeStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance > 0) {
      // Pinch zoom
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      const ratio = newDistance / touchDistance;
      const newScale = Math.min(Math.max(scale * ratio, MIN_SCALE), MAX_SCALE);
      setScale(newScale);
      setTouchDistance(newDistance);

      // Reset position if zooming out to 1x
      if (newScale <= MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan when zoomed
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check for swipe gesture when not zoomed
    if (swipeStart && scale === 1 && showNavigation) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStart.x;
      const deltaY = touch.clientY - swipeStart.y;
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0 && onPrev) {
          // Swipe right -> previous image
          onPrev();
        } else if (deltaX < 0 && onNext) {
          // Swipe left -> next image
          onNext();
        }
      }
    }
    
    setIsDragging(false);
    setTouchDistance(0);
    setSwipeStart(null);
  };

  // Double tap to zoom
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      if (scale === 1) {
        setScale(2.5);
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
    setLastTap(now);
  };

  // Zoom buttons
  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.5, MAX_SCALE);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, MIN_SCALE);
    setScale(newScale);
    if (newScale <= MIN_SCALE) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Download handler
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'render'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-screen max-h-screen p-0 bg-black border-0">
        {/* Header with title, image counter, and close button */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm font-medium truncate max-w-[60%]">{title || 'Render Preview'}</div>
            <div className="flex items-center gap-3">
              {showNavigation && totalCount > 1 && (
                <div className="text-white/70 text-sm">
                  {currentIndex + 1} / {totalCount}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full bg-black/50"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Zoom percentage indicator */}
        <div className="absolute top-16 left-4 z-20 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>

        {/* Navigation arrows */}
        {showNavigation && (
          <>
            {onPrev && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full bg-black/50"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}
            {onNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full bg-black/50"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </>
        )}

        {/* Image container with touch handling */}
        <div
          ref={imageRef}
          className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <img
            src={imageUrl}
            alt={title || 'Render'}
            className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? 'grab' : 'default'
            }}
            draggable={false}
          />
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between gap-2">
          {/* Zoom controls */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= MIN_SCALE}
              className="text-white hover:bg-white/20 h-11 w-11"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= MAX_SCALE}
              className="text-white hover:bg-white/20 h-11 w-11"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
          </div>

          {/* Download button */}
          <Button
            variant="default"
            onClick={handleDownload}
            className="h-11 gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Help text */}
        <div className="absolute bottom-20 left-4 right-4 z-20 text-center">
          <p className="text-white/60 text-xs backdrop-blur-sm bg-black/40 px-3 py-2 rounded-lg inline-block">
            {showNavigation && totalCount > 1 ? 'Swipe to navigate • ' : ''}Pinch to zoom • Double tap • Drag to pan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
