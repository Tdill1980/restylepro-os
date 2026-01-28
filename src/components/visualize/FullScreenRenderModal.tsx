import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface RenderView {
  type: string;
  url: string;
}

interface FullScreenRenderModalProps {
  view: RenderView | null;
  onClose: () => void;
  onDownload: (url: string, fileName: string) => void;
}

const VIEW_LABELS: Record<string, string> = {
  front: 'Hero View',
  side: 'Side View',
  rear: 'Rear View',
  top: 'Top View'
};

export function FullScreenRenderModal({ view, onClose, onDownload }: FullScreenRenderModalProps) {
  if (!view) return null;

  const viewLabel = VIEW_LABELS[view.type] || view.type;

  return (
    <Dialog open={!!view} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Download button */}
          <Button
            variant="default"
            className="absolute bottom-4 right-4 z-10"
            onClick={() => onDownload(view.url, `${view.type}-render.png`)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download {viewLabel}
          </Button>

          {/* Full-screen image */}
          <img
            src={view.url}
            alt={viewLabel}
            className="w-full h-full object-contain"
          />

          {/* View label */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold">{viewLabel}</h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
