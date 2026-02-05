interface DynamicRenderSliderProps {
  intervalMs?: number;
}

export function DynamicRenderSlider({ intervalMs = 3000 }: DynamicRenderSliderProps) {
  // Static hero image - high-quality RestylePro render
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
      <img
        src="/hero-mustang.jpg"
        alt="Ford Mustang with color change wrap - RestylePro render"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
        <span className="font-sans text-xs font-semibold text-cyan-400 tracking-wide">ColorPro™</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <p className="font-sans text-white font-bold text-sm tracking-tight">Magenta Pink</p>
        <p className="font-sans text-white/70 text-xs font-medium">Ford Mustang</p>
      </div>
    </div>
  );
}
