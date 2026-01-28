import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioProofLayoutProps {
  designProofUrl: string;
  designName: string;
  vehicleInfo: { year: string; make: string; model: string };
  views: Array<{ type: string; url: string; label: string }>;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF?: () => void;
}

export const StudioProofLayout = ({
  designProofUrl,
  designName,
  vehicleInfo,
  views,
  isOpen,
  onClose,
  onDownloadPDF
}: StudioProofLayoutProps) => {
  const [selectedViewIndex, setSelectedViewIndex] = useState(0);
  const [fullscreenView, setFullscreenView] = useState<string | null>(null);

  if (!isOpen) return null;

  const vehicleName = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;
  const selectedView = views[selectedViewIndex];

  const handlePrevView = () => {
    setSelectedViewIndex((prev) => (prev === 0 ? views.length - 1 : prev - 1));
  };

  const handleNextView = () => {
    setSelectedViewIndex((prev) => (prev === views.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrevView();
    if (e.key === "ArrowRight") handleNextView();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto"
      style={{
        background: 'linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 60%, #3d3d3d 60%, #2a2a2a 100%)',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-neutral-900">
            ApprovePro™ Studio Proof
          </h2>
          <span className="text-sm text-neutral-500">
            {vehicleName} | {designName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onDownloadPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPDF}
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-700 hover:bg-neutral-200"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main Content - Studio Layout */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Original 2D Proof Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              Original 2D Design Proof
            </h3>
          </div>
          <div 
            className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-lg cursor-pointer group"
            onClick={() => setFullscreenView(designProofUrl)}
          >
            <img
              src={designProofUrl}
              alt="Original 2D Design Proof"
              className="w-full h-auto max-h-[400px] object-contain mx-auto"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-3 left-3 bg-cyan-500 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-white">2D PROOF</span>
            </div>
          </div>
        </section>

        {/* Divider with Arrow */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-neutral-300 shadow-sm">
            <span className="text-sm text-neutral-600">transforms to</span>
            <span className="text-lg">↓</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
        </div>

        {/* 3D Renders Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              Photorealistic 3D Renders
            </h3>
          </div>

          {/* Featured Render with Navigation */}
          <div className="relative bg-neutral-800 rounded-xl overflow-hidden border border-neutral-600 shadow-2xl">
            {/* Main Image */}
            <div 
              className="relative aspect-video cursor-pointer group"
              onClick={() => setFullscreenView(selectedView?.url)}
            >
              <img
                src={selectedView?.url}
                alt={selectedView?.label}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Maximize2 className="w-8 h-8 text-white" />
              </div>
              
              {/* View Label */}
              <div className="absolute bottom-3 left-3 bg-primary px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold text-white">{selectedView?.label}</span>
              </div>
              
              {/* View Counter */}
              <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1.5 rounded-lg">
                <span className="text-sm text-white/80">
                  {selectedViewIndex + 1} / {views.length}
                </span>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 rounded-full w-10 h-10 shadow-lg"
              onClick={(e) => { e.stopPropagation(); handlePrevView(); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 rounded-full w-10 h-10 shadow-lg"
              onClick={(e) => { e.stopPropagation(); handleNextView(); }}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {views.map((view, idx) => (
              <button
                key={view.type}
                onClick={() => setSelectedViewIndex(idx)}
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 transition-all shadow-md",
                  selectedViewIndex === idx
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-neutral-400 hover:border-neutral-300"
                )}
              >
                <img
                  src={view.url}
                  alt={view.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <span className="text-[10px] font-medium text-white truncate block">
                    {view.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* All Views Grid (Print-Ready Layout) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
              All Angles Overview
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {views.map((view, idx) => (
              <div
                key={`grid-${view.type}`}
                className="relative bg-neutral-700 rounded-lg overflow-hidden border border-neutral-500 cursor-pointer group shadow-lg"
                onClick={() => {
                  setSelectedViewIndex(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="aspect-video">
                  <img
                    src={view.url}
                    alt={view.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded">
                  <span className="text-xs font-medium text-white">{view.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center py-6 border-t border-neutral-500">
          <p className="text-xs text-neutral-300">
            Generated with ApprovePro™ by RestylePro Visualizer Suite
          </p>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {fullscreenView && (
        <div
          className="fixed inset-0 z-[60] bg-black/98 flex items-center justify-center"
          onClick={() => setFullscreenView(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={() => setFullscreenView(null)}
          >
            <X className="w-8 h-8" />
          </Button>
          <img
            src={fullscreenView}
            alt="Fullscreen view"
            className="max-w-[95vw] max-h-[95vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};
